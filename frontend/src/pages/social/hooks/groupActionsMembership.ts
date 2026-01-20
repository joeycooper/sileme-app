import type { Dispatch, SetStateAction } from "react";
import type { GroupDetail } from "../../../services/api";
import { createGroup, joinGroup } from "../../../services/api";
import type { NoticeHandlers } from "../../../hooks";
import type { GroupForm } from "./groupTypes";

type GroupMembershipActionsDeps = NoticeHandlers & {
  groupForm: GroupForm;
  setGroupForm: Dispatch<SetStateAction<GroupForm>>;
  resetGroupForm: () => void;
  setGroupPanelOpen: Dispatch<SetStateAction<boolean>>;
  setSelectedGroup: Dispatch<SetStateAction<GroupDetail | null>>;
  setSelectedGroupId: Dispatch<SetStateAction<number | null>>;
  refreshGroups: () => Promise<void>;
  openGroupDetail: (groupId: number) => void;
  openGroupEncourage: (groupId: number) => void;
  markGroupJoinRequest: (groupId: number) => void;
  groupInviteDraft: string;
  setGroupInviteDraft: (value: string) => void;
};

export function useGroupMembershipActions({
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
}: GroupMembershipActionsDeps) {
  async function performJoin(codeOrId: string) {
    try {
      const detail = await joinGroup({ code_or_id: codeOrId });
      setSelectedGroup(detail);
      setSelectedGroupId(detail.id);
      await refreshGroups();
      if (detail.status === "member") {
        openGroupEncourage(detail.id);
        showNotice("已加入群组");
      } else {
        markGroupJoinRequest(detail.id);
        openGroupDetail(detail.id);
        showNotice("已提交入群申请");
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "加入失败";
      if (message.includes("24 小时") || message.includes("24小时")) {
        showNotice(message);
        return;
      }
      showError(message);
    }
  }

  async function handleCreateGroup() {
    if (!groupForm.name.trim()) {
      showError("请输入群组名称");
      return;
    }
    try {
      const detail = await createGroup({
        name: groupForm.name.trim(),
        privacy: groupForm.privacy,
        requires_approval: groupForm.requiresApproval
      });
      resetGroupForm();
      setGroupPanelOpen(false);
      setSelectedGroup(detail);
      setSelectedGroupId(detail.id);
      await refreshGroups();
      openGroupDetail(detail.id);
      showNotice("群组已创建");
    } catch (err) {
      showError(err instanceof Error ? err.message : "创建群组失败");
    }
  }

  async function handleJoinGroup() {
    if (!groupForm.code.trim()) {
      showError("请输入邀请码或群 ID");
      return;
    }
    await performJoin(groupForm.code.trim());
    setGroupForm((prev) => ({ ...prev, code: "" }));
    setGroupPanelOpen(false);
  }

  async function handlePrivateInviteJoin(group: GroupDetail) {
    const code = groupInviteDraft.trim();
    if (!code) {
      showError("请输入邀请码");
      return;
    }
    await performJoin(code);
    setGroupInviteDraft("");
  }

  return {
    handleCreateGroup,
    handleJoinGroup,
    performJoin,
    handlePrivateInviteJoin
  };
}
