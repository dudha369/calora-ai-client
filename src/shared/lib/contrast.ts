/**
 * Контраст между двумя HEX-цветами (WCAG relative luminance).
 * Для мелких декоративных элементов (маркер/точка), не для текста.
 */

function relativeLuminance(hex: string): number {
  const c = hex.replace('#', '');
  const [r, g, b] = [0, 2, 4].map(
    (i) => parseInt(c.substring(i, i + 2), 16) / 255,
  );
  const [rl, gl, bl] = [r, g, b].map((v) =>
    v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4),
  );
  return 0.2126 * rl + 0.7152 * gl + 0.0722 * bl;
}

/** 1 (одинаковые цвета) .. 21 (чёрный/белый). */
export function contrastRatio(hexA: string, hexB: string): number {
  const lA = relativeLuminance(hexA);
  const lB = relativeLuminance(hexB);
  const lighter = Math.max(lA, lB);
  const darker = Math.min(lA, lB);
  return (lighter + 0.05) / (darker + 0.05);
}

const HEX6 = /^#[0-9a-fA-F]{6}$/;

/**
 * Нужна ли обводка, чтобы маркер не сливался с фоном плашки.
 * Порог ниже стандартного WCAG (4.5/3.0) — точке достаточно быть отличимой.
 * Если один из цветов не чистый #RRGGBB (например градиент) — не решаем,
 * возвращаем false, вызывающий код сам решает, что делать в этом случае.
 */
export function needsContrastOutline(
  background: string,
  foreground: string,
  threshold = 1.6,
): boolean {
  if (!HEX6.test(background) || !HEX6.test(foreground)) return false;
  return contrastRatio(background, foreground) < threshold;
}
