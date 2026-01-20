import { useCallback, useEffect, useMemo, useState } from "react";
import type { Notification } from "../../../services/api";
import { groupNotifications } from "../notifications/selectors";

export function useNotificationGroups(notifications: Notification[]) {
  const [openNoticeGroups, setOpenNoticeGroups] = useState<Record<string, boolean>>({});

  const groupedNotifications = useMemo(
    () => groupNotifications(notifications),
    [notifications]
  );

  useEffect(() => {
    if (groupedNotifications.length === 0) {
      return;
    }
    setOpenNoticeGroups((prev) => {
      const next = { ...prev };
      let changed = false;
      groupedNotifications.forEach((group) => {
        if (next[group.key] === undefined) {
          next[group.key] = group.unreadCount > 0;
          changed = true;
        }
      });
      Object.keys(next).forEach((key) => {
        if (!groupedNotifications.find((group) => group.key === key)) {
          delete next[key];
          changed = true;
        }
      });
      return changed ? next : prev;
    });
  }, [groupedNotifications]);

  const toggleNoticeGroup = useCallback((key: string) => {
    setOpenNoticeGroups((prev) => ({ ...prev, [key]: !prev[key] }));
  }, []);

  return { groupedNotifications, openNoticeGroups, toggleNoticeGroup };
}
