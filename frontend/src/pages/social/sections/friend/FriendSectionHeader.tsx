import { Button } from "@/components/ui/button";
import { Plus, RefreshCw } from "lucide-react";

type FriendSectionHeaderProps = {
  onAddClick: () => void;
  onRefresh: () => void;
};

export default function FriendSectionHeader({ onAddClick, onRefresh }: FriendSectionHeaderProps) {
  return (
    <div className="flex items-center gap-2">
      <Button type="button" variant="outline" onClick={onAddClick} className="rounded-full">
        <Plus className="h-4 w-4" />
        添加好友
      </Button>
      <Button type="button" variant="outline" onClick={onRefresh} className="rounded-full">
        <RefreshCw className="h-4 w-4" />
        刷新
      </Button>
    </div>
  );
}
