"use client";

import { useEffect, useState } from "react";

export function Countdown({ closeTs }: { closeTs: number }) {
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => {
    setNow(Date.now());
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  if (now === null) {
    return (
      <span className="tnum text-sm font-medium text-on-surface-variant italic radical-velocity-italic">
        ⏳ closes soon
      </span>
    );
  }

  const remaining = Math.max(0, Math.floor((closeTs - now) / 1000));
  const mm = String(Math.floor(remaining / 60)).padStart(2, "0");
  const ss = String(remaining % 60).padStart(2, "0");
  const closing = remaining <= 60;

  return (
    <span
      className="tnum text-sm font-medium font-data-numeric italic"
      style={{ color: closing ? "var(--color-danger-red)" : "var(--color-primary-container)" }}
    >
      {remaining === 0 ? "betting closed" : `⏳ closes in ${mm}:${ss}`}
    </span>
  );
}
