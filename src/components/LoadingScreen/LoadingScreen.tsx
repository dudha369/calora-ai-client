import { useTheme } from "../../context/ThemeContext";

export const LoadingScreen = () => {
  const theme = useTheme();

  return (
    <div
      className="flex flex-col items-center justify-center h-screen gap-4"
      style={{ backgroundColor: theme.bg_color }}
    >
      {/* Animated logo / spinner */}
      <div className="relative size-16">
        <div
          className="absolute inset-0 rounded-full border-4 border-transparent animate-spin"
          style={{
            borderTopColor: theme.button_color,
            borderRightColor: `${theme.button_color}55`,
          }}
        />
        <div
          className="absolute inset-2 rounded-full animate-pulse"
          style={{ backgroundColor: `${theme.button_color}22` }}
        />
      </div>

      <p
        className="text-sm font-medium tracking-widest uppercase"
        style={{ color: theme.hint_color }}
      >
        Загрузка…
      </p>
    </div>
  );
};
