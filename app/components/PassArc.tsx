// A compact SVG "sky arc" for a single pass: the satellite rises from the
// horizon, climbs to its peak elevation, and sets again. The height of the arc
// reflects how high the pass gets (maxEl out of 90°). Pure SVG — no
// dependencies, no extra API calls; it just visualizes data we already have.

interface PassArcProps {
  maxEl: number; // peak elevation in degrees (0–90)
}

export default function PassArc({ maxEl }: PassArcProps) {
  const W = 220;
  const H = 54;
  const padX = 8;
  const padTop = 8;
  const padBottom = 10;
  const baseY = H - padBottom;
  const usableH = H - padTop - padBottom;

  // Fraction of the sky (0 = horizon, 1 = straight overhead at 90°).
  const elFrac = Math.min(Math.max(maxEl, 0), 90) / 90;

  // Sample a simple 0 → 1 → 0 parabola for the arc shape.
  const N = 24;
  const pts: string[] = [];
  for (let i = 0; i <= N; i++) {
    const u = i / N;
    const e = 4 * u * (1 - u);
    const x = padX + u * (W - 2 * padX);
    const y = baseY - e * elFrac * usableH;
    pts.push(`${x.toFixed(1)},${y.toFixed(1)}`);
  }
  const line = `M ${pts.join(" L ")}`;
  const area = `M ${padX},${baseY} L ${pts.join(" L ")} L ${W - padX},${baseY} Z`;
  const apexY = baseY - elFrac * usableH;

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="none"
      className="w-full h-14 my-1"
      aria-hidden="true"
    >
      {/* horizon line */}
      <line
        x1={padX}
        y1={baseY}
        x2={W - padX}
        y2={baseY}
        className="stroke-slate-700"
        strokeWidth="1"
        vectorEffect="non-scaling-stroke"
      />
      {/* faint fill under the arc */}
      <path d={area} className="fill-emerald-500/10" />
      {/* the arc itself */}
      <path
        d={line}
        fill="none"
        className="stroke-emerald-400"
        strokeWidth="1.5"
        vectorEffect="non-scaling-stroke"
      />
      {/* peak marker */}
      <circle
        cx={W / 2}
        cy={apexY}
        r="2.5"
        className="fill-emerald-300"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}
