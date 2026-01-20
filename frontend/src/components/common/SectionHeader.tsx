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
  actionsClassName = "notice-actions"
}: SectionHeaderProps) {
  const headerClassName = className
    ? `form-header header-row ${className}`
    : "form-header header-row";

  return (
    <div className={headerClassName}>
      <div>
        <h2>{title}</h2>
        {subtitle ? <p>{subtitle}</p> : null}
      </div>
      {actions ? <div className={actionsClassName}>{actions}</div> : null}
    </div>
  );
}
