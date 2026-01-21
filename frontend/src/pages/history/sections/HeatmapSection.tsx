import { Summary } from "../../../services/api";
import { formatDate } from "../utils";
import { Card, CardContent } from "@/components/ui/card";

type HeatmapData = {
  cells: Array<Summary["items"][number] | null>;
  totalWeeks: number;
  monthLabels: Array<{ label: string; index: number }>;
};

type HeatmapSectionProps = {
  heatmapData: HeatmapData | null;
  heatmapRef: React.RefObject<HTMLDivElement>;
};

export default function HeatmapSection({ heatmapData, heatmapRef }: HeatmapSectionProps) {
  return (
    <section>
      <Card className="border-border/70 bg-white/85 shadow-soft backdrop-blur">
        <CardContent className="space-y-4">
          <div>
            <h2 className="text-xl font-semibold text-ink">热力图</h2>
            <p className="mt-1 text-xs text-muted-foreground">最近 180 天打卡情况</p>
          </div>
          <div className="relative flex flex-col items-center gap-2" role="img" aria-label="最近 180 天打卡热力图">
            {!heatmapData ? (
              <span className="text-xs text-muted-foreground">暂无热力图数据</span>
            ) : (
              <>
                <div className="w-full overflow-x-auto pb-2" ref={heatmapRef}>
                  <div
                    className="grid w-max grid-flow-col gap-2 text-xs text-muted-foreground"
                    style={{
                      gridTemplateColumns: `repeat(${heatmapData.totalWeeks}, 12px)`
                    }}
                  >
                    {heatmapData.monthLabels.map((item) => (
                      <span
                        key={`${item.label}-${item.index}`}
                        style={{ gridColumnStart: item.index + 1 }}
                      >
                        {item.label}
                      </span>
                    ))}
                  </div>
                  <div
                    className="mt-2 grid w-max grid-flow-col grid-rows-7 gap-2"
                    style={{
                      gridTemplateColumns: `repeat(${heatmapData.totalWeeks}, 12px)`
                    }}
                  >
                    {heatmapData.cells.map((item, idx) => {
                      if (!item) {
                        return <span key={`empty-${idx}`} className="h-3 w-3 rounded-sm" />;
                      }
                      return (
                        <span
                          key={`${item.date}-${idx}`}
                          className={`h-3 w-3 rounded-sm ${
                            item.checked_in ? "bg-brand" : "bg-slate-200"
                          }`}
                          title={`${formatDate(item.date)} · ${
                            item.checked_in ? "已打卡" : "未打卡"
                          }`}
                        />
                      );
                    })}
                  </div>
                </div>
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-2">
                    <span className="h-3 w-3 rounded-sm bg-slate-200" />
                    未打卡
                  </span>
                  <span className="flex items-center gap-2">
                    <span className="h-3 w-3 rounded-sm bg-brand" />
                    已打卡
                  </span>
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
