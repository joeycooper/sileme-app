import { Stats } from "../../../services/api";

type StatsSectionProps = {
  stats: Stats | null;
};

export default function StatsSection({ stats }: StatsSectionProps) {
  return (
    <section className="stats">
      <div className="stat-card">
        <span>连续天数</span>
        <strong>{stats ? stats.streak_days : "-"}</strong>
      </div>
      <div className="stat-card">
        <span>30 天打卡率</span>
        <strong>{stats ? `${Math.round(stats.checkin_rate * 100)}%` : "-"}</strong>
      </div>
      <div className="stat-card">
        <span>平均睡眠</span>
        <strong>{stats ? `${stats.avg_sleep_hours}h` : "-"}</strong>
      </div>
    </section>
  );
}
