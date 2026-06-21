import { useMemo, useState } from 'react';
import { Trash2 } from 'lucide-react';
import { ModalWindow } from './ModalWindow';
import { NumberField } from './NumberField';
import { NutritionTable, type NutritionRow } from './NutritionTable';
import { round1 } from '../utils/nutrition';
import type { AnalyzedDish, FoodAnalyzeResponse } from '../interfaces/api/food';
import { useTheme } from '../context/ThemeContext';

interface FoodResultModalProps {
  result: FoodAnalyzeResponse;
  /** Получает финальный (возможно отредактированный пользователем) список блюд */
  onConfirm: (dishes: AnalyzedDish[]) => Promise<void>;
  onClose: () => void;
}

const fmt = (n: number) => n.toFixed(1).replace(/\.0$/, '');

interface Totals {
  calories: number;
  protein_g: number;
  fat_g: number;
  carbs_g: number;
  fiber_g: number;
  sugar_g: number;
  water_ml: number;
}

function sumDishes(dishes: AnalyzedDish[]): Totals {
  return dishes.reduce(
    (acc, d) => ({
      calories: acc.calories + d.calories,
      protein_g: round1(acc.protein_g + d.protein_g),
      fat_g: round1(acc.fat_g + d.fat_g),
      carbs_g: round1(acc.carbs_g + d.carbs_g),
      fiber_g: round1(acc.fiber_g + d.fiber_g),
      sugar_g: round1(acc.sugar_g + d.sugar_g),
      water_ml: acc.water_ml + d.water_ml,
    }),
    {
      calories: 0,
      protein_g: 0,
      fat_g: 0,
      carbs_g: 0,
      fiber_g: 0,
      sugar_g: 0,
      water_ml: 0,
    },
  );
}

/**
 * Модальное окно результата AI-анализа еды/напитков.
 *
 * Каждое блюдо редактируется напрямую (имя + 8 числовых полей), БЕЗ
 * пропорционального пересчёта по порции: Gemini отдаёт абсолютные
 * калории/БЖУ для распознанной порции, а не значения на 100 г — поэтому
 * пропорциональный пересчёт при правке одного поля исказил бы остальные.
 * Прямое редактирование проще и предсказуемее: пользователь правит то,
 * с чем не согласен, а не борется с «умным» автопересчётом.
 *
 * Итоги пересчитываются на лету через useMemo из текущего состояния
 * dishes — отдельно не хранятся, чтобы не было риска рассинхронизации
 * между строками и шапкой.
 */
export const FoodResultModal = ({
  result,
  onConfirm,
  onClose,
}: FoodResultModalProps) => {
  const theme = useTheme();
  const [dishes, setDishes] = useState<AnalyzedDish[]>(result.dishes);
  const [isConfirming, setIsConfirming] = useState(false);

  const totals = useMemo(() => sumDishes(dishes), [dishes]);

  const updateDish = <K extends keyof AnalyzedDish>(
    index: number,
    key: K,
    value: AnalyzedDish[K],
  ) => {
    setDishes((prev) =>
      prev.map((d, i) => (i === index ? { ...d, [key]: value } : d)),
    );
  };

  const removeDish = (index: number) => {
    setDishes((prev) => prev.filter((_, i) => i !== index));
  };

  const handleConfirm = async () => {
    setIsConfirming(true);
    try {
      await onConfirm(dishes);
    } finally {
      setIsConfirming(false);
    }
  };

  const totalRows: NutritionRow[] = [
    { label: 'Итого калорий', value: `${totals.calories} ккал`, primary: true },
    { label: 'Белки', value: `${fmt(totals.protein_g)} г` },
    { label: 'Жиры', value: `${fmt(totals.fat_g)} г` },
    { label: 'Углеводы', value: `${fmt(totals.carbs_g)} г` },
    { label: 'Клетчатка', value: `${fmt(totals.fiber_g)} г` },
    { label: 'Сахар', value: `${fmt(totals.sugar_g)} г` },
    ...(totals.water_ml > 0
      ? [{ label: '💧 Вода', value: `${totals.water_ml} мл` }]
      : []),
  ];

  return (
    <ModalWindow
      title="Оценка блюда"
      onClose={onClose}
      cancelLabel="Отмена"
      actionLabel="Добавить"
      iconCustomEmojiId="5260416304224936047"
      onAction={handleConfirm}
      isProcessing={isConfirming}
      actionDisabled={dishes.length === 0}
    >
      <div className="flex flex-col gap-2.5">
        {dishes.map((dish, i) => (
          <div
            key={i}
            className="flex flex-col gap-2.5 rounded-2xl p-3"
            style={{ backgroundColor: theme.section_bg_color }}
          >
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={dish.name}
                onChange={(e) => updateDish(i, 'name', e.target.value)}
                className="min-w-0 flex-1 rounded-xl px-3 py-2 text-sm font-semibold outline-none"
                style={{
                  backgroundColor: theme.secondary_bg_color,
                  color: theme.text_color,
                }}
              />
              {dishes.length > 1 && (
                <button
                  onClick={() => removeDish(i)}
                  aria-label="Удалить блюдо"
                  className="shrink-0 rounded-lg p-2 transition-opacity active:opacity-60"
                  style={{ color: theme.destructive_text_color }}
                >
                  <Trash2 size={16} />
                </button>
              )}
            </div>

            <div className="grid grid-cols-2 gap-2">
              <NumberField
                label="Порция"
                unit="г"
                value={dish.portion_g}
                onChange={(v) => updateDish(i, 'portion_g', v)}
              />
              <NumberField
                label="Калории"
                unit="ккал"
                value={dish.calories}
                onChange={(v) => updateDish(i, 'calories', Math.round(v))}
              />
              <NumberField
                label="Белки"
                unit="г"
                step={0.1}
                value={dish.protein_g}
                onChange={(v) => updateDish(i, 'protein_g', v)}
              />
              <NumberField
                label="Жиры"
                unit="г"
                step={0.1}
                value={dish.fat_g}
                onChange={(v) => updateDish(i, 'fat_g', v)}
              />
              <NumberField
                label="Углеводы"
                unit="г"
                step={0.1}
                value={dish.carbs_g}
                onChange={(v) => updateDish(i, 'carbs_g', v)}
              />
              <NumberField
                label="Клетчатка"
                unit="г"
                step={0.1}
                value={dish.fiber_g}
                onChange={(v) => updateDish(i, 'fiber_g', v)}
              />
              <NumberField
                label="Сахар"
                unit="г"
                step={0.1}
                value={dish.sugar_g}
                onChange={(v) => updateDish(i, 'sugar_g', v)}
              />
              <NumberField
                label="Вода"
                unit="мл"
                value={dish.water_ml}
                onChange={(v) => updateDish(i, 'water_ml', Math.round(v))}
              />
            </div>
          </div>
        ))}
      </div>

      <NutritionTable rows={totalRows} />

      {result.ask_user && result.portion_note && (
        <p
          className="mt-2.5 px-1 text-center text-xs leading-relaxed"
          style={{ color: theme.hint_color }}
        >
          ⚠️ {result.portion_note}
        </p>
      )}
    </ModalWindow>
  );
};
