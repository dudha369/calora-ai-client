import { BrowserMultiFormatReader } from "@zxing/browser";
import { DecodeHintType } from "@zxing/library";

const MAX_SCAN_DIM = 1280;

const HINTS = new Map<DecodeHintType, unknown>([
  [DecodeHintType.TRY_HARDER, true],
]);

function buildScaledCanvas(img: HTMLImageElement): HTMLCanvasElement | null {
  const ctx = document.createElement("canvas").getContext("2d");
  if (!ctx) return null;

  const scale = Math.min(1, MAX_SCAN_DIM / Math.max(img.naturalWidth, img.naturalHeight));
  ctx.canvas.width = Math.round(img.naturalWidth * scale);
  ctx.canvas.height = Math.round(img.naturalHeight * scale);
  ctx.drawImage(img, 0, 0, ctx.canvas.width, ctx.canvas.height);
  return ctx.canvas;
}

function rotateCanvas(src: HTMLCanvasElement, deg: 90 | 180 | 270): HTMLCanvasElement {
  const transposed = deg === 90 || deg === 270;
  const canvas = document.createElement("canvas");
  canvas.width = transposed ? src.height : src.width;
  canvas.height = transposed ? src.width : src.height;
  const ctx = canvas.getContext("2d")!;
  ctx.translate(canvas.width / 2, canvas.height / 2);
  ctx.rotate((deg * Math.PI) / 180);
  ctx.drawImage(src, -src.width / 2, -src.height / 2);
  return canvas;
}

async function tryNativeDetector(canvas: HTMLCanvasElement): Promise<string | null> {
  if (!("BarcodeDetector" in window)) return null;
  try {
    const detector = new (window as any).BarcodeDetector();
    const results: Array<{ rawValue: string }> = await detector.detect(canvas);
    return results[0]?.rawValue ?? null;
  } catch {
    return null;
  }
}

function tryZxing(canvas: HTMLCanvasElement): string | null {
  const reader = new BrowserMultiFormatReader(HINTS);
  const rotations = [canvas, ...([90, 180, 270] as const).map((d) => rotateCanvas(canvas, d))];

  for (const variant of rotations) {
    try {
      return reader.decodeFromCanvas(variant).getText();
    } catch {

    }
  }
  return null;
}

export function decodeBarcode(dataUrl: string): Promise<string | null> {
  return new Promise((resolve) => {
    const img = new Image();

    img.onload = async () => {
      if (img.naturalWidth === 0) { resolve(null); return; }

      const canvas = buildScaledCanvas(img);
      if (!canvas) { resolve(null); return; }

      const native = await tryNativeDetector(canvas);
      resolve(native ?? tryZxing(canvas));
    };

    img.onerror = () => resolve(null);
    img.src = dataUrl;
  });
}
