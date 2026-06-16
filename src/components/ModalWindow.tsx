import { type ReactNode, useCallback, useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useBackButton } from '../hooks/useBackButton';
import { useSecondaryButton } from '../hooks/useSecondaryButton';
import { useMainButton } from '../hooks/useMainButton';

interface ModalWindowProps {
  onClose: () => void;
  title?: string;
  children: ReactNode;
  actionLabel?: string;
  iconCustomEmojiId?: string;
  onAction?: () => void;
  isProcessing?: boolean;
}

export const ModalWindow = ({
  onClose,
  title,
  children,
  actionLabel,
  iconCustomEmojiId,
  onAction,
  isProcessing = false,
}: ModalWindowProps) => {
  const theme = useTheme();

  const [isMounted, setIsMounted] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  // Запускаем анимацию появления сразу после монтирования в DOM
  useEffect(() => {
    // Небольшая задержка нужна, чтобы браузер успел применить начальные CSS классы
    const timer = setTimeout(() => setIsMounted(true), 10);

    // Блокируем скролл на body, чтобы Telegram не рисовал полосу прокрутки
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      clearTimeout(timer);
      // Возвращаем как было при закрытии
      document.body.style.overflow = originalOverflow;
    };
  }, []);

  // Функция закрытия с задержкой для проигрывания анимации
  const handleClose = useCallback(() => {
    if (isClosing) return; // Защита от повторных кликов

    setIsClosing(true); // Запускаем анимацию исчезновения

    // Ждем 300мс (время выполнения CSS transition), затем удаляем из DOM
    setTimeout(() => {
      onClose();
    }, 300);
  }, [onClose, isClosing]);

  const showActions = Boolean(actionLabel && onAction);
  const isButtonsVisible = showActions && !isClosing;

  useBackButton(handleClose, true);

  useSecondaryButton({
    text: isProcessing ? 'Загрузка...' : 'Отмена',
    iconCustomEmojiId: '5260342697075416641',
    isEnabled: true,
    isVisible: isButtonsVisible,
    onClick: handleClose,
    position: 'left',
  });

  useMainButton({
    text: isProcessing ? 'Загрузка...' : actionLabel || '',
    iconCustomEmojiId,
    isEnabled: !isProcessing,
    isVisible: isButtonsVisible,
    isLoading: isProcessing,
    onClick: onAction || (() => {}),
  });

  const isVisible = isMounted && !isClosing;

  return (
    <div
      className={`fixed inset-0 z-50 flex backdrop-blur-sm transition-opacity duration-300 ease-in-out ${
        isVisible ? 'opacity-100' : 'opacity-0'
      }`}
      onClick={handleClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={`pointer-events-auto fixed bottom-0 flex h-auto max-h-[80vh] w-full flex-col gap-3 overflow-y-auto rounded-t-3xl px-6 py-3 pb-5 shadow-(--tg-text-color) transition-transform duration-300 ease-in-out ${
          isVisible ? 'translate-y-0' : 'translate-y-full'
        }`}
        style={{
          backgroundColor: theme.bg_color,
          color: theme.text_color,
        }}
      >
        <header className="relative flex w-full items-center justify-center">
          <span className="text-xl font-bold">{title}</span>
          <button
            onClick={onClose}
            className="absolute right-0 rounded-full transition-colors hover:opacity-70"
          >
            <X size={24} style={{ color: theme.text_color }} />
          </button>
        </header>

        <main className="w-full flex-1">{children}</main>
      </div>
    </div>
  );
};
