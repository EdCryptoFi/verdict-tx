/** Read the TxODDS on-chain pricing matrix (devnet) to see if World Cup service levels are free. */
import { readFileSync } from "node:fs";
import { PublicKey } from "@solana/web3.js";
import { AnchorProvider, Program, Wallet } from "@coral-xyz/anchor";
import { Keypair } from "@solana/web3.js";
import { connection } from "../config.js";

const idl = JSON.parse(readFileSync(new URL("../../../deps/txodds-idl.json", import.meta.url), "utf8"));
const programId = new PublicKey("6pW64gN1s2uqjHkn1unFeEjAwJkPGHoppGvS715wyP2J");

const provider = new AnchorProvider(connection(), new Wallet(Keypair.generate()), { commitment: "confirmed" });
const program = new Program(idl as any, provider);

const [pricingMatrixPda] = PublicKey.findProgramAddressSync([Buffer.from("pricing_matrix")], programId);
console.log("pricing_matrix PDA:", pricingMatrixPda.toBase58());

const pm: any = await (program.account as any).pricingMatrix.fetch(pricingMatrixPda);
console.log("admin:", pm.admin.toBase58());
console.log("rows:");
for (const r of pm.rows) {
  console.log(
    `  row_id=${r.rowId}  price/week=${r.pricePerWeekToken.toString()}  sampling=${r.samplingIntervalSec}s  league_bundle=${r.leagueBundleId}  market_bundle=${r.marketBundleId}`
  );
}
