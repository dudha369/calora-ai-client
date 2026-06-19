import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import { WheelGesturesPlugin } from 'embla-carousel-wheel-gestures';

import { DateStripItem } from './DateStripItem';
import { isSameDay, toApiDate, startOfDay } from '../../utils/date';
import type { ActiveDateSets } from '../../hooks/useActiveDates';

const GAP = 4;
const MIN_ITEM = 48;
const MAX_ITEM = 64;
const IDEAL_COUNT = 7;
const MIN_COUNT = 5;

interface Layout {
  count: number;
  itemWidth: number;
}

function round(value: number): number {
  return Math.round(value * 10) / 10;
}

function computeLayout(containerWidth: number): Layout {
  let count = IDEAL_COUNT;
  let itemWidth = (containerWidth - (count - 1) * GAP) / count;

  while (itemWidth > MAX_ITEM) {
    count += 1;
    itemWidth = (containerWidth - (count - 1) * GAP) / count;
  }

  while (itemWidth < MIN_ITEM && count > MIN_COUNT) {
    count -= 1;
    itemWidth = (containerWidth - (count - 1) * GAP) / count;
  }

  return { count, itemWidth: round(itemWidth) };
}

interface DateStripProps {
  dates: Date[];
  selectedDate: Date;
  today: Date;
  minDate: Date;
  activeDates: ActiveDateSets;
  onSelect: (date: Date) => void;
  pendingScrollDate: Date | null;
  onScrollConsumed: () => void;
}

export const DateStrip = ({
  dates,
  selectedDate,
  today,
  minDate,
  activeDates,
  onSelect,
  pendingScrollDate,
  onScrollConsumed,
}: DateStripProps) => {
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

  useLayoutEffect(() => {
    if (layout) emblaApi?.reInit();
  }, [emblaApi, layout]);

  useEffect(() => {
    if (!emblaApi || pendingScrollDate === null) return;

    const index = dates.findIndex((d) => isSameDay(d, pendingScrollDate));
    if (index >= 0) {
      emblaApi.scrollTo(index);
      onScrollConsumed();
    }
  }, [emblaApi, pendingScrollDate, dates, onScrollConsumed]);

  if (!layout) {
    return <div ref={wrapperRef} className="h-16 w-full" />;
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
            const apiDate = toApiDate(date);

            return (
              <DateStripItem
                key={apiDate}
                date={date}
                isSelected={isSameDay(date, selectedDate)}
                isToday={isSameDay(date, today)}
                isFuture={isFuture}
                isBeforeMin={isBeforeMin}
                hasFood={activeDates.foodDates.has(apiDate)}
                hasWater={activeDates.waterDates.has(apiDate)}
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
