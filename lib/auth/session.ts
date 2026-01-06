import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import type { NextApiRequest, NextApiResponse } from 'next';
import type { Role } from '@prisma/client';

/**
 * Tipo para el usuario con rol incluido
 */
export type AuthUser = {
  id: string;
  name: string;
  email: string;
  image: string | null;
  role: Role;
};

export type SessionData = {
  user: AuthUser;
  session: {
    id: string;
    expiresAt: Date;
  };
};

/**
 * Obtiene la sesión del usuario desde una API route.
 *
 * Better Auth usa headers para validar la sesión,
 * así que convertimos el request de Next.js al formato que espera.
 *
 * @returns SessionData si hay sesión válida, null si no
 */
export async function getServerSession(
  req: NextApiRequest
): Promise<SessionData | null> {
  try {
    // Better Auth espera un objeto Request (Web API)
    // Convertimos el NextApiRequest
    const headers = new Headers();

    // Copiar headers relevantes (cookies, authorization)
    Object.entries(req.headers).forEach(([key, value]) => {
      if (value) {
        headers.set(key, Array.isArray(value) ? value[0] : value);
      }
    });

    const session = await auth.api.getSession({
      headers,
    });

    if (!session?.user) {
      return null;
    }

    // Obtener el usuario completo de la BD (con el rol)
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        role: true,
      },
    });

    if (!user) {
      return null;
    }

    return {
      user,
      session: {
        id: session.session.id,
        expiresAt: session.session.expiresAt,
      },
    };
  } catch (error) {
    console.error('Error getting session:', error);
    return null;
  }
}

/**
 * Helper para verificar si el usuario tiene uno de los roles permitidos.
 *
 * Uso:
 *   if (!hasRole(session.user, ['ADMIN'])) {
 *     return res.status(403).json({ error: 'Forbidden' });
 *   }
 */
export function hasRole(user: AuthUser, allowedRoles: Role[]): boolean {
  return allowedRoles.includes(user.role);
}

/**
 * Wrapper para proteger API routes.
 *
 * Ejemplo de uso:
 *
 * export default withAuth(async (req, res, session) => {
 *   // Tu código aquí, session está garantizada
 * });
 *
 * O con roles específicos:
 *
 * export default withAuth(
 *   async (req, res, session) => { ... },
 *   { roles: ['ADMIN'] }
 * );
 */
type ProtectedHandler = (
  req: NextApiRequest,
  res: NextApiResponse,
  session: SessionData
) => Promise<void> | void;

type WithAuthOptions = {
  roles?: Role[];
};

export function withAuth(handler: ProtectedHandler, options?: WithAuthOptions) {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    const session = await getServerSession(req);

    // No autenticado
    if (!session) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Debes iniciar sesión para acceder a este recurso',
      });
    }

    // Verificar roles si se especificaron
    if (options?.roles && !hasRole(session.user, options.roles)) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'No tienes permisos para acceder a este recurso',
      });
    }

    // Ejecutar el handler con la sesión
    return handler(req, res, session);
  };
}
