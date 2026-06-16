import { useCallback, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

/**
 * Pages reachable via horizontal swipe, in left-to-right visual order.
 *
 * Scanner is intentionally excluded:
 *  • iOS  — the camera opens natively via <input capture>, no page visit occurs
 *  • Android — it's a camera screen that shouldn't be entered accidentally via swipe
 */
const SWIPE_PAGES = ['/', '/analytics', '/ai', '/profile'] as const;
type SwipePage = (typeof SWIPE_PAGES)[number];

/** Minimum horizontal distance (px) required to commit a swipe. */
const MIN_HORIZONTAL_PX = 65;

/**
 * If vertical drift exceeds this *and* is greater than horizontal, the gesture
 * is classified as a scroll and page navigation is cancelled immediately.
 */
const MAX_VERTICAL_PX = 35;

/** Minimum velocity (px/ms) — filters out slow, accidental drags. */
const MIN_VELOCITY = 0.22;

interface TouchState {
  startX: number;
  startY: number;
  startTime: number;
  /** Set to true as soon as the gesture is identified as vertical. */
  cancelled: boolean;
}

/**
 * Returns touch-event handlers that implement swipe-based page navigation.
 *
 * ## Usage
 * ```tsx
 * const swipe = useSwipeNavigation(session.status === 'ready');
 * <div {...swipe}>…</div>
 * ```
 *
 * ## Opting out child areas
 * Any element (or ancestor) that owns its own horizontal gesture — date carousel,
 * future swipe-to-delete rows, etc. — should carry the `data-no-swipe` attribute:
 * ```tsx
 * <div data-no-swipe>…</div>
 * ```
 * When a touch starts inside such an element, this hook does nothing at all.
 */
export function useSwipeNavigation(enabled: boolean) {
  const navigate = useNavigate();
  const location = useLocation();
  const stateRef = useRef<TouchState | null>(null);

  const onTouchStart = useCallback(
    (e: React.TouchEvent) => {
      if (!enabled) return;

      // Respect components that manage their own horizontal gestures
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

  const onTouchMove = useCallback((e: React.TouchEvent) => {
    const s = stateRef.current;
    if (!s || s.cancelled) return;

    const t = e.touches[0];
    const dx = Math.abs(t.clientX - s.startX);
    const dy = Math.abs(t.clientY - s.startY);

    // Vertical-dominant gesture → treat as scroll, not page-swipe
    if (dy > MAX_VERTICAL_PX && dy > dx) {
      s.cancelled = true;
    }
  }, []);

  const onTouchEnd = useCallback(
    (e: React.TouchEvent) => {
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
      // Not a swipeable page (e.g. /scanner, /onboarding) → do nothing
      if (idx === -1) return;

      // swipe-left (dx < 0) → next page; swipe-right (dx > 0) → previous page
      const nextIdx = idx + (dx < 0 ? 1 : -1);
      if (nextIdx >= 0 && nextIdx < SWIPE_PAGES.length) {
        navigate(SWIPE_PAGES[nextIdx]);
      }
    },
    [navigate, location.pathname],
  );

  // Clean up on interrupted gesture (e.g. incoming call, multi-touch)
  const onTouchCancel = useCallback(() => {
    stateRef.current = null;
  }, []);

  return { onTouchStart, onTouchMove, onTouchEnd, onTouchCancel } as const;
}
