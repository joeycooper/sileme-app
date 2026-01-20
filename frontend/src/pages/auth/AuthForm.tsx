import type { FormEvent } from "react";

type AuthFormProps = {
  isRegister: boolean;
  phone: string;
  password: string;
  confirmPassword: string;
  smsCode: string;
  loading: boolean;
  errors: {
    phone?: string | null;
    password?: string | null;
    confirm?: string | null;
    code?: string | null;
  };
  onPhoneChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onConfirmChange: (value: string) => void;
  onSmsChange: (value: string) => void;
  onRequestCode: () => void;
  onSubmit: (event: FormEvent) => void;
  onToggleMode: () => void;
};

export default function AuthForm({
  isRegister,
  phone,
  password,
  confirmPassword,
  smsCode,
  loading,
  errors,
  onPhoneChange,
  onPasswordChange,
  onConfirmChange,
  onSmsChange,
  onRequestCode,
  onSubmit,
  onToggleMode
}: AuthFormProps) {
  return (
    <div className="login-card">
      <h1>死了么</h1>
      <p className="login-subhead">
        {isRegister ? "创建账号后开始今天的报平安。" : "登录后开始今天的报平安。"}
      </p>
      <form onSubmit={onSubmit} className="login-form">
        <label>
          手机号
          <input
            type="tel"
            placeholder="13800138000"
            value={phone}
            onChange={(e) => onPhoneChange(e.target.value)}
            autoComplete="tel"
            inputMode="numeric"
            name="phone"
            required
          />
          {errors.phone ? <span className="field-error">{errors.phone}</span> : null}
        </label>
        <label>
          密码
          <input
            type="password"
            placeholder="至少 8 位"
            value={password}
            onChange={(e) => onPasswordChange(e.target.value)}
            autoComplete={isRegister ? "new-password" : "current-password"}
            name="password"
            required
          />
          {errors.password ? <span className="field-error">{errors.password}</span> : null}
        </label>
        {isRegister ? (
          <label>
            确认密码
            <input
              type="password"
              placeholder="再次输入密码"
              value={confirmPassword}
              onChange={(e) => onConfirmChange(e.target.value)}
              autoComplete="new-password"
              name="confirm_password"
              required
            />
            {errors.confirm ? <span className="field-error">{errors.confirm}</span> : null}
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
                onChange={(e) => onSmsChange(e.target.value)}
                inputMode="numeric"
                name="sms_code"
                required
              />
              <button type="button" className="secondary" onClick={onRequestCode} disabled={loading}>
                获取验证码
              </button>
            </div>
            {errors.code ? <span className="field-error">{errors.code}</span> : null}
          </label>
        ) : null}
        <button className="primary" type="submit" disabled={loading}>
          {loading ? "提交中..." : isRegister ? "注册并登录" : "登录"}
        </button>
      </form>
      <p className="login-hint">
        {isRegister ? "已有账号？" : "没有账号？"}
        <button className="link" type="button" onClick={onToggleMode}>
          {isRegister ? "去登录" : "去注册"}
        </button>
      </p>
    </div>
  );
}
