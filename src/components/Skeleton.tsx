import {useTheme} from "../context/ThemeContext.ts";

export const Skeleton = ({ className }: { className?: string }) => {
  const theme = useTheme();
  return (
    <div
      className={`rounded-xl animate-pulse ${className ?? ""}`}
      style={{ backgroundColor: theme.secondary_bg_color }}
    />
  );
};
