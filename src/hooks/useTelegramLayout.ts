import { useEffect, useState } from "react";
import { WebApp } from "../api/telegram";

export function useTelegramLayout() {
  const [safe, setSafe] = useState({ top: 0, bottom: 0 });

  useEffect(() => {
    const update = () => {
      setSafe({
        top:
          (WebApp?.safeAreaInset?.top ?? 0) +
          (WebApp?.contentSafeAreaInset?.top ?? 0),

        bottom:
          (WebApp?.safeAreaInset?.bottom ?? 0) +
          (WebApp?.contentSafeAreaInset?.bottom ?? 0),
      });
    };

    update();

    WebApp?.onEvent("safeAreaChanged", update);
    WebApp?.onEvent("contentSafeAreaChanged", update);
    WebApp?.onEvent("fullscreenChanged", update);

    return () => {
      WebApp?.offEvent("safeAreaChanged", update);
      WebApp?.offEvent("contentSafeAreaChanged", update);
      WebApp?.offEvent("fullscreenChanged", update);
    };
  }, []);

  return safe;
}