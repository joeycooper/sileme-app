import type { Notification } from "../../../services/api";
import type { GroupedNotice } from "../notifications/selectors";
import type { EncourageOption } from "../sections/friend/types";
import type { Friend, FriendDetail, FriendPermission, GroupSummary } from "../../../services/api";

export type FriendSectionProps = {
  friends: Friend[];
  details: Record<number, FriendDetail>;
  selectedId: number | null;
  loading: boolean;
  actionLoadingId: number | null;
  encourageChoice: string;
  encourageOptions: EncourageOption[];
  onEncourageChoiceChange: (value: string) => void;
  onAddClick: () => void;
  onRefresh: () => void;
  onToggleDetail: (friend: Friend) => void;
  onAccept: (friendId: number) => void;
  onPermissionUpdate: (friendId: number, payload: FriendPermission) => void;
  onRemind: (friendId: number) => void;
  onEncourage: (friendId: number) => void;
};

export type GroupSectionProps = {
  groups: GroupSummary[];
  onOpenPanel: () => void;
  onOpenDetail: (groupId: number) => void;
  onOpenEncourage: (groupId: number) => void;
  isGroupMember: (group: GroupSummary) => boolean;
};

export type NoticeSectionProps = {
  groupedNotifications: GroupedNotice[];
  notifications: Notification[];
  loading: boolean;
  openNoticeGroups: Record<string, boolean>;
  onToggleGroup: (key: string) => void;
  onMarkAllRead: () => void;
  onRefresh: () => void;
  onReadNotification: (id: number) => void;
  onApprove: (item: Notification) => void;
  onReject: (item: Notification) => void;
};

export type SocialSectionProps = {
  friend: FriendSectionProps;
  group: GroupSectionProps;
  notice: NoticeSectionProps;
};

export function buildSocialSectionProps(props: SocialSectionProps) {
  return props;
}
