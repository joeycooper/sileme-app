import { ProfileForm } from "../types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";

type ProfileSheetProps = {
  activePanel: "profile" | "alarm" | "estate" | null;
  form: ProfileForm;
  onFieldChange: <K extends keyof ProfileForm>(key: K, value: ProfileForm[K]) => void;
  onClose: () => void;
  onSave: () => void;
};

export default function ProfileSheet({
  activePanel,
  form,
  onFieldChange,
  onClose,
  onSave
}: ProfileSheetProps) {
  return (
    <Sheet
      open={Boolean(activePanel)}
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
          <SheetTitle>
            {activePanel === "profile"
              ? "个人信息"
              : activePanel === "alarm"
              ? "自动警报时间"
              : activePanel === "estate"
              ? "遗产分配设置"
              : ""}
          </SheetTitle>
          <SheetDescription className="sr-only">
            编辑个人资料、警报时间与遗产说明。
          </SheetDescription>
        </SheetHeader>
        {activePanel === "profile" ? (
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <label className="flex flex-col gap-2 text-sm font-medium text-muted-foreground">
              昵称
              <Input
                type="text"
                placeholder="设置昵称"
                value={form.nickname}
                onChange={(e) => onFieldChange("nickname", e.target.value)}
                name="nickname"
              />
            </label>
            <label className="flex flex-col gap-2 text-sm font-medium text-muted-foreground">
              微信号
              <Input
                type="text"
                placeholder="填写你的微信号"
                value={form.wechat}
                onChange={(e) => onFieldChange("wechat", e.target.value)}
                name="wechat"
              />
            </label>
            <label className="flex flex-col gap-2 text-sm font-medium text-muted-foreground">
              邮箱
              <Input
                type="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={(e) => onFieldChange("email", e.target.value)}
                name="email"
              />
            </label>
          </div>
        ) : null}
        {activePanel === "alarm" ? (
          <div className="mt-4 grid gap-4">
            <label className="flex flex-col gap-2 text-sm font-medium text-muted-foreground">
              小时数
              <Input
                type="number"
                min="1"
                max="72"
                value={form.alarmHours}
                onChange={(e) => onFieldChange("alarmHours", e.target.value)}
                name="alarm_hours"
              />
            </label>
          </div>
        ) : null}
        {activePanel === "estate" ? (
          <div className="mt-4 grid gap-4">
            <label className="flex flex-col gap-2 text-sm font-medium text-muted-foreground">
              说明
              <Textarea
                rows={4}
                placeholder="例如：遗产分配给家人..."
                value={form.estateNote}
                onChange={(e) => onFieldChange("estateNote", e.target.value)}
                name="estate_note"
              />
            </label>
          </div>
        ) : null}
        {activePanel ? (
          <div className="mt-6 flex justify-end">
            <Button className="h-11 rounded-full" type="button" onClick={onSave}>
              保存
            </Button>
          </div>
        ) : null}
      </SheetContent>
    </Sheet>
  );
}
