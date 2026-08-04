import type { CSSProperties, ReactNode } from 'react';
import { Camera } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

const ICON_SPRING = 'transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)';

interface FabButtonProps {
  isOpen: boolean;
  onToggle: () => void;
  icon: ReactNode;
  label: string;
  navbarColor: string;
  iconRotation?: number;
  /** 'shutter' — FAB временно работает как спуск затвора (ScannerPage
   *  зарегистрировал обработчик через ScannerContext). Тот же контейнер,
   *  что и обычная кнопка меню — просто другая иконка внутри, чтобы FAB
   *  выглядел частью одной системы, а не отдельным виджетом. */
  variant?: 'menu' | 'shutter';
}

export const FabButton = ({
  isOpen,
  onToggle,
  icon,
  label,
  navbarColor,
  iconRotation = 0,
  variant = 'menu',
}: FabButtonProps) => {
  const theme = useTheme();
  const isShutter = variant === 'shutter';

  const iconStyle: CSSProperties = {
    transform: `rotate(${iconRotation + (isOpen ? 45 : 0)}deg)`,
    transition: ICON_SPRING,
  };

  return (
    <button
      type="button"
      onClick={onToggle}
      title={label}
      aria-label={label}
      aria-expanded={isOpen}
      className="relative z-10 flex h-16 w-16 -translate-y-3 items-center justify-center rounded-full"
      style={{
        color: theme.button_text_color,
        backgroundColor: theme.button_color,
        outline: `${navbarColor} solid 5px`,
        boxShadow: `0 6px 16px ${navbarColor}`,
      }}
    >
      {isShutter ? <Camera size={26} /> : <span style={iconStyle}>{icon}</span>}
    </button>
  );
};
