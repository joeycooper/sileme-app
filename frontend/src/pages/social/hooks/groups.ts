import { useState } from "react";
import type { NoticeHandlers } from "../../../hooks";
import { useGroupActions } from "./groupActions";
import { useGroupDetailDrafts, useGroupEncourageWall, useGroupForm } from "./groupHooks";
import { useGroupJoinRequests } from "./groupJoinRequests";
import { useGroupPermissions } from "./groupPermissions";
import { useCurrentUserId, useGroupList, useGroupSelection } from "./groupState";

export function useGroups({ showNotice, showError }: NoticeHandlers) {
  const { groups, refreshGroups } = useGroupList(showError);
  const {
    selectedGroup,
    setSelectedGroup,
    selectedGroupId,
    setSelectedGroupId,
    groupEncourageOpen,
    setGroupEncourageOpen,
    groupDetailOpen,
    setGroupDetailOpen,
    groupPanelOpen,
    setGroupPanelOpen,
    openGroupDetail,
    openGroupEncourage
  } = useGroupSelection(showError);
  const [groupEncourageChoice, setGroupEncourageChoice] = useState("💪");
  const currentUserId = useCurrentUserId();
  const { isGroupMember, isGroupAdmin } = useGroupPermissions(currentUserId);
  const { groupJoinCooldown, markGroupJoinRequest } = useGroupJoinRequests(selectedGroup);

  const { groupForm, setGroupForm, updateGroupField, resetGroupForm } = useGroupForm();
  const {
    draft,
    setDraft,
    updateDraftField,
    isEditingAnnouncement,
    setIsEditingAnnouncement,
    isEditingGroupName,
    setIsEditingGroupName
  } = useGroupDetailDrafts(selectedGroup);
  const { groupEncourageWall, setGroupEncourageWall } = useGroupEncourageWall(
    selectedGroupId,
    groupEncourageOpen,
    showError
  );

  const {
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
  } = useGroupActions({
    showNotice,
    showError,
    groupForm,
    setGroupForm,
    updateGroupField,
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
    announcementDraft: draft.announcementDraft,
    setIsEditingAnnouncement,
    groupNameDraft: draft.groupNameDraft,
    setIsEditingGroupName,
    groupInviteDraft: draft.groupInviteDraft,
    setGroupInviteDraft: (value: string) => updateDraftField("groupInviteDraft", value)
  });

  return {
    groups,
    refreshGroups,
    selectedGroup,
    selectedGroupId,
    setSelectedGroupId,
    groupEncourageOpen,
    setGroupEncourageOpen,
    groupDetailOpen,
    setGroupDetailOpen,
    groupPanelOpen,
    setGroupPanelOpen,
    groupEncourageChoice,
    setGroupEncourageChoice,
    groupEncourageWall,
    groupForm,
    setGroupForm,
    draft,
    setDraft,
    updateDraftField,
    groupJoinCooldown,
    groupNameDraft: draft.groupNameDraft,
    groupInviteDraft: draft.groupInviteDraft,
    isEditingGroupName,
    setIsEditingGroupName,
    announcementDraft: draft.announcementDraft,
    isEditingAnnouncement,
    setIsEditingAnnouncement,
    isGroupMember,
    isGroupAdmin,
    openGroupDetail,
    openGroupEncourage,
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
