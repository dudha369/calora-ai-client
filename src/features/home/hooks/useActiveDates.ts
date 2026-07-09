import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { stats } from '@/shared/api/stats';
import { toApiDate } from '@/shared/lib/date';

export interface ActiveDateSets {
  foodDates: Set<string>;
  waterDates: Set<string>;
}

/**
 * Возвращает два независимых Set<string> (YYYY-MM-DD) — даты с записями
 * еды и даты с записями воды в диапазоне [from, to] включительно.
 *
 * Используется и в DateStrip (карусель на главном экране), и в Calendar
 * (модалка выбора даты) — оба показывают одну и ту же точку-маркер,
 * поэтому загрузка и преобразование данных вынесены в общий хук, а не
 * продублированы в двух компонентах.
 */
export function useActiveDates(from: Date, to: Date): ActiveDateSets {
  const fromStr = toApiDate(from);
  const toStr = toApiDate(to);

  const { data } = useQuery({
    queryKey: ['stats', 'active-dates', fromStr, toStr],
    queryFn: async () => (await stats.getActiveDates(fromStr, toStr)).data,
    staleTime: 5 * 60 * 1000,
  });

  return useMemo(() => {
    const foodDates = new Set<string>();
    const waterDates = new Set<string>();
    for (const entry of data?.dates ?? []) {
      if (entry.has_food) foodDates.add(entry.date);
      if (entry.has_water) waterDates.add(entry.date);
    }
    return { foodDates, waterDates };
  }, [data]);
}
