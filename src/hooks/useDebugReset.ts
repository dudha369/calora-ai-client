/**
 * useDebugReset — хук для сброса онбординга в dev-режиме.
 *
 * Срабатывает при 5 быстрых нажатиях на любой элемент с атрибутом data-debug-reset.
 * После сброса — полный перезагруз страницы (попадёшь в онбординг заново).
 *
 * Использование:
 *   const { debugProps } = useDebugReset();
 *   <div {...debugProps}>версия 1.0</div>
 */
import { useCallback, useRef } from 'react';
import { useQueryClient } from 'react-query';
import { onboarding } from '../api/onboarding';

export function useDebugReset() {
  const tapCount  = useRef(0);
  const tapTimer  = useRef<ReturnType<typeof setTimeout> | null>(null);
  const queryClient = useQueryClient();

  const handleTap = useCallback(async () => {
    tapCount.current += 1;

    if (tapTimer.current) clearTimeout(tapTimer.current);
    tapTimer.current = setTimeout(() => { tapCount.current = 0; }, 1500);

    if (tapCount.current >= 5) {
      tapCount.current = 0;
      if (tapTimer.current) clearTimeout(tapTimer.current);

      const confirmed = window.confirm('🛠 Debug: сбросить онбординг?');
      if (!confirmed) return;

      try {
        await onboarding.reset();
        queryClient.clear();
        window.location.reload();
      } catch {
        alert('Не удалось сбросить. Проверь соединение.');
      }
    }
  }, [queryClient]);

  return {
    /** Spread на любой элемент: 5 тапов → диалог сброса */
    debugProps: { onClick: handleTap, style: { userSelect: 'none' as const } },
  };
}
