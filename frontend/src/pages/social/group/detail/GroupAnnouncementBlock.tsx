import type { GroupDetail } from "../../../../services/api";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

type GroupAnnouncementBlockProps = {
  group: GroupDetail;
  isAdmin: boolean;
  isMember: boolean;
  isEditingAnnouncement: boolean;
  announcementDraft: string;
  onToggleAnnouncementEdit: () => void;
  onAnnouncementChange: (value: string) => void;
  onCancelAnnouncement: () => void;
  onSaveAnnouncement: () => void;
};

export default function GroupAnnouncementBlock({
  group,
  isAdmin,
  isMember,
  isEditingAnnouncement,
  announcementDraft,
  onToggleAnnouncementEdit,
  onAnnouncementChange,
  onCancelAnnouncement,
  onSaveAnnouncement
}: GroupAnnouncementBlockProps) {
  return (
    <div className="space-y-3 rounded-2xl border border-border/70 bg-white/90 p-5 text-sm text-muted-foreground shadow-sm">
      <div className="flex items-center justify-between">
        <h5 className="text-sm font-semibold text-ink">群公告</h5>
        {isAdmin ? (
          <Button variant="ghost" size="sm" type="button" onClick={onToggleAnnouncementEdit}>
            {isEditingAnnouncement ? "收起" : "编辑"}
          </Button>
        ) : null}
      </div>
      {group.privacy === "private" && !isMember ? (
        <p>私密群暂不展示公告内容</p>
      ) : isEditingAnnouncement && isAdmin ? (
        <div className="space-y-3">
          <Textarea
            value={announcementDraft}
            onChange={(event) => onAnnouncementChange(event.target.value)}
            rows={3}
            name="group_announcement"
          />
          <div className="flex justify-end gap-2">
            <Button variant="outline" type="button" onClick={onCancelAnnouncement}>
              取消
            </Button>
            <Button type="button" onClick={onSaveAnnouncement}>
              保存
            </Button>
          </div>
        </div>
      ) : (
        <p>{group.announcement}</p>
      )}
    </div>
  );
}
