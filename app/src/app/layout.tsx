import type { Metadata } from "next";
import { Anybody, Hanken_Grotesk, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { SolanaProviders } from "@/components/WalletProvider";
import { AppShell } from "@/components/AppShell";

const anybody = Anybody({ subsets: ["latin"], variable: "--font-anybody", display: "swap" });
const hanken = Hanken_Grotesk({ subsets: ["latin"], variable: "--font-hanken", display: "swap" });
const jetbrains = JetBrains_Mono({ subsets: ["latin"], variable: "--font-jetbrains", display: "swap" });

export const metadata: Metadata = {
  title: "VERDICT — Verifiable World Cup Markets",
  description:
    "Pari-mutuel World Cup prediction markets on Solana, settled against TxODDS' on-chain Merkle-verified scores.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className={`${anybody.variable} ${hanken.variable} ${jetbrains.variable} bg-background text-on-surface font-body-md pitch-pattern`}>
        <SolanaProviders>
          <AppShell>{children}</AppShell>
        </SolanaProviders>
      </body>
    </html>
  );
}
