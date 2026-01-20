import { Checkin, Summary } from "../../services/api";
import { dateKey, formatDateKey } from "./utils";

type HeatmapData = {
  cells: Array<Summary["items"][number] | null>;
  totalWeeks: number;
  monthLabels: Array<{ label: string; index: number }>;
};

type TrendData = {
  trendReady: boolean;
  sleepValues: number[];
  energyValues: number[];
  moodValues: number[];
  checkedItems: Summary["items"];
};

type ListData = {
  listItems: Summary["items"];
  visibleItems: Summary["items"];
  hasMore: boolean;
};

export function buildTrendData(summary: Summary | null): TrendData {
  const checkedItems = summary?.items.filter((item) => item.checked_in) ?? [];
  const trendReady = checkedItems.length >= 5;
  const moodValues = checkedItems
    .map((item) => item.mood)
    .filter((value): value is number => value !== null && value !== undefined);
  const energyValues = checkedItems
    .map((item) => item.energy)
    .filter((value): value is number => value !== null && value !== undefined);
  const sleepValues = checkedItems
    .map((item) => item.sleep_hours)
    .filter((value): value is number => value !== null && value !== undefined);

  return { trendReady, sleepValues, energyValues, moodValues, checkedItems };
}

export function buildListData(summary: Summary | null, visibleCount: number): ListData {
  const listItems = summary?.items.filter((item) => item.checked_in) ?? [];
  const visibleItems = listItems.slice().reverse().slice(0, visibleCount);
  const hasMore = visibleCount < listItems.length;
  return { listItems, visibleItems, hasMore };
}

export function buildHeatmapData(summary: Summary | null): HeatmapData | null {
  const items = summary?.items ?? [];
  if (items.length === 0) return null;
  const byDate = new Map(items.map((item) => [dateKey(item.date), item]));
  const startRange = new Date(items[0].date);
  const endRange = new Date(items[items.length - 1].date);
  startRange.setHours(0, 0, 0, 0);
  endRange.setHours(0, 0, 0, 0);

  const startOffset = (startRange.getDay() + 6) % 7;
  const totalDays =
    Math.floor((endRange.getTime() - startRange.getTime()) / 86400000) + 1;
  const totalCells = startOffset + totalDays;
  const totalWeeks = Math.ceil(totalCells / 7);
  const cells: Array<Summary["items"][number] | null> = Array.from(
    { length: totalWeeks * 7 },
    () => null
  );

  for (let i = 0; i < totalDays; i += 1) {
    const current = new Date(startRange);
    current.setDate(startRange.getDate() + i);
    const key = formatDateKey(current.getFullYear(), current.getMonth(), current.getDate());
    const item = byDate.get(key) ?? null;
    cells[startOffset + i] = item;
  }

  const monthLabels: Array<{ label: string; index: number }> = [];
  const seenMonths = new Set<string>();
  for (let i = 0; i < totalDays; i += 1) {
    const current = new Date(startRange);
    current.setDate(startRange.getDate() + i);
    if (current.getDate() === 1 || i === 0) {
      const label = `${current.getMonth() + 1}月`;
      const key = `${current.getFullYear()}-${current.getMonth() + 1}`;
      if (!seenMonths.has(key)) {
        seenMonths.add(key);
        monthLabels.push({
          label,
          index: Math.floor((startOffset + i) / 7)
        });
      }
    }
  }

  return { cells, totalWeeks, monthLabels };
}

export function buildCheckinsByDate(checkins: Checkin[]) {
  return new Map(checkins.map((item) => [dateKey(item.date), item]));
}
