import {
  NutritionGridCardCell,
  type NutritionGridCardCellProps,
} from './NutritionGridCardCell';
import { useTheme } from '@/shared/context/ThemeContext';

interface NutritionGridRow {
  first: NutritionGridCardCellProps;
  second: NutritionGridCardCellProps;
  third: NutritionGridCardCellProps;
}

interface NutritionGridCardProps {
  row1: NutritionGridRow;
  row2?: NutritionGridRow;
}

export const NutritionGridCard = ({ row1, row2 }: NutritionGridCardProps) => {
  const theme = useTheme();

  return (
    <div
      className="flex h-full w-full flex-col rounded-2xl"
      style={{ backgroundColor: theme.secondary_bg_color }}
    >
      <div className="flex flex-1">
        <NutritionGridCardCell {...row1.first} />
        <NutritionGridCardCell {...row1.second} />
        <NutritionGridCardCell {...row1.third} />
      </div>

      {row2 && (
        <>
          <div
            className="mx-auto h-0.5 w-[90%]"
            style={{ backgroundColor: theme.section_separator_color }}
          />
          <div className="flex flex-1">
            <NutritionGridCardCell {...row2.first} />
            <NutritionGridCardCell {...row2.second} />
            <NutritionGridCardCell {...row2.third} />
          </div>
        </>
      )}
    </div>
  );
};
