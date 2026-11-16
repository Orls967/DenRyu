import type { ButtonHTMLAttributes, HTMLAttributes, ReactNode } from 'react';

export function Panel({
  className = '',
  children,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`bg-surface border border-subtle rounded-md ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

export function ElevatedCard({
  className = '',
  children,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`bg-elevated/80 border border-subtle rounded-md ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

type BadgeVariant = 'neutral' | 'cyan' | 'water' | 'energy' | 'success' | 'warning' | 'error';

const BADGE_CLASSES: Record<BadgeVariant, string> = {
  neutral: 'bg-elevated text-text-secondary border-subtle',
  cyan: 'bg-cyan-accent/10 text-cyan-accent border-cyan-accent/30',
  water: 'bg-water-accent/15 text-[#60B2F5] border-water-accent/40',
  energy: 'bg-energy-accent/15 text-energy-accent border-energy-accent/40',
  success: 'bg-status-success/15 text-status-success border-status-success/40',
  warning: 'bg-status-warning/15 text-status-warning border-status-warning/40',
  error: 'bg-status-error/15 text-status-error border-status-error/40',
};

export function Badge({
  variant = 'neutral',
  className = '',
  children,
}: {
  variant?: BadgeVariant;
  className?: string;
  children: ReactNode;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-mono uppercase tracking-wider border rounded ${BADGE_CLASSES[variant]} ${className}`}
    >
      {children}
    </span>
  );
}

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';

const BTN_CLASSES: Record<ButtonVariant, string> = {
  primary:
    'bg-cyan-accent text-[#061018] font-semibold hover:bg-[#52D2E3] border border-cyan-accent',
  secondary:
    'bg-elevated text-text-primary hover:bg-[#293846] border border-subtle',
  ghost:
    'bg-transparent text-text-secondary hover:text-text-primary hover:bg-elevated/70 border border-transparent',
  danger:
    'bg-status-error/15 text-status-error hover:bg-status-error/25 border border-status-error/40',
};

export function Button({
  variant = 'secondary',
  size = 'md',
  className = '',
  children,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: 'sm' | 'md';
}) {
  const sizeClass = size === 'sm' ? 'px-2.5 py-1 text-xs' : 'px-3.5 py-2 text-sm';
  return (
    <button
      type="button"
      className={`inline-flex items-center justify-center gap-1.5 rounded font-medium transition-colors disabled:opacity-45 disabled:cursor-not-allowed ${sizeClass} ${BTN_CLASSES[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

export function TabList<T extends string>({
  tabs,
  activeTab,
  onChange,
  className = '',
}: {
  tabs: { id: T; label: string }[];
  activeTab: T;
  onChange: (id: T) => void;
  className?: string;
}) {
  return (
    <div
      role="tablist"
      className={`flex flex-wrap items-center gap-x-1 border-b border-subtle ${className}`}
    >
      {tabs.map((tab) => {
        const active = tab.id === activeTab;
        return (
          <button
            key={tab.id}
            role="tab"
            type="button"
            aria-selected={active}
            onClick={() => onChange(tab.id)}
            className={`px-3 py-2 text-xs font-medium whitespace-nowrap border-b-2 transition-colors ${
              active
                ? 'border-cyan-accent text-cyan-accent'
                : 'border-transparent text-text-secondary hover:text-text-primary'
            }`}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}

export function TooltipLabel({
  label,
  tip,
}: {
  label: string;
  tip: string;
}) {
  return (
    <span className="group relative inline-flex items-center gap-1 cursor-help">
      <span>{label}</span>
      <span
        aria-label={tip}
        className="inline-flex h-3.5 w-3.5 items-center justify-center rounded-full border border-subtle text-[10px] font-mono text-text-muted group-hover:border-cyan-accent group-hover:text-cyan-accent"
      >
        ?
      </span>
      <span
        role="tooltip"
        className="pointer-events-none absolute bottom-full left-0 z-50 mb-1.5 hidden w-56 rounded border border-subtle bg-elevated p-2 text-[11px] font-normal leading-snug text-text-primary shadow-lg group-hover:block"
      >
        {tip}
      </span>
    </span>
  );
}

export function LoadingState({ message = 'Loading engineering module...' }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 p-8 text-center">
      <div className="h-7 w-7 animate-spin rounded-full border-2 border-subtle border-t-cyan-accent" />
      <p className="text-xs font-mono uppercase tracking-wider text-text-secondary">{message}</p>
    </div>
  );
}

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 rounded-md border border-dashed border-subtle bg-surface/50 p-6 text-center">
      <h3 className="text-sm font-semibold text-text-primary">{title}</h3>
      <p className="max-w-md text-xs text-text-secondary">{description}</p>
      {action ? <div className="mt-2">{action}</div> : null}
    </div>
  );
}

export function SectionHeader({
  eyebrow,
  title,
  description,
  right,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  right?: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-3 border-b border-subtle pb-4">
      <div>
        {eyebrow ? (
          <div className="mb-1 text-[11px] font-mono uppercase tracking-widest text-cyan-accent">
            {eyebrow}
          </div>
        ) : null}
        <h1 className="font-display text-xl font-semibold tracking-tight text-text-primary sm:text-2xl">
          {title}
        </h1>
        {description ? (
          <p className="mt-1 max-w-3xl text-sm text-text-secondary">{description}</p>
        ) : null}
      </div>
      {right ? <div className="flex items-center gap-2">{right}</div> : null}
    </div>
  );
}
