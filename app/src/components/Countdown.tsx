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
  const closing = remaining <= 60;

  let label: string;
  if (remaining === 0) label = "betting closed";
  else if (remaining >= 86400) label = `⏳ closes in ${Math.floor(remaining / 86400)}d ${Math.floor((remaining % 86400) / 3600)}h`;
  else if (remaining >= 3600) label = `⏳ closes in ${Math.floor(remaining / 3600)}h ${Math.floor((remaining % 3600) / 60)}m`;
  else {
    const mm = String(Math.floor(remaining / 60)).padStart(2, "0");
    const ss = String(remaining % 60).padStart(2, "0");
    label = `⏳ closes in ${mm}:${ss}`;
  }

  return (
    <span
      className="tnum text-sm font-medium font-data-numeric italic"
      style={{ color: closing ? "var(--color-danger-red)" : "var(--color-primary-container)" }}
    >
      {label}
    </span>
  );
}
