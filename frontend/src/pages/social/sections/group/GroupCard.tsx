import type { GroupSummary } from "../../../../services/api";

type GroupCardProps = {
  group: GroupSummary;
  isMember: boolean;
  onOpenDetail: (groupId: number) => void;
  onOpenEncourage: (groupId: number) => void;
};

export default function GroupCard({
  group,
  isMember,
  onOpenDetail,
  onOpenEncourage
}: GroupCardProps) {
  return (
    <button
      className="group-card"
      type="button"
      onClick={() => (isMember ? onOpenEncourage(group.id) : onOpenDetail(group.id))}
    >
      <div className="group-avatar" aria-hidden="true">
        <span className="group-avatar-mark" />
      </div>
      <div className="group-info">
        <div className="group-name">
          {group.name}
          {group.privacy === "private" ? (
            <span className="group-badge private">私密</span>
          ) : null}
          {isMember && group.unread_count ? (
            <span className="group-badge">未读 {group.unread_count}</span>
          ) : null}
        </div>
        <div className="group-meta">
          <span>{group.members_count} 人</span>
          <span>今日活跃 {group.active_today}</span>
        </div>
      </div>
      <span className="group-chevron" aria-hidden="true">
        ›
      </span>
    </button>
  );
}
