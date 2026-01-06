import type { NextApiRequest, NextApiResponse } from 'next';
import { withAuth, type SessionData } from '@/lib/auth/session';
import type { Role } from '@prisma/client';

/**
 * API Route: /api/me
 *
 * GET - Obtener datos del usuario actual
 *
 * Retorna los datos del usuario logueado incluyendo su rol.
 * No requiere ser ADMIN, cualquier usuario autenticado puede acceder.
 */

type UserResponse = {
  id: string;
  name: string;
  email: string;
  image: string | null;
  role: Role;
};

type ErrorResponse = {
  error: string;
  message: string;
};

async function handler(
  req: NextApiRequest,
  res: NextApiResponse<UserResponse | ErrorResponse>,
  session: SessionData
) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({
      error: 'Method Not Allowed',
      message: `El método ${req.method} no está permitido`,
    });
  }

  return res.status(200).json({
    id: session.user.id,
    name: session.user.name,
    email: session.user.email,
    image: session.user.image,
    role: session.user.role,
  });
}

export default withAuth(handler);
