import { useEffect, useRef, useState } from "react";
import {
  authLogout,
  getContacts,
  getMe,
  saveContacts,
  updateProfile
} from "../../services/api";
import { useFormState } from "../../hooks";
import { DEFAULT_ALARM_HOURS, OUTPUT_SIZE, PREVIEW_SIZE } from "./constants";
import { Contact, ProfileForm, emptyContact } from "./types";

export function useProfileData(showError: (message: string) => void) {
  const [phone, setPhone] = useState<string | null>(null);
  const [timezone, setTimezone] = useState<string | null>(null);
  const { form, setForm, updateField } = useFormState<ProfileForm>({
    avatarUrl: "",
    nickname: "",
    wechat: "",
    email: "",
    alarmHours: DEFAULT_ALARM_HOURS,
    estateNote: ""
  });
  const [sheetOpen, setSheetOpen] = useState(false);
  const {
    form: primaryContact,
    setForm: setPrimaryContact,
    updateField: updatePrimaryField
  } = useFormState<Contact>(emptyContact());
  const [backupContacts, setBackupContacts] = useState<Contact[]>([]);
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

  useEffect(() => {
    void loadProfile();
  }, []);

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
      showError(err instanceof Error ? err.message : "加载失败");
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
      showError(err instanceof Error ? err.message : "联系人加载失败");
    }
  }

  async function saveProfileSettings() {
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
      showError(err instanceof Error ? err.message : "保存失败");
      return;
    }
    setForm((prev) => ({ ...prev, alarmHours: String(hours) }));
    setActivePanel(null);
  }

  function openContacts() {
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
        updatePrimaryField("avatar", url);
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
      showError(err instanceof Error ? err.message : "保存失败");
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

  function updateBackupField<K extends keyof Contact>(id: string, key: K, value: Contact[K]) {
    setBackupContacts((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [key]: value } : item))
    );
  }

  function addBackupContact() {
    setBackupContacts((prev) => [...prev, emptyContact()]);
  }

  function removeBackupContact(id: string) {
    setBackupContacts((prev) => prev.filter((item) => item.id !== id));
  }

  async function handleSaveContacts() {
    if (!validateContact(primaryContact)) {
      showError("首选联系人需填写姓名、关系、手机号");
      return;
    }
    const invalidBackup = backupContacts.find((c) => !validateContact(c));
    if (invalidBackup) {
      showError("备选联系人需填写姓名、关系、手机号");
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
      setSheetOpen(false);
    } catch (err) {
      showError(err instanceof Error ? err.message : "保存失败");
    }
  }

  async function handleLogout() {
    await authLogout();
    window.location.reload();
  }

  return {
    phone,
    timezone,
    form,
    setForm,
    updateField,
    sheetOpen,
    openContacts,
    closeContacts,
    activePanel,
    setActivePanel,
    primaryContact,
    setPrimaryContact,
    updatePrimaryField,
    backupContacts,
    setBackupContacts,
    updateBackupField,
    addBackupContact,
    removeBackupContact,
    handleAvatarUpload,
    handleProfileAvatarUpload,
    cropOpen,
    cropImageUrl,
    cropScale,
    cropOffset,
    cropBaseScale,
    cropImage,
    cropSaving,
    cropPreviewRef,
    cropImageRef,
    dragState,
    clampOffset,
    setCropScale,
    setCropOffset,
    handleCropSave,
    handleCropCancel,
    saveProfileSettings,
    handleSaveContacts,
    handleLogout
  };
}
