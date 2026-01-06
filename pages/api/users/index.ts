import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';
import { withAuth, type SessionData } from '@/lib/auth/session';
import type { Role } from '@prisma/client';

/**
 * API Route: /api/users
 *
 * GET - Listar todos los usuarios (solo ADMIN)
 *
 * La edición de usuario se hace en /api/users/[id]
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

type UsersResponse = {
  users: User[];
  total: number;
};

type ErrorResponse = {
  error: string;
  message: string;
};

async function handler(
  req: NextApiRequest,
  res: NextApiResponse<UsersResponse | ErrorResponse>,
  session: SessionData
) {
  // Solo ADMIN puede ver la lista de usuarios
  if (session.user.role !== 'ADMIN') {
    return res.status(403).json({
      error: 'Forbidden',
      message: 'Solo los administradores pueden ver la lista de usuarios',
    });
  }

  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({
      error: 'Method Not Allowed',
      message: `El método ${req.method} no está permitido`,
    });
  }

  return handleGet(req, res);
}

/**
 * GET /api/users
 *
 * Lista todos los usuarios.
 * Solo accesible por ADMIN.
 */
async function handleGet(
  req: NextApiRequest,
  res: NextApiResponse<UsersResponse | ErrorResponse>
) {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        image: true,
        createdAt: true,
      },
      orderBy: { name: 'asc' },
    });

    const formattedUsers: User[] = users.map((u) => ({
      ...u,
      createdAt: u.createdAt.toISOString(),
    }));

    return res.status(200).json({
      users: formattedUsers,
      total: users.length,
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    return res.status(500).json({
      error: 'Internal Server Error',
      message: 'Error al obtener los usuarios',
    });
  }
}

export default withAuth(handler);
