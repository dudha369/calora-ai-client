import type { ReactNode } from 'react';
import { useTheme } from '../context/ThemeContext';

interface LabelProps {
  icon: ReactNode;
  text: string;
}

export const Label = ({ icon, text }: LabelProps) => {
  const theme = useTheme();

  return (
    <div
      className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs"
      style={{
        backgroundColor: theme.section_bg_color,
        color: theme.text_color,
      }}
    >
      {icon}
      <span>{text}</span>
    </div>
  );
};
