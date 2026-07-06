/**
 * GOLDEN TEST: call the REAL TxODDS `validate_stat` (view) on devnet with a REAL score Merkle
 * proof, proving our arg mapping + the on-chain verification work end-to-end.
 *
 * Usage: goldenTest.ts <fixtureId> <seq>   (defaults: Mexico v England 18192996 770)
 */
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import {
  PublicKey,
  ComputeBudgetProgram,
  Keypair,
  TransactionMessage,
  VersionedTransaction,
} from "@solana/web3.js";
import { AnchorProvider, Program, Wallet, BN } from "@coral-xyz/anchor";
import { connection, adminKeypair } from "../config.js";
import { txodds } from "../txoddsData.js";

const TXODDS = new PublicKey("6pW64gN1s2uqjHkn1unFeEjAwJkPGHoppGvS715wyP2J");
const idl = JSON.parse(readFileSync(fileURLToPath(new URL("../../../deps/txodds-idl.json", import.meta.url)), "utf8"));

const fixtureId = Number(process.argv[2] ?? 18192996);
const seq = Number(process.argv[3] ?? 770);

const provider = new AnchorProvider(connection(), new Wallet(Keypair.generate()), { commitment: "confirmed" });
const program = new Program(idl as any, provider);

const v: any = await txodds.statValidation({ fixtureId, seq, statKey: 1, statKey2: 2 });
const home = v.statToProve.value;
const away = v.statToProve2.value;
console.log(`fixture ${fixtureId} seq ${seq}: HOME ${home} - ${away} AWAY (period ${v.statToProve.period})`);

// The batch timestamp used for both the PDA seed and the `ts` arg is the summary's minTimestamp.
const targetTs = Number(v.summary.updateStats.minTimestamp);
const epochDay = Math.floor(targetTs / (24 * 60 * 60 * 1000));
const buf = Buffer.alloc(2);
buf.writeUInt16LE(epochDay, 0);
const [dailyScoresRoots] = PublicKey.findProgramAddressSync([Buffer.from("daily_scores_roots"), buf], TXODDS);
const acctInfo = await connection().getAccountInfo(dailyScoresRoots);
console.log(`epochDay=${epochDay} dailyScoresRoots=${dailyScoresRoots.toBase58()} exists=${!!acctInfo} owner=${acctInfo?.owner.toBase58()} size=${acctInfo?.data.length}`);

const proofNodes = (arr: any[]) => arr.map((n) => ({ hash: n.hash, isRightSibling: n.isRightSibling }));
const statTerm = (stat: any, proof: any[]) => ({
  statToProve: { key: stat.key, value: stat.value, period: stat.period },
  eventStatRoot: v.eventStatRoot,
  statProof: proofNodes(proof),
});
const fixtureSummary = {
  fixtureId: new BN(v.summary.fixtureId),
  updateStats: {
    updateCount: v.summary.updateStats.updateCount,
    minTimestamp: new BN(v.summary.updateStats.minTimestamp),
    maxTimestamp: new BN(v.summary.updateStats.maxTimestamp),
  },
  eventsSubTreeRoot: v.summary.eventStatsSubTreeRoot,
};

async function check(label: string, comparison: any, expect: boolean) {
  const ix = await (program.methods as any)
    .validateStat(
      new BN(targetTs),
      fixtureSummary,
      proofNodes(v.subTreeProof),
      proofNodes(v.mainTreeProof),
      { threshold: 0, comparison },
      statTerm(v.statToProve, v.statProof),
      statTerm(v.statToProve2, v.statProof2),
      { subtract: {} }
    )
    .accountsPartial({ dailyScoresMerkleRoots: dailyScoresRoots })
    .instruction();

  const payer = adminKeypair();
  const { blockhash } = await connection().getLatestBlockhash();
  const msg = new TransactionMessage({
    payerKey: payer.publicKey,
    recentBlockhash: blockhash,
    instructions: [ComputeBudgetProgram.setComputeUnitLimit({ units: 1_000_000 }), ix],
  }).compileToV0Message();
  const tx = new VersionedTransaction(msg);

  const sim = await connection().simulateTransaction(tx, { sigVerify: false, replaceRecentBlockhash: true });
  const rd = sim.value.returnData;
  let result: boolean | null = null;
  if (rd?.data?.[0]) result = Buffer.from(rd.data[0], "base64")[0] === 1;
  if (sim.value.err) {
    console.log(`  ⚠ ${label}: err=${JSON.stringify(sim.value.err)}`);
    console.log("    logs:", (sim.value.logs ?? []).slice(-5).join(" | "));
  } else {
    const ok = result === expect;
    console.log(`  ${ok ? "✅" : "❌"} ${label} → ${result} (expected ${expect})`);
  }
}

console.log("\nvalidate_stat (real TxODDS program, real Merkle proof):");
const winnerIsAway = home < away;
const winnerIsHome = home > away;
const draw = home === away;
await check("Home wins", { greaterThan: {} }, winnerIsHome);
await check("Draw", { equalTo: {} }, draw);
await check("Away wins", { lessThan: {} }, winnerIsAway);
