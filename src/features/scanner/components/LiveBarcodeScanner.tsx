import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/shared/context/ThemeContext';
import { useCamera } from '../hooks/useCamera';
import { startLiveBarcodeScan } from '../lib/decodeBarcode';
import { fetchProductByBarcode } from '../lib/openfoodfacts';
import type { ProductData } from '../types/productData';

interface LiveBarcodeScannerProps {
  onProductFound: (product: ProductData) => void;
  onManualEntry: () => void;
}

type ScanState = 'scanning' | 'looking_up' | 'not_found';

export const LiveBarcodeScanner = ({
  onProductFound,
  onManualEntry,
}: LiveBarcodeScannerProps) => {
  const theme = useTheme();
  const { t } = useTranslation('quick_actions');
  const { videoRef, isStreaming, startCamera, stopCamera } = useCamera();

  const [state, setState] = useState<ScanState>('scanning');
  const stopScanRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    startCamera();
    return () => {
      stopScanRef.current?.();
      stopCamera();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!isStreaming || !videoRef.current || state !== 'scanning') return;

    stopScanRef.current = startLiveBarcodeScan(
      videoRef.current,
      async (barcode) => {
        setState('looking_up');
        const product = await fetchProductByBarcode(barcode).catch(() => null);
        if (product) {
          onProductFound(product);
        } else {
          setState('not_found');
          setTimeout(() => setState('scanning'), 1500);
        }
      },
    );

    return () => stopScanRef.current?.();
  }, [isStreaming, state, videoRef, onProductFound]);

  return (
    <div className="relative flex w-full flex-1 items-center justify-center overflow-hidden bg-black">
      <video
        ref={videoRef}
        className="h-auto w-full object-cover"
        playsInline
        muted
        autoPlay
      />

      <div
        className="pointer-events-none absolute inset-x-10"
        style={{ top: '32%' }}
      >
        <div
          className="aspect-[16/7] rounded-2xl border-2 transition-colors duration-200"
          style={{
            borderColor:
              state === 'not_found' ? theme.destructive_text_color : '#ffffff',
            boxShadow: '0 0 0 2000px rgba(0,0,0,0.35)',
          }}
        />
      </div>

      <div className="absolute bottom-10 flex flex-col items-center gap-2">
        <p
          className="rounded-xl px-4 py-2 text-sm font-medium backdrop-blur-md"
          style={{ backgroundColor: 'rgba(0,0,0,0.4)', color: '#fff' }}
        >
          {state === 'not_found'
            ? t('barcode_live.not_found')
            : t('barcode_live.hint')}
        </p>
        <button
          onClick={onManualEntry}
          className="text-xs font-medium underline underline-offset-2"
          style={{ color: 'rgba(255,255,255,0.85)' }}
        >
          {t('barcode_manual.link')}
        </button>
      </div>
    </div>
  );
};
