/**
 * Self-serve TxODDS TxLINE credentialing for the World Cup FREE tier (no payment, no support).
 *
 * Flow (per https://txline.txodds.com/documentation/worldcup):
 *   1. POST /auth/guest/start                         → guest JWT
 *   2. subscribe(service_level_id=1, weeks) on-chain  → txSig (free: pricing row 1 = 0/week)
 *   3. sign `${txSig}:${leagues}:${jwt}` (ed25519)    → walletSignature (base64)
 *   4. POST /api/token/activate                       → long-lived apiToken
 *
 * Data calls then send `Authorization: Bearer <jwt>` + `X-Api-Token: <apiToken>`.
 */
import { readFileSync } from "node:fs";
import nacl from "tweetnacl";
import { Keypair, PublicKey, SystemProgram } from "@solana/web3.js";
import { AnchorProvider, Program, Wallet } from "@coral-xyz/anchor";
import {
  TOKEN_2022_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID,
  getAssociatedTokenAddressSync,
  getAccount,
  createAssociatedTokenAccountInstruction,
} from "@solana/spl-token";
import { connection } from "./config.js";

// DevNet off-chain server is `txline-dev`; mainnet is `txline`. Must match the chain we subscribed on.
export const API_ORIGIN = process.env.TXODDS_API_ORIGIN ?? "https://txline-dev.txodds.com";
export const API_BASE = process.env.TXODDS_API_BASE ?? `${API_ORIGIN}/api`;

export const TXODDS_PROGRAM = new PublicKey("6pW64gN1s2uqjHkn1unFeEjAwJkPGHoppGvS715wyP2J");
export const TXL_MINT = new PublicKey("4Zao8ocPhmMgq7PdsYWyxvqySMGx7xb9cMftPMkEokRG");
export const SERVICE_LEVEL_ID = Number(process.env.TXODDS_SERVICE_LEVEL ?? 1); // 1 = World Cup + Int Friendlies
export const DURATION_WEEKS = Number(process.env.TXODDS_WEEKS ?? 4); // must be a multiple of 4

const idl = JSON.parse(
  readFileSync(new URL("../../deps/txodds-idl.json", import.meta.url), "utf8")
);

export interface TxoddsCreds {
  jwt: string;
  apiToken: string;
}

async function postJson(url: string, body?: unknown, headers: Record<string, string> = {}) {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...headers },
    body: body ? JSON.stringify(body) : undefined,
    redirect: "follow",
  });
  const text = await res.text();
  let json: any;
  try {
    json = JSON.parse(text);
  } catch {
    json = text;
  }
  if (!res.ok) {
    throw new Error(`POST ${url} → ${res.status}: ${text.slice(0, 400)}`);
  }
  return json;
}

export async function guestJwt(): Promise<string> {
  const r = await postJson(`${API_ORIGIN}/auth/guest/start`);
  const jwt = r.token ?? r.jwt ?? r.data?.token;
  if (!jwt) throw new Error(`guest/start returned no token: ${JSON.stringify(r)}`);
  return jwt;
}

/** Subscribe to the (free) World Cup tier on devnet. Returns the subscription tx signature. */
export async function subscribeFree(admin: Keypair): Promise<string> {
  const provider = new AnchorProvider(connection(), new Wallet(admin), { commitment: "confirmed" });
  const program = new Program(idl as any, provider);

  const [pricingMatrix] = PublicKey.findProgramAddressSync(
    [Buffer.from("pricing_matrix")],
    TXODDS_PROGRAM
  );
  const [tokenTreasuryPda] = PublicKey.findProgramAddressSync(
    [Buffer.from("token_treasury_v2")],
    TXODDS_PROGRAM
  );
  const tokenTreasuryVault = getAssociatedTokenAddressSync(
    TXL_MINT,
    tokenTreasuryPda,
    true,
    TOKEN_2022_PROGRAM_ID
  );
  const userTokenAccount = getAssociatedTokenAddressSync(
    TXL_MINT,
    admin.publicKey,
    false,
    TOKEN_2022_PROGRAM_ID
  );

  const preIx = [];
  try {
    await getAccount(connection(), userTokenAccount, "confirmed", TOKEN_2022_PROGRAM_ID);
  } catch {
    preIx.push(
      createAssociatedTokenAccountInstruction(
        admin.publicKey,
        userTokenAccount,
        admin.publicKey,
        TXL_MINT,
        TOKEN_2022_PROGRAM_ID
      )
    );
  }

  return (program.methods as any)
    .subscribe(SERVICE_LEVEL_ID, DURATION_WEEKS)
    .accountsPartial({
      user: admin.publicKey,
      pricingMatrix,
      tokenMint: TXL_MINT,
      userTokenAccount,
      tokenTreasuryVault,
      tokenTreasuryPda,
      tokenProgram: TOKEN_2022_PROGRAM_ID,
      associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
      systemProgram: SystemProgram.programId,
    })
    .preInstructions(preIx)
    .rpc();
}

export async function activate(
  admin: Keypair,
  txSig: string,
  jwt: string,
  leagues: number[] = []
): Promise<string> {
  const messageString = `${txSig}:${leagues.join(",")}:${jwt}`;
  const message = new TextEncoder().encode(messageString);
  const walletSignature = Buffer.from(
    nacl.sign.detached(message, admin.secretKey)
  ).toString("base64");

  const r = await postJson(
    `${API_BASE}/token/activate`,
    { txSig, walletSignature, leagues },
    { Authorization: `Bearer ${jwt}` }
  );
  const apiToken = typeof r === "string" ? r : r.token ?? r.apiToken ?? r.data?.token;
  if (!apiToken) throw new Error(`token/activate returned no token: ${JSON.stringify(r)}`);
  return apiToken;
}

/** Full flow: guest JWT → subscribe → activate. */
export async function credential(admin: Keypair, leagues: number[] = []): Promise<TxoddsCreds> {
  const jwt = await guestJwt();
  const txSig = await subscribeFree(admin);
  const apiToken = await activate(admin, txSig, jwt, leagues);
  return { jwt, apiToken };
}
