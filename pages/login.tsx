import { authClient } from '@/lib/auth/client';
import { Github } from 'lucide-react';

/**
 * Página de Login - Dark Mode Elegante
 */
const LoginPage = () => {
  const handleGitHubLogin = async () => {
    await authClient.signIn.social({
      provider: 'github',
      callbackURL: '/',
    });
  };

  return (
    <main className='min-h-screen flex items-center justify-center bg-[hsl(0,0%,7%)] p-4'>
      {/* Background gradient */}
      <div className='absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-transparent to-blue-500/5' />

      {/* Grid pattern */}
      <div
        className='absolute inset-0 opacity-[0.02]'
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />

      <div className='relative w-full max-w-md'>
        {/* Logo */}
        <div className='text-center mb-8'>
          <div className='inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-600 mb-4'>
            <span className='text-black font-bold text-2xl'>₿</span>
          </div>
          <h1 className='text-2xl font-bold text-white mb-2'>FinanceApp</h1>
          <p className='text-zinc-500'>
            Sistema de gestión de ingresos y gastos
          </p>
        </div>

        {/* Card */}
        <div className='bg-[hsl(0,0%,10%)] border border-[hsl(0,0%,18%)] rounded-2xl p-8'>
          <div className='text-center mb-6'>
            <h2 className='text-lg font-semibold text-white mb-2'>
              Iniciar Sesión
            </h2>
            <p className='text-zinc-500 text-sm'>
              Usa tu cuenta de GitHub para acceder
            </p>
          </div>

          <button
            onClick={handleGitHubLogin}
            className='w-full flex items-center justify-center gap-3 bg-white text-black font-medium py-3 px-4 rounded-xl hover:bg-zinc-200 transition-colors'
          >
            <Github className='w-5 h-5' />
            Continuar con GitHub
          </button>

          <div className='mt-6 pt-6 border-t border-[hsl(0,0%,18%)]'>
            <p className='text-xs text-zinc-500 text-center'>
              Al iniciar sesión, aceptas nuestros términos de servicio y
              política de privacidad.
            </p>
          </div>
        </div>

        {/* Footer */}
        <p className='text-center text-zinc-600 text-sm mt-8'>
          © {new Date().getFullYear()} FinanceApp. Todos los derechos
          reservados.
        </p>
      </div>
    </main>
  );
};

export default LoginPage;
