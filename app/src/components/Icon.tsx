/** Inline SVG icons (lucide-style, currentColor) — no external icon font dependency. */
import type { SVGProps } from "react";

const paths: Record<string, React.ReactNode> = {
  search: (
    <>
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.3-4.3" />
    </>
  ),
  globe: (
    <>
      <circle cx="12" cy="12" r="10" />
      <path d="M2 12h20M12 2a15 15 0 0 1 0 20a15 15 0 0 1 0-20" />
    </>
  ),
  live: (
    <>
      <path d="M4.9 19.1a10 10 0 0 1 0-14.2M7.8 16.2a6 6 0 0 1 0-8.4M16.2 7.8a6 6 0 0 1 0 8.4M19.1 4.9a10 10 0 0 1 0 14.2" />
      <circle cx="12" cy="12" r="1.5" />
    </>
  ),
  bracket: (
    <>
      <path d="M3 5h4v6h4M3 19h4v-6M21 12h-6" />
      <rect x="15" y="9" width="6" height="6" rx="1" />
    </>
  ),
  chart: (
    <>
      <path d="M3 3v18h18" />
      <rect x="7" y="12" width="3" height="6" />
      <rect x="12" y="8" width="3" height="10" />
      <rect x="17" y="5" width="3" height="13" />
    </>
  ),
  flag: (
    <>
      <path d="M5 3v18M5 4h14l-3 4 3 4H5" />
    </>
  ),
  user: (
    <>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21a8 8 0 0 1 16 0" />
    </>
  ),
  users: (
    <>
      <circle cx="9" cy="8" r="3.5" />
      <path d="M2.5 20a6.5 6.5 0 0 1 13 0M16 5.5a3.5 3.5 0 0 1 0 5M17 20a6.5 6.5 0 0 0-2-4.7" />
    </>
  ),
  doc: (
    <>
      <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" />
      <path d="M14 3v5h5M9 13h6M9 17h6" />
    </>
  ),
  timer: (
    <>
      <circle cx="12" cy="13" r="8" />
      <path d="M12 13V9M9 2h6" />
    </>
  ),
  verified: (
    <>
      <path d="m9 12 2 2 4-4" />
      <path d="M12 2 4 5v6c0 5 3.4 8.5 8 11 4.6-2.5 8-6 8-11V5z" />
    </>
  ),
  wallet: (
    <>
      <path d="M3 7a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <path d="M16 12h4M16 12a1.5 1.5 0 1 0 0-.01" />
    </>
  ),
  chevronRight: <path d="m9 6 6 6-6 6" />,
  arrowRight: (
    <>
      <path d="M5 12h14" />
      <path d="m13 6 6 6-6 6" />
    </>
  ),
  download: (
    <>
      <path d="M12 3v12" />
      <path d="m7 11 5 5 5-5" />
      <path d="M4 20h16" />
    </>
  ),
  lock: (
    <>
      <rect x="4" y="10" width="16" height="10" rx="2" />
      <path d="M8 10V7a4 4 0 0 1 8 0v3" />
    </>
  ),
  scale: (
    <>
      <path d="M12 3v18M7 7h10" />
      <path d="m4 12 3-5 3 5a3 3 0 0 1-6 0zM14 12l3-5 3 5a3 3 0 0 1-6 0z" />
    </>
  ),
  discord: (
    <>
      <path d="M8.5 9.5a9 9 0 0 1 7 0M7 17c-1.5-3-2-6 .5-9.5A12 12 0 0 1 12 6c1.6 0 3.2.2 4.5 1.5C19 11 18.5 14 17 17c-1 .8-2.3 1.3-3.5 1.5l-.7-1.3M7 17c1 .8 2.3 1.3 3.5 1.5l.7-1.3" />
      <circle cx="9.5" cy="13" r="1" />
      <circle cx="14.5" cy="13" r="1" />
    </>
  ),
  x: <path d="M4 4l16 16M20 4 4 20" />,
  telegram: <path d="M21 4 3 11l5 2 2 6 3-4 5 3z" />,
};

export function Icon({ name, size = 18, ...props }: { name: keyof typeof paths | string; size?: number } & SVGProps<SVGSVGElement>) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      {...props}
    >
      {paths[name] ?? <circle cx="12" cy="12" r="2" />}
    </svg>
  );
}
