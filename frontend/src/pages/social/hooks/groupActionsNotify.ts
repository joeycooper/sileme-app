import type { Dispatch, SetStateAction } from "react";
import type { GroupDetail, GroupEncouragePost } from "../../../services/api";
import {
  getGroupEncouragements,
  sendGroupEncouragement,
  sendGroupReminder
} from "../../../services/api";
import type { NoticeHandlers } from "../../../hooks";

type GroupNotifyActionsDeps = NoticeHandlers & {
  selectedGroup: GroupDetail | null;
  groupEncourageChoice: string;
  setGroupEncourageWall: Dispatch<SetStateAction<GroupEncouragePost[]>>;
};

export function useGroupNotifyActions({
  showNotice,
  showError,
  selectedGroup,
  groupEncourageChoice,
  setGroupEncourageWall
}: GroupNotifyActionsDeps) {
  async function handleCopy(text: string, message: string) {
    try {
      await navigator.clipboard.writeText(text);
      showNotice(message);
    } catch {
      showNotice("复制失败，请手动复制");
    }
  }

  async function handleGroupRemind() {
    if (!selectedGroup) return;
    try {
      await sendGroupReminder(selectedGroup.id);
      showNotice("群提醒已发送");
    } catch (err) {
      showError(err instanceof Error ? err.message : "发送失败");
    }
  }

  async function handleGroupEncourage() {
    if (!selectedGroup) return;
    try {
      await sendGroupEncouragement(selectedGroup.id, {
        emoji: groupEncourageChoice
      });
      showNotice(`群鼓励已发送 ${groupEncourageChoice}`);
      const posts = await getGroupEncouragements(selectedGroup.id);
      setGroupEncourageWall(posts);
    } catch (err) {
      showError(err instanceof Error ? err.message : "发送失败");
    }
  }

  return { handleCopy, handleGroupRemind, handleGroupEncourage };
}
