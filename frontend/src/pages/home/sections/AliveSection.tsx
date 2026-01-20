import type { FormEvent } from "react";
import { Checkin } from "../../../services/api";

type AliveSectionProps = {
  loading: boolean;
  today: Checkin | null;
  lastCheckinTime: string | null;
  onSubmit: (event: FormEvent) => void;
};

export default function AliveSection({
  loading,
  today,
  lastCheckinTime,
  onSubmit
}: AliveSectionProps) {
  return (
    <section className="card">
      <form onSubmit={onSubmit} className="form">
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
      </form>
    </section>
  );
}
