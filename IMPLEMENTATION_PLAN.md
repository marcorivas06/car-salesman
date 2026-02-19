# Car Salesman SaaS – Implementation Plan

## Phase 1 — Foundation: Project Setup, Local Infra, and Database Contract
1. Initialize Next.js (App Router) with TypeScript, Tailwind, ESLint, and `src/` layout.
2. Spin up PostgreSQL via Docker Compose.
3. Install and configure Drizzle ORM + Drizzle Kit + `drizzle-zod`.
4. Define core schema (`users`, `salesman_profiles`, `subscriptions`, `leads`) and enum strategy.
5. Generate first migration and verify DB connectivity.

### Suggested terminal commands
```bash
# 1) Bootstrap app (if not initialized yet)
npx create-next-app@latest car-salesman \
  --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"
cd car-salesman

# 2) Database + ORM packages
npm install drizzle-orm pg zod drizzle-zod
npm install -D drizzle-kit tsx dotenv

# 3) UI + auth + billing packages for upcoming phases
npm install @better-auth/core stripe @stripe/stripe-js
npm install class-variance-authority clsx tailwind-merge lucide-react
npx shadcn@latest init

# 4) Start local postgres
cat > docker-compose.yml <<'YAML'
services:
  postgres:
    image: postgres:16
    container_name: car_salesman_postgres
    restart: unless-stopped
    environment:
      POSTGRES_DB: car_salesman
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
volumes:
  postgres_data:
YAML

docker compose up -d

# 5) Drizzle config + initial migration
npx drizzle-kit generate
npx drizzle-kit migrate
```

## Phase 2 — Authentication + Billing Backbone
1. Integrate Better Auth (email/password + session handling).
2. Build signup/login/logout flow in App Router route handlers and server actions.
3. Create Stripe products/prices, checkout session creation endpoint, and webhook handler.
4. Persist Stripe customer/subscription lifecycle events into `subscriptions`.
5. Gate dashboard routes by auth + active subscription status.

## Phase 3 — Salesman Dashboard (Onboarding + Profile Management)
1. Build protected dashboard shell (layout, sidebar, account section).
2. Onboarding wizard: profile info, dealership details, WhatsApp config, publish toggle.
3. Profile photo upload strategy (e.g., local/S3 in future).
4. Add form validation with Zod + server actions.
5. Add subscription status card and ad budget visibility.

## Phase 4 — Public Landing Pages + Lead Capture
1. Implement dynamic route: `app/[salesmanId]/page.tsx`.
2. Resolve profile by slug/id, render marketing landing page template.
3. Add WhatsApp click-to-chat deep link with pre-filled message.
4. Add lead form (name + email/phone + intent message) and persist to `leads`.
5. Add spam protections (honeypot/basic rate limit) and success UX.

## Phase 5 — Hardening, Observability, and Go-Live Readiness
1. Authorization checks across API/server actions.
2. Stripe webhook idempotency and failure retries.
3. Error logging, analytics events, and conversion tracking hooks.
4. SEO metadata, OG images, and page performance pass.
5. CI checks, migration safety checklist, and release playbook.
