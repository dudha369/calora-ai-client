import { Sprout } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

export const LoadingScreen = () => {
  const theme = useTheme();

  return (
    <div
      className="fixed inset-0 z-999 backdrop-blur-sm"
      style={{ backgroundColor: `${theme.bg_color}D9` }}
    >
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
        <Sprout
          className="animate-pulse"
          style={{ color: theme.hint_color }}
          size={42}
        />
      </div>
      <p
        className="absolute top-1/2 left-1/2 -translate-x-1/2 translate-y-6 text-sm font-medium tracking-widest uppercase"
        style={{ color: theme.hint_color }}
      >
        Loading…
      </p>
    </div>
  );
};
