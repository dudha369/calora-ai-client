import { useEffect, useState } from 'react';

/**
 * Остаток времени до дедлайна в миллисекундах, обновляется раз в 30с.
 *
 * 30-секундный тик — сознательный компромисс: для окна восстановления
 * в 48 часов секундная точность не нужна (UI показывает только часы и
 * минуты), а более редкий интервал не держит компонент с активным
 * таймером чаще, чем реально нужно для гладкого UX.
 *
 * @param deadlineIso ISO-дата дедлайна или null, если таймер не нужен.
 */
export function useCountdown(deadlineIso: string | null): number {
  const deadline = deadlineIso ? new Date(deadlineIso).getTime() : null;
  const [remaining, setRemaining] = useState(() =>
    deadline ? Math.max(0, deadline - Date.now()) : 0,
  );

  useEffect(() => {
    if (!deadline) {
      setRemaining(0);
      return;
    }

    const tick = () => setRemaining(Math.max(0, deadline - Date.now()));
    tick();

    const id = window.setInterval(tick, 30_000);
    return () => window.clearInterval(id);
  }, [deadline]);

  return remaining;
}

/** Форматирует остаток мс в целые часы и минуты для отображения "чч ч мм м". */
export function formatCountdown(ms: number): {
  hours: number;
  minutes: number;
} {
  const totalMinutes = Math.floor(ms / 60_000);
  return {
    hours: Math.floor(totalMinutes / 60),
    minutes: totalMinutes % 60,
  };
}
