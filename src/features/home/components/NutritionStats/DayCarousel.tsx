import { useEffect, useMemo, useRef, useState } from 'react';
import { flushSync } from 'react-dom';
import useEmblaCarousel from 'embla-carousel-react';
import { DayContent } from './DayContent';
import { addDays, isSameDay, startOfDay, toApiDate } from '@/shared/lib/date';
import type { FoodLog } from '@/shared/types/api/food';

interface DayCarouselProps {
  selectedDate: Date;
  dates: Date[];
  minDate: Date;
  maxDate: Date;
  onDateChange: (date: Date) => void;
  onFoodLogClick: (log: FoodLog) => void;
  deletingId: number | null;
}

const BUFFER_SIZE = 14;

interface WindowData {
  dates: Date[];
  activeIndex: number;
}

const generateWindow = (
  center: Date,
  min: Date,
  max: Date,
  allowedDates: Set<string>,
): WindowData => {
  const c = startOfDay(center);
  const mn = startOfDay(min);
  const mx = startOfDay(max);

  const windowDates: Date[] = [];
  let activeIndex = 0;
  const centerKey = toApiDate(c);

  for (let i = -BUFFER_SIZE; i <= BUFFER_SIZE; i++) {
    const d = addDays(c, i);
    const key = toApiDate(d);

    if (d >= mn && d <= mx && allowedDates.has(key)) {
      windowDates.push(d);

      if (key === centerKey) {
        activeIndex = windowDates.length - 1;
      }
    }
  }

  return { dates: windowDates, activeIndex };
};

export const DayCarousel = ({
  selectedDate,
  dates,
  minDate,
  maxDate,
  onDateChange,
  onFoodLogClick,
  deletingId,
}: DayCarouselProps) => {
  const allowedDates = useMemo(
    () => new Set(dates.map((date) => toApiDate(startOfDay(date)))),
    [dates],
  );

  const [windowData, setWindowData] = useState<WindowData>(() =>
    generateWindow(selectedDate, minDate, maxDate, allowedDates),
  );

  const [emblaRef, emblaApi] = useEmblaCarousel({
    startIndex: windowData.activeIndex,
    containScroll: 'keepSnaps',
  });

  const windowRef = useRef(windowData);
  useEffect(() => {
    windowRef.current = windowData;
  }, [windowData]);

  const isSilentJump = useRef(false);

  useEffect(() => {
    if (!emblaApi) return;

    const currentKey = toApiDate(startOfDay(selectedDate));
    if (!allowedDates.has(currentKey)) return;

    const currentSnap = emblaApi.selectedScrollSnap();
    const currentlyVisibleDate = windowRef.current.dates[currentSnap];

    if (currentlyVisibleDate && isSameDay(currentlyVisibleDate, selectedDate)) {
      return;
    }

    const existingIndex = windowRef.current.dates.findIndex((d) =>
      isSameDay(d, selectedDate),
    );

    if (
      existingIndex >= 4 &&
      existingIndex <= windowRef.current.dates.length - 5
    ) {
      emblaApi.scrollTo(existingIndex);
    } else {
      isSilentJump.current = true;
      const newData = generateWindow(
        selectedDate,
        minDate,
        maxDate,
        allowedDates,
      );

      flushSync(() => {
        setWindowData(newData);
      });

      emblaApi.reInit();
      emblaApi.scrollTo(newData.activeIndex, true);
      isSilentJump.current = false;
    }
  }, [selectedDate, minDate, maxDate, emblaApi, allowedDates]);

  useEffect(() => {
    if (!emblaApi) return;

    const onSelect = () => {
      if (isSilentJump.current) return;

      const index = emblaApi.selectedScrollSnap();
      const newCenter = windowRef.current.dates[index];
      if (!newCenter) return;

      const key = toApiDate(startOfDay(newCenter));
      if (!allowedDates.has(key)) {
        const currentIndex = windowRef.current.dates.findIndex((d) =>
          isSameDay(d, selectedDate),
        );

        if (currentIndex >= 0) {
          isSilentJump.current = true;
          emblaApi.scrollTo(currentIndex, true);
          queueMicrotask(() => {
            isSilentJump.current = false;
          });
        }

        return;
      }

      onDateChange(newCenter);
    };

    const onSettle = () => {
      const index = emblaApi.selectedScrollSnap();
      const currentCenter = windowRef.current.dates[index];
      if (!currentCenter) return;

      const isNearStart =
        index <= 5 &&
        !isSameDay(windowRef.current.dates[0], startOfDay(minDate));

      const isNearEnd =
        index >= windowRef.current.dates.length - 6 &&
        !isSameDay(
          windowRef.current.dates[windowRef.current.dates.length - 1],
          startOfDay(maxDate),
        );

      if (isNearStart || isNearEnd) {
        isSilentJump.current = true;
        const newData = generateWindow(
          currentCenter,
          minDate,
          maxDate,
          allowedDates,
        );

        flushSync(() => {
          setWindowData(newData);
        });

        emblaApi.reInit();
        emblaApi.scrollTo(newData.activeIndex, true);
        isSilentJump.current = false;
      }
    };

    emblaApi.on('select', onSelect);
    emblaApi.on('settle', onSettle);

    return () => {
      emblaApi.off('select', onSelect);
      emblaApi.off('settle', onSettle);
    };
  }, [emblaApi, minDate, maxDate, onDateChange, selectedDate, allowedDates]);

  const selectedIndex = windowData.dates.findIndex((d) =>
    isSameDay(d, selectedDate),
  );

  const centerIndex =
    selectedIndex !== -1 ? selectedIndex : windowData.activeIndex;

  return (
    <div className="h-full overflow-hidden" ref={emblaRef}>
      <div className="flex h-full">
        {windowData.dates.map((date, index) => {
          const isVisible = Math.abs(index - centerIndex) <= 3;
          const isActive = isSameDay(date, selectedDate);

          return (
            <div key={date.toISOString()} className="min-w-0 flex-[0_0_100%]">
              {isVisible ? (
                <DayContent
                  date={date}
                  isActive={isActive}
                  onFoodLogClick={onFoodLogClick}
                  deletingId={deletingId}
                />
              ) : (
                <div className="h-full w-full" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
