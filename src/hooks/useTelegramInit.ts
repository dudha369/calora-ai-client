import { useEffect } from "react";
import { init, initData, viewport } from "@telegram-apps/sdk";
import { isMobileDevice } from "../api/telegram";

function requestSafeAreaUpdate() {
  try {
    const w = window as unknown as {
      TelegramWebviewProxy?: { postEvent(type: string, data: string): void };
    };
    if (w.TelegramWebviewProxy) {
      w.TelegramWebviewProxy.postEvent("web_app_request_safe_area", "{}");
      w.TelegramWebviewProxy.postEvent("web_app_request_content_safe_area", "{}");
    }
  } catch {
  }
}

export function useTelegramInit(onReady: () => void) {
  useEffect(() => {
    const run = async () => {
      try {
        init();
        initData.restore();

        await viewport.mount();
        viewport.expand();

        if (isMobileDevice()) {
          try {
            await viewport.requestFullscreen();
            requestSafeAreaUpdate();
          } catch {
          }
        }
      } finally {
        onReady();
      }
    };

    run();
  }, []);
}
