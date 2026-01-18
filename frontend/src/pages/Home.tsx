import { useEffect, useRef, useState } from "react";
import {
  Checkin,
  CheckinPayload,
  Stats,
  getMe,
  getStats,
  getTodayCheckin,
  upsertToday
} from "../services/api";
import { IconClock } from "../components/icons";

const emptyForm = {
  sleep_hours: "",
  energy: "",
  mood: "",
  note: ""
};

type HomeProps = {
  isAuthed: boolean;
  onRequireLogin?: () => void;
};

export default function Home({ isAuthed, onRequireLogin }: HomeProps) {
  const [today, setToday] = useState<Checkin | null>(null);
  const [stats, setStats] = useState<Stats | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastCheckinTime, setLastCheckinTime] = useState<string | null>(null);
  const [lastCheckinTs, setLastCheckinTs] = useState<number | null>(null);
  const [countdown, setCountdown] = useState("24:00:00");
  const [alarmHours, setAlarmHours] = useState<number>(24);
  const noticeTimer = useRef<number | null>(null);
  const lastCheckinTsRef = useRef<number | null>(null);

  useEffect(() => {
    if (isAuthed) {
      void refresh();
    } else {
      setToday(null);
      setStats(null);
      setLastCheckinTime(null);
      const now = Date.now();
      lastCheckinTsRef.current = now;
      setLastCheckinTs(now);
    }
    return () => {
      if (noticeTimer.current) {
        window.clearTimeout(noticeTimer.current);
      }
    };
  }, [isAuthed]);

  useEffect(() => {
    function handleAlarmChange(event: Event) {
      const custom = event as CustomEvent<number>;
      if (typeof custom.detail === "number") {
        setAlarmHours(custom.detail);
      }
    }

    window.addEventListener("sileme-alarm-hours", handleAlarmChange);
    return () => {
      window.removeEventListener("sileme-alarm-hours", handleAlarmChange);
    };
  }, []);

  useEffect(() => {
    const interval = window.setInterval(() => {
      const ts = lastCheckinTsRef.current;
      const totalMs = alarmHours * 60 * 60 * 1000;
      if (!ts) {
        setCountdown(`${String(alarmHours).padStart(2, "0")}:00:00`);
        return;
      }
      const elapsed = Date.now() - ts;
      const remaining = Math.max(totalMs - elapsed, 0);
      if (remaining === 0) {
        const hoursPassed = Math.floor(elapsed / 3600000);
        setCountdown(
          `请尽快打卡，不要让家人朋友担心（已过${hoursPassed}小时）`
        );
        return;
      }
      const hours = Math.floor(remaining / 3600000);
      const minutes = Math.floor((remaining % 3600000) / 60000);
      const seconds = Math.floor((remaining % 60000) / 1000);
      setCountdown(
        `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(
          seconds
        ).padStart(2, "0")}`
      );
    }, 1000);

    return () => window.clearInterval(interval);
  }, [alarmHours]);

  async function refresh() {
    setError(null);
    try {
      const enterTs = Date.now();
      const [todayRes, statsRes, meRes] = await Promise.all([
        getTodayCheckin(),
        getStats(),
        getMe()
      ]);
      setToday(todayRes);
      setStats(statsRes);
      if (meRes.alarm_hours) {
        setAlarmHours(meRes.alarm_hours);
      }
      lastCheckinTsRef.current = enterTs;
      setLastCheckinTs(enterTs);
      if (todayRes) {
        setForm({
          sleep_hours: todayRes.sleep_hours?.toString() ?? "",
          energy: todayRes.energy?.toString() ?? "",
          mood: todayRes.mood?.toString() ?? "",
          note: todayRes.note ?? ""
        });
        const storedTime = localStorage.getItem(`sileme_checkin_time_${todayRes.date}`);
        setLastCheckinTime(storedTime);
        localStorage.setItem("sileme_notice_date", todayRes.date);
      } else {
        setLastCheckinTime(null);
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

  function renderStars(value: string, onChange: (v: string) => void) {
    const current = Number(value || 0);
    return (
      <div className="stars">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            className={`star ${current >= star ? "active" : ""}`}
            onClick={() => onChange(String(star))}
            aria-label={`设置为 ${star} 分`}
          >
            ★
          </button>
        ))}
        <span className="star-value">{value || "-"}</span>
      </div>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isAuthed) {
      setError("请先登录");
      if (onRequireLogin) {
        onRequireLogin();
      }
      return;
    }
    setLoading(true);
    setError(null);
    const wasCheckedIn = Boolean(today);
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
      const time = new Date().toLocaleTimeString("zh-CN", {
        hour: "2-digit",
        minute: "2-digit"
      });
      const ts = Date.now();
      localStorage.setItem(`sileme_checkin_time_${saved.date}`, time);
      setLastCheckinTime(time);
      lastCheckinTsRef.current = ts;
      setLastCheckinTs(ts);
      localStorage.setItem("sileme_notice_date", saved.date);
    } catch (err) {
      setError(err instanceof Error ? err.message : "提交失败");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="page page-home">
      <header className="hero">
        <div>
          <p className="eyebrow">热爱生活，温柔待己</p>
          <h1>每日报平安</h1>
          <p className="subhead">
            {new Date().toLocaleDateString("zh-CN", {
              year: "numeric",
              month: "long",
              day: "numeric",
              weekday: "long"
            })}
          </p>
        </div>
        <div className={`status ${today ? "alive" : "empty"}`}>
          <IconClock className="status-icon" />
          <span>
            {countdown.includes("请尽快打卡")
              ? countdown
              : `距离自动警报触发还有 ${countdown}`}
          </span>
        </div>
      </header>

      <section className="card">
        <form onSubmit={handleSubmit} className="form">
          <div className="alive-wrap">
            <button
              className={`alive-circle ${loading ? "is-loading" : ""}`}
              type="submit"
              disabled={loading}
            >
              <span className="alive-text">我还活着</span>
              {loading ? <span className="alive-spinner" /> : null}
            </button>
            <span className="alive-sub">
              {today
                ? `今日打卡已更新${lastCheckinTime ? ` ${lastCheckinTime}` : ""}`
                : "今日未打卡"}
            </span>
          </div>

          {error ? <p className="error">{error}</p> : null}
        </form>
      </section>

      <section className="card">
        <div className="fields">
          <div className="compact-row">
            <label className="compact-field">
              睡眠
              <input
                type="number"
                min="0"
                max="24"
                placeholder="7"
                value={form.sleep_hours}
                onChange={(e) => setForm({ ...form, sleep_hours: e.target.value })}
              />
            </label>
            <label className="compact-field">
              精力
              <div className="compact-stars">
                {renderStars(form.energy, (value) => setForm({ ...form, energy: value }))}
              </div>
            </label>
            <label className="compact-field">
              心情
              <div className="compact-stars">
                {renderStars(form.mood, (value) => setForm({ ...form, mood: value }))}
              </div>
            </label>
          </div>
          <label className="span-2">
            备注
            <input
              type="text"
              placeholder="今天的我..."
              value={form.note}
              onChange={(e) => setForm({ ...form, note: e.target.value })}
            />
          </label>
        </div>
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
