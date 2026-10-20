/**
 * Abstract, hand-built SVG concept illustrations used as showcase visuals.
 * They are decorative previews, not generated model output.
 */

type ArtProps = { className?: string; hue?: "dusk" | "dawn" | "sage" };

const SKY: Record<NonNullable<ArtProps["hue"]>, [string, string]> = {
  dusk: ["#1d2033", "#121212"],
  dawn: ["#2a2420", "#131313"],
  sage: ["#1b2622", "#121212"],
};

export function ArchitectureArt({ className, hue = "dusk" }: ArtProps) {
  const [top, bottom] = SKY[hue];
  const id = `arch-${hue}`;
  return (
    <svg viewBox="0 0 600 420" preserveAspectRatio="xMidYMid slice" className={className} aria-hidden>
      <defs>
        <linearGradient id={`${id}-sky`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={top} />
          <stop offset="1" stopColor={bottom} />
        </linearGradient>
        <linearGradient id={`${id}-face`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#3a3a3a" />
          <stop offset="1" stopColor="#222" />
        </linearGradient>
        <linearGradient id={`${id}-side`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#2a2a2a" />
          <stop offset="1" stopColor="#1a1a1a" />
        </linearGradient>
        <linearGradient id={`${id}-glass`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#c9d0ff" stopOpacity="0.85" />
          <stop offset="1" stopColor="#e2c9a6" stopOpacity="0.55" />
        </linearGradient>
        <radialGradient id={`${id}-sun`} cx="0.78" cy="0.22" r="0.4">
          <stop offset="0" stopColor="#b4beff" stopOpacity="0.35" />
          <stop offset="1" stopColor="#b4beff" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="600" height="420" fill={`url(#${id}-sky)`} />
      <rect width="600" height="420" fill={`url(#${id}-sun)`} />
      <path d="M0 330 Q150 300 300 318 T600 300 V420 H0Z" fill="#161616" />
      {/* Cantilevered house */}
      <path d="M140 300 L140 205 L330 185 L330 280Z" fill={`url(#${id}-face)`} />
      <path d="M330 185 L420 205 L420 300 L330 280Z" fill={`url(#${id}-side)`} />
      <path d="M110 205 L330 180 L470 205 L250 230Z" fill="#454545" />
      <path d="M180 170 L360 150 L470 170 L290 192Z" fill="#3c3c3c" />
      <path d="M200 192 L350 175 L350 140 L200 158Z" fill={`url(#${id}-face)`} />
      <path d="M215 188 L335 175 L335 150 L215 163Z" fill={`url(#${id}-glass)`} opacity="0.75" />
      <path d="M160 288 L310 272 L310 215 L160 230Z" fill={`url(#${id}-glass)`} opacity="0.9" />
      <path d="M235 280 L235 222" stroke="#1a1a1a" strokeWidth="2" />
      <path d="M345 278 L405 290 L405 228 L345 214Z" fill={`url(#${id}-glass)`} opacity="0.45" />
      {/* Pool reflection */}
      <path d="M120 320 L360 302 L470 318 L230 338Z" fill="#a5b1ff" opacity="0.14" />
      <path d="M160 322 L330 309" stroke="#c9d0ff" strokeOpacity="0.35" strokeWidth="1.5" strokeLinecap="round" />
      {/* Trees */}
      <circle cx="500" cy="270" r="34" fill="#1f2a25" />
      <circle cx="528" cy="286" r="24" fill="#24312b" />
      <circle cx="92" cy="286" r="26" fill="#1f2a25" />
    </svg>
  );
}

export function InteriorArt({ className, hue = "dawn" }: ArtProps) {
  const [top, bottom] = SKY[hue];
  const id = `int-${hue}`;
  return (
    <svg viewBox="0 0 600 420" preserveAspectRatio="xMidYMid slice" className={className} aria-hidden>
      <defs>
        <linearGradient id={`${id}-wall`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={top} />
          <stop offset="1" stopColor={bottom} />
        </linearGradient>
        <linearGradient id={`${id}-floor`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#2a2622" />
          <stop offset="1" stopColor="#161514" />
        </linearGradient>
        <linearGradient id={`${id}-window`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#e2c9a6" stopOpacity="0.55" />
          <stop offset="1" stopColor="#a5b1ff" stopOpacity="0.25" />
        </linearGradient>
        <linearGradient id={`${id}-light`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#e2c9a6" stopOpacity="0.22" />
          <stop offset="1" stopColor="#e2c9a6" stopOpacity="0" />
        </linearGradient>
      </defs>
      <rect width="600" height="420" fill={`url(#${id}-wall)`} />
      <path d="M0 290 H600 V420 H0Z" fill={`url(#${id}-floor)`} />
      <rect x="360" y="60" width="180" height="210" rx="14" fill={`url(#${id}-window)`} />
      <path d="M450 60 V270 M360 165 H540" stroke="#131313" strokeOpacity="0.6" strokeWidth="3" />
      <path d="M360 270 L540 270 L430 420 L180 420Z" fill={`url(#${id}-light)`} />
      {/* Sofa */}
      <rect x="70" y="232" width="250" height="62" rx="22" fill="#3a3632" />
      <rect x="82" y="200" width="226" height="50" rx="20" fill="#47423d" />
      <rect x="62" y="226" width="34" height="72" rx="15" fill="#433e39" />
      <rect x="296" y="226" width="34" height="72" rx="15" fill="#433e39" />
      <rect x="120" y="212" width="58" height="34" rx="12" fill="#a9cdbd" opacity="0.55" />
      {/* Coffee table */}
      <ellipse cx="230" cy="338" rx="82" ry="18" fill="#2c2926" />
      <ellipse cx="230" cy="332" rx="82" ry="18" fill="#3b3733" />
      <circle cx="214" cy="326" r="8" fill="#e2c9a6" opacity="0.7" />
      {/* Pendant lamp */}
      <path d="M230 0 V108" stroke="#5c5c58" strokeWidth="1.5" />
      <path d="M200 132 Q230 96 260 132Z" fill="#d9c3a2" />
      <ellipse cx="230" cy="134" rx="30" ry="5" fill="#f3e2c5" opacity="0.8" />
      <circle cx="230" cy="150" r="70" fill="#e2c9a6" opacity="0.06" />
      {/* Plant */}
      <rect x="520" y="300" width="36" height="44" rx="10" fill="#3a3632" />
      <path d="M538 300 C520 260 500 250 496 228 M538 300 C548 256 572 246 580 226 M538 300 C536 262 540 240 538 212" stroke="#7fa898" strokeWidth="6" strokeLinecap="round" fill="none" opacity="0.8" />
      {/* Art */}
      <rect x="120" y="86" width="120" height="78" rx="10" fill="#1f1f1f" stroke="#3a3a3a" />
      <path d="M134 150 L172 112 L196 134 L210 122 L228 150Z" fill="#a5b1ff" opacity="0.35" />
    </svg>
  );
}

export function InfrastructureArt({ className, hue = "sage" }: ArtProps) {
  const [top, bottom] = SKY[hue];
  const id = `inf-${hue}`;
  return (
    <svg viewBox="0 0 600 420" preserveAspectRatio="xMidYMid slice" className={className} aria-hidden>
      <defs>
        <linearGradient id={`${id}-ground`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={top} />
          <stop offset="1" stopColor={bottom} />
        </linearGradient>
        <linearGradient id={`${id}-road`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#2b2b2b" />
          <stop offset="1" stopColor="#222" />
        </linearGradient>
      </defs>
      <rect width="600" height="420" fill={`url(#${id}-ground)`} />
      {/* Site grid */}
      <g stroke="#ffffff" strokeOpacity="0.035">
        {Array.from({ length: 16 }).map((_, i) => (
          <path key={`v${i}`} d={`M${i * 40} 0 V420`} />
        ))}
        {Array.from({ length: 11 }).map((_, i) => (
          <path key={`h${i}`} d={`M0 ${i * 40} H600`} />
        ))}
      </g>
      {/* River */}
      <path d="M-20 360 C120 320 180 380 320 340 S520 300 640 330 V420 H-20Z" fill="#a5b1ff" opacity="0.12" />
      {/* Roads */}
      <path d="M0 230 C160 220 260 160 600 150" stroke={`url(#${id}-road)`} strokeWidth="34" fill="none" />
      <path d="M0 230 C160 220 260 160 600 150" stroke="#e2c9a6" strokeOpacity="0.35" strokeWidth="1.5" strokeDasharray="10 12" fill="none" />
      <path d="M300 0 C290 120 330 240 300 420" stroke={`url(#${id}-road)`} strokeWidth="28" fill="none" />
      <path d="M300 0 C290 120 330 240 300 420" stroke="#e2c9a6" strokeOpacity="0.3" strokeWidth="1.5" strokeDasharray="10 12" fill="none" />
      {/* Roundabout */}
      <circle cx="306" cy="190" r="34" fill="#262626" />
      <circle cx="306" cy="190" r="18" fill="#2f3d36" />
      {/* Bridge */}
      <path d="M260 340 L360 330" stroke="#3a3a3a" strokeWidth="14" strokeLinecap="round" />
      <path d="M270 330 Q310 300 352 322" stroke="#a9cdbd" strokeOpacity="0.5" strokeWidth="2" fill="none" />
      {/* Blocks */}
      {[
        [60, 90, 70, 60],
        [150, 70, 80, 90],
        [380, 60, 70, 60],
        [470, 40, 90, 70],
        [380, 200, 90, 70],
        [490, 210, 70, 60],
        [70, 260, 90, 50],
      ].map(([x, y, w, h], i) => (
        <g key={i}>
          <rect x={x + 6} y={y + 8} width={w} height={h} rx="10" fill="#000" opacity="0.3" />
          <rect x={x} y={y} width={w} height={h} rx="10" fill={i % 3 === 0 ? "#34413b" : "#2e2e2e"} stroke="#ffffff" strokeOpacity="0.05" />
        </g>
      ))}
      {/* Parks */}
      <circle cx="200" cy="300" r="22" fill="#a9cdbd" opacity="0.25" />
      <circle cx="540" cy="110" r="16" fill="#a9cdbd" opacity="0.22" />
      {/* Survey markers */}
      <circle cx="420" cy="170" r="5" fill="#b4beff" />
      <circle cx="420" cy="170" r="14" fill="#b4beff" opacity="0.18" />
      <circle cx="150" cy="215" r="5" fill="#e2c9a6" />
      <circle cx="150" cy="215" r="14" fill="#e2c9a6" opacity="0.16" />
    </svg>
  );
}
