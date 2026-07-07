import { type ChangeEvent } from 'react';
import type { UseCameraReturn } from '../hooks/useCamera';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../context/ThemeContext.ts';
import { Sprout, ArrowDown } from 'lucide-react';

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
  const theme = useTheme();
  const { t } = useTranslation('scanner_page');

  return (
    <div className="relative flex w-full flex-1 items-center overflow-hidden">
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
            {t('try_again')}
          </button>
        </div>
      )}

      {/* Стрим (не-iOS): скрываем через CSS а не unmount — камера продолжает работать */}
      {method === 'stream' && (
        <video
          ref={videoRef}
          className={`h-auto w-full object-cover transition-opacity duration-200 ${
            photo ? 'absolute inset-0 -z-10 opacity-0' : 'opacity-100'
          }`}
          playsInline
          muted
          autoPlay
        />
      )}

      {/* iOS-плейсхолдер */}
      {method === 'input' && !photo && (
        <div
          className="relative flex h-full flex-col items-center justify-center gap-3"
          style={{ color: theme.text_color }}
        >
          <div
            className="flex items-center justify-center rounded-full p-3.5"
            style={{ backgroundColor: theme.secondary_bg_color }}
          >
            <Sprout size={34} />
          </div>
          <div className="flex flex-col gap-1 px-12 text-center">
            <p className="text-lg font-medium tracking-wider">
              {t('ready_to_analyze?')}
            </p>
            <p
              className="text-base leading-none"
              style={{ color: theme.hint_color }}
            >
              {t('press_to_analyze')}
            </p>
          </div>
          <ArrowDown
            className="absolute bottom-6 animate-bounce"
            strokeWidth={1}
            size={44}
          />
        </div>
      )}

      {/* Превью захваченного фото */}
      {photo && (
        <img
          src={photo}
          className="h-auto w-full object-cover"
          alt={t('captured_photo')}
        />
      )}
    </div>
  );
};
