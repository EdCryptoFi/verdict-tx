"use client";

import dynamic from "next/dynamic";

/** The real wallet-adapter connect button (client-only). Styled via globals.css overrides. */
export const WalletButton = dynamic(
  () => import("@solana/wallet-adapter-react-ui").then((m) => m.WalletMultiButton),
  { ssr: false, loading: () => <span className="inline-block h-10 w-[150px] bg-primary-container/20 animate-pulse" /> }
);
