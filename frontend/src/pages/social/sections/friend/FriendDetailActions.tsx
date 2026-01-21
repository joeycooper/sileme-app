import type { Friend, FriendDetail } from "../../../../services/api";
import type { EncourageOption } from "./types";
import { Button } from "@/components/ui/button";

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
      <Button type="button" disabled={actionLoadingId === friend.id} onClick={() => onAccept(friend.id)}>
        通过好友
      </Button>
    );
  }

  if (friend.status === "pending_out") {
    return <span className="text-xs text-muted-foreground">等待对方确认</span>;
  }

  return (
    <>
      <Button
        type="button"
        variant="outline"
        disabled={actionLoadingId === friend.id || (detail ? !detail.permission.can_remind : false)}
        onClick={() => onRemind(friend.id)}
      >
        提醒打卡
      </Button>
      <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto">
        <select
          value={encourageChoice}
          onChange={(event) => onEncourageChoiceChange(event.target.value)}
          className="h-9 rounded-md border border-border bg-white px-3 text-sm text-ink shadow-sm focus:outline-none focus:ring-2 focus:ring-brand/40"
          name="encourage_choice"
        >
          {encourageOptions.map((option) => (
            <option key={option.emoji} value={option.emoji}>
              {option.emoji} {option.label}
            </option>
          ))}
        </select>
        <Button type="button" variant="outline" disabled={actionLoadingId === friend.id} onClick={() => onEncourage(friend.id)}>
          发送鼓励
        </Button>
      </div>
    </>
  );
}
