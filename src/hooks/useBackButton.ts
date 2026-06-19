import { useEffect, useRef } from 'react';
import { backButton } from '@tma.js/sdk-react';

export const useBackButton = (onBack: () => void, enabled: boolean) => {
  const onBackRef = useRef(onBack);

  useEffect(() => {
    onBackRef.current = onBack;
  });

  useEffect(() => {
    const handler = () => onBackRef.current();
    const offClick = backButton.onClick(handler);

    return () => {
      offClick();
      backButton.hide();
    };
  }, []);

  useEffect(() => {
    if (enabled) {
      backButton.show();
    } else {
      backButton.hide();
    }
  }, [enabled]);
};
