import { NavItem } from "./NavItem";
import { FabButton } from "./FabButton";
import { House, ChartNoAxesColumn, Plus, Camera, Sparkles, User } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";
import {makeContrast} from "../../utils/colors.ts";

const ICON_SIZE: number = 24;

interface NavigationBarProps {
  safeBottom: number;
}

export const NavigationBar = ({ safeBottom }: NavigationBarProps) => {
  const theme = useTheme();

  const navbar_color =
    theme.secondary_bg_color === theme.bg_color ?
      theme.section_bg_color === theme.bg_color ?
        makeContrast(theme.bg_color)
        : theme.section_bg_color
      : theme.secondary_bg_color;

  return (
    <footer
      className="w-full shrink-0"
      style={{ backgroundColor: navbar_color }}
    >
      <div
        className="mx-auto w-full max-w-screen-sm"
        style={{
          paddingBottom: (safeBottom) ? 8 : 0,
        }}
      >
        <nav className="flex h-16 items-center justify-evenly">
          <NavItem to="/" icon={<House size={ICON_SIZE} />} label="Home" />
          <NavItem to="/analytics" icon={<ChartNoAxesColumn size={ICON_SIZE} />} label="Analytics" />

          <FabButton
            to="/scanner"
            icon={<Plus size={ICON_SIZE + 8} />}
            activeIcon={<Camera size={ICON_SIZE + 8} />}
            label="Scanner"
            navbarColor={navbar_color}
          />

          <NavItem to="/ai" icon={<Sparkles size={ICON_SIZE} />} label="AI" />
          <NavItem to="/profile" icon={<User size={ICON_SIZE} />} label="Profile" />
        </nav>
      </div>
    </footer>
  );
};
