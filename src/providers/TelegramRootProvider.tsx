import { type ReactNode, useState } from "react";
import { useTelegramInit } from "../hooks/useTelegramInit";
import { useTelegramTheme } from "../hooks/useTelegramTheme";
import { useTelegramLayout } from "../hooks/useTelegramLayout";
import { TelegramContext } from "../context/TelegramContext.ts";

export function TelegramRootProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);

  const theme = useTelegramTheme();
  const { top, bottom } = useTelegramLayout(ready);

  useTelegramInit(() => setReady(true));

  return (
    <TelegramContext.Provider value={{ ready, safeTop: top, safeBottom: bottom, theme }}>
      {children}
    </TelegramContext.Provider>
  );
}
