import type { Notification } from "../../../../services/api";
import type { GroupedNotice } from "../../notifications/selectors";
import { NoticeGroupHeader, NoticeGroupRow } from "../../../../components/common/notifications";

type NoticeGroupListProps = {
  groupedNotifications: GroupedNotice[];
  openNoticeGroups: Record<string, boolean>;
  onToggleGroup: (key: string) => void;
  onReadNotification: (id: number) => void;
  onApprove: (item: Notification) => void;
  onReject: (item: Notification) => void;
};

export default function NoticeGroupList({
  groupedNotifications,
  openNoticeGroups,
  onToggleGroup,
  onReadNotification,
  onApprove,
  onReject
}: NoticeGroupListProps) {
  return (
    <>
      {groupedNotifications.map((group) => {
        const isOpen = openNoticeGroups[group.key];
        return (
          <div key={group.key} className={`notice-group ${group.unreadCount ? "unread" : ""}`}>
            <NoticeGroupHeader
              group={group}
              isOpen={isOpen}
              onToggle={() => onToggleGroup(group.key)}
            />
            {isOpen ? (
              <div className="notice-group-body">
                {group.items.map((item) => (
                  <NoticeGroupRow
                    key={item.id}
                    item={item}
                    onRead={onReadNotification}
                    onApprove={onApprove}
                    onReject={onReject}
                  />
                ))}
              </div>
            ) : null}
          </div>
        );
      })}
    </>
  );
}
