import type { SVGProps } from "react";

type P = SVGProps<SVGSVGElement>;

const base = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.5,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  viewBox: "0 0 24 24",
};

export const WaveIcon = (p: P) => (
  <svg {...base} {...p}>
    <path d="M3 12h1.5M7 8v8M11 4.5v15M15 8v8M19 11v2M21 12h.5" />
  </svg>
);

export const SparkIcon = (p: P) => (
  <svg {...base} {...p}>
    <path d="M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9L12 3Z" />
    <path d="M18.5 15.5l.8 2.2 2.2.8-2.2.8-.8 2.2-.8-2.2-2.2-.8 2.2-.8.8-2.2Z" />
  </svg>
);

export const BoltIcon = (p: P) => (
  <svg {...base} {...p}>
    <path d="M13 2 4.5 13.5H11l-1 8.5 8.5-11.5H12l1-8.5Z" />
  </svg>
);

export const GlobeIcon = (p: P) => (
  <svg {...base} {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="M3.5 9h17M3.5 15h17M12 3c2.6 2.6 3.9 5.7 3.9 9S14.6 18.4 12 21c-2.6-2.6-3.9-5.7-3.9-9S9.4 5.6 12 3Z" />
  </svg>
);

export const KeyIcon = (p: P) => (
  <svg {...base} {...p}>
    <circle cx="8" cy="14" r="4" />
    <path d="M11 11.5 20 3M17 6l2.5 2.5M15 8l2 2" />
  </svg>
);

export const ShieldIcon = (p: P) => (
  <svg {...base} {...p}>
    <path d="M12 3 5 6v6c0 4.2 2.9 7.7 7 9 4.1-1.3 7-4.8 7-9V6l-7-3Z" />
    <path d="m9.2 12.2 2 2 3.6-3.8" />
  </svg>
);

export const CodeIcon = (p: P) => (
  <svg {...base} {...p}>
    <path d="m8.5 8-4 4 4 4M15.5 8l4 4-4 4M13.5 5l-3 14" />
  </svg>
);

export const PlayIcon = (p: P) => (
  <svg {...base} {...p}>
    <path d="M8 5.5v13l11-6.5-11-6.5Z" />
  </svg>
);

export const DownloadIcon = (p: P) => (
  <svg {...base} {...p}>
    <path d="M12 3v12m0 0 4.5-4.5M12 15l-4.5-4.5M4 19h16" />
  </svg>
);

export const HeartIcon = (p: P) => (
  <svg {...base} {...p}>
    <path d="M12 20s-7-4.3-7-9.2A4 4 0 0 1 12 8a4 4 0 0 1 7 2.8C19 15.7 12 20 12 20Z" />
  </svg>
);

export const ChartIcon = (p: P) => (
  <svg {...base} {...p}>
    <path d="M4 20V4M4 20h16M8 17V11M12.5 17V7M17 17v-4" />
  </svg>
);

export const GithubIcon = (p: P) => (
  <svg {...base} {...p}>
    <path d="M9 19c-4 1.2-4-2.2-5.5-2.8M15 21v-3.4c0-1 .3-1.7.9-2.2-3-.3-6-1.5-6-6.2A4.8 4.8 0 0 1 11 5.8a4.4 4.4 0 0 1 .1-3.3s1-.3 3.3 1.2a11 11 0 0 1 6 0C22.7 2.2 23.7 2.5 23.7 2.5a4.4 4.4 0 0 1 .1 3.3 4.8 4.8 0 0 1 1.1 3.4" />
  </svg>
);

export const LogoMark = (p: P) => (
  <svg viewBox="0 0 40 40" fill="none" {...p}>
    <defs>
      <linearGradient id="lvGrad" x1="0" y1="0" x2="40" y2="40">
        <stop offset="0%" stopColor="#4fd8e0" />
        <stop offset="55%" stopColor="#6f8dff" />
        <stop offset="100%" stopColor="#e46bff" />
      </linearGradient>
    </defs>
    <rect x="1.5" y="1.5" width="37" height="37" rx="12" stroke="url(#lvGrad)" strokeWidth="1.6" />
    <g stroke="url(#lvGrad)" strokeWidth="2.4" strokeLinecap="round">
      <path d="M11 16v8M16 12v16M21 15v10M26 18v4M31 20h0" />
    </g>
  </svg>
);
