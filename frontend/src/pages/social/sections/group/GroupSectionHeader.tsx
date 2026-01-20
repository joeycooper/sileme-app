type GroupSectionHeaderProps = {
  onOpenPanel: () => void;
};

export default function GroupSectionHeader({ onOpenPanel }: GroupSectionHeaderProps) {
  return (
    <div className="notice-actions">
      <button className="secondary add-friend-trigger" type="button" onClick={onOpenPanel}>
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
        创建/加入
      </button>
    </div>
  );
}
