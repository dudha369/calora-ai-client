import {NavigationBarItem} from "./NavigationBarItem.tsx";
import { HouseHeart, ChartNoAxesColumn, Astroid, User } from "lucide-react";
import type { CSSProperties } from "react";

interface NavigationBarProps {
  style?: CSSProperties;
  iconColor: string;
}

export const NavigationBar = ({style, iconColor}: NavigationBarProps) => {
  return (
    <footer style={{
      position: 'fixed',
      bottom: 20,
      width: '100%',
      zIndex: 99,
      display: 'flex',
      justifyContent: 'center',
    }}>
      <nav style={{
        ...style,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: 48,
        width: 208,
        gap: 16,
        backgroundColor: 'rgba(100, 100, 100, .8)',
        borderRadius: 20,

        color: iconColor
      }}>
        <NavigationBarItem
          to="/"
          icon={<HouseHeart className="icon" />}
          end
        />

        <NavigationBarItem
          to="/analytics"
          icon={<ChartNoAxesColumn className="icon" />}
        />

        <NavigationBarItem
          to="/ai"
          icon={<Astroid className="icon" />}
        />

        <NavigationBarItem
          to="/profile"
          icon={<User className="icon" />}
        />
      </nav>
    </footer>
  )
}