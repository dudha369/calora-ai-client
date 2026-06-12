import { useTheme } from '../context/ThemeContext.ts';

export const Skeleton = ({ className }: { className?: string }) => {
  const theme = useTheme();
  return (
    <div
      className={`animate-pulse rounded-xl ${className ?? ''}`}
      style={{ backgroundColor: theme.secondary_bg_color }}
    />
  );
};
