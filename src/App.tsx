import { LoadingScreen } from "./components/loading/LoadingScreen";
import { NavigationBar } from "./components/NavigationBar/NavigationBar";
import { Outlet, Navigate, useLocation, useNavigation } from "react-router-dom";

import { useQuery } from "react-query";
import { request } from "./api/request";
import type { UserResponse } from "./interfaces/User";

import { useTelegram } from "./hooks/useTelegram.ts";
import { useTelegramLanguage } from './hooks/useTelegramLanguage';
import ThemeContext from "./context/ThemeContext";
import UserContext from "./context/UserContext";
import { ScannerProvider } from "./providers/ScannerProvider.tsx";

import logoUrl from './assets/favicon.svg'

export function App(){
  const { ready, safeTop, theme } = useTelegram();
  const minTopToLabel = 26 + 10;
  useTelegramLanguage();
  const location = useLocation();
  const navigation = useNavigation();

  const { data: user, isLoading: isUserLoading } = useQuery({
    queryKey: ["user"],
    queryFn: async () => {
      const res = await request<UserResponse>("users/get");
      return res.data.user;
    },
    enabled: ready,
  });

  const isBooting = !ready || isUserLoading;
  const isNavigating = navigation.state === "loading";

  if (!isBooting && user?.needs_onboarding && location.pathname !== "/onboarding") {
    return <Navigate to="/onboarding" replace />;
  }

  return (
    <ThemeContext.Provider value={theme}>
      <div
        className="flex h-dvh flex-col relative"
        style={{
          backgroundColor: theme.bg_color,
          color: theme.text_color,
          paddingTop: safeTop,
        }}
      >
        {(isBooting || isNavigating) && <LoadingScreen />}

        {!isBooting && (
          <UserContext.Provider value={{ user, isLoading: false }}>
            <ScannerProvider>
              {(safeTop >= minTopToLabel) && (
                <header
                  className="fixed flex gap-px items-center top-2 left-1/2 -translate-x-1/2 px-2.5 py-0.5 rounded-full"
                  style={{
                    top: safeTop - minTopToLabel,
                    backgroundColor: theme.button_color,
                    color: theme.button_text_color,
                  }}
                >
                  <img src={logoUrl} height={24} width={24} />
                  <span className="text-sm leading-none font-semibold tracking-wide uppercase px-1">Calora AI</span>
                </header>
              )}

              <main className="flex-1 overflow-y-auto">
                <Outlet />
              </main>

              {location.pathname !== "/onboarding" && <NavigationBar />}
            </ScannerProvider>
          </UserContext.Provider>
        )}
      </div>
    </ThemeContext.Provider>
  );
}
