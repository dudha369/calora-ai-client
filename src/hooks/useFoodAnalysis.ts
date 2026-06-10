import { useState, useEffect } from "react";
import { decodeBarcode } from "../utils/decodeBarcode";
import { fetchProductByBarcode } from "../api/openfoodfacts";
import { food, type FoodAnalysisResult } from "../api/food";
import type { ProductData } from "../types/productData";

// ── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Конвертирует data URL (результат FileReader / canvas.toDataURL) в File
 * для отправки через multipart/form-data.
 */
function dataUrlToFile(dataUrl: string, filename = "photo.jpg"): File {
  const [header, b64] = dataUrl.split(",");
  const mime = header.match(/:(.*?);/)?.[1] ?? "image/jpeg";
  const bytes = Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
  return new File([bytes], filename, { type: mime });
}

// ── State machine ─────────────────────────────────────────────────────────────

export type AnalysisStatus =
  | { kind: "idle" }
  | { kind: "analyzing" }
  | { kind: "barcode"; product: ProductData | null }
  | { kind: "food"; result: FoodAnalysisResult }
  | { kind: "error"; message: string };

// ── Hook ──────────────────────────────────────────────────────────────────────

/**
 * Запускает анализ автоматически при смене photo.
 *
 * Порядок анализа:
 *   1. Декодируем штрихкод в браузере (zxing + BarcodeDetector) — без сети.
 *   2. Если штрихкод найден → запрос к OpenFoodFacts.
 *   3. Иначе → data URL → File → POST /api/food/analyze (Gemini Vision).
 *
 * Локальная переменная `cancelled` гарантирует отсутствие set-state после
 * размонтирования или смены photo (race condition).
 */
export function useFoodAnalysis(photo: string | null): AnalysisStatus {
  const [status, setStatus] = useState<AnalysisStatus>({ kind: "idle" });

  useEffect(() => {
    if (!photo) {
      setStatus({ kind: "idle" });
      return;
    }

    let cancelled = false;
    setStatus({ kind: "analyzing" });

    (async () => {
      try {
        // Шаг 1: штрихкод — CPU-only, быстро
        const barcode = await decodeBarcode(photo);
        if (cancelled) return;

        if (barcode) {
          const product = await fetchProductByBarcode(barcode);
          if (!cancelled) setStatus({ kind: "barcode", product });
          return;
        }

        // Шаг 2: AI анализ через бэкенд
        const file = dataUrlToFile(photo);
        const { data } = await food.analyze(file);
        if (!cancelled) setStatus({ kind: "food", result: data });
      } catch (err) {
        if (cancelled) return;
        setStatus({
          kind: "error",
          message:
            err instanceof Error
              ? err.message
              : "Не удалось проанализировать фото. Попробуй ещё раз.",
        });
      }
    })();

    // Cleanup отменяет все pending setState — важно при быстрой смене фото
    return () => {
      cancelled = true;
    };
  }, [photo]);

  return status;
}
