import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";

type AddFriendSheetProps = {
  open: boolean;
  phone: string;
  message: string;
  messageLimit: number;
  submitting: boolean;
  onClose: () => void;
  onPhoneChange: (value: string) => void;
  onMessageChange: (value: string) => void;
  onSubmit: () => void;
};

export default function AddFriendSheet({
  open,
  phone,
  message,
  messageLimit,
  submitting,
  onClose,
  onPhoneChange,
  onMessageChange,
  onSubmit
}: AddFriendSheetProps) {
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
          <SheetTitle>添加好友</SheetTitle>
          <SheetDescription className="sr-only">
            通过手机号发送好友请求与留言。
          </SheetDescription>
        </SheetHeader>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <label className="flex flex-col gap-2 text-sm font-medium text-muted-foreground">
            手机号
            <Input
              type="tel"
              placeholder="输入对方手机号"
              value={phone}
              onChange={(event) => onPhoneChange(event.target.value)}
              name="friend_phone"
              required
            />
          </label>
          <label className="md:col-span-2 flex flex-col gap-2 text-sm font-medium text-muted-foreground">
            留言
            <Textarea
              placeholder="给对方说一句话"
              value={message}
              onChange={(event) => onMessageChange(event.target.value)}
              name="friend_message"
              maxLength={messageLimit}
              className="min-h-[88px]"
            />
            <span className="text-xs text-muted-foreground">剩余 {messageLimit - message.length} 字</span>
          </label>
          <Button
            className="md:col-span-2 h-11 rounded-full text-base"
            type="button"
            onClick={onSubmit}
            disabled={submitting}
          >
            {submitting ? "发送中..." : "发送好友请求"}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
