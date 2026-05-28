import { createBrowserRouter } from "react-router-dom";
import { App } from "./App";
import { HomePage } from "./pages/HomePage.tsx";
import { AnalyticsPage } from "./pages/AnalyticsPage";
import { ScannerPage } from "./pages/ScannerPage.tsx";
import { AIPage } from "./pages/AIPage";
import { ProfilePage } from "./pages/ProfilePage";


export const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      {
        index: true,
        element: <HomePage />
      },
      {
        path: "analytics",
        element: <AnalyticsPage />,
      },
      {
        path: "scanner",
        element: <ScannerPage />
      },
      {
        path: "ai",
        element: <AIPage />,
      },
      {
        path: "profile",
        element: <ProfilePage/>,
      },
    ],
  },
]);