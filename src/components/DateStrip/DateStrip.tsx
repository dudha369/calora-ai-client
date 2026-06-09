import { useEffect, useRef } from "react";
import useEmblaCarousel from "embla-carousel-react";

import { DateStripItem } from "./DateStripItem";
import { isSameDay, toApiDate, startOfDay } from "../../utils/date";

interface Props {
  dates: Date[];
  selectedDate: Date;
  today: Date;
  /** Дата создания аккаунта — дни раньше неё недоступны */
  minDate: Date;
  datesWithData: Set<string> | undefined;
  onSelect: (date: Date) => void;
}

export const DateStrip = ({
                            dates, selectedDate, today, minDate, datesWithData, onSelect,
                          }: Props) => {
  const minNorm = startOfDay(minDate);

  const startIndex = Math.max(
    0,
    dates.findIndex((d) => isSameDay(d, selectedDate)),
  );

  const [emblaRef, emblaApi] = useEmblaCarousel({
    align:         "center",
    containScroll: "keepSnaps",
    dragFree:      true,
    startIndex,
  });

  // Колёсико мыши — desktop
  const wrapperRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const node = wrapperRef.current;
    if (!node || !emblaApi) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const delta = Math.abs(e.deltaX) >= Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
      if (delta > 0) emblaApi.scrollNext();
      else if (delta < 0) emblaApi.scrollPrev();
    };
    node.addEventListener("wheel", onWheel, { passive: false });
    return () => node.removeEventListener("wheel", onWheel);
  }, [emblaApi]);

  // Скролл при смене selectedDate внутри того же месяца
  useEffect(() => {
    if (!emblaApi) return;
    const idx = dates.findIndex((d) => isSameDay(d, selectedDate));
    if (idx !== -1) emblaApi.scrollTo(idx, false);
  }, [emblaApi, selectedDate, dates]);

  return (
    // Нет max-width — карусель всегда растянута на всю ширину секции (portrait и landscape)
    <div ref={wrapperRef} className="w-full">
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex gap-px">
          {dates.map((date) => {
            const isFuture     = !isSameDay(date, today) && date > today;
            const isBeforeMin  = date < minNorm;
            const dateStr      = toApiDate(date);
            const hasData      = datesWithData ? datesWithData.has(dateStr) : undefined;

            return (
              <DateStripItem
                key={dateStr}
                date={date}
                isSelected={isSameDay(date, selectedDate)}
                isToday={isSameDay(date, today)}
                isFuture={isFuture}
                isBeforeMin={isBeforeMin}
                hasData={(isFuture || isBeforeMin) ? undefined : hasData}
                onClick={() => onSelect(date)}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
};
