import axios from 'axios';
import { useState, useEffect, useCallback, useRef } from 'react';
import { decodeBarcode } from '../lib/decodeBarcode';
import { fetchProductByBarcode } from '../lib/openfoodfacts';
import { food } from '@/shared/api/food';
import { compressImage } from '../lib/compressImage';
import type { FoodAnalyzeResponse } from '@/shared/types/api/food';
import type { ProductData } from '../types/productData';

// ── Helpers ───────────────────────────────────────────────────────────────────

function dataUrlToFile(dataUrl: string, filename = 'photo.jpg'): File {
  const [header, b64] = dataUrl.split(',');
  const mime = header.match(/:(.*?);/)?.[1] ?? 'image/jpeg';
  const bytes = Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
  return new File([bytes], filename, { type: mime });
}

function resolveErrorMessage(err: unknown): string {
  let detail: string | undefined;

  if (axios.isAxiosError(err)) {
    detail = err.response?.data?.detail;
  } else if (err && typeof err === 'object' && 'detail' in err) {
    detail = (err as { detail?: string }).detail;
  }

  if (detail === 'no_food_detected') {
    return 'На фотографии не найдена еда. Убедитесь, что продукт в кадре, и попробуйте ещё раз.';
  }
  if (err instanceof Error) return err.message;
  return 'Не удалось проанализировать фото. Попробуй ещё раз.';
}

// ── State machine ─────────────────────────────────────────────────────────────

export type AnalysisStatus =
  | { kind: 'idle' }
  /** Локальное декодирование штрихкода + (если найден) запрос в OpenFoodFacts */
  | { kind: 'recognizing' }
  | { kind: 'barcode'; product: ProductData }
  /** Штрихкода нет (или он не найден в OFF) — ждём подтверждения/уточнения перед ИИ */
  | { kind: 'ready' }
  | { kind: 'analyzing' }
  | { kind: 'food'; result: FoodAnalyzeResponse }
  | { kind: 'error'; message: string };

export interface UseFoodAnalysisReturn {
  status: AnalysisStatus;
  /** Запускает ИИ-анализ с опциональным уточнением пользователя. */
  runAnalysis: (notes?: string) => void;
  /** Повторяет последний анализ с тем же фото и теми же notes —
   *  для кнопки "Попробовать снова" при ошибке (например 503 от Gemini),
   *  без необходимости переснимать фото и заново вводить уточнение. */
  retry: () => void;
}

/**
 * Детектирование запускается автоматически при появлении фото:
 *   1. Локальное декодирование штрихкода (zxing + BarcodeDetector) — без сети.
 *   2. Если штрихкод найден → запрос к OpenFoodFacts.
 *      - продукт найден  → status 'barcode', поток завершён.
 *      - не найден в OFF → шаг 3, как при отсутствии штрихкода вовсе.
 *   3. Совпадения нет → status 'ready'. Сам вызов ИИ НЕ запускается
 *      автоматически — ScannerPage показывает поле уточнения и вызывает
 *      runAnalysis() только когда пользователь подтвердит или пропустит его.
 *
 * requestIdRef — «номер поколения» запроса: и авто-детект, и runAnalysis
 * увеличивают его перед стартом и сверяют перед записью результата в state.
 * Так одной примитивной защитой закрываются обе гонки: смена фото
 * посреди детекта и повторный вызов runAnalysis поверх ещё не
 * завершившегося предыдущего вызова.
 */
export function useFoodAnalysis(photo: string | null): UseFoodAnalysisReturn {
  const [status, setStatus] = useState<AnalysisStatus>({ kind: 'idle' });
  const requestIdRef = useRef(0);
  const lastNotesRef = useRef<string | undefined>(undefined);

  useEffect(() => {
    const requestId = ++requestIdRef.current;

    if (!photo) {
      setStatus({ kind: 'idle' });
      return;
    }

    setStatus({ kind: 'recognizing' });

    (async () => {
      try {
        const barcode = await decodeBarcode(photo);
        if (requestIdRef.current !== requestId) return;

        if (barcode) {
          const product = await fetchProductByBarcode(barcode);
          if (requestIdRef.current !== requestId) return;
          if (product) {
            setStatus({ kind: 'barcode', product });
            return;
          }
          // Штрихкод есть, но продукта нет в OFF — отдаём фото ИИ ниже.
        }

        setStatus({ kind: 'ready' });
      } catch {
        // Сбой декодирования/OFF — не блокируем пользователя ошибкой,
        // просто отдаём фото на ИИ-анализ как обычное фото еды.
        if (requestIdRef.current === requestId) setStatus({ kind: 'ready' });
      }
    })();
  }, [photo]);

  const runAnalysis = useCallback(
    (notes?: string) => {
      if (!photo) return;
      lastNotesRef.current = notes;
      const requestId = ++requestIdRef.current;
      setStatus({ kind: 'analyzing' });

      (async () => {
        try {
          const compressed = await compressImage(photo);
          const file = dataUrlToFile(compressed);
          const { data } = await food.analyze(file, notes);
          if (requestIdRef.current === requestId) {
            setStatus({ kind: 'food', result: data });
          }
        } catch (err) {
          if (requestIdRef.current === requestId) {
            setStatus({ kind: 'error', message: resolveErrorMessage(err) });
          }
        }
      })();
    },
    [photo],
  );

  const retry = useCallback(() => {
    runAnalysis(lastNotesRef.current);
    }, [runAnalysis]);

  return { status, runAnalysis, retry };
}
