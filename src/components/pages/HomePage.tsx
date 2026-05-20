import { useUser } from "../../context/UserContext.ts";

export const HomePage = () => {
  const { user } = useUser();

  return (
    <h1>Привет, {user?.name}!</h1>
  );
};