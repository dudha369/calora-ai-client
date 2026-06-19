import { useEffect, useRef } from 'react';
import { secondaryButton } from '@tma.js/sdk-react';
import { useTelegram } from './useTelegram';
import type { SecondaryButtonOptions } from '../interfaces/SecondaryButtonOptions';

export function useSecondaryButton({
  text,
  iconCustomEmojiId,
  isEnabled,
  isVisible = true,
  onClick,
  position,
}: SecondaryButtonOptions) {
  const { ready } = useTelegram();

  const onClickRef = useRef(onClick);
  useEffect(() => {
    onClickRef.current = onClick;
  }, [onClick]);

  // Монтирование кнопки
  useEffect(() => {
    if (!ready) return;

    secondaryButton.setParams({ isVisible, position });

    return () => {
      secondaryButton.setParams({ isVisible: false });
    };
  }, [ready, isVisible, position]);

  // Обработчик клика
  useEffect(() => {
    if (!ready) return;

    return secondaryButton.onClick(() => {
      if (onClickRef.current) onClickRef.current();
    });
  }, [ready]);

  // Обновление параметров кнопки
  useEffect(() => {
    if (!ready) return;

    secondaryButton.setParams({
      text,
      isEnabled,
      iconCustomEmojiId,
    });
  }, [ready, text, iconCustomEmojiId, isEnabled]);
}
