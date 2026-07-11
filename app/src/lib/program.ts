"use client";

import { useMemo } from "react";
import { AnchorProvider, Program } from "@coral-xyz/anchor";
import { PublicKey, type Connection } from "@solana/web3.js";
import { useConnection, useAnchorWallet } from "@solana/wallet-adapter-react";
import { pitchmarketIdl, type Pitchmarket } from "@verdict/shared";

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

/**
 * Read-only Program for fetching market state without a wallet. Reading accounts only touches
 * provider.connection, so a stub wallet is enough — any attempt to sign throws by design.
 */
export function readonlyProgram(connection: Connection): Program<Pitchmarket> {
  const stub = {
    publicKey: PublicKey.default,
    signTransaction: () => Promise.reject(new Error("read-only provider")),
    signAllTransactions: () => Promise.reject(new Error("read-only provider")),
  };
  const provider = new AnchorProvider(connection, stub as never, { commitment: "confirmed" });
  return new Program<Pitchmarket>(pitchmarketIdl as Pitchmarket, provider);
}

/**
 * The test settlement mint (USDC-like) and its decimals. Defaults to the deployed devnet test
 * mint so the hosted demo works out of the box; override via env for other deployments.
 */
export const USDC_MINT =
  process.env.NEXT_PUBLIC_USDC_MINT ?? "7SHsjDmsmVxHcDrur7VHHSGRzbsE1LCQWQPbFTz21maT";
export const USDC_DECIMALS = Number(process.env.NEXT_PUBLIC_USDC_DECIMALS ?? 6);
