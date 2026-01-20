import type { GroupDetail } from "../../../../services/api";

type GroupIdentityRowProps = {
  group: GroupDetail;
  isAdmin: boolean;
  isMember: boolean;
  onCopy: (text: string, message: string) => void;
  onRotateInviteCode: () => void;
};

export default function GroupIdentityRow({
  group,
  isAdmin,
  isMember,
  onCopy,
  onRotateInviteCode
}: GroupIdentityRowProps) {
  if (!isMember) return null;
  return (
    <div className="group-id-row">
      <span>群 ID：{group.id}</span>
      <button
        className="link"
        type="button"
        onClick={() => onCopy(String(group.id), "群 ID 已复制")}
      >
        复制
      </button>
      {group.privacy === "private" && group.join_code ? (
        <span className="group-invite">
          邀请码：{group.join_code}
          <button
            className="link"
            type="button"
            onClick={() => onCopy(group.join_code || "", "邀请码已复制")}
          >
            复制
          </button>
          {isAdmin ? (
            <button className="link" type="button" onClick={onRotateInviteCode}>
              刷新
            </button>
          ) : null}
        </span>
      ) : null}
    </div>
  );
}
