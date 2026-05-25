import { NavLink, useLocation } from "react-router-dom";
import type { ReactNode, MouseEvent } from "react";
import { useTheme } from "../../context/ThemeContext";
import { useScanner } from "../../context/ScannerContext";

interface FabButtonProps {
  to: string;
  icon: ReactNode;
  activeIcon?: ReactNode;
  label: string;
}

export const FabButton = ({ to, icon, activeIcon, label }: FabButtonProps) => {
  const theme = useTheme();
  const { triggerCapture } = useScanner();

  const location = useLocation();
  const isActive = location.pathname === to;

  const handleClick = (e: MouseEvent) => {
    if (isActive) {
      e.preventDefault();
      triggerCapture();

    }
  };

  return (
    <NavLink
      to={to}
      title={label}
      onClick={handleClick}
      className="flex -translate-y-3 items-center justify-center w-15 h-15 rounded-full"
      style={{
        color: theme.button_text_color,
        backgroundColor: theme.button_color,
      }}
    >
      {({ isActive }) => (
        <span className="relative flex items-center justify-center">
          <span className={`transition-all duration-300 ${
            isActive ? "opacity-0 scale-50 rotate-90" : "opacity-100 scale-100 rotate-0"
          }`}>
            {icon}
          </span>

          {activeIcon && (
            <span className={`absolute transition-all duration-300 ${
              isActive ? "opacity-100 scale-100 rotate-0" : "opacity-0 scale-50 -rotate-90"
            }`}>
              {activeIcon}
            </span>
          )}
        </span>
      )}
    </NavLink>
  );
};
