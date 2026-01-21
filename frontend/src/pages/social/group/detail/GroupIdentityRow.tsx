import type { GroupDetail } from "../../../../services/api";
import { Button } from "@/components/ui/button";

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
    <div className="flex flex-wrap items-center gap-3 rounded-xl border border-border/60 bg-white/80 px-3 py-2 text-xs text-muted-foreground">
      <span>群 ID：{group.id}</span>
      <Button
        className="h-7 rounded-full px-3 text-xs"
        variant="outline"
        type="button"
        onClick={() => onCopy(String(group.id), "群 ID 已复制")}
      >
        复制
      </Button>
      {group.privacy === "private" && group.join_code ? (
        <span className="flex flex-wrap items-center gap-2">
          邀请码：{group.join_code}
          <Button
            className="h-7 rounded-full px-3 text-xs"
            variant="outline"
            type="button"
            onClick={() => onCopy(group.join_code || "", "邀请码已复制")}
          >
            复制
          </Button>
          {isAdmin ? (
            <Button
              className="h-7 rounded-full px-3 text-xs"
              variant="outline"
              type="button"
              onClick={onRotateInviteCode}
            >
              刷新
            </Button>
          ) : null}
        </span>
      ) : null}
    </div>
  );
}
