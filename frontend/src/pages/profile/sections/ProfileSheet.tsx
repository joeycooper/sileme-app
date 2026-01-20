import { ProfileForm } from "../types";

type ProfileSheetProps = {
  activePanel: "profile" | "alarm" | "estate" | null;
  form: ProfileForm;
  onFieldChange: <K extends keyof ProfileForm>(key: K, value: ProfileForm[K]) => void;
  onClose: () => void;
  onSave: () => void;
};

export default function ProfileSheet({
  activePanel,
  form,
  onFieldChange,
  onClose,
  onSave
}: ProfileSheetProps) {
  return (
    <>
      <div className={`sheet-overlay ${activePanel ? "show" : ""}`} onClick={onClose} />
      <div className={`sheet ${activePanel ? "show" : ""}`}>
        <div className="sheet-handle" />
        <div className="sheet-header">
          <h3>
            {activePanel === "profile"
              ? "个人信息"
              : activePanel === "alarm"
              ? "自动警报时间"
              : activePanel === "estate"
              ? "遗产分配设置"
              : ""}
          </h3>
          <button className="link" type="button" onClick={onClose}>
            关闭
          </button>
        </div>
        {activePanel === "profile" ? (
          <div className="sheet-section">
            <div className="fields">
              <label>
                昵称
                <input
                  type="text"
                  placeholder="设置昵称"
                  value={form.nickname}
                  onChange={(e) => onFieldChange("nickname", e.target.value)}
                  name="nickname"
                />
              </label>
              <label>
                微信号
                <input
                  type="text"
                  placeholder="填写你的微信号"
                  value={form.wechat}
                  onChange={(e) => onFieldChange("wechat", e.target.value)}
                  name="wechat"
                />
              </label>
              <label>
                邮箱
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={(e) => onFieldChange("email", e.target.value)}
                  name="email"
                />
              </label>
            </div>
          </div>
        ) : null}
        {activePanel === "alarm" ? (
          <div className="sheet-section">
            <div className="fields">
              <label>
                小时数
                <input
                  type="number"
                  min="1"
                  max="72"
                  value={form.alarmHours}
                  onChange={(e) => onFieldChange("alarmHours", e.target.value)}
                  name="alarm_hours"
                />
              </label>
            </div>
          </div>
        ) : null}
        {activePanel === "estate" ? (
          <div className="sheet-section">
            <div className="fields">
              <label className="span-2">
                说明
                <textarea
                  rows={4}
                  placeholder="例如：遗产分配给家人..."
                  value={form.estateNote}
                  onChange={(e) => onFieldChange("estateNote", e.target.value)}
                  name="estate_note"
                />
              </label>
            </div>
          </div>
        ) : null}
        {activePanel ? (
          <div className="sheet-actions">
            <button className="primary" type="button" onClick={onSave}>
              保存
            </button>
          </div>
        ) : null}
      </div>
    </>
  );
}
