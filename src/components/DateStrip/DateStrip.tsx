import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import useEmblaCarousel from 'embla-carousel-react';

import { DateStripItem } from './DateStripItem';
import { isSameDay, toApiDate, startOfDay } from '../../utils/date';

const GAP = 4; // px между элементами
const MIN_ITEM = 48; // px — минимальная ширина элемента
const MAX_ITEM = 64; // px — максимальная ширина (на широких экранах не растягиваем)

const WHEEL_COOLDOWN_MS = 350; // блокировка между шагами скролла колёсиком

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
   * ГЛАВНЫЙ ФИКС.
   *
   * Раньше `startIndex` пересчитывался на каждый рендер из `selectedDate`
   * и передавался прямо в `useEmblaCarousel({ ..., startIndex })`.
   * embla-carousel-react сравнивает опции между рендерами и при изменении
   * `startIndex` вызывает `reInit()` — а из-за `align: "center"` это
   * заново центрирует карусель на новом индексе, проигрывая scroll-анимацию.
   *
   * Именно эта непрошеная reInit-анимация:
   *  - визуально "перелистывала" карусель при каждом тапе;
   *  - на скриншоте показывала "половинки" элементов (это нормальный
   *    промежуточный кадр ЛЮБОЙ карусели во время скролла);
   *  - могла давать кадр, где border на старом/новом элементе
   *    рассинхронизирован с реальным выбором ("залипший" border).
   *
   * Фикс: startIndex вычисляется ОДИН РАЗ при монтировании (lazy useState).
   * При смене месяца компонент пересоздаётся через key={monthKey} в
   * родителе — стартовый индекс пересчитается корректно для нового месяца.
   * После монтирования опции Embla НИКОГДА не меняются → reInit() Embla
   * не вызывает сам по себе → тап только меняет props (border/bg), без
   * единого пикселя скролла.
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

  const [emblaRef, emblaApi] = useEmblaCarousel(emblaOptions);

  // Реальное изменение геометрии (поворот экрана/resize) — пересчёт нужен.
  // startIndex теперь не входит в зависимости опций, поэтому это
  // единственный источник reInit, и он срабатывает только при
  // фактическом изменении count/itemWidth.
  useEffect(() => {
    if (layout) emblaApi?.reInit();
  }, [emblaApi, layout]);

  /**
   * Колёсико мыши — desktop.
   *
   * Раньше каждое wheel-событие сразу вызывало scrollNext/scrollPrev.
   * Трекпады и колёсики генерируют десятки событий за секунду — каждое
   * прерывало предыдущую анимацию и запускало новую, из-за чего скролл
   * выглядел дёрганым и "слишком быстрым".
   *
   * Теперь — простой cooldown: один шаг карусели на один "тик" колёсика,
   * следующий шаг возможен не раньше чем через WHEEL_COOLDOWN_MS.
   * Анимация каждого шага успевает доиграть полностью — плавно.
   */
  useEffect(() => {
    const node = wrapperRef.current;
    if (!node || !emblaApi) return;

    let lastScroll = 0;

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();

      const now = Date.now();
      if (now - lastScroll < WHEEL_COOLDOWN_MS) return;

      const delta =
        Math.abs(e.deltaX) >= Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
      if (delta > 0) emblaApi.scrollNext();
      else if (delta < 0) emblaApi.scrollPrev();

      lastScroll = now;
    };

    node.addEventListener('wheel', onWheel, { passive: false });
    return () => node.removeEventListener('wheel', onWheel);
  }, [emblaApi]);

  /**
   * Скролл к дате — ТОЛЬКО при выборе через CalendarPicker
   * (selectDateExternal → pendingScrollDate). При тапе по карусели
   * pendingScrollDate остаётся null — Embla не трогается вообще.
   *
   * `emblaApi.scrollTo(index)` без `jump: true` анимирует переход —
   * это и есть плавное центрирование при выборе из календаря.
   */
  useEffect(() => {
    if (!emblaApi || pendingScrollDate === null) return;
    const index = dates.findIndex((d) => isSameDay(d, pendingScrollDate));
    if (index >= 0) {
      emblaApi.scrollTo(index);
      onScrollConsumed();
    }
  }, [emblaApi, pendingScrollDate, dates, onScrollConsumed]);

  if (!layout) {
    return <div ref={wrapperRef} className="w-full" style={{ height: 60 }} />;
  }

  const { count, itemWidth } = layout;
  const viewportWidth = count * itemWidth + (count - 1) * GAP;

  return (
    <div ref={wrapperRef} className="w-full">
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
