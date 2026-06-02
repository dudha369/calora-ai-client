import { useUser } from "../context/UserContext";
import { useTheme } from "../context/ThemeContext";

export const HomePage = () => {
  const { user } = useUser();
  const theme = useTheme();

  const firstName = user?.name ?? "аноним";
  
  return (
    <>
      <section className="flex h-full flex-col items-center justify-center">
        <h1 className="text-2xl font-bold" style={{ color: theme.text_color }}>
          Привет, {firstName}!👋
        </h1>
      </section>
    </>
  );
};
