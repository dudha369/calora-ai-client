import {
  type RefObject,
  useRef,
  useState,
  useCallback,
  useEffect,
} from 'react';
import { isIOSDevice } from '../utils/isIOSDevice';

export type FacingMode = 'user' | 'environment';
export type CameraMethod = 'stream' | 'input';

export interface CameraState {
  isReady: boolean;
  isStreaming: boolean;
  error: string | null;
  facingMode: FacingMode;
  method: CameraMethod;
}

export interface UseCameraReturn extends CameraState {
  videoRef: RefObject<HTMLVideoElement | null>;
  canvasRef: RefObject<HTMLCanvasElement | null>;
  inputRef: RefObject<HTMLInputElement | null>;
  startCamera: (facing?: FacingMode) => Promise<void>;
  stopCamera: () => void;
  takePhoto: () => Promise<string | null>; // Изменили на Promise
  switchCamera: () => Promise<void>;
  openInputCamera: () => void;
}

export function useCamera(): UseCameraReturn {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const imageCaptureRef = useRef<ImageCapture>(null); // Храним инстанс ImageCapture

  const [isReady, setIsReady] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<FacingMode>('environment');

  const method: CameraMethod = isIOSDevice() ? 'input' : 'stream';

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    imageCaptureRef.current = null;
    setIsStreaming(false);
    setIsReady(false);
  }, []);

  const startCamera = useCallback(
    async (facing: FacingMode = facingMode) => {
      if (method === 'input') return;

      setError(null);
      stopCamera();

      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: facing,
            width: { ideal: 1920 },
            height: { ideal: 1080 },
            advanced: [{ focusMode: 'continuous' }] as any, // Форсируем автофокус
          },
          audio: false,
        });

        streamRef.current = stream;

        // Инициализируем ImageCapture, если он поддерживается
        const track = stream.getVideoTracks()[0];
        if (typeof window !== 'undefined' && 'ImageCapture' in window) {
          imageCaptureRef.current = new window.ImageCapture(track);
        }

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
          setIsStreaming(true);
          setFacingMode(facing);
        }
      } catch (err) {
        const msg =
          err instanceof Error
            ? err.message
            : 'Не удалось получить доступ к камере';
        setError(msg);
        setIsStreaming(false);
      }
    },
    [facingMode, method, stopCamera],
  );

  const openInputCamera = useCallback(() => {
    inputRef.current?.click();
  }, []);

  const switchCamera = useCallback(async () => {
    const next: FacingMode = facingMode === 'user' ? 'environment' : 'user';
    await startCamera(next);
  }, [facingMode, startCamera]);

  const handleVideoReady = useCallback(() => {
    if (videoRef.current && canvasRef.current) {
      canvasRef.current.width = videoRef.current.videoWidth;
      canvasRef.current.height = videoRef.current.videoHeight;
      setIsReady(true);
    }
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    video.addEventListener('loadedmetadata', handleVideoReady);
    return () => video.removeEventListener('loadedmetadata', handleVideoReady);
  }, [handleVideoReady]);

  useEffect(() => () => stopCamera(), [stopCamera]);

  const takePhoto = useCallback(async (): Promise<string | null> => {
    const video = videoRef.current;

    if (!video || !isReady) return null;

    // 🔥 СРАЗУ ставим видео на паузу. Это даст пользователю мгновенный визуальный
    // отклик (замороженный кадр), пока под капотом формируется тяжелый Base64.
    video.pause();

    // 1. Пробуем сделать нативное фото через ImageCapture
    if (imageCaptureRef.current) {
      try {
        const blob = await imageCaptureRef.current.takePhoto();
        return await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(blob);
        });
      } catch (err) {
        console.warn('ImageCapture отвалился, пробуем через canvas:', err);
      }
    }

    // 2. Запасной вариант (Фоллбек на Canvas)
    const canvas = canvasRef.current;
    if (!canvas) {
      await video.play(); // Если что-то пошло не так, отпускаем паузу
      return null;
    }

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      await video.play();
      return null;
    }

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    return canvas.toDataURL('image/jpeg', 0.9);
  }, [isReady]);

  return {
    videoRef,
    canvasRef,
    inputRef,
    isReady,
    isStreaming,
    error,
    facingMode,
    method,
    startCamera,
    stopCamera,
    takePhoto,
    switchCamera,
    openInputCamera,
  };
}
