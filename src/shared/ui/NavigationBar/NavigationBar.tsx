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
import { useTelegram } from '@/shared/hooks/useTelegram';

const ICON_SIZE = 24;

/**
 * Навигационная панель — всегда горизонтальная, внизу экрана.
 *
 * На странице сканера (isLiveCamera=true) при повороте устройства
 * каждая иконка counter-rotate чтобы оставаться "прямой" относительно
 * ориентации телефона. Layout самого navbar'а не меняется.
 */
export const NavigationBar = () => {
  const theme = useTheme();
  const { t } = useTranslation('common');

  const { safeBottom } = useTelegram();

  const { isLiveCamera } = useScanner();
  const deviceAngle = useDeviceOrientationAngle(isLiveCamera);

  // Иконки поворачиваются только на странице сканера
  const iconRotation = isLiveCamera ? iconCounterRotationDeg(deviceAngle) : 0;
  const isBarRotated = isLiveCamera && deviceAngle !== 0;

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
