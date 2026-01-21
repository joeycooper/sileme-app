import { GroupDetail } from "../../../services/api";
import {
  GroupActionsBlock,
  GroupAnnouncementBlock,
  GroupDetailHeader,
  GroupIdentityRow,
  GroupMembersBlock
} from "../group/detail";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";

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
    <Sheet
      open={open}
      onOpenChange={(next) => {
        if (!next) onClose();
      }}
    >
      <SheetContent
        side="bottom"
        className="max-h-[calc(100vh-120px)] overflow-y-auto rounded-t-3xl border-border/70 bg-white/95 px-6 pb-10"
      >
        <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-slate-200" />
        <SheetHeader className="text-left">
          <SheetTitle>群组详情</SheetTitle>
          <SheetDescription className="sr-only">
            查看群组信息、公告、成员与加入方式。
          </SheetDescription>
        </SheetHeader>
        {group ? (
          <div className="mt-4 flex flex-col gap-4">
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
      </SheetContent>
    </Sheet>
  );
}
