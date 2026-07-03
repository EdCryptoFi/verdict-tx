/**
 * One-time setup: create a test USDC mint, a demo 1X2 market, and fund the admin.
 * Works on localnet or devnet (uses SOLANA_RPC_URL / ADMIN_KEYPAIR from .env).
 *
 * Usage: pnpm --filter @pitchmarket/relayer exec tsx src/scripts/setup.ts [fixtureId]
 */
import { createMint, mintTo, getOrCreateAssociatedTokenAccount } from "@solana/spl-token";
import { connection, adminKeypair } from "../config.js";
import { createMarket1X2 } from "../createMarket.js";

const fixtureId = Number(process.argv[2] ?? 900001);
const DECIMALS = 6;

const conn = connection();
const admin = adminKeypair();

console.log(`admin: ${admin.publicKey.toBase58()}`);
console.log(`balance: ${(await conn.getBalance(admin.publicKey)) / 1e9} SOL`);

const mint = await createMint(conn, admin, admin.publicKey, null, DECIMALS);
console.log(`✅ USDC test mint: ${mint.toBase58()}`);

const adminAta = await getOrCreateAssociatedTokenAccount(conn, admin, mint, admin.publicKey);
await mintTo(conn, admin, mint, adminAta.address, admin, 1_000_000 * 10 ** DECIMALS);
console.log(`✅ minted 1,000,000 USDC to admin`);

const market = await createMarket1X2({
  admin,
  fixtureId,
  mint,
  bettingCloseTs: Math.floor(Date.now() / 1000) + 60 * 60,
});

console.log("\n── add to app/.env.local ──────────────────────────────");
console.log(`NEXT_PUBLIC_RPC_URL=${process.env.SOLANA_RPC_URL ?? "http://127.0.0.1:8899"}`);
console.log(`NEXT_PUBLIC_USDC_MINT=${mint.toBase58()}`);
console.log(`NEXT_PUBLIC_USDC_DECIMALS=${DECIMALS}`);
console.log(`# market: ${market.toBase58()} (fixture ${fixtureId})`);
console.log("───────────────────────────────────────────────────────");
