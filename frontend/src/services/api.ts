export type CheckinPayload = {
  alive: boolean;
  sleep_hours?: number | null;
  energy?: number | null;
  mood?: number | null;
  note?: string | null;
};

export type Checkin = CheckinPayload & {
  id: number;
  date: string;
};

export type Stats = {
  streak_days: number;
  checkin_rate: number;
  avg_sleep_hours: number;
  total_days: number;
  checkins: number;
  window_days: number;
};

const API_BASE = "http://localhost:8000";

async function handleJson<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || res.statusText);
  }
  return (await res.json()) as T;
}

export async function getTodayCheckin(): Promise<Checkin | null> {
  const res = await fetch(`${API_BASE}/checkins/today`);
  if (res.status === 404) {
    return null;
  }
  return handleJson<Checkin>(res);
}

export async function upsertToday(payload: CheckinPayload): Promise<Checkin> {
  const res = await fetch(`${API_BASE}/checkins/today`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  return handleJson<Checkin>(res);
}

export async function getStats(): Promise<Stats> {
  const res = await fetch(`${API_BASE}/checkins/stats`);
  return handleJson<Stats>(res);
}
