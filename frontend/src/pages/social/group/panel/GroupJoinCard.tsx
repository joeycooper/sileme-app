import type { GroupForm } from "../../hooks/groupTypes";

type GroupJoinCardProps = {
  form: GroupForm;
  onJoin: () => void;
  onFieldChange: <K extends keyof GroupForm>(key: K, value: GroupForm[K]) => void;
};

export default function GroupJoinCard({ form, onJoin, onFieldChange }: GroupJoinCardProps) {
  return (
    <div className="group-panel-card">
      <div className="group-panel-title">加入群组</div>
      <div className="group-join">
        <label>
          邀请码/群 ID
          <input
            type="text"
            placeholder="输入群组邀请码或群 ID"
            name="group_code"
            value={form.code}
            onChange={(event) => onFieldChange("code", event.target.value)}
          />
        </label>
        <button className="primary" type="button" onClick={onJoin}>
          申请加入
        </button>
      </div>
      <p className="muted">公开群可能需要审核，私密群仅支持邀请码加入。</p>
    </div>
  );
}
