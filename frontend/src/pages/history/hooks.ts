import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Checkin,
  CheckinPayload,
  Summary,
  getCheckins,
  getSummary,
  updateCheckin
} from "../../services/api";
import { useFormState } from "../../hooks";
import { useNotice } from "../../hooks";
import { buildMockCheckins, buildMockSummary, dateKey } from "./utils";
import {
  buildCheckinsByDate,
  buildHeatmapData,
  buildListData,
  buildTrendData
} from "./selectors";

type EditDraft = {
  sleep_hours: string;
  energy: string;
  mood: string;
  note: string;
};

export function useHistoryState() {
  const EDIT_WINDOW_DAYS = 7;
  const { notice, showNotice, showError } = useNotice();
  const [summary, setSummary] = useState<Summary | null>(null);
  const [listSummary, setListSummary] = useState<Summary | null>(null);
  const [heatmapSummary, setHeatmapSummary] = useState<Summary | null>(null);
  const [checkins, setCheckins] = useState<Checkin[]>([]);
  const [loading, setLoading] = useState(true);
  const [mockEnabled, setMockEnabled] = useState(false);
  const [days, setDays] = useState(14);
  const [visibleCount, setVisibleCount] = useState(10);
  const [editingDate, setEditingDate] = useState<string | null>(null);
  const { form: editDraft, setForm: setEditDraft, updateField: updateEditField } =
    useFormState<EditDraft>({
      sleep_hours: "",
      energy: "",
      mood: "",
      note: ""
    });
  const [saving, setSaving] = useState(false);
  const [expandedDate, setExpandedDate] = useState<string | null>(null);
  const heatmapRef = useRef<HTMLDivElement | null>(null);

  const refresh = useCallback(
    async (windowDays: number) => {
      setLoading(true);
      try {
        const summaryPromise = getSummary(windowDays);
        const listPromise = windowDays === 30 ? summaryPromise : getSummary(30);
        const checkinsPromise = getCheckins({ limit: 30, order: "desc" });
        const heatmapPromise = getSummary(180);
        const [summaryRes, listRes, checkinsRes, heatmapRes] = await Promise.all([
          summaryPromise,
          listPromise,
          checkinsPromise,
          heatmapPromise
        ]);
        setSummary(summaryRes);
        setListSummary(listRes);
        setCheckins(checkinsRes);
        setHeatmapSummary(heatmapRes);
      } catch (err) {
        showError(err instanceof Error ? err.message : "加载失败");
      } finally {
        setLoading(false);
      }
    },
    [showError]
  );

  useEffect(() => {
    void refresh(days);
  }, [days, refresh]);

  const displaySummary = mockEnabled ? buildMockSummary(days) : summary;
  const displayListSummary = mockEnabled ? buildMockSummary(30) : listSummary;
  const displayHeatmapSummary = mockEnabled ? buildMockSummary(180) : heatmapSummary;
  const displayCheckins = mockEnabled ? buildMockCheckins(30) : checkins;
  const showLoading = loading && !mockEnabled;

  const { trendReady, sleepValues, energyValues, moodValues } = useMemo(
    () => buildTrendData(displaySummary),
    [displaySummary]
  );
  const { listItems, visibleItems, hasMore } = useMemo(
    () => buildListData(displayListSummary, visibleCount),
    [displayListSummary, visibleCount]
  );
  const checkinsByDate = useMemo(() => buildCheckinsByDate(displayCheckins), [displayCheckins]);
  const heatmapData = useMemo(() => buildHeatmapData(displayHeatmapSummary), [displayHeatmapSummary]);

  useEffect(() => {
    setVisibleCount(10);
  }, [displayListSummary?.items.length]);

  useEffect(() => {
    if (!heatmapRef.current) return;
    if (!heatmapData) return;
    const isTouch = window.matchMedia("(hover: none) and (pointer: coarse)").matches;
    const isNarrow = window.innerWidth <= 1024;
    if (!isTouch && !isNarrow) return;
    heatmapRef.current.scrollLeft = heatmapRef.current.scrollWidth;
  }, [heatmapData]);

  useEffect(() => {
    if (!expandedDate) return;
    const stillExists = listItems.some((item) => dateKey(item.date) === expandedDate);
    if (!stillExists) {
      setExpandedDate(null);
    }
  }, [listItems, expandedDate]);

  function handleToggleDetail(item: Summary["items"][number]) {
    const key = dateKey(item.date);
    setExpandedDate((prev) => (prev === key ? null : key));
  }

  function canEdit(dateValue: string) {
    const today = new Date();
    const target = new Date(dateValue);
    today.setHours(0, 0, 0, 0);
    target.setHours(0, 0, 0, 0);
    const diffDays = Math.floor((today.getTime() - target.getTime()) / 86400000);
    return diffDays >= 0 && diffDays < EDIT_WINDOW_DAYS;
  }

  function handleStartEdit(item: Summary["items"][number]) {
    const key = dateKey(item.date);
    const checkin = checkinsByDate.get(key);
    setEditingDate(key);
    setExpandedDate(key);
    setEditDraft({
      sleep_hours: String(checkin?.sleep_hours ?? item.sleep_hours ?? ""),
      energy: String(checkin?.energy ?? item.energy ?? ""),
      mood: String(checkin?.mood ?? item.mood ?? ""),
      note: checkin?.note ?? ""
    });
  }

  function handleCancelEdit() {
    setEditingDate(null);
  }

  async function handleSaveEdit(item: Summary["items"][number]) {
    const key = dateKey(item.date);
    setSaving(true);
    try {
      const payload: CheckinPayload = {
        alive: true,
        sleep_hours: editDraft.sleep_hours ? Number(editDraft.sleep_hours) : null,
        energy: editDraft.energy ? Number(editDraft.energy) : null,
        mood: editDraft.mood ? Number(editDraft.mood) : null,
        note: editDraft.note ? editDraft.note : null
      };
      await updateCheckin(key, payload);
      showNotice("已更新");
      setEditingDate(null);
      await refresh(days);
    } catch (err) {
      showError(err instanceof Error ? err.message : "更新失败");
    } finally {
      setSaving(false);
    }
  }

  return {
    notice,
    showNotice,
    showLoading,
    mockEnabled,
    setMockEnabled,
    days,
    setDays,
    displaySummary,
    trendReady,
    sleepValues,
    energyValues,
    moodValues,
    heatmapData,
    heatmapRef,
    listItems,
    visibleItems,
    hasMore,
    visibleCount,
    setVisibleCount,
    expandedDate,
    editingDate,
    editDraft,
    setEditDraft,
    updateEditField,
    saving,
    editWindowDays: EDIT_WINDOW_DAYS,
    canEdit,
    handleToggleDetail,
    handleStartEdit,
    handleCancelEdit,
    handleSaveEdit,
    checkinsByDate,
    refresh
  };
}
