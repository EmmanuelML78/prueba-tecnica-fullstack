import { useEffect, useState, useCallback } from 'react';
import { Layout } from '@/components/layout';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus, TrendingUp, TrendingDown, Calendar, User } from 'lucide-react';

/**
 * Página de Movimientos - Dark Mode Elegante
 *
 * Usa useAuth() para verificar permisos instantáneamente.
 */

type Movement = {
  id: string;
  concept: string;
  amount: number;
  type: 'INCOME' | 'EXPENSE';
  date: string;
  user: {
    id: string;
    name: string;
  };
};

const MovementsPage = () => {
  const { isAdmin } = useAuth();
  const [movements, setMovements] = useState<Movement[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    concept: '',
    amount: '',
    type: 'INCOME' as 'INCOME' | 'EXPENSE',
    date: new Date().toISOString().slice(0, 10),
  });

  const fetchMovements = useCallback(async () => {
    try {
      const res = await fetch('/api/movements');
      if (res.ok) {
        const data = await res.json();
        setMovements(data.movements);
      }
    } catch (err) {
      console.error('Error fetching movements:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMovements();
  }, [fetchMovements]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSaving(true);

    try {
      const res = await fetch('/api/movements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          concept: formData.concept,
          amount: parseFloat(formData.amount),
          type: formData.type,
          date: formData.date,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Error al crear el movimiento');
      }

      setIsDialogOpen(false);
      setFormData({
        concept: '',
        amount: '',
        type: 'INCOME',
        date: new Date().toISOString().slice(0, 10),
      });
      fetchMovements();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setSaving(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-CO', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const totalBalance = movements.reduce((acc, m) => {
    return m.type === 'INCOME' ? acc + m.amount : acc - m.amount;
  }, 0);

  return (
    <Layout title='Movimientos'>
      {/* Header */}
      <div className='flex items-center justify-between mb-6'>
        <div>
          <h2 className='text-xl font-semibold text-white'>
            Ingresos y Egresos
          </h2>
          <p className='text-zinc-500 text-sm'>
            Gestiona todos los movimientos financieros
          </p>
        </div>
        {isAdmin && (
          <Button
            onClick={() => setIsDialogOpen(true)}
            className='bg-emerald-500 hover:bg-emerald-600 text-black font-medium'
          >
            <Plus className='w-4 h-4 mr-2' />
            Nuevo movimiento
          </Button>
        )}
      </div>

      {/* Table */}
      <div className='bg-[hsl(0,0%,10%)] border border-[hsl(0,0%,18%)] rounded-xl overflow-hidden'>
        {loading ? (
          <div className='flex items-center justify-center h-64'>
            <div className='w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin' />
          </div>
        ) : movements.length === 0 ? (
          <div className='flex flex-col items-center justify-center h-64 text-zinc-500'>
            <TrendingUp className='w-12 h-12 mb-4 opacity-20' />
            <p>No hay movimientos registrados</p>
            {isAdmin && (
              <Button
                variant='link'
                className='text-emerald-400 mt-2'
                onClick={() => setIsDialogOpen(true)}
              >
                Crear el primero
              </Button>
            )}
          </div>
        ) : (
          <>
            {/* Table Header */}
            <div className='grid grid-cols-12 gap-4 px-6 py-3 border-b border-[hsl(0,0%,18%)] bg-[hsl(0,0%,8%)]'>
              <div className='col-span-4 text-xs font-medium text-zinc-500 uppercase tracking-wider'>
                Concepto
              </div>
              <div className='col-span-2 text-xs font-medium text-zinc-500 uppercase tracking-wider'>
                Monto
              </div>
              <div className='col-span-2 text-xs font-medium text-zinc-500 uppercase tracking-wider'>
                Tipo
              </div>
              <div className='col-span-2 text-xs font-medium text-zinc-500 uppercase tracking-wider'>
                Fecha
              </div>
              <div className='col-span-2 text-xs font-medium text-zinc-500 uppercase tracking-wider'>
                Usuario
              </div>
            </div>

            {/* Table Body */}
            <div className='divide-y divide-[hsl(0,0%,15%)]'>
              {movements.map((movement) => (
                <div
                  key={movement.id}
                  className='grid grid-cols-12 gap-4 px-6 py-4 hover:bg-[hsl(0,0%,12%)] transition-colors'
                >
                  <div className='col-span-4 flex items-center gap-3'>
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                        movement.type === 'INCOME'
                          ? 'bg-emerald-500/10'
                          : 'bg-red-500/10'
                      }`}
                    >
                      {movement.type === 'INCOME' ? (
                        <TrendingUp className='w-4 h-4 text-emerald-400' />
                      ) : (
                        <TrendingDown className='w-4 h-4 text-red-400' />
                      )}
                    </div>
                    <span className='text-white font-medium'>
                      {movement.concept}
                    </span>
                  </div>
                  <div className='col-span-2 flex items-center'>
                    <span
                      className={`font-semibold ${
                        movement.type === 'INCOME'
                          ? 'text-emerald-400'
                          : 'text-red-400'
                      }`}
                    >
                      {movement.type === 'INCOME' ? '+' : '-'}
                      {formatCurrency(movement.amount)}
                    </span>
                  </div>
                  <div className='col-span-2 flex items-center'>
                    <span
                      className={`text-xs font-medium px-2 py-1 rounded-full ${
                        movement.type === 'INCOME'
                          ? 'bg-emerald-500/10 text-emerald-400'
                          : 'bg-red-500/10 text-red-400'
                      }`}
                    >
                      {movement.type === 'INCOME' ? 'Ingreso' : 'Egreso'}
                    </span>
                  </div>
                  <div className='col-span-2 flex items-center text-zinc-400 text-sm'>
                    <Calendar className='w-4 h-4 mr-2 opacity-50' />
                    {formatDate(movement.date)}
                  </div>
                  <div className='col-span-2 flex items-center text-zinc-400 text-sm'>
                    <User className='w-4 h-4 mr-2 opacity-50' />
                    {movement.user.name}
                  </div>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className='px-6 py-4 border-t border-[hsl(0,0%,18%)] bg-[hsl(0,0%,8%)] flex justify-between items-center'>
              <span className='text-zinc-500 text-sm'>
                {movements.length} movimiento{movements.length !== 1 ? 's' : ''}
              </span>
              <div className='flex items-center gap-2'>
                <span className='text-zinc-500 text-sm'>Balance:</span>
                <span
                  className={`font-bold text-lg ${
                    totalBalance >= 0 ? 'text-emerald-400' : 'text-red-400'
                  }`}
                >
                  {formatCurrency(totalBalance)}
                </span>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className='bg-[hsl(0,0%,10%)] border-[hsl(0,0%,18%)] text-white'>
          <DialogHeader>
            <DialogTitle>Nuevo Movimiento</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className='space-y-4'>
            {error && (
              <div className='bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-lg text-sm'>
                {error}
              </div>
            )}

            <div className='space-y-2'>
              <Label htmlFor='type' className='text-zinc-300'>
                Tipo
              </Label>
              <Select
                value={formData.type}
                onValueChange={(value: 'INCOME' | 'EXPENSE') =>
                  setFormData({ ...formData, type: value })
                }
              >
                <SelectTrigger className='bg-[hsl(0,0%,8%)] border-[hsl(0,0%,18%)]'>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className='bg-[hsl(0,0%,10%)] border-[hsl(0,0%,18%)]'>
                  <SelectItem value='INCOME'>Ingreso</SelectItem>
                  <SelectItem value='EXPENSE'>Egreso</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className='space-y-2'>
              <Label htmlFor='amount' className='text-zinc-300'>
                Monto
              </Label>
              <Input
                id='amount'
                type='number'
                step='0.01'
                min='0.01'
                required
                value={formData.amount}
                onChange={(e) =>
                  setFormData({ ...formData, amount: e.target.value })
                }
                placeholder='0.00'
                className='bg-[hsl(0,0%,8%)] border-[hsl(0,0%,18%)]'
              />
            </div>

            <div className='space-y-2'>
              <Label htmlFor='concept' className='text-zinc-300'>
                Concepto
              </Label>
              <Input
                id='concept'
                type='text'
                required
                value={formData.concept}
                onChange={(e) =>
                  setFormData({ ...formData, concept: e.target.value })
                }
                placeholder='Descripción del movimiento'
                className='bg-[hsl(0,0%,8%)] border-[hsl(0,0%,18%)]'
              />
            </div>

            <div className='space-y-2'>
              <Label htmlFor='date' className='text-zinc-300'>
                Fecha
              </Label>
              <Input
                id='date'
                type='date'
                required
                value={formData.date}
                onChange={(e) =>
                  setFormData({ ...formData, date: e.target.value })
                }
                className='bg-[hsl(0,0%,8%)] border-[hsl(0,0%,18%)]'
              />
            </div>

            <Button
              type='submit'
              className='w-full bg-emerald-500 hover:bg-emerald-600 text-black font-medium'
              disabled={saving}
            >
              {saving ? 'Guardando...' : 'Crear movimiento'}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default MovementsPage;
