import {useEffect} from "react";
import {WebApp} from "./api/telegram.ts";
import {NavigationBar} from "./components/NavigationBar/NavigationBar.tsx";
import {Outlet} from "react-router-dom";

function App() {
  useEffect(() => {
    WebApp?.ready();
    WebApp?.expand();
  }, []);

  const user = WebApp?.initData.user;
  const theme = WebApp?.themeParams;

  const bgColor = theme?.bg_color || 'black';
  const textColor = theme?.text_color || 'white';

  const username = user?.username || 'unknown';

  return (
    <div style={{minHeight: '100vh', display: 'flex', flexDirection: 'column'}}>
      <main
        style={{
          backgroundColor: bgColor,
          color: textColor,
          flex: 1,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
      }}>
        <Outlet context={{ username }} />
      </main>

      <NavigationBar iconColor={textColor}/>
    </div>
  )
}

export default App
