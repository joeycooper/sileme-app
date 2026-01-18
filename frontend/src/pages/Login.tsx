import { useState } from "react";
import { authLogin, authRegister } from "../services/api";

type Props = {
  onSuccess: () => void;
};

export default function Login({ onSuccess }: Props) {
  const [isRegister, setIsRegister] = useState(false);
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function normalizePhone(input: string) {
    const digits = input.replace(/\D/g, "");
    const normalized = digits.startsWith("86") ? digits.slice(2) : digits;
    return normalized;
  }

  function isValidPhone(input: string) {
    return /^1[3-9]\d{9}$/.test(input);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const normalizedPhone = normalizePhone(phone);
      if (!isValidPhone(normalizedPhone)) {
        setError("手机号格式不正确，请输入 11 位中国手机号");
        return;
      }
      if (isRegister) {
        if (password !== confirmPassword) {
          setError("两次输入的密码不一致，请确认后再试。");
          return;
        }
        await authRegister({ phone: normalizedPhone, password, timezone: "Asia/Shanghai" });
      }
      await authLogin({ phone: normalizedPhone, password });
      onSuccess();
      setPassword("");
      setConfirmPassword("");
    } catch (err) {
      setError(err instanceof Error ? err.message : isRegister ? "注册失败" : "登录失败");
      setPhone("");
      setPassword("");
      setConfirmPassword("");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <h1>死了么</h1>
        <p className="login-subhead">
          {isRegister ? "创建账号后开始今天的报平安。" : "登录后开始今天的报平安。"}
        </p>
        <form onSubmit={handleSubmit} className="login-form">
          <label>
            手机号
            <input
              type="tel"
              placeholder="13800138000"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
            />
          </label>
          <label>
            密码
            <input
              type="password"
              placeholder="至少 8 位"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </label>
          {isRegister ? (
            <label>
              确认密码
              <input
                type="password"
                placeholder="再次输入密码"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </label>
          ) : null}
          <button className="primary" type="submit" disabled={loading}>
            {loading ? "提交中..." : isRegister ? "注册并登录" : "登录"}
          </button>
          {error ? <p className="error">{error}</p> : null}
        </form>
        <p className="login-hint">
          {isRegister ? "已有账号？" : "没有账号？"}
          <button
            className="link"
            type="button"
            onClick={() => {
              setIsRegister((prev) => !prev);
              setError(null);
              setPhone("");
              setPassword("");
              setConfirmPassword("");
            }}
          >
            {isRegister ? "去登录" : "去注册"}
          </button>
        </p>
      </div>
    </div>
  );
}
