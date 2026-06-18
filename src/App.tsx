import { LoadingScreen } from './components/loading/LoadingScreen';
import { ErrorScreen } from './components/loading/ErrorScreen';
import { NavigationBar } from './components/NavigationBar/NavigationBar';
import {
  Outlet,
  Navigate,
  useLocation,
  useNavigation,
  useNavigate,
} from 'react-router-dom';

import { useSwipeNavigation } from './hooks/useSwipeNavigation';
import { useTelegram } from './hooks/useTelegram';
import { useTelegramLanguage } from './hooks/useTelegramLanguage';
import { useTheme } from './context/ThemeContext';
import { useUserSession } from './hooks/useUserSession';
import UserContext from './context/UserContext';
import ScannerProvider from './providers/ScannerProvider';

import { useEffect } from 'react';
import { settingsButton } from '@tma.js/sdk-react';

export function App() {
  const { ready, safeTop, safeBottom } = useTelegram();
  const theme = useTheme();
  useTelegramLanguage();

  const navigate = useNavigate();
  useEffect(() => {
    if (!settingsButton.mount.isAvailable()) return;

    settingsButton.mount();
    settingsButton.show();

    const off = settingsButton.onClick(() => navigate('/profile/settings'));

    return () => {
      off();
      settingsButton.hide();
    };
  }, [navigate]);

  const location = useLocation();
  const navigation = useNavigation();
  const session = useUserSession(ready);

  const swipe = useSwipeNavigation(session.status === 'ready');

  if (
    session.status === 'ready' &&
    session.userData?.needs_onboarding &&
    location.pathname !== '/onboarding'
  ) {
    return <Navigate to="/onboarding" replace />;
  }

  return (
    <div
      className="relative flex h-dvh flex-col" // max-w-screen-sm
      style={{
        backgroundColor: theme.bg_color,
        color: theme.text_color,
        paddingTop: safeTop,
      }}
      {...swipe}
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
            <main className="relative flex flex-1 flex-col overflow-y-auto pb-4">
              <Outlet />
            </main>

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
