import { NavItem } from "./NavItem";
import { FabButton } from "./FabButton.tsx";
import { House, ChartNoAxesColumn, Plus, Camera, Sparkles, User } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";

const ICON_SIZE: number = 24;

export const NavigationBar = () => {
  const theme = useTheme();

  return (
    <footer
      className="fixed bottom-0 left-0 z-10 w-full"
      style={{ backgroundColor: theme.secondary_bg_color }}
    >
      <div className="mx-auto w-full max-w-screen-sm pb-2">
        <nav className="flex h-16 items-center justify-evenly">
          <NavItem to="/" icon={<House size={ICON_SIZE} />} label="Home" />
          <NavItem to="/analytics" icon={<ChartNoAxesColumn size={ICON_SIZE} />} label="Analytics" />

          <FabButton
            to="/scanner"
            icon={<Plus size={ICON_SIZE + 8} />}
            activeIcon={<Camera size={ICON_SIZE + 8} />}
            label="Scanner"
          />

          <NavItem to="/ai" icon={<Sparkles size={ICON_SIZE} />} label="AI" />
          <NavItem to="/profile" icon={<User size={ICON_SIZE} />} label="Profile" />
        </nav>
      </div>
    </footer>
  );
};
