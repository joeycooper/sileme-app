import { Summary } from "../../../services/api";
import { formatDate } from "../utils";

type HeatmapData = {
  cells: Array<Summary["items"][number] | null>;
  totalWeeks: number;
  monthLabels: Array<{ label: string; index: number }>;
};

type HeatmapSectionProps = {
  heatmapData: HeatmapData | null;
  heatmapRef: React.RefObject<HTMLDivElement>;
};

export default function HeatmapSection({ heatmapData, heatmapRef }: HeatmapSectionProps) {
  return (
    <section className="card">
      <div className="form-header">
        <h2>热力图</h2>
        <p>最近 180 天打卡情况</p>
      </div>
      <div className="heatmap" role="img" aria-label="最近 180 天打卡热力图">
        {!heatmapData ? (
          <span className="muted">暂无热力图数据</span>
        ) : (
          <>
            <div className="heatmap-scroll" ref={heatmapRef}>
              <div
                className="heatmap-month-labels"
                style={{
                  gridTemplateColumns: `repeat(${heatmapData.totalWeeks}, var(--heatmap-cell))`
                }}
              >
                {heatmapData.monthLabels.map((item) => (
                  <span
                    key={`${item.label}-${item.index}`}
                    className="heatmap-label"
                    style={{ gridColumnStart: item.index + 1 }}
                  >
                    {item.label}
                  </span>
                ))}
              </div>
              <div
                className="heatmap-grid"
                style={{
                  gridTemplateColumns: `repeat(${heatmapData.totalWeeks}, var(--heatmap-cell))`
                }}
              >
                {heatmapData.cells.map((item, idx) => {
                  if (!item) {
                    return <span key={`empty-${idx}`} className="heatmap-cell empty" />;
                  }
                  return (
                    <span
                      key={`${item.date}-${idx}`}
                      className={`heatmap-cell ${item.checked_in ? "hit" : "miss"}`}
                      title={`${formatDate(item.date)} · ${item.checked_in ? "已打卡" : "未打卡"}`}
                    />
                  );
                })}
              </div>
            </div>
            <div className="heatmap-legend">
              <span className="legend-item">
                <span className="legend-swatch miss" />
                未打卡
              </span>
              <span className="legend-item">
                <span className="legend-swatch hit" />
                已打卡
              </span>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
