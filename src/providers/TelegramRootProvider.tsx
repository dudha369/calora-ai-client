import { createContext, useEffect, useState, useContext } from "react";
import { init, initData, viewport } from "@telegram-apps/sdk";

import { WebApp, isMobileDevice } from "../api/telegram";

import { useTelegramTheme } from "../hooks/useTelegramTheme";
import { useTelegramLayout } from "../hooks/useTelegramLayout";

type TelegramState = {
  ready: boolean;
  safeTop: number;
  safeBottom: number;
};

const TelegramContext = createContext<TelegramState | null>(null);

export function useTelegram() {
  const ctx = useContext(TelegramContext);
  if (!ctx) throw new Error("useTelegram must be used inside TelegramRootProvider");
  return ctx;
}

export function TelegramRootProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);

  const theme = useTelegramTheme();
  const { top, bottom } = useTelegramLayout();

  const [safeTop, setSafeTop] = useState(0);
  const [safeBottom, setSafeBottom] = useState(0);

  useEffect(() => {
    const update = () => {
      setSafeTop(top);
      setSafeBottom(bottom);
    };

    update();
  }, [top, bottom]);

  useEffect(() => {
    const run = async () => {
      init();
      initData.restore();

      await viewport.mount();
      await viewport.expand();

      if (isMobileDevice()) {
        WebApp?.requestFullscreen();
      }

      setReady(true);
    };

    run();
  }, []);

  useEffect(() => {
    if (!ready) return;

    WebApp?.ready();
  }, [ready]);

  const value: TelegramState = {
    ready,
    safeTop,
    safeBottom
  };

  return (
    <TelegramContext.Provider value={value}>
      {children}
    </TelegramContext.Provider>
  );
}