import { createContext, useState, useContext } from "react";
import { useTelegramInit } from "../hooks/useTelegramInit";
import { useTelegramTheme } from "../hooks/useTelegramTheme";
import { useTelegramLayout } from "../hooks/useTelegramLayout";
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
  const { top, bottom } = useTelegramLayout(ready);

  // WebApp.ready() теперь вызывает SDK автоматически внутри init()
  useTelegramInit(() => setReady(true));

  return (
    <TelegramContext.Provider value={{ ready, safeTop: top, safeBottom: bottom, theme }}>
      {children}
    </TelegramContext.Provider>
  );
}
