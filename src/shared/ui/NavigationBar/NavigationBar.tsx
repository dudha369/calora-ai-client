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
 * Навигационная панель с двумя режимами отображения:
 *
 * 1. Обычный (horizontal) — горизонтальная полоска внизу экрана.
 *    Используется на всех страницах и на сканере в portrait.
 *
 * 2. Scanner-landscape (vertical sidebar) — вертикальная полоска
 *    на стороне экрана, соответствующей физическому низу телефона.
 *    Используется только когда isLiveCamera=true и устройство в landscape.
 *    Иконки counter-rotate чтобы выглядеть прямо для пользователя.
 *
 * Позиция sidebar зависит от угла поворота:
 *   angle=90  (CCW rotation) → физический низ = RIGHT  → sidebar справа
 *   angle=270 (CW rotation)  → физический низ = LEFT   → sidebar слева
 */
export const NavigationBar = ({ safeBottom }: NavigationBarProps) => {
  const theme = useTheme();
  const { t } = useTranslation('common');

  const { isLiveCamera } = useScanner();
  const deviceAngle = useDeviceOrientationAngle(isLiveCamera);
  const iconRotation = isLiveCamera ? iconCounterRotationDeg(deviceAngle) : 0;
  const isBarRotated = isLiveCamera && deviceAngle !== 0;

  // Landscape sidebar mode: только при живой камере в landscape
  const isLandscape =
    isLiveCamera && (deviceAngle === 90 || deviceAngle === 270);
  const navSide: 'left' | 'right' =
    deviceAngle === 270 ? 'left' : 'right';

  // ── Landscape sidebar: фиксированная вертикальная полоска ──────────────
  if (isLandscape) {
    return (
      <footer
        className="fixed top-0 z-50 flex items-center"
        style={{
          [navSide]: 0,
          width: 64,
          height: '100%',
          backgroundColor: `${theme.secondary_bg_color}CC`,
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
        }}
      >
        <nav className="flex h-full w-full flex-col items-center justify-evenly py-2">
          <NavItem
            to="/"
            icon={<House size={ICON_SIZE} />}
            label={t('nav.home')}
            iconRotation={iconRotation}
            isBarRotated={isBarRotated}
            vertical
          />
          <NavItem
            to="/water"
            icon={<GlassWater size={ICON_SIZE} />}
            label={t('nav.water')}
            iconRotation={iconRotation}
            isBarRotated={isBarRotated}
            vertical
          />

          <FabButton
            to="/scanner"
            icon={<Plus strokeWidth={3.5} size={ICON_SIZE + 12} />}
            activeIcon={<Camera strokeWidth={2} size={ICON_SIZE + 8} />}
            label={t('nav.scanner')}
            navbarColor={`${theme.secondary_bg_color}CC`}
            iconRotation={iconRotation}
            vertical
            navSide={navSide}
          />

          <NavItem
            to="/analytics"
            icon={<ChartNoAxesColumn size={ICON_SIZE} />}
            label={t('nav.analytics')}
            iconRotation={iconRotation}
            isBarRotated={isBarRotated}
            vertical
          />
          <NavItem
            to="/profile"
            icon={<User size={ICON_SIZE} />}
            label={t('nav.profile')}
            iconRotation={iconRotation}
            isBarRotated={isBarRotated}
            vertical
          />
        </nav>
      </footer>
    );
  }

  // ── Обычный горизонтальный режим ──────────────────────────────────────────
  return (
    <footer
      className="w-full shrink-0"
      style={{ backgroundColor: theme.secondary_bg_color }}
    >
      <div
        className="mx-auto w-full max-w-screen-sm"
        style={{ paddingBottom: safeBottom ? 10 : 0 }}
      >
        <nav className="flex h-16 items-center justify-evenly">
          <NavItem
            to="/"
            icon={<House size={ICON_SIZE} />}
            label={t('nav.home')}
            iconRotation={iconRotation}
            isBarRotated={isBarRotated}
          />
          <NavItem
            to="/water"
            icon={<GlassWater size={ICON_SIZE} />}
            label={t('nav.water')}
            iconRotation={iconRotation}
            isBarRotated={isBarRotated}
          />

          <FabButton
            to="/scanner"
            icon={<Plus strokeWidth={3.5} size={ICON_SIZE + 12} />}
            activeIcon={<Camera strokeWidth={2} size={ICON_SIZE + 8} />}
            label={t('nav.scanner')}
            navbarColor={theme.secondary_bg_color}
            iconRotation={iconRotation}
          />

          <NavItem
            to="/analytics"
            icon={<ChartNoAxesColumn size={ICON_SIZE} />}
            label={t('nav.analytics')}
            iconRotation={iconRotation}
            isBarRotated={isBarRotated}
          />
          <NavItem
            to="/profile"
            icon={<User size={ICON_SIZE} />}
            label={t('nav.profile')}
            iconRotation={iconRotation}
            isBarRotated={isBarRotated}
          />
        </nav>
      </div>
    </footer>
  );
};
