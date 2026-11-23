import { Eye, EyeOff } from 'lucide-react';
import { useId, useState, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes, type TextareaHTMLAttributes } from 'react';
import { useI18n } from '../../contexts/I18nContext';
import { cn } from '../../utils/cn';

const controlBase =
  'w-full rounded-xl border bg-bg-2 px-3.5 text-sm text-fg placeholder:text-subtle transition-colors ' +
  'focus:outline-none focus:ring-2 focus:ring-brand/40 focus:border-brand/70 disabled:opacity-60 disabled:cursor-not-allowed';

interface FieldShellProps {
  label: string;
  error?: string;
  hint?: string;
  optional?: boolean;
  children: (id: string, describedBy: string | undefined) => ReactNode;
  className?: string;
}

/** Label + control + hint/error, wired up for accessibility. */
export function FieldShell({ label, error, hint, optional, children, className }: FieldShellProps) {
  const id = useId();
  const { t } = useI18n();
  const describedBy = error ? `${id}-error` : hint ? `${id}-hint` : undefined;
  return (
    <div className={cn('space-y-1.5', className)}>
      <label htmlFor={id} className="flex items-baseline justify-between text-sm font-medium text-fg/90">
        <span>{label}</span>
        {optional && <span className="text-xs font-normal text-subtle">{t('common.optional')}</span>}
      </label>
      {children(id, describedBy)}
      {error ? (
        <p id={`${id}-error`} className="text-xs text-danger" role="alert">
          {error}
        </p>
      ) : hint ? (
        <p id={`${id}-hint`} className="text-xs text-subtle">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

type Common = { label: string; error?: string; hint?: string; optional?: boolean; wrapperClassName?: string };

export function Input({ label, error, hint, optional, wrapperClassName, className, ...rest }: Common & InputHTMLAttributes<HTMLInputElement>) {
  return (
    <FieldShell label={label} error={error} hint={hint} optional={optional} className={wrapperClassName}>
      {(id, describedBy) => (
        <input
          id={id}
          aria-invalid={Boolean(error) || undefined}
          aria-describedby={describedBy}
          className={cn(controlBase, 'h-11', error ? 'border-danger/70' : 'border-line', className)}
          {...rest}
        />
      )}
    </FieldShell>
  );
}

export function PasswordInput(props: Common & Omit<InputHTMLAttributes<HTMLInputElement>, 'type'>) {
  const [visible, setVisible] = useState(false);
  const { t } = useI18n();
  const { label, error, hint, optional, wrapperClassName, className, ...rest } = props;
  return (
    <FieldShell label={label} error={error} hint={hint} optional={optional} className={wrapperClassName}>
      {(id, describedBy) => (
        <div className="relative">
          <input
            id={id}
            type={visible ? 'text' : 'password'}
            aria-invalid={Boolean(error) || undefined}
            aria-describedby={describedBy}
            className={cn(controlBase, 'h-11 pr-11', error ? 'border-danger/70' : 'border-line', className)}
            {...rest}
          />
          <button
            type="button"
            onClick={() => setVisible((v) => !v)}
            className="absolute inset-y-0 right-0 grid w-11 place-items-center text-subtle hover:text-fg"
            aria-label={visible ? t('common.hidePassword') : t('common.showPassword')}
          >
            {visible ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
          </button>
        </div>
      )}
    </FieldShell>
  );
}

export function Select({
  label,
  error,
  hint,
  optional,
  wrapperClassName,
  className,
  children,
  ...rest
}: Common & SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <FieldShell label={label} error={error} hint={hint} optional={optional} className={wrapperClassName}>
      {(id, describedBy) => (
        <select
          id={id}
          aria-invalid={Boolean(error) || undefined}
          aria-describedby={describedBy}
          className={cn(
            controlBase,
            'h-11 appearance-none bg-[url("data:image/svg+xml,%3Csvg%20xmlns%3D%27http%3A//www.w3.org/2000/svg%27%20viewBox%3D%270%200%2020%2020%27%20fill%3D%27%2394A3B8%27%3E%3Cpath%20d%3D%27M5.3%207.3a1%201%200%20011.4%200L10%2010.6l3.3-3.3a1%201%200%20111.4%201.4l-4%204a1%201%200%2001-1.4%200l-4-4a1%201%200%20010-1.4z%27/%3E%3C/svg%3E")] bg-[length:18px] bg-[right_0.75rem_center] bg-no-repeat pr-10',
            error ? 'border-danger/70' : 'border-line',
            className,
          )}
          {...rest}
        >
          {children}
        </select>
      )}
    </FieldShell>
  );
}

export function Textarea({
  label,
  error,
  hint,
  optional,
  wrapperClassName,
  className,
  ...rest
}: Common & TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <FieldShell label={label} error={error} hint={hint} optional={optional} className={wrapperClassName}>
      {(id, describedBy) => (
        <textarea
          id={id}
          aria-invalid={Boolean(error) || undefined}
          aria-describedby={describedBy}
          className={cn(controlBase, 'min-h-28 py-3', error ? 'border-danger/70' : 'border-line', className)}
          {...rest}
        />
      )}
    </FieldShell>
  );
}
