"use client";

import { useCallback, useEffect, useState } from "react";
import { PublicKey } from "@solana/web3.js";
import { useWallet } from "@solana/wallet-adapter-react";
import type { MarketLive } from "@verdict/shared";
import { useProgram, USDC_MINT, USDC_DECIMALS } from "@/lib/program";
import { placeBet, claim, fetchPosition, type PositionView } from "@/lib/actions";

const UNIT = 10 ** USDC_DECIMALS;

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
    setPosition(await fetchPosition(program, m.fixtureId, publicKey));
  }, [program, publicKey, m.fixtureId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  if (!publicKey) {
    return <p className="mt-3 text-center text-xs text-[var(--color-muted)]">Connect a wallet to bet</p>;
  }
  if (!mint) {
    return (
      <p className="mt-3 text-center text-xs text-[var(--color-muted)]">
        Set NEXT_PUBLIC_USDC_MINT to enable betting
      </p>
    );
  }

  const onBet = async () => {
    if (!program || selected === null) return;
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
    if (!program) return;
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
    <div className="mt-3 border-t border-white/5 pt-3">
      {/* Your position */}
      {myStakes.some((s) => s > 0) && (
        <div className="mb-2 text-xs text-[var(--color-muted)]">
          your position:{" "}
          {m.outcomes
            .map((o, i) => (myStakes[i] > 0 ? `${(myStakes[i] / UNIT).toLocaleString()} on ${o.label}` : null))
            .filter(Boolean)
            .join(" · ")}
          {position?.claimed && " · claimed ✓"}
        </div>
      )}

      {/* Claim (resolved winners) */}
      {resolved ? (
        hasWinningStake && !position?.claimed ? (
          <button
            onClick={onClaim}
            disabled={busy}
            className="w-full rounded-xl px-3 py-2 text-sm font-bold text-black disabled:opacity-50"
            style={{ background: "var(--color-gold)" }}
          >
            {busy ? "…" : "🏆 Claim winnings"}
          </button>
        ) : (
          <p className="text-center text-xs text-[var(--color-muted)]">
            {m.status === "final" ? "market settled" : "awaiting settlement"}
          </p>
        )
      ) : (
        // Betting UI
        <>
          <div className="mb-2 grid grid-cols-3 gap-2">
            {m.outcomes.map((o, i) => (
              <button
                key={o.label}
                onClick={() => setSelected(i)}
                className="rounded-lg px-2 py-1.5 text-xs font-semibold transition"
                style={{
                  border: `1px solid ${selected === i ? "var(--color-accent)" : "rgba(255,255,255,0.1)"}`,
                  background: selected === i ? "rgba(34,226,122,0.12)" : "transparent",
                }}
              >
                {o.label}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              inputMode="decimal"
              className="tnum w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm"
              placeholder="amount (USDC)"
            />
            <button
              onClick={onBet}
              disabled={busy || selected === null}
              className="rounded-lg px-4 py-2 text-sm font-bold text-black disabled:opacity-40"
              style={{ background: "var(--color-accent)" }}
            >
              {busy ? "…" : "Bet"}
            </button>
          </div>
        </>
      )}

      {msg && <p className="mt-2 break-words text-xs text-[var(--color-muted)]">{msg}</p>}
    </div>
  );
}
