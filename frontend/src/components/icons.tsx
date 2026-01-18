type IconProps = {
  className?: string;
};

export function IconClock({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" className={className}>
      <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="2" />
      <path
        d="M12 6v6l4 2"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function IconUser({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" className={className}>
      <circle cx="12" cy="8" r="3.5" fill="none" stroke="currentColor" strokeWidth="2" />
      <path
        d="M4.5 20c1.8-3.8 5-5.5 7.5-5.5s5.7 1.7 7.5 5.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function IconPhone({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" className={className}>
      <path
        d="M7 4h10a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      />
      <path d="M9 7h6" fill="none" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}

export function IconTimer({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" className={className}>
      <circle cx="12" cy="13" r="7" fill="none" stroke="currentColor" strokeWidth="2" />
      <path d="M12 9v4l3 2" fill="none" stroke="currentColor" strokeWidth="2" />
      <path d="M9 3h6" fill="none" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}

export function IconNote({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" className={className}>
      <path d="M6 4h9l3 3v13H6z" fill="none" stroke="currentColor" strokeWidth="2" />
      <path d="M9 12h6M9 16h6" fill="none" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}

export function IconLogout({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" className={className}>
      <path
        d="M9 4h6a3 3 0 0 1 3 3v10a3 3 0 0 1-3 3H9"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      />
      <path
        d="M13 12H4m0 0l3-3m-3 3 3 3"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
