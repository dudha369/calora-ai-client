import { useState, useEffect, useCallback, useRef } from 'react';

export const useModalAnimation = (onClose: () => void, duration = 300) => {
  const [isMounted, setIsMounted] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => setIsMounted(true), 10);
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      clearTimeout(timer);
      if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
      document.body.style.overflow = originalOverflow;
    };
  }, []);

  const handleClose = useCallback(() => {
    if (isClosing) return;
    setIsClosing(true);
    closeTimerRef.current = setTimeout(() => {
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
