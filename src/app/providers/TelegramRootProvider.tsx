import { type ReactNode, useState } from 'react';
import { useTelegramInit } from '@/shared/hooks/useTelegramInit';
import { useTelegramLayout } from '@/shared/hooks/useTelegramLayout';
import { TelegramContext } from '@/shared/context/TelegramContext';

export function TelegramRootProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);

  const { top, bottom } = useTelegramLayout(ready);
  useTelegramInit(() => setReady(true));

  return (
    <TelegramContext.Provider
      value={{ ready, safeTop: top, safeBottom: bottom }}
    >
      {children}
    </TelegramContext.Provider>
  );
}
