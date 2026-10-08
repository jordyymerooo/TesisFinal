import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  getCurrentUser,
  setCurrentUser,
  onUserRoleChange,
  getCurrentUserRole,
  getCurrentUserIdRol,
  chatService,
  getAuthToken,
} from '../../services/api';

interface AuthContextType {
  user: any;
  role: string | null;
  idRol: number | null;
  isAuthenticated: boolean;
  unreadCount: number;
  fetchUnreadCount: () => Promise<number>;
  setUnreadCount: React.Dispatch<React.SetStateAction<number>>;
  setUser: (user: any) => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  role: null,
  idRol: null,
  isAuthenticated: false,
  unreadCount: 0,
  fetchUnreadCount: async () => 0,
  setUnreadCount: () => {},
  setUser: () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<any>(getCurrentUser());
  const [role, setRole] = useState<string | null>(getCurrentUserRole());
  const [idRol, setIdRol] = useState<number | null>(getCurrentUserIdRol());
  const [unreadCount, setUnreadCount] = useState<number>(0);

  const fetchUnreadCount = useCallback(async (): Promise<number> => {
    if (!getAuthToken()) {
      setUnreadCount(0);
      return 0;
    }
    try {
      const count = await chatService.getUnreadCount();
      setUnreadCount(count);
      return count;
    } catch {
      return 0;
    }
  }, []);

  const handleSetUser = (newUser: any) => {
    setCurrentUser(newUser);
    setUser(newUser);
    if (newUser) {
      fetchUnreadCount();
    } else {
      setUnreadCount(0);
    }
  };

  useEffect(() => {
    setUser(getCurrentUser());
    setRole(getCurrentUserRole());
    setIdRol(getCurrentUserIdRol());
    if (getCurrentUser()) {
      fetchUnreadCount();
    }

    const unsubscribe = onUserRoleChange((newRole, newIdRol, newUser) => {
      setUser(newUser);
      setRole(newRole);
      setIdRol(newIdRol);
      if (newUser) {
        fetchUnreadCount();
      } else {
        setUnreadCount(0);
      }
    });

    // Polling ligero para actualizar el badge de mensajes periódicamente
    const interval = setInterval(() => {
      if (getAuthToken()) {
        fetchUnreadCount();
      }
    }, 20000);

    return () => {
      unsubscribe();
      clearInterval(interval);
    };
  }, [fetchUnreadCount]);

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        idRol,
        isAuthenticated: !!user,
        unreadCount,
        fetchUnreadCount,
        setUnreadCount,
        setUser: handleSetUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  // Si se invoca sin AuthProvider, fallback reactivo a getCurrentUser()
  const directUser = getCurrentUser();
  if (!context || (!context.user && directUser)) {
    return {
      user: directUser,
      role: getCurrentUserRole(),
      idRol: getCurrentUserIdRol(),
      isAuthenticated: !!directUser,
      unreadCount: 0,
      fetchUnreadCount: async () => 0,
      setUnreadCount: () => {},
      setUser: (newUser: any) => {
        setCurrentUser(newUser);
      },
    };
  }
  return context;
};

export default useAuth;
