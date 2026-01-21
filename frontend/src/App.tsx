import { useEffect, useState } from "react";
import { Home as HomeIcon, History as HistoryIcon, Users, User } from "lucide-react";
import Home from "./pages/Home";
import History from "./pages/History";
import Login from "./pages/Login";
import Profile from "./pages/Profile";
import Social from "./pages/Social";
import { getMe, hasRefreshToken } from "./services/api";

export default function App() {
  const [loading, setLoading] = useState(true);
  const [userPhone, setUserPhone] = useState<string | null>(null);
  const [page, setPage] = useState<"home" | "history" | "profile" | "social">("home");

  useEffect(() => {
    async function init() {
      if (!hasRefreshToken()) {
        setLoading(false);
        return;
      }
      try {
        const me = await getMe();
        setUserPhone(me.phone);
        window.dispatchEvent(
          new CustomEvent("sileme-alarm-hours", { detail: me.alarm_hours })
        );
      } catch {
        setUserPhone(null);
      } finally {
        setLoading(false);
      }
    }

    void init();
  }, []);

  async function handleLoginSuccess() {
    const me = await getMe();
    setUserPhone(me.phone);
    window.dispatchEvent(
      new CustomEvent("sileme-alarm-hours", { detail: me.alarm_hours })
    );
    setPage("home");
  }

  if (loading) {
    return <div className="py-20 text-center text-muted-foreground">加载中...</div>;
  }

  const navItems = [
    { key: "home", label: "打卡", Icon: HomeIcon },
    { key: "history", label: "历史", Icon: HistoryIcon },
    { key: "social", label: "社交", Icon: Users },
    { key: "profile", label: "我的", Icon: User }
  ] as const;

  return (
    <div className="min-h-screen">
      <header className="top-nav fixed left-0 right-0 top-0 z-40 border-b border-border/70 bg-white/90 backdrop-blur">
        <div className="mx-auto flex h-16 w-full max-w-5xl items-center justify-between px-6">
          <span className="text-sm font-semibold text-ink">SiLeMe</span>
          <nav className="flex items-center gap-6 text-sm text-muted-foreground">
            {navItems.map((item) => (
              <button
                key={item.key}
                type="button"
                onClick={() => setPage(item.key)}
                className={`relative px-2 py-1 font-semibold transition ${
                  page === item.key
                    ? "text-ink after:absolute after:-bottom-4 after:left-0 after:right-0 after:h-0.5 after:rounded-full after:bg-brand"
                    : "text-muted-foreground hover:text-ink"
                }`}
              >
                {item.label}
              </button>
            ))}
          </nav>
        </div>
      </header>

      <div className="app-shell flex flex-col gap-6 pt-0">
        {page === "home" ? (
          <Home isAuthed={Boolean(userPhone)} onRequireLogin={() => setPage("profile")} />
        ) : page === "history" ? (
          userPhone ? <History /> : <Login onSuccess={handleLoginSuccess} />
        ) : page === "social" ? (
          userPhone ? <Social /> : <Login onSuccess={handleLoginSuccess} />
        ) : userPhone ? (
          <Profile />
        ) : (
          <Login onSuccess={handleLoginSuccess} />
        )}
      </div>
      <nav
        className="bottom-nav fixed bottom-0 left-0 right-0 z-50 flex min-h-[84px] items-center justify-around gap-2 border-t border-border/70 bg-white/98 px-4 pt-4 pb-[calc(16px+env(safe-area-inset-bottom))] shadow-[0_-12px_30px_rgba(15,23,42,0.16)] backdrop-blur sm:gap-3 sm:px-6"
        aria-label="页面导航"
      >
        {navItems.map((item) => {
          const isActive = page === item.key;
          return (
            <button
              key={item.key}
              className={`min-h-[52px] flex flex-1 items-start justify-center px-2 pt-0 pb-5 text-[17px] font-semibold transition ${
                isActive
                  ? "text-brand"
                  : "text-muted-foreground/70 hover:text-ink"
              }`}
              type="button"
              aria-current={isActive ? "page" : undefined}
              onClick={() => setPage(item.key)}
            >
              {item.label}
            </button>
          );
        })}
      </nav>
    </div>
  );
}
