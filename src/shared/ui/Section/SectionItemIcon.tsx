import type { ReactNode } from 'react';
import { useTheme } from '../../context/ThemeContext';

interface SectionItemIconProps {
  children: ReactNode;
  color: string;
}

export const SectionItemIcon = ({ children, color }: SectionItemIconProps) => {
  const theme = useTheme();

  return (
    <div
      className="flex size-7.5 shrink-0 items-center justify-center rounded-lg [&>svg]:h-4.5 [&>svg]:w-4.5"
      style={{
        backgroundColor: color,
        color: theme.text_color,
      }}
    >
      {children}
    </div>
  );
};
