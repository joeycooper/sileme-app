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
    <button type="button" className="friend-card" onClick={onToggle}>
      <div className="friend-main">
        <div className="friend-avatar">
          {friend.avatar_url ? (
            <img src={friend.avatar_url} alt={friend.nickname || "好友头像"} />
          ) : (
            <span className="friend-avatar-fallback" aria-hidden="true" />
          )}
        </div>
        <div className="friend-info">
          <div className="friend-name-row">
            <div className="friend-name">{friend.nickname || DEFAULT_NAME}</div>
            <span className="status-pill">{statusLabel(friend.status)}</span>
          </div>
          <div className="friend-meta">
            <span>{friend.today_checked_in ? "今日已打卡" : "今日未打卡"}</span>
            <span>连续 {friend.streak_days} 天</span>
          </div>
          {friend.status === "pending_in" && friend.message ? (
            <div className="friend-message">留言：{friend.message}</div>
          ) : null}
        </div>
      </div>
      <span className="friend-toggle">{isExpanded ? "收起" : "查看"}</span>
    </button>
  );
}
