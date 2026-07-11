/**
 * Daily market sync — run this by hand (or from cron) once a day.
 *
 *   pnpm sync:daily
 *
 * One pass, then exits: creates a 1X2 market for every new World Cup fixture and resolves any
 * finished match via the real TxODDS validate_stat CPI. Uses the credentials already in
 * relayer/.env and the key at keypairs/admin.json — nothing else to configure.
 */
import { config } from "../config.js";
import { runSyncOnce } from "../syncOnce.js";

const stamp = new Date().toISOString().replace("T", " ").slice(0, 19);
console.log(`\n▶ Verdict daily sync · ${stamp} · cluster=${config.cluster}\n`);

const r = await runSyncOnce();

console.log(`  fixtures found : ${r.fixtures}`);
console.log(`  markets created: ${r.created.length}`);
for (const id of r.created) console.log(`      + ${id}`);
console.log(`  markets resolved: ${r.resolved.length}`);
for (const id of r.resolved) console.log(`      ✓ ${id}`);

if (r.errors.length) {
  console.log(`\n  ${r.errors.length} issue(s) — these are usually matches that aren't final yet:`);
  for (const e of r.errors) console.log(`      ! ${e}`);
}

// Nothing to do is a success: it means every fixture already has an up-to-date market.
const changed = r.created.length + r.resolved.length;
console.log(`\n${changed ? `✅ ${changed} change(s) written on-chain.` : "✅ Already in sync — nothing to do."}\n`);

// Only fail the run if we couldn't even reach the fixture list (so cron surfaces a real outage).
process.exit(r.fixtures === 0 && r.errors.length ? 1 : 0);
