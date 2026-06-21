import type { ReactNode } from 'react';
import { RefreshCw } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { usePullToRefresh } from '../hooks/usePullToRefresh';
import { useScrollContainer } from '../hooks/useScrollContainer';

interface PullToRefreshProps {
  /** Запрашивает свежие данные; индикатор остаётся видимым, пока promise не resolve-ится */
  onRefresh: () => Promise<void>;
  children: ReactNode;
}

const INDICATOR_SIZE = 36;

/**
 * Оборачивает часть страницы, которую можно "оттянуть" жестом pull-to-refresh,
 * не задевая то, что нарисовано снаружи обёртки — например, sticky-шапку над ней.
 *
 * Жест активен, только когда ближайший реальный скролл-контейнер (см.
 * ScrollContainerContext) находится в самом верху — иначе это обычный скролл
 * списка под пальцем, а не запрос на обновление.
 */
export const PullToRefresh = ({ onRefresh, children }: PullToRefreshProps) => {
  const theme = useTheme();
  const scrollContainerRef = useScrollContainer();
  const { contentRef, indicatorRef, iconRef, isRefreshing, isArmed } =
    usePullToRefresh({ scrollContainerRef, onRefresh });

  const iconColor =
    isRefreshing || isArmed ? theme.button_color : theme.hint_color;

  return (
    <div className="relative">
      {/* Индикатор живёт над контентом и до жеста полностью скрыт за его
          верхним краем — раскрывается тем же transform, что и сам контент,
          поэтому визуально выглядит частью одной "оттягиваемой" поверхности. */}
      <div
        ref={indicatorRef}
        className="pointer-events-none absolute inset-x-0 flex justify-center opacity-0 will-change-transform"
        style={{ top: -INDICATOR_SIZE - 8, height: INDICATOR_SIZE }}
      >
        <div
          className="flex items-center justify-center rounded-full shadow-sm"
          style={{
            width: INDICATOR_SIZE,
            height: INDICATOR_SIZE,
            backgroundColor: theme.section_bg_color,
          }}
        >
          <div ref={iconRef}>
            <RefreshCw
              size={18}
              className={isRefreshing ? 'animate-spin' : ''}
              style={{ color: iconColor }}
            />
          </div>
        </div>
      </div>

      <div ref={contentRef} className="will-change-transform">
        {children}
      </div>
    </div>
  );
};
