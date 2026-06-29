import { PublicKey } from "@solana/web3.js";
import { BN } from "@coral-xyz/anchor";
import idlJson from "../idl/pitchmarket.json" assert { type: "json" };
export type { Pitchmarket } from "./pitchmarket-idl.js";

export const pitchmarketIdl = idlJson;

/** PitchMarket program id (devnet). */
export const PROGRAM_ID = new PublicKey(
  "Bw3Ztg8nPBRxVLLtNqCksQNEP4cbv64xbpzr6YHrX7a7"
);

/** TxODDS `txoracle` program id (devnet). */
export const TXODDS_PROGRAM_ID = new PublicKey(
  "6pW64gN1s2uqjHkn1unFeEjAwJkPGHoppGvS715wyP2J"
);

// ---- Enums (must match the Rust u8 encodings in PredicateSpec) ----
export const Comparison = { GreaterThan: 0, LessThan: 1, EqualTo: 2 } as const;
export const BinaryOp = { Add: 0, Subtract: 1 } as const;

export const MarketKind = { FullTime1X2: 0, OverUnder: 1 } as const;
/** Canonical outcome order for a 1X2 market. */
export const Outcome1X2 = { Home: 0, Draw: 1, Away: 2 } as const;

export interface PredicateSpec {
  statAKey: number;
  statBKey: number;
  period: number;
  useStatB: boolean;
  op: number; // BinaryOp
  threshold: number;
  comparison: number; // Comparison
}

/**
 * Build the three per-outcome predicates for a 1X2 full-time market.
 * Each is `(homeGoals - awayGoals) <cmp> 0`:
 *   Home → GreaterThan, Draw → EqualTo, Away → LessThan.
 */
export function build1X2Predicates(
  homeGoalsStatKey: number,
  awayGoalsStatKey: number,
  period: number
): PredicateSpec[] {
  const base = {
    statAKey: homeGoalsStatKey,
    statBKey: awayGoalsStatKey,
    period,
    useStatB: true,
    op: BinaryOp.Subtract,
    threshold: 0,
  };
  return [
    { ...base, comparison: Comparison.GreaterThan }, // Home
    { ...base, comparison: Comparison.EqualTo }, // Draw
    { ...base, comparison: Comparison.LessThan }, // Away
  ];
}

// ---- PDA helpers ----
export function marketPda(matchId: bigint | number, kind: number): [PublicKey, number] {
  const matchIdBuf = new BN(matchId.toString()).toArrayLike(Buffer, "le", 8);
  return PublicKey.findProgramAddressSync(
    [Buffer.from("market"), matchIdBuf, Buffer.from([kind])],
    PROGRAM_ID
  );
}

export function vaultPda(market: PublicKey): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [Buffer.from("vault"), market.toBuffer()],
    PROGRAM_ID
  );
}

export function positionPda(market: PublicKey, bettor: PublicKey): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [Buffer.from("position"), market.toBuffer(), bettor.toBuffer()],
    PROGRAM_ID
  );
}

/**
 * TxODDS daily-scores Merkle-roots PDA for a given timestamp.
 * epochDay = floor(tsMillis / 86_400_000), encoded as a 2-byte LE buffer.
 */
export function dailyScoresRootsPda(tsMillis: number): [PublicKey, number] {
  const epochDay = Math.floor(tsMillis / (24 * 60 * 60 * 1000));
  const buf = Buffer.alloc(2);
  buf.writeUInt16LE(epochDay, 0);
  return PublicKey.findProgramAddressSync(
    [Buffer.from("daily_scores_roots"), buf],
    TXODDS_PROGRAM_ID
  );
}

// ---- TxODDS stat-validation → resolve args ----
export interface ApiProofNode {
  hash: string | number[]; // base64/hex string or byte array from the API
  isRightSibling: boolean;
}
export interface ApiStatTerm {
  statToProve: { key: number; value: number; period: number };
  eventStatRoot: string | number[];
  statProof: ApiProofNode[];
}

export function bytesFrom(v: string | number[]): number[] {
  if (Array.isArray(v)) return v;
  // assume base64 (TxODDS returns binary as base64)
  return Array.from(Buffer.from(v, "base64"));
}

export function mapProof(nodes: ApiProofNode[]) {
  return nodes.map((n) => ({
    hash: bytesFrom(n.hash),
    isRightSibling: n.isRightSibling,
  }));
}

export function mapStatTerm(s: ApiStatTerm) {
  return {
    statToProve: s.statToProve,
    eventStatRoot: bytesFrom(s.eventStatRoot),
    statProof: mapProof(s.statProof),
  };
}
