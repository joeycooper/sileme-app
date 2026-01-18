import { useEffect, useState } from "react";
import {
  Checkin,
  CheckinPayload,
  Stats,
  getStats,
  getTodayCheckin,
  upsertToday
} from "../services/api";

const emptyForm = {
  sleep_hours: "",
  energy: "",
  mood: "",
  note: ""
};

export default function Home() {
  const [today, setToday] = useState<Checkin | null>(null);
  const [stats, setStats] = useState<Stats | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void refresh();
  }, []);

  async function refresh() {
    setError(null);
    try {
      const [todayRes, statsRes] = await Promise.all([
        getTodayCheckin(),
        getStats()
      ]);
      setToday(todayRes);
      setStats(statsRes);
      if (todayRes) {
        setForm({
          sleep_hours: todayRes.sleep_hours?.toString() ?? "",
          energy: todayRes.energy?.toString() ?? "",
          mood: todayRes.mood?.toString() ?? "",
          note: todayRes.note ?? ""
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "加载失败");
    }
  }

  function toNumberOrNull(value: string): number | null {
    if (!value.trim()) return null;
    const num = Number(value);
    return Number.isFinite(num) ? num : null;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const payload: CheckinPayload = {
      alive: true,
      sleep_hours: toNumberOrNull(form.sleep_hours),
      energy: toNumberOrNull(form.energy),
      mood: toNumberOrNull(form.mood),
      note: form.note.trim() ? form.note.trim() : null
    };

    try {
      const saved = await upsertToday(payload);
      setToday(saved);
      const statsRes = await getStats();
      setStats(statsRes);
    } catch (err) {
      setError(err instanceof Error ? err.message : "提交失败");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="page">
      <header className="hero">
        <div>
          <p className="eyebrow">死了么 App</p>
          <h1>每天报平安</h1>
          <p className="subhead">一句话：今天还好。记录自己，也安抚别人。</p>
        </div>
        <div className={`status ${today ? "alive" : "empty"}`}>
          <span>{today ? "今日已打卡" : "今日未打卡"}</span>
          <strong>{today ? "✅" : "⏳"}</strong>
        </div>
      </header>

      <section className="card">
        <form onSubmit={handleSubmit} className="form">
          <div className="form-header">
            <h2>我还活着 ✅</h2>
            <p>可以只点按钮，也可以填一些感觉。</p>
          </div>

          <div className="fields">
            <label>
              睡眠 (小时)
              <input
                type="number"
                min="0"
                max="24"
                placeholder="比如 7"
                value={form.sleep_hours}
                onChange={(e) => setForm({ ...form, sleep_hours: e.target.value })}
              />
            </label>
            <label>
              精力 (1-5)
              <input
                type="number"
                min="1"
                max="5"
                placeholder="3"
                value={form.energy}
                onChange={(e) => setForm({ ...form, energy: e.target.value })}
              />
            </label>
            <label>
              心情 (1-5)
              <input
                type="number"
                min="1"
                max="5"
                placeholder="4"
                value={form.mood}
                onChange={(e) => setForm({ ...form, mood: e.target.value })}
              />
            </label>
            <label className="span-2">
              备注
              <textarea
                rows={3}
                placeholder="今天的我..."
                value={form.note}
                onChange={(e) => setForm({ ...form, note: e.target.value })}
              />
            </label>
          </div>

          <button className="primary" type="submit" disabled={loading}>
            {loading ? "提交中..." : "我还活着 ✅"}
          </button>

          {error ? <p className="error">{error}</p> : null}
        </form>
      </section>

      <section className="stats">
        <div className="stat-card">
          <span>连续天数</span>
          <strong>{stats ? stats.streak_days : "-"}</strong>
        </div>
        <div className="stat-card">
          <span>30 天打卡率</span>
          <strong>
            {stats ? `${Math.round(stats.checkin_rate * 100)}%` : "-"}
          </strong>
        </div>
        <div className="stat-card">
          <span>平均睡眠</span>
          <strong>{stats ? `${stats.avg_sleep_hours}h` : "-"}</strong>
        </div>
      </section>

      <footer className="footer">
        <p>一个人也可以把生活记录得很隆重。</p>
      </footer>
    </div>
  );
}
