import { NavLink } from 'react-router-dom';
import type { CSSProperties, ReactNode } from 'react';
import { useTheme } from '../../context/ThemeContext';

const ICON_ROTATION_SPRING =
  'transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)';

interface NavItemProps {
  to: string;
  icon: ReactNode;
  label: string;
  iconRotation?: number;
  isBarRotated?: boolean;
}

export const NavItem = ({
  to,
  icon,
  label,
  iconRotation = 0,
  isBarRotated = false,
}: NavItemProps) => {
  const theme = useTheme();

  const iconStyle: CSSProperties | undefined = iconRotation
    ? {
        transform: `rotate(${iconRotation}deg)`,
        transition: ICON_ROTATION_SPRING,
      }
    : undefined;

  return (
    <NavLink
      to={to}
      title={label}
      className="h-full max-w-16 flex-1 transition-colors duration-200 ease-in-out"
      style={({ isActive }) => ({
        color: isActive ? theme.text_color : theme.hint_color,
      })}
    >
      <div className="flex h-full flex-col items-center justify-center gap-px text-xs font-semibold">
        <div style={iconStyle}>{icon}</div>

        <span
          className="overflow-hidden transition-all duration-200"
          style={{
            opacity: isBarRotated ? 0 : 1,
            maxHeight: isBarRotated ? 0 : '1.2em',
          }}
        >
          {label}
        </span>
      </div>
    </NavLink>
  );
};
