import { createBrowserRouter } from "react-router-dom";
import App from "./App";
import { HomePage } from "./components/pages/HomePage.tsx";
import { HistoryPage } from "./components/pages/HistoryPage";
import { SettingsPage } from "./components/pages/SettingsPage";
import { ProfilePage } from "./components/pages/ProfilePage";


export const router = createBrowserRouter([
  {
    path: "/calora-ai-client/",
    element: <App />,
    children: [
      {
        index: true,
        element: <HomePage />
      },
      {
        path: "history",
        element: <HistoryPage />,
      },
      {
        path: "settings",
        element: <SettingsPage />,
      },
      {
        path: "profile",
        element: <ProfilePage/>,
      },
    ],
  },
]);