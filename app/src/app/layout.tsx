import type { Metadata } from "next";
import { Anybody, Hanken_Grotesk, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { SolanaProviders } from "@/components/WalletProvider";

const anybody = Anybody({
  subsets: ["latin"],
  variable: "--font-anybody",
  display: "swap",
});

const hanken = Hanken_Grotesk({
  subsets: ["latin"],
  variable: "--font-hanken",
  display: "swap",
});

const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
  display: "swap",
});

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
          {/* Top navigation */}
          <nav className="fixed top-0 w-full z-50 flex justify-between items-center px-margin-mobile md:px-margin-desktop h-16 bg-background/80 backdrop-blur-md border-b border-metallic-gray shadow-[0_0_15px_rgba(0,255,65,0.1)]">
            <div className="flex items-center gap-3">
              <span className="font-display-hero text-headline-lg-mobile md:text-headline-lg italic text-primary-fixed-dim tracking-tighter">
                VERDICT
              </span>
              <span className="hidden sm:inline font-label-caps text-[10px] text-on-surface-variant uppercase tracking-widest">
                World Cup
              </span>
            </div>
            <span className="font-label-caps text-[10px] text-on-surface-variant italic uppercase tracking-widest">
              Settled on-chain via TxODDS
            </span>
          </nav>

          {/* Main content */}
          {children}

          {/* Footer */}
          <footer className="w-full py-8 px-margin-mobile md:px-margin-desktop flex flex-col md:flex-row justify-between items-center gap-4 text-center border-t border-metallic-gray bg-surface-container-lowest">
            <div className="flex flex-col md:items-start gap-1">
              <span className="font-display-hero text-headline-lg-mobile italic text-primary-fixed-dim">VERDICT</span>
              <p className="font-label-caps text-[10px] text-on-tertiary-fixed-variant tracking-widest uppercase">
                © 2026 Verdict · FIFA World Cup Edition · Solana devnet
              </p>
            </div>
            <p className="font-label-caps text-[10px] text-on-tertiary-fixed-variant tracking-widest uppercase">
              Verifiable settlement · powered by TxODDS
            </p>
          </footer>
        </SolanaProviders>
      </body>
    </html>
  );
}
