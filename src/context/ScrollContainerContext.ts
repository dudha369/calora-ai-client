import { createContext, type RefObject } from 'react';

/**
 * Реф на единственный реальный скролл-контейнер приложения — <main> в App.tsx,
 * внутри которого через <Outlet /> рендерятся все страницы.
 *
 * Это отдельный контекст, а не window/document, потому что скролл у window
 * отключён глобальным touch-action: none (см. index.css) — скроллится только
 * этот конкретный DOM-узел. Любому жесту, завязанному на позицию скролла
 * (pull-to-refresh, скрытие шапки при скролле и т.п.), нужен доступ именно к нему.
 */
export const ScrollContainerContext =
  createContext<RefObject<HTMLElement | null> | null>(null);
