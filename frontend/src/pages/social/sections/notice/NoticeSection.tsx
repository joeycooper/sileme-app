import { NoticeList, SectionHeader } from "../../../../components/common";
import type { NoticeSectionProps } from "../../hooks/sectionProps";
import NoticeGroupList from "./NoticeGroupList";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

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
    <section>
      <Card className="border-border/70 bg-white/85 shadow-soft backdrop-blur">
        <CardContent className="space-y-4">
          <SectionHeader
            title="站内通知"
            subtitle="提醒与鼓励会显示在这里"
            actions={
              <>
                <Button
                  variant="outline"
                  size="sm"
                  type="button"
                  onClick={onMarkAllRead}
                  disabled={!hasUnread}
                  className="rounded-full"
                >
                  {hasUnread ? "全部已读" : "暂无未读"}
                </Button>
                <Button variant="outline" size="sm" type="button" onClick={onRefresh} className="rounded-full">
                  刷新
                </Button>
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
        </CardContent>
      </Card>
    </section>
  );
}
