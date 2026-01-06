import Link from 'next/link';
import { Home, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

/**
 * Página 404 - Not Found
 *
 * Estilo dark mode consistente con el resto de la app.
 */
const NotFoundPage = () => {
  return (
    <main className='min-h-screen flex items-center justify-center bg-[hsl(0,0%,7%)] p-4'>
      {/* Background gradient */}
      <div className='absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-transparent to-red-500/5' />

      <div className='relative text-center'>
        {/* 404 grande */}
        <h1 className='text-[150px] font-bold text-zinc-800 leading-none select-none'>
          404
        </h1>

        {/* Mensaje */}
        <div className='mt-4 mb-8'>
          <h2 className='text-2xl font-semibold text-white mb-2'>
            Página no encontrada
          </h2>
          <p className='text-zinc-500 max-w-md mx-auto'>
            La página que buscas no existe o fue movida a otra ubicación.
          </p>
        </div>

        {/* Botones */}
        <div className='flex items-center justify-center gap-4'>
          <Button
            variant='outline'
            onClick={() => window.history.back()}
            className='border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-white'
          >
            <ArrowLeft className='w-4 h-4 mr-2' />
            Volver atrás
          </Button>

          <Link href='/'>
            <Button className='bg-emerald-500 hover:bg-emerald-600 text-black font-medium'>
              <Home className='w-4 h-4 mr-2' />
              Ir al inicio
            </Button>
          </Link>
        </div>
      </div>
    </main>
  );
};

export default NotFoundPage;
