import { Contact } from "../types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

type ContactCardProps = {
  contact: Contact;
  title?: string;
  onFieldChange: <K extends keyof Contact>(key: K, value: Contact[K]) => void;
  onAvatarUpload: (file: File) => void;
  onRemove?: () => void;
  namePrefix?: string;
};

export default function ContactCard({
  contact,
  title,
  onFieldChange,
  onAvatarUpload,
  onRemove,
  namePrefix = "contact"
}: ContactCardProps) {
  return (
    <div className="grid gap-4 rounded-2xl border border-border/70 bg-white/90 p-4 md:grid-cols-[120px_1fr]">
      {title ? <h4>{title}</h4> : null}
      <div className="flex items-start justify-center">
        <label className="relative flex h-24 w-24 cursor-pointer items-center justify-center overflow-hidden rounded-2xl border border-dashed border-border bg-white text-xs text-muted-foreground">
          {contact.avatar ? (
            <img src={contact.avatar} alt="头像" className="h-full w-full object-cover" />
          ) : (
            <span>上传头像</span>
          )}
          <input
            type="file"
            accept="image/*"
            name={`${namePrefix}_avatar`}
            className="absolute inset-0 cursor-pointer opacity-0"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) onAvatarUpload(file);
            }}
          />
        </label>
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        <label className="flex flex-col gap-2 text-sm font-medium text-muted-foreground">
          姓名
          <Input
            type="text"
            value={contact.name}
            onChange={(e) => onFieldChange("name", e.target.value)}
            name={`${namePrefix}_name`}
            required
          />
        </label>
        <label className="flex flex-col gap-2 text-sm font-medium text-muted-foreground">
          关系
          <Input
            type="text"
            value={contact.relation}
            onChange={(e) => onFieldChange("relation", e.target.value)}
            name={`${namePrefix}_relation`}
            required
          />
        </label>
        <label className="flex flex-col gap-2 text-sm font-medium text-muted-foreground">
          手机号
          <Input
            type="tel"
            value={contact.phone}
            onChange={(e) => onFieldChange("phone", e.target.value)}
            name={`${namePrefix}_phone`}
            required
          />
        </label>
        <label className="flex flex-col gap-2 text-sm font-medium text-muted-foreground">
          微信
          <Input
            type="text"
            value={contact.wechat || ""}
            onChange={(e) => onFieldChange("wechat", e.target.value)}
            name={`${namePrefix}_wechat`}
          />
        </label>
        <label className="flex flex-col gap-2 text-sm font-medium text-muted-foreground">
          邮箱
          <Input
            type="email"
            value={contact.email || ""}
            onChange={(e) => onFieldChange("email", e.target.value)}
            name={`${namePrefix}_email`}
          />
        </label>
        <label className="md:col-span-2 flex flex-col gap-2 text-sm font-medium text-muted-foreground">
          备注
          <Textarea
            rows={2}
            value={contact.note || ""}
            onChange={(e) => onFieldChange("note", e.target.value)}
            name={`${namePrefix}_note`}
          />
        </label>
      </div>
      {onRemove ? (
        <Button
          className="mt-2 w-fit text-red-600 hover:text-red-700"
          variant="ghost"
          type="button"
          onClick={onRemove}
        >
          删除
        </Button>
      ) : null}
    </div>
  );
}
