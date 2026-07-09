import { useRef, useCallback, useState, type ReactNode } from 'react';
import { ScannerContext } from './ScannerContext';

export function ScannerProvider({ children }: { children: ReactNode }) {
  const captureRef = useRef<(() => void) | null>(null);

  const registerCapture = useCallback((fn: () => void) => {
    captureRef.current = fn;
  }, []);

  const triggerCapture = useCallback(() => {
    captureRef.current?.();
  }, []);

  const [isLiveCamera, setLiveCamera] = useState(false);

  return (
    <ScannerContext.Provider
      value={{ registerCapture, triggerCapture, isLiveCamera, setLiveCamera }}
    >
      {children}
    </ScannerContext.Provider>
  );
}
