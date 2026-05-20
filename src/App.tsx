import { useMemo, useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import { useQuery } from "react-query";

import ThemeContext from "./context/ThemeContext";
import UserContext from "./context/UserContext";

import { request } from "./api/api";
import { WebApp } from "./api/telegram";

import { NavigationBar } from "./components/NavigationBar/NavigationBar";

import type { IUser } from "./interfaces/IUser";

import { useTelegramInit } from "./hooks/useTelegramInit";
import { useTelegramLayout } from "./hooks/useTelegramLayout";
import { useTelegramTheme } from "./hooks/useTelegramTheme";

export function App() {
  const [telegramReady, setTelegramReady] = useState(false);

  const theme = useTelegramTheme();
  const { top, bottom } = useTelegramLayout(telegramReady);

  useTelegramInit(() => setTelegramReady(true));

  const { data: user, isLoading } = useQuery({
    queryKey: ["user"],
    queryFn: async () => {
      const res = await request("users/get");
      return res.data.user as IUser;
    },
    enabled: telegramReady
  });

  useEffect(() => {
    if (telegramReady && !isLoading) {
      WebApp?.ready();
    }
  }, [telegramReady, isLoading]);

  const contextValue = useMemo(() => {
    return {
      user,
      isLoading: !telegramReady || isLoading
    };
  }, [user, telegramReady, isLoading]);

  return (
    <ThemeContext.Provider value={theme}>
      <UserContext.Provider value={contextValue}>
        <div
          style={{
            paddingTop: top,
            paddingBottom: bottom
          }}
          className="h-screen flex flex-col bg-[var(--tg-bg-color)] text-[var(--tg-text-color)]"
        >
          <main className="flex-1 overflow-y-auto">
            <Outlet />
          </main>

          <NavigationBar iconColor={theme.text_color} />
        </div>
      </UserContext.Provider>
    </ThemeContext.Provider>
  );
}
