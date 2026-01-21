import { Star } from "lucide-react";

type StarRatingProps = {
  value: string;
  onChange: (next: string) => void;
};

export default function StarRating({ value, onChange }: StarRatingProps) {
  const current = Number(value || 0);
  return (
    <div className="flex items-center gap-2">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          className={`rounded-full p-1 transition ${
            current >= star ? "text-amber-400" : "text-slate-300"
          }`}
          onClick={() => onChange(String(star))}
          aria-label={`设置为 ${star} 分`}
        >
          <Star className="h-4 w-4" fill={current >= star ? "currentColor" : "none"} />
        </button>
      ))}
      <span className="text-xs text-muted-foreground">{value || "-"}</span>
    </div>
  );
}
