import HeatmapSection from "./history/sections/HeatmapSection";
import RecentSection from "./history/sections/RecentSection";
import StatsSection from "./history/sections/StatsSection";
import TrendSection from "./history/sections/TrendSection";
import { useHistoryState } from "./history/hooks";
import { Toast } from "../components/common";

export default function History() {
  const {
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
    updateEditField,
    saving,
    editWindowDays,
    canEdit,
    handleToggleDetail,
    handleStartEdit,
    handleCancelEdit,
    handleSaveEdit,
    checkinsByDate
  } = useHistoryState();

  return (
    <div className="flex flex-col gap-6">
      <StatsSection summary={displaySummary} />

      <TrendSection
        days={days}
        onDaysChange={setDays}
        mockEnabled={mockEnabled}
        onMockToggle={setMockEnabled}
        showMockToggle={Boolean(import.meta.env.DEV)}
        showLoading={showLoading}
        trendReady={trendReady}
        sleepValues={sleepValues}
        energyValues={energyValues}
        moodValues={moodValues}
      />

      <HeatmapSection heatmapData={heatmapData} heatmapRef={heatmapRef} />

      <RecentSection
        listItems={listItems}
        visibleItems={visibleItems}
        expandedDate={expandedDate}
    editingDate={editingDate}
    editDraft={editDraft}
    onEditFieldChange={updateEditField}
    saving={saving}
        canEdit={canEdit}
        onToggleDetail={handleToggleDetail}
        onStartEdit={handleStartEdit}
        onCancelEdit={handleCancelEdit}
        onSaveEdit={handleSaveEdit}
    hasMore={hasMore}
        onLoadMore={() => setVisibleCount((prev) => Math.min(prev + 10, listItems.length))}
        editWindowDays={editWindowDays}
        checkinsByDate={checkinsByDate}
        onExport={() => showNotice("导出功能将在下一版本支持。")}
      />

      <Toast message={notice} />
    </div>
  );
}
