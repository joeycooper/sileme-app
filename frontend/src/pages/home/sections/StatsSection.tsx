import { Stats } from "../../../services/api";

type StatsSectionProps = {
  stats: Stats | null;
};

export default function StatsSection({ stats }: StatsSectionProps) {
  return (
    <section className="grid grid-cols-3 gap-2 sm:gap-4">
      {[
        { label: "连续天数", value: stats ? stats.streak_days : "-" },
        { label: "30 天打卡率", value: stats ? `${Math.round(stats.checkin_rate * 100)}%` : "-" },
        { label: "平均睡眠", value: stats ? `${stats.avg_sleep_hours}h` : "-" }
      ].map((item) => (
        <div
          key={item.label}
          className="rounded-2xl border border-border/70 bg-white/85 p-3 text-ink shadow-soft backdrop-blur sm:p-5"
        >
          <span className="text-xs text-muted-foreground sm:text-xs">{item.label}</span>
          <strong className="mt-2 block text-lg font-semibold sm:text-2xl">{item.value}</strong>
        </div>
      ))}
    </section>
  );
}
