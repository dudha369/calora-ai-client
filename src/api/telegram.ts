import type { WebApp as WebAppType } from 'telegram-web-app';

export function isMobileDevice() {
  const screenW = window.screen.width;
  const screenH = window.screen.height;
  const dpr = window.devicePixelRatio;
  const touch = navigator.maxTouchPoints;

  return (
    Math.min(screenW, screenH) <= 480 &&
    dpr >= 2 &&
    touch > 0
  );
}

export const WebApp = window.Telegram?.WebApp as WebAppType;