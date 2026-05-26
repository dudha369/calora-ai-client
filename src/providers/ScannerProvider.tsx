import { useRef, useCallback, type ReactNode } from "react";
import { ScannerContext } from "../context/ScannerContext.ts";


export const ScannerProvider = ({ children }: { children: ReactNode }) => {
  const captureRef = useRef<(() => void) | null>(null);

  const registerCapture = useCallback((fn: () => void) => {
    captureRef.current = fn;
  }, []);

  const triggerCapture = useCallback(() => {
    captureRef.current?.();
  }, []);

  return (
    <ScannerContext.Provider value={{ registerCapture, triggerCapture }}>
      {children}
    </ScannerContext.Provider>
  );
};
