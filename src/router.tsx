import { createBrowserRouter } from "react-router-dom";
import { App } from "./App";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      {
        index: true,
        lazy: () => import("./pages/HomePage").then(m => ({ Component: m.HomePage }))
      },
      {
        path: "onboarding",
        lazy: () => import("./pages/OnboardingPage").then(m => ({ Component: m.OnboardingPage }))
      },
      {
        path: "analytics",
        lazy: () => import("./pages/AnalyticsPage").then(m => ({ Component: m.AnalyticsPage }))
      },
      {
        path: "scanner",
        lazy: () => import("./pages/ScannerPage").then(m => ({ Component: m.ScannerPage }))
      },
      {
        path: "ai",
        lazy: () => import("./pages/AIPage").then(m => ({ Component: m.AIPage }))
      },
      {
        path: "profile",
        lazy: () => import("./pages/ProfilePage").then(m => ({ Component: m.ProfilePage }))
      },
    ],
  },
]);
