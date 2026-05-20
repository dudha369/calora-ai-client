import { useEffect, useState } from "react";
import { WebApp } from "../api/telegram";

type SafeArea = {
  top: number;
  bottom: number;
};

export function useTelegramLayout(ready: boolean) {
  const [safeArea, setSafeArea] = useState<SafeArea>({
    top: 0,
    bottom: 0
  });

  useEffect(() => {
    const updateSafeArea = () => {
      const top =
        (WebApp?.safeAreaInset?.top ?? 0) +
        (WebApp?.contentSafeAreaInset?.top ?? 0);

      const bottom =
        (WebApp?.safeAreaInset?.bottom ?? 0) +
        (WebApp?.contentSafeAreaInset?.bottom ?? 0);

      setSafeArea({ top, bottom });
    };

    const onViewportChanged = (data: any) => {
      if (data && data.isStateStable === false) return;
      updateSafeArea();
    };

    const initLayout = async () => {
      updateSafeArea();
    };

    initLayout();

    WebApp?.onEvent("fullscreenChanged", updateSafeArea);
    WebApp?.onEvent("safeAreaChanged", updateSafeArea);
    WebApp?.onEvent("contentSafeAreaChanged", updateSafeArea);

    // TS FIX: typings outdated
    (WebApp as any)?.onEvent("viewportChanged", onViewportChanged);

    return () => {
      WebApp?.offEvent("fullscreenChanged", updateSafeArea);
      WebApp?.offEvent("safeAreaChanged", updateSafeArea);
      WebApp?.offEvent("contentSafeAreaChanged", updateSafeArea);

      (WebApp as any)?.offEvent("viewportChanged", onViewportChanged);
    };
  }, [ready]);

  return safeArea;
}
