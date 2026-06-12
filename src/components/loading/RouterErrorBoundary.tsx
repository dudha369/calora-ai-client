import { useRouteError, useNavigate, useLocation } from 'react-router-dom';
import { ErrorScreen } from './ErrorScreen';
import type { ErrorType } from './ErrorScreen';

function classifyRouteError(error: unknown): ErrorType {
  const msg = (error as Error)?.message || '';
  const isChunkFail = msg.includes(
    'Failed to fetch dynamically imported module',
  );
  const isFetchFail =
    msg.includes('Failed to fetch') || msg.includes('Network Error');
  if (isChunkFail || isFetchFail || !navigator.onLine) return 'network';
  return 'general';
}

export const RouterErrorBoundary = () => {
  const error = useRouteError();
  const navigate = useNavigate();
  const location = useLocation();

  console.error('Router error caught:', error);

  const errorType = classifyRouteError(error);

  const handleRetry = () => {
    if (errorType === 'network' || !navigator.onLine) {
      window.location.reload();
    } else {
      navigate(location.pathname, { replace: true });
    }
  };

  return <ErrorScreen errorType={errorType} onRetry={handleRetry} />;
};
