import { useEffect, useState } from "react";
import Home from "./pages/Home";
import Login from "./pages/Login";
import { authLogout, getMe, hasRefreshToken } from "./services/api";

export default function App() {
  const [loading, setLoading] = useState(true);
  const [userPhone, setUserPhone] = useState<string | null>(null);

  useEffect(() => {
    async function init() {
      if (!hasRefreshToken()) {
        setLoading(false);
        return;
      }
      try {
        const me = await getMe();
        setUserPhone(me.phone);
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
  }

  async function handleLogout() {
    await authLogout();
    setUserPhone(null);
  }

  if (loading) {
    return <div className="loading">加载中...</div>;
  }

  if (!userPhone) {
    return <Login onSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="authed">
      <div className="auth-bar">
        <span>{userPhone}</span>
        <button className="link" type="button" onClick={handleLogout}>
          退出登录
        </button>
      </div>
      <Home />
    </div>
  );
}
