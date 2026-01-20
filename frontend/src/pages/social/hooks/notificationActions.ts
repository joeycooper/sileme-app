import type { Dispatch, SetStateAction } from "react";
import { useCallback } from "react";
import {
  Notification,
  approveGroupMember,
  markAllNotificationsRead,
  markNotificationRead,
  rejectGroupMember
} from "../../../services/api";
import type { NoticeHandlers } from "../../../hooks";

type NotificationActionsDeps = NoticeHandlers & {
  setNotifications: Dispatch<SetStateAction<Notification[]>>;
};

export function useNotificationActions({
  showNotice,
  showError,
  setNotifications
}: NotificationActionsDeps) {
  const handleReadNotification = useCallback(
    async (notificationId: number) => {
      try {
        await markNotificationRead(notificationId);
        setNotifications((prev) =>
          prev.map((item) =>
            item.id === notificationId ? { ...item, read_at: new Date().toISOString() } : item
          )
        );
      } catch (err) {
        showError(err instanceof Error ? err.message : "标记失败");
      }
    },
    [setNotifications, showError]
  );

  const handleMarkAllRead = useCallback(async () => {
    try {
      await markAllNotificationsRead();
      setNotifications((prev) =>
        prev.map((item) => ({ ...item, read_at: item.read_at || new Date().toISOString() }))
      );
      showNotice("全部已读");
    } catch (err) {
      showError(err instanceof Error ? err.message : "标记失败");
    }
  }, [setNotifications, showError, showNotice]);

  const handleApproveJoinRequest = useCallback(
    async (notification: Notification, onRefreshGroups?: () => void) => {
      if (!notification.related_group_id || !notification.related_user_id) return;
      try {
        await approveGroupMember(notification.related_group_id, notification.related_user_id);
        await markNotificationRead(notification.id);
        setNotifications((prev) =>
          prev.map((item) =>
            item.id === notification.id
              ? {
                  ...item,
                  kind: "group_join_approved",
                  message: "已通过该入群申请",
                  read_at: item.read_at || new Date().toISOString()
                }
              : item
          )
        );
        onRefreshGroups?.();
        showNotice("已通过申请");
      } catch (err) {
        showError(err instanceof Error ? err.message : "操作失败");
      }
    },
    [setNotifications, showError, showNotice]
  );

  const handleRejectJoinRequest = useCallback(
    async (notification: Notification, onRefreshGroups?: () => void) => {
      if (!notification.related_group_id || !notification.related_user_id) return;
      try {
        await rejectGroupMember(notification.related_group_id, notification.related_user_id);
        await markNotificationRead(notification.id);
        setNotifications((prev) =>
          prev.map((item) =>
            item.id === notification.id
              ? {
                  ...item,
                  kind: "group_join_rejected",
                  message: "已拒绝该入群申请",
                  read_at: item.read_at || new Date().toISOString()
                }
              : item
          )
        );
        onRefreshGroups?.();
        showNotice("已拒绝申请");
      } catch (err) {
        showError(err instanceof Error ? err.message : "操作失败");
      }
    },
    [setNotifications, showError, showNotice]
  );

  return {
    handleReadNotification,
    handleMarkAllRead,
    handleApproveJoinRequest,
    handleRejectJoinRequest
  };
}
