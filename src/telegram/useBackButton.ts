import { useEffect, useRef } from "react";
import { backButton } from "@tma.js/sdk-react";

export const useBackButton = (onBack: () => void, enabled: boolean) => {
  const onBackRef = useRef(onBack);

  useEffect(() => {
    onBackRef.current = onBack;
  });

  useEffect(() => {
    if (!backButton.mount.isAvailable()) return;
    if (!backButton.isMounted()) backButton.mount();

    const handler = () => onBackRef.current();
    const offClick = backButton.onClick(handler);

    return () => {
      offClick();
      backButton.hide();
    };
  }, []);

  useEffect(() => {
    if (!backButton.isMounted()) return;
    enabled ? backButton.show() : backButton.hide();
  }, [enabled]);
};
