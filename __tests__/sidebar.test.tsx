/**
 * Tests para el componente Sidebar
 *
 * Verifica que el RBAC funcione correctamente:
 * - Los usuarios normales solo ven "Dashboard" y "Movimientos"
 * - Los admins ven todas las opciones
 */

import { render, screen } from '@testing-library/react';
import { Sidebar } from '@/components/layout/Sidebar';

// Mock de next/router
jest.mock('next/router', () => ({
  useRouter: () => ({
    pathname: '/',
    push: jest.fn(),
  }),
}));

// Mock de next/link
jest.mock('next/link', () => {
  return ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  );
});

describe('Sidebar - RBAC', () => {
  const mockLogout = jest.fn();

  const adminUser = {
    name: 'Admin User',
    email: 'admin@test.com',
    image: null,
    role: 'ADMIN' as const,
  };

  const normalUser = {
    name: 'Normal User',
    email: 'user@test.com',
    image: null,
    role: 'USER' as const,
  };

  beforeEach(() => {
    mockLogout.mockClear();
  });

  it('muestra todas las opciones para ADMIN', () => {
    render(<Sidebar user={adminUser} onLogout={mockLogout} />);

    // Debe mostrar todas las opciones
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Movimientos')).toBeInTheDocument();
    expect(screen.getByText('Usuarios')).toBeInTheDocument();
    expect(screen.getByText('Reportes')).toBeInTheDocument();
  });

  it('oculta opciones de admin para USER', () => {
    render(<Sidebar user={normalUser} onLogout={mockLogout} />);

    // Debe mostrar opciones básicas
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Movimientos')).toBeInTheDocument();

    // NO debe mostrar opciones de admin
    expect(screen.queryByText('Usuarios')).not.toBeInTheDocument();
    expect(screen.queryByText('Reportes')).not.toBeInTheDocument();
  });

  it('muestra información del usuario', () => {
    render(<Sidebar user={adminUser} onLogout={mockLogout} />);

    expect(screen.getByText('Admin User')).toBeInTheDocument();
    expect(screen.getByText('ADMIN')).toBeInTheDocument();
  });

  it('muestra botón de cerrar sesión', () => {
    render(<Sidebar user={adminUser} onLogout={mockLogout} />);

    expect(screen.getByText('Cerrar sesión')).toBeInTheDocument();
  });

  it('muestra el logo de la aplicación', () => {
    render(<Sidebar user={adminUser} onLogout={mockLogout} />);

    expect(screen.getByText('FinanceApp')).toBeInTheDocument();
  });

  it('muestra inicial del usuario cuando no hay imagen', () => {
    render(<Sidebar user={normalUser} onLogout={mockLogout} />);

    // La inicial 'N' de 'Normal User' debe estar presente
    expect(screen.getByText('N')).toBeInTheDocument();
  });
});
