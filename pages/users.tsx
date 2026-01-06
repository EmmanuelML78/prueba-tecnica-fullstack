import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/router';
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
import {
  Users,
  Pencil,
  Shield,
  User as UserIcon,
  Mail,
  Phone,
} from 'lucide-react';
import type { Role } from '@prisma/client';

/**
 * Página de Usuarios - Dark Mode Elegante
 *
 * Usa useAuth() para verificar que sea admin.
 */

type User = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  role: Role;
  image: string | null;
  createdAt: string;
};

const UsersPage = () => {
  const router = useRouter();
  const { isAdmin } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    role: 'USER' as Role,
  });

  const fetchUsers = useCallback(async () => {
    try {
      const res = await fetch('/api/users');
      if (res.ok) {
        const data = await res.json();
        setUsers(data.users);
      } else if (res.status === 403) {
        router.push('/');
      }
    } catch (err) {
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    // Redirigir si no es admin
    if (!isAdmin) {
      router.push('/');
      return;
    }
    fetchUsers();
  }, [isAdmin, router, fetchUsers]);

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setFormData({
      name: user.name,
      role: user.role,
    });
    setError(null);
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    setError(null);
    setSaving(true);

    try {
      const res = await fetch(`/api/users/${editingUser.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Error al actualizar el usuario');
      }

      setIsDialogOpen(false);
      setEditingUser(null);
      fetchUsers();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setSaving(false);
    }
  };

  // No renderizar si no es admin
  if (!isAdmin) {
    return null;
  }

  return (
    <Layout title='Usuarios'>
      {/* Header */}
      <div className='flex items-center justify-between mb-6'>
        <div>
          <h2 className='text-xl font-semibold text-white'>
            Gestión de Usuarios
          </h2>
          <p className='text-zinc-500 text-sm'>
            Administra los usuarios del sistema
          </p>
        </div>
        <div className='flex items-center gap-2 text-zinc-500 text-sm'>
          <Users className='w-4 h-4' />
          {users.length} usuario{users.length !== 1 ? 's' : ''}
        </div>
      </div>

      {/* Users Grid */}
      {loading ? (
        <div className='flex items-center justify-center h-64'>
          <div className='w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin' />
        </div>
      ) : users.length === 0 ? (
        <div className='bg-[hsl(0,0%,10%)] border border-[hsl(0,0%,18%)] rounded-xl flex flex-col items-center justify-center h-64 text-zinc-500'>
          <Users className='w-12 h-12 mb-4 opacity-20' />
          <p>No hay usuarios registrados</p>
        </div>
      ) : (
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
          {users.map((user) => (
            <div
              key={user.id}
              className='bg-[hsl(0,0%,10%)] border border-[hsl(0,0%,18%)] rounded-xl p-5 hover:border-[hsl(0,0%,25%)] transition-colors'
            >
              {/* User Header */}
              <div className='flex items-start justify-between mb-4'>
                <div className='flex items-center gap-3'>
                  {user.image ? (
                    <img
                      src={user.image}
                      alt={user.name}
                      className='w-12 h-12 rounded-xl object-cover ring-2 ring-[hsl(0,0%,18%)]'
                    />
                  ) : (
                    <div className='w-12 h-12 rounded-xl bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center'>
                      <span className='text-white font-semibold'>
                        {user.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                  <div>
                    <h3 className='font-semibold text-white'>{user.name}</h3>
                    <span
                      className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                        user.role === 'ADMIN'
                          ? 'bg-amber-500/10 text-amber-400'
                          : 'bg-zinc-500/10 text-zinc-400'
                      }`}
                    >
                      {user.role === 'ADMIN' ? 'Administrador' : 'Usuario'}
                    </span>
                  </div>
                </div>
                <Button
                  variant='ghost'
                  size='sm'
                  onClick={() => handleEdit(user)}
                  className='text-zinc-400 hover:text-white hover:bg-white/5'
                >
                  <Pencil className='w-4 h-4' />
                </Button>
              </div>

              {/* User Details */}
              <div className='space-y-2'>
                <div className='flex items-center gap-2 text-sm text-zinc-400'>
                  <Mail className='w-4 h-4 opacity-50' />
                  <span className='truncate'>{user.email}</span>
                </div>
                <div className='flex items-center gap-2 text-sm text-zinc-400'>
                  <Phone className='w-4 h-4 opacity-50' />
                  <span>{user.phone || 'Sin teléfono'}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className='bg-[hsl(0,0%,10%)] border-[hsl(0,0%,18%)] text-white'>
          <DialogHeader>
            <DialogTitle className='flex items-center gap-2'>
              <Pencil className='w-5 h-5 text-emerald-400' />
              Editar Usuario
            </DialogTitle>
          </DialogHeader>

          {editingUser && (
            <div className='flex items-center gap-3 p-3 bg-[hsl(0,0%,8%)] rounded-lg mb-4'>
              {editingUser.image ? (
                <img
                  src={editingUser.image}
                  alt={editingUser.name}
                  className='w-10 h-10 rounded-lg object-cover'
                />
              ) : (
                <div className='w-10 h-10 rounded-lg bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center'>
                  <span className='text-white font-semibold'>
                    {editingUser.name.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
              <div>
                <p className='font-medium text-white'>{editingUser.email}</p>
                <p className='text-xs text-zinc-500'>
                  ID: {editingUser.id.slice(0, 8)}...
                </p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className='space-y-4'>
            {error && (
              <div className='bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-lg text-sm'>
                {error}
              </div>
            )}

            <div className='space-y-2'>
              <Label
                htmlFor='name'
                className='text-zinc-300 flex items-center gap-2'
              >
                <UserIcon className='w-4 h-4' />
                Nombre
              </Label>
              <Input
                id='name'
                type='text'
                required
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className='bg-[hsl(0,0%,8%)] border-[hsl(0,0%,18%)]'
              />
            </div>

            <div className='space-y-2'>
              <Label
                htmlFor='role'
                className='text-zinc-300 flex items-center gap-2'
              >
                <Shield className='w-4 h-4' />
                Rol
              </Label>
              <Select
                value={formData.role}
                onValueChange={(value: Role) =>
                  setFormData({ ...formData, role: value })
                }
              >
                <SelectTrigger className='bg-[hsl(0,0%,8%)] border-[hsl(0,0%,18%)]'>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className='bg-[hsl(0,0%,10%)] border-[hsl(0,0%,18%)]'>
                  <SelectItem value='USER'>Usuario</SelectItem>
                  <SelectItem value='ADMIN'>Administrador</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button
              type='submit'
              className='w-full bg-emerald-500 hover:bg-emerald-600 text-black font-medium'
              disabled={saving}
            >
              {saving ? 'Guardando...' : 'Guardar cambios'}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default UsersPage;
