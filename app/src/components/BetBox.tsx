"use client";

import { useCallback, useEffect, useState } from "react";
import { PublicKey } from "@solana/web3.js";
import { useWallet } from "@solana/wallet-adapter-react";
import type { MarketLive } from "@verdict/shared";
import { useProgram, USDC_MINT, USDC_DECIMALS } from "@/lib/program";
import { placeBet, claim, fetchPosition, type PositionView } from "@/lib/actions";

const UNIT = 10 ** USDC_DECIMALS;

/**
 * The market's "Victory Odds" grid doubles as the bet selector: click an outcome, enter an
 * amount, place a real on-chain bet. Shows the connected wallet's position and a claim button
 * once the market is settled.
 */
export function BetBox({ m }: { m: MarketLive }) {
  const program = useProgram();
  const { publicKey } = useWallet();
  const [selected, setSelected] = useState<number | null>(null);
  const [amount, setAmount] = useState("10");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [position, setPosition] = useState<PositionView | null>(null);

  const resolved = m.winningOutcome !== undefined;
  const mint = USDC_MINT ? new PublicKey(USDC_MINT) : null;

  const refresh = useCallback(async () => {
    if (!program || !publicKey) return setPosition(null);
    try {
      setPosition(await fetchPosition(program, m.fixtureId, publicKey));
    } catch {
      setPosition(null);
    }
  }, [program, publicKey, m.fixtureId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const onBet = async () => {
    if (!program || selected === null || !mint) return;
    setBusy(true);
    setMsg(null);
    try {
      const base = Math.round(parseFloat(amount) * UNIT);
      const sig = await placeBet(program, m.fixtureId, selected, base, mint);
      setMsg(`✅ bet placed · ${sig.slice(0, 8)}…`);
      setSelected(null);
      await refresh();
    } catch (e: any) {
      setMsg(`⚠ ${e.message ?? e}`);
    } finally {
      setBusy(false);
    }
  };

  const onClaim = async () => {
    if (!program || !mint) return;
    setBusy(true);
    setMsg(null);
    try {
      const sig = await claim(program, m.fixtureId, mint);
      setMsg(`🏆 claimed · ${sig.slice(0, 8)}…`);
      await refresh();
    } catch (e: any) {
      setMsg(`⚠ ${e.message ?? e}`);
    } finally {
      setBusy(false);
    }
  };

  const myStakes = position?.stakePerOutcome ?? [];
  const hasWinningStake = resolved && (myStakes[m.winningOutcome!] ?? 0) > 0;

  return (
    <div className="px-6 pb-4 relative z-10">
      <h4 className="font-label-caps text-[10px] text-on-surface-variant mb-3 uppercase tracking-widest">
        Victory Odds
      </h4>

      {/* Outcome / odds selector */}
      <div className="grid grid-cols-3 gap-2">
        {m.outcomes.map((o, i) => {
          const isSel = selected === i;
          const won = m.winningOutcome === i;
          return (
            <button
              key={o.label}
              onClick={() => !resolved && setSelected(isSel ? null : i)}
              disabled={resolved}
              className="group flex flex-col items-center p-3 border bg-background/50 transition-all disabled:cursor-default"
              style={{
                borderColor: won
                  ? "var(--color-primary-fixed-dim)"
                  : isSel
                    ? "var(--color-primary-container)"
                    : "var(--color-metallic-gray)",
                background: won
                  ? "rgba(0,230,57,0.08)"
                  : isSel
                    ? "rgba(0,255,65,0.08)"
                    : "rgba(19,19,19,0.5)",
                boxShadow: isSel ? "0 0 12px rgba(0,255,65,0.25)" : "none",
              }}
            >
              <span className="font-label-caps text-[9px] text-on-surface-variant mb-1 uppercase">
                {o.label.toUpperCase()} {won && "🏆"}
              </span>
              <span className="font-data-numeric text-primary-container text-headline-lg-mobile group-hover:scale-110 transition-transform italic">
                {o.odds.toFixed(2)}x
              </span>
            </button>
          );
        })}
      </div>

      {/* Position readout */}
      {myStakes.some((s) => s > 0) && (
        <div className="mt-3 text-[10px] text-on-surface-variant font-label-caps uppercase tracking-wide">
          Your stake:{" "}
          {m.outcomes
            .map((o, i) => (myStakes[i] > 0 ? `${(myStakes[i] / UNIT).toLocaleString()} ${o.label}` : null))
            .filter(Boolean)
            .join(" · ")}
          {position?.claimed && " · claimed ✓"}
        </div>
      )}

      {/* Action row */}
      <div className="mt-3">
        {!publicKey ? (
          <p className="text-center text-[10px] text-on-surface-variant font-label-caps uppercase tracking-widest">
            Connect wallet to predict
          </p>
        ) : resolved ? (
          hasWinningStake && !position?.claimed ? (
            <button
              onClick={onClaim}
              disabled={busy}
              className="w-full py-3 bg-primary-fixed-dim text-on-primary-fixed font-label-caps text-label-caps font-black uppercase italic disabled:opacity-50"
            >
              {busy ? "…" : "🏆 Claim winnings"}
            </button>
          ) : (
            <p className="text-center text-[10px] text-on-surface-variant font-label-caps uppercase tracking-widest">
              {position?.claimed ? "settled ✓" : "market settled"}
            </p>
          )
        ) : (
          <div className="flex gap-2">
            <input
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              inputMode="decimal"
              className="tnum w-full border border-metallic-gray bg-background/60 px-3 py-2 text-sm text-on-surface font-data-numeric focus:outline-none focus:border-secondary-container"
              placeholder="USDC"
            />
            <button
              onClick={onBet}
              disabled={busy || selected === null}
              className="px-5 py-2 bg-primary-container text-on-primary-container font-label-caps text-label-caps font-black uppercase disabled:opacity-40 active:scale-95 transition-transform"
            >
              {busy ? "…" : "Bet"}
            </button>
          </div>
        )}
      </div>

      {msg && <p className="mt-2 break-words text-[10px] text-on-surface-variant font-label-caps">{msg}</p>}
    </div>
  );
}
