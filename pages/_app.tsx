import '@/styles/globals.css';
import type { AppProps } from 'next/app';
import { AuthProvider } from '@/contexts/AuthContext';

/**
 * App principal
 *
 * AuthProvider envuelve toda la app para:
 * - Cargar el usuario UNA SOLA VEZ
 * - Compartir el estado entre todas las páginas
 * - Manejar redirecciones de autenticación
 */
const App = ({ Component, pageProps }: AppProps) => (
  <AuthProvider>
    <Component {...pageProps} />
  </AuthProvider>
);

export default App;
