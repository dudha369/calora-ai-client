import { useTheme } from '@/shared/context/ThemeContext';
import {
  NutritionEditGrid,
  type NutritionValues,
} from '@/shared/ui/NutritionEditGrid';
import { NutritionGrid } from '@/features/home/components/NutritionGrid/NutritionGrid';
import { sumNutrition } from '@/features/home/lib/nutrition';

export interface DishEditListItem {
  name: string;
  values: NutritionValues;
}

interface DishEditItemProps {
  name: string;
  onNameChange: (name: string) => void;
  values: NutritionValues;
  baseValues: NutritionValues;
  onValuesChange: (values: NutritionValues) => void;
  onRemove?: () => void;
  counter?: number;
}

const DishEditItem = ({
  name,
  onNameChange,
  values,
  baseValues,
  onValuesChange,
  onRemove,
  counter,
}: DishEditItemProps) => {
  const theme = useTheme();

  return (
    <div
      className="flex flex-col gap-2.5 rounded-2xl p-3"
      style={{ border: `2px solid ${theme.section_bg_color}` }}
    >
      <div className="flex items-center gap-2">
        {counter !== undefined && (
          <span
            className="inline-flex size-7.5 shrink-0 items-center justify-center rounded-full text-base font-medium"
            style={{
              border: `${theme.hint_color} 2px dashed`,
              color: theme.text_color,
            }}
          >
            {counter}
          </span>
        )}

        <textarea
          value={name}
          onChange={(e) => onNameChange(e.target.value)}
          className="field-sizing-content max-h-[calc(2lh+1rem)] min-h-[calc(1lh+1rem)] w-full flex-1 rounded-xl px-3 py-2 text-sm font-semibold"
          style={{
            backgroundColor: theme.section_bg_color,
            color: theme.text_color,
          }}
        />
      </div>

      <NutritionEditGrid
        values={values}
        baseValues={baseValues}
        onRemoveItem={onRemove}
        onChange={onValuesChange}
      />
    </div>
  );
};

interface DishEditListProps {
  items: DishEditListItem[];
  baseValues: NutritionValues[];
  onItemChange: (index: number, item: DishEditListItem) => void;
  onRemoveItem?: (index: number) => void;
}

/**
 * Общий редактор списка блюд: имя + NutritionEditGrid на каждое, плюс
 * сводная NutritionGrid — но только если блюд больше одного. Раньше это
 * условие было в EditMealSheet и FoodResultModal реализовано по-разному
 * (в EditMealSheet сетка показывалась всегда) — теперь поведение одно.
 * Кнопка удаления блюда и номер-бейдж тоже показываются только при
 * нескольких блюдах.
 */
export const DishEditList = ({
  items,
  baseValues,
  onItemChange,
  onRemoveItem,
}: DishEditListProps) => {
  const showCounter = items.length > 1;

  return (
    <>
      {items.map((item, i) => (
        <DishEditItem
          key={i}
          name={item.name}
          onNameChange={(name) => onItemChange(i, { ...item, name })}
          values={item.values}
          baseValues={baseValues[i] ?? item.values}
          onValuesChange={(values) => onItemChange(i, { ...item, values })}
          onRemove={
            showCounter && onRemoveItem ? () => onRemoveItem(i) : undefined
          }
          counter={showCounter ? i + 1 : undefined}
        />
      ))}

      {items.length > 1 && (
        <NutritionGrid data={sumNutrition(items.map((it) => it.values))} />
      )}
    </>
  );
};
