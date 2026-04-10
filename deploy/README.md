# Production Deployment (GitHub Actions + VPS + Caddy)

This setup deploys Aalap automatically on every merge/push to `main`.

## What gets deployed

- `frontend` container (Next.js)
- `backend` container (NestJS)
- `postgres` container
- `redis` container
- `caddy` reverse proxy with automatic TLS (Let's Encrypt)

Traffic routing:

- `/` -> frontend
- `/api/*` -> backend
- `/socket.io/*` -> backend (websocket)
- `/docs` -> backend Swagger docs

## Required GitHub Secrets

Set these in: **GitHub repo -> Settings -> Secrets and variables -> Actions**

- `VPS_HOST`
- `VPS_PORT` (optional, defaults to `22`)
- `VPS_USER`
- `VPS_SSH_KEY` (private key)
- `VPS_DEPLOY_PATH` (e.g. `/opt/aalap`)
- `DOMAIN` (e.g. `chat.example.com`)
- `GHCR_USERNAME` (GitHub username that owns the token below)
- `GHCR_PAT` (PAT with at least `read:packages`; `write:packages` if you also push with it)

`VPS_HOST` for SSH must be your origin server IP or a DNS-only hostname that resolves to your origin.
Do not use a Cloudflare proxied hostname for SSH because it will timeout.

If your images are under an organization, ensure the token user has access to that org packages
and SSO is authorized for the token (if your org enforces SSO).

Database/runtime:

- `POSTGRES_USER`
- `POSTGRES_PASSWORD`
- `POSTGRES_DB`
- `DATABASE_URL` (inside docker network, e.g. `postgresql://user:pass@postgres:5432/db`)
- `REDIS_URL` (e.g. `redis://redis:6379`)

Auth:

- `JWT_ACCESS_SECRET`
- `JWT_REFRESH_SECRET`
- `JWT_ACCESS_EXPIRES`
- `JWT_REFRESH_EXPIRES`

Cloudflare R2:

- `R2_ACCOUNT_ID`
- `R2_ACCESS_KEY_ID`
- `R2_SECRET_ACCESS_KEY`
- `R2_BUCKET_NAME`
- `R2_PUBLIC_URL`
- `R2_REGION`
- `R2_ENDPOINT` (optional)

## First server bootstrap

On your VPS, install Docker + Compose plugin, then open ports `80` and `443` in firewall/security group.

No manual app run is needed after that; workflow deploys automatically.

## Swagger docs

Swagger UI is exposed at:

- `https://<your-domain>/docs`

## Workflow

File: `.github/workflows/deploy-main.yml`

On push to `main`:

1. Build frontend/backend images
2. Push to GHCR
3. Copy deploy files to VPS
4. Write runtime `.env` on VPS
5. Pull new images and recreate services
