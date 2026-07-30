import { useEffect, useRef } from 'react';
import { LoadingScreen } from '@/shared/ui/loading/LoadingScreen';
import { ErrorScreen } from '@/shared/ui/loading/ErrorScreen';
import { NavigationBar } from '@/shared/ui/NavigationBar/NavigationBar';
import {
  Outlet,
  Navigate,
  useLocation,
  useNavigation,
  useNavigate,
} from 'react-router-dom';

import { useTelegram } from '@/shared/hooks/useTelegram';
import { useOrientationLock } from '@/features/scanner/hooks/useOrientationLock';
import { settingsButton } from '@tma.js/sdk-react';
import { useTheme } from '@/shared/context/ThemeContext';
import { useUserSession } from '@/shared/hooks/useUserSession';
import { UserContext } from '@/shared/context/UserContext';
import { ScrollContainerContext } from '@/shared/context/ScrollContainerContext';
import { ScannerProvider } from '@/features/scanner/context/ScannerProvider';

import logoUrl from '@/shared/assets/favicon.svg';

export function App() {
  const { ready, safeTop } = useTelegram();
  const theme = useTheme();

  // FIX: передаём ready чтобы вызов происходил после viewport.requestFullscreen().
  // screen.orientation.lock() на Chrome Android требует fullscreen context —
  // вызов до ready даёт silent fail.
  // FIX: убраны useForcePortraitLock и useTelegramOrientationLock —
  // useForcePortraitLock читал физический угол и применял body-стили
  // даже когда viewport оставался портретным → body выезжал за экран.
  useOrientationLock(ready);

  const scrollContainerRef = useRef<HTMLElement>(null);

  const navigate = useNavigate();
  useEffect(() => {
    if (!ready) return;

    const off = settingsButton.onClick(() => navigate('/profile/settings'));
    settingsButton.show();

    return () => {
      off();
      settingsButton.hide();
    };
  }, [navigate, ready]);

  const location = useLocation();
  const navigation = useNavigation();
  const session = useUserSession(ready);

  if (
    session.status === 'ready' &&
    session.userData?.needs_onboarding &&
    location.pathname !== '/onboarding'
  ) {
    return <Navigate to="/onboarding" replace />;
  }

  const isAdminPage = location.pathname.startsWith('/profile/admin');
  const isHomePage = location.pathname === '/';
  const logoSize = isHomePage
    ? { width: 30, height: 30 }
    : { width: 24, height: 24 };

  return (
    <div
      className="relative flex h-full flex-col"
      style={{
        backgroundColor: theme.bg_color,
        color: theme.text_color,
        paddingTop: safeTop,
      }}
    >
      {session.status === 'booting' || navigation.state === 'loading' ? (
        <LoadingScreen />
      ) : session.status === 'auth_error' ? (
        <ErrorScreen errorType="no_telegram" />
      ) : session.status === 'access_denied' ? (
        <ErrorScreen errorType="access_denied" />
      ) : session.status === 'maintenance' ? (
        <ErrorScreen
          errorType="maintenance"
          onRetry={() => window.location.reload()}
        />
      ) : session.status === 'ready' ? (
        <>
          {safeTop >= 44 && (
            <header
              className="pointer-events-none fixed top-0 left-0 flex w-full flex-col justify-end"
              style={{
                height: safeTop,
                color: theme.button_text_color,
              }}
            >
              <div className="flex h-11 w-full items-center justify-center gap-2">
                <img
                  src={logoUrl}
                  alt="logo"
                  className="size-${isHomePage ? 7 : 9} pointer-events-auto shrink-0 rounded-full bg-white shadow-sm"
                  style={logoSize}
                />

                {!isHomePage && (
                  <span
                    className="text-xl leading-none font-semibold tracking-wide"
                    style={{ color: theme.text_color }}
                  >
                    Calora AI
                  </span>
                )}
              </div>
            </header>
          )}
          <UserContext.Provider
            value={{ user_data: session.userData, isLoading: false }}
          >
            <ScannerProvider>
              <ScrollContainerContext.Provider value={scrollContainerRef}>
                <main
                  ref={scrollContainerRef}
                  className={`relative flex flex-1 flex-col overflow-y-auto overscroll-y-contain *:pb-4 ${
                    isAdminPage ? 'w-full' : 'mx-auto w-full max-w-screen-sm'
                  }`}
                  style={{
                    backgroundColor: theme.bg_color,
                  }}
                >
                  <Outlet />
                </main>
              </ScrollContainerContext.Provider>

              {location.pathname !== '/onboarding' && !isAdminPage && (
                <NavigationBar />
              )}
            </ScannerProvider>
          </UserContext.Provider>
        </>
      ) : null}
    </div>
  );
}
