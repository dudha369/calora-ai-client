export interface IUser {
    id: number;
    created_at: Date;
    name: string;
}

export interface UserResponse {
  user: IUser;
}