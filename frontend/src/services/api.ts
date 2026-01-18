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

export type AuthUser = {
  id: number;
  phone: string;
  timezone: string;
  created_at: string;
};

export type TokenPair = {
  access_token: string;
  refresh_token: string;
  token_type: "bearer";
  access_expires_in: number;
  refresh_expires_in: number;
};

export type LoginPayload = {
  phone: string;
  password: string;
};

export type RegisterPayload = {
  phone: string;
  password: string;
  timezone: string;
};

const API_BASE = "http://localhost:8000";
const STORAGE_KEY = "sileme_auth";

let accessToken: string | null = null;
let refreshToken: string | null = null;
let refreshPromise: Promise<boolean> | null = null;

function loadTokensFromStorage() {
  if (accessToken || refreshToken) return;
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return;
  try {
    const data = JSON.parse(raw) as TokenPair;
    accessToken = data.access_token;
    refreshToken = data.refresh_token;
  } catch {
    localStorage.removeItem(STORAGE_KEY);
  }
}

function saveTokens(tokens: TokenPair) {
  accessToken = tokens.access_token;
  refreshToken = tokens.refresh_token;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tokens));
}

export function clearTokens() {
  accessToken = null;
  refreshToken = null;
  localStorage.removeItem(STORAGE_KEY);
}

export function hasRefreshToken(): boolean {
  loadTokensFromStorage();
  return Boolean(refreshToken);
}

async function extractErrorMessage(res: Response): Promise<string> {
  const contentType = res.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    try {
      const data = (await res.json()) as { detail?: string | { msg?: string }[] };
      if (typeof data.detail === "string") {
        return data.detail;
      }
      if (Array.isArray(data.detail) && data.detail[0]?.msg) {
        return data.detail[0].msg;
      }
    } catch {
      // fall through to text parsing
    }
  }
  const text = await res.text();
  return text || res.statusText;
}

function toFriendlyMessage(raw: string): string {
  const lower = raw.toLowerCase();
  if (lower.includes("invalid credentials")) return "手机号或密码不正确。";
  if (lower.includes("phone already registered")) return "这个手机号已注册，请直接登录。";
  if (lower.includes("not authenticated")) return "请先登录再操作。";
  if (lower.includes("invalid token")) return "登录状态已失效，请重新登录。";
  if (lower.includes("refresh token")) return "登录已过期，请重新登录。";
  if (lower.includes("no check-in for today")) return "今天还没有打卡记录。";
  if (lower.includes("invalid timezone")) return "时区填写不正确，请检查后再试。";
  if (lower.includes("field required")) return "有必填项未填写，请检查。";
  if (lower.includes("string should match pattern")) return "手机号格式不正确。";
  if (lower.includes("string should have at least")) return "密码至少 8 位。";
  return "操作失败，请稍后再试。";
}

async function handleJson<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const raw = await extractErrorMessage(res);
    throw new Error(toFriendlyMessage(raw));
  }
  return (await res.json()) as T;
}

async function requestRefresh(): Promise<boolean> {
  loadTokensFromStorage();
  if (!refreshToken) return false;

  try {
    const res = await fetch(`${API_BASE}/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh_token: refreshToken })
    });
    const data = await handleJson<TokenPair>(res);
    saveTokens(data);
    return true;
  } catch {
    clearTokens();
    return false;
  }
}

async function refreshTokensOnce(): Promise<boolean> {
  if (!refreshPromise) {
    refreshPromise = requestRefresh().finally(() => {
      refreshPromise = null;
    });
  }
  return refreshPromise;
}

async function apiFetch(input: RequestInfo, init: RequestInit = {}, retry = true) {
  loadTokensFromStorage();
  const headers = new Headers(init.headers || {});
  if (accessToken) {
    headers.set("Authorization", `Bearer ${accessToken}`);
  }
  const res = await fetch(input, { ...init, headers });
  if (res.status === 401 && retry) {
    const refreshed = await refreshTokensOnce();
    if (refreshed) {
      return apiFetch(input, init, false);
    }
  }
  return res;
}

export async function authLogin(payload: LoginPayload): Promise<void> {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  const data = await handleJson<TokenPair>(res);
  saveTokens(data);
}

export async function authRegister(payload: RegisterPayload): Promise<void> {
  const res = await fetch(`${API_BASE}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  await handleJson<AuthUser>(res);
}

export async function authLogout(): Promise<void> {
  loadTokensFromStorage();
  if (refreshToken) {
    await fetch(`${API_BASE}/auth/logout`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh_token: refreshToken })
    });
  }
  clearTokens();
}

export async function getMe(): Promise<AuthUser> {
  const res = await apiFetch(`${API_BASE}/me`);
  return handleJson<AuthUser>(res);
}

export async function getTodayCheckin(): Promise<Checkin | null> {
  const res = await apiFetch(`${API_BASE}/checkins/today`);
  if (res.status === 404) {
    return null;
  }
  return handleJson<Checkin>(res);
}

export async function upsertToday(payload: CheckinPayload): Promise<Checkin> {
  const res = await apiFetch(`${API_BASE}/checkins/today`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  return handleJson<Checkin>(res);
}

export async function getStats(): Promise<Stats> {
  const res = await apiFetch(`${API_BASE}/checkins/stats`);
  return handleJson<Stats>(res);
}
