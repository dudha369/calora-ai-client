import './i18n';
import { createRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import { router } from './router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { TelegramRootProvider } from './providers/TelegramRootProvider';
import { LanguageProvider } from './providers/LanguageProvider';
import { ThemeProvider } from './providers/ThemeProvider';
import { ErrorBoundary } from '@/shared/ui/loading/ErrorBoundary';
import './index.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

createRoot(document.getElementById('root')!).render(
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <TelegramRootProvider>
        <LanguageProvider>
          <ThemeProvider>
            <RouterProvider router={router} />
          </ThemeProvider>
        </LanguageProvider>
      </TelegramRootProvider>
    </QueryClientProvider>
  </ErrorBoundary>,
);
