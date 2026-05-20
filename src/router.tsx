import { createBrowserRouter } from "react-router-dom";
import { App } from "./App";
import { HomePage } from "./components/pages/HomePage.tsx";
import { AnalyticsPage } from "./components/pages/AnalyticsPage";
import { AIPage } from "./components/pages/AIPage";
import { ProfilePage } from "./components/pages/ProfilePage";


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