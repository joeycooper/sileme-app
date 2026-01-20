import type { useGroups } from "../hooks";
import GroupDetailSheet from "./GroupDetailSheet";

type GroupDetailSheetContainerProps = {
  groupState: ReturnType<typeof useGroups>;
};

export default function GroupDetailSheetContainer({ groupState }: GroupDetailSheetContainerProps) {
  const {
    selectedGroup,
    setSelectedGroupId,
    groupDetailOpen,
    setGroupDetailOpen,
    groupNameDraft,
    groupInviteDraft,
    announcementDraft,
    setDraft,
    updateDraftField,
    isEditingGroupName,
    setIsEditingGroupName,
    isEditingAnnouncement,
    setIsEditingAnnouncement,
    isGroupMember,
    isGroupAdmin,
    openGroupEncourage,
    groupJoinCooldown,
    handleUpdateGroupName,
    handleUpdateAnnouncement,
    handleRotateInviteCode,
    handleCopy,
    handleGroupRemind,
    handlePrivateInviteJoin,
    performJoin
  } = groupState;

  return (
    <GroupDetailSheet
      open={groupDetailOpen}
      group={selectedGroup}
      groupNameDraft={groupNameDraft}
      groupInviteDraft={groupInviteDraft}
      announcementDraft={announcementDraft}
      isEditingGroupName={isEditingGroupName}
      isEditingAnnouncement={isEditingAnnouncement}
      isMember={selectedGroup ? isGroupMember(selectedGroup) : false}
      isAdmin={selectedGroup ? isGroupAdmin(selectedGroup) : false}
      isPrivate={selectedGroup?.privacy === "private"}
      joinCooldownActive={Boolean(groupJoinCooldown)}
      onClose={() => {
        setGroupDetailOpen(false);
        setSelectedGroupId(null);
      }}
      onToggleGroupNameEdit={() => {
        if (isEditingGroupName) {
          handleUpdateGroupName();
        } else {
          setIsEditingGroupName(true);
        }
      }}
      onGroupNameChange={(value) => updateDraftField("groupNameDraft", value)}
      onCopy={handleCopy}
      onRotateInviteCode={handleRotateInviteCode}
      onToggleAnnouncementEdit={() => setIsEditingAnnouncement((prev) => !prev)}
      onAnnouncementChange={(value) => updateDraftField("announcementDraft", value)}
      onCancelAnnouncement={() => {
        if (selectedGroup) {
          setDraft((prev) => ({ ...prev, announcementDraft: selectedGroup.announcement }));
        }
        setIsEditingAnnouncement(false);
      }}
      onSaveAnnouncement={handleUpdateAnnouncement}
      onOpenEncourage={() => {
        if (selectedGroup) {
          openGroupEncourage(selectedGroup.id);
        }
      }}
      onGroupRemind={handleGroupRemind}
      onJoinDirect={() => {
        if (selectedGroup) {
          performJoin(String(selectedGroup.id));
        }
      }}
      onJoinRequest={() => {
        if (selectedGroup) {
          performJoin(String(selectedGroup.id));
        }
      }}
      onInviteChange={(value) => updateDraftField("groupInviteDraft", value)}
      onJoinPrivate={() => {
        if (selectedGroup) {
          handlePrivateInviteJoin(selectedGroup);
        }
      }}
    />
  );
}
