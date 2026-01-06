import { Sidebar } from './Sidebar';
import { useAuth } from '@/contexts/AuthContext';

/**
 * Layout principal - Dark Mode Elegante
 *
 * Usa el AuthContext para obtener el usuario.
 * NO hace fetch, el usuario ya está cargado globalmente.
 */

type LayoutProps = {
  children: React.ReactNode;
  title?: string;
};

export const Layout = ({ children, title }: LayoutProps) => {
  const { user, loading, logout } = useAuth();

  // Loader global (solo se muestra la primera vez)
  if (loading) {
    return (
      <div className='min-h-screen flex items-center justify-center bg-[hsl(0,0%,7%)]'>
        <div className='flex flex-col items-center gap-4'>
          <div className='w-10 h-10 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin' />
          <p className='text-zinc-500 text-sm'>Cargando...</p>
        </div>
      </div>
    );
  }

  // Si no hay usuario, el AuthProvider ya redirige al login
  if (!user) {
    return null;
  }

  return (
    <div className='min-h-screen flex bg-[hsl(0,0%,7%)]'>
      {/* Sidebar con usuario */}
      <Sidebar user={user} onLogout={logout} />

      {/* Main content */}
      <div className='flex-1 flex flex-col'>
        {/* Header - Solo título */}
        <header className='h-16 border-b border-[hsl(0,0%,15%)] px-6 flex items-center bg-[hsl(0,0%,6%)]'>
          <h1 className='text-lg font-semibold text-white'>
            {title || 'Dashboard'}
          </h1>
        </header>

        {/* Page content */}
        <main className='flex-1 p-6 overflow-auto'>{children}</main>
      </div>
    </div>
  );
};
