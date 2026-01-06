import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from 'react';
import { useRouter } from 'next/router';
import { authClient } from '@/lib/auth/client';
import type { Role } from '@prisma/client';

/**
 * Context de Autenticación
 *
 * Maneja el estado del usuario de forma global.
 * - Se carga UNA SOLA VEZ al iniciar la app
 * - Todas las páginas acceden al usuario instantáneamente
 * - No más loaders en cada cambio de página
 */

type User = {
  id: string;
  name: string;
  email: string;
  image: string | null;
  role: Role;
};

type AuthContextType = {
  user: User | null;
  loading: boolean;
  isAdmin: boolean;
  logout: () => Promise<void>;
  refetchUser: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Páginas que no requieren autenticación
const PUBLIC_ROUTES = ['/login'];

type AuthProviderProps = {
  children: ReactNode;
};

export function AuthProvider({ children }: AuthProviderProps) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = useCallback(async () => {
    try {
      const res = await fetch('/api/me');

      if (res.ok) {
        const userData = await res.json();
        setUser(userData);
        return userData;
      } else {
        setUser(null);
        return null;
      }
    } catch (error) {
      console.error('Error fetching user:', error);
      setUser(null);
      return null;
    }
  }, []);

  const logout = useCallback(async () => {
    await authClient.signOut();
    setUser(null);
    router.push('/login');
  }, [router]);

  const refetchUser = useCallback(async () => {
    await fetchUser();
  }, [fetchUser]);

  // Cargar usuario al iniciar
  useEffect(() => {
    const init = async () => {
      const isPublicRoute = PUBLIC_ROUTES.includes(router.pathname);

      if (isPublicRoute) {
        // En rutas públicas, no necesitamos cargar el usuario
        setLoading(false);
        return;
      }

      const userData = await fetchUser();

      if (!userData && !isPublicRoute) {
        // No hay usuario y no es ruta pública → redirigir al login
        router.push('/login');
      }

      setLoading(false);
    };

    init();
  }, [fetchUser, router.pathname]);

  // Verificar autenticación cuando cambia la ruta
  useEffect(() => {
    const handleRouteChange = (url: string) => {
      const isPublicRoute = PUBLIC_ROUTES.some((route) =>
        url.startsWith(route)
      );

      if (!user && !isPublicRoute && !loading) {
        router.push('/login');
      }
    };

    router.events.on('routeChangeComplete', handleRouteChange);

    return () => {
      router.events.off('routeChangeComplete', handleRouteChange);
    };
  }, [user, loading, router]);

  const value: AuthContextType = {
    user,
    loading,
    isAdmin: user?.role === 'ADMIN',
    logout,
    refetchUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * Hook para acceder al contexto de autenticación
 *
 * Uso:
 *   const { user, isAdmin, logout } = useAuth();
 */
export function useAuth() {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error('useAuth debe usarse dentro de un AuthProvider');
  }

  return context;
}
