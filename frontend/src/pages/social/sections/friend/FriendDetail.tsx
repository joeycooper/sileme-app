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
    <div className="space-y-3 rounded-2xl border border-border/70 bg-white/90 p-5 text-sm text-muted-foreground shadow-sm">
      <div className="flex items-center justify-between">
        <span>手机号</span>
        <strong className="text-ink">{detail?.phone ?? "-"}</strong>
      </div>
      <div className="flex items-center justify-between">
        <span>最近打卡</span>
        <strong className="text-ink">{detail?.last_checkin_at ? "已记录" : "暂无"}</strong>
      </div>
      {detail ? (
        <div className="grid gap-2 md:grid-cols-2">
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
        <span className="text-xs text-muted-foreground">正在加载详情...</span>
      )}

      <div className="flex flex-wrap items-center gap-2">
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
