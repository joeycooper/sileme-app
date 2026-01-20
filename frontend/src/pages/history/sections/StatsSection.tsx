import { Summary } from "../../../services/api";

type StatsSectionProps = {
  summary: Summary | null;
};

export default function StatsSection({ summary }: StatsSectionProps) {
  return (
    <section className="stats">
      <div className="stat-card">
        <span>平均睡眠</span>
        <strong>{summary ? `${summary.avg_sleep_hours}h` : "-"}</strong>
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
  );
}
