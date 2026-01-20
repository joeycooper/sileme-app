import { Sparkline, SparklineBoundary } from "../components/Sparkline";

type TrendSectionProps = {
  days: number;
  onDaysChange: (next: number) => void;
  mockEnabled: boolean;
  onMockToggle: (next: boolean) => void;
  showMockToggle: boolean;
  showLoading: boolean;
  trendReady: boolean;
  sleepValues: number[];
  energyValues: number[];
  moodValues: number[];
};

export default function TrendSection({
  days,
  onDaysChange,
  mockEnabled,
  onMockToggle,
  showMockToggle,
  showLoading,
  trendReady,
  sleepValues,
  energyValues,
  moodValues
}: TrendSectionProps) {
  return (
    <section className="card card-trend">
      <div className="form-header header-row">
        <div>
          <h2>趋势图</h2>
          <p>最近 {days} 天睡眠、精力与心情曲线概览</p>
        </div>
        <div className="trend-range" role="group" aria-label="趋势天数">
          {[14, 30, 90].map((value) => (
            <button
              key={value}
              type="button"
              className={`range-pill ${days === value ? "active" : ""}`}
              onClick={() => onDaysChange(value)}
            >
              {value} 天
            </button>
          ))}
        </div>
      </div>
      {showMockToggle ? (
        <label className="mock-toggle">
          <input
            type="checkbox"
            checked={mockEnabled}
            onChange={(event) => onMockToggle(event.target.checked)}
            name="mock_data"
          />
          <span>模拟数据</span>
        </label>
      ) : null}
      <div className="trend-grid">
        <div className="trend-item">
          <span>睡眠</span>
          {showLoading ? (
            <span>加载中...</span>
          ) : !trendReady ? (
            <span className="muted">数据不足</span>
          ) : (
            <SparklineBoundary>
              <Sparkline
                values={sleepValues}
                min={0}
                max={12}
                baseline={8}
                baselineLabel="8小时"
                className="sparkline-sleep"
              />
            </SparklineBoundary>
          )}
        </div>
        <div className="trend-item">
          <span>精力</span>
          {showLoading ? (
            <span>加载中...</span>
          ) : !trendReady ? (
            <span className="muted">数据不足</span>
          ) : (
            <SparklineBoundary>
              <Sparkline values={energyValues} min={1} max={5} className="sparkline-energy" />
            </SparklineBoundary>
          )}
        </div>
        <div className="trend-item">
          <span>心情</span>
          {showLoading ? (
            <span>加载中...</span>
          ) : !trendReady ? (
            <span className="muted">数据不足</span>
          ) : (
            <SparklineBoundary>
              <Sparkline values={moodValues} min={1} max={5} className="sparkline-mood" />
            </SparklineBoundary>
          )}
        </div>
      </div>
      {trendReady ? (
        <div className="trend-legend">
          <span>
            <i className="legend-dot legend-energy" aria-hidden="true" />
            精力
          </span>
          <span>
            <i className="legend-dot legend-mood" aria-hidden="true" />
            心情
          </span>
          <span>
            <i className="legend-dot legend-sleep" aria-hidden="true" />
            睡眠
          </span>
        </div>
      ) : null}
    </section>
  );
}
