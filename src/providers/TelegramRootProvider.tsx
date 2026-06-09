import { type ReactNode, useState } from "react";
import { useTelegramInit } from "../hooks/useTelegramInit";
import { useTelegramLayout } from "../hooks/useTelegramLayout";
import { TelegramContext } from "../context/TelegramContext";

export function TelegramRootProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);

  const { top, bottom } = useTelegramLayout(ready);
  useTelegramInit(() => setReady(true));

  return (
    <TelegramContext.Provider value={{ ready, safeTop: top, safeBottom: bottom }}>
      {children}
    </TelegramContext.Provider>
  );
}
