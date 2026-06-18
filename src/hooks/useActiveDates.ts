import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { stats } from '../api/stats';
import { toApiDate } from '../utils/date';

/**
 * Возвращает Set<string> (YYYY-MM-DD) дат, за которые у пользователя есть
 * хотя бы одна запись (еда или вода), в диапазоне [from, to] включительно.
 *
 * Используется и в DateStrip (карусель на главном экране), и в Calendar
 * (модалка выбора даты) — обе показывают одну и ту же точку-маркер под
 * датами с данными, поэтому логика загрузки и кеширования вынесена сюда,
 * а не продублирована в двух местах.
 */
export function useActiveDates(from: Date, to: Date) {
  const fromStr = toApiDate(from);
  const toStr = toApiDate(to);

  const { data } = useQuery({
    queryKey: ['stats', 'active-dates', fromStr, toStr],
    queryFn: async () => (await stats.getActiveDates(fromStr, toStr)).data,
    staleTime: 5 * 60 * 1000,
  });

  return useMemo(() => new Set(data?.dates ?? []), [data]);
}
