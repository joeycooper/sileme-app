import ContactCard from "./ContactCard";
import { Contact } from "../types";

type ContactsSheetProps = {
  open: boolean;
  primaryContact: Contact;
  backupContacts: Contact[];
  onClose: () => void;
  onPrimaryFieldChange: <K extends keyof Contact>(key: K, value: Contact[K]) => void;
  onBackupFieldChange: <K extends keyof Contact>(
    id: string,
    key: K,
    value: Contact[K]
  ) => void;
  onAvatarUpload: (file: File, target: "primary" | "backup", id?: string) => void;
  onAddBackup: () => void;
  onRemoveBackup: (id: string) => void;
  onSave: () => void;
};

export default function ContactsSheet({
  open,
  primaryContact,
  backupContacts,
  onClose,
  onPrimaryFieldChange,
  onBackupFieldChange,
  onAvatarUpload,
  onAddBackup,
  onRemoveBackup,
  onSave
}: ContactsSheetProps) {
  return (
    <>
      <div className={`sheet-overlay ${open ? "show" : ""}`} onClick={onClose} />
      <div className={`sheet ${open ? "show" : ""}`}>
        <div className="sheet-handle" />
        <div className="sheet-header">
          <h3>紧急联系人</h3>
          <button className="link" type="button" onClick={onClose}>
            关闭
          </button>
        </div>
        <div className="sheet-section">
          <h4>首选联系人（仅一个）</h4>
          <ContactCard
            contact={primaryContact}
            namePrefix="primary"
            onFieldChange={onPrimaryFieldChange}
            onAvatarUpload={(file) => onAvatarUpload(file, "primary")}
          />
        </div>

        <div className="sheet-section">
          <h4>备选联系人</h4>
          {backupContacts.map((contact) => (
            <ContactCard
              key={contact.id}
              contact={contact}
              namePrefix={`backup_${contact.id}`}
              onFieldChange={(key, value) => onBackupFieldChange(contact.id, key, value)}
              onAvatarUpload={(file) => onAvatarUpload(file, "backup", contact.id)}
              onRemove={() => onRemoveBackup(contact.id)}
            />
          ))}
          <button className="secondary" type="button" onClick={onAddBackup}>
            添加备选联系人
          </button>
        </div>

        <div className="sheet-actions">
          <button className="primary" type="button" onClick={onSave}>
            保存联系人
          </button>
        </div>
      </div>
    </>
  );
}
