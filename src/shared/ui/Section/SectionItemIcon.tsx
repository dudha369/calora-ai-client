import type { LucideIcon } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

interface SectionItemIconProps {
  icon: LucideIcon;
  backgroundColor?: string;
  color?: string;
}

export const SectionItemIcon = ({
  icon: Icon,
  backgroundColor,
  color,
}: SectionItemIconProps) => {
  const theme = useTheme();

  return (
    <div
      className="flex size-7.5 shrink-0 items-center justify-center rounded-lg [&>svg]:h-4.5 [&>svg]:w-4.5"
      style={{
        backgroundColor: backgroundColor ?? 'transparent',
        color: color ?? theme.text_color,
      }}
    >
      <Icon size={18} />
    </div>
  );
};
