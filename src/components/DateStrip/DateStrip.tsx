import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import { WheelGesturesPlugin } from 'embla-carousel-wheel-gestures';

import { DateStripItem } from './DateStripItem';
import { isSameDay, toApiDate, startOfDay } from '../../utils/date';

const GAP = 4; // px между элементами
const MIN_ITEM = 48; // px — минимальная ширина элемента
const MAX_ITEM = 64; // px — максимальная ширина (на широких экранах не растягиваем)

interface Layout {
  count: number;
  itemWidth: number;
}

interface Props {
  dates: Date[];
  selectedDate: Date;
  today: Date;
  minDate: Date;
  onSelect: (date: Date) => void;
  pendingScrollDate: Date | null;
  onScrollConsumed: () => void;
}

function computeLayout(containerWidth: number): Layout {
  for (const count of [7, 6, 5]) {
    const itemWidth = Math.floor((containerWidth - (count - 1) * GAP) / count);
    if (itemWidth >= MIN_ITEM) {
      return { count, itemWidth: Math.min(itemWidth, MAX_ITEM) };
    }
  }
  return { count: 5, itemWidth: MIN_ITEM };
}

export const DateStrip = ({
  dates,
  selectedDate,
  today,
  minDate,
  onSelect,
  pendingScrollDate,
  onScrollConsumed,
}: Props) => {
  const wheelGesturesPlugin = useMemo(
    () => WheelGesturesPlugin({ forceWheelAxis: 'y' }),
    [],
  );

  const minNorm = startOfDay(minDate);

  const wrapperRef = useRef<HTMLDivElement>(null);
  const [layout, setLayout] = useState<Layout | null>(null);

  useLayoutEffect(() => {
    const node = wrapperRef.current;
    if (!node) return;

    const measure = () => {
      const width = node.getBoundingClientRect().width;
      if (width <= 0) return;
      const next = computeLayout(width);
      setLayout((prev) =>
        prev && prev.count === next.count && prev.itemWidth === next.itemWidth
          ? prev
          : next,
      );
    };

    measure();

    const observer = new ResizeObserver(measure);
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  /**
   * startIndex — мгновенное позиционирование при маунте и смене месяца (нет анимации).
   * Фиксируется один раз: повторный выбор той же даты не реинициализирует Embla.
   *
   * Анимированный скролл к выбранной дате обрабатывается ниже через pendingScrollDate.
   */
  const [initialIndex] = useState(() =>
    Math.max(
      0,
      dates.findIndex((d) => isSameDay(d, selectedDate)),
    ),
  );

  const emblaOptions = useMemo(
    () => ({
      align: 'center' as const,
      containScroll: 'keepSnaps' as const,
      dragFree: true,
      startIndex: initialIndex,
    }),
    [initialIndex],
  );

  const [emblaRef, emblaApi] = useEmblaCarousel(emblaOptions, [
    wheelGesturesPlugin,
  ]);

  // Реальное изменение геометрии (поворот экрана / resize).
  useEffect(() => {
    if (layout) emblaApi?.reInit();
  }, [emblaApi, layout]);

  /**
   * Анимированный скролл к выбранной дате.
   *
   * Срабатывает при любом выборе: и тап по карусели, и CalendarPicker.
   * useDateStrip выставляет pendingScrollDate в обоих случаях.
   *
   * emblaApi.scrollTo(index)           → animated (jump = false по умолчанию)
   * emblaApi.scrollTo(index, true)     → instant jump (не используем)
   *
   * Если цель == текущая позиция, Embla пропускает анимацию автоматически,
   * поэтому вызов safe даже когда элемент уже в центре.
   */
  useEffect(() => {
    if (!emblaApi || pendingScrollDate === null) return;

    const index = dates.findIndex((d) => isSameDay(d, pendingScrollDate));
    if (index >= 0) {
      emblaApi.scrollTo(index); // animated by default
      onScrollConsumed();
    }
  }, [emblaApi, pendingScrollDate, dates, onScrollConsumed]);

  if (!layout) {
    return <div ref={wrapperRef} className="w-full" style={{ height: 60 }} />;
  }

  const { count, itemWidth } = layout;
  const viewportWidth = count * itemWidth + (count - 1) * GAP;

  return (
    <div ref={wrapperRef} className="w-full" data-no-swipe>
      <div
        ref={emblaRef}
        className="mx-auto overflow-hidden"
        style={{ width: viewportWidth }}
      >
        <div className="flex" style={{ gap: GAP }}>
          {dates.map((date) => {
            const isFuture = !isSameDay(date, today) && date > today;
            const isBeforeMin = date < minNorm;

            return (
              <DateStripItem
                key={toApiDate(date)}
                date={date}
                isSelected={isSameDay(date, selectedDate)}
                isToday={isSameDay(date, today)}
                isFuture={isFuture}
                isBeforeMin={isBeforeMin}
                onClick={() => onSelect(date)}
                itemWidth={itemWidth}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
};
