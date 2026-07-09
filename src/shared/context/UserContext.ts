import { createContext, useContext } from 'react';
import { type UserData } from '../types/UserData';

interface UserContextType {
  user_data: UserData | undefined;
  isLoading: boolean;
}

export const UserContext = createContext<UserContextType>({
  user_data: undefined,
  isLoading: true,
});

export const useUser = () => useContext(UserContext);

