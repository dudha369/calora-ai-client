import { createContext, useState, useContext } from "react";

import { useTelegramInit } from "../hooks/useTelegramInit";
import { useTelegramTheme } from "../hooks/useTelegramTheme";
import { useTelegramLayout } from "../hooks/useTelegramLayout";
import { WebApp } from "../api/telegram";

import type { Theme } from "../interfaces/Theme";

type TelegramState = {
  ready: boolean;
  safeTop: number;
  safeBottom: number;
  theme: Theme;
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

  // Uses the dedicated hook — no duplicated logic
  useTelegramInit(() => {
    WebApp?.ready();
    setReady(true);
  });

  const value: TelegramState = {
    ready,
    safeTop: top,
    safeBottom: bottom,
    theme,
  };

  return (
    <TelegramContext.Provider value={value}>
      {children}
    </TelegramContext.Provider>
  );
}
