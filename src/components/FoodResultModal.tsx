import { useState } from 'react';
import { ModalWindow } from './ModalWindow';
import { NutritionTable, type NutritionRow } from './NutritionTable';
import type { FoodAnalyzeResponse } from '../interfaces/api/food';
import { useTheme } from '../context/ThemeContext';

interface FoodResultModalProps {
  result: FoodAnalyzeResponse;
  onConfirm: (result: FoodAnalyzeResponse) => Promise<void>;
  onClose: () => void;
}

const fmt = (n: number) => n.toFixed(1).replace(/\.0$/, '');

/**
 * Модальное окно результата AI-анализа еды.
 *
 * Отображает:
 *   • список распознанных блюд (если их несколько)
 *   • итоговые КБЖУ
 *   • предупреждение ask_user — если Gemini не уверен в порции
 *
 * Логика подтверждения инкапсулирована внутри: родитель получает событие
 * только после успешного нажатия «Добавить».
 */
export const FoodResultModal = ({
  result,
  onConfirm,
  onClose,
}: FoodResultModalProps) => {
  const theme = useTheme();
  const [isConfirming, setIsConfirming] = useState(false);

  const handleConfirm = async () => {
    setIsConfirming(true);
    try {
      await onConfirm(result);
    } finally {
      setIsConfirming(false);
    }
  };

  const totalRows: NutritionRow[] = [
    {
      label: 'Итого калорий',
      value: `${result.total.calories} ккал`,
      primary: true,
    },
    { label: 'Белки', value: `${fmt(result.total.protein_g)} г` },
    { label: 'Жиры', value: `${fmt(result.total.fat_g)} г` },
    { label: 'Углеводы', value: `${fmt(result.total.carbs_g)} г` },
  ];

  const hasManyDishes = result.dishes.length > 1;

  return (
    <ModalWindow
      title="Оценка блюда"
      onClose={onClose}
      actionLabel="Добавить"
      iconCustomEmojiId="5260416304224936047"
      onAction={handleConfirm}
      isProcessing={isConfirming}
    >
      {/* Список блюд (только если несколько — иначе избыточно) */}
      {hasManyDishes && (
        <div className="flex flex-col gap-0.5">
          {result.dishes.map((dish, i) => (
            <div
              key={i}
              className="flex items-center justify-between px-1 py-0.5"
            >
              <span
                className="max-w-[60%] truncate text-sm"
                style={{ color: theme.text_color }}
              >
                {dish.name}
              </span>
              <span className="text-xs" style={{ color: theme.hint_color }}>
                {dish.portion_g} г · {dish.calories} ккал
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Одно блюдо — показываем название подзаголовком */}
      {!hasManyDishes && result.dishes[0] && (
        <p
          className="mt-1 text-center text-sm"
          style={{ color: theme.hint_color }}
        >
          {result.dishes[0].name} · {result.dishes[0].portion_g} г
        </p>
      )}

      <NutritionTable rows={totalRows} />

      {/* Предупреждение о низкой уверенности Gemini */}
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
