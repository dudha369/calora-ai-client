import { createContext, useContext } from "react";
import { type User } from "../interfaces/User";

interface UserContextType {
  user: User | undefined;
  isLoading: boolean;
}

const UserContext = createContext<UserContextType>({
  user: undefined,
  isLoading: true,
});

export const useUser = () => useContext(UserContext);
export default UserContext;
