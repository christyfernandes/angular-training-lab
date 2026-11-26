/** Shapes returned by https://dummyjson.com/docs/auth */
export type UserRole = 'admin' | 'moderator' | 'user';

export interface User {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  image: string;
  role?: UserRole;
  phone?: string;
  company?: { name: string; title: string; department: string };
  address?: { city: string; state: string; country: string };
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface LoginResponse extends Pick<User, 'id' | 'username' | 'email' | 'firstName' | 'lastName' | 'image'> {
  accessToken: string;
  refreshToken: string;
}
