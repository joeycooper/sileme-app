import type { GroupDetail } from "../../../../services/api";

type GroupMembersBlockProps = {
  group: GroupDetail;
  isMember: boolean;
};

export default function GroupMembersBlock({ group, isMember }: GroupMembersBlockProps) {
  return (
    <div className="group-detail-block">
      <div className="group-block-header">
        <h5>成员</h5>
        <span className="muted">仅展示前 12 位</span>
      </div>
      {group.privacy === "private" && !isMember ? (
        <p>私密群暂不展示成员信息</p>
      ) : (
        <div className="group-members">
          {group.members.slice(0, 12).map((member) => (
            <div key={member.id} className="group-member">
              <span className="group-member-avatar" aria-hidden="true" />
              <span>
                {member.name}
                {member.role === "owner" ? " · 群主" : ""}
                {member.role === "admin" ? " · 管理" : ""}
              </span>
              {member.checked_in ? <em>已打卡</em> : <em>未打卡</em>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
