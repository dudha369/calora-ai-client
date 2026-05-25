import { useEffect, useState, useRef, useCallback } from "react";
import { useCamera } from "../../hooks/useCamera";
import { useScanner } from "../../context/ScannerContext";
import { WebApp } from "../../api/telegram";

export const ScannerPage = () => {
  const camera = useCamera();
  const { registerCapture } = useScanner();
  const [photo, setPhoto] = useState<string | null>(null);

  const handleRetake = useCallback(() => {
    setPhoto(null);
    camera.startCamera();
  }, [camera]);

  const stableHandlerRef = useRef(() => handleRetake());

  useEffect(() => {
    stableHandlerRef.current = () => handleRetake();
  }, [handleRetake]);

  useEffect(() => {
    camera.startCamera();
    return () => camera.stopCamera();
  }, []);

  useEffect(() => {
    registerCapture(() => {
      const dataUrl = camera.takePhoto();
      if (dataUrl) setPhoto(dataUrl);
    });
  }, [registerCapture, camera.takePhoto]);

  useEffect(() => {
    if (!WebApp) return;

    const handler = () => {
      console.log("BackButton clicked!");
      handleRetake();
    };

    WebApp.BackButton.onClick(handler);
    console.log("BackButton handler registered:", WebApp.BackButton);

    return () => {
      WebApp.BackButton.offClick(handler);
      WebApp.BackButton.hide();
    };
  }, []);

  useEffect(() => {
    if (!WebApp) return;

    if (photo) {
      WebApp.BackButton.show();
    } else {
      WebApp.BackButton.hide();
    }
  }, [photo]);

  return (
    <div className="fixed inset-0 bg-black">
      <canvas ref={camera.canvasRef} className="hidden" />

      {camera.error && (
        <div className="">{camera.error}</div>
      )}

      {!photo ? (
        <video
          ref={camera.videoRef}
          className="w-full h-full object-cover block"
          playsInline
          muted
          autoPlay
        />
      ) : (
        <img
          src={photo}
          className="w-full h-full object-cover block"
          alt="Снятое фото"
        />
      )}
    </div>
  );
};
