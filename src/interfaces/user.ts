export interface IUser {
    id: number;
    username: string;
}

export interface UserProps {
    data: IUser;
    setUser: (user: IUser) => void;
}