import { useTranslation } from 'react-i18next';
import { Sparkles, PlusCircle, Keyboard } from 'lucide-react';
import { BottomSheet } from '@/shared/ui/BottomSheet';
import { useTheme } from '@/shared/context/ThemeContext';
import { useOpenFoodFactsAvailable } from '@/shared/hooks/useOpenFoodFactsStatus';

interface BarcodeNotFoundSheetProps {
  barcode: string;
  onAnalyzeWithAi: () => void;
  onAddProduct: () => void;
  onManualEntry: () => void;
  onClose: () => void;
}

export const BarcodeNotFoundSheet = ({
  barcode,
  onAnalyzeWithAi,
  onAddProduct,
  onManualEntry,
  onClose,
}: BarcodeNotFoundSheetProps) => {
  const theme = useTheme();
  const { t } = useTranslation('quick_actions');
  const offAvailable = useOpenFoodFactsAvailable();

  return (
    <BottomSheet title={t('barcode_manual.not_found')} onClose={onClose}>
      <div className="flex flex-col gap-3 pb-1">
        <p className="text-center text-sm" style={{ color: theme.hint_color }}>
          {t('barcode_manual.not_in_database', { barcode })}
        </p>

        <button
          onClick={onAnalyzeWithAi}
          className="flex items-center gap-3 rounded-2xl p-3.5 text-left transition-opacity active:opacity-70"
          style={{ backgroundColor: theme.button_color }}
        >
          <Sparkles size={20} style={{ color: theme.button_text_color }} />
          <span
            className="text-sm font-semibold"
            style={{ color: theme.button_text_color }}
          >
            {t('barcode_manual.analyze_with_ai')}
          </span>
        </button>

        {offAvailable && (
          <button
            onClick={onAddProduct}
            className="flex items-center gap-3 rounded-2xl p-3.5 text-left transition-opacity active:opacity-70"
            style={{ backgroundColor: theme.section_bg_color }}
          >
            <PlusCircle size={20} style={{ color: theme.text_color }} />
            <span
              className="text-sm font-semibold"
              style={{ color: theme.text_color }}
            >
              {t('barcode_manual.add_product')}
            </span>
          </button>
        )}

        <button
          onClick={onManualEntry}
          className="flex items-center gap-3 rounded-2xl p-3.5 text-left transition-opacity active:opacity-70"
          style={{ backgroundColor: theme.section_bg_color }}
        >
          <Keyboard size={20} style={{ color: theme.hint_color }} />
          <span
            className="text-sm font-medium"
            style={{ color: theme.hint_color }}
          >
            {t('barcode_manual.link')}
          </span>
        </button>
      </div>
    </BottomSheet>
  );
};
