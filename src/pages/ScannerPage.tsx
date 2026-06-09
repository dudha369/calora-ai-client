import { useEffect, useState, useCallback, useRef, type ChangeEvent } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useCamera } from "../hooks/useCamera";
import { useScanner } from "../hooks/useScanner";
import { useBackButton } from "../hooks/useBackButton";
import { decodeBarcode } from "../utils/decodeBarcode";
import { ModalWindow } from "../components/ModalWindow";
import type { FoodData } from "../interfaces/FoodData";
import { useTheme } from "../context/ThemeContext.ts";
import { fetchProductByBarcode } from "../api/openfoodfacts.ts";
import type { ProductData } from "../types/productData.ts";

export const ScannerPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { registerCapture } = useScanner();
  const {
    error, method, startCamera, stopCamera, openInputCamera,
    takePhoto, canvasRef, videoRef, inputRef
  } = useCamera();

  const theme = useTheme();

  const [photo, setPhoto] = useState<string | null>(location.state?.photo || null);

  const [productData, setProductData] = useState<ProductData | null>(null);
  const [foodData, setFoodData] = useState<FoodData | null>(null);

  const [showBarcodeModal, setShowBarcodeModal] = useState(false);
  const [showFoodModal, setShowFoodModal] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);

  const [prevRouterPhoto, setPrevRouterPhoto] = useState<string | null>(location.state?.photo || null);

  if (location.state?.photo !== prevRouterPhoto) {
    setPrevRouterPhoto(location.state?.photo);

    setPhoto(location.state?.photo);
    setProductData(null);
    setFoodData(null);
    setShowBarcodeModal(false);
    setShowFoodModal(false);
  }

  const takePhotoRef = useRef(takePhoto);
  useEffect(() => { takePhotoRef.current = takePhoto; }, [takePhoto]);

  useEffect(() => {
    if (!photo) {
      if (method === "stream") startCamera();
    } else {
      stopCamera();
    }
  }, [photo, method, startCamera, stopCamera]);

  useEffect(() => {
    return () => stopCamera();
  }, [stopCamera]);

  useEffect(() => {
    registerCapture(() => {
      if (photo) {
        setPhoto(null);
        setProductData(null);
        setFoodData(null);
        setShowBarcodeModal(false);
        setShowFoodModal(false);
      } else {
        if (method === "stream") {
          const dataUrl = takePhotoRef.current();
          if (dataUrl) setPhoto(dataUrl);
        } else {
          openInputCamera();
        }
      }
    });
  }, [registerCapture, photo, method, openInputCamera]);

  useEffect(() => {
    if (!photo) return;
    let isActive = true;

    const processPhoto = async () => {
      const code = await decodeBarcode(photo);
      if (!isActive) return;

      if (code) {
        const product = await fetchProductByBarcode(code);
        console.log(product);
        setProductData(product);
        setShowBarcodeModal(true);
      } else {
        // TODO написать API запрос на бэкэнд для получения данных о блюде
        setTimeout(() => {
          if (!isActive) return;

          setFoodData({
            name: "Куриная грудка с рисом",
            calories: 420,
            protein: 35,
            fat: 8,
            carbs: 45
          });
          setShowFoodModal(true);
        }, 1500);
      }
    };

    processPhoto();
    return () => { isActive = false; };
  }, [photo]);

  const confirmBarcodeApi = () => {
    setIsConfirming(true);
    // TODO: Здесь будет ваш fetch/axios запрос подтверждения штрихкода
    setTimeout(() => {
      setIsConfirming(false);
      setShowBarcodeModal(false);
      alert(`Штрихкод сохранен!`);
      navigate("/");
    }, 1000);
  };

  const confirmFoodApi = () => {
    setIsConfirming(true);
    // TODO: Здесь будет ваш fetch/axios запрос подтверждения КБЖУ
    setTimeout(() => {
      setIsConfirming(false);
      setShowFoodModal(false);
      alert(`Блюдо записано в дневник!`);
      navigate("/");
    }, 1000);
  };

  const handleInputFile = useCallback(async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setPhoto(reader.result as string);
    reader.readAsDataURL(file);
    if (e.target) e.target.value = "";
  }, []);

  const handleRetake = useCallback(() => {
    setPhoto(null);
    setShowBarcodeModal(false);
    setShowFoodModal(false);
  }, []);

  useBackButton(handleRetake, !!photo);

  const nutritionItems = foodData
    ? [
      { label: "Калории", value: `${foodData.calories} ккал`, primary: true },
      { label: "Белки", value: `${foodData.protein} г` },
      { label: "Жиры", value: `${foodData.fat} г` },
      { label: "Углеводы", value: `${foodData.carbs} г` },
    ]
    : [];

  const nutritionProductItems = productData
    ? [
      { label: "Калории", value: `${productData.perServing?.calories} ккал`, primary: true },
      { label: "Белки", value: `${productData.perServing?.protein} г` },
      { label: "Жиры", value: `${productData.perServing?.fat} г` },
      { label: "Углеводы", value: `${productData.perServing?.carbs} г` },
    ]
    : [];

  return (
    <div className="relative flex-1 w-full overflow-hidden">
      <canvas ref={canvasRef} className="hidden" />

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handleInputFile}
      />

      {error && (
        <div className="absolute top-4 left-4 right-4 z-10 bg-red-500/80 text-white p-3 rounded-xl text-sm">
          {error}
          <button className="ml-2 underline" onClick={() => startCamera()}>Повторить</button>
        </div>
      )}

      {method === "stream" && (
        <video
          ref={videoRef}
          className={`w-full h-full object-cover ${photo ? "absolute opacity-0 -z-10" : "relative opacity-100 z-0"}`}
          playsInline muted autoPlay
        />
      )}

      {method === "input" && !photo && (
        <div className="flex flex-col items-center justify-center h-full gap-4 relative z-0">
          <p className="text-center px-8">Нажми центральную кнопку снизу чтобы открыть камеру</p>
        </div>
      )}

      {photo && (
        <div className="relative w-full h-full">
          <img src={photo} className="w-full h-full object-cover block" alt="Captured" />
        </div>
      )}

      {showBarcodeModal &&
        <ModalWindow
          onClose={handleRetake}
          title="Штрихкод найден!"
          actionLabel="Подтвердить штрихкод"
          onAction={confirmBarcodeApi}
          isProcessing={isConfirming}
        >
          {productData && (
            <>
              <p
                className="text-sm text-center"
                style={{
                  color: theme.subtitle_text_color,
                }}
              >
                {productData.name}
              </p>
              <div
                className="rounded-2xl divide-y-2 divide-var(--tg-section-separator-color) mt-2 p-3"
                style={{
                  backgroundColor: theme.section_bg_color,
                }}
              >
                {nutritionProductItems.map((item) => (
                  <div
                    key={item.label}
                    className={`flex px-2 py-2 items-center justify-between ${
                      item.primary ? "font-medium" : "text-sm"
                    }`}
                    style={{
                      color: theme.text_color,
                    }}
                  >
                    <span>{item.label}</span>
                    <span>{item.value}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </ModalWindow>
      }

      {showFoodModal &&
        <ModalWindow
          onClose={handleRetake}
          title="Оценка еды"
          actionLabel="Всё верно!"
          onAction={confirmFoodApi}
          isProcessing={isConfirming}
        >
          {foodData && (
            <>
              <p
                className="text-sm text-center"
                style={{
                  color: theme.subtitle_text_color,
                }}
              >
                {foodData.name}
              </p>
              <div
                className="rounded-2xl divide-y-2 divide-(--tg-section-separator-color) mt-2 px-3"
                style={{
                  backgroundColor: theme.section_bg_color,
                }}
              >
                {nutritionItems.map((item) => (
                  <div
                    key={item.label}
                    className={`flex px-2 py-2 items-center justify-between ${
                      item.primary ? "font-medium" : "text-sm"
                    }`}
                    style={{
                      color: theme.text_color,
                    }}
                  >
                    <span>{item.label}</span>
                    <span>{item.value}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </ModalWindow>
      }
    </div>
  );
};
