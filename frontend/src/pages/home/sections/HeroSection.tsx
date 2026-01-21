import { IconClock } from "../../../components/icons";

type HeroSectionProps = {
  countdown: string;
  hasToday: boolean;
};

export default function HeroSection({ countdown, hasToday }: HeroSectionProps) {
  return (
    <header className="flex flex-wrap items-center justify-between gap-4">
      <div>
        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">热爱生活，温柔待己</p>
        <h1 className="text-2xl font-semibold text-ink md:text-3xl">每日报平安</h1>
        <p className="mt-2 text-xs text-muted-foreground">
          {new Date().toLocaleDateString("zh-CN", {
            year: "numeric",
            month: "long",
            day: "numeric",
            weekday: "long"
          })}
        </p>
      </div>
      <div
        className={`flex items-center gap-3 rounded-full border border-border bg-white/80 px-4 py-3 text-sm shadow-soft backdrop-blur ${
          hasToday ? "text-ink" : "text-muted-foreground"
        }`}
      >
        <IconClock className="h-4 w-4 text-brand" />
        <span className="leading-relaxed">
          {countdown.includes("请尽快打卡")
            ? countdown
            : `距离自动警报触发还有 ${countdown}`}
        </span>
      </div>
    </header>
  );
}
