import { NavItem } from './NavItem';
import { FabButton } from './FabButton';
import {
  House,
  GlassWater,
  Plus,
  Camera,
  ChartNoAxesColumn,
  User,
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

const ICON_SIZE = 24;

interface NavigationBarProps {
  safeBottom: number;
}

export const NavigationBar = ({ safeBottom }: NavigationBarProps) => {
  const theme = useTheme();

  return (
    <footer
      className="w-full shrink-0"
      style={{ backgroundColor: theme.secondary_bg_color }}
    >
      <div
        className="mx-auto w-full max-w-screen-sm"
        style={{ paddingBottom: safeBottom ? 10 : 0 }}
      >
        <nav className="flex h-16 items-center justify-evenly">
          <NavItem to="/" icon={<House size={ICON_SIZE} />} label="Home" />
          <NavItem
            to="/water"
            icon={<GlassWater size={ICON_SIZE} />}
            label="Water"
          />

          <FabButton
            to="/scanner"
            icon={<Plus strokeWidth={3.5} size={ICON_SIZE + 12} />}
            activeIcon={<Camera strokeWidth={2.5} size={ICON_SIZE + 8} />}
            label="Scanner"
            navbarColor={theme.secondary_bg_color}
          />

          <NavItem
            to="/analytics"
            icon={<ChartNoAxesColumn size={ICON_SIZE} />}
            label="Analytics"
          />
          <NavItem
            to="/profile"
            icon={<User size={ICON_SIZE} />}
            label="Profile"
          />
        </nav>
      </div>
    </footer>
  );
};
