import { useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';

import { useScannerCapture } from '../hooks/useScannerCapture';
import { useFoodAnalysis } from '../hooks/useFoodAnalysis';
import { useBackButton } from '@/shared/hooks/useBackButton';
import { useTheme } from '@/shared/context/ThemeContext';

import { CameraView } from '../components/CameraView';
import { BarcodeResultModal } from '../components/BarcodeResultModal';
import { FoodResultModal } from '../components/FoodResultModal';
import { FoodNotesSheet } from '../components/FoodNotesSheet';
import { BottomSheet } from '@/shared/ui/BottomSheet';

import { food, todayApiDate } from '@/shared/api/food';
import type { ProductData } from '../types/productData';
import type { AnalyzedDish } from '@/shared/types/api/food';
import { useScanner } from '../hooks/useScanner';
import { useTranslation } from 'react-i18next';

interface ScannerLocationState {
  photo?: string;
}

type TgOrient = {
  lockOrientation?: () => void;
  unlockOrientation?: () => void;
};
const getTg = (): TgOrient | null =>
  (window as { Telegram?: { WebApp?: TgOrient } }).Telegram?.WebApp ?? null;

export const ScannerPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { t } = useTranslation('scanner_page');
  const theme = useTheme();

  const state = location.state as ScannerLocationState | null;

  const { photo, clearPhoto, handleFileChange, camera } = useScannerCapture(
    state?.photo ?? null,
  );

  const { status, runAnalysis, retry, pendingNotes } = useFoodAnalysis(photo);

  // ── Ориентация зависит от состояния (сканирование vs результат) ──────────
  useEffect(() => {
    if (photo === null) {
      document.body.setAttribute('data-page', 'scanner');
      getTg()?.unlockOrientation?.();
      screen.orientation?.unlock?.();
    } else {
      document.body.removeAttribute('data-page');
      getTg()?.lockOrientation?.();
      screen.orientation?.lock?.('portrait').catch(() => null);
    }

    return () => {
      document.body.removeAttribute('data-page');
      getTg()?.lockOrientation?.();
      screen.orientation?.lock?.('portrait').catch(() => null);
    };
  }, [photo]);

  const { setLiveCamera } = useScanner();
  useEffect(() => {
    setLiveCamera(photo === null);
    return () => setLiveCamera(false);
  }, [photo, setLiveCamera]);

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
        food.deleteOrphanPhoto(key).catch(() => {});
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
    queryClient.invalidateQueries({ queryKey: ['user'] });
    if (hadWater) {
      queryClient.invalidateQueries({ queryKey: ['water', date] });
    }
  };

  const handleBarcodeConfirm = async (
    product: ProductData,
    portionG: number,
    includePhoto: boolean,
  ) => {
    const factor = portionG / 100;
    const p = product.per100g;
    const waterMl =
      product.waterFractionPer100g != null
        ? Math.round(portionG * product.waterFractionPer100g)
        : 0;

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
          water_ml: waterMl,
        },
      ],
      photo_key: includePhoto ? (product.imageUrl ?? undefined) : undefined,
    });

    invalidateLoggedQueries(false);

    navigate('/');
  };

  const handleFoodConfirm = async (
    dishes: AnalyzedDish[],
    mealName: string,
    includePhoto: boolean,
  ) => {
    if (status.kind !== 'food') return;
    pendingPhotoKeyRef.current = null;

    if (!includePhoto && status.result.photo_key) {
      food.deleteOrphanPhoto(status.result.photo_key).catch(() => {});
    }

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
        water_ml: dish.water_ml,
      })),
      photo_key: includePhoto ? status.result.photo_key : undefined,
      meal_name: mealName || undefined,
      water_ml: totalWaterMl > 0 ? totalWaterMl : undefined,
    });

    invalidateLoggedQueries(totalWaterMl > 0);

    navigate('/');
  };

  return (
    <>
      <CameraView
        camera={camera}
        photo={photo}
        onFileChange={handleFileChange}
      />

      {status.kind === 'recognizing' && (
        <div
          className="absolute inset-x-4 bottom-6 z-10 rounded-2xl py-3 text-center text-sm font-medium backdrop-blur-sm"
          style={{
            backgroundColor: `${theme.bg_color}CC`,
            color: theme.text_color,
          }}
        >
          {t('recognizing')}
        </div>
      )}

      {(status.kind === 'ready' || status.kind === 'analyzing') && (
        <FoodNotesSheet
          onSubmit={runAnalysis}
          onClose={clearPhoto}
          isProcessing={status.kind === 'analyzing'}
          initialNotes={status.kind === 'analyzing' ? pendingNotes : undefined}
        />
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
          photo={photo}
          onConfirm={handleFoodConfirm}
          onClose={() => deleteOrphanAndClose(status.result.photo_key)}
        />
      )}

      {status.kind === 'error' && (
        <BottomSheet
          title={t('error')}
          onClose={clearPhoto}
          actionLabel={t('try_again')}
          iconCustomEmojiId="5260687119092817530"
          // "Еда не найдена" — это не сбой, а сигнал переснять фото:
          // retry с тем же кадром бессмысленен, ведём на камеру заново.
          onAction={status.isNoFood ? clearPhoto : retry}
        >
          <p
            className="py-2 text-center text-sm"
            style={{ color: theme.subtitle_text_color }}
          >
            {status.message}
          </p>
        </BottomSheet>
      )}
    </>
  );
};
