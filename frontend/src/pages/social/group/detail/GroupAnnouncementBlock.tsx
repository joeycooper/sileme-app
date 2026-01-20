import type { GroupDetail } from "../../../../services/api";

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
    <div className="group-detail-block">
      <div className="group-block-header">
        <h5>群公告</h5>
        {isAdmin ? (
          <button className="link" type="button" onClick={onToggleAnnouncementEdit}>
            {isEditingAnnouncement ? "收起" : "编辑"}
          </button>
        ) : null}
      </div>
      {group.privacy === "private" && !isMember ? (
        <p>私密群暂不展示公告内容</p>
      ) : isEditingAnnouncement && isAdmin ? (
        <div className="group-edit">
          <textarea
            value={announcementDraft}
            onChange={(event) => onAnnouncementChange(event.target.value)}
            rows={3}
            name="group_announcement"
          />
          <div className="group-edit-actions">
            <button className="secondary" type="button" onClick={onCancelAnnouncement}>
              取消
            </button>
            <button className="primary" type="button" onClick={onSaveAnnouncement}>
              保存
            </button>
          </div>
        </div>
      ) : (
        <p>{group.announcement}</p>
      )}
    </div>
  );
}
