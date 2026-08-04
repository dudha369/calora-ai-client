import {
  useState,
  useRef,
  useCallback,
  useEffect,
  type ChangeEvent,
} from 'react';
import { useCamera, type UseCameraReturn } from './useCamera';

export interface UseScannerCaptureReturn {
  photo: string | null;
  clearPhoto: () => void;
  handleFileChange: (e: ChangeEvent<HTMLInputElement>) => void;
  camera: UseCameraReturn;
  /** Снимает фото (stream) или открывает нативную камеру (input). Повторный
   *  вызов при уже сделанном фото — retake (сброс photo в null). */
  capture: () => void | Promise<void>;
}

/**
 * Управляет жизненным циклом захвата фото для ScannerPage.
 *
 * Два сценария:
 *   • stream (Android / десктоп) — getUserMedia, takePhoto по нажатию затвора.
 *   • input  (iOS) — camera через <input capture="environment">, фото приходит
 *     через router state от QuickActionsOverlay (iOS-путь) или через сам input.
 *
 * externalPhoto — фото из location.state (iOS-путь).
 * active — false для сценариев, где камерой в этом хуке управлять не нужно
 *   (например живой сканер штрихкода держит свой собственный useCamera()) —
 *   иначе два параллельных getUserMedia-стрима боролись бы за одну камеру.
 * consumedExternalRef гарантирует однократное потребление одного URL:
 *   повторный рендер с тем же state.photo не перетрёт пользовательское действие.
 */
export function useScannerCapture(
  externalPhoto: string | null,
  active: boolean = true,
): UseScannerCaptureReturn {
  const [photo, setPhoto] = useState<string | null>(externalPhoto);
  const consumedExternalRef = useRef<string | null>(externalPhoto);

  const camera = useCamera();
  const { method, startCamera, stopCamera, takePhoto, openInputCamera } =
    camera;

  // Держим актуальный takePhoto в ref чтобы capture не пересоздавался
  // при каждом рендере камеры
  const takePhotoRef = useRef(takePhoto);
  useEffect(() => {
    takePhotoRef.current = takePhoto;
  }, [takePhoto]);

  // ── Синхронизация с новым внешним фото (iOS: новый navigate от QuickActionsOverlay) ──
  useEffect(() => {
    if (externalPhoto && externalPhoto !== consumedExternalRef.current) {
      consumedExternalRef.current = externalPhoto;
      setPhoto(externalPhoto);
    }
  }, [externalPhoto]);

  // ── Управление камерой: включаем стрим только без фото и когда активно ───
  useEffect(() => {
    if (active && !photo && method === 'stream') {
      startCamera();
    } else {
      stopCamera();
    }
  }, [active, photo, method, startCamera, stopCamera]);

  // Стоп камеры при размонтировании
  useEffect(() => () => stopCamera(), [stopCamera]);

  const capture = useCallback(async () => {
    if (photo) {
      // Есть фото → retake
      setPhoto(null);
    } else if (method === 'stream') {
      const dataUrl = await takePhotoRef.current();
      if (dataUrl) setPhoto(dataUrl);
    } else {
      // iOS → открываем нативный file picker
      openInputCamera();
    }
  }, [photo, method, openInputCamera]);

  const clearPhoto = useCallback(() => setPhoto(null), []);

  // ── Обработчик загрузки файла (iOS: input[capture]) ──────────────────────
  const handleFileChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setPhoto(reader.result as string);
    reader.readAsDataURL(file);
    // Сбрасываем value — иначе onChange не сработает при выборе того же файла
    e.target.value = '';
  }, []);

  return { photo, clearPhoto, handleFileChange, camera, capture };
}
