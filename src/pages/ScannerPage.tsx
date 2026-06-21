import { useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';

import { useScannerCapture } from '../hooks/useScannerCapture';
import { useFoodAnalysis } from '../hooks/useFoodAnalysis';
import { useBackButton } from '../hooks/useBackButton';
import { useTheme } from '../context/ThemeContext';

import { CameraView } from '../components/CameraView';
import { BarcodeResultModal } from '../components/BarcodeResultModal';
import { FoodResultModal } from '../components/FoodResultModal';
import { FoodNotesSheet } from '../components/FoodNotesSheet';
import { ModalWindow } from '../components/ModalWindow';

import { food, todayApiDate } from '../api/food';
import type { ProductData } from '../types/productData';
import type { AnalyzedDish } from '../interfaces/api/food';

interface ScannerLocationState {
  photo?: string;
}

export const ScannerPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const theme = useTheme();

  const state = location.state as ScannerLocationState | null;

  const { photo, clearPhoto, handleFileChange, camera } = useScannerCapture(
    state?.photo ?? null,
  );

  const { status, runAnalysis } = useFoodAnalysis(photo);

  const pendingPhotoKeyRef = useRef<string | null>(null);

  useEffect(() => {
    if (status.kind === 'food') {
      pendingPhotoKeyRef.current = status.result.photo_key;
    }
  }, [status]);

  useEffect(() => {
    return () => {
      const key = pendingPhotoKeyRef.current;
      if (key) {
        food.deleteOrphanPhoto(key).catch(() => {
          // Молчаливый fail — фото останется в B2, но это некритично.
          // Периодический cleanup job решит это на уровне инфраструктуры.
        });
      }
    };
  }, []);

  const deleteOrphanAndClose = (photoKey: string | null | undefined) => {
    if (photoKey) {
      food.deleteOrphanPhoto(photoKey).catch(() => {});
    }
    pendingPhotoKeyRef.current = null;
    clearPhoto();
  };

  useBackButton(clearPhoto, !!photo);

  const invalidateLoggedQueries = (hadWater: boolean) => {
    const date = todayApiDate();
    queryClient.invalidateQueries({ queryKey: ['food', date] });
    queryClient.invalidateQueries({ queryKey: ['stats', 'daily', date] });
    queryClient.invalidateQueries({ queryKey: ['stats', 'active-dates'] });
    if (hadWater) {
      queryClient.invalidateQueries({ queryKey: ['water', date] });
    }
  };

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
          fiber_g: Number(((p.fiber ?? 0) * factor).toFixed(1)),
          sugar_g: Number(((p.sugars ?? 0) * factor).toFixed(1)),
        },
      ],
    });

    invalidateLoggedQueries(false);
    clearPhoto();
    navigate('/');
  };

  const handleFoodConfirm = async (dishes: AnalyzedDish[]) => {
    if (status.kind !== 'food') return;
    pendingPhotoKeyRef.current = null;

    const totalWaterMl = dishes.reduce((sum, d) => sum + d.water_ml, 0);

    await food.log({
      log_date: todayApiDate(),
      items: dishes.map((dish) => ({
        food_name: dish.name,
        portion_g: dish.portion_g,
        calories: dish.calories,
        protein_g: dish.protein_g,
        fat_g: dish.fat_g,
        carbs_g: dish.carbs_g,
        fiber_g: dish.fiber_g,
        sugar_g: dish.sugar_g,
      })),
      photo_key: status.result.photo_key,
      water_ml: totalWaterMl > 0 ? totalWaterMl : undefined,
    });

    invalidateLoggedQueries(totalWaterMl > 0);
    clearPhoto();
    navigate('/');
  };

  const handleRetry = () => {
    clearPhoto();
    if (camera.method === 'input') {
      camera.openInputCamera();
    }
  };

  return (
    <>
      <CameraView
        camera={camera}
        photo={photo}
        onFileChange={handleFileChange}
      />

      {status.kind === 'detecting' && (
        <div
          className="absolute inset-x-4 bottom-6 z-10 rounded-2xl py-3 text-center text-sm font-medium backdrop-blur-sm"
          style={{
            backgroundColor: `${theme.bg_color}CC`,
            color: theme.text_color,
          }}
        >
          Распознаём…
        </div>
      )}

      {status.kind === 'ready' && <FoodNotesSheet onSubmit={runAnalysis} />}

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
          onClose={() => deleteOrphanAndClose(status.result.photo_key)}
        />
      )}

      {status.kind === 'error' && (
        <ModalWindow
          title="Ошибка"
          onClose={clearPhoto}
          actionLabel="Попробовать снова"
          iconCustomEmojiId="5260687119092817530"
          onAction={handleRetry}
        >
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
