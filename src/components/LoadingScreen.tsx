import { useTheme } from "../context/ThemeContext";
import { Sprout } from "lucide-react";

export const LoadingScreen = () => {
  const theme = useTheme();

  return (
    <div
      className="fixed inset-0 z-999 flex flex-col items-center justify-center gap-4 backdrop-blur-sm"
      style={{ backgroundColor: `${theme.bg_color}D9` }}
    >
      <Sprout className="animate-pulse" style={{color: theme.hint_color}} size={48} />

      <p
        className="text-sm font-medium tracking-widest uppercase"
        style={{ color: theme.hint_color }}
      >
        Loading…
      </p>
    </div>
  );
};
