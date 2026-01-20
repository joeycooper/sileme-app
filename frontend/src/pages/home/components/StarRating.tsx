type StarRatingProps = {
  value: string;
  onChange: (next: string) => void;
};

export default function StarRating({ value, onChange }: StarRatingProps) {
  const current = Number(value || 0);
  return (
    <div className="stars">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          className={`star ${current >= star ? "active" : ""}`}
          onClick={() => onChange(String(star))}
          aria-label={`设置为 ${star} 分`}
        >
          ★
        </button>
      ))}
      <span className="star-value">{value || "-"}</span>
    </div>
  );
}
