import type { ChangeEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { Barcode as BarcodeIcon, Keyboard, ArrowDown } from 'lucide-react';
import { useTheme } from '@/shared/context/ThemeContext';
import type { UseCameraReturn } from '../hooks/useCamera';

interface ManualCameraBarcodeScreenProps {
  camera: UseCameraReturn;
  onFileChange: (e: ChangeEvent<HTMLInputElement>) => void;
  onManualEntry: () => void;
}

/**
 * iOS-путь для штрихкода: живого стрима нет, нативная камера открывается
 * через FAB (тот же механизм, что и у фото еды на iOS — см. shutterHandler
 * в ScannerPage). Раньше скрытый <input capture> рендерился только внутри
 * CameraView, которую этот экран не использует — из-за этого клик по FAB
 * попадал в пустоту (inputRef.current был null). Теперь input — часть
 * этого компонента.
 */
export const ManualCameraBarcodeScreen = ({
  camera,
  onFileChange,
  onManualEntry,
}: ManualCameraBarcodeScreenProps) => {
  const theme = useTheme();
  const { t } = useTranslation('quick_actions');

  return (
    <div
      className="relative flex h-full flex-col items-center justify-center gap-5 px-10 text-center"
      style={{ color: theme.text_color }}
    >
      <input
        ref={camera.inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={onFileChange}
      />

      <div
        className="flex aspect-[16/7] w-full max-w-[280px] items-center justify-center rounded-2xl border-2 border-dashed"
        style={{
          borderColor: theme.section_separator_color,
          backgroundColor: theme.section_bg_color,
        }}
      >
        <BarcodeIcon size={40} style={{ color: theme.hint_color }} />
      </div>

      <div className="flex flex-col gap-1">
        <p className="text-lg font-medium tracking-wider">
          {t('barcode_manual.ready_title')}
        </p>
        <p
          className="text-base leading-none"
          style={{ color: theme.hint_color }}
        >
          {t('barcode_manual.ready_subtitle')}
        </p>
      </div>

      <button
        onClick={onManualEntry}
        className="flex items-center gap-2 rounded-xl px-4 py-2.5 transition-opacity active:opacity-70"
        style={{ backgroundColor: theme.section_bg_color }}
      >
        <Keyboard size={16} style={{ color: theme.hint_color }} />
        <span
          className="text-sm font-medium"
          style={{ color: theme.text_color }}
        >
          {t('barcode_manual.link')}
        </span>
      </button>

      <ArrowDown
        className="absolute bottom-6 animate-bounce"
        strokeWidth={1}
        size={44}
      />
    </div>
  );
};
