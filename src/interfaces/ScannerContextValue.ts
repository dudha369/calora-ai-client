export interface ScannerContextValue {
  registerCapture: (fn: () => void) => void;
  triggerCapture: () => void;
  isLiveCamera: boolean;
  setLiveCamera: (active: boolean) => void;
}
