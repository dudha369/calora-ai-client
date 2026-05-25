import { useEffect, useState, useCallback, useRef } from "react";
import { useCamera } from "../../hooks/useCamera";
import { useScanner } from "../../context/ScannerContext";
import { useBackButton } from "../../telegram";

export const ScannerPage = () => {
  const camera = useCamera();
  const { registerCapture } = useScanner();
  const [photo, setPhoto] = useState<string | null>(null);

  const takePhotoRef = useRef(camera.takePhoto);
  useEffect(() => {
    takePhotoRef.current = camera.takePhoto;
  }, [camera.takePhoto]);

  // 1. Отдельный useEffect только для включения/выключения камеры при смене фото
  useEffect(() => {
    if (!photo) {
      camera.startCamera();
    } else {
      camera.stopCamera();
    }
    // Убрали очистку отсюда, чтобы не было гонки при нажатии "Назад"
  }, [photo]);

  // 2. Очистка камеры ТОЛЬКО при полном закрытии компонента (размонтировании)
  useEffect(() => {
    return () => {
      camera.stopCamera();
    };
  }, []);

  useEffect(() => {
    registerCapture(() => {
      console.log("🔘 Кнопка нажата! Пытаемся сделать фото...");

      const dataUrl = takePhotoRef.current();
      console.log("📸 Результат takePhoto:", dataUrl ? "Фото получено" : "Пусто (null/undefined)");

      if (dataUrl) {
        setPhoto(dataUrl);
      } else {
        console.error("❌ takePhoto вернул пустоту. Камера не готова.");
      }
    });
  }, [registerCapture]);

  const handleRetake = useCallback(() => {
    setPhoto(null);
  }, []);

  useBackButton(handleRetake, !!photo);

  return (
    <div className="fixed inset-0 bg-black">
      <canvas ref={camera.canvasRef} className="hidden" />

      {camera.error && (
        <div className="text-white p-4">{camera.error}</div>
      )}

      {/* 3. Оставляем видео в DOM всегда, просто прячем его через CSS-класс (hidden).
             Это сохраняет videoRef целым и не ломает хук камеры. */}
      <video
        ref={camera.videoRef}
        // Меняем hidden на прозрачность и увод на задний план
        className={`w-full h-full object-cover ${
          photo ? "absolute opacity-0 -z-10" : "relative opacity-100 z-0"
        }`}
        playsInline
        muted
        autoPlay
      />

      {photo && (
        <img
          src={photo}
          className="w-full h-full object-cover block"
          alt="Снятое фото"
        />
      )}
    </div>
  );
};
