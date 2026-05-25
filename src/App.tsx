import { Outlet } from "react-router-dom";
import { useQuery } from "react-query";

import ThemeContext from "./context/ThemeContext";
import UserContext from "./context/UserContext";
import { ScannerProvider } from "./providers/ScannerProvider.tsx";

import { request } from "./api/api";
import { NavigationBar } from "./components/NavigationBar/NavigationBar";
import { LoadingScreen } from "./components/LoadingScreen";

import { useTelegram } from "./providers/TelegramRootProvider";

import type { UserResponse } from "./interfaces/IUser";

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

  return (
    <ThemeContext.Provider value={theme}>
      <UserContext.Provider value={{ user, isLoading: false }}>
        <ScannerProvider>
          <div
            style={{ paddingTop: safeTop }}
            className="h-screen flex flex-col px-4 bg-(--tg-bg-color) text-(--tg-text-color)"
          >
            <main className="flex-1 overflow-y-auto">
              <Outlet />
            </main>

              <NavigationBar safeBottom={safeBottom} />
          </div>
        </ScannerProvider>
      </UserContext.Provider>

      {isAppLoading && <LoadingScreen />}
    </ThemeContext.Provider>
  );
}
