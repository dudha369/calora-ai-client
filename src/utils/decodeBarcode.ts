import { BrowserMultiFormatReader } from '@zxing/browser';
import { DecodeHintType, BarcodeFormat } from '@zxing/library';

// Только форматы, реально встречающиеся на продуктах питания.
// Меньше форматов → ZXing быстрее и точнее (не тратит время на QR, DataMatrix и т.д.)
const HINTS = new Map<DecodeHintType, unknown>([
  [DecodeHintType.TRY_HARDER, true],
  [
    DecodeHintType.POSSIBLE_FORMATS,
    [
      BarcodeFormat.EAN_13, // основной формат европейских товаров
      BarcodeFormat.EAN_8, // малый EAN (маленькие упаковки)
      BarcodeFormat.UPC_A, // США/Канада
      BarcodeFormat.UPC_E, // сжатый UPC
      BarcodeFormat.CODE_128, // некоторые российские товары
    ],
  ],
]);

// Синглтон: инициализация BrowserMultiFormatReader — дорогая операция,
// переиспользуем один экземпляр на весь жизненный цикл приложения.
const READER = new BrowserMultiFormatReader(HINTS);

/**
 * Создаёт canvas из центрального региона изображения, масштабированного до maxDim.
 * cropFactor=1.0 → вся картинка, cropFactor=0.6 → центральные 60%.
 *
 * Центральный кроп важен: пользователи обычно наводят штрихкод в центр кадра,
 * а полное изображение 4032×3024 после скейла до 1280px даёт штрихкод
 * шириной ~80px — на грани возможностей ZXing.
 */
function buildCanvas(
  img: HTMLImageElement,
  maxDim: number,
  cropFactor = 1,
): HTMLCanvasElement | null {
  const srcW = img.naturalWidth;
  const srcH = img.naturalHeight;
  const cropW = srcW * cropFactor;
  const cropH = srcH * cropFactor;
  const cropX = (srcW - cropW) / 2;
  const cropY = (srcH - cropH) / 2;

  const scale = Math.min(1, maxDim / Math.max(cropW, cropH));
  const outW = Math.round(cropW * scale);
  const outH = Math.round(cropH * scale);

  const canvas = document.createElement('canvas');
  canvas.width = outW;
  canvas.height = outH;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;
  ctx.drawImage(img, cropX, cropY, cropW, cropH, 0, 0, outW, outH);
  return canvas;
}

/**
 * Применяет grayscale + усиление контраста.
 * Штрихкод — чёрно-белый по природе, цветные артефакты мешают ZXing.
 * ctx.filter применяется при отрисовке — без дорогостоящего перебора пикселей.
 */
function withContrast(src: HTMLCanvasElement): HTMLCanvasElement {
  const dst = document.createElement('canvas');
  dst.width = src.width;
  dst.height = src.height;
  const ctx = dst.getContext('2d')!;
  ctx.filter = 'grayscale(1) contrast(1.8)';
  ctx.drawImage(src, 0, 0);
  return dst;
}

function rotateCanvas(
  src: HTMLCanvasElement,
  deg: 90 | 180 | 270,
): HTMLCanvasElement {
  const transposed = deg === 90 || deg === 270;
  const dst = document.createElement('canvas');
  dst.width = transposed ? src.height : src.width;
  dst.height = transposed ? src.width : src.height;
  const ctx = dst.getContext('2d')!;
  ctx.translate(dst.width / 2, dst.height / 2);
  ctx.rotate((deg * Math.PI) / 180);
  ctx.drawImage(src, -src.width / 2, -src.height / 2);
  return dst;
}

async function tryNative(canvas: HTMLCanvasElement): Promise<string | null> {
  if (!('BarcodeDetector' in window)) return null;
  try {
    // BarcodeDetector: поддерживается Chrome Android 83+, Safari 17.0+
    const detector = new (window as any).BarcodeDetector();
    const results: Array<{ rawValue: string }> = await detector.detect(canvas);
    return results[0]?.rawValue ?? null;
  } catch {
    return null;
  }
}

function tryZxing(canvas: HTMLCanvasElement): string | null {
  // EAN-13/UPC обычно горизонтальны; 90° — для телефона в горизонтальной ориентации.
  // 180° добавляем последним — реже нужен, но не стоит игнорировать.
  const variants: HTMLCanvasElement[] = [
    canvas,
    rotateCanvas(canvas, 90),
    rotateCanvas(canvas, 270),
    rotateCanvas(canvas, 180),
  ];
  for (const v of variants) {
    try {
      return READER.decodeFromCanvas(v).getText();
    } catch {
      // ZXing бросает NotFoundException — это ожидаемо, продолжаем
    }
  }
  return null;
}

/** Пробует обнаружить штрихкод на конкретном canvas двумя методами */
async function scanCanvas(canvas: HTMLCanvasElement): Promise<string | null> {
  // Сначала native API (быстро, надёжно, работает без ротаций — сам справляется)
  const r1 = await tryNative(canvas);
  if (r1) return r1;

  // ZXing на оригинале
  const r2 = tryZxing(canvas);
  if (r2) return r2;

  // Обработанное изображение (grayscale + контраст) — для сложного освещения
  const enhanced = withContrast(canvas);
  const r3 = await tryNative(enhanced);
  if (r3) return r3;

  return tryZxing(enhanced);
}

/**
 * Декодирует штрихкод из data URL (результата съёмки камерой).
 *
 * Стратегии пробуются последовательно, от более эффективных к менее:
 * 1. Полная картинка при 1920px — сохраняем больше деталей штрихкода
 * 2. Центральные 60% при 1920px — пользователь обычно центрирует штрихкод
 * 3. Полная картинка при 1280px — fallback на стандартное разрешение
 * 4. Центральные 40% при 1280px — агрессивный кроп для мелких штрихкодов
 *
 * Возвращает null если штрихкод не найден → вызывающий код отправит фото на AI.
 */
export function decodeBarcode(dataUrl: string): Promise<string | null> {
  return new Promise((resolve) => {
    const img = new Image();

    img.onload = async () => {
      if (!img.naturalWidth) {
        resolve(null);
        return;
      }

      const strategies: Array<[maxDim: number, cropFactor: number]> = [
        [1920, 1.0],
        [1920, 0.6],
        [1280, 1.0],
        [1280, 0.4],
      ];

      for (const [maxDim, crop] of strategies) {
        const canvas = buildCanvas(img, maxDim, crop);
        if (!canvas) continue;
        const result = await scanCanvas(canvas);
        if (result) {
          resolve(result);
          return;
        }
      }

      resolve(null);
    };

    img.onerror = () => resolve(null);
    img.src = dataUrl;
  });
}
