import {
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useTranslation } from 'react-i18next';
import { X } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useBackButton } from '../hooks/useBackButton';
import { useSecondaryButton } from '../hooks/useSecondaryButton';
import { useMainButton } from '../hooks/useMainButton';
import { useModalAnimation } from '../hooks/useModalAnimation';
import type { SecondaryButtonPosition } from '@tma.js/sdk-react';
import { cn } from '../lib/cn';
import type { RGB } from '@tma.js/types';

interface BottomSheetProps {
  onClose: () => void;
  children: ReactNode;

  title?: ReactNode;
  renderTitle?: (defaultTitle: ReactNode) => ReactNode;
  titleClassName?: string;
  titleStyle?: CSSProperties;
  titleActions?: ReactNode;

  dismissOnBackdrop?: boolean;
  dragToClose?: boolean;
  dragDismissThreshold?: number;

  secondaryAction?: {
    text?: string;
    iconCustomEmojiId?: string;
    bgColor?: RGB;
    textColor?: RGB;
    onClick?: () => void;
    isProcessing?: boolean;
    isEnabled?: boolean;
    isVisible?: boolean;
    position?: SecondaryButtonPosition;
  };

  actionLabel?: string;
  iconCustomEmojiId?: string;
  actionBgColor?: RGB;
  actionTextColor?: RGB;
  onAction?: () => void;
  isProcessing?: boolean;
  actionDisabled?: boolean;
}

export const BottomSheet = ({
  onClose,
  children,
  title,
  renderTitle,
  titleClassName,
  titleStyle,
  titleActions,
  dismissOnBackdrop = true,
  dragToClose = true,
  dragDismissThreshold,
  secondaryAction,
  actionLabel = '',
  iconCustomEmojiId,
  actionBgColor,
  actionTextColor,
  onAction,
  isProcessing = false,
  actionDisabled = false,
}: BottomSheetProps) => {
  const theme = useTheme();
  const { t } = useTranslation('common');
  const { isVisible, isButtonsVisible, handleClose } =
    useModalAnimation(onClose);

  const isTgButtonsVisible = Boolean(onAction) && isButtonsVisible;

  const [dragY, setDragY] = useState(0);

  const sheetRef = useRef<HTMLDivElement | null>(null);
  const sheetHeightRef = useRef(1);

  const dragState = useRef({
    active: false,
    pointerId: -1,
    startY: 0,
    lastY: 0,
  });

  const dragFrameRef = useRef<number | null>(null);
  const pendingDragYRef = useRef(0);

  const suppressBackdropClickRef = useRef(false);
  const suppressBackdropClickTimeoutRef = useRef<number | null>(null);

  const resetDrag = () => {
    if (dragFrameRef.current !== null) {
      cancelAnimationFrame(dragFrameRef.current);
      dragFrameRef.current = null;
    }

    setDragY(0);
    pendingDragYRef.current = 0;

    dragState.current.active = false;
    dragState.current.pointerId = -1;
    dragState.current.startY = 0;
    dragState.current.lastY = 0;
  };

  const closeSheet = () => {
    resetDrag();
    suppressBackdropClickRef.current = false;
    handleClose();
  };

  useEffect(() => {
    const element = sheetRef.current;
    if (!element) return;

    const updateHeight = () => {
      const nextHeight = element.getBoundingClientRect().height;
      sheetHeightRef.current = Math.max(nextHeight, 1);
    };

    updateHeight();

    const observer = new ResizeObserver(updateHeight);
    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, []);

  useEffect(() => {
    return () => {
      if (suppressBackdropClickTimeoutRef.current !== null) {
        window.clearTimeout(suppressBackdropClickTimeoutRef.current);
      }

      if (dragFrameRef.current !== null) {
        cancelAnimationFrame(dragFrameRef.current);
      }
    };
  }, []);

  useBackButton(closeSheet, true);

  useSecondaryButton({
    text: secondaryAction?.text ?? '',
    iconCustomEmojiId: secondaryAction?.iconCustomEmojiId,
    bgColor: secondaryAction?.bgColor,
    textColor: secondaryAction?.textColor,
    isEnabled:
      Boolean(secondaryAction?.text) &&
      (secondaryAction?.isEnabled ?? true) &&
      !secondaryAction?.isProcessing,
    isVisible:
      Boolean(secondaryAction?.text) &&
      isTgButtonsVisible &&
      (secondaryAction?.isVisible ?? true),
    onClick: secondaryAction?.onClick || closeSheet,
    position: secondaryAction?.position ?? 'left',
  });

  useMainButton({
    text: isProcessing ? t('loading') : actionLabel,
    iconCustomEmojiId,
    bgColor: actionBgColor,
    textColor: actionTextColor,
    isEnabled: !isProcessing && !actionDisabled,
    isVisible: isTgButtonsVisible,
    isLoading: isProcessing,
    onClick: onAction || (() => {}),
  });

  const defaultTitle = useMemo(() => {
    if (!title) return null;

    return typeof title === 'string' ? (
      <span className="text-xl font-bold" style={{ color: theme.text_color }}>
        {title}
      </span>
    ) : (
      title
    );
  }, [title, theme.text_color]);

  const headerContent = renderTitle ? renderTitle(defaultTitle) : defaultTitle;

  const dragProgress = Math.min(dragY / Math.max(sheetHeightRef.current, 1), 1);
  const dragEase = 1 - Math.pow(dragProgress, 1.5);

  const backdropBlurPx = dismissOnBackdrop ? 8 * dragEase : 0;
  const backdropOpacity = dismissOnBackdrop ? 0.2 * dragEase : 0.3;

  const startDrag = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (!dragToClose) return;
    if (e.button !== 0) return;

    dragState.current.active = true;
    dragState.current.pointerId = e.pointerId;
    dragState.current.startY = e.clientY;
    dragState.current.lastY = e.clientY;

    suppressBackdropClickRef.current = true;

    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const moveDrag = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (!dragState.current.active) return;
    if (dragState.current.pointerId !== e.pointerId) return;

    const delta = Math.max(0, e.clientY - dragState.current.startY);
    dragState.current.lastY = e.clientY;
    pendingDragYRef.current = delta;

    if (dragFrameRef.current !== null) return;

    dragFrameRef.current = window.requestAnimationFrame(() => {
      dragFrameRef.current = null;
      setDragY(pendingDragYRef.current);
    });
  };

  const finishDrag = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (!dragState.current.active) return;
    if (dragState.current.pointerId !== e.pointerId) return;

    const delta = Math.max(
      0,
      dragState.current.lastY - dragState.current.startY,
    );

    dragState.current.active = false;
    dragState.current.pointerId = -1;

    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }

    const sheetHeight = Math.max(sheetHeightRef.current, 1);
    const threshold =
      dragDismissThreshold === undefined
        ? sheetHeight * 0.3
        : dragDismissThreshold <= 1
          ? sheetHeight * dragDismissThreshold
          : dragDismissThreshold;

    if (delta > threshold) {
      closeSheet();
      return;
    }

    resetDrag();

    if (suppressBackdropClickTimeoutRef.current !== null) {
      window.clearTimeout(suppressBackdropClickTimeoutRef.current);
    }

    suppressBackdropClickTimeoutRef.current = window.setTimeout(() => {
      suppressBackdropClickRef.current = false;
      suppressBackdropClickTimeoutRef.current = null;
    }, 0);
  };

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    if (!dismissOnBackdrop) return;
    if (suppressBackdropClickRef.current) return;
    if (e.target !== e.currentTarget) return;

    closeSheet();
  };

  return (
    <div
      className={cn(
        'fixed inset-0 z-50 flex',
        isVisible
          ? 'pointer-events-auto opacity-100'
          : 'pointer-events-none opacity-0',
      )}
      style={{
        backdropFilter: dismissOnBackdrop
          ? `blur(${backdropBlurPx}px)`
          : 'none',
        backgroundColor: dismissOnBackdrop
          ? `rgba(0, 0, 0, ${backdropOpacity})`
          : 'rgba(0, 0, 0, 0.3)',
        transition:
          dragY > 0
            ? 'none'
            : 'opacity 300ms ease-in-out, backdrop-filter 120ms linear, background-color 120ms linear',
      }}
      onClick={handleBackdropClick}
    >
      <div
        ref={sheetRef}
        onClick={(e) => e.stopPropagation()}
        className="pointer-events-auto fixed bottom-0 flex h-auto max-h-[80dvh] w-full flex-col gap-1.5 overflow-hidden rounded-t-3xl pt-3"
        style={{
          backgroundColor: theme.bg_color,
          color: theme.text_color,
          transform: isVisible ? `translateY(${dragY}px)` : 'translateY(100%)',
          transition: dragY > 0 ? 'none' : 'transform 300ms ease-in-out',
          willChange: 'transform',
          boxShadow: `inset 0 1px 0 0 ${theme.secondary_bg_color}`,
        }}
      >
        {dragToClose && (
          <div
            className="flex cursor-grab items-center justify-center py-1 active:cursor-grabbing"
            style={{
              touchAction: 'none',
              userSelect: 'none',
              WebkitUserSelect: 'none',
            }}
            onPointerDown={startDrag}
            onPointerMove={moveDrag}
            onPointerUp={finishDrag}
            onPointerCancel={finishDrag}
          >
            <div
              className="h-1.5 w-12 rounded-full"
              style={{
                backgroundColor: theme.secondary_bg_color,
              }}
            />
          </div>
        )}

        {(headerContent || titleActions) && (
          <header className="relative flex w-full items-center justify-center">
            <div
              className={cn(
                'flex w-full items-center justify-center',
                titleClassName,
              )}
              style={titleStyle}
            >
              {headerContent}
            </div>

            {titleActions && (
              <div className="absolute flex items-center">{titleActions}</div>
            )}

            {!dragToClose && (
              <button
                onClick={closeSheet}
                className="absolute right-4 rounded-full transition-opacity hover:opacity-70"
                aria-label={t('buttons.close')}
              >
                <X size={20} style={{ color: theme.text_color }} />
              </button>
            )}
          </header>
        )}

        <main
          className="w-full flex-1 overflow-y-auto overscroll-contain px-6 pb-1"
          style={{ scrollbarGutter: 'stable' }}
        >
          {children}
        </main>
      </div>
    </div>
  );
};
