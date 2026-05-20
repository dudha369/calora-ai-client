import { Outlet } from "react-router-dom";
import { useQuery } from "react-query";

import ThemeContext from "./context/ThemeContext";
import UserContext from "./context/UserContext";

import { request } from "./api/api";
import { NavigationBar } from "./components/NavigationBar/NavigationBar";
import { LoadingScreen } from "./components/LoadingScreen/LoadingScreen";

import { useTelegram } from "./providers/TelegramRootProvider";

import type { IUser } from "./interfaces/IUser";

interface UserResponse {
  user: IUser;
}

export function App() {
  const { ready, safeTop, safeBottom, theme } = useTelegram();

  const { data: user, isLoading } = useQuery({
    queryKey: ["user"],
    queryFn: async () => {
      const res = await request<UserResponse>("users/get");
      return res.data.user;
    },
    enabled: ready,
  });

  const isAppLoading = !ready || isLoading;

  if (isAppLoading) {
    return (
      <ThemeContext.Provider value={theme}>
        <LoadingScreen />
      </ThemeContext.Provider>
    );
  }

  return (
    <ThemeContext.Provider value={theme}>
      <UserContext.Provider value={{ user, isLoading: false }}>
        <div
          style={{ paddingTop: safeTop }}
          className="h-screen flex flex-col bg-[var(--tg-bg-color)] text-[var(--tg-text-color)]"
        >
          <main className="flex-1 overflow-y-auto">
            <Outlet />
          </main>

          <NavigationBar safeBottom={safeBottom} />
        </div>
      </UserContext.Provider>
    </ThemeContext.Provider>
  );
}
