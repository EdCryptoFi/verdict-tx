"use client";

import { useEffect, useState } from "react";
import { animate } from "framer-motion";

/** Count-up animated number (Framer Motion). Animates on mount. */
export function VolumeStat({ value, prefix = "", className = "" }: { value: number; prefix?: string; className?: string }) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    const controls = animate(0, value, { duration: 1.4, ease: "easeOut", onUpdate: (v) => setDisplay(v) });
    return () => controls.stop();
  }, [value]);
  return (
    <span className={`tnum ${className}`}>
      {prefix}
      {Math.round(display).toLocaleString()}
    </span>
  );
}
