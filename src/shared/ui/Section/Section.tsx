import type { ReactNode } from 'react';
import { useTheme } from '@/shared/context/ThemeContext';
import { cn } from '@/shared/lib/cn';

interface SectionProps {
  children?: ReactNode;
  className?: string;

  title?: string;
}

export const Section = ({ children, className, title }: SectionProps) => {
  const theme = useTheme();

  const withTitle = !!title;

  return (
    <div className={cn('flex flex-col', withTitle && 'gap-1')}>
      {withTitle && (
        <span
          className="ml-3 text-[13px] font-medium tracking-wider uppercase"
          style={{ color: theme.section_header_text_color }}
        >
          {title}
        </span>
      )}

      <section
        className={cn('flex flex-col overflow-hidden rounded-3xl', className)}
        style={{ backgroundColor: theme.section_bg_color }}
      >
        {children}
      </section>
    </div>
  );
};
