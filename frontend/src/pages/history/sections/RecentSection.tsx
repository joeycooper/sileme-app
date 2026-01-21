import { EmptyState } from "../../../components/common";
import { Checkin, Summary } from "../../../services/api";
import { dateKey, formatDate } from "../utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";

type EditDraft = {
  sleep_hours: string;
  energy: string;
  mood: string;
  note: string;
};

type RecentSectionProps = {
  listItems: Summary["items"];
  visibleItems: Summary["items"];
  expandedDate: string | null;
  editingDate: string | null;
  editDraft: EditDraft;
  onEditFieldChange: <K extends keyof EditDraft>(key: K, value: EditDraft[K]) => void;
  saving: boolean;
  canEdit: (dateValue: string) => boolean;
  onToggleDetail: (item: Summary["items"][number]) => void;
  onStartEdit: (item: Summary["items"][number]) => void;
  onCancelEdit: () => void;
  onSaveEdit: (item: Summary["items"][number]) => void;
  hasMore: boolean;
  onLoadMore: () => void;
  editWindowDays: number;
  checkinsByDate: Map<string, Checkin>;
  onExport: () => void;
};

export default function RecentSection({
  listItems,
  visibleItems,
  expandedDate,
  editingDate,
  editDraft,
  onEditFieldChange,
  saving,
  canEdit,
  onToggleDetail,
  onStartEdit,
  onCancelEdit,
  onSaveEdit,
  hasMore,
  onLoadMore,
  editWindowDays,
  checkinsByDate,
  onExport
}: RecentSectionProps) {
  return (
    <section>
      <Card className="border-border/70 bg-white/85 shadow-soft backdrop-blur">
        <CardContent className="space-y-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="text-xl font-semibold text-ink">最近打卡</h2>
              <p className="mt-1 text-xs text-muted-foreground">按日期查看最近 30 天记录</p>
            </div>
            <Button variant="outline" size="sm" className="rounded-full" type="button" onClick={onExport}>
              导出 CSV
            </Button>
          </div>
          <div className="flex flex-col gap-3">
        {listItems.length === 0 ? (
          <EmptyState title="还没有打卡记录" description="在首页点击“我还活着”，这里就会出现记录。" />
        ) : (
          <>
            {visibleItems.map((item) => (
              <div key={item.date} className="space-y-2">
                <div
                  className={`grid cursor-pointer grid-cols-1 items-center gap-2 rounded-xl border px-4 py-3 text-sm transition hover:shadow-sm md:grid-cols-[1.4fr_2.2fr] ${
                    item.checked_in
                      ? "border-brand/40 bg-brand/10 text-ink"
                      : "border-border bg-white/80 text-muted-foreground"
                  }`}
                  role="button"
                  tabIndex={0}
                  onClick={() => onToggleDetail(item)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      onToggleDetail(item);
                    }
                  }}
                >
                  <div className="flex flex-col gap-1">
                    <span className="font-semibold text-ink">{formatDate(item.date)}</span>
                    <span className="text-xs text-muted-foreground">
                      {item.checked_in ? "已记录" : "未记录"}
                    </span>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    睡眠 {item.sleep_hours ?? "-"}h · 精力 {item.energy ?? "-"} · 心情{" "}
                    {item.mood ?? "-"}
                  </span>
                </div>
                {expandedDate === dateKey(item.date) ? (
                  <div className="space-y-3 rounded-xl border border-border/60 bg-white/90 p-5 text-sm text-muted-foreground shadow-sm animate-expand">
                    {editingDate === dateKey(item.date) ? (
                      <>
                        <div className="grid gap-3 md:grid-cols-3">
                          <label className="flex flex-col gap-2 text-xs font-medium text-muted-foreground">
                            睡眠
                            <Input
                              type="number"
                              min="0"
                              max="24"
                              value={editDraft.sleep_hours}
                              onChange={(event) =>
                                onEditFieldChange("sleep_hours", event.target.value)
                              }
                            />
                          </label>
                          <label className="flex flex-col gap-2 text-xs font-medium text-muted-foreground">
                            精力
                            <Input
                              type="number"
                              min="1"
                              max="5"
                              value={editDraft.energy}
                              onChange={(event) =>
                                onEditFieldChange("energy", event.target.value)
                              }
                            />
                          </label>
                          <label className="flex flex-col gap-2 text-xs font-medium text-muted-foreground">
                            心情
                            <Input
                              type="number"
                              min="1"
                              max="5"
                              value={editDraft.mood}
                              onChange={(event) =>
                                onEditFieldChange("mood", event.target.value)
                              }
                            />
                          </label>
                        </div>
                        <label className="flex flex-col gap-2 text-xs font-medium text-muted-foreground">
                          <span>备注</span>
                          <Textarea
                            rows={2}
                            value={editDraft.note}
                            onChange={(event) => onEditFieldChange("note", event.target.value)}
                          />
                        </label>
                        <div className="flex flex-wrap justify-end gap-2">
                          <Button type="button" variant="outline" onClick={onCancelEdit} disabled={saving}>
                            取消
                          </Button>
                          <Button
                            type="button"
                            onClick={() => onSaveEdit(item)}
                            disabled={saving}
                          >
                            {saving ? "保存中..." : "保存"}
                          </Button>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="text-xs text-muted-foreground">
                          睡眠 {item.sleep_hours ?? "-"}h · 精力 {item.energy ?? "-"} · 心情{" "}
                          {item.mood ?? "-"}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          <span className="font-medium text-ink">备注</span>
                          <p className="mt-1 text-sm text-ink">
                            {checkinsByDate.get(dateKey(item.date))?.note || "无"}
                          </p>
                        </div>
                        <div className="flex items-center justify-between">
                          {canEdit(item.date) ? (
                            <Button type="button" variant="ghost" onClick={() => onStartEdit(item)}>
                              编辑
                            </Button>
                          ) : (
                            <span className="text-xs text-muted-foreground">仅支持最近 {editWindowDays} 天编辑</span>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                ) : null}
              </div>
            ))}
            {hasMore ? (
              <Button type="button" variant="outline" className="w-full rounded-full" onClick={onLoadMore}>
                加载更多
              </Button>
            ) : (
              <div className="rounded-full border border-border/60 px-4 py-2 text-center text-xs text-muted-foreground">
                已经到底啦，明天继续打卡吧。
              </div>
            )}
          </>
        )}
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
