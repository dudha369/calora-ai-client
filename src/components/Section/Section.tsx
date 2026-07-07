import type { ReactNode } from 'react';
import { useTheme } from '../../context/ThemeContext';

interface SectionProps {
  title?: string;
  children?: ReactNode;
}

export const Section = ({ title, children }: SectionProps) => {
  const theme = useTheme();

  return (
    <div className="mx-4 flex flex-col gap-1">
      <span
        className="ml-3 text-[13px] font-medium tracking-wider uppercase"
        style={{ color: theme.section_header_text_color }}
      >
        {title}
      </span>
      <div
        className="flex flex-col overflow-hidden rounded-3xl"
        style={{ backgroundColor: theme.section_bg_color }}
      >
        {children}
      </div>
    </div>
  );
};
