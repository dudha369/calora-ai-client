import { useEffect } from 'react';
import {
  init,
  initData,
  viewport,
  themeParams,
  swipeBehavior,
  settingsButton,
  mainButton,
  secondaryButton,
  backButton,
} from '@tma.js/sdk-react';
import { isMobileDevice } from '../lib/device';

function requestSafeAreaUpdate() {
  try {
    const w = window as unknown as {
      TelegramWebviewProxy?: { postEvent(type: string, data: string): void };
    };
    if (w.TelegramWebviewProxy) {
      w.TelegramWebviewProxy.postEvent('web_app_request_safe_area', '{}');
      w.TelegramWebviewProxy.postEvent(
        'web_app_request_content_safe_area',
        '{}',
      );
    }
  } catch {
    // Игнорируем ошибку, если TelegramWebviewProxy недоступен в текущем окружении
  }
}

export function useTelegramInit(onReady: () => void) {
  useEffect(() => {
    const run = async () => {
      try {
        init();
        initData.restore();

        if (themeParams.mount.isAvailable() && !themeParams.isMounted()) {
          themeParams.mount();
        }

        if (settingsButton.mount.isAvailable() && !settingsButton.isMounted()) {
          settingsButton.mount();
        }

        if (mainButton.mount.isAvailable() && !mainButton.isMounted()) {
          mainButton.mount();
          mainButton.hide();
        }

        if (
          secondaryButton.mount.isAvailable() &&
          !secondaryButton.isMounted()
        ) {
          secondaryButton.mount();
          secondaryButton.hide();
        }

        if (backButton.mount.isAvailable() && !backButton.isMounted()) {
          backButton.mount();
          backButton.hide();
        }

        if (swipeBehavior.mount.isAvailable() && !swipeBehavior.isMounted()) {
          swipeBehavior.mount();
          swipeBehavior.disableVertical();
        }

        if (viewport.mount.isAvailable() && !viewport.isMounted()) {
          await viewport.mount();
          viewport.expand();
        }

        if (isMobileDevice()) {
          try {
            await viewport.requestFullscreen();
            requestSafeAreaUpdate();
          } catch {
            // Игнорируем ошибку, если устройство заблокировало переход в fullscreen
          }
        }
      } finally {
        onReady();
      }
    };

    run();
  }, [onReady]);
}
