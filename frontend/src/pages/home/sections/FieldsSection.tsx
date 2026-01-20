import StarRating from "../components/StarRating";
import { HomeForm } from "../constants";

type FieldsSectionProps = {
  form: HomeForm;
  onFieldChange: <K extends keyof HomeForm>(key: K, value: HomeForm[K]) => void;
};

export default function FieldsSection({ form, onFieldChange }: FieldsSectionProps) {
  return (
    <section className="card">
      <div className="fields">
        <div className="compact-row">
          <label className="compact-field">
            睡眠
            <input
              type="number"
              min="0"
              max="24"
              placeholder="7"
              value={form.sleep_hours}
              onChange={(e) => onFieldChange("sleep_hours", e.target.value)}
              name="sleep_hours"
            />
          </label>
          <label className="compact-field">
            精力
            <div className="compact-stars">
              <StarRating
                value={form.energy}
                onChange={(value) => onFieldChange("energy", value)}
              />
            </div>
          </label>
          <label className="compact-field">
            心情
            <div className="compact-stars">
              <StarRating
                value={form.mood}
                onChange={(value) => onFieldChange("mood", value)}
              />
            </div>
          </label>
        </div>
        <label className="span-2">
          备注
          <input
            type="text"
            placeholder="今天的我..."
            value={form.note}
            onChange={(e) => onFieldChange("note", e.target.value)}
            name="note"
          />
        </label>
      </div>
    </section>
  );
}
