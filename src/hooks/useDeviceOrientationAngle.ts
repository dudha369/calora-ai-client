import { useState, useEffect } from 'react';

export type DeviceAngle = 0 | 90 | 180 | 270;

function readAngle(): DeviceAngle {
  const raw =
    screen.orientation?.angle ??
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any).orientation ??
    0;
  const n = ((Number(raw) % 360) + 360) % 360;
  if (n === 90) return 90;
  if (n === 180) return 180;
  if (n === 270) return 270;
  return 0;
}

/**
 * Угол поворота иконки навбара для компенсации физической ориентации устройства.
 * На странице сканера viewport landscape (body не вращается), иконки нужно
 * counter-rotate чтобы они выглядели прямо для пользователя.
 *
 * angle=90  (landscape-primary):  иконки повёрнуты -90° для пользователя → компенсируем +90°...
 *
 * Стоп. Правильная логика:
 * На сканере body НЕ вращается (data-page="scanner" исключает его из CSS lock).
 * Viewport в landscape (angle=90 = устройство повёрнуто по часовой стрелке).
 * Иконки в навбаре физически смотрят вбок. Чтобы они выглядели прямо:
 *   angle=90  (по часовой CW) → вращаем иконку CCW = -90deg
 *   angle=270 (против часовой CCW) → вращаем иконку CW = +90deg
 */
export function iconCounterRotationDeg(angle: DeviceAngle): number {
  if (angle === 90) return -90;
  if (angle === 270) return 90;
  if (angle === 180) return 180;
  return 0;
}

/**
 * Отслеживает физическую ориентацию устройства.
 * enabled=false → ноль event listeners, мгновенно возвращает 0.
 * Используется только в NavigationBar когда isLiveCamera=true.
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
