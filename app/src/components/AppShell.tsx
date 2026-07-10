"use client";

import { Icon } from "./Icon";
import { WalletButton } from "./WalletButton";

/** Full app chrome (Radical Velocity): top nav, desktop sidebar, mobile bottom nav, footer. */
export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <>
      {/* Top nav */}
      <nav className="fixed top-0 w-full z-50 flex justify-between items-center px-margin-mobile md:px-margin-desktop h-16 bg-background/80 backdrop-blur-md border-b border-metallic-gray shadow-[0_0_15px_rgba(0,255,65,0.1)]">
        <div className="flex items-center gap-8">
          <a href="/" className="flex flex-col leading-none">
            <span className="font-display-hero text-headline-lg-mobile md:text-headline-lg italic tracking-tighter flex items-center gap-1">
              <span className="text-on-surface">VERDICT</span>
              <span className="text-primary-container border border-primary-container px-1 not-italic text-headline-lg-mobile">TX</span>
            </span>
            <span className="hidden md:block font-label-caps text-[8px] text-on-surface-variant/70 uppercase tracking-[0.2em] mt-0.5">Predict the game. Own the outcome.</span>
          </a>
          <div className="hidden md:flex gap-6 items-center">
            <a className="font-label-caps text-label-caps text-primary-container border-b-2 border-primary-container py-1 transition-all" href="/">Markets</a>
            <a className="font-label-caps text-label-caps text-on-surface-variant hover:text-primary-container transition-colors" href="/portfolio">Portfolio</a>
            <a className="font-label-caps text-label-caps text-on-surface-variant hover:text-primary-container transition-colors" href="/leaderboard">Leaderboard</a>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="hidden lg:flex items-center bg-surface-container-low px-3 py-1.5 border border-metallic-gray">
            <Icon name="search" className="text-on-surface-variant text-sm mr-2" />
            <input className="bg-transparent border-none focus:ring-0 focus:outline-none text-sm text-on-surface p-0 w-40 font-body-md" placeholder="Search matches..." />
          </div>
          <WalletButton />
        </div>
      </nav>

      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col fixed left-0 top-16 h-[calc(100vh-64px)] w-64 bg-surface-container-lowest border-r border-metallic-gray z-40 overflow-y-auto custom-scrollbar">
        <div className="p-6">
          <h3 className="font-label-caps text-label-caps text-primary tracking-widest mb-1 uppercase">Active Tournament</h3>
          <p className="text-[10px] text-on-surface-variant opacity-60 mb-6">FIFA World Cup 2026</p>
          <nav className="space-y-1">
            <a className="flex items-center gap-3 px-4 py-3 bg-primary-container text-on-primary-container font-bold italic border-r-4 border-electric-cyan hover:translate-x-1 transition-all" href="/">
              <Icon name="globe" /><span className="font-label-caps text-label-caps">FIFA World Cup</span>
            </a>
            <a className="flex items-center gap-3 px-4 py-3 text-on-surface-variant hover:bg-surface-container-high hover:text-primary-container hover:translate-x-1 transition-all" href="/#markets">
              <Icon name="live" /><span className="font-label-caps text-label-caps">Live Now</span>
            </a>
            <a className="flex items-center gap-3 px-4 py-3 text-on-surface-variant hover:bg-surface-container-high hover:text-primary-container hover:translate-x-1 transition-all" href="/portfolio">
              <Icon name="user" /><span className="font-label-caps text-label-caps">Portfolio</span>
            </a>
            <a className="flex items-center gap-3 px-4 py-3 text-on-surface-variant hover:bg-surface-container-high hover:text-primary-container hover:translate-x-1 transition-all" href="/leaderboard">
              <Icon name="chart" /><span className="font-label-caps text-label-caps">Leaderboard</span>
            </a>
            {["Tournament Bracket", "Squad Stats"].map((label, i) => (
              <span key={label} className="flex items-center gap-3 px-4 py-3 text-on-surface-variant/40 cursor-not-allowed" title="Coming soon">
                <Icon name={["bracket", "flag"][i]} />
                <span className="font-label-caps text-label-caps">{label}</span>
              </span>
            ))}
          </nav>
          <div className="mt-8 pt-8 border-t border-metallic-gray">
            <div className="w-full py-3 px-4 border border-metallic-gray/60 text-on-surface-variant/60 italic font-label-caps text-[10px] uppercase tracking-widest text-center">
              Pari-mutuel · 1% fee
            </div>
          </div>
        </div>
        <div className="mt-auto p-6 space-y-4">
          <a className="flex items-center gap-3 text-on-surface-variant hover:text-primary transition-colors" href="https://txline-docs.txodds.com" target="_blank" rel="noreferrer">
            <Icon name="doc" /><span className="font-label-caps text-label-caps">TxODDS Docs</span>
          </a>
        </div>
      </aside>

      {/* Main */}
      {children}

      {/* Footer */}
      <footer className="w-full py-8 px-margin-mobile md:px-margin-desktop flex flex-col md:flex-row justify-between items-center gap-4 text-center border-t border-metallic-gray bg-surface-container-lowest lg:pl-[calc(256px+48px)]">
        <div className="flex flex-col md:items-start gap-1">
          <span className="font-display-hero text-headline-lg-mobile italic text-primary-fixed-dim">VERDICT</span>
          <p className="font-label-caps text-[10px] text-on-tertiary-fixed-variant tracking-widest uppercase">
            © 2026 Verdict · FIFA World Cup Edition · Solana
          </p>
        </div>
        <p className="font-label-caps text-[10px] text-on-tertiary-fixed-variant tracking-widest uppercase">
          Verifiable settlement · powered by TxODDS
        </p>
      </footer>

      {/* Mobile bottom nav */}
      <nav className="lg:hidden fixed bottom-0 left-0 w-full z-50 flex justify-around items-center h-20 bg-background/95 backdrop-blur-lg border-t-2 border-primary-container shadow-[0_-4px_20px_rgba(0,255,65,0.3)]">
        <a className="flex flex-col items-center justify-center text-primary-container scale-110 transition-transform" href="/">
          <Icon name="globe" /><span className="font-label-caps text-[10px] mt-1 uppercase">World Cup</span>
        </a>
        <a className="flex flex-col items-center justify-center text-on-surface-variant opacity-70 active:scale-90 transition-transform" href="/leaderboard">
          <Icon name="chart" /><span className="font-label-caps text-[10px] mt-1 uppercase">Ranks</span>
        </a>
        <a className="flex flex-col items-center justify-center text-on-surface-variant opacity-70 active:scale-90 transition-transform" href="/#markets">
          <Icon name="live" /><span className="font-label-caps text-[10px] mt-1 uppercase">Live</span>
        </a>
        <a className="flex flex-col items-center justify-center text-on-surface-variant opacity-70 active:scale-90 transition-transform" href="/portfolio">
          <Icon name="user" /><span className="font-label-caps text-[10px] mt-1 uppercase">Portfolio</span>
        </a>
      </nav>
    </>
  );
}
