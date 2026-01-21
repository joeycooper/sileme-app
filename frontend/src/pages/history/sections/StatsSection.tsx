import { Summary } from "../../../services/api";

type StatsSectionProps = {
  summary: Summary | null;
};

export default function StatsSection({ summary }: StatsSectionProps) {
  return (
    <section className="grid grid-cols-3 gap-2 sm:gap-4">
      {[
        { label: "平均睡眠", value: summary ? `${summary.avg_sleep_hours}h` : "-" },
        { label: "平均精力", value: summary ? summary.avg_energy : "-" },
        { label: "平均心情", value: summary ? summary.avg_mood : "-" }
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
