import { Component, type ReactNode, type ErrorInfo } from "react";
import { ErrorScreen } from "./ErrorScreen";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
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
    console.error("Uncaught error in component tree:", error, errorInfo);
  }

  private handleRetry = () => {
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      const errorMsg = this.state.error?.message || "";

      const isNetworkError =
        !navigator.onLine ||
        errorMsg.includes("Failed to fetch") ||
        errorMsg.includes("Network Error") ||
        errorMsg.includes("dynamically imported module");

      return <ErrorScreen onRetry={this.handleRetry} isNetworkError={isNetworkError} />;
    }

    return this.props.children;
  }
}
