import { createBrowserRouter } from 'react-router-dom';
import { App } from './App';
import { RouterErrorBoundary } from '@/shared/ui/loading/RouterErrorBoundary';
import { LoadingScreen } from '@/shared/ui/loading/LoadingScreen';

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
              import('@/features/home/pages/HomePage').then((m) => ({
                Component: m.HomePage,
              })),
          },
          {
            path: 'onboarding',
            lazy: () =>
              import('@/features/onboarding/pages/OnboardingPage').then((m) => ({
                Component: m.OnboardingPage,
              })),
          },
          {
            path: 'water',
            lazy: () =>
              import('@/features/water/pages/WaterPage').then((m) => ({
                Component: m.WaterPage,
              })),
          },
          {
            path: 'scanner',
            lazy: () =>
              import('@/features/scanner/pages/ScannerPage').then((m) => ({
                Component: m.ScannerPage,
              })),
          },
          {
            path: 'analytics/:date?',
            lazy: () =>
              import('@/features/analytics/pages/AnalyticsPage').then((m) => ({
                Component: m.AnalyticsPage,
              })),
          },
          {
            path: 'profile',
            children: [
              {
                index: true,
                lazy: () =>
                  import('@/features/profile/pages/ProfilePage').then((m) => ({
                    Component: m.ProfilePage,
                  })),
              },
              {
                path: 'admin',
                lazy: () =>
                  import('@/features/admin/pages/AdminPage').then((m) => ({
                    Component: m.AdminPage,
                  })),
              },
              {
                path: 'body',
                lazy: () =>
                  import('@/features/profile/pages/BodyPage').then((m) => ({
                    Component: m.BodyPage,
                  })),
              },
              {
                path: 'nutrition',
                lazy: () =>
                  import('@/features/profile/pages/NutritionPage').then((m) => ({
                    Component: m.NutritionPage,
                  })),
              },
              {
                path: 'weight',
                lazy: () =>
                  import('@/features/profile/pages/WeightPage').then((m) => ({
                    Component: m.WeightPage,
                  })),
              },
              {
                path: 'quests',
                lazy: () =>
                  import('@/features/profile/pages/QuestsPage').then((m) => ({
                    Component: m.QuestsPage,
                  })),
              },
              {
                path: 'settings',
                lazy: () =>
                  import('@/features/profile/pages/SettingsPage').then((m) => ({
                    Component: m.SettingsPage,
                  })),
              },
            ],
          },
        ],
      },
    ],
  },
]);
