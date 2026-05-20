import { NavLink } from "react-router-dom";
import type { ReactNode } from "react";
import { useTheme } from "../../context/ThemeContext";

type NavigationBarItemProps = {
  to: string;
  icon: ReactNode;
  label: string;
  end?: boolean;
};

export const NavigationBarItem = ({ to, icon, label, end }: NavigationBarItemProps) => {
  const theme = useTheme();

  return (
    <NavLink
      to={to}
      end={end}
      title={label}
      style={({ isActive }) => ({
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: 48,
        height: 40,
        borderRadius: 20,
        transition: "all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)",
        color: isActive ? theme.button_text_color : theme.hint_color,
        backgroundColor: isActive ? theme.button_color : "transparent",
        transform: isActive ? "scale(1.08)" : "scale(1)",
      })}
    >
      {icon}
    </NavLink>
  );
};
