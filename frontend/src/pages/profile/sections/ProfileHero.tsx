import { ProfileForm } from "../types";

type ProfileHeroProps = {
  form: ProfileForm;
  phone: string | null;
  timezone: string | null;
  onAvatarUpload: (file: File) => void;
};

export default function ProfileHero({ form, phone, timezone, onAvatarUpload }: ProfileHeroProps) {
  return (
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
              if (file) onAvatarUpload(file);
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
  );
}
