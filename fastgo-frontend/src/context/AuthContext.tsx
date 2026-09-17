import React, { createContext, useContext, useEffect, useState } from 'react';
import { authService } from '../services/authService';
import { AuthUser, LoginRequest, LoginResponse, RegisterRequest, Role } from '../types';

interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  role: Role | null;
  activeRole: Role | null;
  availableRoles: Role[];
  login: (credentials: LoginRequest) => Promise<{ user: AuthUser; loginResponse: LoginResponse }>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  cambiarRol: (nuevoRol: Role) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(authService.getToken());
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [availableRoles, setAvailableRoles] = useState<Role[]>([]);

  const fetchCurrentUser = async () => {
    try {
      if (authService.getToken()) {
        const userData = await authService.getMe();
        setUser(userData);
        if (userData.availableRoles && userData.availableRoles.length > 0) {
          setAvailableRoles(userData.availableRoles);
        } else if (userData.rol) {
          setAvailableRoles([userData.rol]);
        }
      } else {
        setUser(null);
        setAvailableRoles([]);
      }
    } catch {
      authService.logout();
      setUser(null);
      setToken(null);
      setAvailableRoles([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCurrentUser();

    const handleUnauthorized = () => {
      setUser(null);
      setToken(null);
      setAvailableRoles([]);
    };

    window.addEventListener('fastgo:auth:unauthorized', handleUnauthorized);
    return () => {
      window.removeEventListener('fastgo:auth:unauthorized', handleUnauthorized);
    };
  }, []);

  const login = async (credentials: LoginRequest): Promise<{ user: AuthUser; loginResponse: LoginResponse }> => {
    setIsLoading(true);
    try {
      const loginResponse = await authService.login(credentials);
      setToken(loginResponse.token);
      if (loginResponse.availableRoles && loginResponse.availableRoles.length > 0) {
        setAvailableRoles(loginResponse.availableRoles);
      }
      const userData = await authService.getMe();
      setUser(userData);
      return { user: userData, loginResponse };
    } finally {
      setIsLoading(false);
    }
  };

  const cambiarRol = async (nuevoRol: Role) => {
    setIsLoading(true);
    try {
      const response = await authService.cambiarRol(nuevoRol);
      setToken(response.token);
      if (response.availableRoles) {
        setAvailableRoles(response.availableRoles);
      }
      const userData = await authService.getMe();
      setUser(userData);
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: RegisterRequest) => {
    setIsLoading(true);
    try {
      await authService.register(data);
      // Auto login tras registro exitoso con el rol registrado
      await login({ correo: data.correo, password: data.password, rol: data.rol });
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
    setToken(null);
    setAvailableRoles([]);
  };

  const refreshUser = async () => {
    await fetchCurrentUser();
  };

  const effectiveRole = (user?.activeRole || user?.rol || null) as Role | null;

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token && !!user,
        isLoading,
        role: effectiveRole,
        activeRole: effectiveRole,
        availableRoles,
        login,
        register,
        logout,
        refreshUser,
        cambiarRol,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
