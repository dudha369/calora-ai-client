import { useEffect, useState, useCallback, useRef } from "react";
import { useCamera } from "../../hooks/useCamera";
import { useScanner } from "../../hooks/useScanner";
import { useBackButton } from "../../hooks/useBackButton";

export const ScannerPage = () => {
  const camera = useCamera();
  const { registerCapture } = useScanner();
  const [photo, setPhoto] = useState<string | null>(null);

  const takePhotoRef = useRef(camera.takePhoto);
  useEffect(() => {
    takePhotoRef.current = camera.takePhoto;
  }, [camera.takePhoto]);

  useEffect(() => {
    if (!photo) {
      camera.startCamera();
    } else {
      camera.stopCamera();
    }
  }, [photo]);

  useEffect(() => {
    return () => {
      camera.stopCamera();
    };
  }, []);

  useEffect(() => {
    registerCapture(() => {
      const dataUrl = takePhotoRef.current();

      if (dataUrl) {
        setPhoto(dataUrl);
      } else { }
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

      <video
        ref={camera.videoRef}
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
