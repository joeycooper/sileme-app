import type { GroupForm } from "../../hooks/groupTypes";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type GroupJoinCardProps = {
  form: GroupForm;
  onJoin: () => void;
  onFieldChange: <K extends keyof GroupForm>(key: K, value: GroupForm[K]) => void;
};

export default function GroupJoinCard({ form, onJoin, onFieldChange }: GroupJoinCardProps) {
  return (
    <div className="space-y-3 rounded-2xl border border-border/70 bg-white/90 p-4">
      <div className="text-sm font-semibold text-ink">加入群组</div>
      <div className="grid gap-3">
        <label className="flex flex-col gap-2 text-sm font-medium text-muted-foreground">
          邀请码/群 ID
          <Input
            type="text"
            placeholder="输入群组邀请码或群 ID"
            name="group_code"
            value={form.code}
            onChange={(event) => onFieldChange("code", event.target.value)}
          />
        </label>
        <Button className="h-11 rounded-full" type="button" onClick={onJoin}>
          申请加入
        </Button>
      </div>
      <p className="text-xs text-muted-foreground">公开群可能需要审核，私密群仅支持邀请码加入。</p>
    </div>
  );
}
