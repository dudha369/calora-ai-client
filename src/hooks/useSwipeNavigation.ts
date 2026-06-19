import { useCallback, useRef, type TouchEvent } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { navigateWithDirection } from '../utils/viewTransitionNavigate';

/**
 * Pages reachable via horizontal swipe, in left-to-right visual order.
 *
 * Scanner is intentionally excluded:
 *  • iOS  — the camera opens natively via <input capture>, no page visit occurs
 *  • Android — it's a camera screen that shouldn't be entered accidentally via swipe
 */
const SWIPE_PAGES = ['/', '/water', '/analytics', '/profile'] as const;
type SwipePage = (typeof SWIPE_PAGES)[number];

const MIN_HORIZONTAL_PX = 65;
const MAX_VERTICAL_PX = 35;
const MIN_VELOCITY = 0.22;

interface TouchState {
  startX: number;
  startY: number;
  startTime: number;
  cancelled: boolean;
}

export function useSwipeNavigation(enabled: boolean) {
  const navigate = useNavigate();
  const location = useLocation();
  const stateRef = useRef<TouchState | null>(null);

  const onTouchStart = useCallback(
    (e: TouchEvent) => {
      if (!enabled) return;
      if ((e.target as HTMLElement).closest('[data-no-swipe]')) return;

      const t = e.touches[0];
      stateRef.current = {
        startX: t.clientX,
        startY: t.clientY,
        startTime: performance.now(),
        cancelled: false,
      };
    },
    [enabled],
  );

  const onTouchMove = useCallback((e: TouchEvent) => {
    const s = stateRef.current;
    if (!s || s.cancelled) return;

    const t = e.touches[0];
    const dx = Math.abs(t.clientX - s.startX);
    const dy = Math.abs(t.clientY - s.startY);

    if (dy > MAX_VERTICAL_PX && dy > dx) {
      s.cancelled = true;
    }
  }, []);

  const onTouchEnd = useCallback(
    (e: TouchEvent) => {
      const s = stateRef.current;
      stateRef.current = null;
      if (!s || s.cancelled) return;

      const t = e.changedTouches[0];
      const dx = t.clientX - s.startX;
      const dy = Math.abs(t.clientY - s.startY);
      const elapsed = performance.now() - s.startTime;

      if (Math.abs(dx) < MIN_HORIZONTAL_PX) return;
      if (dy > MAX_VERTICAL_PX) return;
      if (Math.abs(dx) / elapsed < MIN_VELOCITY) return;

      const idx = SWIPE_PAGES.indexOf(location.pathname as SwipePage);
      if (idx === -1) return;

      // свайп влево (dx < 0) → следующая вкладка, въезжает справа
      // свайп вправо (dx > 0) → предыдущая вкладка, въезжает слева
      const goingForward = dx < 0;
      const nextIdx = idx + (goingForward ? 1 : -1);
      if (nextIdx >= 0 && nextIdx < SWIPE_PAGES.length) {
        navigateWithDirection(
          navigate,
          SWIPE_PAGES[nextIdx],
          goingForward ? 'forward' : 'backward',
        );
      }
    },
    [navigate, location.pathname],
  );

  const onTouchCancel = useCallback(() => {
    stateRef.current = null;
  }, []);

  return { onTouchStart, onTouchMove, onTouchEnd, onTouchCancel } as const;
}
