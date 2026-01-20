import { useCallback, useEffect, useRef, useState } from "react";
import type { MutableRefObject } from "react";
import { useFormState } from "../../hooks";
import {
  Checkin,
  CheckinPayload,
  Stats,
  getMe,
  getStats,
  getTodayCheckin,
  upsertToday
} from "../../services/api";
import { emptyForm, HomeForm } from "./constants";

type HomeHandlers = {
  showNotice: (message: string) => void;
  showError: (message: string) => void;
};

type HomeDataOptions = HomeHandlers & {
  isAuthed: boolean;
  onRequireLogin?: () => void;
};

export function useAlarmCountdown(
  alarmHours: number,
  lastCheckinTsRef: MutableRefObject<number | null>
) {
  const [countdown, setCountdown] = useState("24:00:00");

  useEffect(() => {
    const interval = window.setInterval(() => {
      const ts = lastCheckinTsRef.current;
      const totalMs = alarmHours * 60 * 60 * 1000;
      if (!ts) {
        setCountdown(`${String(alarmHours).padStart(2, "0")}:00:00`);
        return;
      }
      const elapsed = Date.now() - ts;
      const remaining = Math.max(totalMs - elapsed, 0);
      if (remaining === 0) {
        const hoursPassed = Math.floor(elapsed / 3600000);
        setCountdown(`请尽快打卡，不要让家人朋友担心（已过${hoursPassed}小时）`);
        return;
      }
      const hours = Math.floor(remaining / 3600000);
      const minutes = Math.floor((remaining % 3600000) / 60000);
      const seconds = Math.floor((remaining % 60000) / 1000);
      setCountdown(
        `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(
          seconds
        ).padStart(2, "0")}`
      );
    }, 1000);

    return () => window.clearInterval(interval);
  }, [alarmHours, lastCheckinTsRef]);

  return countdown;
}

export function useHomeData({ isAuthed, onRequireLogin, showError }: HomeDataOptions) {
  const [today, setToday] = useState<Checkin | null>(null);
  const [stats, setStats] = useState<Stats | null>(null);
  const { form, setForm, updateField } = useFormState<HomeForm>(emptyForm);
  const [loading, setLoading] = useState(false);
  const [lastCheckinTime, setLastCheckinTime] = useState<string | null>(null);
  const [alarmHours, setAlarmHours] = useState<number>(24);
  const lastCheckinTsRef = useRef<number | null>(null);

  const refresh = useCallback(async () => {
    try {
      const enterTs = Date.now();
      const [todayRes, statsRes, meRes] = await Promise.all([
        getTodayCheckin(),
        getStats(),
        getMe()
      ]);
      setToday(todayRes);
      setStats(statsRes);
      if (meRes.alarm_hours) {
        setAlarmHours(meRes.alarm_hours);
      }
      lastCheckinTsRef.current = enterTs;
      if (todayRes) {
        setForm({
          sleep_hours: todayRes.sleep_hours?.toString() ?? "",
          energy: todayRes.energy?.toString() ?? "",
          mood: todayRes.mood?.toString() ?? "",
          note: todayRes.note ?? ""
        });
        const storedTime = localStorage.getItem(`sileme_checkin_time_${todayRes.date}`);
        setLastCheckinTime(storedTime);
        localStorage.setItem("sileme_notice_date", todayRes.date);
      } else {
        setLastCheckinTime(null);
      }
    } catch (err) {
      showError(err instanceof Error ? err.message : "加载失败");
    }
  }, [showError]);

  useEffect(() => {
    function handleAlarmChange(event: Event) {
      const custom = event as CustomEvent<number>;
      if (typeof custom.detail === "number") {
        setAlarmHours(custom.detail);
      }
    }

    window.addEventListener("sileme-alarm-hours", handleAlarmChange);
    return () => {
      window.removeEventListener("sileme-alarm-hours", handleAlarmChange);
    };
  }, []);

  useEffect(() => {
    if (isAuthed) {
      void refresh();
    } else {
      setToday(null);
      setStats(null);
      setLastCheckinTime(null);
      lastCheckinTsRef.current = Date.now();
    }
  }, [isAuthed, refresh]);

  function toNumberOrNull(value: string): number | null {
    if (!value.trim()) return null;
    const num = Number(value);
    return Number.isFinite(num) ? num : null;
  }

  async function submitCheckin() {
    if (!isAuthed) {
      showError("请先登录");
      onRequireLogin?.();
      return;
    }
    setLoading(true);
    const payload: CheckinPayload = {
      alive: true,
      sleep_hours: toNumberOrNull(form.sleep_hours),
      energy: toNumberOrNull(form.energy),
      mood: toNumberOrNull(form.mood),
      note: form.note.trim() ? form.note.trim() : null
    };

    try {
      const saved = await upsertToday(payload);
      setToday(saved);
      const statsRes = await getStats();
      setStats(statsRes);
      const time = new Date().toLocaleTimeString("zh-CN", {
        hour: "2-digit",
        minute: "2-digit"
      });
      const ts = Date.now();
      localStorage.setItem(`sileme_checkin_time_${saved.date}`, time);
      setLastCheckinTime(time);
      lastCheckinTsRef.current = ts;
      localStorage.setItem("sileme_notice_date", saved.date);
    } catch (err) {
      showError(err instanceof Error ? err.message : "提交失败");
    } finally {
      setLoading(false);
    }
  }

  return {
    today,
    stats,
    form,
    setForm,
    updateField,
    loading,
    alarmHours,
    lastCheckinTime,
    lastCheckinTsRef,
    refresh,
    submitCheckin
  };
}
