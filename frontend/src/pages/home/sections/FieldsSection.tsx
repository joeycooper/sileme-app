import StarRating from "../components/StarRating";
import { HomeForm } from "../constants";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";

type FieldsSectionProps = {
  form: HomeForm;
  onFieldChange: <K extends keyof HomeForm>(key: K, value: HomeForm[K]) => void;
};

export default function FieldsSection({ form, onFieldChange }: FieldsSectionProps) {
  return (
    <section>
      <Card className="border-border/70 bg-white/85 shadow-soft backdrop-blur">
        <CardContent className="grid gap-4">
          <div className="grid gap-4 md:grid-cols-3">
            <label className="flex flex-col gap-2 text-sm font-medium text-muted-foreground">
              睡眠
              <Input
                type="number"
                min="0"
                max="24"
                placeholder="7"
                value={form.sleep_hours}
                onChange={(e) => onFieldChange("sleep_hours", e.target.value)}
                name="sleep_hours"
              />
            </label>
            <label className="flex flex-col gap-2 text-sm font-medium text-muted-foreground">
              精力
              <StarRating
                value={form.energy}
                onChange={(value) => onFieldChange("energy", value)}
              />
            </label>
            <label className="flex flex-col gap-2 text-sm font-medium text-muted-foreground">
              心情
              <StarRating value={form.mood} onChange={(value) => onFieldChange("mood", value)} />
            </label>
          </div>
          <label className="flex flex-col gap-2 text-sm font-medium text-muted-foreground">
            备注
            <Textarea
              placeholder="今天的我..."
              value={form.note}
              onChange={(e) => onFieldChange("note", e.target.value)}
              name="note"
              className="min-h-[88px]"
            />
          </label>
        </CardContent>
      </Card>
    </section>
  );
}
