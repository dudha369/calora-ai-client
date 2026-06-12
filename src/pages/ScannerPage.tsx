import {
  useEffect,
  useState,
  useCallback,
  useRef,
  type ChangeEvent,
} from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useCamera } from '../hooks/useCamera';
import { useScanner } from '../hooks/useScanner';
import { useBackButton } from '../hooks/useBackButton';
import { decodeBarcode } from '../utils/decodeBarcode';
import { ModalWindow } from '../components/ModalWindow';
import type { FoodData } from '../interfaces/FoodData';
import { useTheme } from '../context/ThemeContext.ts';
import { fetchProductByBarcode } from '../api/openfoodfacts.ts';
import type { ProductData } from '../types/productData.ts';
import { food, todayApiDate } from '../api/food';

export const ScannerPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { registerCapture } = useScanner();
  const {
    error,
    method,
    startCamera,
    stopCamera,
    openInputCamera,
    takePhoto,
    canvasRef,
    videoRef,
    inputRef,
  } = useCamera();

  const theme = useTheme();

  const [photo, setPhoto] = useState<string | null>(
    location.state?.photo || null,
  );

  const [productData, setProductData] = useState<ProductData | null>(null);
  const [foodData, setFoodData] = useState<FoodData | null>(null);

  const [showBarcodeModal, setShowBarcodeModal] = useState(false);
  const [showFoodModal, setShowFoodModal] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);

  const [prevRouterPhoto, setPrevRouterPhoto] = useState<string | null>(
    location.state?.photo || null,
  );

  if (location.state?.photo !== prevRouterPhoto) {
    setPrevRouterPhoto(location.state?.photo);

    setPhoto(location.state?.photo);
    setProductData(null);
    setFoodData(null);
    setShowBarcodeModal(false);
    setShowFoodModal(false);
  }

  const takePhotoRef = useRef(takePhoto);
  useEffect(() => {
    takePhotoRef.current = takePhoto;
  }, [takePhoto]);

  useEffect(() => {
    if (!photo) {
      if (method === 'stream') startCamera();
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
        if (method === 'stream') {
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
            name: 'Куриная грудка с рисом',
            calories: 420,
            protein: 35,
            fat: 8,
            carbs: 45,
          });
          setShowFoodModal(true);
        }, 1500);
      }
    };

    processPhoto();
    return () => {
      isActive = false;
    };
  }, [photo]);

  /**
   * Подтверждение находки по штрихкоду.
   * Шлём ОДНУ позицию (productData) в FoodLog за сегодня через /api/food/log-barcode.
   * Фото со сканера штрихкода НЕ загружается в B2 — вся пищевая информация
   * уже получена из Open Food Facts по коду, само фото не несёт ценности.
   *
   * Источник КБЖУ: perServing, если у продукта известен размер порции
   * (servingSizeG из OFF), иначе — per100g как разумный fallback
   * (в этом случае portion_g = 100).
   */
  const confirmBarcodeApi = async () => {
    if (!productData) return;

    setIsConfirming(true);

    const hasServing =
      productData.perServing !== null && productData.servingSizeG !== null;
    const nutrition = hasServing
      ? productData.perServing!
      : productData.per100g;
    const portionG = hasServing ? productData.servingSizeG! : 100;

    try {
      await food.logBarcode({
        log_date: todayApiDate(),
        items: [
          {
            food_name: productData.name,
            portion_g: portionG,
            calories: nutrition.calories ?? 0,
            protein_g: nutrition.protein ?? 0,
            fat_g: nutrition.fat ?? 0,
            carbs_g: nutrition.carbs ?? 0,
          },
        ],
      });

      setShowBarcodeModal(false);
      navigate('/');
    } catch {
      alert(
        'Не удалось сохранить запись. Проверь соединение и попробуй ещё раз.',
      );
    } finally {
      setIsConfirming(false);
    }
  };

  const confirmFoodApi = () => {
    setIsConfirming(true);
    // TODO: Здесь будет ваш fetch/axios запрос подтверждения КБЖУ
    setTimeout(() => {
      setIsConfirming(false);
      setShowFoodModal(false);
      alert(`Блюдо записано в дневник!`);
      navigate('/');
    }, 1000);
  };

  const handleInputFile = useCallback(
    async (e: ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => setPhoto(reader.result as string);
      reader.readAsDataURL(file);
      if (e.target) e.target.value = '';
    },
    [],
  );

  const handleRetake = useCallback(() => {
    setPhoto(null);
    setShowBarcodeModal(false);
    setShowFoodModal(false);
  }, []);

  useBackButton(handleRetake, !!photo);

  const nutritionItems = foodData
    ? [
        { label: 'Калории', value: `${foodData.calories} ккал`, primary: true },
        { label: 'Белки', value: `${foodData.protein} г` },
        { label: 'Жиры', value: `${foodData.fat} г` },
        { label: 'Углеводы', value: `${foodData.carbs} г` },
      ]
    : [];

  const nutritionProductItems = productData
    ? [
        {
          label: 'Калории',
          value: `${productData.perServing?.calories} ккал`,
          primary: true,
        },
        { label: 'Белки', value: `${productData.perServing?.protein} г` },
        { label: 'Жиры', value: `${productData.perServing?.fat} г` },
        { label: 'Углеводы', value: `${productData.perServing?.carbs} г` },
      ]
    : [];

  return (
    <div className="relative w-full flex-1 overflow-hidden">
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
        <div className="absolute top-4 right-4 left-4 z-10 rounded-xl bg-red-500/80 p-3 text-sm text-white">
          {error}
          <button className="ml-2 underline" onClick={() => startCamera()}>
            Повторить
          </button>
        </div>
      )}

      {method === 'stream' && (
        <video
          ref={videoRef}
          className={`h-full w-full object-cover ${photo ? 'absolute -z-10 opacity-0' : 'relative z-0 opacity-100'}`}
          playsInline
          muted
          autoPlay
        />
      )}

      {method === 'input' && !photo && (
        <div className="relative z-0 flex h-full flex-col items-center justify-center gap-4">
          <p className="px-8 text-center">
            Нажми центральную кнопку снизу чтобы открыть камеру
          </p>
        </div>
      )}

      {photo && (
        <div className="relative h-full w-full">
          <img
            src={photo}
            className="block h-full w-full object-cover"
            alt="Captured"
          />
        </div>
      )}

      {showBarcodeModal && (
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
                className="text-center text-sm"
                style={{
                  color: theme.subtitle_text_color,
                }}
              >
                {productData.name}
              </p>
              <div
                className="divide-var(--tg-section-separator-color) mt-2 divide-y-2 rounded-2xl p-3"
                style={{
                  backgroundColor: theme.section_bg_color,
                }}
              >
                {nutritionProductItems.map((item) => (
                  <div
                    key={item.label}
                    className={`flex items-center justify-between px-2 py-2 ${
                      item.primary ? 'font-medium' : 'text-sm'
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
      )}

      {showFoodModal && (
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
                className="text-center text-sm"
                style={{
                  color: theme.subtitle_text_color,
                }}
              >
                {foodData.name}
              </p>
              <div
                className="mt-2 divide-y-2 divide-(--tg-section-separator-color) rounded-2xl px-3"
                style={{
                  backgroundColor: theme.section_bg_color,
                }}
              >
                {nutritionItems.map((item) => (
                  <div
                    key={item.label}
                    className={`flex items-center justify-between px-2 py-2 ${
                      item.primary ? 'font-medium' : 'text-sm'
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
      )}
    </div>
  );
};
