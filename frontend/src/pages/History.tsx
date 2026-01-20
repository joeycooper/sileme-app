import { Component, type ReactNode, useEffect, useMemo, useRef, useState } from "react";
import {
  Checkin,
  CheckinPayload,
  Summary,
  getCheckins,
  getSummary,
  updateCheckin
} from "../services/api";

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("zh-CN", {
    month: "2-digit",
    day: "2-digit"
  });
}

function Sparkline({
  values,
  min,
  max,
  className,
  baseline,
  baselineLabel
}: {
  values: number[];
  min?: number;
  max?: number;
  className?: string;
  baseline?: number;
  baselineLabel?: string;
}) {
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
    return <span className="muted">暂无趋势数据</span>;
  }

  if (!points || points.length === 0) {
    return <span className="muted">暂无趋势数据</span>;
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
    <div className="sparkline-wrap">
      <svg
        viewBox={`0 0 ${chartWidth} 100`}
        className={`sparkline${className ? ` ${className}` : ""}`}
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
              className="sparkline-baseline"
            />
            {baselineLabel ? (
              <text
                x={chartWidth - 2}
                y={Math.max(baselineY - 2, 8)}
                textAnchor="end"
                className="sparkline-baseline-label"
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

class SparklineBoundary extends Component<{ children: ReactNode }, { hasError: boolean }> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return <span className="muted">趋势渲染失败</span>;
    }
    return this.props.children;
  }
}

function buildMockSummary(days: number): Summary {
  const today = new Date();
  const energyPattern = [3, 4, 5, 4, 3, 4, 5];
  const moodPattern = [2, 3, 4, 4, 3, 4, 5];
  const items: Summary["items"] = Array.from({ length: days }, (_, idx) => {
    const date = new Date(today);
    date.setDate(today.getDate() - (days - 1 - idx));
    const energy = energyPattern[idx % energyPattern.length];
    const mood = moodPattern[idx % moodPattern.length];
    return {
      date: date.toISOString(),
      checked_in: true,
      sleep_hours: 6 + (idx % 3),
      energy,
      mood
    };
  });
  const avgEnergy =
    items.reduce((sum, item) => sum + (item.energy ?? 0), 0) / items.length;
  const avgMood =
    items.reduce((sum, item) => sum + (item.mood ?? 0), 0) / items.length;
  const avgSleep =
    items.reduce((sum, item) => sum + (item.sleep_hours ?? 0), 0) / items.length;

  return {
    days,
    checkins: days,
    checkin_rate: 1,
    avg_sleep_hours: Number(avgSleep.toFixed(1)),
    avg_energy: Number(avgEnergy.toFixed(1)),
    avg_mood: Number(avgMood.toFixed(1)),
    items
  };
}

function buildMockCheckins(days: number): Checkin[] {
  const summary = buildMockSummary(days);
  return summary.items.map((item, idx) => ({
    id: idx + 1,
    date: item.date,
    alive: true,
    sleep_hours: item.sleep_hours ?? 7,
    energy: item.energy ?? 3,
    mood: item.mood ?? 3,
    note: `第 ${idx + 1} 天记录`
  }));
}

function dateKey(value: string) {
  return value.split("T")[0];
}

function formatDateKey(year: number, month: number, day: number) {
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

// Device management removed from UI per request.

export default function History() {
  const EDIT_WINDOW_DAYS = 7;
  const [summary, setSummary] = useState<Summary | null>(null);
  const [listSummary, setListSummary] = useState<Summary | null>(null);
  const [heatmapSummary, setHeatmapSummary] = useState<Summary | null>(null);
  const [checkins, setCheckins] = useState<Checkin[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [mockEnabled, setMockEnabled] = useState(false);
  const [days, setDays] = useState(14);
  const [visibleCount, setVisibleCount] = useState(10);
  const [editingDate, setEditingDate] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState({
    sleep_hours: "",
    energy: "",
    mood: "",
    note: ""
  });
  const [saving, setSaving] = useState(false);
  const [expandedDate, setExpandedDate] = useState<string | null>(null);
  const noticeTimer = useRef<number | null>(null);
  const heatmapRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    void refresh(days);
    return () => {
      if (noticeTimer.current) {
        window.clearTimeout(noticeTimer.current);
      }
    };
  }, [days]);

  useEffect(() => {
    if (!error) return;
    setNoticeWithAutoClear(error);
    setError(null);
  }, [error]);

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

  async function refresh(windowDays: number) {
    setLoading(true);
    setError(null);
    try {
      const summaryPromise = getSummary(windowDays);
      const listPromise = windowDays === 30 ? summaryPromise : getSummary(30);
      const checkinsPromise = getCheckins({ limit: 30, order: "desc" });
      const heatmapPromise = getSummary(180);
      const [summaryRes, listRes, checkinsRes, heatmapRes] = await Promise.all([
        summaryPromise,
        listPromise,
        checkinsPromise,
        heatmapPromise
      ]);
      setSummary(summaryRes);
      setListSummary(listRes);
      setCheckins(checkinsRes);
      setHeatmapSummary(heatmapRes);
    } catch (err) {
      setError(err instanceof Error ? err.message : "加载失败");
    } finally {
      setLoading(false);
    }
  }


  const displaySummary = mockEnabled ? buildMockSummary(days) : summary;
  const displayListSummary = mockEnabled ? buildMockSummary(30) : listSummary;
  const displayHeatmapSummary = mockEnabled ? buildMockSummary(180) : heatmapSummary;
  const displayCheckins = mockEnabled ? buildMockCheckins(30) : checkins;
  const showLoading = loading && !mockEnabled;

  const filteredItems = displaySummary?.items.filter((item) => item.checked_in) ?? [];
  const trendReady = filteredItems.length >= 5;
  const listItems = displayListSummary?.items.filter((item) => item.checked_in) ?? [];
  const moodValues = filteredItems
    .map((item) => item.mood)
    .filter((value): value is number => value !== null && value !== undefined);
  const energyValues = filteredItems
    .map((item) => item.energy)
    .filter((value): value is number => value !== null && value !== undefined);
  const sleepValues = filteredItems
    .map((item) => item.sleep_hours)
    .filter((value): value is number => value !== null && value !== undefined);
  const visibleItems = listItems.slice().reverse().slice(0, visibleCount);
  const hasMore = visibleCount < listItems.length;
  const checkinsByDate = useMemo(() => {
    return new Map(displayCheckins.map((item) => [dateKey(item.date), item]));
  }, [displayCheckins]);
  const heatmapData = useMemo(() => {
    const items = displayHeatmapSummary?.items ?? [];
    if (items.length === 0) return null;
    const byDate = new Map(items.map((item) => [dateKey(item.date), item]));
    const startRange = new Date(items[0].date);
    const endRange = new Date(items[items.length - 1].date);
    startRange.setHours(0, 0, 0, 0);
    endRange.setHours(0, 0, 0, 0);

    const startOffset = (startRange.getDay() + 6) % 7;
    const totalDays =
      Math.floor((endRange.getTime() - startRange.getTime()) / 86400000) + 1;
    const totalCells = startOffset + totalDays;
    const totalWeeks = Math.ceil(totalCells / 7);
    const cells: Array<Summary["items"][number] | null> = Array.from(
      { length: totalWeeks * 7 },
      () => null
    );

    for (let i = 0; i < totalDays; i += 1) {
      const current = new Date(startRange);
      current.setDate(startRange.getDate() + i);
      const key = formatDateKey(current.getFullYear(), current.getMonth(), current.getDate());
      const item = byDate.get(key) ?? null;
      cells[startOffset + i] = item;
    }

    const monthLabels: Array<{ label: string; index: number }> = [];
    const seenMonths = new Set<string>();
    for (let i = 0; i < totalDays; i += 1) {
      const current = new Date(startRange);
      current.setDate(startRange.getDate() + i);
      if (current.getDate() === 1 || i === 0) {
        const label = `${current.getMonth() + 1}月`;
        const key = `${current.getFullYear()}-${current.getMonth() + 1}`;
        if (!seenMonths.has(key)) {
          seenMonths.add(key);
          monthLabels.push({
            label,
            index: Math.floor((startOffset + i) / 7)
          });
        }
      }
    }

    return { cells, totalWeeks, monthLabels };
  }, [displayHeatmapSummary]);

  useEffect(() => {
    setVisibleCount(10);
  }, [displayListSummary?.items.length]);

  useEffect(() => {
    if (!heatmapRef.current) return;
    if (!heatmapData) return;
    const isTouch = window.matchMedia("(hover: none) and (pointer: coarse)").matches;
    const isNarrow = window.innerWidth <= 1024;
    if (!isTouch && !isNarrow) return;
    heatmapRef.current.scrollLeft = heatmapRef.current.scrollWidth;
  }, [heatmapData]);

  useEffect(() => {
    if (!expandedDate) return;
    const stillExists = listItems.some((item) => dateKey(item.date) === expandedDate);
    if (!stillExists) {
      setExpandedDate(null);
    }
  }, [listItems, expandedDate]);

  function handleToggleDetail(item: Summary["items"][number]) {
    const key = dateKey(item.date);
    setExpandedDate((prev) => (prev === key ? null : key));
  }

  function canEdit(dateValue: string) {
    const today = new Date();
    const target = new Date(dateValue);
    today.setHours(0, 0, 0, 0);
    target.setHours(0, 0, 0, 0);
    const diffDays = Math.floor((today.getTime() - target.getTime()) / 86400000);
    return diffDays >= 0 && diffDays < EDIT_WINDOW_DAYS;
  }

  function handleStartEdit(item: Summary["items"][number]) {
    const key = dateKey(item.date);
    const checkin = checkinsByDate.get(key);
    setEditingDate(key);
    setExpandedDate(key);
    setEditDraft({
      sleep_hours: String(checkin?.sleep_hours ?? item.sleep_hours ?? ""),
      energy: String(checkin?.energy ?? item.energy ?? ""),
      mood: String(checkin?.mood ?? item.mood ?? ""),
      note: checkin?.note ?? ""
    });
  }

  function handleCancelEdit() {
    setEditingDate(null);
  }

  async function handleSaveEdit(item: Summary["items"][number]) {
    const key = dateKey(item.date);
    setSaving(true);
    try {
      const payload: CheckinPayload = {
        alive: true,
        sleep_hours: editDraft.sleep_hours ? Number(editDraft.sleep_hours) : null,
        energy: editDraft.energy ? Number(editDraft.energy) : null,
        mood: editDraft.mood ? Number(editDraft.mood) : null,
        note: editDraft.note ? editDraft.note : null
      };
      await updateCheckin(key, payload);
      setNoticeWithAutoClear("已更新");
      setEditingDate(null);
      await refresh(days);
    } catch (err) {
      setError(err instanceof Error ? err.message : "更新失败");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="page page-history">
      <section className="stats">
        <div className="stat-card">
          <span>平均睡眠</span>
          <strong>
            {displaySummary ? `${displaySummary.avg_sleep_hours}h` : "-"}
          </strong>
        </div>
        <div className="stat-card">
          <span>平均精力</span>
          <strong>{displaySummary ? displaySummary.avg_energy : "-"}</strong>
        </div>
        <div className="stat-card">
          <span>平均心情</span>
          <strong>{displaySummary ? displaySummary.avg_mood : "-"}</strong>
        </div>
      </section>

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
                onClick={() => setDays(value)}
              >
                {value} 天
              </button>
            ))}
          </div>
        </div>
        {import.meta.env.DEV ? (
          <label className="mock-toggle">
            <input
              type="checkbox"
              checked={mockEnabled}
              onChange={(event) => setMockEnabled(event.target.checked)}
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
                <Sparkline
                  values={energyValues}
                  min={1}
                  max={5}
                  className="sparkline-energy"
                />
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
                        title={`${formatDate(item.date)} · ${
                          item.checked_in ? "已打卡" : "未打卡"
                        }`}
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

      <section className="card">
        <div className="form-header header-row">
          <div>
            <h2>最近打卡</h2>
            <p>按日期查看最近 30 天记录</p>
          </div>
          <button
            className="secondary export-button"
            type="button"
            onClick={() => setNoticeWithAutoClear("导出功能将在下一版本支持。")}
          >
            导出 CSV
          </button>
        </div>
        <div className="history-list">
          {listItems.length === 0 ? (
            <div className="empty-state">
              <div className="empty-illustration" aria-hidden="true" />
              <p>还没有打卡记录</p>
              <span>在首页点击“我还活着”，这里就会出现记录。</span>
            </div>
          ) : (
            <>
              {visibleItems.map((item) => (
                <div key={item.date} className="history-item">
                  <div
                    className={`history-row clickable ${item.checked_in ? "hit" : "miss"}`}
                    role="button"
                    tabIndex={0}
                    onClick={() => handleToggleDetail(item)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        handleToggleDetail(item);
                      }
                    }}
                  >
                    <div className="history-date">
                      <span>{formatDate(item.date)}</span>
                      <span className="muted-inline">
                        {item.checked_in ? "已记录" : "未记录"}
                      </span>
                    </div>
                    <span className="history-metrics">
                      睡眠 {item.sleep_hours ?? "-"}h · 精力 {item.energy ?? "-"} · 心情{" "}
                      {item.mood ?? "-"}
                    </span>
                  </div>
                  {expandedDate === dateKey(item.date) ? (
                    <div className="history-detail inline">
                      {editingDate === dateKey(item.date) ? (
                        <>
                          <div className="history-detail-form">
                            <label>
                              睡眠
                              <input
                                type="number"
                                min="0"
                                max="24"
                                value={editDraft.sleep_hours}
                                onChange={(event) =>
                                  setEditDraft((prev) => ({
                                    ...prev,
                                    sleep_hours: event.target.value
                                  }))
                                }
                              />
                            </label>
                            <label>
                              精力
                              <input
                                type="number"
                                min="1"
                                max="5"
                                value={editDraft.energy}
                                onChange={(event) =>
                                  setEditDraft((prev) => ({
                                    ...prev,
                                    energy: event.target.value
                                  }))
                                }
                              />
                            </label>
                            <label>
                              心情
                              <input
                                type="number"
                                min="1"
                                max="5"
                                value={editDraft.mood}
                                onChange={(event) =>
                                  setEditDraft((prev) => ({
                                    ...prev,
                                    mood: event.target.value
                                  }))
                                }
                              />
                            </label>
                          </div>
                          <label className="history-detail-note">
                            <span className="muted-inline">备注</span>
                            <textarea
                              rows={2}
                              value={editDraft.note}
                              onChange={(event) =>
                                setEditDraft((prev) => ({
                                  ...prev,
                                  note: event.target.value
                                }))
                              }
                            />
                          </label>
                          <div className="history-detail-actions">
                            <button
                              type="button"
                              className="secondary"
                              onClick={handleCancelEdit}
                              disabled={saving}
                            >
                              取消
                            </button>
                            <button
                              type="button"
                              className="primary"
                              onClick={() => handleSaveEdit(item)}
                              disabled={saving}
                            >
                              {saving ? "保存中..." : "保存"}
                            </button>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="history-detail-row">
                            睡眠 {item.sleep_hours ?? "-"}h · 精力 {item.energy ?? "-"} · 心情{" "}
                            {item.mood ?? "-"}
                          </div>
                          <div className="history-detail-note">
                            <span className="muted-inline">备注</span>
                            <p>{checkinsByDate.get(dateKey(item.date))?.note || "无"}</p>
                          </div>
                          <div className="history-detail-actions">
                            {canEdit(item.date) ? (
                              <button
                                type="button"
                                className="link"
                                onClick={() => handleStartEdit(item)}
                              >
                                编辑
                              </button>
                            ) : (
                              <span className="muted-inline">仅支持最近 {EDIT_WINDOW_DAYS} 天编辑</span>
                            )}
                          </div>
                        </>
                      )}
                    </div>
                  ) : null}
                </div>
              ))}
              {hasMore ? (
                <button
                  type="button"
                  className="secondary load-more"
                  onClick={() =>
                    setVisibleCount((prev) => Math.min(prev + 10, listItems.length))
                  }
                >
                  加载更多
                </button>
              ) : (
                <div className="inline-notice">已经到底啦，明天继续打卡吧。</div>
              )}
            </>
          )}
        </div>
      </section>

      {notice ? <div className="toast">{notice}</div> : null}

    </div>
  );
}
