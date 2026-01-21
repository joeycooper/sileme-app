import type { GroupDetail } from "../../../../services/api";

type GroupMembersBlockProps = {
  group: GroupDetail;
  isMember: boolean;
};

export default function GroupMembersBlock({ group, isMember }: GroupMembersBlockProps) {
  return (
    <div className="space-y-3 rounded-2xl border border-border/70 bg-white/90 p-5 text-sm text-muted-foreground shadow-sm">
      <div className="flex items-center justify-between">
        <h5 className="text-sm font-semibold text-ink">成员</h5>
        <span className="text-xs text-muted-foreground">仅展示前 12 位</span>
      </div>
      {group.privacy === "private" && !isMember ? (
        <p>私密群暂不展示成员信息</p>
      ) : (
        <div className="grid grid-cols-3 gap-3 md:grid-cols-4">
          {group.members.slice(0, 12).map((member) => (
            <div key={member.id} className="flex flex-col items-center gap-1 text-center text-xs">
              <span className="h-9 w-9 rounded-2xl bg-brand-soft" aria-hidden="true" />
              <span className="text-ink">
                {member.name}
                {member.role === "owner" ? " · 群主" : ""}
                {member.role === "admin" ? " · 管理" : ""}
              </span>
              <em className="text-[10px] text-muted-foreground">
                {member.checked_in ? "已打卡" : "未打卡"}
              </em>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
