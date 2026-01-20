import { IconLogout, IconNote, IconPhone, IconTimer, IconUser } from "../../../components/icons";

type ProfileMenuProps = {
  onOpenProfile: () => void;
  onOpenContacts: () => void;
  onOpenAlarm: () => void;
  onOpenEstate: () => void;
  onLogout: () => void;
};

export default function ProfileMenu({
  onOpenProfile,
  onOpenContacts,
  onOpenAlarm,
  onOpenEstate,
  onLogout
}: ProfileMenuProps) {
  return (
    <section className="card">
      <div className="profile-menu">
        <button className="profile-row" type="button" onClick={onOpenProfile}>
          <span className="icon">
            <IconUser className="icon-svg" />
          </span>
          <span>个人信息</span>
          <span className="chevron">›</span>
        </button>
        <button className="profile-row" type="button" onClick={onOpenContacts}>
          <span className="icon">
            <IconPhone className="icon-svg" />
          </span>
          <span>紧急联系人</span>
          <span className="chevron">›</span>
        </button>
        <button className="profile-row" type="button" onClick={onOpenAlarm}>
          <span className="icon">
            <IconTimer className="icon-svg" />
          </span>
          <span>自动警报时间</span>
          <span className="chevron">›</span>
        </button>
        <button className="profile-row" type="button" onClick={onOpenEstate}>
          <span className="icon">
            <IconNote className="icon-svg" />
          </span>
          <span>遗产分配设置</span>
          <span className="chevron">›</span>
        </button>
        <button className="profile-row danger" type="button" onClick={onLogout}>
          <span className="icon">
            <IconLogout className="icon-svg" />
          </span>
          <span>退出登录</span>
          <span className="chevron">›</span>
        </button>
      </div>
    </section>
  );
}
