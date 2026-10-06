<div align="center">

# 🔌 API Integration

**CodeArena Frontend ↔ CodeArena Backend**

</div>

How this frontend talks to the backend: the single choke point, every endpoint that
exists, exactly which ones this app calls, and the places where the backend's **real**
behaviour differs from what its shape suggests. Those mismatches shaped the code and
are the first thing to check when a page misbehaves.

<div align="center">

| 🌐 Base URL | 🔑 Auth | 🚦 Rate limit | 📚 Backend |
|:---|:---|:---|:---|
| `NEXT_PUBLIC_API_URL` + `/api/v1` | httpOnly bearer cookie + refresh rotation | **100 req / 15 min** per IP | Express 5 · Prisma 7 · PostgreSQL · Stripe |

</div>

> 📖 **Verified against** `../backend/src/**` (routes, validations, services) and
> `../backend/API Documentation/CODEARENA_API.md`.

---

## 1️⃣ The choke point

> 🚨 Every request goes through `src/lib/api.ts`. Nothing else calls `fetch` for API traffic.

```ts
// src/lib/api.ts:1
import "server-only";   // compile-time guard: this can never be bundled
                        // into a client component
```

`server-only` is the enforcement mechanism for the "no browser API calls" rule. If a
client component ever reaches this module the build fails, which is exactly what you
want, because the bearer token lives in an httpOnly cookie the browser cannot read.

### 📦 The envelope

Every call resolves to the same shape, **including non-2xx responses**:

```ts
interface ApiResponse<T> {
  success: boolean;
  statusCode: number;   // synthesised from the HTTP status, see below
  message: string;      // the backend's own text, never replaced
  data: T | null;
  errors?: string[];    // flat list of strings, NOT keyed by field
}
```

> ⚠️ **Three things about this envelope are easy to get wrong.**

**1. `statusCode` is not in the response body.**
The backend sends `{ success, message, data }` on success and `{ success, message, errors }`
on failure. No status code in either. `api()` derives `statusCode` from the HTTP status so
the rest of the app has something to branch on.

**2. `errors` is a flat `string[]`, not `Record<string, string[]>`.**
Validation failures come back as *prose* (`"email: Invalid email address"`), because the
backend's `formatZodError` collapses a Zod issue into `"<path>: <first message>"`.
Per-field mapping happens on the frontend, not the wire. `fieldErrorsFrom()` in each
`_actions/` module turns those strings into `Record<string, string[]>` using the same Zod schema.

**3. Only the *first* Zod issue survives.**
`formatZodError` reports `err.issues[0]` only. A form that could produce four field errors
at once will be told about one, be re-rendered, and then find the next. Validate on the
client first so the user is not walked through this one field at a time.

> 🧠 **A `200` does not mean the call worked.** Failed API calls resolve with
> `success: false` and render an error state on a `200` page.

### 🧷 Response shape gotcha

Paginated endpoints return the payload **inside `data`**:

```ts
const res = await invitationService.listForCandidate();
// res.data is { items: [...], meta: { page, limit, total, totalPages } }
// NOT a bare array, and NOT res.items
```

> ⚠️ Three endpoints are **not** paginated and return something else:

| Endpoint | `data` is |
|---|---|
| `POST /assessments/:id/invitations` | `InvitationWithCandidate[]`, a bare array. **Not** `{ items }` |
| `GET /companies/me/dashboard` | a plain object, no `meta` |
| `GET /admin/stats` | a plain object, no `meta` |

### 🔄 Session recovery

On a `401`, `api()` calls `POST /auth/refresh-token`, persists the rotated pair to the
cookie, and retries the original request **once**. If the rotation cannot be persisted
(an RSC render cannot always set cookies) or the retry fails, it throws `UnauthenticatedError`.

The retry is gated on the **message**, not the status:

```ts
// src/lib/api.ts:248
if (result.statusCode !== 401 || !isUnauthenticatedMessage(result.message)) return result;
```

> 🚨 That matters because the backend returns `401` for three unrelated reasons
> (*"Access token is required. Please login again."*, *"Invalid or expired access token."*,
> *"User not found."*), and a **suspended** account gets `403`, never `401`. Treating every
> `401` as an expired session would rotate the refresh token on a request that was never
> authenticated in the first place.

### 0️⃣ Why `retry: 0` is mandatory

`ofetch` retries once on its own for `GET`/`HEAD` against `408`/`429`/`5xx`. That silently
doubles traffic against a rate-limited API and turns a transient `429` into a doubled one.
The option is pinned explicitly for this reason.

### 🩺 Circuit breaker and the health route

`api()` keeps a small circuit breaker in module scope. Three consecutive failures opens it
for 30 seconds, during which every call resolves immediately with a synthetic `503` instead
of hammering a backend that is down.

`GET /api/health` (a Next.js route handler at `src/app/api/health/route.ts`) exposes it:

| Field | Meaning |
|---|---|
| `healthy` | breaker currently closed |
| `failures` | consecutive failure count |
| `resetAt` | epoch ms when the breaker closes again |
| `apiBase` | the resolved `${NEXT_PUBLIC_API_URL}/api/v1` |
| `siteUrl` | `NEXT_PUBLIC_SITE_URL`, or `(unset)` |
| `probe` | result of a live `GET <base>/` against the backend |

`POST /api/health` resets the breaker. The live probe deliberately hits the backend **root**,
not `/api/v1`, because the root route is registered before the rate limiter and does not
consume the 100-request budget.

### 🍪 Cookies

The backend sets `accessToken` / `refreshToken` as cookies on **its own** origin. A browser
on a different port or domain can never read those, so the login actions copy the token pair
out of the JSON response body and write their own httpOnly cookies here:

```ts
// src/app/(authentication)/_actions/auth.ts:61
await setAuthCookies({ accessToken, refreshToken });
```

`setAuthCookies` uses `sameSite: "lax"` and `secure` in production. The backend sets
`sameSite: "none"` with `secure: false`, which browsers reject. The frontend's own cookies
are therefore the only ones that actually work, and they are also what `api()` reads.

---

## 2️⃣ Base URL, CORS and rate limits

### 🚦 CORS allow-list

The backend allows only these origins (`backend/src/app.ts:32`):

```
APP_URL, FRONTEND_URL, CLIENT_URL
```

> ⚠️ An origin outside that list is **not** a `403`. It throws inside the `cors` callback
> and surfaces as a generic `500 "Something went wrong"`. When every request fails with a
> 500 and no useful body, check the origin allow-list first.

`APP_URL`, `FRONTEND_URL` and `CANCEL_URL` are what the backend builds the Stripe
`success_url` / `cancel_url` from, so they must point at this app's origin for checkout to
return here.

### 🚦 Rate limits

| Scope | Limit | Notes |
|---|---|---|
| All of `/api/v1` | **100 requests / 15 min / IP** | `RateLimit-Limit`, `RateLimit-Remaining`, `RateLimit-Reset` headers |
| `POST /auth/forgot-password`, `POST /auth/reset-password` | **5 requests / 15 min / IP** | separate limiter, tighter budget |
| `POST /api/v1/payments/webhook` | exempt | registered before the limiter *and* in its `skip` list |
| `GET /` | not limited | registered before the limiter; used by the health probe |

> ⚠️ A `429` body is **not** the envelope. `express-rate-limit` answers with the plain text
> `"Too many requests, please try again later."`, so `message` falls back to that. Read
> `RateLimit-Reset` for how long to wait.

> 🧠 **Design consequence:** every list view is deliberately shallow. The candidate results
> page hydrates only the rows on the current page (§4.7), so a render costs
> `1 + PAGE_SIZE` requests no matter how long the history grows. Debounce searches
> (400 ms), batch reads, and never poll.

---

## 3️⃣ Endpoint inventory

> 📊 **36 routes under `/api/v1`** (35 in routers + 1 Stripe webhook), plus an unversioned
> `GET /` liveness route. **This app calls 33 of them.**

### 🔐 Auth : `service/auth.ts`, `service/logout.ts`

| Method | Path | Backend roles | Used | Notes |
|---|---|---|:-:|---|
| `POST` | `/auth/register` | public | ✅ | **Returns no tokens.** Registration is followed by a login |
| `POST` | `/auth/login` | public | ✅ | **Returns no user object.** The action calls `/auth/me` next |
| `POST` | `/auth/google` | public | ✅ | Takes `{ idToken, role? }`. `role` is `CANDIDATE`/`RECRUITER`, needed on first sign-in only |
| `POST` | `/auth/refresh-token` | public | ⚙️ | Called internally by `api()` on a `401`, never directly |
| `POST` | `/auth/forgot-password` | public | ✅ | `{ email }`. Always `200`, never enumerates whether the account exists |
| `POST` | `/auth/reset-password` | public | ✅ | `{ token, password }`. Revokes **every** live refresh token for the user |
| `POST` | `/auth/logout` | any role | ❌ | **Exists but is not called.** See §5.1 |
| `GET` | `/auth/me` | any role | ✅ | The app's only identity source |

> ⚠️ `POST /auth/register` rejects `role: "ADMIN"` at the Zod enum, before any handler code.
> There is a dead branch in the controller that would return *"Admin accounts cannot be
> self-registered…"*. It can never be reached.

### 👤 Users : `service/auth.ts`

| Method | Path | Backend roles | Used | Notes |
|---|---|---|:-:|---|
| `GET` | `/users/me` | any role | ❌ | Byte-identical to `GET /auth/me`. One read, one owner. See §5.2 |
| `PATCH` | `/users/me` | any role | ✅ | `phone`, `bio`, `skills`, `resumeUrl`, `githubUrl` are **`CANDIDATE`-only** and are silently dropped for other roles |

### 🏢 Company : `service/company.ts`

| Method | Path | Backend roles | Used | Notes |
|---|---|---|:-:|---|
| `GET` | `/companies/me` | `RECRUITER`, `ADMIN` | ✅ | `404` when the caller has no `CompanyMembership`, **including an admin** |
| `PUT` | `/companies/me` | `RECRUITER` | ✅ | Upsert. **Treats an explicit `null` as "clear this column"** |
| `GET` | `/companies/me/dashboard` | `RECRUITER` | ✅ | Carries every count **except** the question-bank size |

> ⚠️ `PUT /companies/me` omitting a blank optional field would make a website or logo
> impossible to remove, so the company form always sends all three (name, website, logoUrl).

> 🧠 `GET /companies/me/dashboard` returns `averageScore: null` (not `0`) when there are no
> evaluated attempts, and its `*ByStatus` objects contain **only the statuses that actually
> occur** (`{}` when none). Both are typed as nullable/partial rather than defaulted.

### ❓ Questions : `service/questions.ts`

| Method | Path | Backend roles | Used | Notes |
|---|---|---|:-:|---|
| `GET` | `/questions` | `RECRUITER` | ✅ | `?q=&type=&difficulty=&page=&limit=` |
| `POST` | `/questions` | `RECRUITER` | ✅ | `companyId` is derived server-side, any value in the body is stripped |
| `PATCH` | `/questions/:id` | `RECRUITER` | ✅ | Field updates, or `{ deletedAt: "now" }` to soft delete |

- 📏 `limit` is **capped at 100**. `?limit=101` is a `400`, not a silent clamp.
  `PICKER_LIMIT = 100` in the wizard is the single source of truth.
- 🔍 `q` matches case-insensitively against **title or body**.
- 🚫 `ADMIN` is **not** in this router's role list, so the admin UI has no question bank to read.
- ✂️ `PATCH` checks `deletedAt` first and **ignores every other field** in the same body.
- 🔒 Ownership is checked with `findFirst({ id, companyId })`, so another company's question
  returns a non-leaky `404`, not a `403`.

### 📝 Assessments : `service/assessments.ts`

| Method | Path | Backend roles | Used | Notes |
|---|---|---|:-:|---|
| `GET` | `/assessments` | `RECRUITER` | ✅ | `?status=&sortBy=&sortOrder=&page=&limit=`. **No free-text `q`** |
| `POST` | `/assessments` | `RECRUITER` | ✅ | Always creates `DRAFT`. Response has **no** `_count` |
| `GET` | `/assessments/:id` | `RECRUITER` | ✅ | Detail + `questions[]` + `_count` + `stats` |
| `PATCH` | `/assessments/:id` | `RECRUITER` | ✅ | **Four overloaded variants.** See §4.4 |
| `GET` | `/assessments/:id/results` | `RECRUITER` | ✅ | The only per-candidate roster. Lives in `attempt.route.ts`, not `assessment.route.ts` |
| `POST` | `/assessments/:id/invitations` | `RECRUITER` | ✅ | Returns a **bare array**. Emails are de-duplicated and lower-cased |
| `GET` | `/assessments/:id/invitations` | :dash: | ❌ | **Route does not exist** (`404`). The roster comes from `/results` instead |

> 🚫 **There is no `DELETE` verb anywhere in this API.** Every removal is a
> `PATCH { deletedAt: "now" }`, so "delete" and "archive" are the same call, and a
> soft-deleted row cannot be hard-deleted from the client.

> 🧠 **There is no create-with-questions endpoint.** Building an assessment is three ordered
> calls: `POST /assessments` → `PATCH { questionIds }` → `PATCH { status }`.
> `wizardCreateAssessmentAction` performs all three and, on partial failure, **deliberately
> keeps the draft** so the user resumes from the detail page.

### 📨 Invitations : `service/invitations.ts`

| Method | Path | Backend roles | Used | Notes |
|---|---|---|:-:|---|
| `GET` | `/invitations/me` | `CANDIDATE` | ✅ | **The only candidate-scoped read in the API** |
| `PATCH` | `/invitations/:id` | `CANDIDATE`, `RECRUITER` | ✅ | Accept / Decline only, and a recruiter's body is **overridden** (§4.11) |

> 🧠 `GET /invitations/me` is mounted at `/api/v1`, not under an `/invitations` router, and
> carries `{ id, status, deadline, resultReleased }` per attempt. **No score, no timestamps** (§4.7).

### ⏱️ Attempts : `service/attempts.ts`

| Method | Path | Backend roles | Used | Notes |
|---|---|---|:-:|---|
| `POST` | `/invitations/:id/start` | `CANDIDATE` | ✅ | Not idempotent, and it writes. See §4.2 |
| `GET` | `/attempts/:id` | `CANDIDATE`, `RECRUITER` | ✅ | Full assessment incl. `correctAnswer`. **Expired attempts are mutated by this GET** (§4.5) |
| `PATCH` | `/attempts/:id` | `CANDIDATE` | ✅ | Save answers, or `{ status: "SUBMITTED" }` |
| `POST` | `/attempts/:id/evaluate` | `RECRUITER` | ✅ | Manual scoring + `releaseResult` |

> 🚫 `ADMIN` appears in **none** of the attempt routes. There is no admin-side view of a submission.

### 💳 Payments : `service/payments.ts`

| Method | Path | Backend roles | Used | Notes |
|---|---|---|:-:|---|
| `POST` | `/payments/initiate` | `RECRUITER` | ✅ | Returns `{ checkoutUrl, payment }`. The Stripe URL is built **server-side** |
| `GET` | `/payments` | `RECRUITER` | ✅ | Company-scoped history |
| `GET` | `/payments/:id` | `RECRUITER`, `ADMIN` | ✅ | Adds `company: { id, name }` |
| `POST` | `/payments/webhook` | public | ❌ | Stripe callback. Server-side only, never call it from a client |

> 🧠 The frontend does **not** build the Stripe return URL. It receives `checkoutUrl` and
> validates it with `safeExternalUrl()` (protocol allow-list, rejects `javascript:`,
> `data:` and protocol-relative values) before handing it to the browser. One source of
> truth for the URL, and an untrusted value cannot become a redirect target.

> ⚠️ `amount` is a Prisma `Decimal`, which serialises as a JSON **string** (`"20"`, not `20`).
> `Payment.amount` is typed `string` and `formatCurrency()` accepts both, because
> `GET /admin/stats` sums the same column.

### 🛡️ Admin : `service/admin.ts`

> 🧠 The whole `/admin` router is mounted behind `authMiddleware(ADMIN)` at the app level,
> so every route inherits the guard even though no route file declares it.

| Method | Path | Used | Notes |
|---|---|:-:|---|
| `GET` | `/admin/users` | ✅ | `?q=&role=&status=&page=&limit=`. `search` is an accepted alias of `q`, and `q` wins |
| `PATCH` | `/admin/users/:id` | ✅ | Suspend / restore via `{ status }`. **Also accepts `{ deletedAt: "now" }`.** See §5.3 |
| `GET` | `/admin/stats` | ✅ | `users.{total,recruiters,candidates,admins}`. The chart counts roles, the stat cards count statuses, and they will not sum to the same number |
| `GET` | `/admin/audit-logs` | ✅ | `?entity=&action=&page=&limit=` |
| `GET` | `/admin/payments` | :dash: | ❌ | **Does not exist.** The admin payments page is a lookup by id, not a table |

> 🧠 `GET /admin/users` uses an explicit Prisma `select`, so the row is **narrower than the
> User model**: no `phone`, `bio`, `skills`, `resumeUrl`, `githubUrl` or `updatedAt`. It does
> carry `_count.{invitations,attempts,auditLogs}` and a `{ company: { id, name } }` summary.

> ⚠️ `PATCH /admin/users/:id` returns a fixed six-field object (`id, name, email, role,
> status, deletedAt`) that is **not** the same shape as a `GET /admin/users` row. That is why
> there are two separate types, `AdminUser` and `AdminUserPatch`. It writes an audit log with
> action `USER_STATUS_UPDATED` or `USER_DELETED`, so both the users list and the audit log
> need revalidating after a status change.

> 🚫 Suspending an `ADMIN` is refused by the service (*"Admins cannot be suspended"*).

---

## 4️⃣ Behaviours that contradict the shape

> 🔬 Each of these is a real response observed from the running backend, not an inference
> from types.

### 4.1 🔤 MCQ answers are option **text**, not an index

`question.correctAnswer` is a `Prisma.Json` column. The backend auto-grades with:

```ts
JSON.stringify(response) === JSON.stringify(correctAnswer)
```

So the submitted `response` must be the **option text**, byte-identical:

```
✓  response = "200 OK"   →  full marks
✗  response = 2          →  0 marks
```

> 🚨 `correctAnswerLabel()` in `lib/format.ts` is **display-only**. Using it on the save
> path silently scores every MCQ zero.

### 4.2 ⚠️ `POST /invitations/:id/start` is not idempotent, and it writes

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

It persists `status: "EXPIRED"` **before** throwing. Never probe this endpoint on a row you
care about, and never treat its `400` as a pure read.

A second call returns `400 "An attempt already exists for this invitation"`. There is no
idempotency key, so resume is a **link**, not a repeat call. The invitation page derives the
correct control from the row's own state: `PENDING` → accept / decline; `ACCEPTED` with no
attempt → start; `ACCEPTED` with an `IN_PROGRESS` attempt → **resume**.

### 4.3 🔒 `PATCH /attempts/:id` refuses every body once submitted

```
400 "Cannot update an attempt with status SUBMITTED"
```

The check runs **before** the empty-answers validation, so it fires even for
`{ answers: [] }`. `status` must be exactly `"SUBMITTED"`, and any other value is
`400 "status: Invalid input: expected SUBMITTED"`.

> 🧠 `answers` is an **upsert** keyed on `@@unique([attemptId, questionId])`, so a save is
> incremental rather than a full replace. Every `questionId` must belong to the assessment's
> question set, checked before the transaction.

### 4.4 🎭 `PATCH /assessments/:id` is four endpoints wearing one path

Dispatched in this exact order. First match wins, and each variant **ignores every other
field in the body**:

| Priority | Body | Effect |
|---|---|---|
| 1 | `{ deletedAt: "now" }` | Soft delete, allowed in any status |
| 2 | `{ status }` | Lifecycle transition + audit log |
| 3 | `{ questionIds }` | Replaces the attached questions. **`DRAFT` only.** `points` forced to `1`, `order` = array index |
| 4 | `{ title, description, durationMins, passScore }` | Field updates. **`DRAFT` only.** |

Only the **immediate lifecycle successor** is accepted (`DRAFT → PUBLISHED → CLOSED →
ARCHIVED`, and `ARCHIVED` is terminal). `DRAFT` is not even in the `status` enum. Publishing
a question-less draft is refused with *"Add at least one question before publishing"*. Any
status control derives its target from `ASSESSMENT_NEXT_STATUS` rather than offering a free choice.

> ⚠️ Because of the ignore-others rule, a combined `{ title, questionIds }` body silently
> drops the title. The action issues separate calls per concern for this reason.

> ⚠️ An **empty body is valid** and falls into variant 4: a no-op on a draft, and
> `400 "Only draft assessments can be edited"` elsewhere.

### 4.5 🔁 `GET /attempts/:id` mutates the row it returns

If the attempt is `IN_PROGRESS` and `deadline` has passed, the read writes
`status: "EXPIRED"` before responding:

```ts
// backend/src/modules/attempt/attempt.service.ts:191
const expired = await expireIfStale(attemptId, attempt.status, attempt.deadline);
if (expired) attempt.status = "EXPIRED";
```

> 🚨 So this endpoint is not safe to poll, and a `GET` can be the thing that closes an attempt.

### 4.6 🛡️ Results are gated server-side, the answer key is not

For a `CANDIDATE`, when `resultReleased === false`, the response is rewritten before it
leaves the server:

```ts
// backend/src/modules/attempt/attempt.service.ts:196-208
if (role === "CANDIDATE" && !attempt.resultReleased) {
  return {
    ...attempt,
    score: null,
    maxScore: null,
    evaluatorNote: null,
    answers: attempt.answers.map((a) => ({ ...a, isCorrect: null, pointsAwarded: null })),
  };
}
```

So scores and per-answer correctness **are** protected. What is *not* protected is
`invitation.assessment.questions[].question.correctAnswer`. Every `correctAnswer` reaches
the candidate's browser on every read, released or not.

> 🚨 The payload cannot be changed from the frontend, so the discipline is a **rendering**
> rule: `ResultReview` takes `released` as a prop and its locked branch never reads that
> field. Nothing enforces this but review.

> 🧠 `GET /assessments/:id/results` is **not** gated this way, but it is `RECRUITER`-only,
> so a candidate cannot reach it at all.

### 4.7 📉 The candidate has no results endpoint

`GET /assessments/:id/results` returns **`403`** for `CANDIDATE`, and there is no "my
attempts" route. Every candidate page therefore derives from `GET /invitations/me`, and a
score needs one `GET /attempts/:id` per row.

That N+1 is deliberately bounded to the current page. Hydrating a full history would spend
`1 + N` requests on one page view and breach the rate limit after a handful of pages. A row
whose per-attempt read fails still renders, marked *"Could not load"*. Never as a zero.

> 🧠 The average shown is taken over **per-row percentages**, not raw points, because
> `maxScore` differs per assessment and a mean of raw `score` compares incomparable numbers.
> The caption says it covers only the rows on the page.

### 4.8 ⚖️ `POST /attempts/:id/evaluate` accepts `scores: []`

`evaluateAttemptSchema.scores` is `.default([])` with **no minimum length**, so an attempt
can be evaluated with an empty payload. That is how an MCQ-only attempt gets its `status`
flipped to `EVALUATED` and its result released.

What it will not accept:

| Rejection | Message |
|---|---|
| An **MCQ answer id** in `scores` | `400 "MCQ answers are auto-graded and cannot be manually scored"` |
| An `answerId` not on this attempt | `400 "Answer <id> does not belong to this attempt"` |
| Anything but a `SUBMITTED` attempt | `400 "Only submitted attempts can be evaluated"` |
| A **negative** `points` | Zod rejects it (`min(0)`) |

> 🚨 `releaseResult` is **one-shot**: a result not released at save time can never be
> published later.

### 4.9 🎯 `passScore` is never evaluated by the backend

It is stored on create/update and read by nothing in `assessment.service.ts`. There is
**no server-side pass/fail verdict to fetch**.

- 📏 It is in **points**, not percent.
- 🧮 The candidate result page therefore compares `score >= passScore` itself, and
  **discloses in the copy** that it is doing so.
- 🚨 When `passScore > maxScore` (exactly the seeded state: `70` on a 3-point assessment) it
  renders *"The pass mark cannot be reached"* rather than a bare failure.
- ♾️ It has **no upper bound** in the schema, so a value above `maxScore` is reachable from the form.

### 4.10 🚧 403 is mostly unreachable by design

`proxy.ts` and the role layouts both redirect a wrong-role visitor to their own `ROLE_HOME`
**before any fetch**, so a full-page 403 view would be dead code. What does reach the UI is
a **resource-level** denial: a recruiter with no company row gets `403` from
`/companies/me/dashboard` and `404` from `/companies/me`, *after* the role gate passed.
Those render as an in-page onboarding card, never as a full-page 403.

> 🚨 A **suspended** account gets `403` from `POST /auth/login`, not `401`, so it must not be
> treated as an expired session. Message: *"Your account has been suspended. Please contact
> support for assistance."*

### 4.11 ✂️ A recruiter's invitation update is forced to `DECLINED`

`PATCH /invitations/:id` accepts `CANDIDATE` and `RECRUITER`, and for a recruiter the
backend **overrides whatever was sent**:

```ts
// recruiter branch: the body's status is discarded
data: { status: "DECLINED" }
```

So "revoke an invitation" and "decline an invitation" are the same call from the client.
`invitationService.revoke()` sends `{ status: "DECLINED" }` and is honest about the fact
that it is the only removal available.

### 4.12 🧹 Unknown keys are stripped, not rejected

Every request body goes through a Zod `validateBody` middleware that **replaces `req.body`
with the parsed result**. Zod objects strip unknown keys by default, so an extra field is
silently dropped rather than rejected. Do not rely on the API to complain about a typo'd field name.

### 4.13 🔍 List endpoints have no free-text search where you might expect it

| Endpoint | Search |
|---|---|
| `GET /questions` | `?q=`, title **or** body, case-insensitive |
| `GET /admin/users` | `?q=` (alias `?search=`). Whitespace-split terms, `OR` across name and email |
| `GET /assessments` | **none.** Only `status` + `sortBy` + `sortOrder` |
| `GET /assessments/:id/results` | **none** |
| `GET /payments` | **none** |
| `GET /invitations/me` | `?status=` only |
| `GET /admin/audit-logs` | `?entity=` and `?action=`, exact matches, not free text |

> ⚠️ `page` must be a **positive integer** (`page=0` is a `400`) and `limit` is capped at
> **100** everywhere it is accepted. Both candidate list pages read the whole list in one
> request and, when `meta.total` exceeds 100, say so instead of quietly counting the first page.

---

## 5️⃣ Deliberately not integrated

### 5.1 🚪 `POST /auth/logout`

The endpoint exists, revokes every live refresh token, and clears its own cookies. The
frontend does not call it. `src/service/logout.ts` clears the local cookies and redirects.

> 🧠 The reason is that it requires an authenticated request, and the whole point of logout
> is that the session may already be unusable. A local clear always succeeds; a network call
> that can fail would leave the user apparently signed in.

> ⚠️ **The trade-off is real:** refresh tokens survive until they expire (7 days) or the
> backend's own session is invalidated. If you want server-side revocation, call
> `POST /auth/logout` *before* clearing, and fall back to the local clear when it fails.

### 5.2 👥 `GET /users/me`

Byte-identical to `GET /auth/me`: same include, same omit, even the same message. Two ways
to read one user is two ways for them to drift. `authService` reads `/auth/me` and `PATCH`es
`/users/me`. There is no getter for the latter.

### 5.3 🗑️ `PATCH /admin/users/:id { deletedAt: "now" }`

Supported by the backend (with a `USER_DELETED` audit log) but not wired into the admin UI,
which offers suspend and restore only. If you add it, remember the response is
`AdminUserPatch` (not `AdminUser`), and both the users list and the audit log need revalidating.

### 5.4 🚫 `GET /admin/payments` and `GET /assessments/:id/invitations`

Neither route exists. The admin payments page is therefore a single-field lookup whose value
lives in `?id=`, and the assessment roster is read from `GET /assessments/:id/results`. Both
are API limits, not UI choices. A paginated admin payments table would need a backend route first.

### 5.5 🔌 `POST /payments/webhook`

Registered on the backend before `express.json()`, with an `express.raw` body and a
`Stripe-Signature` header check. It is a Stripe-to-server callback. It is not part of this
frontend's contract and must never be called from a client.

---

## 6️⃣ 🧯 Error handling

Non-2xx responses resolve to the envelope so the UI can be specific:

| Status | Where it surfaces |
|---|---|
| `400` | Inline field errors from `errors`, or `ErrorState` with `message` |
| `401` | Handled internally: refresh + one retry, else redirect |
| `403` | Suspended-account notice, or an in-page empty state for resource denials |
| `404` | "That attempt does not exist" style empty states |
| `429` | `ErrorState` carrying the rate-limit text. Read `RateLimit-Reset` |
| `500` / `503` | `ErrorState`, `error.tsx` boundary, or the circuit breaker's synthetic `503` |

Forms surface `result.errors` per field. `window.alert` and blocking dialogs are never used
for feedback.

> 🚨 **A failed read never renders as a zero.** If `GET /companies/me` fails, the billing page
> shows `ErrorState`, not `creditsRemaining: 0`. Same rule on the results page and the
> payment lookup.

---

## 7️⃣ 🧪 Verification

Findings above were established against a **running** backend, not inferred from types.
Reproduce them before changing any of the code described here:

```bash
# Registration returns no tokens
curl -s -X POST http://localhost:5000/api/v1/auth/register \
  -H 'content-type: application/json' \
  -d '{"name":"Test","email":"t@example.com","password":"secret1","role":"CANDIDATE"}'

# limit is capped at 100
curl -s -H "Authorization: Bearer $TOKEN" \
  "http://localhost:5000/api/v1/questions?limit=101"

# page must be positive
curl -s -H "Authorization: Bearer $TOKEN" \
  "http://localhost:5000/api/v1/assessments?page=0"

# candidates cannot read assessment results
curl -s -H "Authorization: Bearer $CANDIDATE_TOKEN" \
  "http://localhost:5000/api/v1/assessments/$ID/results"

# admins cannot read an attempt
curl -s -H "Authorization: Bearer $ADMIN_TOKEN" \
  "http://localhost:5000/api/v1/attempts/$ATTEMPT_ID"

# the route that does not exist
curl -s -H "Authorization: Bearer $RECRUITER_TOKEN" \
  "http://localhost:5000/api/v1/assessments/$ID/invitations"

# health probe: does not consume the rate-limit budget
curl -s http://localhost:5000/
curl -s http://localhost:3000/api/health
```

> 🚫 **Do not** probe `POST /invitations/:id/start` against a row you care about (§4.2).
> **Do not** poll `GET /attempts/:id` (§4.5).

> ⚠️ The 100 requests / 15 minutes ceiling is easy to hit while verifying. A `429` is a rate
> limit, not an application bug.

---

## 8️⃣ ➕ Adding an endpoint

1. **Add the call to the matching `src/service/*.ts`.** One module per backend domain. Build
   the query with `buildQuery()` and pass cache `tags` on reads that several pages share.
   `assessmentService.results` uses `` tags: [`assessment:${id}`, "results"] `` so one
   `revalidateTag` invalidates every roster view.
2. **Model the payload in `src/lib/types.ts`.** No `any`. Prisma `Json` columns stay
   `JsonValue` and are normalised through `lib/format.ts` before they reach a component.
3. **Add the Zod schema to `lib/validations.ts`** and reuse it in both the form and the server
   action. The action re-parses server-side and its output wins.
4. **Re-check the role gate in the action.** `requireRole()` returns `null` on a mismatch, it
   does not throw, so the return value must be inspected. See §9.
5. **Handle `success: false`.** A call that resolves with `success: false` renders as an error
   state on a `200` page. Branch on `res.success`, not on the HTTP status.
6. **Respect the budget.** If the new call sits inside a list view, bound it to the current
   page and never poll.

---

## 9️⃣ 🚨 Two rules that are easy to break by accident

### 🔐 `requireRole()` returns, it does not throw

```ts
// src/lib/dashboard-session.tsx:8
export async function requireRole(role: Role): Promise<SessionUser | null> {
  const user = await authService.requireUser();
  if (!user || user.role !== role) return null;
  return user;
}
```

Every server action must **inspect the result**. `await requireRole("RECRUITER");` on its own
discards the check and lets the action continue for a session of any role. The correct shape
is the one the admin actions use:

```ts
const admin = await authService.requireUser();
if (!admin || admin.role !== "ADMIN") return invalid(VALIDATION_MESSAGES.forbidden, {});
```

> 🧠 The layout redirect and the backend's own `403` still stand behind this, so a discarded
> check is defence in depth rather than an open door. But it is the layer that is supposed to
> catch it first.

### 🔀 Redirect targets are untrusted input

`?redirectTo=` and `?session_id=` both arrive from the URL. `safeRedirect()` in
`lib/redirect.ts` is applied to the former inside the server action; `safeExternalUrl()`
validates the Stripe `checkoutUrl` before it becomes a `window.location.assign`. Do not hand
either to `redirect()` or `location` without going through those helpers.

---

## 📚 Further reading

| Document | What it holds |
|---|---|
| **[📘 README.md](./README.md)** | Architecture principles, route map, project structure |
| **[📋 AGENTS.md](./AGENTS.md)** | The rules this codebase holds itself to |
| `../backend/src/modules/**/*.route.ts` | The routes this document was verified against |
| `../backend/API Documentation/CODEARENA_API.md` | The backend's own reference |
