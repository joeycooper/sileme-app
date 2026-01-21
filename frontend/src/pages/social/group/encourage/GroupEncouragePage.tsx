import { Toast } from "../../../../components/common";
import { GroupDetail, GroupEncouragePost } from "../../../../services/api";
import GroupEncourageActions from "./GroupEncourageActions";
import GroupEncourageHeader from "./GroupEncourageHeader";
import GroupEncourageRank from "./GroupEncourageRank";
import GroupEncourageWall from "./GroupEncourageWall";
import { Button } from "@/components/ui/button";

type EncourageOption = { label: string; emoji: string };

type GroupEncouragePageProps = {
  selectedGroup: GroupDetail | null;
  groupEncourageWall: GroupEncouragePost[];
  groupEncourageChoice: string;
  groupEncourageOptions: EncourageOption[];
  notice: string | null;
  onClose: () => void;
  onOpenDetail: () => void;
  onEncourageChoiceChange: (value: string) => void;
  onSendEncourage: () => void;
  formatTime: (value: string) => string;
};

export default function GroupEncouragePage({
  selectedGroup,
  groupEncourageWall,
  groupEncourageChoice,
  groupEncourageOptions,
  notice,
  onClose,
  onOpenDetail,
  onEncourageChoiceChange,
  onSendEncourage,
  formatTime
}: GroupEncouragePageProps) {
  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-slate-50">
      <div className="grid grid-cols-[1fr_auto_1fr] items-center border-b border-border bg-white/90 px-4 py-3 text-sm text-muted-foreground backdrop-blur">
        <Button variant="ghost" size="sm" type="button" onClick={onClose} className="justify-self-start">
          返回
        </Button>
        <h3 className="text-center text-base font-semibold text-ink">群鼓励</h3>
        {selectedGroup ? (
          <Button variant="ghost" size="sm" type="button" onClick={onOpenDetail} className="justify-self-end">
            群详情
          </Button>
        ) : (
          <span />
        )}
      </div>
      <div className="flex-1 overflow-y-auto px-4 py-6">
        {selectedGroup ? (
          <div className="mx-auto flex w-full max-w-5xl flex-col gap-4">
            <GroupEncourageHeader group={selectedGroup} />
            <div className="grid gap-4 lg:grid-cols-[2fr_1fr]">
              <GroupEncourageWall posts={groupEncourageWall} formatTime={formatTime} />
              <GroupEncourageRank group={selectedGroup} />
            </div>
            <GroupEncourageActions
              choice={groupEncourageChoice}
              options={groupEncourageOptions}
              onChoiceChange={onEncourageChoiceChange}
              onSend={onSendEncourage}
            />
          </div>
        ) : (
          <p className="text-center text-sm text-muted-foreground">暂无群组信息</p>
        )}
      </div>
      <Toast message={notice} />
    </div>
  );
}
