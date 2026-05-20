import { useEffect } from "react";
import { init, initData, viewport } from "@telegram-apps/sdk";
import { WebApp, isMobileDevice } from "../api/telegram";

export function useTelegramInit(onReady: () => void) {
  useEffect(() => {
    const run = async () => {
      try {
        init();
        initData.restore();

        await viewport.mount();
        await viewport.expand();

        if (isMobileDevice()) {
          WebApp?.requestFullscreen();
        }
      } finally {
        onReady();
      }
    };

    run();
  }, []);
}