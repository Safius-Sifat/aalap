# Aalap

Aalap is a WhatsApp-style realtime chat application built as a pnpm monorepo with:

- Frontend: Next.js (App Router), React, Tailwind CSS, Zustand, React Query, Socket.IO client
- Backend: NestJS, Prisma, PostgreSQL, Redis, Socket.IO, JWT auth
- Storage: Cloudflare R2 (public bucket flow)
- Deployment: GitHub Actions to VPS using Docker + Caddy (automatic TLS)

## Monorepo Structure

```text
.
├── frontend/            # Next.js web app
├── backend/             # NestJS API + websocket gateway
├── packages/shared/     # Shared TS package
├── deploy/              # Production Caddy + Compose + deployment docs
├── docker-compose.yml   # Local postgres + redis
└── .github/workflows/   # CI/CD workflow
```

## Core Features

- Phone/password authentication with access + refresh token flow
- Direct and group chats
- Realtime messaging and typing indicators (Socket.IO)
- Message reply workflow
- Group management (metadata, member management, leave group)
- Media upload support through Cloudflare R2
- Swagger docs exposed at `/docs`

## Prerequisites

- Node.js 20+
- pnpm 10+
- Docker + Docker Compose

## Quick Start (Local Development)

1. Install dependencies from repo root:

```bash
pnpm install
```

2. Start local infrastructure (Postgres + Redis):

```bash
docker compose up -d
```

3. Configure backend env:

```bash
cp backend/.env.example backend/.env
```

Then edit `backend/.env` with your local values.

4. Configure frontend env (`frontend/.env.local`):

```env
NEXT_PUBLIC_API_URL=http://localhost:4000
NEXT_PUBLIC_SOCKET_URL=http://localhost:4000
```

5. Generate Prisma client and run migrations:

```bash
pnpm --filter backend exec prisma generate
pnpm --filter backend exec prisma migrate deploy
```

For a fresh local database, you can also use:

```bash
pnpm --filter backend exec prisma migrate dev
```

6. Start apps in dev mode:

```bash
pnpm dev
```

Default local URLs:

- Frontend: http://localhost:3000
- Backend API base: http://localhost:4000/api
- Swagger docs: http://localhost:4000/docs

## Useful Commands

From repository root:

```bash
pnpm dev              # Run all dev tasks via Turbo
pnpm build            # Build all packages/apps
pnpm lint             # Lint all packages/apps
```

Scoped commands:

```bash
pnpm --filter frontend dev
pnpm --filter frontend build

pnpm --filter backend dev
pnpm --filter backend build
```

## API and Realtime

- REST API is mounted under `/api` (global Nest prefix)
- Swagger UI is mounted at `/docs`
- Socket.IO endpoint is served by backend and used by frontend with websocket transport

## Environment Variables

### Backend (`backend/.env`)

Required groups:

- Database and cache
  - `DATABASE_URL`
  - `REDIS_URL`

- Auth
  - `JWT_ACCESS_SECRET`
  - `JWT_REFRESH_SECRET`
  - `JWT_ACCESS_EXPIRES`
  - `JWT_REFRESH_EXPIRES`

- Cloudflare R2
  - `R2_ACCOUNT_ID`
  - `R2_ACCESS_KEY_ID`
  - `R2_SECRET_ACCESS_KEY`
  - `R2_BUCKET_NAME`
  - `R2_PUBLIC_URL`
  - `R2_REGION`
  - `R2_ENDPOINT` (optional)

- App
  - `CLIENT_URL`
  - `PORT`

See `backend/.env.example` for template values.

### Frontend (`frontend/.env.local`)

- `NEXT_PUBLIC_API_URL`
- `NEXT_PUBLIC_SOCKET_URL`

## Production Deployment

Production deploy is automated on merge/push to `main` and can also be triggered manually.

- Workflow: `.github/workflows/deploy-main.yml`
- Reverse proxy + SSL: Caddy (ports 80/443)
- Runtime compose: `deploy/docker-compose.prod.yml`

Production routing:

- `/` -> frontend
- `/api/*` -> backend
- `/socket.io/*` -> backend
- `/docs` -> backend Swagger

For full deployment setup, secrets, and VPS notes, see:

- `deploy/README.md`

## Required GitHub Secrets (Deployment)

Minimum set:

- VPS access: `VPS_HOST`, `VPS_PORT` (optional), `VPS_USER`, `VPS_SSH_KEY`, `VPS_DEPLOY_PATH`
- Domain: `DOMAIN`
- GHCR auth: `GHCR_USERNAME`, `GHCR_PAT`
- App secrets: Postgres, Redis, JWT, and R2 variables used by deploy workflow

Important:

- `VPS_HOST` must be origin IP or DNS-only hostname for SSH
- Do not use a Cloudflare proxied SSH host
- GHCR image owner is normalized to lowercase at deploy time

## Troubleshooting

### 1) Prisma type errors in container build

If CI reports missing Prisma model properties (for example `this.prisma.user` does not exist), verify backend image build runs Prisma generate before `nest build`.

### 2) GHCR denied errors on VPS

If VPS cannot pull from GHCR:

- Ensure `GHCR_USERNAME` matches the token owner
- Ensure `GHCR_PAT` has at least `read:packages`
- If using organization packages, ensure org access + SSO authorization

### 3) Invalid image reference format (must be lowercase)

This happens when image owner/repo casing is mixed. Deploy workflow normalizes owner casing, but if it still appears, inspect deploy logs around resolved image references.

### 4) SSH timeout from GitHub Actions

Common causes:

- Wrong host/port
- SSH blocked by firewall/security group
- Cloudflare proxied hostname used for SSH

## License

Private project. All rights reserved unless you define a license file.
