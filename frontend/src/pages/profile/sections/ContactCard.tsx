import { Contact } from "../types";

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
    <div className="contact-card">
      {title ? <h4>{title}</h4> : null}
      <div className="contact-avatar">
        <label className="avatar-upload">
          {contact.avatar ? <img src={contact.avatar} alt="头像" /> : <span>上传头像</span>}
          <input
            type="file"
            accept="image/*"
            name={`${namePrefix}_avatar`}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) onAvatarUpload(file);
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
            onChange={(e) => onFieldChange("name", e.target.value)}
            name={`${namePrefix}_name`}
            required
          />
        </label>
        <label>
          关系
          <input
            type="text"
            value={contact.relation}
            onChange={(e) => onFieldChange("relation", e.target.value)}
            name={`${namePrefix}_relation`}
            required
          />
        </label>
        <label>
          手机号
          <input
            type="tel"
            value={contact.phone}
            onChange={(e) => onFieldChange("phone", e.target.value)}
            name={`${namePrefix}_phone`}
            required
          />
        </label>
        <label>
          微信
          <input
            type="text"
            value={contact.wechat || ""}
            onChange={(e) => onFieldChange("wechat", e.target.value)}
            name={`${namePrefix}_wechat`}
          />
        </label>
        <label>
          邮箱
          <input
            type="email"
            value={contact.email || ""}
            onChange={(e) => onFieldChange("email", e.target.value)}
            name={`${namePrefix}_email`}
          />
        </label>
        <label className="span-2">
          备注
          <textarea
            rows={2}
            value={contact.note || ""}
            onChange={(e) => onFieldChange("note", e.target.value)}
            name={`${namePrefix}_note`}
          />
        </label>
      </div>
      {onRemove ? (
        <button className="link danger" type="button" onClick={onRemove}>
          删除
        </button>
      ) : null}
    </div>
  );
}
