import {
  useState,
  useEffect,
  useRef,
  useCallback,
  type ChangeEvent,
} from "react";
import { useCamera, type UseCameraReturn } from "./useCamera";
import { useScanner } from "./useScanner";

export interface UseScannerCaptureReturn {
  photo: string | null;
  clearPhoto: () => void;
  handleFileChange: (e: ChangeEvent<HTMLInputElement>) => void;
  camera: UseCameraReturn;
}

/**
 * Управляет жизненным циклом захвата фото для ScannerPage.
 *
 * Два сценария:
 *   • stream (Android / десктоп) — getUserMedia, takePhoto по нажатию FAB.
 *   • input  (iOS) — camera через <input capture="environment">, фото приходит
 *     через router state от FabButton (navigate с state.photo).
 *
 * externalPhoto — фото из location.state (iOS-путь).
 * consumedExternalRef гарантирует однократное потребление одного URL:
 *   повторный рендер с тем же state.photo не перетрёт пользовательское действие.
 */
export function useScannerCapture(
  externalPhoto: string | null,
): UseScannerCaptureReturn {
  const [photo, setPhoto] = useState<string | null>(externalPhoto);
  const consumedExternalRef = useRef<string | null>(externalPhoto);

  const camera = useCamera();
  const { method, startCamera, stopCamera, takePhoto, openInputCamera } = camera;

  // Держим актуальный takePhoto в ref чтобы useEffect с registerCapture
  // не пересоздавался при каждом рендере камеры
  const takePhotoRef = useRef(takePhoto);
  useEffect(() => {
    takePhotoRef.current = takePhoto;
  }, [takePhoto]);

  const { registerCapture } = useScanner();

  // ── Синхронизация с новым внешним фото (iOS: новый navigate от FabButton) ──
  useEffect(() => {
    if (externalPhoto && externalPhoto !== consumedExternalRef.current) {
      consumedExternalRef.current = externalPhoto;
      setPhoto(externalPhoto);
    }
  }, [externalPhoto]);

  // ── Управление камерой: включаем стрим только без фото ───────────────────
  useEffect(() => {
    if (!photo && method === "stream") {
      startCamera();
    } else {
      stopCamera();
    }
  }, [photo, method, startCamera, stopCamera]);

  // Стоп камеры при размонтировании
  useEffect(() => () => stopCamera(), [stopCamera]);

  // ── Регистрация callback для FAB-кнопки нижней панели ────────────────────
  useEffect(() => {
    registerCapture(() => {
      if (photo) {
        // Есть фото → retake
        setPhoto(null);
      } else if (method === "stream") {
        const dataUrl = takePhotoRef.current();
        if (dataUrl) setPhoto(dataUrl);
      } else {
        // iOS → открываем нативный file picker
        openInputCamera();
      }
    });
  }, [registerCapture, photo, method, openInputCamera]);

  const clearPhoto = useCallback(() => setPhoto(null), []);

  // ── Обработчик загрузки файла (iOS: input[capture]) ──────────────────────
  const handleFileChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setPhoto(reader.result as string);
    reader.readAsDataURL(file);
    // Сбрасываем value — иначе onChange не сработает при выборе того же файла
    e.target.value = "";
  }, []);

  return { photo, clearPhoto, handleFileChange, camera };
}
