import { useEffect } from "react";
import { init, initData, viewport } from "@telegram-apps/sdk";
import { WebApp, isMobileDevice } from "../api/telegram";

/**
 * Initialises the Telegram Mini App SDK once and calls onReady when done.
 * Use this hook inside TelegramRootProvider only.
 */
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}
