import { useEffect, useRef, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";

import { DateStripItem } from "./DateStripItem";
import { isSameDay, toApiDate, startOfDay } from "../../utils/date";

interface Props {
  dates: Date[];
  selectedDate: Date;
  today: Date;
  minDate: Date;
  datesWithData: Set<string> | undefined;
  onSelect: (date: Date) => void;
}

export const DateStrip = ({
                            dates,
                            selectedDate,
                            today,
                            minDate,
                            datesWithData,
                            onSelect,
                          }: Props) => {
  const minNorm = startOfDay(minDate);

  const startIndex = Math.max(
    0,
    dates.findIndex((d) => isSameDay(d, selectedDate))
  );

  const [visibleCount, setVisibleCount] = useState(7);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const wheelAccumRef = useRef(0);
  const wheelResetTimerRef = useRef<number | null>(null);

  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: "center",
    containScroll: "keepSnaps",
    dragFree: true,
    startIndex,
  });

  useEffect(() => {
    const node = wrapperRef.current;
    if (!node || !emblaApi) return;

    const THRESHOLD = 40;
    const RESET_DELAY = 120;

    const onWheel = (e: WheelEvent) => {
      const target = wrapperRef.current;
      if (!target || !target.contains(e.target as Node)) return;

      const delta =
        Math.abs(e.deltaX) >= Math.abs(e.deltaY) ? e.deltaX : e.deltaY;

      if (delta === 0) return;

      e.preventDefault();

      wheelAccumRef.current += delta;

      if (wheelResetTimerRef.current !== null) {
        window.clearTimeout(wheelResetTimerRef.current);
      }

      wheelResetTimerRef.current = window.setTimeout(() => {
        wheelAccumRef.current = 0;
      }, RESET_DELAY);

      if (Math.abs(wheelAccumRef.current) < THRESHOLD) return;

      if (wheelAccumRef.current > 0) {
        emblaApi.scrollNext();
      } else {
        emblaApi.scrollPrev();
      }

      wheelAccumRef.current = 0;
    };

    node.addEventListener("wheel", onWheel, { passive: false });

    return () => {
      node.removeEventListener("wheel", onWheel);

      if (wheelResetTimerRef.current !== null) {
        window.clearTimeout(wheelResetTimerRef.current);
        wheelResetTimerRef.current = null;
      }

      wheelAccumRef.current = 0;
    };
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;

    const index = dates.findIndex((d) => isSameDay(d, selectedDate));
    if (index >= 0) emblaApi.scrollTo(index);
  }, [emblaApi, selectedDate, dates]);

  useEffect(() => {
    const node = wrapperRef.current;
    if (!node) return;

    const observer = new ResizeObserver((entries) => {
      const { width } = entries[0].contentRect;

      const MAX_ITEM_WIDTH = 58;
      const GAP = 4;

      let count = Math.floor((width + GAP) / (MAX_ITEM_WIDTH + GAP));
      if (count < 5) count = 5;
      if (count % 2 === 0) count -= 1;
      if (count < 5) count = 5;

      setVisibleCount(count);
    });

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={wrapperRef} className="w-full overflow-hidden">
      <div ref={emblaRef} className="overflow-hidden">
        <div className="flex gap-1">
          {dates.map((date) => {
            const isFuture = !isSameDay(date, today) && date > today;
            const isBeforeMin = date < minNorm;
            const dateStr = toApiDate(date);
            const hasData = datesWithData ? datesWithData.has(dateStr) : false;

            return (
              <DateStripItem
                key={dateStr}
                date={date}
                isSelected={isSameDay(date, selectedDate)}
                isToday={isSameDay(date, today)}
                isFuture={isFuture}
                isBeforeMin={isBeforeMin}
                hasData={isFuture || isBeforeMin ? undefined : hasData}
                onClick={() => onSelect(date)}
                visibleCount={visibleCount}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
};
