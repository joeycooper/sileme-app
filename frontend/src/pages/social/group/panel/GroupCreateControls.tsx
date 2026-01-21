import type { GroupForm } from "../../hooks/groupTypes";
import { Switch } from "@/components/ui/switch";

type GroupCreateControlsProps = {
  form: GroupForm;
  onFieldChange: <K extends keyof GroupForm>(key: K, value: GroupForm[K]) => void;
};

export default function GroupCreateControls({ form, onFieldChange }: GroupCreateControlsProps) {
  return (
    <div className="grid gap-2 md:grid-cols-2">
      <label className="flex items-center justify-between gap-3 rounded-xl border border-border bg-white/70 px-3 py-2 text-sm text-ink">
        <span className="font-medium">隐私群</span>
        <Switch
          checked={form.privacy === "private"}
          onCheckedChange={(value) =>
            onFieldChange("privacy", value ? "private" : "public")
          }
        />
      </label>
      <label className="flex items-center justify-between gap-3 rounded-xl border border-border bg-white/70 px-3 py-2 text-sm text-ink">
        <span className="font-medium">入群需审核</span>
        <Switch
          checked={form.requiresApproval}
          onCheckedChange={(value) => onFieldChange("requiresApproval", Boolean(value))}
        />
      </label>
    </div>
  );
}
