import { useEffect, useRef } from 'react';
import { mainButton } from '@tma.js/sdk-react';
import { useTelegram } from './useTelegram';
import type { MainButtonOptions } from '../types/MainButtonOptions';
import { useTheme } from '../context/ThemeContext.ts';

/**
 * Module-level generation counter for ownership tracking.
 *
 * Problem: mainButton is a global singleton, but multiple components can
 * call useMainButton simultaneously (e.g. during modal transitions with
 * 300ms close animations). Without ownership, the cleanup of the unmounting
 * component resets the button AFTER the new component already configured it.
 *
 * Solution: each effect invocation increments the counter and only resets
 * the button on cleanup if it is still the current owner.
 */
let mainButtonGeneration = 0;

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

    // Claim ownership of the button.
    const gen = ++mainButtonGeneration;

    // Set all params in a single call to avoid race-condition windows.
    // Previous code used a two-phase approach (immediate + setTimeout 50ms)
    // but that created interleaving issues and the "clear" phase passed
    // `undefined` which the SDK silently strips (Ce function in @tma.js/sdk).
    mainButton.setParams({
      text,
      iconCustomEmojiId,
      bgColor,
      textColor,
      isEnabled: isEnabled && !isLoading,
      isVisible,
    });

    return () => {
      // Only reset if we are still the current owner.
      // If another component already claimed the button, skip the reset
      // to avoid clobbering its state.
      if (mainButtonGeneration !== gen) return;

      mainButton.hideLoader();

      // Use empty string '' to clear the icon — `undefined` is stripped
      // by the SDK's internal Ce() filter and leaves the old icon in place.
      mainButton.setParams({
        isVisible: false,
        text: '',
        iconCustomEmojiId: '',
        bgColor: theme.button_color,
        textColor: theme.button_text_color,
      });
    };
  }, [
    ready,
    text,
    iconCustomEmojiId,
    bgColor,
    textColor,
    isEnabled,
    isVisible,
    isLoading,
    theme,
  ]);

  useEffect(() => {
    if (!ready) return;

    if (isLoading) {
      mainButton.showLoader();
    } else {
      mainButton.hideLoader();
    }
  }, [ready, isLoading]);
}
