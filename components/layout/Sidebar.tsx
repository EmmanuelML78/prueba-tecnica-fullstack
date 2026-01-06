import Link from 'next/link';
import { useRouter } from 'next/router';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  ArrowDownUp,
  Users,
  BarChart3,
  LogOut,
} from 'lucide-react';
import type { Role } from '@prisma/client';

/**
 * Sidebar de navegación - Dark Mode Elegante
 */

type User = {
  name: string;
  email: string;
  image: string | null;
  role: Role;
};

type SidebarProps = {
  user: User;
  onLogout: () => void;
};

type NavItem = {
  href: string;
  label: string;
  icon: React.ReactNode;
  adminOnly?: boolean;
};

const navItems: NavItem[] = [
  {
    href: '/',
    label: 'Dashboard',
    icon: <LayoutDashboard className='w-5 h-5' />,
  },
  {
    href: '/movements',
    label: 'Movimientos',
    icon: <ArrowDownUp className='w-5 h-5' />,
  },
  {
    href: '/users',
    label: 'Usuarios',
    icon: <Users className='w-5 h-5' />,
    adminOnly: true,
  },
  {
    href: '/reports',
    label: 'Reportes',
    icon: <BarChart3 className='w-5 h-5' />,
    adminOnly: true,
  },
];

export const Sidebar = ({ user, onLogout }: SidebarProps) => {
  const router = useRouter();
  const isAdmin = user.role === 'ADMIN';

  const visibleItems = navItems.filter((item) => !item.adminOnly || isAdmin);

  return (
    <aside className='w-64 min-h-screen bg-[hsl(0,0%,6%)] border-r border-[hsl(0,0%,15%)] flex flex-col'>
      {/* Logo */}
      <div className='p-6 border-b border-[hsl(0,0%,15%)]'>
        <Link href='/' className='flex items-center gap-3'>
          <div className='w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center'>
            <span className='text-black font-bold text-lg'>₿</span>
          </div>
          <div>
            <h1 className='font-semibold text-white'>FinanceApp</h1>
            <p className='text-xs text-zinc-500'>Gestión financiera</p>
          </div>
        </Link>
      </div>

      {/* Navegación */}
      <nav className='flex-1 p-4 space-y-1'>
        <p className='text-xs font-medium text-zinc-500 uppercase tracking-wider px-3 mb-3'>
          Menú
        </p>
        {visibleItems.map((item) => {
          const isActive = router.pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all',
                isActive
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                  : 'text-zinc-400 hover:text-white hover:bg-white/5'
              )}
            >
              {item.icon}
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* User + Logout */}
      <div className='p-4 border-t border-[hsl(0,0%,15%)] space-y-3'>
        {/* User info */}
        <div className='flex items-center gap-3 px-3 py-2'>
          {user.image ? (
            <img
              src={user.image}
              alt={user.name}
              className='w-9 h-9 rounded-lg object-cover ring-2 ring-[hsl(0,0%,18%)]'
            />
          ) : (
            <div className='w-9 h-9 rounded-lg bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center'>
              <span className='text-black font-semibold text-sm'>
                {user.name.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
          <div className='flex-1 min-w-0'>
            <p className='text-sm font-medium text-white truncate'>
              {user.name}
            </p>
            <p className='text-xs text-zinc-500'>{user.role}</p>
          </div>
        </div>

        {/* Logout */}
        <button
          onClick={onLogout}
          className='flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-zinc-400 hover:text-red-400 hover:bg-red-500/10 w-full transition-all'
        >
          <LogOut className='w-5 h-5' />
          Cerrar sesión
        </button>
      </div>
    </aside>
  );
};
