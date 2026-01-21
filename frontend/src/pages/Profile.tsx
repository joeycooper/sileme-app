import CropModal from "./profile/modals/CropModal";
import ContactsSheet from "./profile/sections/ContactsSheet";
import ProfileHero from "./profile/sections/ProfileHero";
import ProfileMenu from "./profile/sections/ProfileMenu";
import ProfileSheet from "./profile/sections/ProfileSheet";
import { useNotice } from "../hooks";
import { useProfileData } from "./profile/hooks";
import { Toast } from "../components/common";

export default function Profile() {
  const { notice, showError } = useNotice();
  const {
    phone,
    timezone,
    form,
    updateField,
    sheetOpen,
    openContacts,
    closeContacts,
    activePanel,
    setActivePanel,
    primaryContact,
    setPrimaryContact,
    updatePrimaryField,
    backupContacts,
    setBackupContacts,
    updateBackupField,
    addBackupContact,
    removeBackupContact,
    handleAvatarUpload,
    handleProfileAvatarUpload,
    cropOpen,
    cropImageUrl,
    cropScale,
    cropOffset,
    cropBaseScale,
    cropImage,
    cropSaving,
    cropPreviewRef,
    cropImageRef,
    dragState,
    clampOffset,
    setCropScale,
    setCropOffset,
    handleCropSave,
    handleCropCancel,
    saveProfileSettings,
    handleSaveContacts,
    handleLogout
  } = useProfileData(showError);

  return (
    <div className="flex flex-col gap-6">
      <ProfileHero
        form={form}
        phone={phone}
        timezone={timezone}
        onAvatarUpload={handleProfileAvatarUpload}
      />

      <ProfileMenu
        onOpenProfile={() => setActivePanel("profile")}
        onOpenContacts={openContacts}
        onOpenAlarm={() => setActivePanel("alarm")}
        onOpenEstate={() => setActivePanel("estate")}
        onLogout={handleLogout}
      />

      <ProfileSheet
        activePanel={activePanel}
        form={form}
        onFieldChange={updateField}
        onClose={() => setActivePanel(null)}
        onSave={saveProfileSettings}
      />

      <ContactsSheet
        open={sheetOpen}
        primaryContact={primaryContact}
        backupContacts={backupContacts}
        onClose={closeContacts}
        onPrimaryFieldChange={updatePrimaryField}
        onBackupFieldChange={updateBackupField}
        onAvatarUpload={handleAvatarUpload}
        onAddBackup={addBackupContact}
        onRemoveBackup={removeBackupContact}
        onSave={handleSaveContacts}
      />

      <Toast message={notice} />

      <CropModal
        open={cropOpen}
        cropImageUrl={cropImageUrl}
        cropImage={cropImage}
        cropScale={cropScale}
        cropBaseScale={cropBaseScale}
        cropOffset={cropOffset}
        cropPreviewRef={cropPreviewRef}
        cropImageRef={cropImageRef}
        cropSaving={cropSaving}
        onCancel={handleCropCancel}
        onSave={handleCropSave}
        onScaleChange={(value) => {
          setCropScale(value);
          setCropOffset((prev) => clampOffset(prev, value));
        }}
        onPointerDown={(event) => {
          event.currentTarget.setPointerCapture(event.pointerId);
          dragState.current = {
            x: event.clientX,
            y: event.clientY,
            ox: cropOffset.x,
            oy: cropOffset.y
          };
        }}
        onPointerMove={(event) => {
          if (!dragState.current) return;
          const dx = event.clientX - dragState.current.x;
          const dy = event.clientY - dragState.current.y;
          const next = clampOffset(
            { x: dragState.current.ox + dx, y: dragState.current.oy + dy },
            cropScale
          );
          setCropOffset(next);
        }}
        onPointerUp={(event) => {
          event.currentTarget.releasePointerCapture(event.pointerId);
          dragState.current = null;
        }}
      />
    </div>
  );
}
