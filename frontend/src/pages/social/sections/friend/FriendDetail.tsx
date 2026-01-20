import { PermissionToggle } from "../../../../components/common";
import type { Friend, FriendDetail, FriendPermission } from "../../../../services/api";
import type { EncourageOption } from "./types";
import FriendDetailActions from "./FriendDetailActions";

type FriendDetailProps = {
  friend: Friend;
  detail?: FriendDetail;
  actionLoadingId: number | null;
  encourageChoice: string;
  encourageOptions: EncourageOption[];
  onEncourageChoiceChange: (value: string) => void;
  onAccept: (friendId: number) => void;
  onPermissionUpdate: (friendId: number, payload: FriendPermission) => void;
  onRemind: (friendId: number) => void;
  onEncourage: (friendId: number) => void;
};

export default function FriendDetailCard({
  friend,
  detail,
  actionLoadingId,
  encourageChoice,
  encourageOptions,
  onEncourageChoiceChange,
  onAccept,
  onPermissionUpdate,
  onRemind,
  onEncourage
}: FriendDetailProps) {
  return (
    <div className="friend-detail">
      <div className="detail-row">
        <span>手机号</span>
        <strong>{detail?.phone ?? "-"}</strong>
      </div>
      <div className="detail-row">
        <span>最近打卡</span>
        <strong>{detail?.last_checkin_at ? "已记录" : "暂无"}</strong>
      </div>
      {detail ? (
        <div className="permission-grid">
          <PermissionToggle
            label="允许查看详情"
            checked={detail.permission.can_view_detail}
            disabled={actionLoadingId === friend.id}
            onChange={(checked) =>
              onPermissionUpdate(friend.id, {
                ...detail.permission,
                can_view_detail: checked
              })
            }
          />
          <PermissionToggle
            label="允许提醒"
            checked={detail.permission.can_remind}
            disabled={actionLoadingId === friend.id}
            onChange={(checked) =>
              onPermissionUpdate(friend.id, {
                ...detail.permission,
                can_remind: checked
              })
            }
          />
        </div>
      ) : (
        <span className="muted">正在加载详情...</span>
      )}

      <div className="friend-actions">
        <FriendDetailActions
          friend={friend}
          detail={detail}
          actionLoadingId={actionLoadingId}
          encourageChoice={encourageChoice}
          encourageOptions={encourageOptions}
          onEncourageChoiceChange={onEncourageChoiceChange}
          onAccept={onAccept}
          onRemind={onRemind}
          onEncourage={onEncourage}
        />
      </div>
    </div>
  );
}
