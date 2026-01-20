import { useEffect, useRef, useState } from "react";
import { authLogout, getContacts, getMe, saveContacts, updateProfile } from "../services/api";
import { IconLogout, IconNote, IconPhone, IconTimer, IconUser } from "../components/icons";

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
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [primaryContact, setPrimaryContact] = useState<Contact>(emptyContact());
  const [backupContacts, setBackupContacts] = useState<Contact[]>([]);
  const [contactError, setContactError] = useState<string | null>(null);
  const [activePanel, setActivePanel] = useState<"profile" | "alarm" | "estate" | null>(null);
  const [cropOpen, setCropOpen] = useState(false);
  const [cropImageUrl, setCropImageUrl] = useState<string | null>(null);
  const [cropScale, setCropScale] = useState(1);
  const [cropOffset, setCropOffset] = useState({ x: 0, y: 0 });
  const [cropBaseScale, setCropBaseScale] = useState(1);
  const [cropImage, setCropImage] = useState<HTMLImageElement | null>(null);
  const [cropSaving, setCropSaving] = useState(false);
  const cropPreviewRef = useRef<HTMLDivElement | null>(null);
  const cropImageRef = useRef<HTMLImageElement | null>(null);
  const dragState = useRef<{ x: number; y: number; ox: number; oy: number } | null>(null);
  const PREVIEW_SIZE = 240;
  const OUTPUT_SIZE = 256;
  const noticeTimer = useRef<number | null>(null);

  useEffect(() => {
    void loadProfile();
  }, []);

  useEffect(() => {
    if (!error && !contactError) return;
    const message = error || contactError;
    if (message) {
      setNoticeWithAutoClear(message);
      setError(null);
      setContactError(null);
    }
  }, [error, contactError]);

  function setNoticeWithAutoClear(message: string) {
    setNotice(message);
    if (noticeTimer.current) {
      window.clearTimeout(noticeTimer.current);
    }
    noticeTimer.current = window.setTimeout(() => {
      setNotice(null);
      noticeTimer.current = null;
    }, 2000);
  }

  async function loadProfile() {
    try {
      const me = await getMe();
      setPhone(me.phone);
      setTimezone(me.timezone);
      setForm({
        avatarUrl: me.avatar_url || "",
        nickname: me.nickname || "",
        wechat: me.wechat || "",
        email: me.email || "",
        alarmHours: String(me.alarm_hours ?? DEFAULT_ALARM_HOURS),
        estateNote: me.estate_note || ""
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "加载失败");
    }

    try {
      const contacts = await getContacts();
      setPrimaryContact(
        contacts.primary
          ? {
              id: String(contacts.primary.id),
              name: contacts.primary.name,
              relation: contacts.primary.relation,
              phone: contacts.primary.phone,
              wechat: contacts.primary.wechat || "",
              email: contacts.primary.email || "",
              note: contacts.primary.note || "",
              avatar: contacts.primary.avatar_url || ""
            }
          : emptyContact()
      );
      setBackupContacts(
        contacts.backups.map((item) => ({
          id: String(item.id),
          name: item.name,
          relation: item.relation,
          phone: item.phone,
          wechat: item.wechat || "",
          email: item.email || "",
          note: item.note || "",
          avatar: item.avatar_url || ""
        }))
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "联系人加载失败");
    }
  }

  async function saveProfileSettings() {
    setError(null);
    const hours = Math.min(Math.max(Number(form.alarmHours || DEFAULT_ALARM_HOURS), 1), 72);
    try {
      const updated = await updateProfile({
        nickname: form.nickname.trim(),
        avatar_url: form.avatarUrl.trim() || null,
        wechat: form.wechat.trim() || null,
        email: form.email.trim() || null,
        alarm_hours: hours,
        estate_note: form.estateNote.trim() || null
      });
      window.dispatchEvent(
        new CustomEvent("sileme-alarm-hours", { detail: updated.alarm_hours })
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "保存失败");
      return;
    }
    setForm((prev) => ({ ...prev, alarmHours: String(hours) }));
    setActivePanel(null);
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
      const img = new Image();
      img.onload = () => {
        const baseScale = PREVIEW_SIZE / Math.min(img.width, img.height);
        setCropImage(img);
        setCropImageUrl(url);
        setCropBaseScale(baseScale);
        setCropScale(1);
        setCropOffset({ x: 0, y: 0 });
        setCropOpen(true);
      };
      img.src = url;
    };
    reader.readAsDataURL(file);
  }

  function clampOffset(next: { x: number; y: number }, scaleValue: number) {
    if (!cropImage) return next;
    const scale = cropBaseScale * scaleValue;
    const maxX = Math.max(0, (cropImage.width * scale - PREVIEW_SIZE) / 2);
    const maxY = Math.max(0, (cropImage.height * scale - PREVIEW_SIZE) / 2);
    return {
      x: Math.min(maxX, Math.max(-maxX, next.x)),
      y: Math.min(maxY, Math.max(-maxY, next.y))
    };
  }

  async function handleCropSave() {
    if (!cropImage || !cropImageUrl) return;
    setCropSaving(true);
    try {
      const canvas = document.createElement("canvas");
      canvas.width = OUTPUT_SIZE;
      canvas.height = OUTPUT_SIZE;
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Canvas unavailable");
      const previewEl = cropPreviewRef.current;
      const imageEl = cropImageRef.current;
      if (!previewEl || !imageEl) throw new Error("Crop preview unavailable");
      const previewRect = previewEl.getBoundingClientRect();
      const imageRect = imageEl.getBoundingClientRect();
      const naturalWidth = cropImage.naturalWidth || cropImage.width;
      const naturalHeight = cropImage.naturalHeight || cropImage.height;
      const scaleX = naturalWidth / imageRect.width;
      const scaleY = naturalHeight / imageRect.height;
      let sx = (previewRect.left - imageRect.left) * scaleX;
      let sy = (previewRect.top - imageRect.top) * scaleY;
      let sWidth = previewRect.width * scaleX;
      let sHeight = previewRect.height * scaleY;
      sx = Math.min(Math.max(0, sx), naturalWidth - sWidth);
      sy = Math.min(Math.max(0, sy), naturalHeight - sHeight);
      ctx.drawImage(cropImage, sx, sy, sWidth, sHeight, 0, 0, OUTPUT_SIZE, OUTPUT_SIZE);
      const url = canvas.toDataURL("image/jpeg", 0.9);
      setForm((prev) => ({ ...prev, avatarUrl: url }));
      const updated = await updateProfile({
        nickname: form.nickname.trim(),
        avatar_url: url,
        wechat: form.wechat.trim() || null,
        email: form.email.trim() || null,
        alarm_hours: Math.min(Math.max(Number(form.alarmHours || DEFAULT_ALARM_HOURS), 1), 72),
        estate_note: form.estateNote.trim() || null
      });
      window.dispatchEvent(
        new CustomEvent("sileme-alarm-hours", { detail: updated.alarm_hours })
      );
      setCropOpen(false);
      setCropImageUrl(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "保存失败");
    } finally {
      setCropSaving(false);
    }
  }

  function handleCropCancel() {
    setCropOpen(false);
    setCropImageUrl(null);
  }

  function validateContact(contact: Contact) {
    return contact.name.trim() && contact.relation.trim() && contact.phone.trim();
  }

  async function handleSaveContacts() {
    if (!validateContact(primaryContact)) {
      setContactError("首选联系人需填写姓名、关系、手机号");
      return;
    }
    const invalidBackup = backupContacts.find((c) => !validateContact(c));
    if (invalidBackup) {
      setContactError("备选联系人需填写姓名、关系、手机号");
      return;
    }
    try {
      await saveContacts({
        primary: {
          name: primaryContact.name.trim(),
          relation: primaryContact.relation.trim(),
          phone: primaryContact.phone.trim(),
          wechat: primaryContact.wechat || null,
          email: primaryContact.email || null,
          note: primaryContact.note || null,
          avatar_url: primaryContact.avatar || null
        },
        backups: backupContacts.map((contact) => ({
          name: contact.name.trim(),
          relation: contact.relation.trim(),
          phone: contact.phone.trim(),
          wechat: contact.wechat || null,
          email: contact.email || null,
          note: contact.note || null,
          avatar_url: contact.avatar || null
        }))
      });
      setContactError(null);
      setSheetOpen(false);
    } catch (err) {
      setContactError(err instanceof Error ? err.message : "保存失败");
    }
  }

  async function handleLogout() {
    await authLogout();
    window.location.reload();
  }

  return (
    <div className="page">
      <section className="card profile-hero">
        <div className="profile-hero-content">
          <label className="avatar-upload avatar-large">
            {form.avatarUrl ? <img src={form.avatarUrl} alt="头像" /> : <span>上传头像</span>}
            <input
              type="file"
              accept="image/*"
              name="avatar"
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
            <span className="icon">
              <IconUser className="icon-svg" />
            </span>
            <span>个人信息</span>
            <span className="chevron">›</span>
          </button>
          <button className="profile-row" type="button" onClick={openContacts}>
            <span className="icon">
              <IconPhone className="icon-svg" />
            </span>
            <span>紧急联系人</span>
            <span className="chevron">›</span>
          </button>
          <button className="profile-row" type="button" onClick={() => setActivePanel("alarm")}>
            <span className="icon">
              <IconTimer className="icon-svg" />
            </span>
            <span>自动警报时间</span>
            <span className="chevron">›</span>
          </button>
          <button className="profile-row" type="button" onClick={() => setActivePanel("estate")}>
            <span className="icon">
              <IconNote className="icon-svg" />
            </span>
            <span>遗产分配设置</span>
            <span className="chevron">›</span>
          </button>
          <button className="profile-row danger" type="button" onClick={handleLogout}>
            <span className="icon">
              <IconLogout className="icon-svg" />
            </span>
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
                  name="nickname"
                />
              </label>
              <label>
                微信号
                <input
                  type="text"
                  placeholder="填写你的微信号"
                  value={form.wechat}
                  onChange={(e) => setForm({ ...form, wechat: e.target.value })}
                  name="wechat"
                />
              </label>
              <label>
                邮箱
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
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
                  onChange={(e) => setForm({ ...form, alarmHours: e.target.value })}
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
                  onChange={(e) => setForm({ ...form, estateNote: e.target.value })}
                  name="estate_note"
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
                  name="primary_avatar"
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
                  name="primary_name"
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
                  name="primary_relation"
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
                  name="primary_phone"
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
                  name="primary_wechat"
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
                  name="primary_email"
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
                  name="primary_note"
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
                    name={`backup_avatar_${contact.id}`}
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
                    name={`backup_name_${contact.id}`}
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
                    name={`backup_relation_${contact.id}`}
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
                    name={`backup_phone_${contact.id}`}
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
                    name={`backup_wechat_${contact.id}`}
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
                    name={`backup_email_${contact.id}`}
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
                    name={`backup_note_${contact.id}`}
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
          <button className="primary" type="button" onClick={handleSaveContacts}>
            保存联系人
          </button>
        </div>
      </div>

      {notice ? <div className="toast">{notice}</div> : null}

      {cropOpen && cropImageUrl ? (
        <div className="crop-overlay" role="dialog" aria-modal="true">
          <div className="crop-panel">
            <div className="crop-header">
              <h3>裁剪头像</h3>
              <button className="link" type="button" onClick={handleCropCancel}>
                关闭
              </button>
            </div>
            <div className="crop-preview" ref={cropPreviewRef}>
              {cropImage ? (
                <img
                  src={cropImageUrl}
                  alt="头像预览"
                  className="crop-image"
                  ref={cropImageRef}
                  style={{
                    width: cropImage.width * cropBaseScale,
                    height: cropImage.height * cropBaseScale,
                    transform: `translate(${cropOffset.x}px, ${cropOffset.y}px) scale(${cropScale})`
                  }}
                  onPointerDown={(event) => {
                    event.currentTarget.setPointerCapture(event.pointerId);
                    dragState.current = {
                      x: event.clientX,
                      y: event.clientY,
                      ox: cropOffset.x,
                      oy: cropOffset.y
                    };
                  }}
                  onPointerMove={(event) => {
                    if (!dragState.current) return;
                    const dx = event.clientX - dragState.current.x;
                    const dy = event.clientY - dragState.current.y;
                    const next = clampOffset(
                      { x: dragState.current.ox + dx, y: dragState.current.oy + dy },
                      cropScale
                    );
                    setCropOffset(next);
                  }}
                  onPointerUp={(event) => {
                    event.currentTarget.releasePointerCapture(event.pointerId);
                    dragState.current = null;
                  }}
                />
              ) : null}
            </div>
            <div className="crop-controls">
              <span>缩放</span>
              <input
                type="range"
                min="1"
                max="3"
                step="0.01"
                value={cropScale}
                onChange={(event) => {
                  const value = Number(event.target.value);
                  setCropScale(value);
                  setCropOffset((prev) => clampOffset(prev, value));
                }}
              />
            </div>
            <div className="crop-actions">
              <button className="secondary" type="button" onClick={handleCropCancel}>
                取消
              </button>
              <button className="primary" type="button" onClick={handleCropSave} disabled={cropSaving}>
                {cropSaving ? "保存中..." : "保存头像"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
