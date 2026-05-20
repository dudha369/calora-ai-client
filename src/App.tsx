import { Outlet } from "react-router-dom";
import { useQuery } from "react-query";

import ThemeContext from "./context/ThemeContext";
import UserContext from "./context/UserContext";

import { request } from "./api/api";
import { NavigationBar } from "./components/NavigationBar/NavigationBar";

import { useTelegram } from "./providers/TelegramRootProvider";
import { useTelegramTheme } from "./hooks/useTelegramTheme";

import type { IUser } from "./interfaces/IUser";

export function App() {
  const { ready, safeTop, safeBottom } = useTelegram();

  const theme = useTelegramTheme();

  const { data: user, isLoading } = useQuery({
    queryKey: ["user"],
    queryFn: async () => {
      const res = await request("users/get");
      return res.data.user as IUser;
    },
    enabled: ready
  });

  const contextValue = {
    user,
    isLoading: !ready || isLoading
  };

  return (
    <ThemeContext.Provider value={theme}>
      <UserContext.Provider value={contextValue}>
        <div
          style={{
            paddingTop: safeTop,
            paddingBottom: safeBottom
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
