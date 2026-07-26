import { useTheme } from '@/shared/context/ThemeContext';
import type { LucideIcon } from 'lucide-react';

interface InputButtonProps {
  icon: LucideIcon;
  onClick: () => void;
}

export const InputButton = ({ icon: Icon, onClick }: InputButtonProps) => {
  const theme = useTheme();

  return (
    <button
      onClick={onClick}
      className="flex h-full w-12 items-center justify-center"
      style={{
        color: theme.text_color,
      }}
    >
      <Icon size={26} strokeWidth={2} />
    </button>
  );
};
