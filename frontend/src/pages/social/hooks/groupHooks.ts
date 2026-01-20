import { useEffect, useState } from "react";
import { GroupDetail, GroupEncouragePost, getGroupEncouragements } from "../../../services/api";
import { useFormState } from "../../../hooks";
import type { GroupForm } from "./groupTypes";

export function useGroupForm() {
  const {
    form: groupForm,
    setForm: setGroupForm,
    updateField: updateGroupField,
    resetForm
  } = useFormState<GroupForm>({
    name: "",
    code: "",
    privacy: "public",
    requiresApproval: true
  });
  return { groupForm, setGroupForm, updateGroupField, resetGroupForm: resetForm };
}

export function useGroupDetailDrafts(selectedGroup: GroupDetail | null) {
  const { form: draft, setForm: setDraft, updateField: updateDraftField } = useFormState({
    groupInviteDraft: "",
    announcementDraft: "",
    groupNameDraft: ""
  });
  const [isEditingAnnouncement, setIsEditingAnnouncement] = useState(false);
  const [isEditingGroupName, setIsEditingGroupName] = useState(false);

  useEffect(() => {
    if (!selectedGroup) {
      setDraft({
        groupInviteDraft: "",
        announcementDraft: "",
        groupNameDraft: ""
      });
      setIsEditingAnnouncement(false);
      setIsEditingGroupName(false);
      return;
    }
    setDraft({
      groupInviteDraft: "",
      announcementDraft: selectedGroup.announcement ?? "",
      groupNameDraft: selectedGroup.name
    });
    setIsEditingAnnouncement(false);
    setIsEditingGroupName(false);
  }, [selectedGroup]);

  return {
    draft,
    setDraft,
    updateDraftField,
    isEditingAnnouncement,
    setIsEditingAnnouncement,
    isEditingGroupName,
    setIsEditingGroupName
  };
}

export function useGroupEncourageWall(
  selectedGroupId: number | null,
  groupEncourageOpen: boolean,
  showError: (message: string) => void
) {
  const [groupEncourageWall, setGroupEncourageWall] = useState<GroupEncouragePost[]>([]);

  useEffect(() => {
    if (selectedGroupId === null) {
      setGroupEncourageWall([]);
    }
  }, [selectedGroupId]);

  useEffect(() => {
    if (!groupEncourageOpen || selectedGroupId === null) return;
    (async () => {
      try {
        const posts = await getGroupEncouragements(selectedGroupId);
        setGroupEncourageWall(posts);
      } catch (err) {
        showError(err instanceof Error ? err.message : "鼓励墙加载失败");
      }
    })();
  }, [groupEncourageOpen, selectedGroupId, showError]);

  return { groupEncourageWall, setGroupEncourageWall };
}
