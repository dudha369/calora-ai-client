import { useEffect, useRef } from 'react';
import { mainButton } from '@tma.js/sdk-react';
import { useTelegram } from './useTelegram';
import type { MainButtonOptions } from '../interfaces/MainButtonOptions';
import { useTheme } from '../context/ThemeContext.ts';

export function useMainButton({
  text = '',
  iconCustomEmojiId = '',
  bgColor,
  textColor,
  isEnabled,
  isVisible = true,
  isLoading = false,
  onClick,
}: MainButtonOptions) {
  const { ready } = useTelegram();
  const onClickRef = useRef(onClick);
  const theme = useTheme();

  useEffect(() => {
    onClickRef.current = onClick;
  }, [onClick]);

  useEffect(() => {
    if (!ready) return;

    const unsubscribe = mainButton.onClick(() => {
      onClickRef.current?.();
    });

    return () => unsubscribe();
  }, [ready]);

  useEffect(() => {
    if (!ready) return;

    mainButton.setParams({
      bgColor,
      textColor,
      iconCustomEmojiId: undefined,
    });

    const timer = setTimeout(() => {
      mainButton.setParams({
        text,
        iconCustomEmojiId,
        isEnabled: isEnabled && !isLoading,
        isVisible,
      });
    }, 50);

    return () => clearTimeout(timer);
  }, [
    ready,
    text,
    iconCustomEmojiId,
    bgColor,
    textColor,
    isEnabled,
    isVisible,
    isLoading,
  ]);

  useEffect(() => {
    if (!ready) return;

    if (isLoading) {
      mainButton.showLoader();
    } else {
      mainButton.hideLoader();
    }
  }, [ready, isLoading]);

  useEffect(() => {
    if (!ready) return;

    return () => {
      mainButton.hideLoader();

      mainButton.setParams({
        isVisible: false,
        text: '',
        iconCustomEmojiId: undefined,
        bgColor: theme.button_color,
        textColor: theme.button_text_color,
      });
    };
  }, [ready, theme]);
}
