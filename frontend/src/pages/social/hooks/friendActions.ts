import type { Dispatch, SetStateAction } from "react";
import {
  FriendDetail,
  FriendPermission,
  acceptFriend,
  encourageFriend,
  remindFriend,
  requestFriend,
  updateFriendPermission
} from "../../../services/api";
import type { NoticeHandlers } from "../../../hooks";

type FriendActionsDeps = NoticeHandlers & {
  form: { phone: string; message: string };
  resetForm: () => void;
  refresh: () => Promise<void>;
  setSubmitting: Dispatch<SetStateAction<boolean>>;
  setActionLoadingId: Dispatch<SetStateAction<number | null>>;
  encourageChoice: string;
  setDetails: Dispatch<SetStateAction<Record<number, FriendDetail>>>;
  onAfterNotify?: () => void;
};

export function useFriendActions({
  showNotice,
  showError,
  onAfterNotify,
  form,
  resetForm,
  refresh,
  setSubmitting,
  setActionLoadingId,
  encourageChoice,
  setDetails
}: FriendActionsDeps) {
  async function handleRequest(onSuccess?: () => void) {
    if (!form.phone.trim()) {
      showError("请输入手机号");
      return;
    }
    setSubmitting(true);
    try {
      await requestFriend({
        phone: form.phone.trim(),
        message: form.message.trim() || undefined
      });
      resetForm();
      onSuccess?.();
      showNotice("已发送好友请求");
      await refresh();
    } catch (err) {
      showError(err instanceof Error ? err.message : "发送失败");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleAccept(friendId: number) {
    setActionLoadingId(friendId);
    try {
      await acceptFriend({ friend_id: friendId });
      showNotice("已通过好友请求");
      await refresh();
    } catch (err) {
      showError(err instanceof Error ? err.message : "操作失败");
    } finally {
      setActionLoadingId(null);
    }
  }

  async function handlePermissionUpdate(friendId: number, payload: FriendPermission) {
    setActionLoadingId(friendId);
    try {
      const updated = await updateFriendPermission(friendId, payload);
      setDetails((prev) => {
        const existing = prev[friendId];
        if (!existing) return prev;
        return { ...prev, [friendId]: { ...existing, permission: updated } };
      });
      showNotice("权限已更新");
    } catch (err) {
      showError(err instanceof Error ? err.message : "更新失败");
    } finally {
      setActionLoadingId(null);
    }
  }

  async function handleRemind(friendId: number) {
    setActionLoadingId(friendId);
    try {
      const res = await remindFriend(friendId);
      if (res.limited) {
        showNotice("今天已提醒过了");
      } else {
        showNotice("提醒已发送");
      }
      onAfterNotify?.();
    } catch (err) {
      showError(err instanceof Error ? err.message : "提醒失败");
    } finally {
      setActionLoadingId(null);
    }
  }

  async function handleEncourage(friendId: number) {
    setActionLoadingId(friendId);
    try {
      await encourageFriend(friendId, { emoji: encourageChoice });
      showNotice("鼓励已发送");
      onAfterNotify?.();
    } catch (err) {
      showError(err instanceof Error ? err.message : "发送失败");
    } finally {
      setActionLoadingId(null);
    }
  }

  return {
    handleRequest,
    handleAccept,
    handlePermissionUpdate,
    handleRemind,
    handleEncourage
  };
}
