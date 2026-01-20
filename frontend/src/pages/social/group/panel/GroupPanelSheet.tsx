import type { GroupForm } from "../../hooks/groupTypes";
import GroupCreateCard from "./GroupCreateCard";
import GroupJoinCard from "./GroupJoinCard";

type GroupPanelSheetProps = {
  open: boolean;
  form: GroupForm;
  onClose: () => void;
  onJoin: () => void;
  onCreate: () => void;
  onFieldChange: <K extends keyof GroupForm>(key: K, value: GroupForm[K]) => void;
};

export default function GroupPanelSheet({
  open,
  form,
  onClose,
  onJoin,
  onCreate,
  onFieldChange
}: GroupPanelSheetProps) {
  return (
    <>
      <div className={`sheet-overlay ${open ? "show" : ""}`} onClick={onClose} />
      <div className={`sheet ${open ? "show" : ""}`} onClick={(event) => event.stopPropagation()}>
        <div className="sheet-handle" />
        <div className="sheet-header">
          <h3>群组</h3>
          <button className="link" type="button" onClick={onClose}>
            关闭
          </button>
        </div>
        <div className="sheet-section">
          <div className="group-panel">
            <GroupJoinCard form={form} onJoin={onJoin} onFieldChange={onFieldChange} />
            <GroupCreateCard form={form} onCreate={onCreate} onFieldChange={onFieldChange} />
          </div>
        </div>
      </div>
    </>
  );
}
