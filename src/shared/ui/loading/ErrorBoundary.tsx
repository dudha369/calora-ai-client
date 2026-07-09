import { Component, type ReactNode, type ErrorInfo } from 'react';
import { ErrorScreen } from './ErrorScreen';
import type { ErrorType } from './ErrorScreen';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

function classifyError(error: Error | null): ErrorType {
  const msg = error?.message || '';
  if (
    !navigator.onLine ||
    msg.includes('Failed to fetch') ||
    msg.includes('Network Error') ||
    msg.includes('dynamically imported module')
  ) {
    return 'network';
  }
  return 'general';
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error in component tree:', error, errorInfo);
  }

  private handleRetry = () => {
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <ErrorScreen
          errorType={classifyError(this.state.error)}
          onRetry={this.handleRetry}
        />
      );
    }

    return this.props.children;
  }
}
