import { useEffect, useState } from "react";
import Home from "./pages/Home";
import History from "./pages/History";
import Login from "./pages/Login";
import Profile from "./pages/Profile";
import { getMe, hasRefreshToken } from "./services/api";

export default function App() {
  const [loading, setLoading] = useState(true);
  const [userPhone, setUserPhone] = useState<string | null>(null);
  const [page, setPage] = useState<"home" | "history" | "profile">("home");

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
    return <div className="loading">加载中...</div>;
  }

  return (
    <div className="authed">
      <div className="auth-bar">
        <div className="tabs">
          <button
            className={`tab ${page === "home" ? "active" : ""}`}
            type="button"
            onClick={() => setPage("home")}
          >
            打卡
          </button>
          <button
            className={`tab ${page === "history" ? "active" : ""}`}
            type="button"
            onClick={() => setPage("history")}
          >
            历史
          </button>
          <button
            className={`tab ${page === "profile" ? "active" : ""}`}
            type="button"
            onClick={() => setPage("profile")}
          >
            我的
          </button>
        </div>
      </div>
      {page === "home" ? (
        <Home isAuthed={Boolean(userPhone)} onRequireLogin={() => setPage("profile")} />
      ) : page === "history" ? (
        userPhone ? <History /> : <Login onSuccess={handleLoginSuccess} />
      ) : userPhone ? (
        <Profile />
      ) : (
        <Login onSuccess={handleLoginSuccess} />
      )}
      <nav className="bottom-nav" aria-label="页面导航">
        <button
          className={`nav-item ${page === "home" ? "active" : ""}`}
          type="button"
          onClick={() => setPage("home")}
        >
          打卡
        </button>
        <button
          className={`nav-item ${page === "history" ? "active" : ""}`}
          type="button"
          onClick={() => setPage("history")}
        >
          历史
        </button>
        <button
          className={`nav-item ${page === "profile" ? "active" : ""}`}
          type="button"
          onClick={() => setPage("profile")}
        >
          我的
        </button>
      </nav>
    </div>
  );
}
