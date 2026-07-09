import { useEffect, useMemo, useRef, useState } from 'react';
import { flushSync } from 'react-dom';
import useEmblaCarousel from 'embla-carousel-react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { getIntlLocale, capitalizeFirst } from '@/shared/lib/locale';

import { useTheme } from '@/shared/context/ThemeContext';
import { startOfDay } from '@/shared/lib/date';
import {
  generateMonthWindow,
  isSameMonth,
  type MonthWindowData,
} from '../../lib/calendarMonths';
import { MonthGrid } from './MonthGrid';
import { BottomSheet } from '@/shared/ui/BottomSheet.tsx';

interface CalendarProps {
  selectedDate: Date;
  minDate: Date;
  maxDate: Date;
  onSelect: (date: Date) => void;
  onClose: () => void;
}

const RENDER_RADIUS = 1;

export const Calendar = ({
  selectedDate,
  minDate,
  maxDate,
  onSelect,
  onClose,
}: CalendarProps) => {
  const theme = useTheme();
  const { t, i18n } = useTranslation('common');
  const locale = getIntlLocale(i18n.language);
  const today = startOfDay(new Date());

  const minNorm = useMemo(() => startOfDay(minDate), [minDate]);
  const maxNorm = useMemo(() => startOfDay(maxDate), [maxDate]);

  const dayHeaders = useMemo(
    () =>
      Array.from({ length: 7 }, (_, i) =>
        capitalizeFirst(
          new Intl.DateTimeFormat(locale, { weekday: 'short' }).format(
            new Date(2024, 0, 1 + i),
          ),
        ),
      ),
    [locale],
  );

  const [windowData, setWindowData] = useState<MonthWindowData>(() =>
    generateMonthWindow(selectedDate, minNorm, maxNorm),
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
  const [activeIndex, setActiveIndex] = useState(windowData.activeIndex);

  // Свайп пальцем и клик по стрелкам ведут к одному и тому же emblaApi —
  // единственный источник правды о "текущем" месяце, не два рассинхронных state.
  useEffect(() => {
    if (!emblaApi) return;

    const onSelect = () => {
      if (isSilentJump.current) return;
      setActiveIndex(emblaApi.selectedScrollSnap());
    };

    // Регенерация окна при приближении к его краю — тот же приём,
    // что onSettle в DayCarousel.tsx.
    const onSettle = () => {
      const index = emblaApi.selectedScrollSnap();
      const current = windowRef.current.months[index];
      if (!current) return;

      const isNearStart =
        index <= 1 && !isSameMonth(windowRef.current.months[0], minNorm);
      const isNearEnd =
        index >= windowRef.current.months.length - 2 &&
        !isSameMonth(
          windowRef.current.months[windowRef.current.months.length - 1],
          maxNorm,
        );

      if (isNearStart || isNearEnd) {
        isSilentJump.current = true;
        const next = generateMonthWindow(current, minNorm, maxNorm);

        flushSync(() => {
          setWindowData(next);
          setActiveIndex(next.activeIndex);
        });

        emblaApi.reInit();
        emblaApi.scrollTo(next.activeIndex, true);
        isSilentJump.current = false;
      }
    };

    emblaApi.on('select', onSelect);
    emblaApi.on('settle', onSettle);
    return () => {
      emblaApi.off('select', onSelect);
      emblaApi.off('settle', onSettle);
    };
  }, [emblaApi, minNorm, maxNorm]);

  const currentMonth = windowData.months[activeIndex] ?? windowData.months[0];

  const monthLabel = useMemo(
    () =>
      capitalizeFirst(
        new Intl.DateTimeFormat(locale, {
          month: 'long',
          year: 'numeric',
        }).format(currentMonth),
      ),
    [locale, currentMonth],
  );

  const canGoPrev = activeIndex > 0;
  const canGoNext = activeIndex < windowData.months.length - 1;

  const prevMonth = () => emblaApi?.scrollTo(activeIndex - 1);
  const nextMonth = () => emblaApi?.scrollTo(activeIndex + 1);

  const handleSelect = (d: Date) => {
    onSelect(d);
    onClose();
  };

  return (
    <BottomSheet
      onClose={onClose}
      title={monthLabel}
      actionLabel={t('buttons.open_today')}
      onAction={() => handleSelect(today)}
      actionDisabled={selectedDate.getTime() === today.getTime()}
      titleClassName="justify-between mb-2 px-6"
      renderTitle={(defaultTitle) => (
        <>
          <button
            onClick={prevMonth}
            disabled={!canGoPrev}
            className="rounded-xl p-2 transition-opacity"
            style={{
              backgroundColor: theme.section_bg_color,
              color: canGoPrev ? theme.button_text_color : theme.hint_color,
              cursor: canGoPrev ? 'pointer' : 'not-allowed',
            }}
          >
            <ChevronLeft size={18} />
          </button>

          <div>{defaultTitle}</div>

          <button
            onClick={nextMonth}
            disabled={!canGoNext}
            className="rounded-xl p-2 transition-opacity"
            style={{
              backgroundColor: theme.section_bg_color,
              color: canGoNext ? theme.button_text_color : theme.hint_color,
              cursor: canGoNext ? 'pointer' : 'not-allowed',
            }}
          >
            <ChevronRight size={18} />
          </button>
        </>
      )}
    >
      <div className="mb-1 grid grid-cols-7 gap-1.5">
        {dayHeaders.map((h) => (
          <div
            key={h}
            className="py-1 text-center text-xs font-medium"
            style={{ color: theme.hint_color }}
          >
            {h}
          </div>
        ))}
      </div>

      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex">
          {windowData.months.map((m, index) => {
            const isRendered = Math.abs(index - activeIndex) <= RENDER_RADIUS;
            return (
              <div
                key={`${m.getFullYear()}-${m.getMonth()}`}
                className="min-w-0 flex-[0_0_100%]"
              >
                {isRendered ? (
                  <MonthGrid
                    year={m.getFullYear()}
                    month={m.getMonth()}
                    selectedDate={selectedDate}
                    today={today}
                    minDate={minDate}
                    maxDate={maxDate}
                    onSelect={handleSelect}
                  />
                ) : (
                  <div className="grid grid-cols-7 gap-1.5">
                    {Array.from({ length: 35 }, (_, i) => (
                      <div key={i} className="aspect-square" />
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </BottomSheet>
  );
};
