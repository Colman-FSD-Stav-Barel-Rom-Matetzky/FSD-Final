import { useState, useEffect, type ReactNode, type FC } from 'react';
import {
  register as registerService,
  login as loginService,
  refresh as refreshService,
  logout as logoutService,
} from '../services/auth.service';
import type {
  AuthCredentials,
  RegisterCredentials,
  AuthResponse,
} from '../types/auth.types';
import type { AxiosResponse } from 'axios';
import type { User } from '../types/user.types';
import {
  getRefreshToken,
  setTokens,
  setUser as setStorageUser,
  clearAuth,
} from '../utils/storage.utils';
import { AuthContext } from '../context/auth.context';

const handleOAuthCallback = () => {
  const urlParams = new URLSearchParams(window.location.search);
  const accessToken = urlParams.get('accessToken');
  const refreshToken = urlParams.get('refreshToken');

  if (accessToken && refreshToken) {
    setTokens(accessToken, refreshToken);
    window.history.replaceState({}, document.title, window.location.pathname);
  }
};

let isInitializing = false;

type AuthProviderProps = {
  children: ReactNode;
};

export const AuthProvider: FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const initAuth = async () => {
      if (isInitializing) return;

      isInitializing = true;

      handleOAuthCallback();
      const refreshToken = getRefreshToken();

      if (!refreshToken) {
        setIsLoading(false);

        return;
      }

      try {
        const response = await refreshService(refreshToken).request;
        const {
          user: fetchedUser,
          accessToken: newAccessToken,
          refreshToken: newRefreshToken,
        } = response.data.data;

        if (fetchedUser) {
          setTokens(newAccessToken, newRefreshToken);
          setStorageUser(fetchedUser);
          setUser(fetchedUser);
        }
      } catch {
        clearAuth();
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  const handleAuthResponse = (response: AxiosResponse<AuthResponse>) => {
    const { accessToken, refreshToken, user: newUser } = response.data.data;
    setTokens(accessToken, refreshToken);
    setStorageUser(newUser);
    setUser(newUser);
  };

  const register = async (credentials: RegisterCredentials) => {
    const response = await registerService(credentials).request;
    handleAuthResponse(response);
  };

  const login = async (credentials: AuthCredentials) => {
    const response = await loginService(credentials).request;
    handleAuthResponse(response);
  };

  const logout = async () => {
    const refreshToken = getRefreshToken();

    if (refreshToken) {
      try {
        await logoutService(refreshToken).request;
      } catch (error) {
        console.error('Logout failed:', error);
      }
    }

    clearAuth();
    setUser(null);
    window.location.href = '/login';
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, register, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
