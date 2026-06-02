import { useEffect, useState, useCallback, useRef } from "react";
import { useCamera } from "../hooks/useCamera";
import { useScanner } from "../hooks/useScanner";
import { useBackButton } from "../hooks/useBackButton";
import { decodeBarcode } from "../utils/decodeBarcode";

export const ScannerPage = () => {
  const camera = useCamera();
  const { registerCapture } = useScanner();
  const [photo, setPhoto] = useState<string | null>(null);
  const [barcode, setBarcode] = useState<string | null>(null);

  const takePhotoRef = useRef(camera.takePhoto);
  useEffect(() => {
    takePhotoRef.current = camera.takePhoto;
  }, [camera.takePhoto]);

  useEffect(() => {
    if (!photo) {
      if (camera.method === "stream") {
        camera.startCamera();
      } else {
        camera.openInputCamera();
      }
    } else {
      camera.stopCamera();
    }
  }, [photo, camera.method]);

  useEffect(() => {
    return () => camera.stopCamera();
  }, [camera.stopCamera]);

  useEffect(() => {
    registerCapture(() => {
      if (camera.method === "stream") {
        const dataUrl = takePhotoRef.current();
        if (dataUrl) setPhoto(dataUrl);
      } else {
        camera.openInputCamera();
      }
    });
  }, [registerCapture, camera.method, camera.openInputCamera]);

  // iOS: получили файл с камеры
  const handleInputFile = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = async () => {
        const dataUrl = reader.result as string;
        setPhoto(dataUrl);

        // Теперь decodeBarcode реально используется — пробуем распознать штрихкод
        const code = await decodeBarcode(dataUrl);
        if (code) {
          setBarcode(code);
          // дальше делаешь что нужно: navigate, API запрос и т.д.
        }
      };
      reader.readAsDataURL(file);

      if (e.target) e.target.value = "";
    },
    []
  );

  const handleRetake = useCallback(() => {
    setPhoto(null);
    setBarcode(null);
  }, []);

  useBackButton(handleRetake, !!photo);

  return (
    <div className="fixed inset-0 bg-black">
      <canvas ref={camera.canvasRef} className="hidden" />

      <input
        ref={camera.inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handleInputFile}
      />

      {camera.error && (
        <div className="absolute top-4 left-4 right-4 z-10 bg-red-500/80 text-white p-3 rounded-xl text-sm">
          {camera.error}
          <button className="ml-2 underline" onClick={() => camera.startCamera()}>
            Повторить
          </button>
        </div>
      )}

      {camera.method === "stream" && (
        <video
          ref={camera.videoRef}
          className={`w-full h-full object-cover ${
            photo ? "absolute opacity-0 -z-10" : "relative opacity-100 z-0"
          }`}
          playsInline
          muted
          autoPlay
        />
      )}

      {camera.method === "input" && !photo && (
        <div className="flex flex-col items-center justify-center h-full gap-4">
          <p className="text-white text-center px-8">
            Нажми кнопку чтобы открыть камеру
          </p>
          <button
            onClick={camera.openInputCamera}
            className="bg-white text-black px-6 py-3 rounded-full font-medium"
          >
            Открыть камеру
          </button>
        </div>
      )}

      {photo && (
        <div className="relative w-full h-full">
          <img
            src={photo}
            className="w-full h-full object-cover block"
            alt="Снятое фото"
          />
          {barcode && (
            <div className="absolute bottom-8 left-4 right-4 bg-black/70 text-white p-3 rounded-xl text-center">
              Штрихкод: {barcode}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
