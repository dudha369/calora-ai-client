import {
  type RefObject,
  useRef,
  useState,
  useCallback,
  useEffect,
} from 'react';

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
  takePhoto: () => string | null;
  switchCamera: () => Promise<void>;
  openInputCamera: () => void;
}

function isIOS(): boolean {
  return (
    /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
  );
}

export function useCamera(): UseCameraReturn {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const [isReady, setIsReady] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<FacingMode>('environment');

  const method: CameraMethod = isIOS() ? 'input' : 'stream';

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
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
          },
          audio: false,
        });

        streamRef.current = stream;

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

  const takePhoto = useCallback((): string | null => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || !isReady) return null;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    return canvas.toDataURL('image/jpeg', 0.92);
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
