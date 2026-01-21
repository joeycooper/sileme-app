import { ProfileForm } from "../types";
import { Card, CardContent } from "@/components/ui/card";

type ProfileHeroProps = {
  form: ProfileForm;
  phone: string | null;
  timezone: string | null;
  onAvatarUpload: (file: File) => void;
};

export default function ProfileHero({ form, phone, timezone, onAvatarUpload }: ProfileHeroProps) {
  return (
    <section>
      <Card className="border-border/70 bg-white/85 shadow-soft backdrop-blur">
        <CardContent className="flex flex-wrap items-center gap-4">
          <label className="relative flex h-24 w-24 cursor-pointer items-center justify-center overflow-hidden rounded-3xl border border-dashed border-border bg-white/80 text-xs text-muted-foreground">
            {form.avatarUrl ? (
              <img src={form.avatarUrl} alt="头像" className="h-full w-full object-cover" />
            ) : (
              <span>上传头像</span>
            )}
            <input
              type="file"
              accept="image/*"
              name="avatar"
              className="absolute inset-0 cursor-pointer opacity-0"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) onAvatarUpload(file);
              }}
            />
          </label>
          <div className="space-y-1">
            <h2 className="text-xl font-semibold text-ink">{form.nickname || "未设置昵称"}</h2>
            <p className="text-xs text-muted-foreground">手机号 {phone || "-"}</p>
            <p className="text-xs text-muted-foreground">时区 {timezone || "-"}</p>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
