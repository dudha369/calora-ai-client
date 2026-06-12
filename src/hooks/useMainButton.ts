import { useEffect, useRef } from 'react';
import { mainButton } from '@telegram-apps/sdk-react';
import { useTelegram } from './useTelegram';
import type { MainButtonOptions } from '../interfaces/MainButtonOptions';

export function useMainButton({
  text,
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
    if (!mainButton.isMounted()) mainButton.mount();
    mainButton.setParams({ isVisible: true });

    return () => {
      mainButton.setParams({ isVisible: false });
      if (mainButton.isMounted()) mainButton.unmount();
    };
  }, [ready]);

  useEffect(() => {
    if (!ready) return;
    return mainButton.onClick(() => onClickRef.current());
  }, [ready]);

  useEffect(() => {
    if (!ready) return;
    mainButton.setParams({ text });
  }, [ready, text]);

  useEffect(() => {
    if (!ready) return;
    if (isEnabled && !isLoading) {
      mainButton.setParams({ isEnabled: true });
    } else {
      mainButton.setParams({ isEnabled: false });
    }
  }, [ready, isEnabled, isLoading]);
}
