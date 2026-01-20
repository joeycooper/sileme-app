import type { GroupForm } from "../../hooks/groupTypes";

type GroupCreateControlsProps = {
  form: GroupForm;
  onFieldChange: <K extends keyof GroupForm>(key: K, value: GroupForm[K]) => void;
};

export default function GroupCreateControls({ form, onFieldChange }: GroupCreateControlsProps) {
  return (
    <div className="group-create-controls">
      <label className="toggle-row">
        <span>隐私群</span>
        <input
          type="checkbox"
          className="toggle"
          checked={form.privacy === "private"}
          onChange={(event) =>
            onFieldChange("privacy", event.target.checked ? "private" : "public")
          }
        />
      </label>
      <label className="toggle-row">
        <span>入群需审核</span>
        <input
          type="checkbox"
          className="toggle"
          checked={form.requiresApproval}
          onChange={(event) => onFieldChange("requiresApproval", event.target.checked)}
        />
      </label>
    </div>
  );
}
