import type { ReactNode } from "react";

type SectionHeaderProps = {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  className?: string;
  actionsClassName?: string;
};

export default function SectionHeader({
  title,
  subtitle,
  actions,
  className,
  actionsClassName
}: SectionHeaderProps) {
  return (
    <div
      className={`mb-2 flex flex-wrap items-start justify-between gap-3 ${className ?? ""}`}
    >
      <div className="min-w-0">
        <h2 className="text-xl font-semibold text-ink">{title}</h2>
        {subtitle ? <p className="mt-1 text-xs text-muted-foreground">{subtitle}</p> : null}
      </div>
      {actions ? (
        <div className={actionsClassName ?? "flex items-center gap-2"}>{actions}</div>
      ) : null}
    </div>
  );
}
