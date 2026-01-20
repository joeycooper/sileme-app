import { Dispatch, SetStateAction } from "react";
import type { GroupDetail, GroupEncouragePost } from "../../../services/api";
import type { NoticeHandlers } from "../../../hooks";
import { useGroupAdminActions } from "./groupActionsAdmin";
import { useGroupMembershipActions } from "./groupActionsMembership";
import { useGroupNotifyActions } from "./groupActionsNotify";
import type { GroupForm } from "./groupTypes";

type GroupActionsDeps = NoticeHandlers & {
  groupForm: GroupForm;
  setGroupForm: Dispatch<SetStateAction<GroupForm>>;
  resetGroupForm: () => void;
  setGroupPanelOpen: Dispatch<SetStateAction<boolean>>;
  selectedGroup: GroupDetail | null;
  setSelectedGroup: Dispatch<SetStateAction<GroupDetail | null>>;
  setSelectedGroupId: Dispatch<SetStateAction<number | null>>;
  refreshGroups: () => Promise<void>;
  openGroupDetail: (groupId: number) => void;
  openGroupEncourage: (groupId: number) => void;
  markGroupJoinRequest: (groupId: number) => void;
  groupEncourageChoice: string;
  setGroupEncourageWall: Dispatch<SetStateAction<GroupEncouragePost[]>>;
  isGroupAdmin: (group: GroupDetail) => boolean;
  announcementDraft: string;
  setIsEditingAnnouncement: Dispatch<SetStateAction<boolean>>;
  groupNameDraft: string;
  setIsEditingGroupName: Dispatch<SetStateAction<boolean>>;
  groupInviteDraft: string;
  setGroupInviteDraft: (value: string) => void;
};

export function useGroupActions({
  showNotice,
  showError,
  groupForm,
  setGroupForm,
  resetGroupForm,
  setGroupPanelOpen,
  selectedGroup,
  setSelectedGroup,
  setSelectedGroupId,
  refreshGroups,
  openGroupDetail,
  openGroupEncourage,
  markGroupJoinRequest,
  groupEncourageChoice,
  setGroupEncourageWall,
  isGroupAdmin,
  announcementDraft,
  setIsEditingAnnouncement,
  groupNameDraft,
  setIsEditingGroupName,
  groupInviteDraft,
  setGroupInviteDraft
}: GroupActionsDeps) {
  const { handleCreateGroup, handleJoinGroup, performJoin, handlePrivateInviteJoin } =
    useGroupMembershipActions({
      showNotice,
      showError,
      groupForm,
      setGroupForm,
      resetGroupForm,
      setGroupPanelOpen,
      setSelectedGroup,
      setSelectedGroupId,
      refreshGroups,
      openGroupDetail,
      openGroupEncourage,
      markGroupJoinRequest,
      groupInviteDraft,
      setGroupInviteDraft
    });
  const { handleUpdateAnnouncement, handleUpdateGroupName, handleRotateInviteCode } =
    useGroupAdminActions({
      showNotice,
      showError,
      selectedGroup,
      setSelectedGroup,
      refreshGroups,
      isGroupAdmin,
      announcementDraft,
      setIsEditingAnnouncement,
      groupNameDraft,
      setIsEditingGroupName
    });
  const { handleCopy, handleGroupRemind, handleGroupEncourage } = useGroupNotifyActions({
    showNotice,
    showError,
    selectedGroup,
    groupEncourageChoice,
    setGroupEncourageWall
  });

  return {
    handleCreateGroup,
    handleJoinGroup,
    performJoin,
    handleUpdateAnnouncement,
    handleUpdateGroupName,
    handleRotateInviteCode,
    handleCopy,
    handleGroupRemind,
    handleGroupEncourage,
    handlePrivateInviteJoin
  };
}
