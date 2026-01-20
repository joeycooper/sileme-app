import { EmptyState } from "../../../components/common";
import { Checkin, Summary } from "../../../services/api";
import { dateKey, formatDate } from "../utils";

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
    <section className="card">
      <div className="form-header header-row">
        <div>
          <h2>最近打卡</h2>
          <p>按日期查看最近 30 天记录</p>
        </div>
        <button className="secondary export-button" type="button" onClick={onExport}>
          导出 CSV
        </button>
      </div>
      <div className="history-list">
        {listItems.length === 0 ? (
          <EmptyState title="还没有打卡记录" description="在首页点击“我还活着”，这里就会出现记录。" />
        ) : (
          <>
            {visibleItems.map((item) => (
              <div key={item.date} className="history-item">
                <div
                  className={`history-row clickable ${item.checked_in ? "hit" : "miss"}`}
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
                  <div className="history-date">
                    <span>{formatDate(item.date)}</span>
                    <span className="muted-inline">
                      {item.checked_in ? "已记录" : "未记录"}
                    </span>
                  </div>
                  <span className="history-metrics">
                    睡眠 {item.sleep_hours ?? "-"}h · 精力 {item.energy ?? "-"} · 心情 {" "}
                    {item.mood ?? "-"}
                  </span>
                </div>
                {expandedDate === dateKey(item.date) ? (
                  <div className="history-detail inline">
                    {editingDate === dateKey(item.date) ? (
                      <>
                        <div className="history-detail-form">
                          <label>
                            睡眠
                            <input
                              type="number"
                              min="0"
                              max="24"
                              value={editDraft.sleep_hours}
                              onChange={(event) =>
                                onEditFieldChange("sleep_hours", event.target.value)
                              }
                            />
                          </label>
                          <label>
                            精力
                            <input
                              type="number"
                              min="1"
                              max="5"
                              value={editDraft.energy}
                              onChange={(event) =>
                                onEditFieldChange("energy", event.target.value)
                              }
                            />
                          </label>
                          <label>
                            心情
                            <input
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
                        <label className="history-detail-note">
                          <span className="muted-inline">备注</span>
                          <textarea
                            rows={2}
                            value={editDraft.note}
                            onChange={(event) =>
                              onEditFieldChange("note", event.target.value)
                            }
                          />
                        </label>
                        <div className="history-detail-actions">
                          <button type="button" className="secondary" onClick={onCancelEdit} disabled={saving}>
                            取消
                          </button>
                          <button
                            type="button"
                            className="primary"
                            onClick={() => onSaveEdit(item)}
                            disabled={saving}
                          >
                            {saving ? "保存中..." : "保存"}
                          </button>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="history-detail-row">
                          睡眠 {item.sleep_hours ?? "-"}h · 精力 {item.energy ?? "-"} · 心情 {" "}
                          {item.mood ?? "-"}
                        </div>
                        <div className="history-detail-note">
                          <span className="muted-inline">备注</span>
                          <p>{checkinsByDate.get(dateKey(item.date))?.note || "无"}</p>
                        </div>
                        <div className="history-detail-actions">
                          {canEdit(item.date) ? (
                            <button type="button" className="link" onClick={() => onStartEdit(item)}>
                              编辑
                            </button>
                          ) : (
                            <span className="muted-inline">仅支持最近 {editWindowDays} 天编辑</span>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                ) : null}
              </div>
            ))}
            {hasMore ? (
              <button type="button" className="secondary load-more" onClick={onLoadMore}>
                加载更多
              </button>
            ) : (
              <div className="inline-notice">已经到底啦，明天继续打卡吧。</div>
            )}
          </>
        )}
      </div>
    </section>
  );
}
