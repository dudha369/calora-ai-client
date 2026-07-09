import { NavLink } from 'react-router-dom';
import type { CSSProperties, ReactNode } from 'react';
import { useTheme } from '../../context/ThemeContext';

interface NavItemProps {
  to: string;
  icon: ReactNode;
  label: string;
  iconRotation?: number;
  isBarRotated?: boolean;
  /** Вертикальный режим (sidebar в landscape scanner) */
  vertical?: boolean;
}

export const NavItem = ({
  to,
  icon,
  label,
  iconRotation = 0,
  isBarRotated = false,
  vertical = false,
}: NavItemProps) => {
  const theme = useTheme();

  /* CSS custom property управляет поворотом через класс .nav-icon-rotate */
  const iconStyle: CSSProperties | undefined = iconRotation
    ? ({ '--icon-rot': `${iconRotation}deg` } as CSSProperties)
    : undefined;

  return (
    <NavLink
      to={to}
      title={label}
      className={
        vertical
          ? 'flex w-full items-center justify-center py-2 transition-colors duration-200 ease-in-out'
          : 'h-full max-w-16 flex-1 transition-colors duration-200 ease-in-out'
      }
      style={({ isActive }) => ({
        color: isActive ? theme.text_color : theme.hint_color,
      })}
    >
      <div
        className={
          vertical
            ? 'flex items-center justify-center'
            : 'flex h-full flex-col items-center justify-center gap-px text-xs font-semibold'
        }
      >
        <div className="nav-icon-rotate" style={iconStyle}>
          {icon}
        </div>

        {/* Лейбл скрывается в vertical и при повороте */}
        {!vertical && (
          <span
            className="overflow-hidden transition-all duration-200"
            style={{
              opacity: isBarRotated ? 0 : 1,
              maxHeight: isBarRotated ? 0 : '1.2em',
            }}
          >
            {label}
          </span>
        )}
      </div>
    </NavLink>
  );
};
