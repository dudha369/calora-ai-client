import { useEffect, useRef, useState, type RefObject } from 'react';

interface UsePullToRefreshOptions {
  /** Скролл-контейнер, в котором живёт контент — жест работает, только если он в самом верху */
  scrollContainerRef: RefObject<HTMLElement | null>;
  /** Запрашивает свежие данные. Индикатор остаётся видимым, пока promise не resolve-ится */
  onRefresh: () => Promise<void>;
  /** Дистанция в px, после которой отпускание пальца запускает обновление */
  threshold?: number;
  /** "Резиновый" предел оттягивания — дальше пальцем потянуть физически нельзя */
  maxPull?: number;
  /** Выключает жест целиком (например, пока поверх страницы открыта модалка) */
  enabled?: boolean;
}

const DEFAULT_THRESHOLD = 64;
const DEFAULT_MAX_PULL = 120;
/** Чтобы спиннер не "моргал" при мгновенном ответе сервера — держим его видимым хотя бы столько */
const MIN_VISIBLE_DURATION_MS = 500;
/** Во сколько градусов конвертируется каждый px оттягивания — эффект "взвода" перед отпусканием */
const ROTATION_DEG_PER_PX = 2.6;
/** Допуск на дробный scrollTop у некоторых браузеров при zoom/высоком DPI */
const SCROLL_TOP_EPSILON = 2;

const SNAP_TRANSITION = 'transform 280ms cubic-bezier(0.22, 1, 0.36, 1)';

/**
 * Резиновое затухание дистанции — та же механика, что у нативного оттягивания
 * скролла в iOS: чем дальше тянешь, тем меньше реальный отклик на движение пальца.
 */
function applyRubberBand(rawDelta: number, maxPull: number): number {
  return maxPull * (1 - Math.exp(-rawDelta / maxPull));
}

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Жест pull-to-refresh поверх произвольного скролл-контейнера.
 *
 * Вся механика драга — императивная запись в DOM через refs, а не React state:
 * touchmove стреляет десятками раз в секунду, и гонять каждое движение пальца
 * через re-render — гарантированные просадки FPS там, где плавность важнее
 * всего. React state используется только для двух редких дискретных
 * переходов ("жест пересёк порог" и "идёт загрузка") — этого достаточно,
 * чтобы компонент переключил цвет иконки и включил CSS-анимацию спина.
 */
export function usePullToRefresh({
  scrollContainerRef,
  onRefresh,
  threshold = DEFAULT_THRESHOLD,
  maxPull = DEFAULT_MAX_PULL,
  enabled = true,
}: UsePullToRefreshOptions) {
  const contentRef = useRef<HTMLDivElement>(null);
  const indicatorRef = useRef<HTMLDivElement>(null);
  const iconRef = useRef<HTMLDivElement>(null);

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isArmed, setIsArmed] = useState(false);

  // onRefresh обычно — новый инлайн-колбэк на каждый рендер родителя; кладём
  // актуальную версию в ref, чтобы не пересоздавать DOM-листенеры из-за этого.
  const onRefreshRef = useRef(onRefresh);
  useEffect(() => {
    onRefreshRef.current = onRefresh;
  }, [onRefresh]);

  useEffect(() => {
    const content = contentRef.current;
    const indicator = indicatorRef.current;
    const icon = iconRef.current;
    const scrollEl = scrollContainerRef.current;
    if (!content || !indicator || !icon || !scrollEl || !enabled) return;

    const gesture = {
      startY: 0,
      lastPull: 0,
      isDragging: false,
      isLocked: false,
      wasArmed: false,
    };

    const paint = (px: number, animated: boolean) => {
      const transition = animated ? SNAP_TRANSITION : 'none';
      content.style.transition = transition;
      indicator.style.transition = transition;
      icon.style.transition = animated ? 'transform 280ms ease-out' : 'none';

      content.style.transform = `translateY(${px}px)`;
      indicator.style.transform = `translateY(${px}px)`;
      indicator.style.opacity = String(Math.min(px / threshold, 1));
      icon.style.transform = `rotate(${px * ROTATION_DEG_PER_PX}deg)`;
    };

    const reset = (animated: boolean) => {
      gesture.isDragging = false;
      gesture.lastPull = 0;
      if (gesture.wasArmed) {
        gesture.wasArmed = false;
        setIsArmed(false);
      }
      paint(0, animated);
    };

    const handleTouchStart = (e: TouchEvent) => {
      if (gesture.isLocked || scrollEl.scrollTop > SCROLL_TOP_EPSILON) return;
      gesture.startY = e.touches[0].clientY;
      gesture.isDragging = true;
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!gesture.isDragging) return;

      const rawDelta = e.touches[0].clientY - gesture.startY;

      // Палец пошёл вверх или контейнер уже не в нуле — это больше не наш
      // жест, отдаём управление обратно обычному скроллу страницы.
      if (rawDelta <= 0 || scrollEl.scrollTop > SCROLL_TOP_EPSILON) {
        reset(true);
        return;
      }

      // preventDefault работает только у "активных" слушателей — поэтому
      // touchmove подключён через addEventListener({ passive: false }), а не
      // через JSX onTouchMove (React по умолчанию делает синтетические
      // touch-листенеры пассивными, и preventDefault там тихо игнорируется).
      e.preventDefault();

      gesture.lastPull = applyRubberBand(rawDelta, maxPull);
      paint(gesture.lastPull, false);

      const armed = gesture.lastPull >= threshold;
      if (armed !== gesture.wasArmed) {
        gesture.wasArmed = armed;
        setIsArmed(armed);
      }
    };

    const handleTouchEnd = () => {
      if (!gesture.isDragging) return;
      gesture.isDragging = false;

      if (gesture.lastPull < threshold) {
        reset(true);
        return;
      }

      gesture.isLocked = true;
      setIsRefreshing(true);
      paint(threshold, true); // фиксируем на высоте индикатора на время загрузки

      Promise.all([onRefreshRef.current(), wait(MIN_VISIBLE_DURATION_MS)])
        .catch(() => {
          // Best-effort: не рушим жест из-за временной сетевой ошибки —
          // сами запросы логируют свои сбои на уровне react-query.
        })
        .finally(() => {
          gesture.isLocked = false;
          setIsRefreshing(false);
          reset(true);
        });
    };

    content.addEventListener('touchstart', handleTouchStart, { passive: true });
    content.addEventListener('touchmove', handleTouchMove, { passive: false });
    content.addEventListener('touchend', handleTouchEnd, { passive: true });
    content.addEventListener('touchcancel', handleTouchEnd, { passive: true });

    return () => {
      content.removeEventListener('touchstart', handleTouchStart);
      content.removeEventListener('touchmove', handleTouchMove);
      content.removeEventListener('touchend', handleTouchEnd);
      content.removeEventListener('touchcancel', handleTouchEnd);
    };
  }, [scrollContainerRef, threshold, maxPull, enabled]);

  return { contentRef, indicatorRef, iconRef, isRefreshing, isArmed };
}
