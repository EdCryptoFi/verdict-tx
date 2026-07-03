"use client";

import { Program, BN } from "@coral-xyz/anchor";
import { PublicKey, ComputeBudgetProgram } from "@solana/web3.js";
import {
  TOKEN_PROGRAM_ID,
  getAssociatedTokenAddressSync,
  createAssociatedTokenAccountInstruction,
  getAccount,
} from "@solana/spl-token";
import {
  type Pitchmarket,
  MarketKind,
  marketPda,
  vaultPda,
  positionPda,
} from "@verdict/shared";

const KIND = MarketKind.FullTime1X2;

export interface PositionView {
  stakePerOutcome: number[];
  claimed: boolean;
}

export async function fetchPosition(
  program: Program<Pitchmarket>,
  fixtureId: number,
  owner: PublicKey
): Promise<PositionView | null> {
  const [market] = marketPda(BigInt(fixtureId), KIND);
  const [position] = positionPda(market, owner);
  try {
    const p = await program.account.position.fetch(position);
    return {
      stakePerOutcome: (p.stakePerOutcome as BN[]).map((n) => n.toNumber()),
      claimed: p.claimed as boolean,
    };
  } catch {
    return null; // no position yet
  }
}

/** Place a bet on an outcome. `amountBase` is in token base units (already scaled by decimals). */
export async function placeBet(
  program: Program<Pitchmarket>,
  fixtureId: number,
  outcome: number,
  amountBase: number,
  mint: PublicKey
): Promise<string> {
  const owner = program.provider.publicKey!;
  const [market] = marketPda(BigInt(fixtureId), KIND);
  const [position] = positionPda(market, owner);
  const [vault] = vaultPda(market);
  const bettorAta = getAssociatedTokenAddressSync(mint, owner);

  const preIx = [];
  // Create the bettor's token account if missing (first-time users).
  try {
    await getAccount(program.provider.connection, bettorAta);
  } catch {
    preIx.push(createAssociatedTokenAccountInstruction(owner, bettorAta, owner, mint));
  }

  return program.methods
    .placeBet(outcome, new BN(amountBase))
    .accountsPartial({
      bettor: owner,
      market,
      position,
      vault,
      bettorTokenAccount: bettorAta,
      tokenProgram: TOKEN_PROGRAM_ID,
    })
    .preInstructions(preIx)
    .rpc();
}

/** Claim a winning position. */
export async function claim(
  program: Program<Pitchmarket>,
  fixtureId: number,
  mint: PublicKey
): Promise<string> {
  const owner = program.provider.publicKey!;
  const [market] = marketPda(BigInt(fixtureId), KIND);
  const [position] = positionPda(market, owner);
  const [vault] = vaultPda(market);
  const bettorAta = getAssociatedTokenAddressSync(mint, owner);

  return program.methods
    .claim()
    .accountsPartial({
      bettor: owner,
      market,
      position,
      vault,
      bettorTokenAccount: bettorAta,
      tokenProgram: TOKEN_PROGRAM_ID,
    })
    .rpc();
}
