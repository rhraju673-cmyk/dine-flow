import { Link } from 'react-router-dom';
import { brand } from '../../config/brand';
import { cn } from '../../utils/cn';

/** Brand logo (mark + wordmark). Change the image/name in src/config/brand.ts. */
export function Logo({ to = '/', compact, className }: { to?: string; compact?: boolean; className?: string }) {
  return (
    <Link to={to} className={cn('group inline-flex items-center gap-2.5', className)} aria-label={brand.name}>
      <img src={brand.logoMark} alt="" className="size-9 rounded-[10px] transition-transform group-hover:-rotate-6" />
      {!compact && <span className="font-display text-xl font-semibold tracking-tight text-fg">{brand.name}</span>}
    </Link>
  );
}
