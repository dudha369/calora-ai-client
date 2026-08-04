import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { NavItem } from './NavItem';
import { FabButton } from './FabButton';
import { House, GlassWater, Plus, ChartNoAxesColumn, User } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useScanner } from '@/features/scanner/hooks/useScanner';
import {
  useDeviceOrientationAngle,
  iconCounterRotationDeg,
} from '../../hooks/useDeviceOrientationAngle';
import { useTelegram } from '@/shared/hooks/useTelegram';
import { QuickActionsOverlay } from '@/shared/ui/QuickActions/QuickActionsOverlay';

const ICON_SIZE = 24;

export const NavigationBar = () => {
  const theme = useTheme();
  const { t } = useTranslation('common');
  const { safeBottom } = useTelegram();
  const { isLiveCamera, shutterHandler } = useScanner();
  const deviceAngle = useDeviceOrientationAngle(isLiveCamera);

  const iconRotation = isLiveCamera ? iconCounterRotationDeg(deviceAngle) : 0;
  const isBarRotated = isLiveCamera && deviceAngle !== 0;

  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Пока ScannerPage зарегистрировал shutterHandler (живое фото еды) — FAB
  // работает как затвор, а не как переключатель меню.
  const handleFabClick = () => {
    if (shutterHandler) {
      shutterHandler();
      return;
    }
    setIsMenuOpen((v) => !v);
  };

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
            isOpen={!shutterHandler && isMenuOpen}
            onToggle={handleFabClick}
            icon={<Plus strokeWidth={3.5} size={ICON_SIZE + 12} />}
            label={shutterHandler ? t('nav.capture') : t('nav.add')}
            navbarColor={theme.secondary_bg_color}
            iconRotation={iconRotation}
            variant={shutterHandler ? 'shutter' : 'menu'}
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

      {isMenuOpen && !shutterHandler && (
        <QuickActionsOverlay onClose={() => setIsMenuOpen(false)} />
      )}
    </footer>
  );
};
