/**
 * Prove the settlement path end-to-end on a finished fixture, using the exact same
 * `resolveMarketReal()` that the daily sync calls — so a green run here is a green run for the
 * automated routine.
 *
 *   pnpm --filter @verdict/relayer prove-resolve <fixtureId>
 *
 * It reads the score's Merkle proof from TxODDS, submits `resolve` (which CPIs into the real
 * TxODDS `validate_stat` on-chain), and reads the market back to show it actually settled.
 */
import { marketPda, MarketKind, Outcome1X2 } from "@verdict/shared";
import { adminKeypair, config } from "../config.js";
import { getProgram } from "../program.js";
import { resolveMarketReal, latestSeq } from "../resolveReal.js";

const OUTCOME_NAME = ["HOME", "DRAW", "AWAY"];

const fixtureId = Number(process.argv[2] ?? 18198205);
const admin = adminKeypair();
const program = getProgram(admin);
const [pda] = marketPda(BigInt(fixtureId), MarketKind.FullTime1X2);

console.log(`\n▶ Proving settlement for fixture ${fixtureId} (cluster=${config.cluster})`);
console.log(`  market PDA: ${pda.toBase58()}`);

const before = await program.account.market.fetchNullable(pda);
if (!before) {
  console.error(`\n✗ No market on-chain for fixture ${fixtureId}. Run \`pnpm sync:daily\` first.`);
  process.exit(1);
}
console.log(`  status before: ${Object.keys(before.status)[0]}`);

const seq = await latestSeq(fixtureId);
if (seq == null) {
  console.error(`\n✗ TxODDS has no score sequence for this fixture yet.`);
  process.exit(1);
}
console.log(`  TxODDS score sequence: ${seq}`);

console.log(`\n  submitting resolve → CPI into TxODDS validate_stat …`);
const sig = await resolveMarketReal(admin, fixtureId, seq);

const after = await program.account.market.fetch(pda);
const status = Object.keys(after.status)[0];
const winner = after.winningOutcome;

console.log(`\n✅ settled on-chain — the winner below was decided by the TxODDS CPI, not by us`);
console.log(`  status : ${status}`);
console.log(`  winner : ${winner} (${OUTCOME_NAME[winner] ?? "?"})`);
console.log(`  tx     : ${sig}`);
console.log(`  explorer: https://explorer.solana.com/tx/${sig}?cluster=${config.cluster}`);

// Two terminal states are both correct settlements: "resolved" pays the winners, and "refunded" is
// the safety path the program takes when nobody staked the winning outcome (see resolve.rs) — the
// stakes go back rather than being locked forever. Anything else means resolve didn't land.
if (status === "refunded") {
  console.log(`\n  ℹ nobody had staked ${OUTCOME_NAME[winner]}, so the program refunded every bettor`);
  console.log(`    instead of locking the pool. That is the intended path, not a failure.`);
}
console.log();

if (status !== "resolved" && status !== "refunded") {
  console.error(`✗ market did not settle (status=${status})`);
  process.exit(1);
}
