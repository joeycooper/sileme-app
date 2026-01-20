import type { Notification } from "../../../services/api";
import {
  formatJoinRequestStatus,
  formatTime,
  noticeKindLabel,
  resolveJoinRequestStatus
} from "./utils";

type NoticeGroup = {
  key: string;
  items: Notification[];
  latest: Notification;
  unreadCount: number;
  name: string;
  avatar?: string | null;
};

type NoticeGroupHeaderProps = {
  group: NoticeGroup;
  isOpen: boolean;
  onToggle: () => void;
};

type NoticeGroupRowProps = {
  item: Notification;
  onRead: (id: number) => void;
  onApprove: (item: Notification) => void;
  onReject: (item: Notification) => void;
};

export function NoticeGroupHeader({ group, isOpen, onToggle }: NoticeGroupHeaderProps) {
  const isGroupNotice = Boolean(group.latest.related_group_id);
  return (
    <button className="notice-group-header" type="button" onClick={onToggle}>
      <div className="notice-left">
        <div className={`friend-avatar notice-avatar ${isGroupNotice ? "group" : ""}`}>
          {isGroupNotice ? (
            <span className="notice-group-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" role="img" focusable="false">
                <circle cx="9" cy="9" r="3" fill="currentColor" />
                <circle cx="16" cy="10" r="2.5" fill="currentColor" />
                <path
                  d="M4 19c0-3 3-5 7-5s7 2 7 5"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  fill="none"
                  strokeLinecap="round"
                />
              </svg>
            </span>
          ) : group.avatar ? (
            <img src={group.avatar} alt={group.name} />
          ) : (
            <span className="friend-avatar-fallback" aria-hidden="true" />
          )}
        </div>
        <div>
          <div className="notice-title">
            <span className="notice-name">{group.name}</span>
            <span className={`notice-type ${group.latest.kind}`}>
              {noticeKindLabel(group.latest.kind)}
            </span>
            <span className="notice-time">{formatTime(group.latest.created_at)}</span>
          </div>
          <div className="notice-message">{group.latest.message}</div>
        </div>
      </div>
      <span className="notice-mark" aria-hidden="true">
        {group.unreadCount ? (
          <>
            <span className="notice-dot" />
            <span className="notice-badge notice-count">未读 {group.unreadCount}</span>
          </>
        ) : null}
        <span className={`notice-chevron ${isOpen ? "open" : ""}`}>›</span>
      </span>
    </button>
  );
}

export function NoticeGroupRow({ item, onRead, onApprove, onReject }: NoticeGroupRowProps) {
  return (
    <div
      className={`notice-row sub ${item.read_at ? "" : "unread"}`}
      role="button"
      tabIndex={0}
      onClick={() => onRead(item.id)}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onRead(item.id);
        }
      }}
    >
      <div className="notice-left">
        <div className="notice-title">
          <span className={`notice-type ${item.kind}`}>{noticeKindLabel(item.kind)}</span>
          <span className="notice-time">{formatTime(item.created_at)}</span>
        </div>
        {item.kind.startsWith("group_join") && resolveJoinRequestStatus(item) !== "pending" ? null : (
          <div className="notice-message">{item.message}</div>
        )}
        {item.kind.startsWith("group_join") ? (
          resolveJoinRequestStatus(item) === "pending" ? (
            <div className="notice-action-row">
              <button
                className="secondary"
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  onApprove(item);
                }}
              >
                通过
              </button>
              <button
                className="secondary"
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  onReject(item);
                }}
              >
                拒绝
              </button>
            </div>
          ) : (
            <div className="notice-action-row muted">{formatJoinRequestStatus(item)}</div>
          )
        ) : null}
      </div>
      {!item.read_at ? <span className="notice-dot" aria-hidden="true" /> : null}
    </div>
  );
}
