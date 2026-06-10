import { useState } from "react";
import { ModalWindow } from "./ModalWindow";
import { NutritionTable, type NutritionRow } from "./NutritionTable";
import type { ProductData } from "../types/productData";
import { useTheme } from "../context/ThemeContext";

interface BarcodeResultModalProps {
  product: ProductData | null;
  onConfirm: (product: ProductData, portionG: number) => Promise<void>;
  onClose: () => void;
}

const DEFAULT_PORTION_G = 100;

/** Пересчитывает нутриент из per100g на заданный вес */
const scale = (value: number | null, factor: number): string => {
  if (value == null) return "—";
  return `${(value * factor).toFixed(1).replace(/\.0$/, "")}`;
};

/**
 * Модальное окно результата сканирования штрихкода.
 *
 * Позволяет задать порцию вручную — КБЖУ пересчитывается в реальном времени
 * из данных per100g. Кнопка «1 порция» подставляет servingSizeG из OFF.
 *
 * isConfirming — локальный стейт: модал сам управляет своим loading-состоянием,
 * родителю не нужно знать об этой детали.
 */
export const BarcodeResultModal = ({
                                     product,
                                     onConfirm,
                                     onClose,
                                   }: BarcodeResultModalProps) => {
  const theme = useTheme();
  const [portionG, setPortionG] = useState(
    product?.servingSizeG ?? DEFAULT_PORTION_G,
  );
  const [isConfirming, setIsConfirming] = useState(false);

  const handleConfirm = async () => {
    if (!product) return;
    setIsConfirming(true);
    try {
      await onConfirm(product, portionG);
    } finally {
      setIsConfirming(false);
    }
  };

  // Продукт не найден в базе — показываем упрощённый вариант
  if (!product) {
    return (
      <ModalWindow title="Штрихкод найден" onClose={onClose}>
        <p
          className="text-sm text-center mt-3 mb-1"
          style={{ color: theme.hint_color }}
        >
          Продукт не найден в базе Open Food Facts.
          <br />
          Попробуй добавить блюдо вручную.
        </p>
      </ModalWindow>
    );
  }

  const factor = portionG / 100;
  const p = product.per100g;

  const rows: NutritionRow[] = [
    { label: "Калории",   value: `${Math.round((p.calories ?? 0) * factor)} ккал`, primary: true },
    { label: "Белки",     value: `${scale(p.protein, factor)} г` },
    { label: "Жиры",      value: `${scale(p.fat, factor)} г` },
    { label: "Углеводы",  value: `${scale(p.carbs, factor)} г` },
  ];

  return (
    <ModalWindow
      title="Продукт найден"
      onClose={onClose}
      actionLabel="Добавить в дневник"
      onAction={handleConfirm}
      isProcessing={isConfirming}
    >
      {/* Название и бренд */}
      <p
        className="text-sm font-medium text-center mt-1"
        style={{ color: theme.text_color }}
      >
        {product.name}
      </p>
      {product.brand && (
        <p className="text-xs text-center" style={{ color: theme.hint_color }}>
          {product.brand}
        </p>
      )}

      {/* Поле порции */}
      <div className="flex items-center gap-2 mt-3">
        <span className="text-sm shrink-0" style={{ color: theme.hint_color }}>
          Порция:
        </span>

        <div className="relative flex-1">
          <input
            type="number"
            inputMode="numeric"
            value={portionG}
            min={1}
            onChange={(e) =>
              setPortionG(Math.max(1, Math.round(Number(e.target.value))))
            }
            className="w-full py-2 pl-3 pr-7 rounded-xl text-sm outline-none"
            style={{
              backgroundColor: theme.secondary_bg_color,
              color: theme.text_color,
            }}
          />
          <span
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs pointer-events-none"
            style={{ color: theme.hint_color }}
          >
            г
          </span>
        </div>

        {/* Кнопка «1 порция» — если OFF знает размер порции */}
        {product.servingSizeG != null && (
          <button
            onClick={() => setPortionG(product.servingSizeG!)}
            className="shrink-0 px-2.5 py-1.5 rounded-xl text-xs font-medium"
            style={{
              backgroundColor: `${theme.button_color}20`,
              color: theme.button_color,
            }}
          >
            {product.servingSizeStr ?? `${product.servingSizeG} г`}
          </button>
        )}
      </div>

      <NutritionTable rows={rows} />
    </ModalWindow>
  );
};