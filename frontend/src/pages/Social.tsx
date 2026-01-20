import AddFriendSheet from "./social/sheets/AddFriendSheet";
import { Toast } from "../components/common";
import { encourageOptions, groupEncourageOptions, messageLimit } from "./social/constants";
import FriendSection from "./social/sections/friend/FriendSection";
import GroupEncouragePage from "./social/group/encourage/GroupEncouragePage";
import GroupDetailSheetContainer from "./social/sheets/GroupDetailSheetContainer";
import GroupPanelSheetContainer from "./social/sheets/GroupPanelSheetContainer";
import GroupSection from "./social/sections/group/GroupSection";
import {
  useFriends,
  useGroups,
  useNotice,
  useNotifications,
  useAddFriendSheet,
  useSocialOverlayLock,
  useSocialSections
} from "./social/hooks/index";
import NoticeSection from "./social/sections/notice/NoticeSection";
import { formatTime } from "../components/common/notifications";

export default function Social() {
  const { notice, showNotice, showError } = useNotice();

  const groupState = useGroups({ showNotice, showError });
  const {
    groups,
    refreshGroups,
    selectedGroup,
    groupEncourageOpen,
    setGroupEncourageOpen,
    groupDetailOpen,
    setGroupDetailOpen,
    groupPanelOpen,
    setGroupPanelOpen,
    groupEncourageChoice,
    setGroupEncourageChoice,
    groupEncourageWall,
    isGroupMember,
    openGroupDetail,
    openGroupEncourage,
    handleGroupEncourage
  } = groupState;

  const {
    notifications,
    loadingNotifications,
    groupedNotifications,
    openNoticeGroups,
    toggleNoticeGroup,
    refreshNotifications,
    handleReadNotification,
    handleMarkAllRead,
    handleApproveJoinRequest,
    handleRejectJoinRequest
  } = useNotifications({ showNotice, showError });

  const {
    friends,
    details,
    selectedId,
    loading,
    submitting,
    actionLoadingId,
    encourageChoice,
    setEncourageChoice,
    form,
    updateField: updateFriendField,
    refresh: refreshFriends,
    handleRequest,
    handleAccept,
    handleToggleDetail,
    handlePermissionUpdate,
    handleRemind,
    handleEncourage
  } = useFriends({ showNotice, showError, onAfterNotify: refreshNotifications });
  const addFriendSheet = useAddFriendSheet({ handleRequest });
  const sectionProps = useSocialSections({
    friends,
    details,
    selectedId,
    loading,
    actionLoadingId,
    encourageChoice,
    encourageOptions,
    onEncourageChoiceChange: setEncourageChoice,
    onAddClick: addFriendSheet.onOpen,
    onRefreshFriends: refreshFriends,
    onToggleDetail: handleToggleDetail,
    onAccept: handleAccept,
    onPermissionUpdate: handlePermissionUpdate,
    onRemind: handleRemind,
    onEncourage: handleEncourage,
    groups,
    onOpenPanel: () => setGroupPanelOpen(true),
    onOpenDetail: openGroupDetail,
    onOpenEncourage: openGroupEncourage,
    isGroupMember,
    groupedNotifications,
    notifications,
    loadingNotifications,
    openNoticeGroups,
    onToggleGroup: toggleNoticeGroup,
    onMarkAllRead: handleMarkAllRead,
    onRefreshNotifications: refreshNotifications,
    onReadNotification: handleReadNotification,
    onApprove: (item) => handleApproveJoinRequest(item, refreshGroups),
    onReject: (item) => handleRejectJoinRequest(item, refreshGroups)
  });

  useSocialOverlayLock({
    groupEncourageOpen,
    groupDetailOpen,
    groupPanelOpen,
    addOpen: addFriendSheet.open
  });

  if (groupEncourageOpen) {
    return (
      <GroupEncouragePage
        selectedGroup={selectedGroup}
        groupEncourageWall={groupEncourageWall}
        groupEncourageChoice={groupEncourageChoice}
        groupEncourageOptions={groupEncourageOptions}
        notice={notice}
        onClose={() => setGroupEncourageOpen(false)}
        onOpenDetail={() => {
          setGroupEncourageOpen(false);
          setGroupDetailOpen(true);
        }}
        onEncourageChoiceChange={setGroupEncourageChoice}
        onSendEncourage={handleGroupEncourage}
        formatTime={formatTime}
      />
    );
  }

  return (
    <div className="page page-social">
      <FriendSection
        friends={sectionProps.friend.friends}
        details={sectionProps.friend.details}
        selectedId={sectionProps.friend.selectedId}
        loading={sectionProps.friend.loading}
        actionLoadingId={sectionProps.friend.actionLoadingId}
        encourageChoice={sectionProps.friend.encourageChoice}
        encourageOptions={sectionProps.friend.encourageOptions}
        onEncourageChoiceChange={sectionProps.friend.onEncourageChoiceChange}
        onAddClick={sectionProps.friend.onAddClick}
        onRefresh={sectionProps.friend.onRefresh}
        onToggleDetail={sectionProps.friend.onToggleDetail}
        onAccept={sectionProps.friend.onAccept}
        onPermissionUpdate={sectionProps.friend.onPermissionUpdate}
        onRemind={sectionProps.friend.onRemind}
        onEncourage={sectionProps.friend.onEncourage}
      />

      <GroupSection
        groups={sectionProps.group.groups}
        onOpenPanel={sectionProps.group.onOpenPanel}
        onOpenDetail={sectionProps.group.onOpenDetail}
        onOpenEncourage={sectionProps.group.onOpenEncourage}
        isGroupMember={sectionProps.group.isGroupMember}
      />

      <NoticeSection
        groupedNotifications={sectionProps.notice.groupedNotifications}
        notifications={sectionProps.notice.notifications}
        loading={sectionProps.notice.loading}
        openNoticeGroups={sectionProps.notice.openNoticeGroups}
        onToggleGroup={sectionProps.notice.onToggleGroup}
        onMarkAllRead={sectionProps.notice.onMarkAllRead}
        onRefresh={sectionProps.notice.onRefresh}
        onReadNotification={sectionProps.notice.onReadNotification}
        onApprove={sectionProps.notice.onApprove}
        onReject={sectionProps.notice.onReject}
      />

      <AddFriendSheet
        open={addFriendSheet.open}
        phone={form.phone}
        message={form.message}
        messageLimit={messageLimit}
        submitting={submitting}
        onClose={addFriendSheet.onClose}
        onPhoneChange={(value) => updateFriendField("phone", value)}
        onMessageChange={(value) => updateFriendField("message", value)}
        onSubmit={addFriendSheet.handleSubmit}
      />

      <GroupPanelSheetContainer groupState={groupState} />
      <GroupDetailSheetContainer groupState={groupState} />

      <Toast message={notice} />
    </div>
  );
}
