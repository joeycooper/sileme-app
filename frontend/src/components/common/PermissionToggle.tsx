import { Switch } from "@/components/ui/switch";

type PermissionToggleProps = {
  label: string;
  checked: boolean;
  disabled?: boolean;
  onChange: (next: boolean) => void;
};

export default function PermissionToggle({
  label,
  checked,
  disabled = false,
  onChange
}: PermissionToggleProps) {
  return (
    <label className="flex items-center justify-between gap-3 rounded-xl border border-border bg-white/70 px-3 py-2 text-sm text-ink">
      <span className="font-medium">{label}</span>
      <Switch
        checked={checked}
        disabled={disabled}
        onCheckedChange={(value) => onChange(Boolean(value))}
      />
    </label>
  );
}
