import { NavLink } from 'react-router-dom';
import type { ReactNode } from 'react';
import { useTheme } from '../../context/ThemeContext';

interface NavigationBarItemProps {
  to: string;
  icon: ReactNode;
  label: string;
}

export const NavItem = ({ to, icon, label }: NavigationBarItemProps) => {
  const theme = useTheme();

  return (
    <NavLink
      to={to}
      title={label}
      className="h-full max-w-16 flex-1 transition-colors duration-200 ease-in-out"
      style={({ isActive }) => ({
        color: isActive ? theme.text_color : theme.hint_color,
      })}
    >
      <div className="flex h-full flex-col items-center justify-center gap-px text-sm font-semibold">
        {icon}
        <span>{label}</span>
      </div>
    </NavLink>
  );
};
