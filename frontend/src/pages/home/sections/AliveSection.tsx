import type { FormEvent } from "react";
import { Checkin } from "../../../services/api";
import { Card, CardContent } from "@/components/ui/card";

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
    <section>
      <Card className="border-border/70 bg-white/85 shadow-soft backdrop-blur">
        <CardContent className="py-6">
          <form onSubmit={onSubmit}>
            <div className="flex flex-col items-center gap-3 text-center">
              <button
                className={`relative flex h-40 w-40 flex-col items-center justify-center gap-2 rounded-full border-[8px] border-brand/25 text-ink shadow-[inset_0_0_0_10px_rgba(59,130,246,0.08)] transition hover:border-brand/40 sm:h-44 sm:w-44 sm:border-[10px] sm:shadow-[inset_0_0_0_12px_rgba(59,130,246,0.08)] ${
                  loading ? "" : "animate-pulse-soft"
                }`}
                type="submit"
                disabled={loading}
              >
                <span className="text-xl font-semibold sm:text-2xl">我还活着</span>
                {loading ? (
                  <span className="h-5 w-5 rounded-full border-2 border-brand/40 border-t-brand animate-spin-slow" />
                ) : null}
              </button>
              <span className="text-xs text-muted-foreground">
                {today
                  ? `今日打卡已更新${lastCheckinTime ? ` ${lastCheckinTime}` : ""}`
                  : "今日未打卡"}
              </span>
            </div>
          </form>
        </CardContent>
      </Card>
    </section>
  );
}
