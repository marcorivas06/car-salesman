# Marketing SaaS for Car Dealership Salesmen — Implementation Plan

## 1) Architecture & Data Modeling (Drizzle + Zod)

### Core domains
- **Identity/Auth**: Better Auth-managed identities and sessions.
- **Salesman Profile**: Public-facing profile data rendered at `myapp/[salesmanId]`.
- **Subscription/Billing**: Stripe product tier + lifecycle status + ad budget metadata.
- **Lead Capture**: Consumer submissions from public pages.

### Database model
- `users`: Canonical application user/salesman record (auth + profile + contact + dealership).
- `accounts`: OAuth/provider account links (Better Auth-compatible shape).
- `sessions`: Active auth sessions (Better Auth-compatible shape).
- `verification_tokens`: Token-based auth/email verification/reset flows.
- `subscriptions`: Stripe customer/subscription metadata and selected tier.
- `leads`: Consumer lead form submissions tied to a salesman.

### Key constraints and decisions
- Public route key is `users.slug` (stable, unique, human-friendly), used in `/[salesmanId]`.
- Strict relational ownership: `subscriptions.user_id` and `leads.salesman_id` reference `users.id` with cascade deletes.
- Enum-driven status fields for consistency:
  - `subscription_tier`: `starter | growth | pro`
  - `subscription_status`: `incomplete | trialing | active | past_due | canceled | unpaid`
  - `lead_status`: `new | contacted | qualified | unqualified`
- `zod` contracts are derived from schema for server actions and API route validation.

---

## 2) Sequential Implementation Phases

### Phase 1 — Foundation: Project Setup, DB, and Validation
- Bootstrap Next.js App Router + TypeScript + Tailwind.
- Install and configure `drizzle-orm`, `drizzle-kit`, `postgres`, `zod`, `drizzle-zod`.
- Create Dockerized PostgreSQL local environment.
- Implement initial `drizzle/schema.ts` + migration generation.
- Add shared env parsing (`DATABASE_URL`, `BETTER_AUTH_SECRET`, Stripe keys).

### Phase 2 — Authentication + Billing Backbone
- Integrate Better Auth with Drizzle adapter and session handling.
- Build signup/login flows and protected dashboard shell.
- Integrate Stripe checkout for tier selection after signup.
- Handle Stripe webhooks to sync `subscriptions` status and period dates.

### Phase 3 — Salesman Dashboard & Profile Management
- Build dashboard pages with shadcn/ui forms.
- Implement profile editor:
  - First/Last name, profile photo URL/upload, about text
  - Dealership name
  - Email/phone/WhatsApp number
  - Public slug management
- Add subscription panel (current tier, payment status, manage billing).

### Phase 4 — Public Dynamic Landing Pages + Lead Capture
- Implement dynamic route `app/[salesmanId]/page.tsx`.
- Server-side fetch by slug and render branded salesman page.
- Add WhatsApp click-to-chat button with prefilled message.
- Add lead form submission pipeline with Zod-validated inputs.

### Phase 5 — Hardening, Analytics, and Launch Readiness
- Security review (rate limits, bot protection, validation, sanitization).
- Observability (request logs, webhook logs, error tracking).
- SEO basics + Open Graph metadata for public pages.
- CI checks (typecheck, lint, test, migration checks) and deployment checklist.

---

## 3) Phase 1 — Terminal Commands (Initialization)

```bash
# 1) Create app (run from parent dir)
npx create-next-app@latest car-salesman \
  --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"

cd car-salesman

# 2) Core dependencies
npm install drizzle-orm postgres zod drizzle-zod better-auth stripe @stripe/stripe-js

# 3) Dev dependencies
npm install -D drizzle-kit @types/node

# 4) shadcn/ui setup
npx shadcn@latest init -d

# 5) Local PostgreSQL (Docker)
docker run --name car-salesman-db \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=car_salesman \
  -p 5432:5432 -d postgres:16

# 6) .env.local example values
cat <<'ENV' > .env.local
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/car_salesman
BETTER_AUTH_SECRET=replace_me
BETTER_AUTH_URL=http://localhost:3000
STRIPE_SECRET_KEY=sk_test_replace_me
STRIPE_WEBHOOK_SECRET=whsec_replace_me
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_replace_me
ENV

# 7) Drizzle config + generate first migration (after schema is added)
npx drizzle-kit generate
npx drizzle-kit migrate
```

> In this repository snapshot, the focus is the Phase 1 architecture + `drizzle/schema.ts` boilerplate.
