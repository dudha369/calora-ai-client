// src/shared/lib/text.ts
/**
 * Утилиты нормализации текста из внешних источников (OpenFoodFacts и т.п.),
 * где строки могут содержать неэкранированные HTML-сущности (&quot;, &amp;...).
 */

/** Декодирует ЛЮБЫЕ HTML-сущности через встроенный парсер браузера —
 *  не только &quot;, а всю таблицу, без ручного списка на поддержку. */
function decodeHtmlEntities(str: string): string {
  const el = document.createElement('textarea');
  el.innerHTML = str;
  return el.value;
}

/** Пары прямых кавычек " → «ёлочки», по очереди открывающая/закрывающая. */
function toGuillemets(str: string): string {
  let opening = true;
  return str.replace(/"/g, () => {
    const quote = opening ? '«' : '»';
    opening = !opening;
    return quote;
  });
}

/** Название/бренд/состав продукта → декодированный текст в едином стиле кавычек. */
export function cleanProductText(value: string | undefined | null): string {
  if (!value) return '';
  return toGuillemets(decodeHtmlEntities(value)).trim();
}
