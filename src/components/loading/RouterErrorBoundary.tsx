import { useRouteError, useNavigate, useLocation } from "react-router-dom";
import { ErrorScreen } from "./ErrorScreen";
import { useTelegram } from "../../hooks/useTelegram";
import ThemeContext from "../../context/ThemeContext";

export const RouterErrorBoundary = () => {
  const error = useRouteError() as Error;
  const navigate = useNavigate();
  const location = useLocation();
  const { theme } = useTelegram();

  console.error("Router error caught:", error);

  const handleRetry = () => {
    const isChunkLoadFailed = error?.message?.includes("Failed to fetch dynamically imported module");

    if (isChunkLoadFailed) {
      window.location.reload();
    } else {
      navigate(location.pathname, { replace: true });
    }
  };

  return (
    <ThemeContext.Provider value={theme}>
      <ErrorScreen onRetry={handleRetry} />
    </ThemeContext.Provider>
  );
};
