import { useEffect, useRef } from 'react';
import { secondaryButton } from '@tma.js/sdk-react';
import { useTelegram } from './useTelegram';
import type { SecondaryButtonOptions } from '../interfaces/SecondaryButtonOptions';
import { useTheme } from '../context/ThemeContext.ts';

export function useSecondaryButton({
  text = '',
  iconCustomEmojiId = '',
  bgColor,
  textColor,
  isEnabled,
  isVisible = true,
  onClick,
  position = 'left',
}: SecondaryButtonOptions) {
  const { ready } = useTelegram();
  const onClickRef = useRef(onClick);
  const theme = useTheme();

  useEffect(() => {
    onClickRef.current = onClick;
  }, [onClick]);

  useEffect(() => {
    if (!ready) return;

    const unsubscribe = secondaryButton.onClick(() => {
      onClickRef.current?.();
    });

    return () => {
      unsubscribe();
    };
  }, [ready]);

  useEffect(() => {
    if (!ready) return;

    secondaryButton.setParams({
      bgColor: bgColor ?? theme.secondary_bg_color,
      textColor,
      iconCustomEmojiId: undefined,
      position,
    });

    const timer = setTimeout(() => {
      secondaryButton.setParams({
        text,
        iconCustomEmojiId,
        isEnabled: isEnabled,
        isVisible,
      });
    }, 50);

    return () => clearTimeout(timer);
  }, [
    ready,
    text,
    iconCustomEmojiId,
    bgColor,
    theme,
    textColor,
    isEnabled,
    isVisible,
    position,
  ]);

  useEffect(() => {
    if (!ready) return;

    return () => {
      secondaryButton.setParams({
        isVisible: false,
        text: '',
        iconCustomEmojiId: undefined,
        bgColor: theme.secondary_bg_color,
        textColor: theme.button_text_color,
      });
    };
  }, [ready, theme]);
}
