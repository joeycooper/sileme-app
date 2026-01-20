import type { GroupDetail } from "../../../../services/api";

type GroupDetailHeaderProps = {
  group: GroupDetail;
  isAdmin: boolean;
  isEditingGroupName: boolean;
  groupNameDraft: string;
  onToggleGroupNameEdit: () => void;
  onGroupNameChange: (value: string) => void;
};

export default function GroupDetailHeader({
  group,
  isAdmin,
  isEditingGroupName,
  groupNameDraft,
  onToggleGroupNameEdit,
  onGroupNameChange
}: GroupDetailHeaderProps) {
  return (
    <div className="group-detail-header">
      <div className="group-avatar large" aria-hidden="true">
        <span className="group-avatar-mark" />
      </div>
      <div>
        <div className="group-title-row">
          {isEditingGroupName ? (
            <input
              type="text"
              value={groupNameDraft}
              onChange={(event) => onGroupNameChange(event.target.value)}
              name="group_name_edit"
            />
          ) : (
            <h4>{group.name}</h4>
          )}
          {isAdmin ? (
            <button className="link" type="button" onClick={onToggleGroupNameEdit}>
              {isEditingGroupName ? "保存" : "改名"}
            </button>
          ) : null}
        </div>
        <p>
          {group.members.length} 人 · 今日活跃{" "}
          {group.members.filter((member) => member.checked_in).length}
        </p>
      </div>
    </div>
  );
}
