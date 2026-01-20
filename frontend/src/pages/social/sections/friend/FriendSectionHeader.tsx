type FriendSectionHeaderProps = {
  onAddClick: () => void;
  onRefresh: () => void;
};

export default function FriendSectionHeader({ onAddClick, onRefresh }: FriendSectionHeaderProps) {
  return (
    <div className="notice-actions">
      <button className="secondary add-friend-trigger" type="button" onClick={onAddClick}>
        <span className="add-friend-icon" aria-hidden="true">
          <svg viewBox="0 0 24 24" role="img" focusable="false">
            <path
              d="M12 5v14M5 12h14"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </span>
        添加好友
      </button>
      <button className="secondary" type="button" onClick={onRefresh}>
        刷新
      </button>
    </div>
  );
}
