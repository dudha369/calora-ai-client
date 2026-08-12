import { useTranslation } from 'react-i18next';
import { Sparkles, Keyboard, RotateCcw } from 'lucide-react';
import { BottomSheet } from '@/shared/ui/BottomSheet';
import { useTheme } from '@/shared/context/ThemeContext';

interface BarcodeDecodeFailedSheetProps {
  onRetry: () => void;
  onManualEntry: () => void;
  onAnalyzeWithAi: () => void;
  onClose: () => void;
}

/**
 * Показывается когда decodeBarcode() не смог извлечь номер штрихкода
 * из фото (клиентское распознавание менее надёжно, чем живой стрим —
 * может не сработать даже на читаемом глазом штрихкоде). Это ДРУГОЙ
 * случай, чем "штрихкод прочитан, но товара нет в OFF" — тут у нас
 * вообще нет номера, поэтому предлагаем ввести его вручную, а не
 * кнопку "добавить товар" напрямую.
 */
export const BarcodeDecodeFailedSheet = ({
  onRetry,
  onManualEntry,
  onAnalyzeWithAi,
  onClose,
}: BarcodeDecodeFailedSheetProps) => {
  const theme = useTheme();
  const { t } = useTranslation('quick_actions');

  return (
    <BottomSheet title={t('barcode_manual.not_found')} onClose={onClose}>
      <div className="flex flex-col gap-3 pb-1">
        <p className="text-center text-sm" style={{ color: theme.hint_color }}>
          {t('barcode_manual.not_found_photo')}
        </p>

        <button
          onClick={onManualEntry}
          className="flex items-center gap-3 rounded-2xl p-3.5 text-left transition-opacity active:opacity-70"
          style={{ backgroundColor: theme.button_color }}
        >
          <Keyboard size={20} style={{ color: theme.button_text_color }} />
          <span
            className="text-sm font-semibold"
            style={{ color: theme.button_text_color }}
          >
            {t('barcode_manual.link')}
          </span>
        </button>

        <button
          onClick={onAnalyzeWithAi}
          className="flex items-center gap-3 rounded-2xl p-3.5 text-left transition-opacity active:opacity-70"
          style={{ backgroundColor: theme.section_bg_color }}
        >
          <Sparkles size={20} style={{ color: theme.text_color }} />
          <span
            className="text-sm font-semibold"
            style={{ color: theme.text_color }}
          >
            {t('barcode_manual.analyze_with_ai')}
          </span>
        </button>

        <button
          onClick={onRetry}
          className="flex items-center gap-3 rounded-2xl p-3.5 text-left transition-opacity active:opacity-70"
          style={{ backgroundColor: theme.section_bg_color }}
        >
          <RotateCcw size={20} style={{ color: theme.hint_color }} />
          <span
            className="text-sm font-medium"
            style={{ color: theme.hint_color }}
          >
            {t('try_again') as string}
          </span>
        </button>
      </div>
    </BottomSheet>
  );
};
