import { useEffect, useRef } from 'react';
import { mainButton } from '@tma.js/sdk-react';
import { useTelegram } from './useTelegram';
import type { MainButtonOptions } from '../interfaces/MainButtonOptions';

export function useMainButton({
  text,
  iconCustomEmojiId,
  isEnabled,
  isVisible = true,
  isLoading = false,
  onClick,
}: MainButtonOptions) {
  const { ready } = useTelegram();

  const onClickRef = useRef(onClick);
  useEffect(() => {
    onClickRef.current = onClick;
  }, [onClick]);

  // Монтирование кнопки
  useEffect(() => {
    if (!ready) return;

    mainButton.setParams({ isVisible });

    return () => {
      mainButton.setParams({ isVisible: false });
    };
  }, [ready, isVisible]);

  // Обработчик клика
  useEffect(() => {
    if (!ready) return;

    return mainButton.onClick(() => {
      if (onClickRef.current) onClickRef.current();
    });
  }, [ready]);

  // Обновление параметров кнопки
  useEffect(() => {
    if (!ready) return;

    if (isLoading) {
      mainButton.showLoader();
    } else {
      mainButton.hideLoader();
    }

    mainButton.setParams({
      text,
      isEnabled: isEnabled && !isLoading,
      iconCustomEmojiId,
    });
  }, [ready, text, iconCustomEmojiId, isEnabled, isLoading]);
}
