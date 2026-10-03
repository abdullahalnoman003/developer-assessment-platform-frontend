# CodeArena Frontend

**Next.js 16** • **React 19** • **TypeScript** • **Tailwind CSS v4** • **shadcn/ui** • **Recharts**

A production-ready frontend for CodeArena  a developer assessment and coding platform with three distinct role-based dashboards: **Candidate**, **Recruiter**, and **Admin**.

[![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind](https://img.shields.io/badge/Tailwind_CSS-v4-06B6D4?logo=tailwindcss)](https://tailwindcss.com/)
[![Biome](https://img.shields.io/badge/Biome-lint%20%26%20format-60A5FA?logo=biome)](https://biomejs.dev/)
[![License](https://img.shields.io/badge/License-MIT-green)](LICENSE)

---

## Highlights

- **30 routes** backed by real API data  no mock data, no placeholders
- **Server-first architecture**  RSC + Server Actions, zero client cache library
- **Role-based access** enforced at middleware, page, and action level
- **One-click demo login** for all three roles on the sign-in page
- **Stripe test mode** integration with success/cancel flows
- **URL as state container**  every filter, sort, page, and wizard step is shareable
- **Full accessibility pass**  live regions, keyboard navigation, heading hierarchy
- **Responsive by default**  mobile-first, tables scroll, dialogs become sheets

---

## Quick Start

```bash
# Install dependencies
pnpm install

# Configure environment
cp .env.example .env.local

# Start development server
pnpm dev        # http://localhost:3000
```

**Requirements:** Node 20+, pnpm (run as `pnpm.cmd` on Windows)

The backend must be running at `NEXT_PUBLIC_API_URL`. Without it, data-fetching pages show the API's own error message  the app still builds and runs.

---

## Demo Accounts

Seeded by the backend on boot. The login page has a one-click card for each role.

| Role | Email | Password |
|------|-------|----------|
| Admin | `admin@codearena.com` | `admin1234` |
| Recruiter | `recruiter@codearena.com` | `recruiter123` |
| Candidate | `candidate@codearena.com` | `candidate123` |

> Registration returns no session (backend contract). The form automatically logs you in after account creation.

---

## Available Commands

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start dev server on `http://localhost:3000` |
| `pnpm build` | Production build (includes typecheck) |
| `pnpm start` | Serve production build |
| `pnpm lint` | Biome check (lint + format) |
| `pnpm format` | Biome format, write mode |

**Both `pnpm lint` and `pnpm build` must pass before any change is complete.**  
`src/components/ui/**` is excluded from Biome as vendored shadcn code  do not edit it directly.

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 16 (App Router, RSC + Server Actions) |
| Language | TypeScript (strict mode, no `any`) |
| Styling | Tailwind CSS v4 (CSS-first, design tokens in `globals.css`) |
| UI Components | shadcn/ui on Base UI (37 components) |
| Forms & Validation | React Hook Form + Zod (shared schemas) |
| Charts | Recharts (admin & recruiter dashboards) |
| Tooling | Biome (lint + format), pnpm |

---

## Architecture Principles

These rules are load-bearing. Violating them causes bugs the build will **not** catch.

1. **Server-first**  Data fetched in Server Components; Server Actions own every mutation
2. **No browser API calls**  Bearer token lives in httpOnly cookie; `api.ts` imports `server-only`
3. **API is the single source of truth**  No hardcoded lists, stats, or sample records
4. **Components never import services**  Pages and actions call services; components receive props
5. **Envelope for every read**  `{ success, statusCode, message, data, errors }` including non-2xx
6. **Automatic session recovery**  401 triggers refresh token rotation + one retry
7. **Role gates in middleware + re-checked everywhere**  Middleware is convenience, not authority
8. **URL holds all state**  Search, filters, sort, pagination, wizard steps in search params
9. **Loading, error, empty states everywhere**  API message and field errors surfaced, never silent
10. **Prisma Json normalized**  Via `lib/format.ts` before reaching UI

### Route Groups

| Group | Layout | Access |
|-------|--------|--------|
| `(publicSection)` | Footer + session-aware Navbar | Public |
| `(authentication)` | Navbar only | Redirects signed-in users |
| `(profileSection)` | DashboardShell | Any authenticated role |
| `(adminSection)` | DashboardShell | Admin only |
| `(recruiterSection)` | DashboardShell | Recruiter only |
| `(candidateSection)` | DashboardShell | Candidate only |

> `DashboardShell`'s `SidebarInset` renders the document's only `<main>`. Pages must **never** render their own `<main>`.

---

## Project Structure

```
src/
├── app/                      # Routes (one group per role)
├── components/
│   ├── auth/                 # Google button, post-auth toast
│   ├── home/                 # Marketing sections
│   ├── layout/               # Navbar, Footer, ThemeToggle
│   ├── shared/               # DataTable, StatusBadge, EmptyState, charts…
│   └── ui/                   # Vendored shadcn  do not edit
├── hooks/                    # useUrlState, useCountdown, useAutoSave…
├── lib/
│   ├── api.ts                # Single backend choke point
│   ├── types.ts              # Every backend payload, no any
│   ├── validations.ts        # Zod schemas (forms + actions)
│   ├── constants.ts          # Enums, labels, nav config
│   └── format.ts             # Date/number/JsonValue formatting
├── proxy.ts                  # Route-level role gate
└── service/                  # One module per backend domain
```

---

## Verification Workflow

No unit tests. Verification runs against a **live frontend + backend** because most defects are contract mismatches TypeScript cannot see.

```bash
pnpm lint && pnpm build        # Must be clean
```

Then in browser (`pnpm dev` or `pnpm start`):

- Changed route shows real data, not `ErrorState`
- Wrong-role/anonymous visitors are redirected, not just hidden
- API's own error message appears, not a generic string

### Common Gotchas

- **200 ≠ success**  Failed API calls render `ErrorState` and return 200. Check for real content.
- **Use `curl.exe -o file`**  PowerShell 5.1 truncates streamed RSC responses.
- **Strip `<!-- -->`**  React splits interpolated text; phrases are never contiguous in raw HTML.
- **Count painted headings**  Suspense fallbacks appear in response body but swap before paint.
- **Rate limit: 100 req / 15 min**  Batch reads, never poll. `429` during testing is a limit, not a bug.

---

## Environment Variables

All are public (`NEXT_PUBLIC_` is inlined into client bundle). **Never put secrets in `.env.local`.**

| Variable | Purpose |
|----------|---------|
| `NEXT_PUBLIC_API_URL` | Backend base URL  no trailing slash, no `/api/v1` (appended in code) |
| `NEXT_PUBLIC_SITE_URL` | Public origin for metadata, canonical URLs, sitemap, robots |
| `NEXT_PUBLIC_GOOGLE_CLIENT_ID` | Google Sign-In; leave empty to hide button |

See `.env.example` for annotated version.

---

## Deployment

See **[DEPLOYMENT.md](./DEPLOYMENT.md)** for the complete runbook.

```bash
vercel --prod          # Or connect repo in Vercel dashboard
```

Set `NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_GOOGLE_CLIENT_ID` as project environment variables.

> **Both frontend and backend must be publicly reachable.** A deployed frontend pointing at `localhost:5000` cannot call the API  browser requests to `localhost` resolve to the visitor's machine. Deploy or tunnel the backend first, then update its `FRONTEND_URL`, `CLIENT_URL`, and `CANCEL_URL`.

---

## Further Reading

- **[API_INTEGRATION.md](./API_INTEGRATION.md)**  Every endpoint, payload shapes, and 10 known frontend ↔ backend mismatches
- **`final.md`**  Implementation plan and full verification record with decision rationale
- **`../backend/API Documentation/CODEARENA_API.md`**  Backend's own API reference