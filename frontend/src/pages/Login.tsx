import AuthForm from "./auth/AuthForm";
import { useAuthForm } from "./auth/hooks";
import { Toast } from "../components/common";

type Props = {
  onSuccess: () => void;
};

export default function Login({ onSuccess }: Props) {
  const {
    notice,
    isRegister,
    phone,
    setPhone,
    password,
    setPassword,
    confirmPassword,
    setConfirmPassword,
    smsCode,
    setSmsCode,
    loading,
    errors,
    handleSubmit,
    handleRequestCode,
    toggleMode
  } = useAuthForm({ onSuccess });

  return (
    <div className="flex min-h-[100svh] items-center justify-center px-4 py-6">
      <AuthForm
        isRegister={isRegister}
        phone={phone}
        password={password}
        confirmPassword={confirmPassword}
        smsCode={smsCode}
        loading={loading}
        errors={errors}
        onPhoneChange={setPhone}
        onPasswordChange={setPassword}
        onConfirmChange={setConfirmPassword}
        onSmsChange={setSmsCode}
        onRequestCode={handleRequestCode}
        onSubmit={handleSubmit}
        onToggleMode={toggleMode}
      />
      <Toast message={notice} />
    </div>
  );
}
