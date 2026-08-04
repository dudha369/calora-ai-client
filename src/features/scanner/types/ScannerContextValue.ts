export interface ScannerContextValue {
  isLiveCamera: boolean;
  setLiveCamera: (active: boolean) => void;
  /** Не null только когда ScannerPage хочет, чтобы FAB работал как затвор
   *  (живое фото еды на Android/десктопе) — см. NavigationBar.tsx. */
  shutterHandler: (() => void) | null;
  setShutterHandler: (handler: (() => void) | null) => void;
}
