/** Small presentational building blocks: Badge, Alert, Spinner, ProgressBar, EmptyState. */
import { AlertCircle, CheckCircle2, Info, Loader2, TriangleAlert } from 'lucide-react';
import type { ReactNode } from 'react';
import { cn } from '../../utils/cn';

type Tone = 'neutral' | 'brand' | 'success' | 'warning' | 'danger' | 'info';

const badgeTones: Record<Tone, string> = {
  neutral: 'bg-white/5 text-muted border-line',
  brand: 'bg-brand/12 text-brand-2 border-brand/30',
  success: 'bg-success/10 text-success border-success/25',
  warning: 'bg-warning/10 text-warning border-warning/25',
  danger: 'bg-danger/10 text-danger border-danger/30',
  info: 'bg-info/10 text-info border-info/25',
};

export function Badge({ tone = 'neutral', children, className, dot }: { tone?: Tone; children: ReactNode; className?: string; dot?: boolean }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold whitespace-nowrap',
        badgeTones[tone],
        className,
      )}
    >
      {dot && <span className="size-1.5 rounded-full bg-current" />}
      {children}
    </span>
  );
}

const alertIcons = { info: Info, success: CheckCircle2, warning: TriangleAlert, danger: AlertCircle };

export function Alert({ tone = 'danger', children, className }: { tone?: 'info' | 'success' | 'warning' | 'danger'; children: ReactNode; className?: string }) {
  const Icon = alertIcons[tone];
  return (
    <div role={tone === 'danger' ? 'alert' : 'status'} className={cn('flex gap-3 rounded-xl border px-4 py-3 text-sm', badgeTones[tone], className)}>
      <Icon className="mt-0.5 size-4 shrink-0" />
      <div className="text-fg/90">{children}</div>
    </div>
  );
}

export function Spinner({ className, label }: { className?: string; label?: string }) {
  return (
    <span className={cn('inline-flex items-center gap-2 text-muted', className)} role="status">
      <Loader2 className="size-5 animate-spin text-brand" />
      {label && <span className="text-sm">{label}</span>}
    </span>
  );
}

export function PageLoader({ label }: { label?: string }) {
  return (
    <div className="grid min-h-[50vh] place-items-center">
      <Spinner label={label} />
    </div>
  );
}

export function ProgressBar({ value, className }: { value: number; className?: string }) {
  return (
    <div className={cn('h-2 w-full overflow-hidden rounded-full bg-white/5', className)} role="progressbar" aria-valuenow={value} aria-valuemin={0} aria-valuemax={100}>
      <div
        className="h-full rounded-full bg-gradient-to-r from-brand to-brand-2 transition-[width] duration-700"
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      />
    </div>
  );
}

export function EmptyState({ icon, title, body, action }: { icon: ReactNode; title: string; body: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center px-6 py-10 text-center">
      <div className="mb-4 grid size-12 place-items-center rounded-2xl border border-line bg-bg-2 text-brand-2">{icon}</div>
      <h3 className="font-semibold text-fg">{title}</h3>
      <p className="mt-1.5 max-w-md text-sm text-muted">{body}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
