/**
 * Mint test USDC to any wallet, so hackathon users can try betting.
 * Usage: tsx src/scripts/faucet.ts <recipientPubkey> [amount]
 */
import { PublicKey } from "@solana/web3.js";
import { mintTo, getOrCreateAssociatedTokenAccount } from "@solana/spl-token";
import { connection, adminKeypair, config } from "../config.js";

const recipient = new PublicKey(process.argv[2]!);
const amount = Number(process.argv[3] ?? 1000);
const DECIMALS = Number(process.env.NEXT_PUBLIC_USDC_DECIMALS ?? 6);

if (!config.usdcMint) throw new Error("Set USDC_MINT in .env");

const conn = connection();
const admin = adminKeypair();
const mint = new PublicKey(config.usdcMint);

const ata = await getOrCreateAssociatedTokenAccount(conn, admin, mint, recipient);
await mintTo(conn, admin, mint, ata.address, admin, amount * 10 ** DECIMALS);
console.log(`✅ minted ${amount} USDC to ${recipient.toBase58()}`);
