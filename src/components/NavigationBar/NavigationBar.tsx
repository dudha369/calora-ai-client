import {NavigationBarItem} from "./NavigationBarItem.tsx";
import { House, History, Settings, User } from "lucide-react";

interface NavigationBarProps {
  iconColor: string;
}

export const NavigationBar = ({iconColor}: NavigationBarProps) => {
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
          icon={<House className="icon" />}
          end
        />

        <NavigationBarItem
          to="/history"
          icon={<History className="icon" />}
        />

        <NavigationBarItem
          to="/settings"
          icon={<Settings className="icon" />}
        />

        <NavigationBarItem
          to="/profile"
          icon={<User className="icon" />}
        />
      </nav>
    </footer>
  )
}