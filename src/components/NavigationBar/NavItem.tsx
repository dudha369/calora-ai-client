import { NavLink } from "react-router-dom";
import type { ReactNode } from "react";
import { useTheme } from "../../context/ThemeContext";

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
      className="flex items-center justify-center w-12 h-12 transition-colors duration-200 ease-in-out"
      style={({ isActive }) => ({
        color: isActive ? theme.text_color : theme.hint_color,
      })}
    >
      {icon}
    </NavLink>
  );
};
