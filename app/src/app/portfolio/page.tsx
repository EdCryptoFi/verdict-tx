"use client";

import { useCallback, useEffect, useState } from "react";
import { PublicKey } from "@solana/web3.js";
import { useWallet } from "@solana/wallet-adapter-react";
import type { MarketLive } from "@verdict/shared";
import { useProgram, USDC_MINT, USDC_DECIMALS } from "@/lib/program";
import { fetchPosition, claim, type PositionView } from "@/lib/actions";
import { DEMO_MARKETS } from "@/lib/demoMarkets";

const UNIT = 10 ** USDC_DECIMALS;

interface Wager {
  market: MarketLive;
  outcome: number;
  stake: number;
  claimed: boolean;
}

function Stat({ label, value, accent }: { label: string; value: string; accent?: string }) {
  return (
    <div className="border-l-2 pl-4 py-2" style={{ borderColor: accent ?? "var(--color-metallic-gray)" }}>
      <div className="font-data-numeric text-headline-lg-mobile italic" style={{ color: accent ?? "var(--color-on-surface)" }}>{value}</div>
      <div className="font-label-caps text-[10px] text-on-surface-variant uppercase tracking-widest mt-1">{label}</div>
    </div>
  );
}

export default function PortfolioPage() {
  const program = useProgram();
  const { publicKey } = useWallet();
  const [wagers, setWagers] = useState<Wager[]>([]);
  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState<number | null>(null);
  const mint = USDC_MINT ? new PublicKey(USDC_MINT) : null;

  const load = useCallback(async () => {
    if (!program || !publicKey) return;
    setLoading(true);
    const out: Wager[] = [];
    for (const market of DEMO_MARKETS) {
      const p: PositionView | null = await fetchPosition(program, market.fixtureId, publicKey);
      if (!p) continue;
      p.stakePerOutcome.forEach((s, outcome) => {
        if (s > 0) out.push({ market, outcome, stake: s / UNIT, claimed: p.claimed });
      });
    }
    setWagers(out);
    setLoading(false);
  }, [program, publicKey]);

  useEffect(() => {
    load();
  }, [load]);

  const onClaim = async (w: Wager) => {
    if (!program || !mint) return;
    setBusy(w.market.fixtureId);
    try {
      await claim(program, w.market.fixtureId, mint);
      await load();
    } finally {
      setBusy(null);
    }
  };

  const totalStaked = wagers.reduce((a, w) => a + w.stake, 0);
  const settled = wagers.filter((w) => w.market.winningOutcome !== undefined);
  const won = settled.filter((w) => w.market.winningOutcome === w.outcome);
  const winRate = settled.length ? Math.round((won.length / settled.length) * 100) : 0;

  return (
    <main className="pt-16 lg:pl-64 pb-24 lg:pb-0 min-h-screen px-margin-mobile md:px-margin-desktop py-10">
      <div className="flex items-end justify-between mb-8">
        <div>
          <h1 className="font-display-hero text-headline-lg italic uppercase text-primary-container">Portfolio</h1>
          <p className="font-body-md text-on-surface-variant">Your on-chain World Cup positions</p>
        </div>
        {publicKey && (
          <span className="font-data-numeric text-[11px] text-on-surface-variant">{publicKey.toBase58().slice(0, 4)}…{publicKey.toBase58().slice(-4)}</span>
        )}
      </div>

      {!publicKey ? (
        <div className="border border-metallic-gray bg-surface-container-low p-12 text-center">
          <p className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-widest">Connect a wallet to view your positions</p>
        </div>
      ) : (
        <>
          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-10 border border-metallic-gray bg-surface-container-low p-6">
            <Stat label="Total staked (USDC)" value={totalStaked.toLocaleString()} accent="var(--color-primary-container)" />
            <Stat label="Active wagers" value={String(wagers.length)} accent="var(--color-electric-cyan)" />
            <Stat label="Settled" value={String(settled.length)} />
            <Stat label="Win rate" value={settled.length ? `${winRate}%` : "—"} accent="var(--color-primary-fixed-dim)" />
          </div>

          {/* Wagers */}
          <h2 className="font-headline-lg-mobile italic uppercase mb-4">Active WC Wagers</h2>
          {loading ? (
            <p className="text-on-surface-variant text-sm">Loading positions…</p>
          ) : wagers.length === 0 ? (
            <div className="border border-metallic-gray bg-surface-container-low p-10 text-center">
              <p className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-widest mb-3">No positions yet</p>
              <a href="/" className="inline-block bg-primary-container text-on-primary-container px-6 py-3 font-label-caps text-label-caps font-black uppercase">Browse markets</a>
            </div>
          ) : (
            <div className="space-y-4">
              {wagers.map((w, i) => {
                const settledMkt = w.market.winningOutcome !== undefined;
                const isWin = settledMkt && w.market.winningOutcome === w.outcome;
                const odds = w.market.outcomes[w.outcome]?.odds ?? 1;
                return (
                  <div key={i} className="border border-metallic-gray bg-surface-container-low relative overflow-hidden">
                    <div className="h-0.5 w-full bg-gradient-to-r from-secondary-container via-primary-container to-electric-cyan" />
                    <div className="p-5 flex flex-col md:flex-row md:items-center gap-4">
                      <div className="flex items-center gap-3 flex-1">
                        <span className="text-2xl">{w.market.homeFlag}</span>
                        <div>
                          <div className="font-label-caps text-label-caps uppercase">{w.market.home} v {w.market.away}</div>
                          <div className="text-[10px] text-on-surface-variant uppercase">
                            Your pick: {w.market.outcomes[w.outcome].label} · {odds.toFixed(2)}x
                          </div>
                        </div>
                        <span className="text-2xl">{w.market.awayFlag}</span>
                      </div>
                      <div className="text-right">
                        <div className="font-data-numeric text-primary-container italic">{w.stake.toLocaleString()} USDC</div>
                        <div className="text-[10px] text-on-surface-variant uppercase">potential ~{(w.stake * odds).toLocaleString()}</div>
                      </div>
                      <div className="md:w-40 text-right">
                        {w.claimed ? (
                          <span className="font-label-caps text-[10px] text-on-surface-variant uppercase">Claimed ✓</span>
                        ) : settledMkt && isWin ? (
                          <button onClick={() => onClaim(w)} disabled={busy === w.market.fixtureId} className="bg-primary-fixed-dim text-on-primary-fixed px-4 py-2 font-label-caps text-[10px] font-black uppercase disabled:opacity-50">
                            {busy === w.market.fixtureId ? "…" : "Claim winnings"}
                          </button>
                        ) : settledMkt ? (
                          <span className="font-label-caps text-[10px] text-danger-red uppercase">Settled · lost</span>
                        ) : (
                          <span className="font-label-caps text-[10px] text-primary-container uppercase italic">🔒 in play</span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </main>
  );
}
