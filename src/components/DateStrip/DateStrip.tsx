import { useEffect, useRef, useCallback } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { CalendarDays } from "lucide-react";

import { DateStripItem } from "./DateStripItem";
import { isSameDay, toApiDate, startOfDay } from "../../utils/date";
import { useTheme } from "../../context/ThemeContext";

interface Props {
  dates: Date[];
  selectedDate: Date;
  today: Date;
  datesWithData: Set<string> | undefined;
  onSelect: (date: Date) => void;
}

export const DateStrip = ({
                            dates,
                            selectedDate,
                            today,
                            datesWithData,
                            onSelect,
                          }: Props) => {
  const theme = useTheme();

  // Начальная позиция — selectedDate по центру.
  // Вычисляем один раз при маунте (Embla использует startIndex только при init).
  // При смене месяца компонент перемонтируется (key={monthKey} в родителе),
  // поэтому всегда получает актуальную startIndex.
  const startIndex = Math.max(
    0,
    dates.findIndex((d) => isSameDay(d, selectedDate)),
  );

  const [emblaRef, emblaApi] = useEmblaCarousel({
    align:         "center",
    containScroll: false,  // без ограничений по краям — убирает эффект "возврата"
    dragFree:      true,   // инерционная прокрутка — быстрый свайп работает естественно
    startIndex,
  });

  // Внешний wrapper — для обработчика колёсика
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Поддержка колёсика мыши (desktop)
  useEffect(() => {
    const node = wrapperRef.current;
    if (!node || !emblaApi) return;

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      // Используем горизонтальную дельту если она больше, иначе вертикальную
      const delta = Math.abs(e.deltaX) >= Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
      if (delta > 0) emblaApi.scrollNext();
      else if (delta < 0) emblaApi.scrollPrev();
    };

    node.addEventListener("wheel", onWheel, { passive: false });
    return () => node.removeEventListener("wheel", onWheel);
  }, [emblaApi]);

  // Когда selectedDate меняется внутри того же месяца — прокручиваем к ней
  useEffect(() => {
    if (!emblaApi) return;
    const idx = dates.findIndex((d) => isSameDay(d, selectedDate));
    if (idx !== -1) emblaApi.scrollTo(idx, false);
  }, [emblaApi, selectedDate, dates]);

  // ── Календарь ────────────────────────────────────────────────────────────
  const calendarRef = useRef<HTMLInputElement>(null);

  const openCalendar = useCallback(() => {
    const input = calendarRef.current;
    if (!input) return;

    // Проверяем прототип: TypeScript не будет трогать тип переменной input
    if ('showPicker' in HTMLInputElement.prototype) {
      input.showPicker(); // Сложный каст больше не нужен, TS уже знает про этот метод!
    } else {
      input.click();      // Теперь здесь нормальный HTMLInputElement, ошибка исчезнет
    }
  }, []);

  const handleCalendarChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (!e.target.value) return;
      // + "T00:00:00" предотвращает сдвиг часового пояса
      onSelect(startOfDay(new Date(e.target.value + "T00:00:00")));
    },
    [onSelect],
  );

  const todayStr = toApiDate(today);
  // Минимальная дата = 1 год назад
  const minDate = toApiDate(
    new Date(today.getFullYear() - 1, today.getMonth(), today.getDate()),
  );

  return (
    <div className="flex items-center gap-2">
      {/* Карусель */}
      <div ref={wrapperRef} className="flex-1 min-w-0">
        <div className="overflow-hidden" ref={emblaRef}>
          <div className="flex">
            {dates.map((date) => {
              const isFuture = !isSameDay(date, today) && date > today;
              const dateStr  = toApiDate(date);
              const hasData  = datesWithData
                ? datesWithData.has(dateStr)
                : undefined;

              return (
                <DateStripItem
                  key={dateStr}
                  date={date}
                  isSelected={isSameDay(date, selectedDate)}
                  isToday={isSameDay(date, today)}
                  isFuture={isFuture}
                  hasData={isFuture ? undefined : hasData}
                  onClick={() => onSelect(date)}
                />
              );
            })}
          </div>
        </div>
      </div>

      {/* Кнопка открытия календаря */}
      <button
        onClick={openCalendar}
        className="flex-shrink-0 p-2 rounded-xl transition-opacity active:opacity-60"
        style={{
          backgroundColor: theme.section_bg_color,
          color: theme.hint_color,
        }}
        aria-label="Выбрать дату"
      >
        <CalendarDays size={18} />
      </button>

      {/* Скрытый input[type=date] — открывается программно */}
      <input
        ref={calendarRef}
        type="date"
        min={minDate}
        max={todayStr}
        value={toApiDate(selectedDate)}
        onChange={handleCalendarChange}
        className="sr-only"
        aria-hidden="true"
      />
    </div>
  );
};
