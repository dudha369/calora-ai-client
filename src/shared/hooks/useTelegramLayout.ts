import { useEffect, useRef, useState } from 'react';
import { viewport } from '@tma.js/sdk-react';

type Safe = { top: number; bottom: number };

function readFromSignals(): Safe {
  try {
    const sa = viewport.safeAreaInsets();
    const csa = viewport.contentSafeAreaInsets();
    return {
      top: (sa?.top ?? 0) + (csa?.top ?? 0),
      bottom: (sa?.bottom ?? 0) + (csa?.bottom ?? 0),
    };
  } catch {
    return { top: 0, bottom: 0 };
  }
}

/**
 * Возвращает safe area insets из Telegram.
 *
 * Когда CSS portrait lock активен (landscape + не scanner), safe area
 * меняется (например bottom становится 0 т.к. нотч теперь сбоку).
 * Но визуально контент в portrait ориентации → нужны portrait значения.
 *
 * Кэшируем portrait значения и отдаём их при landscape CSS lock.
 */
export function useTelegramLayout(ready: boolean) {
  const [safe, setSafe] = useState<Safe>({ top: 0, bottom: 0 });
  const portraitSafeRef = useRef<Safe | null>(null);

  useEffect(() => {
    if (!ready) return;

    const update = () => {
      const values = readFromSignals();
      const isLandscape = window.matchMedia('(orientation: landscape)').matches;
      const isScanner = document.body.getAttribute('data-page') === 'scanner';

      if (!isLandscape) {
        // Portrait — кэшируем и используем реальные значения
        portraitSafeRef.current = values;
        setSafe(values);
      } else if (isScanner) {
        // Scanner в landscape — реальные landscape значения
        setSafe(values);
      } else {
        // CSS portrait lock — используем кэшированные portrait значения
        setSafe(portraitSafeRef.current ?? values);
      }
    };

    update();

    const unsubSA = viewport.safeAreaInsets.sub(update);
    const unsubCSA = viewport.contentSafeAreaInsets.sub(update);

    // Обновляем при смене ориентации
    const mql = window.matchMedia('(orientation: landscape)');
    mql.addEventListener('change', update);

    return () => {
      unsubSA();
      unsubCSA();
      mql.removeEventListener('change', update);
    };
  }, [ready]);

  return safe;
}
