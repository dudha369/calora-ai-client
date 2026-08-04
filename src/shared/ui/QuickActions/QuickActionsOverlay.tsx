import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useRef, useState, type ChangeEvent } from 'react';
import {
  Barcode,
  Scale,
  GlassWater,
  Camera,
  Search,
  PenLine,
  Mic,
} from 'lucide-react';
import { useTheme } from '@/shared/context/ThemeContext';
import { useTelegram } from '@/shared/hooks/useTelegram';
import { useModalAnimation } from '@/shared/hooks/useModalAnimation';
import { isIOSDevice } from '@/shared/lib/isIOSDevice';
import type { ScannerMode } from '@/features/scanner/types/ScannerMode';
import { QuickWeightSheet } from './QuickWeightSheet';
import { QuickWaterSheet } from './QuickWaterSheet';
import { FoodTextEntrySheet } from './FoodTextEntrySheet';
import { VoiceEntrySheet } from './VoiceEntrySheet';

interface QuickActionsOverlayProps {
  onClose: () => void;
}

type Sheet = 'weight' | 'water' | 'describe' | 'voice' | null;

const NAVBAR_CONTENT_HEIGHT = 64;

export const QuickActionsOverlay = ({ onClose }: QuickActionsOverlayProps) => {
  const theme = useTheme();
  const { t } = useTranslation('quick_actions');
  const navigate = useNavigate();
  const { safeBottom } = useTelegram();
  const { isVisible, handleClose } = useModalAnimation(onClose, 200);

  const navbarHeight = NAVBAR_CONTENT_HEIGHT + (safeBottom ? 10 : 0);

  const [sheet, setSheet] = useState<Sheet>(null);
  const pendingModeRef = useRef<ScannerMode>('food');
  const cameraInputRef = useRef<HTMLInputElement>(null);

  // Переход на другую страницу — закрываем меню МГНОВЕННО, без анимации:
  // если ждать её через handleClose() (200мс), новая страница может успеть
  // сменить контекст (например FAB перейдёт в режим затвора) раньше, чем
  // отработает таймер закрытия — тогда onClose() не будет вызван вовсе,
  // и меню зависнет открытым, вынырнув поверх экрана позже.
  const closeAndNavigate = (path: string) => {
    onClose();
    navigate(path);
  };

  const goToScanner = (mode: ScannerMode) => {
    if (isIOSDevice() && mode === 'food') {
      pendingModeRef.current = mode;
      cameraInputRef.current?.click();
      return;
    }
    onClose();
    navigate('/scanner', { state: { mode } });
  };

  const handleCameraFile = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      onClose();
      navigate('/scanner', {
        state: { photo: reader.result as string, mode: pendingModeRef.current },
      });
    };
    reader.readAsDataURL(file);
  };

  const closeSheetAndOverlay = () => {
    setSheet(null);
    onClose();
  };

  const topActions = [
    {
      key: 'barcode',
      icon: Barcode,
      label: t('menu.barcode'),
      onClick: () => goToScanner('barcode'),
    },
    {
      key: 'weight',
      icon: Scale,
      label: t('menu.weight'),
      onClick: () => setSheet('weight'),
    },
    {
      key: 'water',
      icon: GlassWater,
      label: t('menu.water'),
      onClick: () => setSheet('water'),
    },
  ] as const;

  const logActions = [
    {
      key: 'photo',
      icon: Camera,
      label: t('menu.food_photo'),
      onClick: () => goToScanner('food'),
    },
    {
      key: 'search',
      icon: Search,
      label: t('menu.search'),
      onClick: () => closeAndNavigate('/log/search'),
    },
    {
      key: 'text',
      icon: PenLine,
      label: t('menu.describe_food'),
      onClick: () => setSheet('describe'),
    },
    {
      key: 'voice',
      icon: Mic,
      label: t('menu.voice'),
      onClick: () => setSheet('voice'),
    },
  ] as const;

  return createPortal(
    <>
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handleCameraFile}
      />

      {sheet === null && (
        <div
          className="fixed inset-x-0 top-0 z-5 flex items-end justify-center"
          style={{
            bottom: navbarHeight,
            backgroundColor: 'rgba(0, 0, 0, 0.1)',
            backdropFilter: isVisible ? 'blur(1px)' : 'none',
            opacity: isVisible ? 1 : 0,
            pointerEvents: isVisible ? 'auto' : 'none',
            transition:
              'opacity 100ms ease-in-out, backdrop-filter 100ms ease-in-out',
          }}
          onClick={handleClose}
        >
          <div
            className="flex w-full max-w-xs flex-col gap-2.5 px-6 pb-6"
            style={{
              transform: isVisible ? 'translateY(0)' : 'translateY(24px)',
              opacity: isVisible ? 1 : 0,
              transition: 'transform 220ms ease-out, opacity 220ms ease-out',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="grid grid-cols-3 gap-2.5">
              {topActions.map(({ key, icon: Icon, label, onClick }) => (
                <button
                  key={key}
                  onClick={onClick}
                  className="flex flex-col items-center justify-center gap-2 rounded-2xl px-1 py-3 transition-opacity active:opacity-70"
                  style={{ backgroundColor: theme.button_color }}
                >
                  <Icon
                    size={24}
                    strokeWidth={1.75}
                    style={{ color: theme.button_text_color }}
                  />
                  <span
                    className="text-center text-[11px] leading-tight font-medium"
                    style={{ color: theme.button_text_color }}
                  >
                    {label}
                  </span>
                </button>
              ))}
            </div>

            <div
              className="grid grid-cols-4 gap-1 rounded-2xl p-1.5"
              style={{ backgroundColor: theme.button_color }}
            >
              {logActions.map(({ key, icon: Icon, label, onClick }) => (
                <button
                  key={key}
                  onClick={onClick}
                  className="flex flex-col items-center justify-center gap-1.5 rounded-xl py-2.5 transition-opacity active:opacity-70"
                >
                  <Icon
                    size={19}
                    strokeWidth={1.75}
                    style={{ color: theme.button_text_color }}
                  />
                  <span
                    className="text-[10px] font-medium"
                    style={{ color: theme.button_text_color }}
                  >
                    {label}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {sheet === 'weight' && (
        <QuickWeightSheet onClose={closeSheetAndOverlay} />
      )}
      {sheet === 'water' && <QuickWaterSheet onClose={closeSheetAndOverlay} />}
      {sheet === 'describe' && (
        <FoodTextEntrySheet onClose={closeSheetAndOverlay} />
      )}
      {sheet === 'voice' && <VoiceEntrySheet onClose={closeSheetAndOverlay} />}
    </>,
    document.body,
  );
};
