"use client";

import dynamic from "next/dynamic";
import { MarketCard, type MarketView } from "@/components/MarketCard";

// Wallet button is client-only (avoids SSR hydration issues).
const WalletButton = dynamic(
  () => import("@solana/wallet-adapter-react-ui").then((m) => m.WalletMultiButton),
  { ssr: false }
);

const DEMO: MarketView[] = [
  {
    fixtureId: 900001,
    home: "Brazil",
    away: "Argentina",
    homeFlag: "🇧🇷",
    awayFlag: "🇦🇷",
    liveScore: [2, 1],
    matchMinute: 67,
    closeTs: Date.now() + 4 * 60 * 1000 + 12 * 1000,
    poolUsdc: 12480,
    bettors: 237,
    outcomes: [
      { label: "Home", odds: 1.85 },
      { label: "Draw", odds: 3.2 },
      { label: "Away", odds: 4.1 },
    ],
    momentumHome: 0.68,
  },
  {
    fixtureId: 900002,
    home: "France",
    away: "England",
    homeFlag: "🇫🇷",
    awayFlag: "🏴",
    liveScore: [0, 0],
    matchMinute: 12,
    closeTs: Date.now() + 18 * 60 * 1000,
    poolUsdc: 5310,
    bettors: 96,
    outcomes: [
      { label: "Home", odds: 2.1 },
      { label: "Draw", odds: 2.9 },
      { label: "Away", odds: 3.4 },
    ],
    momentumHome: 0.52,
  },
];

export default function Home() {
  return (
    <main className="mx-auto max-w-5xl px-4 py-8">
      <header className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black tracking-tight">PITCHMARKET</h1>
          <p className="text-sm text-[var(--color-muted)]">
            Verifiable World Cup markets · settled on-chain by TxODDS
          </p>
        </div>
        <WalletButton />
      </header>

      <div className="grid gap-5 sm:grid-cols-2">
        {DEMO.map((m) => (
          <MarketCard key={m.fixtureId} m={m} />
        ))}
      </div>

      <footer className="mt-10 text-center text-xs text-[var(--color-muted)]">
        Demo data. Live odds & scores stream from the TxODDS API; settlement verified via
        on-chain Merkle proofs.
      </footer>
    </main>
  );
}
