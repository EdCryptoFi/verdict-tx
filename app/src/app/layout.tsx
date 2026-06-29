import type { Metadata } from "next";
import "./globals.css";
import { SolanaProviders } from "@/components/WalletProvider";

export const metadata: Metadata = {
  title: "PitchMarket — Verifiable World Cup Markets",
  description:
    "Pari-mutuel World Cup prediction markets on Solana, settled against TxODDS' on-chain Merkle-verified scores.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <SolanaProviders>{children}</SolanaProviders>
      </body>
    </html>
  );
}
