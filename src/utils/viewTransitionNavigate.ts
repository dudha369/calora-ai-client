import type { NavigateFunction } from 'react-router-dom';

export type SwipeDirection = 'forward' | 'backward';

/** Должна быть ≥ суммарной длительности анимации в src/index.css (0.28s + запас) */
const CLEANUP_DELAY_MS = 400;

/**
 * Навигация с направленным View Transition (нативный браузерный API).
 *
 * Перед navigate() выставляем data-атрибут на <html> — CSS в index.css
 * читает его, чтобы подменить стандартный кросс-фейд браузера на выезд
 * слева/справа. Атрибут должен дожить до конца анимации: стили
 * `::view-transition-*` пересчитываются относительно ЖИВОГО состояния
 * документа, а не "замораживаются" в момент снапшота — поэтому чистим
 * его отложенно, а не сразу после navigate().
 *
 * На браузерах без поддержки API (Firefox) react-router сам делает
 * fallback на обычную навигацию без анимации — доп. код не нужен.
 */
export function navigateWithDirection(
  navigate: NavigateFunction,
  to: string,
  direction: SwipeDirection,
): void {
  document.documentElement.dataset.viewTransitionDir = direction;

  navigate(to, { viewTransition: true });

  window.setTimeout(() => {
    delete document.documentElement.dataset.viewTransitionDir;
  }, CLEANUP_DELAY_MS);
}
