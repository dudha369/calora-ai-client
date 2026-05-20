import { useEffect, useMemo, useState } from "react";
import { Outlet } from "react-router-dom";
import { useQuery } from "react-query";
import { init, initData, viewport } from "@telegram-apps/sdk";

import { NavigationBar } from "./components/NavigationBar/NavigationBar";
import UserContext from "./context/UserContext";
import { request } from "./api/api";
import { isMobileDevice, WebApp } from "./api/telegram";
import { getValidTheme } from "./getValidTheme";
import type { IUser } from "./interfaces/IUser";

export function App() {
  const [safeTop, setSafeTop] = useState(0);
  const [telegramReady, setTelegramReady] = useState(false);

  const { data: user, isLoading: userLoading } = useQuery({
    queryKey: ["user"],
    queryFn: async () => {
      const res = await request("users/get");
      return res.data;
    },
    select: (data) => data.user as IUser,
    enabled: telegramReady
  });

  useEffect(() => {
    const initTelegram = async () => {
      try {
        init();
        initData.restore();

        await viewport.mount();
        viewport.expand();

        if (isMobileDevice()) {
          WebApp?.requestFullscreen();
        }

        const updateSafeArea = () => {
          const top =
            (WebApp?.safeAreaInset?.top ?? 0) +
            (WebApp?.contentSafeAreaInset?.top ?? 0);

          setSafeTop(top);
        };

        updateSafeArea();

        WebApp?.onEvent("fullscreenChanged", updateSafeArea);
        WebApp?.onEvent("safeAreaChanged", updateSafeArea);
      } catch (error) {
        console.error("Telegram init error:", error);
      } finally {
        setTelegramReady(true);
      }
    };

    initTelegram();
  }, []);

  useEffect(() => {
    if (telegramReady && !userLoading) {
      WebApp?.ready();
    }
  }, [telegramReady, userLoading]);

  const theme = getValidTheme(WebApp?.themeParams, "telegram");

  const contextValue = useMemo(() => {
    return {
      user,
      isLoading: !telegramReady || userLoading
    };
  }, [user, telegramReady, userLoading]);

  return (
    <UserContext.Provider value={contextValue}>
      <div
        style={{ paddingTop: safeTop }}
        className="h-screen flex flex-col text-white"
      >
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>

        <NavigationBar iconColor={theme.text_color!} />
      </div>
    </UserContext.Provider>
  );
}
