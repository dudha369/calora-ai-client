import { NavigationBarItem } from "./NavigationBarItem";
import { HouseHeart, ChartNoAxesColumn, Sparkles, User } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";

interface NavigationBarProps {
  safeBottom: number;
}

export const NavigationBar = ({ safeBottom }: NavigationBarProps) => {
  const theme = useTheme();

  // Respect the device safe area: navbar sits above the home indicator
  const bottomOffset = Math.max(safeBottom + 12, 20);

  return (
    <footer
      style={{ position: "fixed", bottom: bottomOffset, width: "100%", zIndex: 99, display: "flex", justifyContent: "center" }}
    >
      <nav
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: 56,
          width: 232,
          gap: 8,
          backgroundColor: `${theme.secondary_bg_color}ee`,
          borderRadius: 28,
          boxShadow: `0 8px 32px ${theme.text_color}18, 0 2px 8px ${theme.text_color}10`,
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
          border: `1px solid ${theme.section_separator_color}`,
          padding: "0 8px",
        }}
      >
        <NavigationBarItem to="/" icon={<HouseHeart size={22} />} label="Главная" end />
        <NavigationBarItem to="/analytics" icon={<ChartNoAxesColumn size={22} />} label="Аналитика" />
        <NavigationBarItem to="/ai" icon={<Sparkles size={22} />} label="ИИ" />
        <NavigationBarItem to="/profile" icon={<User size={22} />} label="Профиль" />
      </nav>
    </footer>
  );
};
