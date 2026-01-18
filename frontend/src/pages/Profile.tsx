import { useEffect, useState } from "react";
import { authLogout, getMe } from "../services/api";

type ProfileForm = {
  avatarUrl: string;
  nickname: string;
  wechat: string;
  email: string;
  alarmHours: string;
  estateNote: string;
};

type Contact = {
  id: string;
  name: string;
  relation: string;
  phone: string;
  wechat?: string;
  email?: string;
  note?: string;
  avatar?: string;
};

const DEFAULT_ALARM_HOURS = "24";
const PRIMARY_KEY = "sileme_primary_contact_v2";
const BACKUP_KEY = "sileme_backup_contacts_v2";

function emptyContact(): Contact {
  return {
    id: String(Date.now()),
    name: "",
    relation: "",
    phone: "",
    wechat: "",
    email: "",
    note: "",
    avatar: ""
  };
}

export default function Profile() {
  const [phone, setPhone] = useState<string | null>(null);
  const [timezone, setTimezone] = useState<string | null>(null);
  const [form, setForm] = useState<ProfileForm>({
    avatarUrl: "",
    nickname: "",
    wechat: "",
    email: "",
    alarmHours: DEFAULT_ALARM_HOURS,
    estateNote: ""
  });
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [primaryContact, setPrimaryContact] = useState<Contact>(emptyContact());
  const [backupContacts, setBackupContacts] = useState<Contact[]>([]);
  const [contactError, setContactError] = useState<string | null>(null);
  const [activePanel, setActivePanel] = useState<"profile" | "alarm" | "estate" | null>(null);

  useEffect(() => {
    void loadProfile();
  }, []);

  async function loadProfile() {
    try {
      const me = await getMe();
      setPhone(me.phone);
      setTimezone(me.timezone);
    } catch (err) {
      setError(err instanceof Error ? err.message : "加载失败");
    }

    setForm({
      avatarUrl: localStorage.getItem("sileme_avatar_url") || "",
      nickname: localStorage.getItem("sileme_nickname") || "",
      wechat: localStorage.getItem("sileme_wechat") || "",
      email: localStorage.getItem("sileme_email") || "",
      alarmHours: localStorage.getItem("sileme_alarm_hours") || DEFAULT_ALARM_HOURS,
      estateNote: localStorage.getItem("sileme_estate_note") || ""
    });

    const primaryRaw = localStorage.getItem(PRIMARY_KEY);
    const backupsRaw = localStorage.getItem(BACKUP_KEY);
    setPrimaryContact(primaryRaw ? (JSON.parse(primaryRaw) as Contact) : emptyContact());
    setBackupContacts(backupsRaw ? (JSON.parse(backupsRaw) as Contact[]) : []);
  }

  function saveProfileSettings() {
    setError(null);
    const hours = Math.min(Math.max(Number(form.alarmHours || DEFAULT_ALARM_HOURS), 1), 72);
    localStorage.setItem("sileme_avatar_url", form.avatarUrl.trim());
    localStorage.setItem("sileme_nickname", form.nickname.trim());
    localStorage.setItem("sileme_wechat", form.wechat.trim());
    localStorage.setItem("sileme_email", form.email.trim());
    localStorage.setItem("sileme_alarm_hours", String(hours));
    localStorage.setItem("sileme_estate_note", form.estateNote.trim());
    setForm((prev) => ({ ...prev, alarmHours: String(hours) }));
    setNotice("已保存");
    window.setTimeout(() => setNotice(null), 2000);
  }

  function openContacts() {
    setContactError(null);
    setSheetOpen(true);
  }

  function closeContacts() {
    setSheetOpen(false);
  }

  function handleAvatarUpload(file: File, target: "primary" | "backup", id?: string) {
    const reader = new FileReader();
    reader.onload = () => {
      const url = typeof reader.result === "string" ? reader.result : "";
      if (target === "primary") {
        setPrimaryContact((prev) => ({ ...prev, avatar: url }));
      } else if (id) {
        setBackupContacts((prev) =>
          prev.map((item) => (item.id === id ? { ...item, avatar: url } : item))
        );
      }
    };
    reader.readAsDataURL(file);
  }

  function handleProfileAvatarUpload(file: File) {
    const reader = new FileReader();
    reader.onload = () => {
      const url = typeof reader.result === "string" ? reader.result : "";
      setForm((prev) => ({ ...prev, avatarUrl: url }));
      localStorage.setItem("sileme_avatar_url", url);
      setNotice("头像已保存");
      window.setTimeout(() => setNotice(null), 1500);
    };
    reader.readAsDataURL(file);
  }

  function validateContact(contact: Contact) {
    return contact.name.trim() && contact.relation.trim() && contact.phone.trim();
  }

  function saveContacts() {
    if (!validateContact(primaryContact)) {
      setContactError("首选联系人需填写姓名、关系、手机号");
      return;
    }
    const invalidBackup = backupContacts.find((c) => !validateContact(c));
    if (invalidBackup) {
      setContactError("备选联系人需填写姓名、关系、手机号");
      return;
    }
    localStorage.setItem(PRIMARY_KEY, JSON.stringify(primaryContact));
    localStorage.setItem(BACKUP_KEY, JSON.stringify(backupContacts));
    setContactError(null);
    setNotice("联系人已保存");
    window.setTimeout(() => setNotice(null), 2000);
    setSheetOpen(false);
  }

  async function handleLogout() {
    await authLogout();
    window.location.reload();
  }

  return (
    <div className="page">
      {error ? <p className="error">{error}</p> : null}
      {notice ? <p className="notice">{notice}</p> : null}

      <section className="card profile-hero">
        <div className="profile-hero-content">
          <label className="avatar-upload avatar-large">
            {form.avatarUrl ? <img src={form.avatarUrl} alt="头像" /> : <span>上传头像</span>}
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleProfileAvatarUpload(file);
              }}
            />
          </label>
          <div>
            <h2>{form.nickname || "未设置昵称"}</h2>
            <p className="muted">手机号 {phone || "-"}</p>
            <p className="muted">时区 {timezone || "-"}</p>
          </div>
        </div>
      </section>

      <section className="card">
        <div className="profile-menu">
          <button className="profile-row" type="button" onClick={() => setActivePanel("profile")}>
            <span className="icon">👤</span>
            <span>个人信息</span>
            <span className="chevron">›</span>
          </button>
          <button className="profile-row" type="button" onClick={openContacts}>
            <span className="icon">📞</span>
            <span>紧急联系人</span>
            <span className="chevron">›</span>
          </button>
          <button className="profile-row" type="button" onClick={() => setActivePanel("alarm")}>
            <span className="icon">⏱️</span>
            <span>自动警报时间</span>
            <span className="chevron">›</span>
          </button>
          <button className="profile-row" type="button" onClick={() => setActivePanel("estate")}>
            <span className="icon">📜</span>
            <span>遗产分配设置</span>
            <span className="chevron">›</span>
          </button>
          <button className="profile-row danger" type="button" onClick={handleLogout}>
            <span className="icon">🚪</span>
            <span>退出登录</span>
            <span className="chevron">›</span>
          </button>
        </div>
      </section>

      <div className={`sheet-overlay ${activePanel ? "show" : ""}`} onClick={() => setActivePanel(null)} />
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
          <button className="link" type="button" onClick={() => setActivePanel(null)}>
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
                  onChange={(e) => setForm({ ...form, nickname: e.target.value })}
                />
              </label>
              <label>
                微信号
                <input
                  type="text"
                  placeholder="填写你的微信号"
                  value={form.wechat}
                  onChange={(e) => setForm({ ...form, wechat: e.target.value })}
                />
              </label>
              <label>
                邮箱
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
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
                  onChange={(e) => setForm({ ...form, alarmHours: e.target.value })}
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
                  onChange={(e) => setForm({ ...form, estateNote: e.target.value })}
                />
              </label>
            </div>
          </div>
        ) : null}
        {activePanel ? (
          <div className="sheet-actions">
            <button className="primary" type="button" onClick={saveProfileSettings}>
              保存
            </button>
          </div>
        ) : null}
      </div>

      <div className={`sheet-overlay ${sheetOpen ? "show" : ""}`} onClick={closeContacts} />
      <div className={`sheet ${sheetOpen ? "show" : ""}`}>
        <div className="sheet-handle" />
        <div className="sheet-header">
          <h3>紧急联系人</h3>
          <button className="link" type="button" onClick={closeContacts}>
            关闭
          </button>
        </div>
        {contactError ? <p className="error">{contactError}</p> : null}
        <div className="sheet-section">
          <h4>首选联系人（仅一个）</h4>
          <div className="contact-card">
            <div className="contact-avatar">
              <label className="avatar-upload">
                {primaryContact.avatar ? (
                  <img src={primaryContact.avatar} alt="头像" />
                ) : (
                  <span>上传头像</span>
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleAvatarUpload(file, "primary");
                  }}
                />
              </label>
            </div>
            <div className="fields">
              <label>
                姓名
                <input
                  type="text"
                  value={primaryContact.name}
                  onChange={(e) =>
                    setPrimaryContact((prev) => ({ ...prev, name: e.target.value }))
                  }
                  required
                />
              </label>
              <label>
                关系
                <input
                  type="text"
                  value={primaryContact.relation}
                  onChange={(e) =>
                    setPrimaryContact((prev) => ({ ...prev, relation: e.target.value }))
                  }
                  required
                />
              </label>
              <label>
                手机号
                <input
                  type="tel"
                  value={primaryContact.phone}
                  onChange={(e) =>
                    setPrimaryContact((prev) => ({ ...prev, phone: e.target.value }))
                  }
                  required
                />
              </label>
              <label>
                微信
                <input
                  type="text"
                  value={primaryContact.wechat || ""}
                  onChange={(e) =>
                    setPrimaryContact((prev) => ({ ...prev, wechat: e.target.value }))
                  }
                />
              </label>
              <label>
                邮箱
                <input
                  type="email"
                  value={primaryContact.email || ""}
                  onChange={(e) =>
                    setPrimaryContact((prev) => ({ ...prev, email: e.target.value }))
                  }
                />
              </label>
              <label className="span-2">
                备注
                <textarea
                  rows={2}
                  value={primaryContact.note || ""}
                  onChange={(e) =>
                    setPrimaryContact((prev) => ({ ...prev, note: e.target.value }))
                  }
                />
              </label>
            </div>
          </div>
        </div>

        <div className="sheet-section">
          <h4>备选联系人</h4>
          {backupContacts.map((contact) => (
            <div key={contact.id} className="contact-card">
              <div className="contact-avatar">
                <label className="avatar-upload">
                  {contact.avatar ? (
                    <img src={contact.avatar} alt="头像" />
                  ) : (
                    <span>上传头像</span>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleAvatarUpload(file, "backup", contact.id);
                    }}
                  />
                </label>
              </div>
              <div className="fields">
                <label>
                  姓名
                  <input
                    type="text"
                    value={contact.name}
                    onChange={(e) =>
                      setBackupContacts((prev) =>
                        prev.map((item) =>
                          item.id === contact.id ? { ...item, name: e.target.value } : item
                        )
                      )
                    }
                    required
                  />
                </label>
                <label>
                  关系
                  <input
                    type="text"
                    value={contact.relation}
                    onChange={(e) =>
                      setBackupContacts((prev) =>
                        prev.map((item) =>
                          item.id === contact.id
                            ? { ...item, relation: e.target.value }
                            : item
                        )
                      )
                    }
                    required
                  />
                </label>
                <label>
                  手机号
                  <input
                    type="tel"
                    value={contact.phone}
                    onChange={(e) =>
                      setBackupContacts((prev) =>
                        prev.map((item) =>
                          item.id === contact.id ? { ...item, phone: e.target.value } : item
                        )
                      )
                    }
                    required
                  />
                </label>
                <label>
                  微信
                  <input
                    type="text"
                    value={contact.wechat || ""}
                    onChange={(e) =>
                      setBackupContacts((prev) =>
                        prev.map((item) =>
                          item.id === contact.id ? { ...item, wechat: e.target.value } : item
                        )
                      )
                    }
                  />
                </label>
                <label>
                  邮箱
                  <input
                    type="email"
                    value={contact.email || ""}
                    onChange={(e) =>
                      setBackupContacts((prev) =>
                        prev.map((item) =>
                          item.id === contact.id ? { ...item, email: e.target.value } : item
                        )
                      )
                    }
                  />
                </label>
                <label className="span-2">
                  备注
                  <textarea
                    rows={2}
                    value={contact.note || ""}
                    onChange={(e) =>
                      setBackupContacts((prev) =>
                        prev.map((item) =>
                          item.id === contact.id ? { ...item, note: e.target.value } : item
                        )
                      )
                    }
                  />
                </label>
              </div>
              <button
                className="link danger"
                type="button"
                onClick={() =>
                  setBackupContacts((prev) => prev.filter((item) => item.id !== contact.id))
                }
              >
                删除
              </button>
            </div>
          ))}
          <button
            className="secondary"
            type="button"
            onClick={() => setBackupContacts((prev) => [...prev, emptyContact()])}
          >
            添加备选联系人
          </button>
        </div>

        <div className="sheet-actions">
          <button className="primary" type="button" onClick={saveContacts}>
            保存联系人
          </button>
        </div>
      </div>
    </div>
  );
}
