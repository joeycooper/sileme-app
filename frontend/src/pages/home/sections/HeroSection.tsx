import { IconClock } from "../../../components/icons";

type HeroSectionProps = {
  countdown: string;
  hasToday: boolean;
};

export default function HeroSection({ countdown, hasToday }: HeroSectionProps) {
  return (
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
      <div className={`status ${hasToday ? "alive" : "empty"}`}>
        <IconClock className="status-icon" />
        <span>
          {countdown.includes("请尽快打卡")
            ? countdown
            : `距离自动警报触发还有 ${countdown}`}
        </span>
      </div>
    </header>
  );
}
