import ContactCard from "./ContactCard";
import { Contact } from "../types";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";

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
    <Sheet
      open={open}
      onOpenChange={(next) => {
        if (!next) onClose();
      }}
    >
      <SheetContent
        side="bottom"
        className="max-h-[calc(100vh-120px)] rounded-t-3xl border-border/70 bg-white/95 px-6 pb-10 overflow-y-auto"
      >
        <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-slate-200" />
        <SheetHeader className="text-left">
          <SheetTitle>紧急联系人</SheetTitle>
          <SheetDescription className="sr-only">
            管理首选与备选紧急联系人信息。
          </SheetDescription>
        </SheetHeader>
        <div className="mt-4 space-y-4">
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-ink">首选联系人（仅一个）</h4>
            <ContactCard
              contact={primaryContact}
              namePrefix="primary"
              onFieldChange={onPrimaryFieldChange}
              onAvatarUpload={(file) => onAvatarUpload(file, "primary")}
            />
          </div>

          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-ink">备选联系人</h4>
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
            <Button variant="outline" type="button" onClick={onAddBackup} className="rounded-full">
              添加备选联系人
            </Button>
          </div>

          <div className="flex justify-end">
            <Button className="h-11 rounded-full" type="button" onClick={onSave}>
              保存联系人
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
