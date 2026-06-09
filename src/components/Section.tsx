import type { ReactNode } from "react";
import { useTheme } from "../context/ThemeContext";

interface SectionProps {
  children: ReactNode;
}

export const Section = ({ children }: SectionProps) => {
  const theme = useTheme();

  return (
    <div
      className="flex flex-col mx-4 rounded-3xl divide-y divide-(--tg-section-separator-color)"
      style={{ backgroundColor: theme.section_bg_color }}
    >
      {children}
    </div>
  );
};
