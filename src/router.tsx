import { createBrowserRouter } from 'react-router-dom';
import { App } from './App';
import { RouterErrorBoundary } from './components/loading/RouterErrorBoundary';
import { LoadingScreen } from './components/loading/LoadingScreen.tsx';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    hydrateFallbackElement: <LoadingScreen />,
    children: [
      {
        errorElement: <RouterErrorBoundary />,
        children: [
          {
            index: true,
            lazy: () =>
              import('./pages/HomePage').then((m) => ({
                Component: m.HomePage,
              })),
          },
          {
            path: 'onboarding',
            lazy: () =>
              import('./pages/OnboardingPage').then((m) => ({
                Component: m.OnboardingPage,
              })),
          },
          {
            path: 'water',
            lazy: () =>
              import('./pages/WaterPage').then((m) => ({
                Component: m.WaterPage,
              })),
          },
          {
            path: 'scanner',
            lazy: () =>
              import('./pages/ScannerPage').then((m) => ({
                Component: m.ScannerPage,
              })),
          },
          {
            path: 'analytics',
            lazy: () =>
              import('./pages/AnalyticsPage').then((m) => ({
                Component: m.AnalyticsPage,
              })),
          },
          {
            path: 'profile',
            lazy: () =>
              import('./pages/ProfilePage').then((m) => ({
                Component: m.ProfilePage,
              })),
          },
        ],
      },
    ],
  },
]);
