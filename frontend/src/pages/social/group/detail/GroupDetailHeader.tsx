import type { GroupDetail } from "../../../../services/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

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
    <div className="flex items-center gap-4">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-soft" aria-hidden="true">
        <span className="h-5 w-5 rounded-md bg-brand" />
      </div>
      <div className="space-y-1">
        <div className="flex flex-wrap items-center gap-2">
          {isEditingGroupName ? (
            <Input
              type="text"
              value={groupNameDraft}
              onChange={(event) => onGroupNameChange(event.target.value)}
              name="group_name_edit"
              className="h-9 w-48"
            />
          ) : (
            <h4 className="text-lg font-semibold text-ink">{group.name}</h4>
          )}
          {isAdmin ? (
            <Button variant="ghost" size="sm" type="button" onClick={onToggleGroupNameEdit}>
              {isEditingGroupName ? "保存" : "改名"}
            </Button>
          ) : null}
        </div>
        <p className="text-xs text-muted-foreground">
          {group.members.length} 人 · 今日活跃{" "}
          {group.members.filter((member) => member.checked_in).length}
        </p>
      </div>
    </div>
  );
}
