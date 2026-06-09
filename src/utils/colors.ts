interface Color {
  h: number,
  s: number,
  l: number,
  yiq: number
}

/**
 * Преобразует HEX-цвет в объект {h, s, l, yiq}
 */
function parseColor(hex: string): Color {
  hex = hex.replace(/^#/, '');
  // На случай коротких hex-кодов вроде #fff
  if (hex.length === 3) hex = hex.split('').map(c => c + c).join('');

  let r = parseInt(hex.substring(0, 2), 16);
  let g = parseInt(hex.substring(2, 4), 16);
  let b = parseInt(hex.substring(4, 6), 16);

  // Считаем визуальную яркость (от 0 до 255)
  const yiq = (r * 299 + g * 587 + b * 114) / 1000;

  // Переводим в доли для HSL
  r /= 255; g /= 255; b /= 255;
  let max = Math.max(r, g, b), min = Math.min(r, g, b);

  // ИНИЦИАЛИЗАЦИЯ: сразу задаем h и s равными 0
  let h = 0, s = 0, l = (max + min) / 2;

  // Если max === min, то h и s уже равны 0 по умолчанию,
  // поэтому нам нужно обрабатывать только случай, когда они не равны
  if (max !== min) {
    let d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
    yiq: yiq
  };
}

/**
 * Генерирует контрастный цвет для navbar
 */
export function makeContrast(bgHex: string, shift = 20) {
  const { h, s, l, yiq } = parseColor(bgHex);

  let newL;
  if (yiq >= 128) {
    newL = Math.max(0, l - shift);
  } else {
    newL = Math.min(100, l + shift);
  }

  return `hsl(${h}, ${s}%, ${newL}%)`;
}
