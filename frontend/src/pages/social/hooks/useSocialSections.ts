import type { SocialSectionProps } from "./sectionProps";
import type {
  FriendSectionParams,
  GroupSectionParams,
  NoticeSectionParams,
  UseSocialSectionsParams
} from "./sectionTypes";

export function useSocialSections({
  friends,
  details,
  selectedId,
  loading,
  actionLoadingId,
  encourageChoice,
  encourageOptions,
  onEncourageChoiceChange,
  onAddClick,
  onRefreshFriends,
  onToggleDetail,
  onAccept,
  onPermissionUpdate,
  onRemind,
  onEncourage,
  groups,
  onOpenPanel,
  onOpenDetail,
  onOpenEncourage,
  isGroupMember,
  groupedNotifications,
  notifications,
  loadingNotifications,
  openNoticeGroups,
  onToggleGroup,
  onMarkAllRead,
  onRefreshNotifications,
  onReadNotification,
  onApprove,
  onReject
}: UseSocialSectionsParams): SocialSectionProps {
  const friend = useFriendSectionProps({
    friends,
    details,
    selectedId,
    loading,
    actionLoadingId,
    encourageChoice,
    encourageOptions,
    onEncourageChoiceChange,
    onAddClick,
    onRefreshFriends,
    onToggleDetail,
    onAccept,
    onPermissionUpdate,
    onRemind,
    onEncourage
  });
  const group = useGroupSectionProps({
    groups,
    onOpenPanel,
    onOpenDetail,
    onOpenEncourage,
    isGroupMember
  });
  const notice = useNoticeSectionProps({
    groupedNotifications,
    notifications,
    loadingNotifications,
    openNoticeGroups,
    onToggleGroup,
    onMarkAllRead,
    onRefreshNotifications,
    onReadNotification,
    onApprove,
    onReject
  });

  return { friend, group, notice };
}

export function useFriendSectionProps({
  friends,
  details,
  selectedId,
  loading,
  actionLoadingId,
  encourageChoice,
  encourageOptions,
  onEncourageChoiceChange,
  onAddClick,
  onRefreshFriends,
  onToggleDetail,
  onAccept,
  onPermissionUpdate,
  onRemind,
  onEncourage
}: FriendSectionParams): SocialSectionProps["friend"] {
  return {
    friends,
    details,
    selectedId,
    loading,
    actionLoadingId,
    encourageChoice,
    encourageOptions,
    onEncourageChoiceChange,
    onAddClick,
    onRefresh: onRefreshFriends,
    onToggleDetail,
    onAccept,
    onPermissionUpdate,
    onRemind,
    onEncourage
  };
}

export function useGroupSectionProps({
  groups,
  onOpenPanel,
  onOpenDetail,
  onOpenEncourage,
  isGroupMember
}: GroupSectionParams): SocialSectionProps["group"] {
  return {
    groups,
    onOpenPanel,
    onOpenDetail,
    onOpenEncourage,
    isGroupMember
  };
}

export function useNoticeSectionProps({
  groupedNotifications,
  notifications,
  loadingNotifications,
  openNoticeGroups,
  onToggleGroup,
  onMarkAllRead,
  onRefreshNotifications,
  onReadNotification,
  onApprove,
  onReject
}: NoticeSectionParams): SocialSectionProps["notice"] {
  return {
    groupedNotifications,
    notifications,
    loading: loadingNotifications,
    openNoticeGroups,
    onToggleGroup,
    onMarkAllRead,
    onRefresh: onRefreshNotifications,
    onReadNotification,
    onApprove,
    onReject
  };
}
