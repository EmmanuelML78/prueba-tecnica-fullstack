import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { Layout } from '@/components/layout';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import {
  Download,
  Wallet,
  TrendingUp,
  TrendingDown,
  Activity,
  FileSpreadsheet,
} from 'lucide-react';

/**
 * Página de Reportes - Dark Mode Elegante
 *
 * Usa useAuth() para verificar que sea admin.
 */

type MonthlyData = {
  month: string;
  income: number;
  expense: number;
};

type ReportData = {
  balance: number;
  totalIncome: number;
  totalExpense: number;
  movementsCount: number;
  monthlyData: MonthlyData[];
};

const ReportsPage = () => {
  const router = useRouter();
  const { isAdmin } = useAuth();
  const [report, setReport] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    // Redirigir si no es admin
    if (!isAdmin) {
      router.push('/');
      return;
    }

    const fetchReport = async () => {
      try {
        const res = await fetch('/api/reports');
        if (res.ok) {
          const data = await res.json();
          setReport(data);
        }
      } catch (err) {
        console.error('Error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchReport();
  }, [isAdmin, router]);

  const handleDownloadCSV = async () => {
    setDownloading(true);
    try {
      const res = await fetch('/api/reports/csv');
      if (!res.ok) throw new Error('Error al descargar');

      const blob = await res.blob();
      const defaultFilename = `reporte-movimientos-${new Date().toISOString().slice(0, 10)}.csv`;

      // File System Access API (Chrome/Edge) - permite elegir dónde guardar
      const showSaveFilePicker = window.showSaveFilePicker;
      if (showSaveFilePicker) {
        try {
          const handle = await showSaveFilePicker({
            suggestedName: defaultFilename,
            types: [
              {
                description: 'Archivo CSV',
                accept: { 'text/csv': ['.csv'] },
              },
            ],
          });

          const writable = await handle.createWritable();
          await writable.write(blob);
          await writable.close();
          return;
        } catch (err) {
          if (err instanceof Error && err.name === 'AbortError') {
            return;
          }
          console.warn('File System Access API failed, using fallback:', err);
        }
      }

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = defaultFilename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error('Error downloading CSV:', err);
      alert('Error al descargar el CSV');
    } finally {
      setDownloading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatMonth = (monthStr: string) => {
    const [year, month] = monthStr.split('-');
    const months = [
      'Ene',
      'Feb',
      'Mar',
      'Abr',
      'May',
      'Jun',
      'Jul',
      'Ago',
      'Sep',
      'Oct',
      'Nov',
      'Dic',
    ];
    return `${months[parseInt(month) - 1]} ${year.slice(2)}`;
  };

  // No renderizar si no es admin
  if (!isAdmin) {
    return null;
  }

  const chartData =
    report?.monthlyData.map((d) => ({
      name: formatMonth(d.month),
      Ingresos: d.income,
      Egresos: d.expense,
    })) || [];

  return (
    <Layout title='Reportes'>
      {/* Header */}
      <div className='flex items-center justify-between mb-6'>
        <div>
          <h2 className='text-xl font-semibold text-white'>
            Reportes Financieros
          </h2>
          <p className='text-zinc-500 text-sm'>
            Visualiza estadísticas y exporta datos
          </p>
        </div>
        <Button
          onClick={handleDownloadCSV}
          disabled={downloading}
          className='bg-emerald-500 hover:bg-emerald-600 text-black font-medium'
        >
          <Download className='w-4 h-4 mr-2' />
          {downloading ? 'Descargando...' : 'Exportar CSV'}
        </Button>
      </div>

      {loading ? (
        <div className='flex items-center justify-center h-64'>
          <div className='w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin' />
        </div>
      ) : (
        <>
          {/* Stats Grid */}
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6'>
            {/* Balance */}
            <div className='bg-[hsl(0,0%,10%)] border border-[hsl(0,0%,18%)] rounded-xl p-5'>
              <div className='flex items-center justify-between mb-3'>
                <div className='w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center'>
                  <Wallet className='w-5 h-5 text-emerald-400' />
                </div>
              </div>
              <p className='text-zinc-500 text-sm mb-1'>Balance Total</p>
              <p
                className={`text-2xl font-bold ${
                  (report?.balance || 0) >= 0
                    ? 'text-emerald-400'
                    : 'text-red-400'
                }`}
              >
                {formatCurrency(report?.balance || 0)}
              </p>
            </div>

            {/* Ingresos */}
            <div className='bg-[hsl(0,0%,10%)] border border-[hsl(0,0%,18%)] rounded-xl p-5'>
              <div className='flex items-center justify-between mb-3'>
                <div className='w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center'>
                  <TrendingUp className='w-5 h-5 text-emerald-400' />
                </div>
              </div>
              <p className='text-zinc-500 text-sm mb-1'>Total Ingresos</p>
              <p className='text-2xl font-bold text-white'>
                {formatCurrency(report?.totalIncome || 0)}
              </p>
            </div>

            {/* Egresos */}
            <div className='bg-[hsl(0,0%,10%)] border border-[hsl(0,0%,18%)] rounded-xl p-5'>
              <div className='flex items-center justify-between mb-3'>
                <div className='w-10 h-10 rounded-lg bg-red-500/10 flex items-center justify-center'>
                  <TrendingDown className='w-5 h-5 text-red-400' />
                </div>
              </div>
              <p className='text-zinc-500 text-sm mb-1'>Total Egresos</p>
              <p className='text-2xl font-bold text-white'>
                {formatCurrency(report?.totalExpense || 0)}
              </p>
            </div>

            {/* Movimientos */}
            <div className='bg-[hsl(0,0%,10%)] border border-[hsl(0,0%,18%)] rounded-xl p-5'>
              <div className='flex items-center justify-between mb-3'>
                <div className='w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center'>
                  <Activity className='w-5 h-5 text-blue-400' />
                </div>
              </div>
              <p className='text-zinc-500 text-sm mb-1'>Movimientos</p>
              <p className='text-2xl font-bold text-white'>
                {report?.movementsCount || 0}
              </p>
            </div>
          </div>

          {/* Chart */}
          <div className='bg-[hsl(0,0%,10%)] border border-[hsl(0,0%,18%)] rounded-xl p-6'>
            <div className='flex items-center justify-between mb-6'>
              <h3 className='text-lg font-semibold text-white'>
                Movimientos por Mes
              </h3>
              <div className='flex items-center gap-4 text-sm'>
                <div className='flex items-center gap-2'>
                  <div className='w-3 h-3 rounded-full bg-emerald-400' />
                  <span className='text-zinc-400'>Ingresos</span>
                </div>
                <div className='flex items-center gap-2'>
                  <div className='w-3 h-3 rounded-full bg-red-400' />
                  <span className='text-zinc-400'>Egresos</span>
                </div>
              </div>
            </div>

            {chartData.length === 0 ? (
              <div className='h-80 flex flex-col items-center justify-center text-zinc-500'>
                <FileSpreadsheet className='w-12 h-12 mb-4 opacity-20' />
                <p>No hay datos para mostrar</p>
                <p className='text-sm mt-1'>
                  Crea movimientos para ver el gráfico
                </p>
              </div>
            ) : (
              <div className='h-80'>
                <ResponsiveContainer width='100%' height='100%'>
                  <BarChart data={chartData} barGap={8}>
                    <CartesianGrid
                      strokeDasharray='3 3'
                      stroke='hsl(0,0%,18%)'
                      vertical={false}
                    />
                    <XAxis
                      dataKey='name'
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: 'hsl(0,0%,50%)', fontSize: 12 }}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: 'hsl(0,0%,50%)', fontSize: 12 }}
                      tickFormatter={(value) =>
                        new Intl.NumberFormat('es-CO', {
                          notation: 'compact',
                          compactDisplay: 'short',
                        }).format(value)
                      }
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(0,0%,10%)',
                        border: '1px solid hsl(0,0%,18%)',
                        borderRadius: '8px',
                      }}
                      labelStyle={{ color: 'white' }}
                      formatter={(value) => [
                        formatCurrency(Number(value) || 0),
                        '',
                      ]}
                    />
                    <Bar
                      dataKey='Ingresos'
                      fill='#22c55e'
                      radius={[4, 4, 0, 0]}
                    />
                    <Bar
                      dataKey='Egresos'
                      fill='#ef4444'
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </>
      )}
    </Layout>
  );
};

export default ReportsPage;
