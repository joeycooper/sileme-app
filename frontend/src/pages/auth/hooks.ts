import type { FormEvent } from "react";
import { useEffect, useState } from "react";
import { authLogin, authRegister, requestSmsCode } from "../../services/api";
import { useFormState, useNotice } from "../../hooks";

type AuthErrors = {
  phone?: string | null;
  password?: string | null;
  confirm?: string | null;
  code?: string | null;
};

type UseAuthFormOptions = {
  onSuccess: () => void;
};

export function useAuthForm({ onSuccess }: UseAuthFormOptions) {
  const { notice, showNotice } = useNotice();
  const [isRegister, setIsRegister] = useState(false);
  const { form, updateField, resetForm } = useFormState({
    phone: "",
    password: "",
    confirmPassword: "",
    smsCode: ""
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<AuthErrors>({});

  useEffect(() => {
    document.body.classList.add("login-mode");
    return () => {
      document.body.classList.remove("login-mode");
    };
  }, []);

  function normalizePhone(input: string) {
    const digits = input.replace(/\D/g, "");
    const normalized = digits.startsWith("86") ? digits.slice(2) : digits;
    return normalized;
  }

  function isValidPhone(input: string) {
    return /^1[3-9]\d{9}$/.test(input);
  }

  function resetFormState() {
    resetForm();
    setErrors({});
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setErrors({});
    try {
      const normalizedPhone = normalizePhone(form.phone);
      if (!isValidPhone(normalizedPhone)) {
        setErrors({ phone: "手机号格式不正确" });
        return;
      }
      if (form.password.length < 8) {
        setErrors({ password: "密码至少 8 位" });
        return;
      }
      if (isRegister) {
        if (form.password !== form.confirmPassword) {
          setErrors({ confirm: "两次密码不一致" });
          return;
        }
        if (!form.smsCode.trim()) {
          setErrors({ code: "请输入验证码" });
          return;
        }
        await authRegister({
          phone: normalizedPhone,
          password: form.password,
          timezone: "Asia/Shanghai",
          sms_code: form.smsCode.trim()
        });
      }
      await authLogin({
        phone: normalizedPhone,
        password: form.password,
        device_name: navigator.platform || "Web"
      });
      onSuccess();
      resetFormState();
    } catch (err) {
      showNotice(err instanceof Error ? err.message : isRegister ? "注册失败" : "登录失败");
      resetFormState();
    } finally {
      setLoading(false);
    }
  }

  async function handleRequestCode() {
    setErrors({});
    const normalizedPhone = normalizePhone(form.phone);
    if (!isValidPhone(normalizedPhone)) {
      setErrors({ phone: "手机号格式不正确" });
      return;
    }
    try {
      await requestSmsCode(normalizedPhone);
      showNotice("验证码已发送（Mock：123456）");
    } catch (err) {
      showNotice(err instanceof Error ? err.message : "发送验证码失败");
    }
  }

  function toggleMode() {
    setIsRegister((prev) => !prev);
    resetFormState();
  }

  return {
    notice,
    isRegister,
    phone: form.phone,
    setPhone: (value: string) => updateField("phone", value),
    password: form.password,
    setPassword: (value: string) => updateField("password", value),
    confirmPassword: form.confirmPassword,
    setConfirmPassword: (value: string) => updateField("confirmPassword", value),
    smsCode: form.smsCode,
    setSmsCode: (value: string) => updateField("smsCode", value),
    loading,
    errors,
    handleSubmit,
    handleRequestCode,
    toggleMode
  };
}
