type LoadingStateProps = {
  label?: string;
};

export default function LoadingState({ label = "加载中..." }: LoadingStateProps) {
  return <p className="muted">{label}</p>;
}
