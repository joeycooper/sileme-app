type EncourageOption = { label: string; emoji: string };

type GroupEncourageActionsProps = {
  choice: string;
  options: EncourageOption[];
  onChoiceChange: (value: string) => void;
  onSend: () => void;
};

export default function GroupEncourageActions({
  choice,
  options,
  onChoiceChange,
  onSend
}: GroupEncourageActionsProps) {
  return (
    <div className="group-encourage-card">
      <h5>发送群鼓励</h5>
      <div className="group-encourage-actions">
        <select
          value={choice}
          onChange={(event) => onChoiceChange(event.target.value)}
          className="encourage-select"
          name="group_encourage_choice"
        >
          {options.map((option) => (
            <option key={option.emoji} value={option.emoji}>
              {option.emoji} {option.label}
            </option>
          ))}
        </select>
        <button className="primary" type="button" onClick={onSend}>
          发送鼓励
        </button>
      </div>
    </div>
  );
}
