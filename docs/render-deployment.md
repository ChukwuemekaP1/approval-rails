# Deploying ApproveRail on Render

ApproveRail is officially configured for deployment on **Render** (one of the primary hackathon sponsors) using the declarative **Render Blueprint Specification** (`render.yaml`).

## Quick Deploy with Render Blueprint

1. **Connect GitHub Repository**:
   - Push your code to your GitHub repository.
   - In the [Render Dashboard](https://dashboard.render.com/), click **New +** and select **Blueprint**.
   - Select your ApproveRail repository.
2. **Automatic Provisioning**:
   - Render reads `render.yaml` and provisions:
     - **Web Service** (`approverail`): Next.js 15 production server.
     - **Managed PostgreSQL Database** (`approverail-db`): High-availability PostgreSQL database with automated connection string injection (`DATABASE_URL`).
     - **Automated Migrations**: Automatically runs `pnpm db:migrate` before launching each deployment.
     - **Health Checks**: Monitored via `/api/v1/health` for zero-downtime rolling deploys.
3. **Configure Environment Secrets**:
   Set the following optional secrets in the Render Dashboard under **Environment**:
   - `APP_URL`: Your Render service URL (e.g., `https://approverail.onrender.com`).
   - `DEV_BYPASS_PASSKEY`: Set to `"true"` for demo PIN fallback.
   - `CHANNEL3_API_KEY`: API key for live TryChannel3 hardware catalog discovery.
   - `PAYPAL_CLIENT_ID` & `PAYPAL_CLIENT_SECRET`: PayPal sandbox credentials.
   - `ZAPIER_WEBHOOK_URL`: Optional asynchronous notification outbox webhook.

## Alternative: Docker Web Service

Render also supports running ApproveRail using the included multi-stage `Dockerfile`:
- Runtime: **Docker**
- Build: Automated caching with non-root security.
- Health Check: `/api/v1/health`
- Port: `3000`

## Production Resilience on Render

- **Zero-Downtime Deploys**: Render keeps the previous build alive until the new instance passes the `/api/v1/health` probe.
- **SSL/TLS Encryption**: Free managed Let's Encrypt certificates provisioned automatically for custom domains and `*.onrender.com`.
- **DDoS Mitigation**: Built-in edge network protection.
