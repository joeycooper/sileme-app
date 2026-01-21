import { useNotice } from "../hooks";
import { useAlarmCountdown, useHomeData } from "./home/hooks";
import AliveSection from "./home/sections/AliveSection";
import FooterSection from "./home/sections/FooterSection";
import FieldsSection from "./home/sections/FieldsSection";
import HeroSection from "./home/sections/HeroSection";
import StatsSection from "./home/sections/StatsSection";
import { Toast } from "../components/common";

type HomeProps = {
  isAuthed: boolean;
  onRequireLogin?: () => void;
};

export default function Home({ isAuthed, onRequireLogin }: HomeProps) {
  const { notice, showNotice, showError } = useNotice();
  const {
    today,
    stats,
    form,
    updateField,
    loading,
    alarmHours,
    lastCheckinTime,
    lastCheckinTsRef,
    submitCheckin
  } = useHomeData({ isAuthed, onRequireLogin, showError, showNotice });
  const countdown = useAlarmCountdown(alarmHours, lastCheckinTsRef);

  return (
    <div className="flex flex-col gap-6">
      <HeroSection countdown={countdown} hasToday={Boolean(today)} />
      <AliveSection
        loading={loading}
        today={today}
        lastCheckinTime={lastCheckinTime}
        onSubmit={(event) => {
          event.preventDefault();
          void submitCheckin();
        }}
      />
      <FieldsSection form={form} onFieldChange={updateField} />
      <StatsSection stats={stats} />
      <FooterSection />
      <Toast message={notice} />
    </div>
  );
}
