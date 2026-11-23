import type { ReactNode } from 'react';
import { cn } from '../../utils/cn';

/** Eyebrow + title + description block used across landing sections. */
export function SectionHeading({
  eyebrow,
  title,
  description,
  align = 'center',
  className,
  children,
}: {
  eyebrow: string;
  title: string;
  description?: string;
  align?: 'center' | 'left';
  className?: string;
  children?: ReactNode;
}) {
  return (
    <div className={cn('max-w-2xl', align === 'center' && 'mx-auto text-center', className)}>
      <span className="eyebrow">
        <span className="h-px w-6 bg-brand-2/60" />
        {eyebrow}
      </span>
      <h2 className="mt-4 font-display text-3xl leading-tight font-semibold tracking-tight text-balance text-fg sm:text-4xl lg:text-[2.75rem]">
        {title}
      </h2>
      {description && <p className="mt-4 text-base leading-relaxed text-pretty text-muted sm:text-lg">{description}</p>}
      {children}
    </div>
  );
}
