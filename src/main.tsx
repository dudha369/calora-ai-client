import './i18n';
import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import { router } from "./router";
import { QueryClient, QueryClientProvider } from "react-query";
import { TelegramRootProvider } from "./providers/TelegramRootProvider";
import "./index.css";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

createRoot(document.getElementById("root")!).render(
  <QueryClientProvider client={queryClient}>
    <TelegramRootProvider>
      <RouterProvider router={router} />
    </TelegramRootProvider>
  </QueryClientProvider>
);
