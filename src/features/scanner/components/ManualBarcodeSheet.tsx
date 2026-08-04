import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Barcode as BarcodeIcon, UtensilsCrossed } from 'lucide-react';
import { BottomSheet } from '@/shared/ui/BottomSheet';
import { useTheme } from '@/shared/context/ThemeContext';
import { fetchProductByBarcode } from '../lib/openfoodfacts';
import type { ProductData } from '../types/productData';

interface ManualBarcodeSheetProps {
  onClose: () => void;
  onFound: (product: ProductData) => void;
}

// Стандартные длины штрихкодов, при совпадении с которыми запускаем поиск
// автоматически: EAN-8, UPC-A, EAN-13, GTIN-14.
const VALID_LENGTHS = [8, 12, 13, 14];
const MAX_LENGTH = 14;

type SearchState = 'idle' | 'loading' | 'found' | 'not_found';

export const ManualBarcodeSheet = ({
  onClose,
  onFound,
}: ManualBarcodeSheetProps) => {
  const theme = useTheme();
  const { t } = useTranslation('quick_actions');

  const [code, setCode] = useState('');
  const [state, setState] = useState<SearchState>('idle');
  const [foundProduct, setFoundProduct] = useState<ProductData | null>(null);

  const runSearch = useCallback(async (value: string) => {
    setState('loading');
    const product = await fetchProductByBarcode(value).catch(() => null);
    if (product) {
      setFoundProduct(product);
      setState('found');
    } else {
      setFoundProduct(null);
      setState('not_found');
    }
  }, []);

  useEffect(() => {
    if (!VALID_LENGTHS.includes(code.length)) {
      setState('idle');
      setFoundProduct(null);
      return;
    }
    const id = setTimeout(() => runSearch(code), 400);
    return () => clearTimeout(id);
  }, [code, runSearch]);

  const handleChange = (value: string) => {
    setCode(value.replace(/\D/g, '').slice(0, MAX_LENGTH));
  };

  return (
    <BottomSheet title={t('barcode_manual.title')} onClose={onClose}>
      <div className="flex flex-col gap-3 pb-1">
        <input
          type="text"
          inputMode="numeric"
          autoFocus
          value={code}
          onChange={(e) => handleChange(e.target.value)}
          placeholder={t('barcode_manual.input_placeholder')}
          className="w-full rounded-xl p-3.5 text-center text-2xl font-semibold tracking-[0.15em] tabular-nums"
          style={{
            backgroundColor: theme.section_bg_color,
            color: theme.text_color,
            border: `1.5px solid ${
              state === 'not_found'
                ? theme.destructive_text_color
                : theme.section_separator_color
            }`,
          }}
        />

        {state === 'loading' && (
          <div
            className="flex items-center gap-3 rounded-xl px-3 py-2.5"
            style={{ backgroundColor: theme.section_bg_color }}
          >
            <div
              className="size-12 shrink-0 animate-pulse rounded-lg"
              style={{ backgroundColor: theme.secondary_bg_color }}
            />
            <div className="flex flex-1 flex-col gap-1.5">
              <div
                className="h-3 w-3/4 animate-pulse rounded"
                style={{ backgroundColor: theme.secondary_bg_color }}
              />
              <div
                className="h-3 w-1/2 animate-pulse rounded"
                style={{ backgroundColor: theme.secondary_bg_color }}
              />
            </div>
          </div>
        )}

        {state === 'found' && foundProduct && (
          <button
            onClick={() => onFound(foundProduct)}
            className="flex items-center gap-3 rounded-xl p-2.5 text-left transition-opacity active:opacity-70"
            style={{ backgroundColor: theme.section_bg_color }}
          >
            {foundProduct.imageUrl ? (
              <img
                src={foundProduct.imageUrl}
                alt=""
                className="size-12 shrink-0 rounded-lg object-cover"
              />
            ) : (
              <div
                className="flex size-12 shrink-0 items-center justify-center rounded-lg"
                style={{ backgroundColor: theme.secondary_bg_color }}
              >
                <UtensilsCrossed
                  size={20}
                  style={{ color: theme.hint_color }}
                />
              </div>
            )}
            <div className="flex min-w-0 flex-1 flex-col">
              <span
                className="truncate text-sm font-semibold"
                style={{ color: theme.text_color }}
              >
                {foundProduct.name}
              </span>
              {foundProduct.brand && (
                <span
                  className="truncate text-xs"
                  style={{ color: theme.hint_color }}
                >
                  {foundProduct.brand}
                </span>
              )}
            </div>
          </button>
        )}

        {state === 'not_found' && (
          <div
            className="flex items-center gap-2 rounded-xl px-3 py-2.5"
            style={{ backgroundColor: theme.section_bg_color }}
          >
            <BarcodeIcon
              size={18}
              style={{ color: theme.destructive_text_color }}
            />
            <span
              className="text-sm"
              style={{ color: theme.destructive_text_color }}
            >
              {t('barcode_manual.not_found')}
            </span>
          </div>
        )}
      </div>
    </BottomSheet>
  );
};
