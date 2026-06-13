import { useTheme } from "../../context/ThemeContext";
import type { FoodItem } from "../../interfaces/api/food";

interface Props {
  item: FoodItem;
  /** Последняя строка — без нижней разделительной линии */
  isLast: boolean;
}

export const FoodItemRow = ({ item, isLast }: Props) => {
  const theme = useTheme();

  return (
    <div
      className="flex items-center justify-between gap-3 py-2.5"
      style={{
        borderBottom: isLast ? "none" : `1px solid ${theme.section_separator_color}`,
      }}
    >
      <div className="flex flex-col gap-0.5 min-w-0">
        <p className="text-sm font-medium truncate" style={{ color: theme.text_color }}>
          {item.food_name}
        </p>
        <p className="text-xs" style={{ color: theme.hint_color }}>
          {item.portion_g} г · Б {item.protein_g} · Ж {item.fat_g} · У {item.carbs_g}
        </p>
      </div>

      <span
        className="text-sm font-semibold shrink-0 tabular-nums"
        style={{ color: theme.text_color }}
      >
        {item.calories} ккал
      </span>
    </div>
  );
};
