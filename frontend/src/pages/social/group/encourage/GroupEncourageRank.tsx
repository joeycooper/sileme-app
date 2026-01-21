import type { GroupDetail } from "../../../../services/api";

type GroupEncourageRankProps = {
  group: GroupDetail;
  limit?: number;
};

export default function GroupEncourageRank({ group, limit = 5 }: GroupEncourageRankProps) {
  return (
    <div className="space-y-3 rounded-2xl border border-border/70 bg-white/90 p-5 shadow-sm">
      <h5 className="text-sm font-semibold text-ink">今日排行榜</h5>
      <ol className="space-y-2 text-sm">
        {group.members.slice(0, limit).map((member, index) => (
          <li key={member.id} className="flex items-center gap-3 rounded-xl border border-border/60 bg-white/90 px-3 py-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-brand-soft text-xs font-semibold text-brand">
              {index + 1}
            </span>
            <div className="flex flex-col">
              <strong className="text-ink">{member.name}</strong>
              <em className="text-xs text-muted-foreground">{member.checked_in ? "已打卡" : "未打卡"}</em>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
