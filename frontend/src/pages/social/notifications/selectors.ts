import { Notification } from "../../../services/api";

export type GroupedNotice = {
  key: string;
  items: Notification[];
  latest: Notification;
  unreadCount: number;
  name: string;
  avatar?: string | null;
};

export function groupNotifications(notifications: Notification[]): GroupedNotice[] {
  const groups = new Map<
    string,
    {
      key: string;
      items: Notification[];
      latest: Notification;
      unreadCount: number;
      name: string;
      avatar?: string | null;
    }
  >();

  notifications.forEach((item) => {
    const key = item.related_group_id
      ? `group-${item.related_group_id}`
      : item.from_user_id
      ? `user-${item.from_user_id}`
      : `notice-${item.id}`;
    const name = item.related_group_id
      ? item.related_group_name || "群通知"
      : item.from_user_name || "好友";
    const avatar = item.related_group_id ? null : item.from_user_avatar ?? null;
    if (!groups.has(key)) {
      groups.set(key, { key, items: [item], latest: item, unreadCount: 0, name, avatar });
    } else {
      groups.get(key)?.items.push(item);
    }
  });

  groups.forEach((group) => {
    group.items.sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
    group.latest = group.items[0];
    group.unreadCount = group.items.filter((item) => !item.read_at).length;
    if (group.latest.related_group_id) {
      group.name = group.latest.related_group_name || group.name;
      group.avatar = group.avatar ?? null;
    } else {
      group.name = group.latest.from_user_name || group.name;
      group.avatar = group.latest.from_user_avatar ?? group.avatar;
    }
  });

  return Array.from(groups.values()).sort(
    (a, b) => new Date(b.latest.created_at).getTime() - new Date(a.latest.created_at).getTime()
  );
}
