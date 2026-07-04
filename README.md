# Cosmetics Trading ERP & POS Platform

A multi-branch, SaaS-native ERP and Point-of-Sale platform designed for cosmetics trading businesses. This repository is the single-tenant production build for the initial client, architected with schema-per-tenant multi-tenancy so it can be repackaged as a SaaS product in a later phase.

## Scope (Phase 1 MVP)

- Financial Management: Chart of Accounts, Fiscal Years, Vouchers, Cash/Bank, PDC
- General Ledger & Party Ledger with real-time postings
- Inventory: multi-UOM, batch/expiry, warehouse, costing, transfers, adjustments
- Purchase & Sales cycles with UOM handling and 3-way match
- Accounts Receivable & Payable with aging, allocation, and PDC
- Offline-first POS with shift management, returns approval, and discount authorization
- Owner/Partner mobile-responsive dashboard and approval center
- Core reporting suite: financial, inventory, sales/purchase, AR/AP, POS
- Platform services: RBAC, approval engine, audit trail, multi-branch, exports

## Technology Stack

| Layer | Choice |
|-------|--------|
| Backend API | Node.js + NestJS + Prisma ORM |
| Database | PostgreSQL (schema-per-tenant) |
| Web Frontend | Next.js 14 + React 18 + TailwindCSS + shadcn/ui |
| POS Client | PWA-enabled web client with offline queue + background sync |
| Mobile Owner App | Responsive web/PWA (React Native native shell is Phase 2) |
| Notifications | In-app + email + push hooks (WhatsApp/SMS Phase 2) |
| File Storage | S3-compatible object storage |

## Monorepo Layout

```
.
├── README.md
├── package.json              # root workspace orchestration
├── pnpm-workspace.yaml     # pnpm workspace definition
├── .gitignore
├── docker-compose.yml        # optional local Postgres
├── scripts/
│   └── deploy-aapanel.sh   # AAPanel server deployment helper
└── packages/
    ├── backend/              # NestJS API
    │   ├── prisma/
    │   │   ├── schema.prisma # full data model
    │   │   └── seed.ts       # demo data
    │   ├── src/
    │   │   ├── auth/
    │   │   ├── branches/
    │   │   ├── chart-of-accounts/
    │   │   ├── inventory/
    │   │   ├── purchase-sales/
    │   │   ├── pos/
    │   │   ├── approvals/
    │   │   ├── reports/
    │   │   └── audit/
    │   └── package.json
    └── frontend/             # Next.js app
        ├── app/
        ├── components/
        ├── lib/
        └── package.json
```

## Quick Start

### Prerequisites

- Node.js 20+
- PostgreSQL 15+ (or Docker for local dev)
- pnpm (preferred)

### 1. Clone the repository

```bash
git clone https://github.com/onenet786/cosmatics-devin.git
cd cosmatics-devin
```

### 2. Install dependencies

```bash
pnpm install
```

### 3. Start local PostgreSQL

```bash
pnpm docker:up
```

### 4. Configure environment

```bash
cp packages/backend/.env.example packages/backend/.env
# edit DATABASE_URL and JWT_SECRET
```

### 5. Migrate and seed

```bash
pnpm db:migrate
pnpm db:seed
```

### 6. Run development servers

```bash
pnpm dev
```

- Backend API: http://localhost:4000
- Frontend: http://localhost:3000

## Demo Users

Seeded by `db:seed`:

| Role | Email | Password |
|------|-------|----------|
| Owner | owner@cosmatics.local | `Cosmatics2026!` |
| Accountant | accountant@cosmatics.local | `Cosmatics2026!` |
| Branch Manager | branchmanager@cosmatics.local | `Cosmatics2026!` |
| POS Operator | cashier@cosmatics.local | `Cosmatics2026!` |

## Key Design Principles

1. **Server-side calculation**: Every monetary/quantity total is calculated and re-validated on the server.
2. **Base-unit storage**: All stock and costing are stored in the base unit; UOM conversion is presentation/input-layer only.
3. **Immutable audit**: All financial and stock mutations are logged with before/after values and are non-deletable.
4. **Offline-first POS**: Core sale transactions are captured locally and synced in the background; conflicts are resolved server-side.
5. **Shared approval engine**: Approval rules are configurable per tenant without code changes.

## Phases

- **Phase 1 (MVP)**: Core trading operations — this repository.
- **Phase 2**: Operational depth (bank reconciliation, landed cost, FEFO, schemes, FBR integration, WhatsApp).
- **Phase 3**: Growth & addons (budgeting, fixed assets, AI forecasting, loyalty, multi-currency, SaaS packaging).

> **Note:** Docker is not required. The project is configured for production hosting on AAPanel with PostgreSQL and Node.js.

## Deploy on AAPanel (Production)

The project is built to run on a standard Node.js + PostgreSQL hosting server managed by AAPanel. No Docker is required.

### 1. Create PostgreSQL database in AAPanel

- Open AAPanel > Databases > Add database.
- Note the database name, username, password, and host (usually `localhost` or `127.0.0.1`).

### 2. Upload backend code

On Windows, build the artifacts first with the helper script:

```powershell
# Run from the project root
powershell -ExecutionPolicy Bypass -File scripts/prepare-deploy.ps1 -ApiUrl https://your-api-domain.com
```

This creates `deploy/backend` and `deploy/frontend` folders ready to upload.

- Upload `packages/backend` (or the prepared `deploy/backend` folder) to your server (e.g., `/www/wwwroot/cosmatics-api`).
- Run `pnpm install` in the backend folder (AAPanel Node.js projects can also run this during setup).
- Copy `.env.example` to `.env` and set a real `DATABASE_URL` and strong `JWT_SECRET`.

```bash
cp .env.example .env
# Edit .env
DATABASE_URL="postgresql://DB_USER:DB_PASS@localhost:5432/DB_NAME?schema=tenant_default"
JWT_SECRET="at-least-32-characters-long-random-string"
FRONTEND_URL="https://your-frontend-domain.com"
```

### 3. Deploy migrations and seed data

You can run the helper script on the server after configuring `.env`:

```bash
bash scripts/deploy-aapanel.sh
```

Or run the steps manually:

```bash
pnpm db:deploy
pnpm db:seed
```

### 4. Add Node.js site in AAPanel

- AAPanel > Website > Add Node.js project.
- Project directory: `/www/wwwroot/cosmatics-api`.
- Startup file: `dist/src/main.js`.
- Build command: `pnpm build`.
- Port: `4000` (or any free port; update `.env` and AAPanel mapping).
- Map domain / reverse proxy to this port.
- Add a cron or keep-alive so the process restarts if it stops.

Health check endpoint: `GET /health`.

### 5. Deploy frontend

Option A — static export (served by AAPanel Nginx):

```bash
cd packages/frontend
set NEXT_PUBLIC_API_URL=https://your-api-domain.com
pnpm build:static
# Upload the generated packages/frontend/dist folder to AAPanel website root
```

Option B — Next.js Node.js site:

- Upload `packages/frontend` to a separate AAPanel Node.js project.
- Set `NEXT_PUBLIC_API_URL=https://your-api-domain.com`.
- Startup command: `pnpm start`.
- Map domain to the chosen port.

### 6. CORS / reverse proxy notes

- The backend `FRONTEND_URL` env must match the frontend domain.
- AAPanel Nginx should forward `/api/*` to the backend (e.g., `http://127.0.0.1:4000/api/$1`).
- See `scripts/aapanel-nginx.conf` for a complete Nginx reverse-proxy example.
- If using static export, the frontend calls the API directly using `NEXT_PUBLIC_API_URL`.

## License

Proprietary — internal client project.
