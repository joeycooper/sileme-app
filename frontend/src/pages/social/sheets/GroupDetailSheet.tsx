import { GroupDetail } from "../../../services/api";
import {
  GroupActionsBlock,
  GroupAnnouncementBlock,
  GroupDetailHeader,
  GroupIdentityRow,
  GroupMembersBlock
} from "../group/detail";

type GroupDetailSheetProps = {
  open: boolean;
  group: GroupDetail | null;
  groupNameDraft: string;
  groupInviteDraft: string;
  announcementDraft: string;
  isEditingGroupName: boolean;
  isEditingAnnouncement: boolean;
  isMember: boolean;
  isAdmin: boolean;
  isPrivate: boolean;
  joinCooldownActive: boolean;
  onClose: () => void;
  onToggleGroupNameEdit: () => void;
  onGroupNameChange: (value: string) => void;
  onCopy: (text: string, message: string) => void;
  onRotateInviteCode: () => void;
  onToggleAnnouncementEdit: () => void;
  onAnnouncementChange: (value: string) => void;
  onCancelAnnouncement: () => void;
  onSaveAnnouncement: () => void;
  onOpenEncourage: () => void;
  onGroupRemind: () => void;
  onJoinDirect: () => void;
  onJoinRequest: () => void;
  onInviteChange: (value: string) => void;
  onJoinPrivate: () => void;
};

export default function GroupDetailSheet({
  open,
  group,
  groupNameDraft,
  groupInviteDraft,
  announcementDraft,
  isEditingGroupName,
  isEditingAnnouncement,
  isMember,
  isAdmin,
  isPrivate,
  joinCooldownActive,
  onClose,
  onToggleGroupNameEdit,
  onGroupNameChange,
  onCopy,
  onRotateInviteCode,
  onToggleAnnouncementEdit,
  onAnnouncementChange,
  onCancelAnnouncement,
  onSaveAnnouncement,
  onOpenEncourage,
  onGroupRemind,
  onJoinDirect,
  onJoinRequest,
  onInviteChange,
  onJoinPrivate
}: GroupDetailSheetProps) {
  return (
    <>
      <div className={`sheet-overlay ${open ? "show" : ""}`} onClick={onClose} />
      <div
        className={`sheet ${open ? "show" : ""} ${isPrivate ? "group-detail-fixed" : ""}`}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="sheet-handle" />
        <div className="sheet-header">
          <h3>群组详情</h3>
          <button className="link" type="button" onClick={onClose}>
            关闭
          </button>
        </div>
        {group ? (
          <div className="sheet-section group-detail">
            <GroupDetailHeader
              group={group}
              isAdmin={isAdmin}
              isEditingGroupName={isEditingGroupName}
              groupNameDraft={groupNameDraft}
              onToggleGroupNameEdit={onToggleGroupNameEdit}
              onGroupNameChange={onGroupNameChange}
            />
            <GroupIdentityRow
              group={group}
              isAdmin={isAdmin}
              isMember={isMember}
              onCopy={onCopy}
              onRotateInviteCode={onRotateInviteCode}
            />
            <GroupAnnouncementBlock
              group={group}
              isAdmin={isAdmin}
              isMember={isMember}
              isEditingAnnouncement={isEditingAnnouncement}
              announcementDraft={announcementDraft}
              onToggleAnnouncementEdit={onToggleAnnouncementEdit}
              onAnnouncementChange={onAnnouncementChange}
              onCancelAnnouncement={onCancelAnnouncement}
              onSaveAnnouncement={onSaveAnnouncement}
            />
            <GroupMembersBlock group={group} isMember={isMember} />
            <GroupActionsBlock
              group={group}
              isMember={isMember}
              joinCooldownActive={joinCooldownActive}
              groupInviteDraft={groupInviteDraft}
              onOpenEncourage={onOpenEncourage}
              onGroupRemind={onGroupRemind}
              onJoinDirect={onJoinDirect}
              onJoinRequest={onJoinRequest}
              onInviteChange={onInviteChange}
              onJoinPrivate={onJoinPrivate}
            />
          </div>
        ) : null}
      </div>
    </>
  );
}
