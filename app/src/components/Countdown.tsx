"use client";

import { useEffect, useState } from "react";

/** ⏳ Betting-closes-in countdown. Turns danger-red under 60s. The FOMO driver. */
export function Countdown({ closeTs }: { closeTs: number }) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const remaining = Math.max(0, Math.floor((closeTs - now) / 1000));
  const mm = String(Math.floor(remaining / 60)).padStart(2, "0");
  const ss = String(remaining % 60).padStart(2, "0");
  const closing = remaining <= 60;

  return (
    <span
      className="tnum text-sm font-medium"
      style={{ color: closing ? "var(--color-danger)" : "var(--color-muted)" }}
    >
      {remaining === 0 ? "betting closed" : `⏳ closes in ${mm}:${ss}`}
    </span>
  );
}
