import type { Friend } from "../../../../services/api";

const DEFAULT_NAME = "未设置昵称";

type FriendCardProps = {
  friend: Friend;
  isExpanded: boolean;
  onToggle: () => void;
};

function statusLabel(status: string) {
  if (status === "pending_in") return "待确认";
  if (status === "pending_out") return "已发送";
  if (status === "accepted") return "好友";
  return "未知";
}

export default function FriendCard({ friend, isExpanded, onToggle }: FriendCardProps) {
  return (
    <button
      type="button"
      className="flex w-full items-center justify-between gap-3 rounded-2xl border border-border bg-white/90 px-4 py-3 text-left transition hover:border-brand/40 hover:shadow-sm"
      onClick={onToggle}
    >
      <div className="flex items-center gap-3">
        <div className="h-12 w-12 overflow-hidden rounded-2xl border border-border bg-brand-soft">
          {friend.avatar_url ? (
            <img src={friend.avatar_url} alt={friend.nickname || "好友头像"} className="h-full w-full object-cover" />
          ) : (
            <span className="flex h-full w-full items-center justify-center text-xs text-brand" aria-hidden="true">
              ···
            </span>
          )}
        </div>
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <div className="text-sm font-semibold text-ink">{friend.nickname || DEFAULT_NAME}</div>
            <span className="rounded-full bg-brand-soft px-2 py-0.5 text-xs font-semibold text-brand">
              {statusLabel(friend.status)}
            </span>
          </div>
          <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
            <span>{friend.today_checked_in ? "今日已打卡" : "今日未打卡"}</span>
            <span>连续 {friend.streak_days} 天</span>
          </div>
          {friend.status === "pending_in" && friend.message ? (
            <div className="text-xs text-muted-foreground">留言：{friend.message}</div>
          ) : null}
        </div>
      </div>
      <span className="text-xs font-semibold text-brand">{isExpanded ? "收起" : "查看"}</span>
    </button>
  );
}
