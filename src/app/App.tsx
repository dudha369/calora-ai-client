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
import { useOrientationLock } from '@/features/scanner/hooks/useOrientationLock.ts';
import { settingsButton } from '@tma.js/sdk-react';
import { useTheme } from '@/shared/context/ThemeContext';
import { useUserSession } from '@/shared/hooks/useUserSession';
import UserContext from '@/shared/context/UserContext';
import { ScrollContainerContext } from '@/shared/context/ScrollContainerContext';
import ScannerProvider from '@/features/scanner/context/ScannerProvider';

export function App() {
  const { ready, safeTop, safeBottom } = useTelegram();
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
      ) : session.status === 'ready' ? (
        <UserContext.Provider
          value={{ user_data: session.userData, isLoading: false }}
        >
          <ScannerProvider>
            <ScrollContainerContext.Provider value={scrollContainerRef}>
              <main
                className={`relative flex flex-1 flex-col overflow-y-auto overscroll-y-contain ${
                  location.pathname.startsWith('/admin')
                    ? 'w-full'
                    : 'mx-auto w-full max-w-screen-sm'
                }`}
                style={{
                  backgroundColor: theme.bg_color,
                }}
              >
                <Outlet />
              </main>
            </ScrollContainerContext.Provider>

            {location.pathname !== '/onboarding' &&
              !location.pathname.startsWith('/admin') && (
                <NavigationBar safeBottom={safeBottom} />
              )}
          </ScannerProvider>
        </UserContext.Provider>
      ) : null}
    </div>
  );
}
