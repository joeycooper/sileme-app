type ToastProps = {
  message: string | null;
};

export default function Toast({ message }: ToastProps) {
  if (!message) return null;
  return (
    <div className="fixed bottom-24 left-1/2 w-[min(360px,calc(100vw-32px))] -translate-x-1/2 rounded-full bg-slate-900/95 px-5 py-2 text-center text-xs font-semibold text-white shadow-lift">
      {message}
    </div>
  );
}
