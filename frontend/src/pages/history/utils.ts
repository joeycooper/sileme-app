import { Checkin, Summary } from "../../services/api";

export function formatDate(value: string) {
  return new Date(value).toLocaleDateString("zh-CN", {
    month: "2-digit",
    day: "2-digit"
  });
}

export function dateKey(value: string) {
  return value.split("T")[0];
}

export function formatDateKey(year: number, month: number, day: number) {
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

export function buildMockSummary(days: number): Summary {
  const today = new Date();
  const energyPattern = [3, 4, 5, 4, 3, 4, 5];
  const moodPattern = [2, 3, 4, 4, 3, 4, 5];
  const items: Summary["items"] = Array.from({ length: days }, (_, idx) => {
    const date = new Date(today);
    date.setDate(today.getDate() - (days - 1 - idx));
    const energy = energyPattern[idx % energyPattern.length];
    const mood = moodPattern[idx % moodPattern.length];
    return {
      date: date.toISOString(),
      checked_in: true,
      sleep_hours: 6 + (idx % 3),
      energy,
      mood
    };
  });
  const avgEnergy = items.reduce((sum, item) => sum + (item.energy ?? 0), 0) / items.length;
  const avgMood = items.reduce((sum, item) => sum + (item.mood ?? 0), 0) / items.length;
  const avgSleep =
    items.reduce((sum, item) => sum + (item.sleep_hours ?? 0), 0) / items.length;

  return {
    days,
    checkins: days,
    checkin_rate: 1,
    avg_sleep_hours: Number(avgSleep.toFixed(1)),
    avg_energy: Number(avgEnergy.toFixed(1)),
    avg_mood: Number(avgMood.toFixed(1)),
    items
  };
}

export function buildMockCheckins(days: number): Checkin[] {
  const summary = buildMockSummary(days);
  return summary.items.map((item, idx) => ({
    id: idx + 1,
    date: item.date,
    alive: true,
    sleep_hours: item.sleep_hours ?? 7,
    energy: item.energy ?? 3,
    mood: item.mood ?? 3,
    note: `第 ${idx + 1} 天记录`
  }));
}
