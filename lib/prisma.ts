import { PrismaClient } from '@prisma/client';

/**
 * Prisma Client Singleton
 *
 * En desarrollo, Next.js hace hot-reload y crea múltiples instancias
 * de PrismaClient, agotando las conexiones a la BD.
 *
 * Este patrón guarda la instancia en `globalThis` para reutilizarla.
 *
 * Docs: https://www.prisma.io/docs/guides/performance-and-optimization/connection-management
 */

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
