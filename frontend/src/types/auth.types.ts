import type { User } from './user.types';

export type AuthCredentials = {
  username: string;
  password: string;
};

export type RegisterCredentials = AuthCredentials & {
  email: string;
};

export type AuthResponse = {
  data: {
    accessToken: string;
    refreshToken: string;
    user: User;
  };
};

export type RefreshResponse = {
  data: {
    accessToken: string;
    refreshToken: string;
    user: User;
  };
};

export type LogoutResponse = {
  data: {
    message: string;
  };
};

export type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  register: (credentials: RegisterCredentials) => Promise<void>;
  login: (credentials: AuthCredentials) => Promise<void>;
  logout: () => Promise<void>;
};
