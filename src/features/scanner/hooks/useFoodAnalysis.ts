import axios from 'axios';
import { useState, useEffect, useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { decodeBarcode } from '../lib/decodeBarcode';
import { fetchProductByBarcode } from '../lib/openfoodfacts';
import { food } from '@/shared/api/food';
import { compressImage } from '../lib/compressImage';
import type { FoodAnalyzeResponse } from '@/shared/types/api/food';
import type { ProductData } from '../types/productData';

function dataUrlToFile(dataUrl: string, filename = 'photo.jpg'): File {
  const [header, b64] = dataUrl.split(',');
  const mime = header.match(/:(.*?);/)?.[1] ?? 'image/jpeg';
  const bytes = Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
  return new File([bytes], filename, { type: mime });
}

function extractErrorDetail(err: unknown): string | undefined {
  if (axios.isAxiosError(err)) {
    return err.response?.data?.detail;
  }
  if (err && typeof err === 'object' && 'detail' in err) {
    return (err as { detail?: string }).detail;
  }
  return undefined;
}

function isNoFoodDetected(err: unknown): boolean {
  return extractErrorDetail(err) === 'no_food_detected';
}

function resolveErrorMessage(err: unknown): string {
  if (isNoFoodDetected(err)) {
    return 'На фотографии не найдена еда. Убедитесь, что продукт в кадре, и попробуйте ещё раз.';
  }
  if (err instanceof Error) return err.message;
  return 'Не удалось проанализировать фото. Попробуй ещё раз.';
}

export type AnalysisStatus =
  | { kind: 'idle' }
  | { kind: 'recognizing' }
  | { kind: 'barcode'; product: ProductData }
  | { kind: 'ready' }
  | { kind: 'analyzing' }
  | { kind: 'food'; result: FoodAnalyzeResponse }
  | { kind: 'error'; message: string; isNoFood: boolean };

export interface UseFoodAnalysisReturn {
  status: AnalysisStatus;
  runAnalysis: (notes?: string) => void;
  retry: () => void;
  pendingNotes: string | undefined;
}

/**
 * detectBarcode — пытаться ли локально декодировать штрихкод из снимка перед
 * AI-анализом. true только для mode==='barcode' — обычное фото еды больше не
 * пытается искать штрихкод (раньше искало всегда, независимо от режима).
 */
export function useFoodAnalysis(
  photo: string | null,
  detectBarcode: boolean = true,
): UseFoodAnalysisReturn {
  const { i18n } = useTranslation();
  const [status, setStatus] = useState<AnalysisStatus>({ kind: 'idle' });
  const requestIdRef = useRef(0);
  const lastNotesRef = useRef<string | undefined>(undefined);

  useEffect(() => {
    const requestId = ++requestIdRef.current;

    if (!photo) {
      setStatus({ kind: 'idle' });
      return;
    }

    if (!detectBarcode) {
      setStatus({ kind: 'ready' });
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
        }

        setStatus({ kind: 'ready' });
      } catch {
        if (requestIdRef.current === requestId) setStatus({ kind: 'ready' });
      }
    })();
  }, [photo, detectBarcode]);

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
          const { data } = await food.analyze(file, notes, i18n.language);
          if (requestIdRef.current === requestId) {
            setStatus({ kind: 'food', result: data });
          }
        } catch (err) {
          if (requestIdRef.current === requestId) {
            setStatus({
              kind: 'error',
              message: resolveErrorMessage(err),
              isNoFood: isNoFoodDetected(err),
            });
          }
        }
      })();
    },
    [photo, i18n.language],
  );

  const retry = useCallback(() => {
    runAnalysis(lastNotesRef.current);
  }, [runAnalysis]);

  return { status, runAnalysis, retry, pendingNotes: lastNotesRef.current };
}
