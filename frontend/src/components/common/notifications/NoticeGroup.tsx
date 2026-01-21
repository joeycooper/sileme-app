import type { Notification } from "../../../services/api";
import {
  formatJoinRequestStatus,
  formatTime,
  noticeKindLabel,
  resolveJoinRequestStatus
} from "./utils";
import { Button } from "@/components/ui/button";
import { Users } from "lucide-react";

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
    <button
      className="flex w-full items-center justify-between gap-3 rounded-2xl px-4 py-3 text-left transition hover:bg-brand/5"
      type="button"
      onClick={onToggle}
    >
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 overflow-hidden rounded-xl border border-border bg-brand-soft text-brand">
          {isGroupNotice ? (
            <Users className="h-full w-full p-2" aria-hidden="true" />
          ) : group.avatar ? (
            <img src={group.avatar} alt={group.name} className="h-full w-full object-cover" />
          ) : (
            <span className="flex h-full w-full items-center justify-center text-xs" aria-hidden="true">
              ···
            </span>
          )}
        </div>
        <div>
          <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            <span className="text-sm font-semibold text-ink">{group.name}</span>
            <span className="rounded-full bg-brand-soft px-2 py-0.5 text-[11px] font-semibold text-brand">
              {noticeKindLabel(group.latest.kind)}
            </span>
            <span className="text-[11px] text-muted-foreground">{formatTime(group.latest.created_at)}</span>
          </div>
          <div className="text-sm text-ink">{group.latest.message}</div>
        </div>
      </div>
      <span className="flex items-center gap-2 text-xs text-muted-foreground" aria-hidden="true">
        {group.unreadCount ? (
          <span className="rounded-full bg-brand-soft px-2 py-0.5 text-[11px] font-semibold text-brand">
            未读 {group.unreadCount}
          </span>
        ) : null}
        <span className={`text-lg transition ${isOpen ? "rotate-90" : ""}`}>›</span>
      </span>
    </button>
  );
}

export function NoticeGroupRow({ item, onRead, onApprove, onReject }: NoticeGroupRowProps) {
  return (
    <div
      className={`flex w-full cursor-pointer items-start justify-between gap-3 px-4 py-3 text-left text-sm transition ${
        item.read_at ? "text-muted-foreground" : "bg-brand/5 text-ink"
      }`}
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
      <div className="flex-1 space-y-1">
        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-600">
            {noticeKindLabel(item.kind)}
          </span>
          <span className="text-[11px]">{formatTime(item.created_at)}</span>
        </div>
        {item.kind.startsWith("group_join") && resolveJoinRequestStatus(item) !== "pending" ? null : (
          <div className="text-sm text-ink">{item.message}</div>
        )}
        {item.kind.startsWith("group_join") ? (
          resolveJoinRequestStatus(item) === "pending" ? (
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                size="sm"
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  onApprove(item);
                }}
              >
                通过
              </Button>
              <Button
                variant="outline"
                size="sm"
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  onReject(item);
                }}
              >
                拒绝
              </Button>
            </div>
          ) : (
            <div className="text-xs text-muted-foreground">{formatJoinRequestStatus(item)}</div>
          )
        ) : null}
      </div>
      {!item.read_at ? <span className="mt-2 h-2 w-2 rounded-full bg-orange-400" aria-hidden="true" /> : null}
    </div>
  );
}
