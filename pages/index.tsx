import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { Layout } from '@/components/layout';
import { useAuth } from '@/contexts/AuthContext';
import {
  ArrowDownUp,
  Users,
  BarChart3,
  TrendingUp,
  TrendingDown,
  Wallet,
  ArrowRight,
} from 'lucide-react';

/**
 * Dashboard - Dark Mode Elegante
 *
 * Usa useAuth() para obtener el usuario instantáneamente.
 */

type ReportData = {
  balance: number;
  totalIncome: number;
  totalExpense: number;
  movementsCount: number;
};

const Home = () => {
  const router = useRouter();
  const { user, isAdmin } = useAuth();
  const [report, setReport] = useState<ReportData | null>(null);

  useEffect(() => {
    // Solo cargar reporte si es admin
    if (isAdmin) {
      fetch('/api/reports')
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => setReport(data))
        .catch(console.error);
    }
  }, [isAdmin]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const navCards = [
    {
      href: '/movements',
      title: 'Movimientos',
      description: 'Gestiona ingresos y egresos',
      icon: <ArrowDownUp className='w-6 h-6' />,
      color: 'from-blue-500 to-blue-600',
      show: true,
    },
    {
      href: '/users',
      title: 'Usuarios',
      description: 'Administra usuarios del sistema',
      icon: <Users className='w-6 h-6' />,
      color: 'from-purple-500 to-purple-600',
      show: isAdmin,
    },
    {
      href: '/reports',
      title: 'Reportes',
      description: 'Visualiza estadísticas',
      icon: <BarChart3 className='w-6 h-6' />,
      color: 'from-amber-500 to-amber-600',
      show: isAdmin,
    },
  ];

  return (
    <Layout title='Dashboard'>
      {/* Stats Cards - Solo para Admin */}
      {isAdmin && report && (
        <div className='grid grid-cols-1 md:grid-cols-3 gap-4 mb-8'>
          {/* Balance */}
          <div className='bg-[hsl(0,0%,10%)] border border-[hsl(0,0%,18%)] rounded-xl p-5'>
            <div className='flex items-center justify-between mb-4'>
              <div className='w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center'>
                <Wallet className='w-5 h-5 text-emerald-400' />
              </div>
              <span
                className={`text-xs font-medium px-2 py-1 rounded-full ${
                  report.balance >= 0
                    ? 'bg-emerald-500/10 text-emerald-400'
                    : 'bg-red-500/10 text-red-400'
                }`}
              >
                {report.balance >= 0 ? '+' : ''}
                {((report.balance / (report.totalIncome || 1)) * 100).toFixed(
                  1
                )}
                %
              </span>
            </div>
            <p className='text-zinc-500 text-sm mb-1'>Balance Total</p>
            <p
              className={`text-2xl font-bold ${
                report.balance >= 0 ? 'text-emerald-400' : 'text-red-400'
              }`}
            >
              {formatCurrency(report.balance)}
            </p>
          </div>

          {/* Ingresos */}
          <div className='bg-[hsl(0,0%,10%)] border border-[hsl(0,0%,18%)] rounded-xl p-5'>
            <div className='flex items-center justify-between mb-4'>
              <div className='w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center'>
                <TrendingUp className='w-5 h-5 text-emerald-400' />
              </div>
            </div>
            <p className='text-zinc-500 text-sm mb-1'>Total Ingresos</p>
            <p className='text-2xl font-bold text-white'>
              {formatCurrency(report.totalIncome)}
            </p>
          </div>

          {/* Egresos */}
          <div className='bg-[hsl(0,0%,10%)] border border-[hsl(0,0%,18%)] rounded-xl p-5'>
            <div className='flex items-center justify-between mb-4'>
              <div className='w-10 h-10 rounded-lg bg-red-500/10 flex items-center justify-center'>
                <TrendingDown className='w-5 h-5 text-red-400' />
              </div>
            </div>
            <p className='text-zinc-500 text-sm mb-1'>Total Egresos</p>
            <p className='text-2xl font-bold text-white'>
              {formatCurrency(report.totalExpense)}
            </p>
          </div>
        </div>
      )}

      {/* Welcome */}
      <div className='mb-8'>
        <h2 className='text-xl font-semibold text-white mb-2'>
          ¡Bienvenido, {user?.name?.split(' ')[0]}!
        </h2>
        <p className='text-zinc-500'>
          {isAdmin
            ? 'Tienes acceso completo al sistema de gestión financiera.'
            : 'Puedes ver y gestionar los movimientos financieros.'}
        </p>
      </div>

      {/* Navigation Cards */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
        {navCards
          .filter((card) => card.show)
          .map((card) => (
            <button
              key={card.href}
              onClick={() => router.push(card.href)}
              className='group bg-[hsl(0,0%,10%)] border border-[hsl(0,0%,18%)] rounded-xl p-6 text-left hover:border-emerald-500/30 hover:bg-[hsl(0,0%,11%)] transition-all'
            >
              <div
                className={`w-12 h-12 rounded-xl bg-gradient-to-br ${card.color} flex items-center justify-center mb-4 text-white`}
              >
                {card.icon}
              </div>
              <h3 className='text-lg font-semibold text-white mb-1 group-hover:text-emerald-400 transition-colors'>
                {card.title}
              </h3>
              <p className='text-zinc-500 text-sm mb-4'>{card.description}</p>
              <div className='flex items-center text-emerald-400 text-sm font-medium'>
                Ir a {card.title.toLowerCase()}
                <ArrowRight className='w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform' />
              </div>
            </button>
          ))}
      </div>
    </Layout>
  );
};

export default Home;
