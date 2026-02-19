# CarSalesman

Marketing SaaS for car dealership salesmen.

## Phase 1 foundation included

- Next.js App Router with TypeScript + Tailwind
- Drizzle ORM schema + config for PostgreSQL
- Shared environment variable validation with Zod
- Docker Compose for local PostgreSQL

## Local setup

1. Install dependencies:
   ```bash
   npm install
   ```
2. Copy env values:
   ```bash
   cp .env.example .env.local
   ```
3. Start database:
   ```bash
   docker compose up -d db
   ```
4. Generate and apply migrations:
   ```bash
   npm run db:generate
   npm run db:migrate
   ```
5. Run the app:
   ```bash
   npm run dev
   ```
