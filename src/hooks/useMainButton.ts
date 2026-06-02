import { useEffect, useRef } from 'react';
import { mainButton } from '@tma.js/sdk-react';
import { useTelegram } from './useTelegram';
import type { MainButtonOptions } from '../interfaces/MainButtonOptions.ts'

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
    try {
      if (!mainButton.isMounted()) mainButton.mount();
      mainButton.show();
    } catch {}

    return () => {
      try {
        mainButton.hide();
        if (mainButton.isMounted()) mainButton.unmount();
      } catch {}
    };
  }, [ready]);

  useEffect(() => {
    if (!ready) return;
    try {
      return mainButton.onClick(() => onClickRef.current());
    } catch {}
  }, [ready]);

  useEffect(() => {
    if (!ready) return;
    try { mainButton.setText(text); } catch {}
  }, [ready, text]);

  useEffect(() => {
    if (!ready) return;
    try {
      if (isEnabled && !isLoading) {
        mainButton.enable();
      } else {
        mainButton.disable();
      }
    } catch {}
  }, [ready, isEnabled, isLoading]);
}
