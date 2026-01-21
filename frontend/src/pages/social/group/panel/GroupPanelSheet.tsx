import type { GroupForm } from "../../hooks/groupTypes";
import GroupCreateCard from "./GroupCreateCard";
import GroupJoinCard from "./GroupJoinCard";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";

type GroupPanelSheetProps = {
  open: boolean;
  form: GroupForm;
  onClose: () => void;
  onJoin: () => void;
  onCreate: () => void;
  onFieldChange: <K extends keyof GroupForm>(key: K, value: GroupForm[K]) => void;
};

export default function GroupPanelSheet({
  open,
  form,
  onClose,
  onJoin,
  onCreate,
  onFieldChange
}: GroupPanelSheetProps) {
  return (
    <Sheet
      open={open}
      onOpenChange={(next) => {
        if (!next) onClose();
      }}
    >
      <SheetContent
        side="bottom"
        className="max-h-[calc(100vh-120px)] overflow-y-auto rounded-t-3xl border-border/70 bg-white/95 px-6 pb-10"
      >
        <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-slate-200" />
        <SheetHeader className="text-left">
          <SheetTitle>群组</SheetTitle>
          <SheetDescription className="sr-only">
            创建或加入群组，管理邀请码与审核设置。
          </SheetDescription>
        </SheetHeader>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <GroupJoinCard form={form} onJoin={onJoin} onFieldChange={onFieldChange} />
          <GroupCreateCard form={form} onCreate={onCreate} onFieldChange={onFieldChange} />
        </div>
      </SheetContent>
    </Sheet>
  );
}
