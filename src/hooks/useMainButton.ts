import { useEffect, useRef } from 'react';
import { mainButton } from '@tma.js/sdk-react';
import { useTelegram } from './useTelegram';
import type { MainButtonOptions } from '../interfaces/MainButtonOptions';

export function useMainButton({
  text,
  iconCustomEmojiId,
  isEnabled,
  isLoading = false,
  onClick,
}: MainButtonOptions) {
  const { ready } = useTelegram();

  const onClickRef = useRef(onClick);
  useEffect(() => {
    onClickRef.current = onClick;
  }, [onClick]);

  useEffect(() => {
    if (!ready) return;

    if (!mainButton.isMounted()) {
      mainButton.mount();
    }

    mainButton.setParams({ isVisible: true });

    return () => {
      mainButton.setParams({ isVisible: false });
    };
  }, [ready]);

  useEffect(() => {
    if (!ready) return;

    return mainButton.onClick(() => {
      if (onClickRef.current) onClickRef.current();
    });
  }, [ready]);

  useEffect(() => {
    if (!ready) return;

    mainButton.setParams({
      text,
      isEnabled: isEnabled && !isLoading,
      iconCustomEmojiId,
    });
  }, [ready, text, iconCustomEmojiId, isEnabled, isLoading]);
}
