<div align="center">

# 🏆 CodeArena

**Next.js 16 · React 19 · TypeScript · Tailwind v4 · shadcn/ui · Recharts**

A developer assessment platform. Recruiters build a question bank, compose timed
assessments and invite candidates. Candidates accept, attempt under a deadline and
see released results. Admins oversee accounts and audit everything.

</div>

[![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind](https://img.shields.io/badge/Tailwind_CSS-v4-06B6D4?logo=tailwindcss)](https://tailwindcss.com/)
[![Biome](https://img.shields.io/badge/Biome-lint%20%26%20format-60A5FA?logo=biome)](https://biomejs.dev/)

<div align="center">

| 📄 Pages | 🎨 Roles | 🔌 Routes used | ⚡ Rate limit | 🧪 `any` types |
|:---:|:---:|:---:|:---:|:---:|
| **32** | **3** | **33 / 36** | **100 / 15 min** | **0** |

</div>

---

## ⚡ Highlights

> **32 pages** over a live API. No mock data, no placeholder records, no stub pages.

- 🧱 **Server-first architecture.** RSC + Server Actions, with zero client cache library
- 🔐 **Role enforcement at three layers.** `proxy.ts`, then the layout, then every server action
- ⚡ **One-click demo sign-in** for all three roles, right on the login page
- 💳 **Stripe test mode.** Real Checkout Session with success and cancel return flows
- 🔗 **URL as the state container.** Every filter, sort, page and wizard step is shareable
- 🛡️ **Rate-limit-aware reads.** The API allows 100 requests per 15 minutes, and the UI is built for that ceiling
- 📱 **Responsive and accessible by default.** Tables become stacked cards, dialogs become sheets
- ♿ **Keyboard, screen reader and reduced-motion support** throughout

---

## 🚀 Quick start

```bash
pnpm install
cp .env.example .env.local     # then edit NEXT_PUBLIC_API_URL
pnpm dev                       # http://localhost:3000
```

**Requires** Node 20+ and pnpm (`pnpm.cmd` on Windows).

> 💡 The backend must be running at `NEXT_PUBLIC_API_URL` for any page that reads data.
> Without it the app still builds and serves: pages render the API's own error message
> instead of crashing, and `GET /api/health` reports exactly what is unreachable.

---

## 🔑 Demo accounts

Seeded by the backend on boot. The login page has a one-click card for each role.

| Role | Email | Password |
|------|-------|----------|
| 🛡️ Admin | `admin@codearena.com` | `admin1234` |
| 💼 Recruiter | `recruiter@codearena.com` | `recruiter123` |
| 🎯 Candidate | `candidate@codearena.com` | `candidate123` |

Google sign-in is also wired via `NEXT_PUBLIC_GOOGLE_CLIENT_ID`. Leave the variable
empty and the button hides itself.

> ℹ️ Registration returns no session (backend contract), so the register form logs you
> in immediately after creating the account.

---

## 🛠️ Commands

| Command | Description |
|---------|-------------|
| `pnpm dev` | Dev server on `http://localhost:3000` |
| `pnpm build` | Production build (includes typecheck) |
| `pnpm start` | Serve the production build |
| `pnpm lint` | Biome check (lint + format) |
| `pnpm format` | Biome format, write mode |

> ✅ **`pnpm lint` and `pnpm build` must both pass before a change is done.**
> `src/components/ui/**` is excluded from Biome as vendored shadcn code. Don't edit it directly.

---

## 🧰 Tech stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 16 (App Router, RSC + Server Actions) |
| Language | TypeScript (strict, no `any`) |
| Styling | Tailwind CSS v4 (CSS-first, design tokens in `globals.css`) |
| UI components | shadcn/ui on Base UI (38 components) |
| Data fetching | `ofetch` behind a single `server-only` choke point |
| Forms & validation | React Hook Form + Zod (29 shared schemas) |
| Charts | Recharts |
| Feedback | react-hot-toast |
| Icons | lucide-react |
| Theming | next-themes, light + dark |
| Tooling | Biome, pnpm |

> 🤔 **No client cache library on purpose.** See principle 1 below.

---

## 🧱 Architecture principles

> 🚨 These rules are load-bearing. Violating them causes bugs the compiler will **not** catch.

| # | Principle | Rule |
|:-:|---|---|
| 1 | **Server-first** | Data is fetched in Server Components; Server Actions own every mutation |
| 2 | **No browser API calls** | The bearer token lives in an httpOnly cookie, so `lib/api.ts` imports `server-only` and cannot be bundled for the browser |
| 3 | **API is the single source of truth** | No hard-coded lists, stats or sample records. A failed read renders an error state, never a zero |
| 4 | **Components never import services** | Pages and actions call services; components receive plain props |
| 5 | **One envelope for every read** | `{ success, statusCode, message, data, errors }`, including non-2xx |
| 6 | **Automatic session recovery** | A `401` on an expired token triggers refresh rotation and exactly one retry |
| 7 | **Role gates re-checked everywhere** | `proxy.ts` is a convenience, not the authority. Layouts and actions re-check |
| 8 | **URL holds all state** | Search, filters, sort, pagination and wizard steps live in search params |
| 9 | **Loading, error, empty states everywhere** | The API's own message and field errors are surfaced, never a generic string |
| 10 | **Prisma `Json` is normalised** | Through `lib/format.ts` before it reaches a component |

### 🗂️ Route groups

| Group | Layout | Access |
|-------|--------|--------|
| `(publicSection)` | Footer + session-aware Navbar | Public |
| `(authentication)` | Navbar only | Redirects signed-in users |
| `(profileSection)` | DashboardShell | Any authenticated role |
| `(adminSection)` | DashboardShell | Admin only |
| `(recruiterSection)` | DashboardShell | Recruiter only |
| `(candidateSection)` | DashboardShell | Candidate only |

> ⚠️ `DashboardShell`'s `SidebarInset` renders the document's only `<main>`.
> Pages return a fragment or a `<div>`, never a second `<main>`.

---

## 🗺️ Routes

### 🌐 Public (9)

| Route | Page |
|---|---|
| `/` | Home |
| `/about` | About |
| `/how-it-works` | Product walkthrough |
| `/contact` | Contact |
| `/faq` | FAQ |
| `/pricing` | Credit plans |
| `/terms` | Terms |
| `/payment/success` | Checkout return: reads the real payment record |
| `/payment/cancel` | Checkout return |

### 🔐 Authentication (4)

`/login` (with one-click demo cards) · `/register` · `/forgot-password` · `/reset-password`

### 👤 Shared (1)

`/profile` : role-aware. Identity for everyone, plus candidate profile fields or company details.

### 🛡️ Admin (4)

| Route | Page |
|---|---|
| `/dashboard/admin` | Overview + charts |
| `/dashboard/admin/users` | Search, filter, suspend/restore |
| `/dashboard/admin/audit-logs` | Filter by entity and action |
| `/dashboard/admin/payments/lookup` | By id. The API has no admin payment list |

### 💼 Recruiter (9)

| Route | Page |
|---|---|
| `/dashboard/recruiter` | Overview + charts |
| `/dashboard/recruiter/company` | Company details |
| `/dashboard/recruiter/questions` | Question bank (CRUD + filters) |
| `/dashboard/recruiter/assessments` | List + filters |
| `/dashboard/recruiter/assessments/new` | 3-step wizard |
| `/dashboard/recruiter/assessments/[id]` | Detail, lifecycle, invite |
| `/dashboard/recruiter/assessments/[id]/results` | Candidate roster |
| `/dashboard/recruiter/assessments/[id]/attempts/[attemptId]` | Scoring workspace |
| `/dashboard/recruiter/billing` | Credits, plans, history |

### 🎯 Candidate (5)

| Route | Page |
|---|---|
| `/dashboard/candidate` | Overview |
| `/dashboard/candidate/invitations` | Invitations |
| `/dashboard/candidate/results` | Results |
| `/dashboard/candidate/attempts/[id]` | Timed runner |
| `/dashboard/candidate/attempts/[id]/result` | Released result + review |

### 🩺 Route handler (1)

`/api/health` : backend reachability and circuit-breaker state. `POST` resets the breaker.

---

## 📂 Project structure

```
src/
├── app/                      # Routes, one group per role
│   ├── (publicSection)/
│   ├── (authentication)/
│   ├── (profileSection)/
│   ├── (adminSection)/
│   ├── (recruiterSection)/
│   ├── (candidateSection)/
│   ├── api/health/           # Backend reachability probe
│   ├── sitemap.ts · robots.ts · manifest.ts · opengraph-image.tsx
│   └── error.tsx · global-error.tsx · not-found.tsx
├── components/
│   ├── auth/                 # Google button, post-auth handoff
│   ├── home/                 # Marketing sections
│   ├── layout/               # Navbar, Footer, ThemeToggle
│   ├── shared/               # 19 shared components: DataTable, StatusBadge, charts…
│   └── ui/                   # 38 vendored shadcn components
├── hooks/                    # useUrlState, useCountdown, useAutoSave,
│                             #   useActionToast, useBackendHealth, useIsMobile
├── lib/
│   ├── api.ts                # Single backend choke point
│   ├── types.ts              # Every backend payload, no `any`
│   ├── validations.ts        # 29 Zod schemas, shared by forms and actions
│   ├── constants.ts          # Enums, labels, nav config, demo accounts
│   ├── format.ts             # Date / number / JsonValue formatting
│   ├── seo.ts                # Metadata helpers
│   └── redirect.ts           # safeRedirect + safeExternalUrl
├── proxy.ts                  # Route-level role gate
└── service/                  # One module per backend domain
```

---

## 💡 Notable implementation details

> 🔍 The five things below are not obvious from reading any single file.

**1. 🧙 The wizard is three API calls, not one.**
The backend has no create-with-questions route, so building an assessment runs
`POST /assessments` → `PATCH { questionIds }` → `PATCH { status }` in order.
If a later step fails the draft is deliberately kept, so the work is never lost.

**2. 🔤 MCQ answers are submitted as option text, not an index.**
The backend grades with `JSON.stringify(response) === JSON.stringify(correctAnswer)`.

**3. 📏 `limit` is capped at 100 by the API.**
The question picker uses that as a single constant and says so in the UI when
results are truncated.

**4. 🚫 There is no `DELETE` verb in this API.**
Every delete is `PATCH { deletedAt: "now" }`, so delete and archive are the same call.

**5. 💧 The candidate results page hydrates one page at a time.**
The API gives candidates no results endpoint, so a score needs one request per row.
Bounded to the current page, it stays inside the rate limit.

> 🧠 Two more: a failed read is never rendered as a zero (billing shows an error state
> instead of `creditsRemaining: 0`), and the Stripe checkout URL is **validated** rather
> than built here, because it is a server-side value.

Full details, including every behavioural mismatch with the backend, are in
**[📘 API_INTEGRATION.md](./API_INTEGRATION.md)**.

---

## ✅ Verification workflow

There are no unit tests. Verification runs against a **live frontend + backend**,
because most defects here are contract mismatches TypeScript cannot see.

```bash
pnpm lint && pnpm build        # must be clean
```

Then in a browser (`pnpm dev` or `pnpm start`):

- ✅ The changed route shows real data, not an error state
- ✅ Wrong-role and anonymous visitors are redirected, not just hidden
- ✅ The API's own error message appears, not a generic string
- ✅ Filters survive a refresh and a shared link

### 🪤 Common gotchas

| Gotcha | What it looks like |
|---|---|
| 🚨 A `200` does not mean success | Failed API calls render an error state and still return `200`. Check for real content, not the status code |
| 👻 Count painted headings | Suspense fallbacks appear in the response body but swap before paint, so a short HTML response is not proof of an empty page |
| 🐌 `429` is a rate limit, not a bug | The ceiling is 100 requests / 15 minutes. `RateLimit-Reset` says how long to wait |

---

## 🔐 Environment variables

> 🔒 All three are public. Anything prefixed `NEXT_PUBLIC_` is inlined into the client
> bundle. **Never put a secret in `.env.local`.**

| Variable | Purpose |
|----------|---------|
| `NEXT_PUBLIC_API_URL` | Backend origin: no trailing slash, no `/api/v1` (appended in code) |
| `NEXT_PUBLIC_SITE_URL` | Public origin for metadata, canonical URLs, sitemap, robots |
| `NEXT_PUBLIC_GOOGLE_CLIENT_ID` | Google sign-in. Leave empty to hide the button |

See `.env.example` for the annotated version, including the backend-side variables the
frontend depends on.

---


## 📚 Further reading

- **[📘 API_INTEGRATION.md](./API_INTEGRATION.md)** : the choke point, every endpoint, and the behavioural mismatches that shaped the code

