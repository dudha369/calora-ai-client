import { useCallback, useEffect, useState } from 'react';
import { addToHomeScreen, checkHomeScreenStatus } from '@tma.js/sdk-react';

type HomeScreenStatus = 'unsupported' | 'unknown' | 'added' | 'missed';

/**
 * Home Screen API (Bot API 8.0+, @tma.js/sdk 3.3+).
 *
 * В этой версии SDK функции onAddedToHomeScreen/onAddToHomeScreenFailed
 * убраны из пакета (см. migration guide tma.js) — вместо подписки на них
 * перепроверяем статус при возврате фокуса вкладке: системный диалог
 * "Добавить на экран" сворачивает мини-апп, а его закрытие гарантированно
 * триггерит visibilitychange → 'visible'.
 *
 * checkHomeScreenStatus() на части версий Telegram для iOS стабильно
 * возвращает 'unknown' вместо реального 'added'/'missed' (платформенное
 * ограничение) — поэтому кнопку показываем и при 'unknown', иначе на
 * iOS она не появится никогда.
 */
export function useAddToHomeScreen() {
  const [status, setStatus] = useState<HomeScreenStatus | null>(null);

  const refresh = useCallback(() => {
    if (!checkHomeScreenStatus.isAvailable()) {
      setStatus('unsupported');
      return;
    }
    checkHomeScreenStatus()
      .then((result) => setStatus(result as HomeScreenStatus))
      .catch(() => setStatus('unsupported'));
  }, []);

  useEffect(() => {
    refresh();

    const handleVisibility = () => {
      if (document.visibilityState === 'visible') refresh();
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () =>
      document.removeEventListener('visibilitychange', handleVisibility);
  }, [refresh]);

  const isEligible = status === 'missed' || status === 'unknown';

  const trigger = useCallback(() => {
    if (addToHomeScreen.isAvailable()) addToHomeScreen();
  }, []);

  return { isEligible, addToHomeScreen: trigger };
}
