import { useLocation, useNavigate } from "react-router-dom";

import { food, todayApiDate, type FoodAnalysisResult } from "../api/food";
import type { ProductData } from "../types/productData";

import { useBackButton } from "../hooks/useBackButton";
import { useTheme } from "../context/ThemeContext";

import { useFoodAnalysis } from "../hooks/useFoodAnalysis";
import { useScannerCapture } from "../hooks/useScannerCapture";

import { CameraView } from "../components/CameraView";
import { BarcodeResultModal } from "../components/BarcodeResultModal";
import { FoodResultModal } from "../components/FoodResultModal";
import { LoadingScreen } from "../components/loading/LoadingScreen";

// ── Helpers ───────────────────────────────────────────────────────────────────

const round1 = (n: number) => Math.round(n * 10) / 10;

/**
 * Конвертирует продукт из OpenFoodFacts в payload для /api/food/log.
 * Пересчёт всегда из per100g — это единственный гарантированно присутствующий
 * набор нутриентов.
 */
function productToLogItems(product: ProductData, portionG: number) {
  const factor = portionG / 100;
  const p = product.per100g;
  return [
    {
      food_name: product.name,
      portion_g: portionG,
      calories:  Math.round((p.calories  ?? 0) * factor),
      protein_g: round1((p.protein  ?? 0) * factor),
      fat_g:     round1((p.fat      ?? 0) * factor),
      carbs_g:   round1((p.carbs    ?? 0) * factor),
    },
  ];
}

// ── Component ─────────────────────────────────────────────────────────────────

/**
 * ScannerPage — оркестратор страницы сканирования.
 *
 * Намеренно не содержит UI-разметки: всё вынесено в специализированные
 * компоненты и хуки. Единственная ответственность — связать их вместе
 * и обработать бизнес-события (подтверждение записи).
 *
 * Структура:
 *   useScannerCapture → управляет photo + камерой
 *   useFoodAnalysis   → запускает анализ при изменении photo
 *   CameraView        → рендерит видео / фото
 *   *ResultModal      → рендерит результат анализа
 */
export const ScannerPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const theme = useTheme();

  // iOS передаёт фото через router state; stream-режим управляет photo сам
  const routerPhoto =
    (location.state as { photo?: string } | null)?.photo ?? null;

  const { photo, clearPhoto, handleFileChange, camera } =
    useScannerCapture(routerPhoto);

  const analysisStatus = useFoodAnalysis(photo);

  // BackButton: если есть фото → retake; иначе скрыт (стандартная навигация)
  useBackButton(clearPhoto, !!photo);

  // ── Confirm: штрихкод ──────────────────────────────────────────────────────
  const handleConfirmBarcode = async (product: ProductData, portionG: number) => {
    await food.createLog({
      log_date: todayApiDate(),
      items: productToLogItems(product, portionG),
      photo_key: null,
    });
    navigate("/", { replace: true });
  };

  // ── Confirm: AI-анализ ─────────────────────────────────────────────────────
  const handleConfirmFood = async (result: FoodAnalysisResult) => {
    await food.createLog({
      log_date: todayApiDate(),
      items: result.dishes.map((d) => ({
        food_name: d.name,
        portion_g: d.portion_g,
        calories:  d.calories,
        protein_g: d.protein_g,
        fat_g:     d.fat_g,
        carbs_g:   d.carbs_g,
      })),
      photo_key: result.photo_key,
    });
    navigate("/", { replace: true });
  };

  // ─────────────────────────────────────────────────────────────────────────────

  return (
    <div className="relative flex-1 w-full flex flex-col overflow-hidden">
      <CameraView
        camera={camera}
        photo={photo}
        onFileChange={handleFileChange}
      />

      {/* Оверлей анализа: LoadingScreen размывает фон, пока идёт запрос */}
      {analysisStatus.kind === "analyzing" && photo && <LoadingScreen />}

      {/* Ошибка анализа */}
      {analysisStatus.kind === "error" && (
        <div
          className="absolute bottom-6 left-4 right-4 z-20 rounded-2xl p-4 text-sm text-center"
          style={{
            backgroundColor: `${theme.destructive_text_color}18`,
            color: theme.destructive_text_color,
          }}
        >
          <p>{analysisStatus.message}</p>
          <button
            onClick={clearPhoto}
            className="mt-2 underline text-sm"
            style={{ color: theme.destructive_text_color }}
          >
            Сфотографировать ещё раз
          </button>
        </div>
      )}

      {/* Результат штрихкода */}
      {analysisStatus.kind === "barcode" && (
        <BarcodeResultModal
          product={analysisStatus.product}
          onConfirm={handleConfirmBarcode}
          onClose={clearPhoto}
        />
      )}

      {/* Результат AI-анализа */}
      {analysisStatus.kind === "food" && (
        <FoodResultModal
          result={analysisStatus.result}
          onConfirm={handleConfirmFood}
          onClose={clearPhoto}
        />
      )}
    </div>
  );
};
