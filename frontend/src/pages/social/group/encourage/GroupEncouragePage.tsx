import { Toast } from "../../../../components/common";
import { GroupDetail, GroupEncouragePost } from "../../../../services/api";
import GroupEncourageActions from "./GroupEncourageActions";
import GroupEncourageHeader from "./GroupEncourageHeader";
import GroupEncourageRank from "./GroupEncourageRank";
import GroupEncourageWall from "./GroupEncourageWall";

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
    <div className="group-encourage-panel">
      <div className="group-encourage-toolbar">
        <button className="link" type="button" onClick={onClose}>
          返回
        </button>
        <h3>群鼓励</h3>
        {selectedGroup ? (
          <button className="link" type="button" onClick={onOpenDetail}>
            群详情
          </button>
        ) : null}
      </div>
      <div className="group-encourage-content">
        <div className="group-encourage-page">
          {selectedGroup ? (
            <>
              <GroupEncourageHeader group={selectedGroup} />
              <div className="group-encourage-grid">
                <GroupEncourageWall posts={groupEncourageWall} formatTime={formatTime} />
                <GroupEncourageRank group={selectedGroup} />
              </div>
              <GroupEncourageActions
                choice={groupEncourageChoice}
                options={groupEncourageOptions}
                onChoiceChange={onEncourageChoiceChange}
                onSend={onSendEncourage}
              />
            </>
          ) : (
            <p className="muted">暂无群组信息</p>
          )}
        </div>
      </div>
      <Toast message={notice} />
    </div>
  );
}
