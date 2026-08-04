import { useCallback, useState, type ReactNode } from 'react';
import { ScannerContext } from './ScannerContext';

export function ScannerProvider({ children }: { children: ReactNode }) {
  const [isLiveCamera, setLiveCamera] = useState(false);
  const [shutterHandler, setShutterHandlerState] = useState<
    (() => void) | null
  >(null);

  // setState(() => fn) — иначе React решит, что fn это updater-функция,
  // а не значение, которое нужно сохранить в стейте.
  const setShutterHandler = useCallback((handler: (() => void) | null) => {
    setShutterHandlerState(() => handler);
  }, []);

  return (
    <ScannerContext.Provider
      value={{ isLiveCamera, setLiveCamera, shutterHandler, setShutterHandler }}
    >
      {children}
    </ScannerContext.Provider>
  );
}
