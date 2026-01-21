type EncourageOption = { label: string; emoji: string };

import { Button } from "@/components/ui/button";

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
    <div className="space-y-3 rounded-2xl border border-border/70 bg-white/90 p-5 shadow-sm">
      <h5 className="text-sm font-semibold text-ink">发送群鼓励</h5>
      <div className="flex flex-wrap gap-2">
        <select
          value={choice}
          onChange={(event) => onChoiceChange(event.target.value)}
          className="h-10 rounded-md border border-border bg-white px-3 text-sm text-ink shadow-sm focus:outline-none focus:ring-2 focus:ring-brand/40"
          name="group_encourage_choice"
        >
          {options.map((option) => (
            <option key={option.emoji} value={option.emoji}>
              {option.emoji} {option.label}
            </option>
          ))}
        </select>
        <Button type="button" onClick={onSend} className="rounded-full">
          发送鼓励
        </Button>
      </div>
    </div>
  );
}
