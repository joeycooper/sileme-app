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
          <div
            key={group.key}
            className={`rounded-2xl border border-border/70 bg-white/90 ${
              group.unreadCount ? "shadow-sm" : ""
            }`}
          >
            <NoticeGroupHeader
              group={group}
              isOpen={isOpen}
              onToggle={() => onToggleGroup(group.key)}
            />
            {isOpen ? (
              <div className="flex flex-col border-t border-dashed border-border/70">
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
