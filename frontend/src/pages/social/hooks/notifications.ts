import { useCallback } from "react";
import { Notification, getNotifications } from "../../../services/api";
import { useAsyncList } from "../../../hooks";
import type { NoticeHandlers } from "../../../hooks";
import { useNotificationActions } from "./notificationActions";
import { useNotificationGroups } from "./notificationGroups";

export function useNotifications({ showNotice, showError }: NoticeHandlers) {
  const handleError = useCallback(
    (message: string) => {
      showError(message || "通知加载失败");
    },
    [showError]
  );

  const loadNotifications = useCallback(() => {
    return getNotifications({ limit: 20 });
  }, []);

  const { items, setItems, loading, refresh } = useAsyncList<Notification>({
    load: loadNotifications,
    onError: handleError
  });
  const notifications = items;
  const { groupedNotifications, openNoticeGroups, toggleNoticeGroup } =
    useNotificationGroups(notifications);
  const {
    handleReadNotification,
    handleMarkAllRead,
    handleApproveJoinRequest,
    handleRejectJoinRequest
  } = useNotificationActions({ showNotice, showError, setNotifications: setItems });

  const refreshNotifications = useCallback(() => {
    return refresh();
  }, [refresh]);

  return {
    notifications,
    loadingNotifications: loading,
    groupedNotifications,
    openNoticeGroups,
    setNotifications: setItems,
    refreshNotifications,
    handleReadNotification,
    handleMarkAllRead,
    handleApproveJoinRequest,
    handleRejectJoinRequest,
    toggleNoticeGroup
  };
}
