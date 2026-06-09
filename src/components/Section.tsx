import type {ReactNode} from "react";
import { useTheme } from "../context/ThemeContext.ts";
import { makeContrast } from "../utils/colors.ts";

interface SectionProps {
  children: ReactNode;
}

export const Section = ({children}: SectionProps) => {
  const theme = useTheme();

  const section_color =
    theme.section_bg_color === theme.bg_color ?
      theme.secondary_bg_color === theme.bg_color ?
        makeContrast(theme.bg_color)
        : theme.secondary_bg_color
      : theme.section_bg_color;

  return (
    <div
      className="flex flex-col mx-4 rounded-3xl divide-y divide-(--tg-section-separator-color)"
      style={{
        backgroundColor: section_color,
      }}
    >
      {children}
    </div>
  );
};
