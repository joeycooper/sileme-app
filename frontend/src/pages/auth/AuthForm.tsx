import type { FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

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
    <Card className="w-full max-w-md border-border/70 bg-white/80 shadow-soft backdrop-blur">
      <CardHeader className="pb-2">
        <CardTitle className="text-2xl">死了么</CardTitle>
        <CardDescription className="text-sm text-muted-foreground">
          {isRegister ? "创建账号后开始今天的报平安。" : "登录后开始今天的报平安。"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="flex flex-col gap-4">
          <label className="flex flex-col gap-2 text-sm font-medium text-muted-foreground">
            手机号
            <Input
              type="tel"
              placeholder="13800138000"
              value={phone}
              onChange={(e) => onPhoneChange(e.target.value)}
              autoComplete="tel"
              inputMode="numeric"
              name="phone"
              required
            />
            {errors.phone ? <span className="text-xs text-red-600">{errors.phone}</span> : null}
          </label>
          <label className="flex flex-col gap-2 text-sm font-medium text-muted-foreground">
            密码
            <Input
              type="password"
              placeholder="至少 8 位"
              value={password}
              onChange={(e) => onPasswordChange(e.target.value)}
              autoComplete={isRegister ? "new-password" : "current-password"}
              name="password"
              required
            />
            {errors.password ? <span className="text-xs text-red-600">{errors.password}</span> : null}
          </label>
          {isRegister ? (
            <label className="flex flex-col gap-2 text-sm font-medium text-muted-foreground">
              确认密码
              <Input
                type="password"
                placeholder="再次输入密码"
                value={confirmPassword}
                onChange={(e) => onConfirmChange(e.target.value)}
                autoComplete="new-password"
                name="confirm_password"
                required
              />
              {errors.confirm ? <span className="text-xs text-red-600">{errors.confirm}</span> : null}
            </label>
          ) : null}
          {isRegister ? (
            <label className="flex flex-col gap-2 text-sm font-medium text-muted-foreground">
              验证码
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                <Input
                  type="text"
                  placeholder="输入 123456"
                  value={smsCode}
                  onChange={(e) => onSmsChange(e.target.value)}
                  inputMode="numeric"
                  name="sms_code"
                  required
                />
                <Button type="button" variant="outline" onClick={onRequestCode} disabled={loading}>
                  获取验证码
                </Button>
              </div>
              {errors.code ? <span className="text-xs text-red-600">{errors.code}</span> : null}
            </label>
          ) : null}
          <Button type="submit" disabled={loading} className="h-11 rounded-full text-base">
            {loading ? "提交中..." : isRegister ? "注册并登录" : "登录"}
          </Button>
        </form>
        <p className="mt-4 text-xs text-muted-foreground">
          {isRegister ? "已有账号？" : "没有账号？"}
          <button
            className="ml-2 text-xs font-semibold text-brand transition hover:text-blue-600"
            type="button"
            onClick={onToggleMode}
          >
            {isRegister ? "去登录" : "去注册"}
          </button>
        </p>
      </CardContent>
    </Card>
  );
}
