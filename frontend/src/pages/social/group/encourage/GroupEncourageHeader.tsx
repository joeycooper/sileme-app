import type { GroupDetail } from "../../../../services/api";
import { Button } from "@/components/ui/button";

type GroupEncourageHeaderProps = {
  group: GroupDetail;
};

export default function GroupEncourageHeader({ group }: GroupEncourageHeaderProps) {
  const activeCount = group.members.filter((member) => member.checked_in).length;

  return (
    <div className="flex items-center justify-between gap-3 rounded-2xl border border-border/70 bg-white/90 px-4 py-3 shadow-sm">
      <div>
        <h4 className="text-lg font-semibold text-ink">{group.name}</h4>
        <p className="text-xs text-muted-foreground">
          今日活跃 {activeCount} / {group.members.length}
        </p>
      </div>
      <Button type="button" variant="outline" className="rounded-full">
        @提醒
      </Button>
    </div>
  );
}
