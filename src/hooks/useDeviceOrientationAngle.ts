import { useState, useEffect } from 'react';

export type DeviceAngle = 0 | 90 | 180 | 270;

function readAngle(): DeviceAngle {
  const raw =
    screen.orientation?.angle ??
    (window as unknown as Record<string, unknown>).orientation ??
    0;
  const n = ((Number(raw) % 360) + 360) % 360;
  if (n === 90) return 90;
  if (n === 180) return 180;
  if (n === 270) return 270;
  return 0;
}

/**
 * Локальный counter-rotation для иконки навбара на ScannerPage.
 *
 * Когда тело документа повёрнуто CSS-слоем из useOrientationLock
 * (слой 3, @media landscape), все дочерние элементы поворачиваются
 * вместе с ним — включая иконки навбара. Этот угол компенсирует
 * родительский поворот ровно на столько, чтобы иконка выглядела
 * «прямой» для пользователя, держащего телефон в любой ориентации.
 *
 * Математика: iconDeg + bodyDeg = 0 для глаза пользователя
 *   angle=90  → body=-90deg → icon=+90deg
 *   angle=270 → body=+90deg → icon=-90deg
 */
export function iconCounterRotationDeg(angle: DeviceAngle): number {
  if (angle === 90) return 90;
  if (angle === 270) return -90;
  if (angle === 180) return 180;
  return 0;
}

/**
 * Отслеживает физическую ориентацию устройства.
 *
 * @param enabled  Слушатели вешаются ТОЛЬКО при true. При false хук
 *                 немедленно возвращает 0 без единого addEventListener —
 *                 нулевые накладные расходы на всех страницах кроме сканера.
 */
export function useDeviceOrientationAngle(enabled: boolean): DeviceAngle {
  const [angle, setAngle] = useState<DeviceAngle>(() =>
    enabled ? readAngle() : 0,
  );

  useEffect(() => {
    if (!enabled) {
      setAngle(0);
      return;
    }

    setAngle(readAngle());

    const handler = () => setAngle(readAngle());
    screen.orientation?.addEventListener?.('change', handler);
    window.addEventListener('orientationchange', handler);

    return () => {
      screen.orientation?.removeEventListener?.('change', handler);
      window.removeEventListener('orientationchange', handler);
    };
  }, [enabled]);

  return angle;
}
