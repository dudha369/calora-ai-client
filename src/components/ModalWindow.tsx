import { type ReactNode } from 'react';
import { X } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useBackButton } from '../hooks/useBackButton';
import { useSecondaryButton } from '../hooks/useSecondaryButton';
import { useMainButton } from '../hooks/useMainButton';
import { useModalAnimation } from '../hooks/useModalAnimation.ts';
import type { SecondaryButtonPosition } from '@tma.js/sdk-react';

interface ModalWindowProps {
  onClose: () => void;
  title?: string;
  children: ReactNode;
  cancelLabel?: string;
  actionLabel?: string;
  iconCustomEmojiId?: string;
  onAction?: () => void;
  isProcessing?: boolean;
  actionDisabled?: boolean;
  cancelPosition?: SecondaryButtonPosition;
}

export const ModalWindow = ({
  onClose,
  title,
  children,
  cancelLabel,
  actionLabel,
  iconCustomEmojiId,
  onAction,
  isProcessing = false,
  actionDisabled = false,
  cancelPosition = 'left',
}: ModalWindowProps) => {
  const theme = useTheme();

  const { isVisible, isButtonsVisible, handleClose } =
    useModalAnimation(onClose);

  const isTgButtonsVisible = onAction && isButtonsVisible;

  useBackButton(handleClose, true);

  if (cancelLabel) {
    useSecondaryButton({
      text: cancelLabel,
      iconCustomEmojiId: '5260342697075416641',
      isEnabled: true,
      isVisible: isTgButtonsVisible,
      onClick: handleClose,
      position: cancelPosition,
    });
  }

  useMainButton({
    text: isProcessing ? 'Загрузка...' : actionLabel || '',
    iconCustomEmojiId,
    isEnabled: !isProcessing && !actionDisabled,
    isVisible: isTgButtonsVisible,
    isLoading: isProcessing,
    onClick: onAction || (() => {}),
  });

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
        {title && (
          <header className="relative flex w-full items-center justify-center">
            <span className="text-xl font-bold">{title}</span>
            <button
              onClick={handleClose}
              className="absolute right-0 rounded-full transition-colors hover:opacity-70"
            >
              <X size={24} style={{ color: theme.text_color }} />
            </button>
          </header>
        )}

        <main className="w-full flex-1">{children}</main>
      </div>
    </div>
  );
};
