import { useTheme } from '@/shared/context/ThemeContext';
import type { LucideIcon } from 'lucide-react';

type Side = 'left' | 'right';

interface InputButtonProps {
  icon: LucideIcon;
  side: Side;
  onClick: () => void;
}

export const InputButton = ({
  icon: Icon,
  onClick,
  side,
}: InputButtonProps) => {
  const theme = useTheme();

  const borderProperty = `border${side === 'right' ? 'Left' : 'Right'}`;

  return (
    <button
      onClick={onClick}
      className="flex h-full w-12 items-center justify-center"
      style={{
        color: theme.text_color,
        [borderProperty]: `1px solid ${theme.hint_color}`,
      }}
    >
      <Icon size={26} strokeWidth={2} />
    </button>
  );
};
