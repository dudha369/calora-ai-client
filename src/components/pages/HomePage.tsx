import { useOutletContext } from "react-router-dom";

type OutletContext = {
  username: string;
};


export const HomePage = () => {
  const { username } = useOutletContext<OutletContext>();

  return (
    <div>
      <h1>
        Привет, {username}!
      </h1>
    </div>
  )
}