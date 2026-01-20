import { EmptyState, LoadingState, SectionHeader } from "../../../../components/common";
import type { FriendSectionProps } from "../../hooks/sectionProps";
import FriendCard from "./FriendCard";
import FriendDetailCard from "./FriendDetail";
import FriendSectionHeader from "./FriendSectionHeader";

export default function FriendSection({
  friends,
  details,
  selectedId,
  loading,
  actionLoadingId,
  encourageChoice,
  encourageOptions,
  onEncourageChoiceChange,
  onAddClick,
  onRefresh,
  onToggleDetail,
  onAccept,
  onPermissionUpdate,
  onRemind,
  onEncourage
}: FriendSectionProps) {
  return (
    <section className="card">
      <SectionHeader
        title="好友列表"
        subtitle="查看好友的打卡状态并互相鼓励"
        className="friend-list-header"
        actions={<FriendSectionHeader onAddClick={onAddClick} onRefresh={onRefresh} />}
      />

      {loading ? (
        <LoadingState />
      ) : friends.length === 0 ? (
        <EmptyState title="还没有好友" description="先邀请一位朋友一起打卡吧" showIllustration={false} />
      ) : (
        <div className="friend-list">
          {friends.map((friend) => {
            const detail = details[friend.id];
            const isExpanded = selectedId === friend.id;
            return (
              <div key={friend.id} className="friend-item">
                <FriendCard
                  friend={friend}
                  isExpanded={isExpanded}
                  onToggle={() => onToggleDetail(friend)}
                />

                {isExpanded ? (
                  <FriendDetailCard
                    friend={friend}
                    detail={detail}
                    actionLoadingId={actionLoadingId}
                    encourageChoice={encourageChoice}
                    encourageOptions={encourageOptions}
                    onEncourageChoiceChange={onEncourageChoiceChange}
                    onAccept={onAccept}
                    onPermissionUpdate={onPermissionUpdate}
                    onRemind={onRemind}
                    onEncourage={onEncourage}
                  />
                ) : null}
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
