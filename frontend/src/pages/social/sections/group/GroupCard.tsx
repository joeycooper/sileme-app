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
      className="flex w-full items-center gap-3 rounded-2xl border border-border bg-white/90 px-4 py-3 text-left transition hover:border-brand/40 hover:shadow-sm"
      type="button"
      onClick={() => (isMember ? onOpenEncourage(group.id) : onOpenDetail(group.id))}
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-soft" aria-hidden="true">
        <span className="h-4 w-4 rounded-md bg-brand" />
      </div>
      <div className="flex-1 space-y-1">
        <div className="flex flex-wrap items-center gap-2 text-sm font-semibold text-ink">
          {group.name}
          {group.privacy === "private" ? (
            <span className="rounded-full bg-slate-200 px-2 py-0.5 text-xs font-semibold text-slate-600">
              私密
            </span>
          ) : null}
          {isMember && group.unread_count ? (
            <span className="rounded-full bg-brand-soft px-2 py-0.5 text-xs font-semibold text-brand">
              未读 {group.unread_count}
            </span>
          ) : null}
        </div>
        <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
          <span>{group.members_count} 人</span>
          <span>今日活跃 {group.active_today}</span>
        </div>
      </div>
      <span className="text-lg text-muted-foreground" aria-hidden="true">
        ›
      </span>
    </button>
  );
}
