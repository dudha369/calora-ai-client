import { useEffect, useRef } from 'react';
import { secondaryButton } from '@tma.js/sdk-react';
import { useTelegram } from './useTelegram';
import type { SecondaryButtonOptions } from '../types/SecondaryButtonOptions';
import { useTheme } from '../context/ThemeContext.ts';

/**
 * Module-level generation counter for ownership tracking.
 * @see useMainButton for detailed explanation.
 */
let secondaryButtonGeneration = 0;

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

    // Claim ownership of the button.
    const gen = ++secondaryButtonGeneration;

    // Set all params in a single call — no setTimeout two-phase approach.
    secondaryButton.setParams({
      text,
      iconCustomEmojiId,
      bgColor: bgColor ?? theme.secondary_bg_color,
      textColor,
      isEnabled,
      isVisible,
      position,
    });

    return () => {
      // Only reset if we are still the current owner.
      if (secondaryButtonGeneration !== gen) return;

      // Use empty string '' to clear the icon — `undefined` is stripped
      // by the SDK's internal Ce() filter and leaves the old icon in place.
      secondaryButton.setParams({
        isVisible: false,
        text: '',
        iconCustomEmojiId: '',
        bgColor: theme.secondary_bg_color,
        textColor: theme.button_text_color,
      });
    };
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
}
