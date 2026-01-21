import type { GroupDetail } from "../../../../services/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type GroupActionsBlockProps = {
  group: GroupDetail;
  isMember: boolean;
  joinCooldownActive: boolean;
  groupInviteDraft: string;
  onOpenEncourage: () => void;
  onGroupRemind: () => void;
  onJoinDirect: () => void;
  onJoinRequest: () => void;
  onInviteChange: (value: string) => void;
  onJoinPrivate: () => void;
};

export default function GroupActionsBlock({
  group,
  isMember,
  joinCooldownActive,
  groupInviteDraft,
  onOpenEncourage,
  onGroupRemind,
  onJoinDirect,
  onJoinRequest,
  onInviteChange,
  onJoinPrivate
}: GroupActionsBlockProps) {
  return (
    <div className="space-y-3 rounded-2xl border border-border/70 bg-white/90 p-5 text-sm text-muted-foreground shadow-sm">
      <h5 className="text-sm font-semibold text-ink">操作</h5>
      {isMember ? (
        <div className="flex flex-wrap gap-2">
          <Button type="button" onClick={onOpenEncourage}>
            进入群鼓励
          </Button>
          <Button variant="outline" type="button" onClick={onGroupRemind}>
            群提醒
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {group.privacy === "public" && !group.requires_approval ? (
            <Button type="button" onClick={onJoinDirect}>
              直接加入群组
            </Button>
          ) : group.privacy === "public" ? (
            <Button type="button" onClick={onJoinRequest} disabled={joinCooldownActive}>
              {joinCooldownActive ? "已提交申请" : "申请加入"}
            </Button>
          ) : (
            <div className="grid gap-2">
              <label className="flex flex-col gap-2 text-xs font-medium text-muted-foreground">
                邀请码
                <Input
                  type="text"
                  placeholder="输入邀请码"
                  name="group_invite"
                  value={groupInviteDraft}
                  onChange={(event) => onInviteChange(event.target.value)}
                />
              </label>
              <Button type="button" onClick={onJoinPrivate} disabled={!groupInviteDraft.trim()}>
                加入群组
              </Button>
            </div>
          )}
          <p className="text-xs text-muted-foreground">
            {group.privacy === "public"
              ? group.requires_approval
                ? "该群为公开群，加入需审核"
                : "该群为公开群，无需审核"
              : "该群为隐私群，输入邀请码可直接加入"}
          </p>
        </div>
      )}
    </div>
  );
}
