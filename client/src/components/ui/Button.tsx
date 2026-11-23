import { Loader2 } from 'lucide-react';
import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { cn } from '../../utils/cn';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline';
type Size = 'sm' | 'md' | 'lg';

const variants: Record<Variant, string> = {
  primary:
    'bg-gradient-to-b from-brand-2 to-brand text-brand-ink font-semibold shadow-[var(--shadow-glow)] hover:brightness-105 active:brightness-95',
  secondary: 'bg-card-2 text-fg border border-line hover:border-line-2 hover:bg-[#1f2b40]',
  outline: 'border border-line-2 text-fg hover:border-brand/60 hover:text-brand-2 bg-transparent',
  ghost: 'text-muted hover:text-fg hover:bg-white/5',
  danger: 'bg-danger/10 text-danger border border-danger/30 hover:bg-danger/20',
};

const sizes: Record<Size, string> = {
  sm: 'h-9 px-3.5 text-sm gap-1.5 rounded-lg',
  md: 'h-11 px-5 text-sm gap-2 rounded-xl',
  lg: 'h-13 px-7 text-base gap-2.5 rounded-xl',
};

interface BaseProps {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  icon?: ReactNode;
  iconRight?: ReactNode;
  className?: string;
  children?: ReactNode;
  fullWidth?: boolean;
}

export function buttonClasses({ variant = 'primary', size = 'md', fullWidth, className }: BaseProps) {
  return cn(
    'inline-flex items-center justify-center whitespace-nowrap transition-all duration-200 select-none',
    'disabled:cursor-not-allowed disabled:opacity-55 focus-visible:outline-2',
    variants[variant],
    sizes[size],
    fullWidth && 'w-full',
    className,
  );
}

/** Standard button. */
export function Button({
  variant,
  size,
  loading,
  icon,
  iconRight,
  className,
  children,
  fullWidth,
  disabled,
  ...rest
}: BaseProps & ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={buttonClasses({ variant, size, fullWidth, className })}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...rest}
    >
      {loading ? <Loader2 className="size-4 animate-spin" /> : icon}
      {children}
      {!loading && iconRight}
    </button>
  );
}

/** Looks like a button, navigates like a link (internal routes, #anchors or external URLs). */
export function ButtonLink({
  to,
  variant,
  size,
  icon,
  iconRight,
  className,
  children,
  fullWidth,
  onClick,
}: BaseProps & { to: string; onClick?: () => void }) {
  const classes = buttonClasses({ variant, size, fullWidth, className });
  const content = (
    <>
      {icon}
      {children}
      {iconRight}
    </>
  );
  if (to.startsWith('#') || to.startsWith('http') || to.startsWith('mailto:')) {
    return (
      <a href={to} className={classes} onClick={onClick}>
        {content}
      </a>
    );
  }
  return (
    <Link to={to} className={classes} onClick={onClick}>
      {content}
    </Link>
  );
}
