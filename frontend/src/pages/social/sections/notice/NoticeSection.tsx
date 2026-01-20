import { NoticeList, SectionHeader } from "../../../../components/common";
import type { NoticeSectionProps } from "../../hooks/sectionProps";
import NoticeGroupList from "./NoticeGroupList";

export default function NoticeSection({
  groupedNotifications,
  notifications,
  loading,
  openNoticeGroups,
  onToggleGroup,
  onMarkAllRead,
  onRefresh,
  onReadNotification,
  onApprove,
  onReject
}: NoticeSectionProps) {
  const hasUnread = notifications.some((item) => !item.read_at);
  return (
    <section className="card">
      <SectionHeader
        title="站内通知"
        subtitle="提醒与鼓励会显示在这里"
        className="notice-header"
        actions={
          <>
            <button
              className={`secondary ${hasUnread ? "" : "secondary-muted"}`}
              type="button"
              onClick={onMarkAllRead}
              disabled={!hasUnread}
            >
              {hasUnread ? "全部已读" : "暂无未读"}
            </button>
            <button className="secondary" type="button" onClick={onRefresh}>
              刷新
            </button>
          </>
        }
      />
      <NoticeList
        loading={loading}
        isEmpty={groupedNotifications.length === 0}
        emptyTitle="暂无通知"
        emptyDescription="好友提醒或鼓励会显示在这里"
      >
        <NoticeGroupList
          groupedNotifications={groupedNotifications}
          openNoticeGroups={openNoticeGroups}
          onToggleGroup={onToggleGroup}
          onReadNotification={onReadNotification}
          onApprove={onApprove}
          onReject={onReject}
        />
      </NoticeList>
    </section>
  );
}
