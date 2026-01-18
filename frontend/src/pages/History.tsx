import { useEffect, useMemo, useRef, useState } from "react";
import { Summary, getSummary } from "../services/api";

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("zh-CN", {
    month: "2-digit",
    day: "2-digit"
  });
}

function Sparkline({ values }: { values: number[] }) {
  const points = useMemo(() => {
    const max = 5;
    const min = 1;
    const stepX = 100 / Math.max(values.length - 1, 1);
    return values.map((v, i) => {
      const val = Math.min(Math.max(v, min), max);
      const x = i * stepX;
      const y = 100 - ((val - min) / (max - min)) * 100;
      return { x, y };
    });
  }, [values]);

  if (values.length === 0) {
    return <span className="muted">暂无趋势数据</span>;
  }

  return (
    <svg viewBox="0 0 100 100" className="sparkline" aria-hidden="true">
      <polyline
        points={points.map((p) => `${p.x},${p.y}`).join(" ")}
        fill="none"
        stroke="currentColor"
        strokeWidth="4"
      />
      {points.map((p, idx) => (
        <circle key={idx} cx={p.x} cy={p.y} r="4" fill="currentColor" />
      ))}
    </svg>
  );
}

// Device management removed from UI per request.

export default function History() {
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const noticeTimer = useRef<number | null>(null);

  useEffect(() => {
    void refresh();
    return () => {
      if (noticeTimer.current) {
        window.clearTimeout(noticeTimer.current);
      }
    };
  }, []);

  function setNoticeWithAutoClear(message: string) {
    setNotice(message);
    if (noticeTimer.current) {
      window.clearTimeout(noticeTimer.current);
    }
    noticeTimer.current = window.setTimeout(() => {
      setNotice(null);
      noticeTimer.current = null;
    }, 2000);
  }

  async function refresh() {
    setLoading(true);
    setError(null);
    try {
      const [summaryRes] = await Promise.all([getSummary(14)]);
      setSummary(summaryRes);
    } catch (err) {
      setError(err instanceof Error ? err.message : "加载失败");
    } finally {
      setLoading(false);
    }
  }


  const filteredItems = summary?.items.filter((item) => item.checked_in) ?? [];
  const moodValues = filteredItems
    .map((item) => item.mood)
    .filter((value): value is number => value !== null && value !== undefined);
  const energyValues = filteredItems
    .map((item) => item.energy)
    .filter((value): value is number => value !== null && value !== undefined);

  return (
    <div className="page">
      {error ? <p className="error">{error}</p> : null}

      <section className="stats">
        <div className="stat-card">
          <span>打卡率</span>
          <strong>{summary ? `${Math.round(summary.checkin_rate * 100)}%` : "-"}</strong>
        </div>
        <div className="stat-card">
          <span>平均精力</span>
          <strong>{summary ? summary.avg_energy : "-"}</strong>
        </div>
        <div className="stat-card">
          <span>平均心情</span>
          <strong>{summary ? summary.avg_mood : "-"}</strong>
        </div>
      </section>

      <section className="card">
        <div className="form-header">
          <h2>趋势</h2>
          <p>精力与心情的 14 天折线概览。</p>
        </div>
        <div className="trend-grid">
          <div className="trend-item">
            <span>精力</span>
            {loading ? <span>加载中...</span> : <Sparkline values={energyValues} />}
          </div>
          <div className="trend-item">
            <span>心情</span>
            {loading ? <span>加载中...</span> : <Sparkline values={moodValues} />}
          </div>
        </div>
      </section>

      <section className="card">
        <div className="form-header">
          <h2>最近打卡</h2>
          <p>按日期查看最近 14 天记录。</p>
        </div>
        <div className="export-row">
          <button
            className="secondary"
            type="button"
            onClick={() => setNoticeWithAutoClear("导出功能将在下一版本支持。")}
          >
            导出 CSV
          </button>
          {notice ? <span className="inline-notice">{notice}</span> : null}
        </div>
        <div className="history-list">
          {filteredItems.length === 0 ? (
            <p className="muted">还没有打卡记录。</p>
          ) : (
            filteredItems
              .slice()
              .reverse()
              .map((item) => (
            <div key={item.date} className={`history-row ${item.checked_in ? "hit" : "miss"}`}>
              <span>{formatDate(item.date)}</span>
              <span>{item.checked_in ? "✅" : "—"}</span>
              <span>睡眠 {item.sleep_hours ?? "-"}h</span>
              <span>精力 {item.energy ?? "-"}</span>
              <span>心情 {item.mood ?? "-"}</span>
            </div>
              ))
          )}
        </div>
      </section>

    </div>
  );
}
