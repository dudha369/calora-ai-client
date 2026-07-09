import { useState, useEffect, useCallback } from 'react';

export const useModalAnimation = (onClose: () => void, duration = 300) => {
  const [isMounted, setIsMounted] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    // Запускаем анимацию появления
    const timer = setTimeout(() => setIsMounted(true), 10);

    // Блокируем скролл на body
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      clearTimeout(timer);
      // Возвращаем скролл при размонтировании
      document.body.style.overflow = originalOverflow;
    };
  }, []);

  const handleClose = useCallback(() => {
    if (isClosing) return; // Защита от повторных кликов

    setIsClosing(true); // Запускаем анимацию исчезновения

    setTimeout(() => {
      onClose();
    }, duration);
  }, [onClose, isClosing, duration]);

  const isVisible = isMounted && !isClosing;
  const isButtonsVisible = !isClosing;

  return {
    isVisible,
    isButtonsVisible,
    handleClose,
    isClosing,
  };
};
