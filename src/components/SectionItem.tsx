import { Sprout, ChevronRight } from "lucide-react";
import {useTheme} from "../context/ThemeContext.ts";

export const SectionItem = () => {
  const theme = useTheme();

  return (
    <div className="flex items-center justify-between w-full px-4 py-3">
      <div className="flex items-center gap-3">
        <Sprout size={18} />
        <span>Кнопка</span>
      </div>

      <ChevronRight color={theme.hint_color} size={22} />
    </div>
  );
};