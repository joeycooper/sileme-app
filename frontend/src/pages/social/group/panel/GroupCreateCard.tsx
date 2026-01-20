import type { GroupForm } from "../../hooks/groupTypes";
import GroupCreateControls from "./GroupCreateControls";

type GroupCreateCardProps = {
  form: GroupForm;
  onCreate: () => void;
  onFieldChange: <K extends keyof GroupForm>(key: K, value: GroupForm[K]) => void;
};

export default function GroupCreateCard({ form, onCreate, onFieldChange }: GroupCreateCardProps) {
  return (
    <div className="group-panel-card">
      <div className="group-panel-title">创建群组</div>
      <div className="group-create">
        <label>
          群组名称
          <input
            type="text"
            placeholder="给群组取个名字"
            name="group_name"
            value={form.name}
            onChange={(event) => onFieldChange("name", event.target.value)}
          />
        </label>
        <GroupCreateControls form={form} onFieldChange={onFieldChange} />
        <button className="primary group-create-button" type="button" onClick={onCreate}>
          创建群组
        </button>
      </div>
    </div>
  );
}
