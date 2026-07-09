/**
 * Сжимает изображение (data URL) на клиенте перед отправкой на сервер.
 *
 * 1. Загружает data URL в <img>.
 * 2. Рисует на off-screen <canvas>, масштабируя до maxDimension (сохраняя пропорции).
 * 3. Экспортирует в JPEG с заданным quality.
 *
 * Это уменьшает трафик и ускоряет загрузку — типичное фото с камеры (3‑5 МБ)
 * сжимается до ~200‑400 КБ без заметной потери качества для анализа еды.
 */
export function compressImage(
  dataUrl: string,
  {
    maxDimension = 1280,
    quality = 0.8,
  }: { maxDimension?: number; quality?: number } = {},
): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();

    img.onload = () => {
      let { width, height } = img;

      // Масштабируем по большей стороне, сохраняя пропорции
      if (width > maxDimension || height > maxDimension) {
        if (width > height) {
          height = Math.round((height * maxDimension) / width);
          width = maxDimension;
        } else {
          width = Math.round((width * maxDimension) / height);
          height = maxDimension;
        }
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Canvas 2D context unavailable'));
        return;
      }

      ctx.drawImage(img, 0, 0, width, height);
      resolve(canvas.toDataURL('image/jpeg', quality));
    };

    img.onerror = () => reject(new Error('Failed to load image for compression'));
    img.src = dataUrl;
  });
}
