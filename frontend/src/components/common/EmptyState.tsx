type EmptyStateProps = {
  title: string;
  description?: string;
  showIllustration?: boolean;
};

export default function EmptyState({
  title,
  description,
  showIllustration = true
}: EmptyStateProps) {
  return (
    <div className="empty-state">
      {showIllustration ? <div className="empty-illustration" aria-hidden="true" /> : null}
      <p>{title}</p>
      {description ? <span>{description}</span> : null}
    </div>
  );
}
