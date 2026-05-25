import { NavItem } from "./NavItem";
import { FabButton } from "./FabButton.tsx";
import { House, ChartNoAxesColumn, Plus, Camera, Sparkle, User } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";

const ICON_SIZE: number = 32;

interface NavigationBarProps {
  safeBottom: number;
}

export const NavigationBar = ({ safeBottom }: NavigationBarProps) => {
  const theme = useTheme();

  return (
    <footer
      className="fixed bottom-0 w-full z-10"
      style={{backgroundColor: `${theme.secondary_bg_color}`}}
    >
      <nav
        className="flex justify-evenly items-center h-14 w-full"
        style={{marginBottom: safeBottom}}
      >
        <NavItem to="/" icon={<House size={ICON_SIZE} />} label="Главная" />
        <NavItem to="/analytics" icon={<ChartNoAxesColumn size={ICON_SIZE} />} label="Аналитика" />

        <FabButton
          to="/scanner"
          icon={<Plus size={ICON_SIZE + 4} />}
          activeIcon={<Camera size={ICON_SIZE + 4} />}
          label="Сканер"
        />

        <NavItem to="/ai" icon={<Sparkle size={ICON_SIZE} />} label="ИИ" />
        <NavItem to="/profile" icon={<User size={ICON_SIZE} />} label="Профиль" />
      </nav>
    </footer>
  );
};
