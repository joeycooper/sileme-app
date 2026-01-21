import { IconLogout, IconNote, IconPhone, IconTimer, IconUser } from "../../../components/icons";
import { Card, CardContent } from "@/components/ui/card";

type ProfileMenuProps = {
  onOpenProfile: () => void;
  onOpenContacts: () => void;
  onOpenAlarm: () => void;
  onOpenEstate: () => void;
  onLogout: () => void;
};

export default function ProfileMenu({
  onOpenProfile,
  onOpenContacts,
  onOpenAlarm,
  onOpenEstate,
  onLogout
}: ProfileMenuProps) {
  return (
    <section>
      <Card className="border-border/70 bg-white/85 shadow-soft backdrop-blur">
        <CardContent className="flex flex-col divide-y divide-border/70 p-0">
          {[
            { label: "个人信息", icon: <IconUser className="h-5 w-5" />, onClick: onOpenProfile },
            { label: "紧急联系人", icon: <IconPhone className="h-5 w-5" />, onClick: onOpenContacts },
            { label: "自动警报时间", icon: <IconTimer className="h-5 w-5" />, onClick: onOpenAlarm },
            { label: "遗产分配设置", icon: <IconNote className="h-5 w-5" />, onClick: onOpenEstate },
            { label: "退出登录", icon: <IconLogout className="h-5 w-5" />, onClick: onLogout, danger: true }
          ].map((item) => (
            <button
              key={item.label}
              className={`flex items-center gap-3 px-4 py-4 text-left text-sm transition hover:bg-brand/5 ${
                item.danger ? "text-red-600" : "text-ink"
              }`}
              type="button"
              onClick={item.onClick}
            >
              <span
                className={`flex h-9 w-9 items-center justify-center rounded-xl ${
                  item.danger ? "bg-red-50 text-red-600" : "bg-brand-soft text-brand"
                }`}
              >
                {item.icon}
              </span>
              <span className="flex-1">{item.label}</span>
              <span className="text-lg text-muted-foreground">›</span>
            </button>
          ))}
        </CardContent>
      </Card>
    </section>
  );
}
