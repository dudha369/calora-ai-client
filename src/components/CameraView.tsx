import { type ChangeEvent } from 'react';
import type { UseCameraReturn } from '../hooks/useCamera';

interface CameraViewProps {
  camera: UseCameraReturn;
  photo: string | null;
  onFileChange: (e: ChangeEvent<HTMLInputElement>) => void;
}

/**
 * Чистый UI-компонент без собственного state.
 * Рендерит один из трёх вариантов в зависимости от окружения и наличия фото:
 *   • stream + нет фото → <video> с живым стримом
 *   • input (iOS) + нет фото → текстовый плейсхолдер
 *   • есть фото → <img> превью
 *
 * Всегда монтирует скрытые <canvas> и <input> — они нужны для логики
 * в useCamera / useScannerCapture вне зависимости от видимого состояния.
 */
export const CameraView = ({
  camera,
  photo,
  onFileChange,
}: CameraViewProps) => {
  const { videoRef, canvasRef, inputRef, method, error, startCamera } = camera;

  return (
    <div className="relative w-full flex-1 overflow-hidden">
      {/* Скрытые утилиты — всегда в DOM */}
      <canvas ref={canvasRef} className="hidden" />
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={onFileChange}
      />

      {/* Баннер ошибки камеры */}
      {error && !photo && (
        <div className="absolute top-4 right-4 left-4 z-10 flex items-center justify-between rounded-xl bg-red-500/80 p-3 text-sm text-white">
          <span className="mr-2 flex-1">{error}</span>
          <button className="shrink-0 underline" onClick={() => startCamera()}>
            Повторить
          </button>
        </div>
      )}

      {/* Стрим (не-iOS): скрываем через CSS а не unmount — камера продолжает работать */}
      {method === 'stream' && (
        <video
          ref={videoRef}
          className={`h-full w-full object-cover transition-opacity duration-200 ${
            photo ? 'absolute inset-0 -z-10 opacity-0' : 'opacity-100'
          }`}
          playsInline
          muted
          autoPlay
        />
      )}

      {/* iOS-плейсхолдер */}
      {method === 'input' && !photo && (
        <div className="flex h-full items-center justify-center px-8">
          <p className="text-center text-sm leading-relaxed opacity-50">
            Нажми кнопку ниже, чтобы сфотографировать блюдо или штрихкод
          </p>
        </div>
      )}

      {/* Превью захваченного фото */}
      {photo && (
        <img
          src={photo}
          className="h-full w-full object-cover"
          alt="Захваченное фото"
        />
      )}
    </div>
  );
};
