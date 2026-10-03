# API Integration  CodeArena Frontend

How this frontend talks to the CodeArena backend: the single choke point, every endpoint it uses, and  most importantly  **the places where the backend's real behaviour differs from what its shape suggests.** Those mismatches shaped the code and are the first thing to check when a page misbehaves.

- **Base URL:** `NEXT_PUBLIC_API_URL` + `/api/v1` (appended in code)
- **Auth:** HTTP-only bearer cookie + refresh rotation
- **Rate limit:** 100 requests / 15 minutes per IP
- **Backend reference:** `../backend/API Documentation/CODEARENA_API.md`

---

## 1. The choke point

Every request goes through `src/lib/api.ts`. Nothing else imports `fetch` for API traffic.

```ts
// src/lib/api.ts
import "server-only";      // compile-time guard: this can never be bundled
                           // into a client component
```

`server-only` is the enforcement mechanism for architecture rule 2. If a client component ever reaches this module the build fails  which is exactly what you want, because the bearer token lives in an httpOnly cookie the browser cannot read.

### Envelope

Every read resolves to the same shape, **including non-2xx responses**:

```ts
interface ApiResponse<T> {
  success: boolean;
  statusCode: number;
  message: string;
  data: T | null;
  errors?: Record<string, string[]> | null;
}
```

Only `UnauthenticatedError` throws. A `404` or `429` resolves, so the UI can render the backend's own `message` instead of a generic failure string.

### Response shape gotcha

Paginated endpoints return the payload **inside `data`**:

```ts
const res = await invitationService.listForCandidate();
// res.data is { items: [...], meta: { page, limit, total, totalPages } }
// NOT a bare array  and NOT res.items
```

### Session recovery

On a `401`, `api()` calls `POST /auth/refresh-token`, persists the rotated pair to the cookie, and retries the original request **once**. If it cannot persist the rotation (an RSC render cannot always set cookies) or the retry fails, it throws `UnauthenticatedError`; `proxy.ts` converts that into a redirect.

### `retry: 0` is mandatory

`ofetch` retries once on its own for `GET`/`HEAD` against `408`/`429`/`5xx`. That silently doubles traffic against a rate-limited API and turns a transient `429` into a doubled one. The option is set explicitly for this reason.

---

## 2. Endpoints

### Auth  `service/auth.ts`

| Method | Path | Notes |
|---|---|---|
| `POST` | `/auth/register` | **Returns no tokens**  registration is followed by a login |
| `POST` | `/auth/login` | **Returns no user object**; the UI calls `/auth/me` next |
| `POST` | `/auth/google` | Takes `{ idToken, role? }`  `role` is `CANDIDATE`/`RECRUITER` and is only needed on first sign-in |
| `POST` | `/auth/refresh-token` | Rotates the pair; called internally by `api()` |
| `GET` | `/auth/me` | Current user; the app's only identity source |
| `GET` / `PATCH` | `/users/me` | Profile read and update |

### Company  `service/company.ts`

| Method | Path | Roles |
|---|---|---|
| `GET` | `/companies/me` | `RECRUITER`, `ADMIN` |
| `PUT` | `/companies/me` | `RECRUITER` |
| `GET` | `/companies/me/dashboard` | `RECRUITER` |

**`PUT /companies/me` treats an explicit `null` as "clear this column"** (verified live). Omitting a blank optional field would make a website or logo impossible to remove, so the form always sends all three.

### Questions  `service/questions.ts`

| Method | Path | Roles |
|---|---|---|
| `GET` | `/questions` | `RECRUITER`  `?q=&type=&difficulty=&page=&limit=` |
| `POST` | `/questions` | `RECRUITER` |
| `PATCH` | `/questions/:id` | `RECRUITER`  edits, or `{ deletedAt: "now" }` to soft delete |

`limit` is **capped at 100**; `?limit=101` is a `400`, not a silent clamp.

`ADMIN` is **not** in the question routes' role list, so the admin UI has no question bank to read.

### Assessments  `service/assessments.ts`

| Method | Path | Notes |
|---|---|---|
| `GET` / `POST` | `/assessments` | `?status=&sortBy=&sortOrder=&page=&limit=` |
| `GET` | `/assessments/:id` | Detail + stats |
| `PATCH` | `/assessments/:id` | **Four overloaded variants**  see §3.4 |
| `PATCH` | `/assessments/:id` | `{ deletedAt: "now" }`  soft delete |
| `GET` | `/assessments/:id/results` | The only per-candidate roster |
| `POST` | `/assessments/:id/invitations` | Send invitations |
| `GET` | `/assessments/:id/invitations` | **`404`  does not exist** |

There is **no `DELETE` verb anywhere in this API.** Every removal is a `PATCH { deletedAt: "now" }`, so "delete" and "archive" are the same call and a soft-deleted row cannot be hard-deleted from the client.

There is **no create-with-questions endpoint.** Building an assessment is three ordered calls: `POST /assessments` → `PATCH {questionIds}` → `PATCH {status}`. `wizardCreateAssessmentAction` performs all three and, on partial failure, **deliberately keeps the draft** so the user resumes from the detail page.

### Invitations  `service/invitations.ts`

| Method | Path | Notes |
|---|---|---|
| `GET` | `/invitations/me` | **The only candidate-scoped read in the API** |
| `PATCH` | `/invitations/:id` | Accept / Decline only |

### Attempts  `service/attempts.ts`

| Method | Path | Notes |
|---|---|---|
| `POST` | `/invitations/:id/start` | Not idempotent  see §3.2 |
| `GET` | `/attempts/:id` | Returns the **full** assessment, `correctAnswer` included |
| `PATCH` | `/attempts/:id` | Save answers, or `{status:"SUBMITTED"}` |
| `POST` | `/attempts/:id/evaluate` | Recruiter grading |

### Payments  `service/payments.ts`

| Method | Path | Roles |
|---|---|---|
| `POST` | `/payments/initiate` | `RECRUITER` |
| `GET` | `/payments` | `RECRUITER` |
| `GET` | `/payments/:id` | `RECRUITER`, `ADMIN` |

### Admin  `service/admin.ts`

| Method | Path | Notes |
|---|---|---|
| `GET` | `/admin/users` | `?q=&role=&status=&page=&limit=` |
| `PATCH` | `/admin/users/:id` | Suspend / restore |
| `GET` | `/admin/stats` | |
| `GET` | `/admin/audit-logs` | `?entity=&action=&page=&limit=` |

**There is no `DELETE /admin/users/:id`.** Soft-delete is not wired because the endpoint does not exist.

---

## 3. Known mismatches

These are the behaviours that contradict what the API's shape implies. Each one cost real debugging time.

### 3.1 MCQ answers are option **text**, not an index

`GET /attempts/:id` exposes `question.correctAnswer` as a `Prisma.Json`. The backend auto-grades with:

```ts
JSON.stringify(response) === JSON.stringify(correctAnswer)
```

So the submitted `response` must be the **option text**, byte-identical:

```
✓  response = "200 OK"        →  full marks
✗  response = 2               →  0 marks
```

Proven end to end: a 3-question attempt scored **3/3** this way, including through `POST /attempts/:id/evaluate`.

### 3.2 `POST /invitations/:id/start` is not idempotent  **and it writes**

Two calls return `400`, and the first is a **side effect**:

```ts
// backend/src/modules/invitation/invitation.service.ts:218-222
if (invitation.expiresAt < new Date()) {
  await prisma.invitation.update({
    where: { id: invitationId },
    data: { status: "EXPIRED" },
  });
  throw new AppError(httpStatus.BAD_REQUEST, "This invitation has expired");
}
```

It persists `status: "EXPIRED"` **before** throwing. Never probe this endpoint on a row you care about, and never treat its `400` as a pure read.

A second call returns `400 "An attempt already exists for this invitation"`  there is no idempotency key, so resume is a **link**, not a repeat call.

### 3.3 `PATCH /attempts/:id` refuses every body once submitted

```
400 "Cannot update an attempt with status SUBMITTED"
```

This check runs **before** the empty-answers validation, so it fires even for `{answers: []}`. `status` must be exactly `"SUBMITTED"`  any other value is `400 "status: Invalid input: expected SUBMITTED"`.

### 3.4 `PATCH /assessments/:id` is four endpoints wearing one path

| Body | Effect |
|---|---|
| `{ status }` | Lifecycle transition |
| `{ questionIds }` | Replaces the attached questions |
| `{ title, description, … }` | Field updates |
| `{ title, …, questionIds }` | Both at once |

Only the **immediate lifecycle successor** is accepted (`DRAFT → PUBLISHED → CLOSED → ARCHIVED`; `ARCHIVED` is terminal). Publishing a question-less draft is refused with *"Add at least one question before publishing"*. Any status control derives its target from `ASSESSMENT_NEXT_STATUS` rather than offering a free choice.

### 3.5 Evaluate accepts only what it can score

`POST /attempts/:id/evaluate` takes `{ scores[], releaseResult }` with **`scores` min length 1**, so an MCQ-only attempt cannot be evaluated. Each score needs an `answerId`, which an **unanswered** written/coding question does not have  the grading workspace keeps those out of the payload and scores them zero rather than failing the whole call.

`releaseResult` is **one-shot**: a result not released at save time can never be published later.

### 3.6 `passScore` is never evaluated by the backend

It is stored on create/update and read by nothing in `assessment.service.ts`. There is **no server-side pass/fail verdict to fetch**.

- It is in **points**, not percent.
- The candidate result page therefore compares `score >= passScore` itself, and **discloses in the copy** that it is doing so.
- When `passScore > maxScore`  the seeded state is `70` on a 3-point assessment  it renders *"The pass mark cannot be reached"* rather than a bare failure.

### 3.7 The candidate has no results endpoint

`GET /assessments/:id/results` returns **`403`** for `CANDIDATE`, and there is no "my attempts" route. So every candidate page derives from `GET /invitations/me`, and a score needs one `GET /attempts/:id` per row.

`/invitations/me` carries `{ id, status, deadline, resultReleased }` per attempt  **no score, no timestamps**  so the results page hydrates **only the rows on the current page**. Hydrating a full history would spend `1 + N` requests on one page view and breach the rate limit after a handful of pages.

### 3.8 `GET /attempts/:id` leaks the answer key

It returns every `question.correctAnswer` to the candidate. The payload cannot be changed from the frontend, so the discipline is a **rendering** rule: `ResultReview` takes `released` as a prop and its locked branch never reads that field. Nothing enforces this but review.

### 3.9 403 is unreachable by design

`proxy.ts` and `requireRole()` both redirect a wrong-role visitor to their own `ROLE_HOME` **before any fetch**, so a full-page 403 view would be dead code. The exception is a *resource-level* denial  e.g. a recruiter with no company row, which returns `404`/`403` from the company endpoints after the role gate passed. That renders as an in-page empty state with a CTA.

A **suspended** account gets `403` from `POST /auth/login`, not `401`, so it must not be treated as an expired session.

### 3.10 Payments are recruiter-only

`POST /payments/initiate` and `GET /payments` are `RECRUITER`; `GET /payments/:id` is `RECRUITER`/`ADMIN`. `CANDIDATE` appears in none, and `creditsRemaining` lives on `Company`, which a candidate does not have. There is therefore **no** candidate payment or credit view to build.

---

## 4. Error handling

Non-2xx responses resolve to the envelope so the UI can be specific:

| Status | Where it surfaces |
|---|---|
| `400` | Inline field errors from `errors`, or `ErrorState` with `message` |
| `401` | Handled internally  refresh + retry, else redirect |
| `403` | Suspended-account notice, or an in-page empty state for resource denials |
| `404` | "That attempt does not exist" style empty states |
| `429` | `ErrorState` carrying the backend's own rate-limit message |

Forms surface `result.errors` per field. `window.alert` and blocking dialogs are never used for feedback.

---

## 5. Verification notes

Findings above were established against a **running** backend, not inferred from types. Reproduce them before changing any of the code described here:

```bash
# Registration returns no tokens
curl -s -X POST http://localhost:5000/api/v1/auth/register \
  -H 'content-type: application/json' \
  -d '{"name":"Test","email":"t@example.com","password":"secret1","role":"CANDIDATE"}'

# limit is capped at 100
curl -s -H "Authorization: Bearer $TOKEN" \
  "http://localhost:5000/api/v1/questions?limit=101"

# candidates cannot read assessment results
curl -s -H "Authorization: Bearer $CANDIDATE_TOKEN" \
  "http://localhost:5000/api/v1/assessments/$ID/results"
```

**Do not** probe `POST /invitations/:id/start` against a row you care about  see §3.2.

The 100 requests / 15 minutes ceiling is easy to hit while verifying. A `429` during testing is a rate limit, not an application bug; `RateLimit-Reset` in the response headers says how long to wait.