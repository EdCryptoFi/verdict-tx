/**
 * Canonical oracle-signing helpers shared by the relayer and tests.
 *
 * The on-chain program (`ed25519.rs::resolution_message`) expects EXACTLY this message layout:
 *   utf8("PITCHMKT:v1") ++ u64_le(matchId) ++ u8(kind) ++ u8(winningOutcome)
 */
import { Ed25519Program, TransactionInstruction } from "@solana/web3.js";
import nacl from "tweetnacl";

export const MSG_PREFIX = Buffer.from("PITCHMKT:v1", "utf8");

/** Build the canonical resolution message the oracle signs. */
export function resolutionMessage(
  matchId: bigint,
  kind: number,
  winningOutcome: number
): Buffer {
  const buf = Buffer.alloc(MSG_PREFIX.length + 8 + 1 + 1);
  let o = 0;
  MSG_PREFIX.copy(buf, o);
  o += MSG_PREFIX.length;
  buf.writeBigUInt64LE(matchId, o);
  o += 8;
  buf.writeUInt8(kind & 0xff, o);
  o += 1;
  buf.writeUInt8(winningOutcome & 0xff, o);
  return buf;
}

/**
 * Build the native Ed25519Program verify instruction that proves `secretKey`'s pubkey signed
 * the resolution message. Place this as instruction #0; pass its index to `resolve`.
 */
export function buildEd25519VerifyIx(
  oracleSecretKey: Uint8Array,
  matchId: bigint,
  kind: number,
  winningOutcome: number
): TransactionInstruction {
  const message = resolutionMessage(matchId, kind, winningOutcome);
  const signature = nacl.sign.detached(message, oracleSecretKey);
  const publicKey = oracleSecretKey.slice(32, 64); // nacl secret key = seed(32) ++ pubkey(32)
  return Ed25519Program.createInstructionWithPublicKey({
    publicKey,
    message,
    signature,
  });
}

/** The 32-byte ed25519 public key from a 64-byte nacl secret key. */
export function oraclePubkey(oracleSecretKey: Uint8Array): Uint8Array {
  return oracleSecretKey.slice(32, 64);
}
