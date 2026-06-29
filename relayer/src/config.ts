import "dotenv/config";
import { Connection, Keypair } from "@solana/web3.js";
import { readFileSync } from "node:fs";

export const config = {
  cluster: process.env.SOLANA_CLUSTER ?? "devnet",
  rpcUrl: process.env.SOLANA_RPC_URL ?? "https://api.devnet.solana.com",
  txodds: {
    base: process.env.TXODDS_API_BASE ?? "https://txline.txodds.com",
    apiKey: process.env.TXODDS_API_KEY ?? "",
    jwt: process.env.TXODDS_JWT ?? "",
    /** When true (or when creds are missing), the client serves recorded mock data. */
    mock: process.env.TXODDS_MOCK === "1" || !process.env.TXODDS_API_KEY,
  },
  usdcMint: process.env.USDC_MINT ?? "",
};

export function connection(): Connection {
  return new Connection(config.rpcUrl, "confirmed");
}

export function loadKeypair(path: string): Keypair {
  const secret = JSON.parse(readFileSync(path.replace("~", process.env.HOME ?? ""), "utf8"));
  return Keypair.fromSecretKey(Uint8Array.from(secret));
}

export function adminKeypair(): Keypair {
  return loadKeypair(process.env.ADMIN_KEYPAIR ?? "./keypairs/admin.json");
}
