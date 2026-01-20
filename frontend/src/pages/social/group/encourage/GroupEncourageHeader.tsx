import type { GroupDetail } from "../../../../services/api";

type GroupEncourageHeaderProps = {
  group: GroupDetail;
};

export default function GroupEncourageHeader({ group }: GroupEncourageHeaderProps) {
  const activeCount = group.members.filter((member) => member.checked_in).length;

  return (
    <div className="group-encourage-header">
      <div>
        <h4>{group.name}</h4>
        <p>
          今日活跃 {activeCount} / {group.members.length}
        </p>
      </div>
      <button className="secondary" type="button">
        @提醒
      </button>
    </div>
  );
}
