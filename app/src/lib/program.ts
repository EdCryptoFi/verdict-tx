"use client";

import { useMemo } from "react";
import { AnchorProvider, Program } from "@coral-xyz/anchor";
import { useConnection, useAnchorWallet } from "@solana/wallet-adapter-react";
import { pitchmarketIdl, type Pitchmarket } from "@pitchmarket/shared";

/** Anchor Program bound to the connected wallet (null until a wallet connects). */
export function useProgram(): Program<Pitchmarket> | null {
  const { connection } = useConnection();
  const wallet = useAnchorWallet();
  return useMemo(() => {
    if (!wallet) return null;
    const provider = new AnchorProvider(connection, wallet, { commitment: "confirmed" });
    return new Program<Pitchmarket>(pitchmarketIdl as Pitchmarket, provider);
  }, [connection, wallet]);
}

/** The test settlement mint (USDC-like) and its decimals, from env. */
export const USDC_MINT = process.env.NEXT_PUBLIC_USDC_MINT ?? "";
export const USDC_DECIMALS = Number(process.env.NEXT_PUBLIC_USDC_DECIMALS ?? 6);
