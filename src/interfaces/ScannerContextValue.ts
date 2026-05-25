export interface ScannerContextValue {
  registerCapture: (fn: () => void) => void;
  triggerCapture: () => void;
}
