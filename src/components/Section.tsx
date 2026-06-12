import type { ReactNode } from 'react';
import { useTheme } from '../context/ThemeContext';

interface SectionProps {
  children: ReactNode;
}

export const Section = ({ children }: SectionProps) => {
  const theme = useTheme();

  return (
    <div
      className="mx-4 flex flex-col divide-y divide-(--tg-section-separator-color) rounded-3xl"
      style={{ backgroundColor: theme.section_bg_color }}
    >
      {children}
    </div>
  );
};
