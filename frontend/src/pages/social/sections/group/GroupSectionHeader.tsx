import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

type GroupSectionHeaderProps = {
  onOpenPanel: () => void;
};

export default function GroupSectionHeader({ onOpenPanel }: GroupSectionHeaderProps) {
  return (
    <Button className="rounded-full" variant="outline" type="button" onClick={onOpenPanel}>
      <Plus className="h-4 w-4" />
      创建/加入
    </Button>
  );
}
