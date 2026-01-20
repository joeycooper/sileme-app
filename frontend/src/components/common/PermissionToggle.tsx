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
    <label className="toggle-row">
      {label}
      <input
        type="checkbox"
        className="toggle"
        checked={checked}
        disabled={disabled}
        onChange={(event) => onChange(event.target.checked)}
      />
    </label>
  );
}
