import { useNavigate, useLocation } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';

import { useScannerCapture } from '../hooks/useScannerCapture';
import { useFoodAnalysis } from '../hooks/useFoodAnalysis';
import { useBackButton } from '../hooks/useBackButton';
import { useTheme } from '../context/ThemeContext';

import { CameraView } from '../components/CameraView';
import { BarcodeResultModal } from '../components/BarcodeResultModal';
import { FoodResultModal } from '../components/FoodResultModal';
import { ModalWindow } from '../components/ModalWindow';

import { food, todayApiDate } from '../api/food';
import type { ProductData } from '../types/productData';
import type { FoodAnalyzeResponse } from '../interfaces/api/food';

interface ScannerLocationState {
  photo?: string;
}

export const ScannerPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const theme = useTheme();

  const state = location.state as ScannerLocationState | null;

  // Захват фото (камера/файл) — вся логика уже инкапсулирована в хуке
  const { photo, clearPhoto, handleFileChange, camera } = useScannerCapture(
    state?.photo ?? null,
  );

  // Анализ фото: штрихкод → OpenFoodFacts, иначе → POST /api/food/analyze (Gemini)
  const status = useFoodAnalysis(photo);

  useBackButton(clearPhoto, !!photo);

  const invalidateFoodQueries = () => {
    const date = todayApiDate();
    queryClient.invalidateQueries({ queryKey: ['food', date] });
    queryClient.invalidateQueries({ queryKey: ['stats', 'daily', date] });
    queryClient.invalidateQueries({ queryKey: ['stats', 'active-dates'] });
  };

  /** Подтверждение находки по штрихкоду → POST /api/food/log-barcode */
  const handleBarcodeConfirm = async (
    product: ProductData,
    portionG: number,
  ) => {
    const factor = portionG / 100;
    const p = product.per100g;

    await food.logBarcode({
      log_date: todayApiDate(),
      items: [
        {
          food_name: product.name,
          portion_g: portionG,
          calories: Math.round((p.calories ?? 0) * factor),
          protein_g: Number(((p.protein ?? 0) * factor).toFixed(1)),
          fat_g: Number(((p.fat ?? 0) * factor).toFixed(1)),
          carbs_g: Number(((p.carbs ?? 0) * factor).toFixed(1)),
        },
      ],
    });

    invalidateFoodQueries();
    clearPhoto();
    navigate('/');
  };

  /** Подтверждение результата AI-анализа → POST /api/food/log */
  const handleFoodConfirm = async (result: FoodAnalyzeResponse) => {
    await food.log({
      log_date: todayApiDate(),
      items: result.dishes.map((dish) => ({
        food_name: dish.name,
        portion_g: dish.portion_g,
        calories: dish.calories,
        protein_g: dish.protein_g,
        fat_g: dish.fat_g,
        carbs_g: dish.carbs_g,
      })),
      photo_key: result.photo_key,
    });

    invalidateFoodQueries();
    clearPhoto();
    navigate('/');
  };

  return (
    <>
      <CameraView
        camera={camera}
        photo={photo}
        onFileChange={handleFileChange}
      />

      {status.kind === 'analyzing' && (
        <div
          className="absolute inset-x-4 bottom-6 z-10 rounded-2xl py-3 text-center text-sm font-medium backdrop-blur-sm"
          style={{
            backgroundColor: `${theme.bg_color}CC`,
            color: theme.text_color,
          }}
        >
          Анализируем фото…
        </div>
      )}

      {status.kind === 'barcode' && (
        <BarcodeResultModal
          product={status.product}
          onConfirm={handleBarcodeConfirm}
          onClose={clearPhoto}
        />
      )}

      {status.kind === 'food' && (
        <FoodResultModal
          result={status.result}
          onConfirm={handleFoodConfirm}
          onClose={clearPhoto}
        />
      )}

      {status.kind === 'error' && (
        <ModalWindow title="Ошибка" onClose={clearPhoto}>
          <p
            className="py-2 text-center text-sm"
            style={{ color: theme.subtitle_text_color }}
          >
            {status.message}
          </p>
        </ModalWindow>
      )}
    </>
  );
};
