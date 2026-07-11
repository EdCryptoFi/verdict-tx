/**
 * Local market-sync loop: keep on-chain markets in sync with the live TxODDS World Cup fixtures.
 * Runs `runSyncOnce()` on an interval. For a serverless/no-host setup use /api/sync.ts (Vercel Cron)
 * which calls the same `runSyncOnce()`.
 *
 *   pnpm --filter @verdict/relayer sync
 */
import { config } from "./config.js";
import { runSyncOnce } from "./syncOnce.js";

const TICK_MS = Number(process.env.SYNC_TICK_MS ?? 60_000);

async function tick() {
  const r = await runSyncOnce();
  console.log(
    `[sync] ${r.fixtures} fixtures · +${r.created.length} created · ✓${r.resolved.length} resolved` +
      (r.errors.length ? ` · ${r.errors.length} err` : "")
  );
  for (const id of r.created) console.log(`[sync]   + market ${id}`);
  for (const id of r.resolved) console.log(`[sync]   ✓ resolved ${id}`);
  for (const e of r.errors) console.error(`[sync]   ! ${e}`);
}

console.log(`Verdict market-sync · every ${TICK_MS / 1000}s · cluster=${config.cluster}`);
await tick();
setInterval(() => tick().catch((e) => console.error(e)), TICK_MS);
