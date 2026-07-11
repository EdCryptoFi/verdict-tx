import "dotenv/config";
import { Connection, Keypair } from "@solana/web3.js";
import { readFileSync } from "node:fs";

/**
 * Public devnet defaults, so the scripts (notably `sync:daily`) run with no env setup at all.
 * Both are already public: the mint is a test SPL mint we control, and the key is the Solana CLI's
 * default keypair — the same one that deployed the program. Override via env for any other setup.
 */
const DEVNET_USDC_MINT = "7SHsjDmsmVxHcDrur7VHHSGRzbsE1LCQWQPbFTz21maT";
const DEFAULT_KEYPAIR = "~/.config/solana/id.json";

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
  usdcMint: process.env.USDC_MINT || DEVNET_USDC_MINT,
};

export function connection(): Connection {
  return new Connection(config.rpcUrl, "confirmed");
}

export function loadKeypair(path: string): Keypair {
  const secret = JSON.parse(readFileSync(path.replace("~", process.env.HOME ?? ""), "utf8"));
  return Keypair.fromSecretKey(Uint8Array.from(secret));
}

/**
 * Load the admin keypair. In a serverless/cron env there is no filesystem, so prefer the inline
 * secret in ADMIN_KEYPAIR_SECRET (a JSON array of bytes, i.e. the contents of admin.json); fall
 * back to the ADMIN_KEYPAIR file path for local runs.
 */
export function adminKeypair(): Keypair {
  const inline = process.env.ADMIN_KEYPAIR_SECRET;
  if (inline) return Keypair.fromSecretKey(Uint8Array.from(JSON.parse(inline)));
  return loadKeypair(process.env.ADMIN_KEYPAIR || DEFAULT_KEYPAIR);
}
