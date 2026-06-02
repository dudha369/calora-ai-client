import { LoadingScreen } from "./components/loading/LoadingScreen";
import { NavigationBar } from "./components/NavigationBar/NavigationBar";
import { Outlet, Navigate } from "react-router-dom";

import { useQuery } from "react-query";
import { request } from "./api/request";
import type { UserResponse } from "./interfaces/User";

import { useTelegram } from "./hooks/useTelegram.ts";
import ThemeContext from "./context/ThemeContext";
import UserContext from "./context/UserContext";
import { ScannerProvider } from "./providers/ScannerProvider.tsx";

export function App() {
  const { ready, safeTop, theme } = useTelegram();

  const { data: user, isLoading } = useQuery({
    queryKey: ["user"],
    queryFn: async () => {
      const res = await request<UserResponse>("users/get");
      return res.data.user;
    },
    enabled: ready,
  });

  const isAppLoading = !ready || isLoading;
  if (!isAppLoading && user?.needs_onboarding) {
    return <Navigate to="/onboarding" replace />;
  }

  return (
    <ThemeContext.Provider value={theme}>
      <UserContext.Provider value={{ user, isLoading: false }}>
        <ScannerProvider>
          <div
            className="h-screen flex flex-col"
            style={{
              backgroundColor: theme.bg_color,
              color: theme.text_color,
              paddingTop: safeTop,
            }}
          >
            <main className="flex-1 pb-18"> {/* 72px - navbar */}
              <Outlet />
            </main>

            <NavigationBar />
          </div>
        </ScannerProvider>
      </UserContext.Provider>

      {isAppLoading && <LoadingScreen />}
    </ThemeContext.Provider>
  );
}
