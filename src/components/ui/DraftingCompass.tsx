export default function DraftingCompass({ className = '' }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 320 320"
      fill="none"
      aria-hidden="true"
    >
      <circle cx="160" cy="160" r="148" className="stroke-forge-500/40 dark:stroke-cyan-400/30" strokeWidth="1" />
      <circle cx="160" cy="160" r="118" className="stroke-forge-600/50 dark:stroke-cyan-300/35" strokeWidth="1" />
      <circle cx="160" cy="160" r="78" className="stroke-forge-700/40 dark:stroke-cyan-200/25" strokeWidth="1" />
      <g className="origin-center animate-compass motion-reduce:animate-none">
        {Array.from({ length: 72 }, (_, i) => {
          const angle = (i * 5 * Math.PI) / 180;
          const inner = i % 6 === 0 ? 132 : 140;
          const x1 = 160 + Math.cos(angle) * inner;
          const y1 = 160 + Math.sin(angle) * inner;
          const x2 = 160 + Math.cos(angle) * 148;
          const y2 = 160 + Math.sin(angle) * 148;
          return (
            <line
              key={i}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              className={i % 6 === 0 ? 'stroke-forge-700 dark:stroke-cyan-200' : 'stroke-forge-500/50 dark:stroke-cyan-400/40'}
              strokeWidth={i % 18 === 0 ? 2 : 1}
            />
          );
        })}
      </g>
      <path d="M160 28 L166 52 L160 46 L154 52 Z" className="fill-forge-700 dark:fill-cyan-200" />
      <text x="160" y="24" textAnchor="middle" className="fill-forge-800 dark:fill-cyan-100" fontSize="11" fontFamily="ui-monospace, monospace">
        N
      </text>
      <circle cx="160" cy="160" r="8" className="fill-forge-600 dark:fill-cyan-300" />
      <circle cx="160" cy="160" r="3" className="fill-paper-50 dark:fill-surface-950" />
    </svg>
  );
}
