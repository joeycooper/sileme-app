import type { Friend, FriendDetail } from "../../../../services/api";
import type { EncourageOption } from "./types";

type FriendDetailActionsProps = {
  friend: Friend;
  detail?: FriendDetail;
  actionLoadingId: number | null;
  encourageChoice: string;
  encourageOptions: EncourageOption[];
  onEncourageChoiceChange: (value: string) => void;
  onAccept: (friendId: number) => void;
  onRemind: (friendId: number) => void;
  onEncourage: (friendId: number) => void;
};

export default function FriendDetailActions({
  friend,
  detail,
  actionLoadingId,
  encourageChoice,
  encourageOptions,
  onEncourageChoiceChange,
  onAccept,
  onRemind,
  onEncourage
}: FriendDetailActionsProps) {
  if (friend.status === "pending_in") {
    return (
      <button
        className="primary"
        type="button"
        disabled={actionLoadingId === friend.id}
        onClick={() => onAccept(friend.id)}
      >
        通过好友
      </button>
    );
  }

  if (friend.status === "pending_out") {
    return <span className="muted">等待对方确认</span>;
  }

  return (
    <>
      <button
        className="secondary"
        type="button"
        disabled={actionLoadingId === friend.id || (detail ? !detail.permission.can_remind : false)}
        onClick={() => onRemind(friend.id)}
      >
        提醒打卡
      </button>
      <div className="encourage-group">
        <select
          value={encourageChoice}
          onChange={(event) => onEncourageChoiceChange(event.target.value)}
          className="encourage-select"
          name="encourage_choice"
        >
          {encourageOptions.map((option) => (
            <option key={option.emoji} value={option.emoji}>
              {option.emoji} {option.label}
            </option>
          ))}
        </select>
        <button
          className="secondary"
          type="button"
          disabled={actionLoadingId === friend.id}
          onClick={() => onEncourage(friend.id)}
        >
          发送鼓励
        </button>
      </div>
    </>
  );
}
