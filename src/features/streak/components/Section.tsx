import type { ReactNode } from 'react';
import { useTheme } from '@/shared/context/ThemeContext';
import { cn } from '@/shared/lib/cn';

interface SectionProps {
  children: ReactNode;
  className?: string;
}

export const Section = ({ children, className }: SectionProps) => {
  const theme = useTheme();

  return (
    <section
      className={cn('flex flex-col rounded-2xl px-5 py-3', className)}
      style={{ backgroundColor: theme.section_bg_color }}
    >
      {children}
    </section>
  );
};
