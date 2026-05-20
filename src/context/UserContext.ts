import { createContext, useContext } from "react";
import { type IUser } from "../interfaces/IUser";

interface UserContextType {
  user: IUser | undefined;
  isLoading: boolean;
}

const UserContext = createContext<UserContextType>({
  user: undefined,
  isLoading: true,
});

export const useUser = () => useContext(UserContext);
export default UserContext;
