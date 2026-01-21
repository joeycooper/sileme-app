import { Sparkline, SparklineBoundary } from "../components/Sparkline";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent } from "@/components/ui/card";

type TrendSectionProps = {
  days: number;
  onDaysChange: (next: number) => void;
  mockEnabled: boolean;
  onMockToggle: (next: boolean) => void;
  showMockToggle: boolean;
  showLoading: boolean;
  trendReady: boolean;
  sleepValues: number[];
  energyValues: number[];
  moodValues: number[];
};

export default function TrendSection({
  days,
  onDaysChange,
  mockEnabled,
  onMockToggle,
  showMockToggle,
  showLoading,
  trendReady,
  sleepValues,
  energyValues,
  moodValues
}: TrendSectionProps) {
  return (
    <section>
      <Card className="border-border/70 bg-white/85 shadow-soft backdrop-blur">
        <CardContent className="space-y-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="text-xl font-semibold text-ink">趋势图</h2>
              <p className="mt-1 text-xs text-muted-foreground">最近 {days} 天睡眠、精力与心情曲线概览</p>
            </div>
            <div className="flex flex-wrap items-center gap-2" role="group" aria-label="趋势天数">
              {[14, 30, 90].map((value) => (
                <Button
                  key={value}
                  type="button"
                  size="sm"
                  variant={days === value ? "default" : "outline"}
                  className="rounded-full px-4 text-xs"
                  onClick={() => onDaysChange(value)}
                >
                  {value} 天
                </Button>
              ))}
            </div>
          </div>
          {showMockToggle ? (
            <label className="flex items-center gap-2 text-xs text-muted-foreground">
              <Switch
                checked={mockEnabled}
                onCheckedChange={(value) => onMockToggle(Boolean(value))}
              />
              模拟数据
            </label>
          ) : null}
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2 rounded-xl border border-border/60 bg-white/90 p-4 text-sm text-muted-foreground shadow-sm">
              <span className="text-xs uppercase tracking-wide">睡眠</span>
              {showLoading ? (
                <span>加载中...</span>
              ) : !trendReady ? (
                <span className="text-xs text-muted-foreground">数据不足</span>
              ) : (
                <SparklineBoundary>
                  <Sparkline
                    values={sleepValues}
                    min={0}
                    max={12}
                    baseline={8}
                    baselineLabel="8小时"
                    className="text-blue-500"
                  />
                </SparklineBoundary>
              )}
            </div>
            <div className="space-y-2 rounded-xl border border-border/60 bg-white/90 p-4 text-sm text-muted-foreground shadow-sm">
              <span className="text-xs uppercase tracking-wide">精力</span>
              {showLoading ? (
                <span>加载中...</span>
              ) : !trendReady ? (
                <span className="text-xs text-muted-foreground">数据不足</span>
              ) : (
                <SparklineBoundary>
                  <Sparkline values={energyValues} min={1} max={5} className="text-emerald-500" />
                </SparklineBoundary>
              )}
            </div>
            <div className="space-y-2 rounded-xl border border-border/60 bg-white/90 p-4 text-sm text-muted-foreground shadow-sm">
              <span className="text-xs uppercase tracking-wide">心情</span>
              {showLoading ? (
                <span>加载中...</span>
              ) : !trendReady ? (
                <span className="text-xs text-muted-foreground">数据不足</span>
              ) : (
                <SparklineBoundary>
                  <Sparkline values={moodValues} min={1} max={5} className="text-amber-500" />
                </SparklineBoundary>
              )}
            </div>
          </div>
          {trendReady ? (
            <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-2">
                <i className="h-2 w-2 rounded-full bg-emerald-500" aria-hidden="true" />
                精力
              </span>
              <span className="flex items-center gap-2">
                <i className="h-2 w-2 rounded-full bg-amber-500" aria-hidden="true" />
                心情
              </span>
              <span className="flex items-center gap-2">
                <i className="h-2 w-2 rounded-full bg-blue-500" aria-hidden="true" />
                睡眠
              </span>
            </div>
          ) : null}
        </CardContent>
      </Card>
    </section>
  );
}
