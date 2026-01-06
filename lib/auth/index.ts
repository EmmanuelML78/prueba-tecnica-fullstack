import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { prisma } from '@/lib/prisma';

/**
 * Configuración de Better Auth
 *
 * - Usa Prisma como adaptador para guardar sesiones en PostgreSQL
 * - GitHub como único proveedor de autenticación (requisito de la prueba)
 * - Las sesiones se guardan en la BD, no en cookies/JWT
 */
export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: 'postgresql',
  }),
  socialProviders: {
    github: {
      clientId: process.env.GITHUB_CLIENT_ID as string,
      clientSecret: process.env.GITHUB_CLIENT_SECRET as string,
    },
  },
});

export type Session = typeof auth.$Infer.Session;
