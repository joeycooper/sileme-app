import type { GroupDetail } from "../../../../services/api";

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
    <div className="group-detail-block">
      <h5>操作</h5>
      {isMember ? (
        <div className="group-detail-actions">
          <button className="primary" type="button" onClick={onOpenEncourage}>
            进入群鼓励
          </button>
          <button className="secondary" type="button" onClick={onGroupRemind}>
            群提醒
          </button>
        </div>
      ) : (
        <div className="group-join-actions">
          {group.privacy === "public" && !group.requires_approval ? (
            <button className="primary" type="button" onClick={onJoinDirect}>
              直接加入群组
            </button>
          ) : group.privacy === "public" ? (
            <button
              className="primary"
              type="button"
              onClick={onJoinRequest}
              disabled={joinCooldownActive}
            >
              {joinCooldownActive ? "已提交申请" : "申请加入"}
            </button>
          ) : (
            <div className="group-inline-join">
              <label>
                邀请码
                <input
                  type="text"
                  placeholder="输入邀请码"
                  name="group_invite"
                  value={groupInviteDraft}
                  onChange={(event) => onInviteChange(event.target.value)}
                />
              </label>
              <button
                className="primary"
                type="button"
                onClick={onJoinPrivate}
                disabled={!groupInviteDraft.trim()}
              >
                加入群组
              </button>
            </div>
          )}
          <p className="muted">
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
