import { useEffect } from 'react';

/**
 * Инициирует блокировку portrait-ориентации тремя независимыми слоями.
 * Каждый следующий слой активируется если предыдущий недоступен.
 *
 * ─────────────────────────────────────────────────────────────────────
 * СЛОЙ 1 — Telegram.WebApp.lockOrientation()
 *   Лучший UX: блокирует и webview, и нативный UI Telegram (кнопка
 *   «Закрыть», header). Требует Bot API 8.0+ в клиенте Telegram.
 *   Optional-chained → безопасный no-op на старых версиях.
 *
 * СЛОЙ 2 — screen.orientation.lock('portrait')
 *   OS-level блокировка: предотвращает любой reflow браузера.
 *   Требует fullscreen context (в TG Mini App обычно выдаётся).
 *   Возвращает Promise → ошибки перехватываются, слой 3 подхватывает.
 *
 * СЛОЙ 3 — CSS @media (orientation: landscape) в index.css
 *   ВСЕГДА работает. Ключевой слой для устранения jank.
 *   Применяется АТОМАРНО внутри той же style recalculation что и
 *   reflow при повороте — до первого landscape-paint, поэтому
 *   пользователь не видит промежуточного "неправильного" кадра.
 *
 *   JS здесь устанавливает CSS custom property --portrait-lock-rotate
 *   (направление поворота зависит от landscape-primary vs secondary).
 *   Это ТОЛЬКО compositor-level операция (transform), не вызывающая
 *   layout/reflow — в отличие от прямого setWidth/setHeight в JS,
 *   которое вызывало два отдельных reflow и было источником jank.
 *
 * ─────────────────────────────────────────────────────────────────────
 * Почему один вызов (не per-route):
 *   Все три слоя "запоминают" состояние сами — Telegram API, OS lock
 *   и CSS переменная сохраняются до явного снятия. Повторный вызов
 *   при каждой навигации не нужен и добавляет только overhead.
 *
 * Вызывается один раз из App.tsx при маунте приложения.
 */
export function useOrientationLock(): void {
  useEffect(() => {
    // Слой 1
    (
      window as { Telegram?: { WebApp?: { lockOrientation?: () => void } } }
    ).Telegram?.WebApp?.lockOrientation?.();

    // Слой 2 + инициализация CSS-переменной для слоя 3
    const applyRotationVar = (angle: number) => {
      // landscape-primary  (angle = 90):  поворот CCW → компенсируем -90deg
      // landscape-secondary (angle = 270): поворот CW  → компенсируем +90deg
      // portrait-flipped    (angle = 180): компенсируем 180deg
      const deg = angle === 270 ? 90 : angle === 180 ? 180 : -90;
      document.documentElement.style.setProperty(
        '--portrait-lock-rotate',
        `${deg}deg`,
      );
    };

    const handleChange = () => {
      const angle = screen.orientation?.angle ?? 0;
      if (angle !== 0) applyRotationVar(angle);
    };

    screen.orientation?.addEventListener?.('change', handleChange);
    window.addEventListener('orientationchange', handleChange);

    // Слой 2 — Promise rejection означает отсутствие разрешения,
    // CSS слой 3 уже активен через @media — тихо игнорируем
    screen.orientation?.lock?.('portrait').catch(() => null);

    return () => {
      screen.orientation?.removeEventListener?.('change', handleChange);
      window.removeEventListener('orientationchange', handleChange);
    };
  }, []);
}
