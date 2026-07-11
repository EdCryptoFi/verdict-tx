# Keeping markets in sync

Verdict's on-chain markets are kept in sync with the live TxODDS World Cup feed by a **routine you
run yourself** — no always-on server (no Railway / Fly / Render) and nothing to configure.

## The daily routine

```bash
pnpm sync:daily
```

One pass, then it exits:

1. Pulls the current World Cup fixtures from TxODDS.
2. Creates a 1X2 market on-chain for any fixture that doesn't have one (betting closes at kickoff).
3. Resolves any market whose match has finished, via the real TxODDS `validate_stat` CPI.

It prints exactly what it did and is **safe to run as often as you like** — re-running when nothing
changed is a no-op:

```
▶ Verdict daily sync · 2026-07-11 17:28:00 · cluster=devnet

  fixtures found : 3
  markets created: 0
  markets resolved: 0

✅ Already in sync — nothing to do.
```

### No setup required

It reads the TxODDS credentials from `relayer/.env` (written by `pnpm --filter @verdict/relayer
subscribe`) and signs with your default Solana CLI key at `~/.config/solana/id.json` — the same key
that deployed the program. The devnet test USDC mint is the default too. Override any of it with
`ADMIN_KEYPAIR`, `USDC_MINT`, `SOLANA_RPC_URL` env vars if you ever need a different setup.

## Related commands

| Command | What it does |
|---|---|
| `pnpm sync:daily` | **One pass, then exits.** The routine to run each day. |
| `pnpm sync:watch` | Same logic on a 60s loop — useful while a match is actually live. |
| `pnpm indexer:dev` | Local WebSocket feed of live scores for the frontend (optional, dev only). |

All three share one code path: [`runSyncOnce()`](../relayer/src/syncOnce.ts).

## Optional: let macOS run it for you

If you'd rather not remember it, `crontab -e` and add a line to run it every day at 09:00:

```cron
0 9 * * * cd "/Volumes/VibeCode/Solana Hackaton" && /usr/local/bin/pnpm sync:daily >> /tmp/verdict-sync.log 2>&1
```

(Adjust the `pnpm` path to match `which pnpm`.) This is purely a convenience — the routine is
identical either way.

## The hosted site

The public Vercel site is a static export and does **not** need any of this to run: it serves the
markets it already knows about. There is one optional serverless function, [`api/markets.ts`](../api/markets.ts),
which serves the live TxODDS fixtures/scores to the hosted frontend. It only activates if you set
`TXODDS_JWT` and `TXODDS_API_KEY` in the Vercel project's environment variables; without them the
site simply falls back to its seeded market data. Nothing breaks either way.
