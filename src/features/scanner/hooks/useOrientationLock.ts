import { useEffect } from 'react';

type TgWebApp = { lockOrientation?: () => void };

function getTg(): TgWebApp | null {
  return (
    (window as { Telegram?: { WebApp?: TgWebApp } }).Telegram?.WebApp ?? null
  );
}

function syncRotationVar(): void {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const raw = screen.orientation?.angle ?? (window as any).orientation ?? 0;
  const n = ((Number(raw) % 360) + 360) % 360;
  const deg = n === 270 ? 90 : n === 180 ? 180 : n === 90 ? -90 : 0;
  document.documentElement.style.setProperty(
    '--portrait-lock-rotate',
    `${deg}deg`,
  );
}

/**
 * Portrait orientation lock — 3 слоя защиты.
 *
 * Принимает ready: boolean — вызывается только после того как
 * useTelegramInit завершил viewport.requestFullscreen().
 * screen.orientation.lock() требует fullscreen context на Chrome Android —
 * без ready вызов происходил до fullscreen и давал silent fail.
 */
export function useOrientationLock(ready: boolean): void {
  useEffect(() => {
    if (!ready) return;

    // Слой 1: Telegram API
    getTg()?.lockOrientation?.();

    // Слой 2: Web Screen Orientation API (работает после fullscreen)
    screen.orientation?.lock?.('portrait').catch(() => null);

    // Слой 3: CSS @media — синхронизируем направление вращения
    syncRotationVar();
    screen.orientation?.addEventListener?.('change', syncRotationVar);
    window.addEventListener('orientationchange', syncRotationVar);

    return () => {
      screen.orientation?.removeEventListener?.('change', syncRotationVar);
      window.removeEventListener('orientationchange', syncRotationVar);
    };
  }, [ready]);
}
