import { Component, type ReactNode, useMemo } from "react";

type SparklineProps = {
  values: number[];
  min?: number;
  max?: number;
  className?: string;
  baseline?: number;
  baselineLabel?: string;
};

export function Sparkline({
  values,
  min,
  max,
  className,
  baseline,
  baselineLabel
}: SparklineProps) {
  const chartWidth = Math.max(100, values.length * 8);
  const { points, safeMin, safeMax, span } = useMemo(() => {
    if (values.length === 0) {
      return { points: [], safeMin: 0, safeMax: 1, span: 1 };
    }
    const resolvedMin = min ?? Math.min(...values);
    const resolvedMax = max ?? Math.max(...values);
    const paddedMin = min ?? resolvedMin - (resolvedMax - resolvedMin) * 0.1;
    const paddedMax = max ?? resolvedMax + (resolvedMax - resolvedMin) * 0.1;
    const safeMin = Number.isFinite(paddedMin) ? paddedMin : 0;
    const safeMax = Number.isFinite(paddedMax) ? paddedMax : 1;
    const span = safeMax === safeMin ? 1 : safeMax - safeMin;
    const stepX = chartWidth / Math.max(values.length - 1, 1);
    const points = values.map((v, i) => {
      const val = Math.min(Math.max(v, safeMin), safeMax);
      const x = i * stepX;
      const y = 100 - ((val - safeMin) / span) * 100;
      return { x, y };
    });
    return { points, safeMin, safeMax, span };
  }, [values, min, max, chartWidth]);

  if (values.length === 0) {
    return <span className="text-xs text-muted-foreground">暂无趋势数据</span>;
  }

  if (!points || points.length === 0) {
    return <span className="text-xs text-muted-foreground">暂无趋势数据</span>;
  }

  const d =
    points.length === 1
      ? `M ${points[0].x},${points[0].y}`
      : (() => {
          const tension = 0.6;
          const path = [`M ${points[0].x},${points[0].y}`];
          for (let i = 0; i < points.length - 1; i += 1) {
            const p0 = points[i - 1] ?? points[i];
            const p1 = points[i];
            const p2 = points[i + 1];
            const p3 = points[i + 2] ?? p2;
            const cp1x = p1.x + ((p2.x - p0.x) / 6) * tension;
            const cp1y = p1.y + ((p2.y - p0.y) / 6) * tension;
            const cp2x = p2.x - ((p3.x - p1.x) / 6) * tension;
            const cp2y = p2.y - ((p3.y - p1.y) / 6) * tension;
            path.push(`C ${cp1x},${cp1y} ${cp2x},${cp2y} ${p2.x},${p2.y}`);
          }
          return path.join(" ");
        })();

  const baselineY =
    baseline === undefined
      ? null
      : 100 - ((Math.min(Math.max(baseline, safeMin), safeMax) - safeMin) / span) * 100;

  return (
    <div className="w-full overflow-x-auto pb-1">
      <svg
        viewBox={`0 0 ${chartWidth} 100`}
        className={`h-20 w-full min-w-full ${className ?? ""}`}
        style={{ width: `${chartWidth}px` }}
        aria-hidden="true"
      >
        {baselineY !== null ? (
          <>
            <line
              x1="0"
              x2={chartWidth}
              y1={baselineY}
              y2={baselineY}
              className="stroke-slate-300"
              strokeWidth="2"
              strokeDasharray="4 4"
            />
            {baselineLabel ? (
              <text
                x={chartWidth - 2}
                y={Math.max(baselineY - 2, 8)}
                textAnchor="end"
                className="fill-slate-500 text-[10px] font-semibold"
              >
                {baselineLabel}
              </text>
            ) : null}
          </>
        ) : null}
        <path
          d={d}
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <polyline
          points={points.map((p) => `${p.x},${p.y}`).join(" ")}
          fill="none"
          stroke="transparent"
          strokeWidth="4"
        />
        {points.map((p, idx) => (
          <circle key={idx} cx={p.x} cy={p.y} r="3" fill="currentColor" />
        ))}
      </svg>
    </div>
  );
}

export class SparklineBoundary extends Component<{ children: ReactNode }, { hasError: boolean }> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return <span className="text-xs text-muted-foreground">趋势渲染失败</span>;
    }
    return this.props.children;
  }
}
