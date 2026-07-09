import { useTranslation } from 'react-i18next';
import { NavItem } from './NavItem';
import { FabButton } from './FabButton';
import {
  House,
  GlassWater,
  Plus,
  Camera,
  ChartNoAxesColumn,
  User,
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useScanner } from '@/features/scanner/hooks/useScanner';
import {
  useDeviceOrientationAngle,
  iconCounterRotationDeg,
} from '../../hooks/useDeviceOrientationAngle';

const ICON_SIZE = 24;

interface NavigationBarProps {
  safeBottom: number;
}

/**
 * Навигационная панель.
 *
 * В landscape-режиме сканера весь горизонтальный navbar поворачивается
 * целиком (rotate) и прижимается к стороне экрана, соответствующей
 * физическому низу телефона. Иконки, подписи и порядок — всё то же самое,
 * что и в portrait, просто повёрнуто как единый блок.
 *
 *   angle=90  → sidebar справа, rotate(-90deg)
 *   angle=270 → sidebar слева,  rotate(90deg)
 */
export const NavigationBar = ({ safeBottom }: NavigationBarProps) => {
  const theme = useTheme();
  const { t } = useTranslation('common');

  const { isLiveCamera } = useScanner();
  const deviceAngle = useDeviceOrientationAngle(isLiveCamera);
  const iconRotation = isLiveCamera ? iconCounterRotationDeg(deviceAngle) : 0;
  const isBarRotated = isLiveCamera && deviceAngle !== 0;

  const isLandscape =
    isLiveCamera && (deviceAngle === 90 || deviceAngle === 270);

  /* ── Общие элементы навигации ─────────────────────────────────────────── */
  const renderNav = (landscape: boolean) => {
    const barColor = landscape
      ? `${theme.secondary_bg_color}CC`
      : theme.secondary_bg_color;

    return (
      <nav className="flex h-16 items-center justify-evenly">
        <NavItem
          to="/"
          icon={<House size={ICON_SIZE} />}
          label={t('nav.home')}
          iconRotation={landscape ? 0 : iconRotation}
          isBarRotated={!landscape && isBarRotated}
        />
        <NavItem
          to="/water"
          icon={<GlassWater size={ICON_SIZE} />}
          label={t('nav.water')}
          iconRotation={landscape ? 0 : iconRotation}
          isBarRotated={!landscape && isBarRotated}
        />

        <FabButton
          to="/scanner"
          icon={<Plus strokeWidth={3.5} size={ICON_SIZE + 12} />}
          activeIcon={<Camera strokeWidth={2} size={ICON_SIZE + 8} />}
          label={t('nav.scanner')}
          navbarColor={barColor}
          iconRotation={landscape ? 0 : iconRotation}
        />

        <NavItem
          to="/analytics"
          icon={<ChartNoAxesColumn size={ICON_SIZE} />}
          label={t('nav.analytics')}
          iconRotation={landscape ? 0 : iconRotation}
          isBarRotated={!landscape && isBarRotated}
        />
        <NavItem
          to="/profile"
          icon={<User size={ICON_SIZE} />}
          label={t('nav.profile')}
          iconRotation={landscape ? 0 : iconRotation}
          isBarRotated={!landscape && isBarRotated}
        />
      </nav>
    );
  };

  // ── Landscape: весь горизонтальный navbar повёрнут на бок ──────────────
  if (isLandscape) {
    const rotation = deviceAngle === 90 ? -90 : 90;
    const side: 'left' | 'right' = deviceAngle === 270 ? 'left' : 'right';

    return (
      <footer
        className="fixed top-0 z-50 flex items-center justify-center"
        style={{
          [side]: 0,
          width: 64,
          height: '100%',
          backgroundColor: `${theme.secondary_bg_color}CC`,
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
        }}
      >
        {/* Горизонтальная полоска, повёрнутая целиком */}
        <div
          style={{
            width: '100vh',
            height: 64,
            transform: `rotate(${rotation}deg)`,
          }}
        >
          {renderNav(true)}
        </div>
      </footer>
    );
  }

  // ── Обычный горизонтальный режим ──────────────────────────────────────
  return (
    <footer
      className="w-full shrink-0"
      style={{ backgroundColor: theme.secondary_bg_color }}
    >
      <div
        className="mx-auto w-full max-w-screen-sm"
        style={{ paddingBottom: safeBottom ? 10 : 0 }}
      >
        {renderNav(false)}
      </div>
    </footer>
  );
};
