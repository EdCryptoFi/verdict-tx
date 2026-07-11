# Automatic sync — no always-on server

Verdict keeps its markets in sync with the live TxODDS World Cup feed **without** any persistent
host (no Railway / Fly / Render). Everything runs on the same Vercel project as the frontend, using
**Serverless Functions + Vercel Cron**.

```
Browser (static site)  ──poll /api/markets every 15s──►  api/markets.ts  ─► TxODDS (fixtures+scores)
                                                            (creds server-side, never in the browser)

Vercel Cron (every 3h)  ──────────────────────────────►  api/sync.ts  ─► runSyncOnce()
                                                            creates 1X2 markets for new fixtures
                                                            resolves finished ones via validate_stat CPI
```

Two functions, both at the repo root in [`api/`](../api):

| Function | Trigger | What it does | Secrets used |
|---|---|---|---|
| `api/markets.ts` | Frontend polling (client, on-demand) | Fetches WC fixtures + live scores from TxODDS, returns shaped JSON. Credentials stay server-side. | `TXODDS_JWT`, `TXODDS_API_KEY` |
| `api/sync.ts` | Vercel Cron (`vercel.json` → every 3h) | Runs one pass of `runSyncOnce()`: creates markets for new fixtures, resolves finished ones on-chain. | `ADMIN_KEYPAIR_SECRET`, `USDC_MINT`, `SOLANA_RPC_URL`, `TXODDS_*`, `CRON_SECRET` |

The static export is untouched — Vercel serves `app/out` **and** auto-detects the root `api/` folder
as Serverless Functions (works with `framework: null`).

## Environment variables (Vercel dashboard → Project → Settings → Environment Variables)

Set these for **Production** (and Preview if you want):

```
TXODDS_JWT             = <guest JWT from `pnpm --filter @verdict/relayer subscribe`>
TXODDS_API_KEY         = <apiToken from the same subscribe step>
TXODDS_DATA_ORIGIN     = https://txline-dev.txodds.com   # optional (this is the default)

# only needed by api/sync.ts (on-chain writes):
ADMIN_KEYPAIR_SECRET   = [12,34, ... ]   # the JSON byte array — contents of keypairs/admin.json
USDC_MINT              = <the devnet mint used by the markets>
SOLANA_RPC_URL         = https://api.devnet.solana.com
CRON_SECRET            = <any long random string; Vercel sends it as a Bearer token to the cron>
```

> `ADMIN_KEYPAIR_SECRET` is the raw array from `keypairs/admin.json` (e.g. `cat keypairs/admin.json`).
> Never commit it — it lives only in Vercel env vars. `CRON_SECRET` makes `/api/sync` reject any
> caller that isn't Vercel Cron.

## Cron cadence

`vercel.json` schedules `/api/sync` every 3 hours (`0 */3 * * *`). On the **Hobby** plan Vercel Cron
runs at most once per day, so for tighter cadence use a **Pro** project (any schedule) — the live
score feed (`/api/markets`) is client polling and refreshes every 15s regardless of plan.

## Running it locally (unchanged)

The persistent loop still exists for local dev / the demo machine:

```
pnpm --filter @verdict/relayer sync     # loop: runSyncOnce() every 60s
pnpm --filter @verdict/indexer dev      # WebSocket live feed (optional)
```

Both the loop and the cron call the same [`runSyncOnce()`](../relayer/src/syncOnce.ts).
