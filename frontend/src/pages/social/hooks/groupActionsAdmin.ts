import type { Dispatch, SetStateAction } from "react";
import type { GroupDetail } from "../../../services/api";
import { rotateGroupInviteCode, updateGroupAnnouncement, updateGroupName } from "../../../services/api";
import type { NoticeHandlers } from "../../../hooks";

type GroupAdminActionsDeps = NoticeHandlers & {
  selectedGroup: GroupDetail | null;
  setSelectedGroup: Dispatch<SetStateAction<GroupDetail | null>>;
  refreshGroups: () => Promise<void>;
  isGroupAdmin: (group: GroupDetail) => boolean;
  announcementDraft: string;
  setIsEditingAnnouncement: Dispatch<SetStateAction<boolean>>;
  groupNameDraft: string;
  setIsEditingGroupName: Dispatch<SetStateAction<boolean>>;
};

export function useGroupAdminActions({
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
}: GroupAdminActionsDeps) {
  async function handleUpdateAnnouncement() {
    if (!selectedGroup || !isGroupAdmin(selectedGroup)) return;
    try {
      const updated = await updateGroupAnnouncement(
        selectedGroup.id,
        announcementDraft.trim() || selectedGroup.announcement || ""
      );
      setSelectedGroup(updated);
      setIsEditingAnnouncement(false);
      showNotice("公告已更新");
    } catch (err) {
      showError(err instanceof Error ? err.message : "更新失败");
    }
  }

  async function handleUpdateGroupName() {
    if (!selectedGroup || !isGroupAdmin(selectedGroup)) return;
    if (!groupNameDraft.trim()) {
      showError("群名称不能为空");
      return;
    }
    try {
      const updated = await updateGroupName(selectedGroup.id, groupNameDraft.trim());
      setSelectedGroup(updated);
      await refreshGroups();
      setIsEditingGroupName(false);
      showNotice("群名称已更新");
    } catch (err) {
      showError(err instanceof Error ? err.message : "更新失败");
    }
  }

  async function handleRotateInviteCode() {
    if (!selectedGroup || !isGroupAdmin(selectedGroup)) return;
    try {
      const updated = await rotateGroupInviteCode(selectedGroup.id);
      setSelectedGroup(updated);
      showNotice("邀请码已刷新");
    } catch (err) {
      showError(err instanceof Error ? err.message : "更新失败");
    }
  }

  return {
    handleUpdateAnnouncement,
    handleUpdateGroupName,
    handleRotateInviteCode
  };
}
