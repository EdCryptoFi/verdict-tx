/** Fetch a real score Merkle proof and print its shape. Usage: statProof.ts <fixtureId> <seq> [statKey] [statKey2] */
import { txodds, hasCreds } from "../txoddsData.js";

if (!hasCreds) throw new Error("No creds — run subscribe first");

const fixtureId = Number(process.argv[2]);
const seq = Number(process.argv[3]);
const statKey = Number(process.argv[4] ?? 1);
const statKey2 = process.argv[5] ? Number(process.argv[5]) : undefined;

console.log(`stat-validation fixture=${fixtureId} seq=${seq} statKey=${statKey} statKey2=${statKey2}`);
const v: any = await txodds.statValidation({ fixtureId, seq, statKey, statKey2 });

console.log("statToProve:", JSON.stringify(v.statToProve));
console.log("statToProve2:", JSON.stringify(v.statToProve2));
console.log("summary:", JSON.stringify(v.summary));
console.log("ts:", v.ts);
console.log("proof lengths:", {
  statProof: v.statProof?.length,
  subTreeProof: v.subTreeProof?.length,
  mainTreeProof: v.mainTreeProof?.length,
  statProof2: v.statProof2?.length,
});
console.log("\nfull keys:", Object.keys(v));
console.log("statProof[0]:", JSON.stringify(v.statProof?.[0]));
console.log("subTreeProof[0]:", JSON.stringify(v.subTreeProof?.[0]));
console.log("eventStatRoot:", JSON.stringify(v.eventStatRoot)?.slice(0, 90));
