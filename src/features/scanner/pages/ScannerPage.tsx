import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';

import { useScannerCapture } from '../hooks/useScannerCapture';
import { useFoodAnalysis } from '../hooks/useFoodAnalysis';
import { useBackButton } from '@/shared/hooks/useBackButton';
import { useTheme } from '@/shared/context/ThemeContext';

import { CameraView } from '../components/CameraView';
import { LiveBarcodeScanner } from '../components/LiveBarcodeScanner';
import { ManualCameraBarcodeScreen } from '../components/ManualCameraBarcodeScreen';
import { ManualBarcodeSheet } from '../components/ManualBarcodeSheet';
import { BarcodeResultModal } from '../components/BarcodeResultModal';
import { FoodResultModal } from '../components/FoodResultModal';
import { FoodNotesSheet } from '../components/FoodNotesSheet';
import { BottomSheet } from '@/shared/ui/BottomSheet';

import { food, todayApiDate } from '@/shared/api/food';
import { isIOSDevice } from '@/shared/lib/isIOSDevice';
import type { ProductData } from '../types/productData';
import type { ScannerMode } from '../types/ScannerMode';
import type { AnalyzedDish } from '@/shared/types/api/food';
import { useScanner } from '../hooks/useScanner';

interface ScannerLocationState {
  photo?: string;
  mode?: ScannerMode;
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
  const { t: tq } = useTranslation('quick_actions');
  const theme = useTheme();

  const state = location.state as ScannerLocationState | null;
  const mode: ScannerMode = state?.mode ?? 'food';

  const isIOS = useMemo(() => isIOSDevice(), []);
  const useLiveBarcode = mode === 'barcode' && !isIOS;
  const isIOSBarcode = mode === 'barcode' && isIOS;

  const [pickedProduct, setPickedProduct] = useState<ProductData | null>(null);
  const [manualEntryOpen, setManualEntryOpen] = useState(false);

  const { photo, clearPhoto, handleFileChange, camera, capture } =
    useScannerCapture(state?.photo ?? null, !useLiveBarcode);

  const { status, runAnalysis, retry, pendingNotes } = useFoodAnalysis(
    photo,
    mode === 'barcode',
  );

  // "Живая камера" в смысле ориентации/rotation имеет смысл только для
  // фото еды (live-стрим) и живого сканера штрихкода — у iOS-штрихкода нет
  // видео вообще, крутить иконки там незачем.
  const isCameraLive = useLiveBarcode
    ? !pickedProduct
    : isIOSBarcode
      ? false
      : photo === null;

  useEffect(() => {
    if (isCameraLive) {
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
  }, [isCameraLive]);

  const { setLiveCamera, setShutterHandler } = useScanner();
  useEffect(() => {
    setLiveCamera(isCameraLive);
    return () => setLiveCamera(false);
  }, [isCameraLive, setLiveCamera]);

  // FAB играет роль затвора: живое фото (Android/десктоп) ИЛИ любой из
  // iOS-путей без живого стрима (фото еды, штрихкод) — во всех случаях
  // тап по FAB должен открывать нативную камеру/делать снимок.
  useEffect(() => {
    const isShutterActive = !photo && (mode === 'food' || isIOSBarcode);
    setShutterHandler(isShutterActive ? capture : null);
    return () => setShutterHandler(null);
  }, [mode, isIOSBarcode, photo, capture, setShutterHandler]);

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

  // Для штрихкода (live и iOS) backbutton активен ВСЕГДА на этой странице:
  // есть найденный товар — возвращаемся к сканированию, нет — выходим со
  // страницы совсем. Для фото — как раньше: активен только когда есть снимок.
  useBackButton(
    () => {
      if (pickedProduct) {
        setPickedProduct(null);
        return;
      }
      if (mode === 'barcode') {
        navigate(-1);
        return;
      }
      clearPhoto();
    },
    mode === 'barcode' || !!photo,
  );

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

  const manualEntrySheet = manualEntryOpen && (
    <ManualBarcodeSheet
      onClose={() => setManualEntryOpen(false)}
      onFound={(product) => {
        setManualEntryOpen(false);
        setPickedProduct(product);
      }}
    />
  );

  // ── Живое сканирование штрихкода (Android/десктоп) ────────────────────────
  if (useLiveBarcode) {
    if (pickedProduct) {
      return (
        <BarcodeResultModal
          product={pickedProduct}
          onConfirm={handleBarcodeConfirm}
          onClose={() => setPickedProduct(null)}
        />
      );
    }
    return (
      <>
        <LiveBarcodeScanner
          onProductFound={setPickedProduct}
          onManualEntry={() => setManualEntryOpen(true)}
        />
        {manualEntrySheet}
      </>
    );
  }

  // ── Штрихкод на iOS: нет live-стрима, выбор камера/вручную ────────────────
  if (isIOSBarcode) {
    if (pickedProduct) {
      return (
        <BarcodeResultModal
          product={pickedProduct}
          onConfirm={handleBarcodeConfirm}
          onClose={() => setPickedProduct(null)}
        />
      );
    }
    if (status.kind === 'barcode') {
      return (
        <BarcodeResultModal
          product={status.product}
          onConfirm={handleBarcodeConfirm}
          onClose={clearPhoto}
        />
      );
    }
    if (photo && status.kind === 'ready') {
      // decodeBarcode отработал на снимке и штрихкода не нашёл
      return (
        <BottomSheet
          title={t('error')}
          onClose={clearPhoto}
          actionLabel={t('try_again')}
          onAction={clearPhoto}
          secondaryAction={{
            text: tq('barcode_manual.link'),
            onClick: () => {
              clearPhoto();
              setManualEntryOpen(true);
            },
            position: 'left',
          }}
        >
          <p
            className="py-2 text-center text-sm"
            style={{ color: theme.subtitle_text_color }}
          >
            {tq('barcode_manual.not_found_photo')}
          </p>
        </BottomSheet>
      );
    }
    if (photo) {
      // decodeBarcode ещё выполняется
      return (
        <div className="relative flex w-full flex-1 items-center justify-center bg-black">
          <img
            src={photo}
            className="h-auto w-full object-cover opacity-50"
            alt=""
          />
        </div>
      );
    }
    return (
      <>
        <ManualCameraBarcodeScreen
          camera={camera}
          onFileChange={handleFileChange}
          onManualEntry={() => setManualEntryOpen(true)}
        />
        {manualEntrySheet}
      </>
    );
  }

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
