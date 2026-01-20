import type { useGroups } from "../hooks";
import GroupPanelSheet from "../group/panel/GroupPanelSheet";

type GroupPanelSheetContainerProps = {
  groupState: ReturnType<typeof useGroups>;
};

export default function GroupPanelSheetContainer({ groupState }: GroupPanelSheetContainerProps) {
  const {
    groupPanelOpen,
    setGroupPanelOpen,
    groupForm,
    updateGroupField,
    handleJoinGroup,
    handleCreateGroup
  } = groupState;

  return (
    <GroupPanelSheet
      open={groupPanelOpen}
      form={groupForm}
      onClose={() => setGroupPanelOpen(false)}
      onJoin={handleJoinGroup}
      onCreate={handleCreateGroup}
      onFieldChange={updateGroupField}
    />
  );
}
