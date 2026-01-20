import type { GroupDetail } from "../../../../services/api";

type GroupEncourageRankProps = {
  group: GroupDetail;
  limit?: number;
};

export default function GroupEncourageRank({ group, limit = 5 }: GroupEncourageRankProps) {
  return (
    <div className="group-encourage-card">
      <h5>今日排行榜</h5>
      <ol className="group-rank">
        {group.members.slice(0, limit).map((member, index) => (
          <li key={member.id}>
            <span>{index + 1}</span>
            <div>
              <strong>{member.name}</strong>
              <em>{member.checked_in ? "已打卡" : "未打卡"}</em>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
