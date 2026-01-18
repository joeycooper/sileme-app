import { useState } from "react";
import { authLogin, authRegister, requestSmsCode } from "../services/api";

type Props = {
  onSuccess: () => void;
};

export default function Login({ onSuccess }: Props) {
  const [isRegister, setIsRegister] = useState(false);
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [smsCode, setSmsCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [confirmError, setConfirmError] = useState<string | null>(null);
  const [codeError, setCodeError] = useState<string | null>(null);

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
    setNotice(null);
    setPhoneError(null);
    setPasswordError(null);
    setConfirmError(null);
    setCodeError(null);
    try {
      const normalizedPhone = normalizePhone(phone);
      if (!isValidPhone(normalizedPhone)) {
        setPhoneError("手机号格式不正确");
        return;
      }
      if (password.length < 8) {
        setPasswordError("密码至少 8 位");
        return;
      }
      if (isRegister) {
        if (password !== confirmPassword) {
          setConfirmError("两次密码不一致");
          return;
        }
        if (!smsCode.trim()) {
          setCodeError("请输入验证码");
          return;
        }
        await authRegister({
          phone: normalizedPhone,
          password,
          timezone: "Asia/Shanghai",
          sms_code: smsCode.trim()
        });
      }
      await authLogin({
        phone: normalizedPhone,
        password,
        device_name: navigator.platform || "Web"
      });
      onSuccess();
      setPassword("");
      setConfirmPassword("");
      setSmsCode("");
    } catch (err) {
      setError(err instanceof Error ? err.message : isRegister ? "注册失败" : "登录失败");
      setPhone("");
      setPassword("");
      setConfirmPassword("");
      setSmsCode("");
    } finally {
      setLoading(false);
    }
  }

  async function handleRequestCode() {
    setError(null);
    setNotice(null);
    setPhoneError(null);
    const normalizedPhone = normalizePhone(phone);
    if (!isValidPhone(normalizedPhone)) {
      setPhoneError("手机号格式不正确");
      return;
    }
    try {
      await requestSmsCode(normalizedPhone);
      setNotice("验证码已发送（Mock：123456）");
    } catch (err) {
      setError(err instanceof Error ? err.message : "发送验证码失败");
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
            {phoneError ? <span className="field-error">{phoneError}</span> : null}
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
            {passwordError ? <span className="field-error">{passwordError}</span> : null}
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
              {confirmError ? <span className="field-error">{confirmError}</span> : null}
            </label>
          ) : null}
          {isRegister ? (
            <label>
              验证码
              <div className="code-row">
                <input
                  type="text"
                  placeholder="输入 123456"
                  value={smsCode}
                  onChange={(e) => setSmsCode(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="secondary"
                  onClick={handleRequestCode}
                  disabled={loading}
                >
                  获取验证码
                </button>
              </div>
              {codeError ? <span className="field-error">{codeError}</span> : null}
            </label>
          ) : null}
          <button className="primary" type="submit" disabled={loading}>
            {loading ? "提交中..." : isRegister ? "注册并登录" : "登录"}
          </button>
          {notice ? <p className="notice">{notice}</p> : null}
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
              setNotice(null);
              setPhoneError(null);
              setPasswordError(null);
              setConfirmError(null);
              setCodeError(null);
              setPhone("");
              setPassword("");
              setConfirmPassword("");
              setSmsCode("");
            }}
          >
            {isRegister ? "去登录" : "去注册"}
          </button>
        </p>
      </div>
    </div>
  );
}
