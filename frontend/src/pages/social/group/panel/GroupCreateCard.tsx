import type { GroupForm } from "../../hooks/groupTypes";
import GroupCreateControls from "./GroupCreateControls";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type GroupCreateCardProps = {
  form: GroupForm;
  onCreate: () => void;
  onFieldChange: <K extends keyof GroupForm>(key: K, value: GroupForm[K]) => void;
};

export default function GroupCreateCard({ form, onCreate, onFieldChange }: GroupCreateCardProps) {
  return (
    <div className="space-y-3 rounded-2xl border border-border/70 bg-white/90 p-4">
      <div className="text-sm font-semibold text-ink">创建群组</div>
      <div className="grid gap-3">
        <label className="flex flex-col gap-2 text-sm font-medium text-muted-foreground">
          群组名称
          <Input
            type="text"
            placeholder="给群组取个名字"
            name="group_name"
            value={form.name}
            onChange={(event) => onFieldChange("name", event.target.value)}
          />
        </label>
        <GroupCreateControls form={form} onFieldChange={onFieldChange} />
        <Button className="h-11 rounded-full" type="button" onClick={onCreate}>
          创建群组
        </Button>
      </div>
    </div>
  );
}
