/** Health-check: on-chain markets + live TxODDS API. Usage: pnpm --filter @verdict/relayer exec tsx src/scripts/verify.ts */
import { getProgram } from "../program.js";
import { adminKeypair, connection } from "../config.js";
import { marketPda, MarketKind } from "@verdict/shared";
import { txodds, hasCreds } from "../txoddsData.js";

const program = getProgram(adminKeypair());

console.log("── on-chain markets (devnet) ──");
for (const f of [18192996, 18198205, 900001]) {
  const [m] = marketPda(BigInt(f), MarketKind.FullTime1X2);
  try {
    const a: any = await program.account.market.fetch(m);
    const pools = (a.poolPerOutcome as any[]).slice(0, a.numOutcomes).map((x) => x.toNumber() / 1e6);
    console.log(`  ✓ ${f}: status=${Object.keys(a.status)[0]} total=${a.totalPool.toNumber() / 1e6} USDC pools=[${pools}] win=${a.winningOutcome}`);
  } catch {
    console.log(`  · ${f}: (no market)`);
  }
}

console.log("\n── TxODDS live API ──");
if (!hasCreds) {
  console.log("  ⚠ no creds in relayer/.env — run `pnpm --filter @verdict/relayer subscribe`");
} else {
  try {
    const raw: any = await txodds.fixturesSnapshot();
    const list: any[] = Array.isArray(raw) ? raw : raw.fixtures ?? [];
    const wc = list.filter((x) => x.Competition === "World Cup");
    console.log(`  ✓ fixtures snapshot: ${list.length} total, ${wc.length} World Cup`);
    if (wc[0]) console.log(`    e.g. ${wc[0].FixtureId} ${wc[0].Participant1} v ${wc[0].Participant2}`);
    // Try a real score proof for the finished Mexico v England match.
    const v: any = await txodds.statValidation({ fixtureId: 18192996, seq: 770, statKey: 1, statKey2: 2 });
    console.log(`  ✓ stat-validation: home ${v.statToProve.value} - ${v.statToProve2?.value} away (period ${v.statToProve.period}), proofs ok`);
  } catch (e: any) {
    console.log(`  ⚠ TxODDS error: ${e.message?.slice(0, 120)}`);
  }
}

console.log(`\n── RPC ── ${(await connection().getVersion())["solana-core"]} @ devnet`);
