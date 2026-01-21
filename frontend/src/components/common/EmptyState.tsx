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
    <div className="flex flex-col items-center gap-2 text-center text-muted-foreground">
      {showIllustration ? (
        <div
          className="h-[72px] w-[120px] rounded-2xl border border-brand/20 bg-gradient-to-br from-brand/15 via-transparent to-accent/20"
          aria-hidden="true"
        />
      ) : null}
      <p className="text-sm font-semibold text-ink">{title}</p>
      {description ? <span className="text-xs">{description}</span> : null}
    </div>
  );
}
