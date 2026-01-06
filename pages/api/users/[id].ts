import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';
import { withAuth, type SessionData } from '@/lib/auth/session';
import type { Role } from '@prisma/client';

/**
 * API Route: /api/users/[id]
 *
 * PUT - Editar un usuario (solo ADMIN)
 *
 * Según los wireframes, solo se puede editar:
 * - Nombre
 * - Rol
 */

type User = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  role: Role;
};

type ErrorResponse = {
  error: string;
  message: string;
  details?: unknown;
};

type UpdateUserBody = {
  name?: string;
  role?: Role;
};

async function handler(
  req: NextApiRequest,
  res: NextApiResponse<User | ErrorResponse>,
  session: SessionData
) {
  // Solo ADMIN puede editar usuarios
  if (session.user.role !== 'ADMIN') {
    return res.status(403).json({
      error: 'Forbidden',
      message: 'Solo los administradores pueden editar usuarios',
    });
  }

  if (req.method !== 'PUT') {
    res.setHeader('Allow', ['PUT']);
    return res.status(405).json({
      error: 'Method Not Allowed',
      message: `El método ${req.method} no está permitido`,
    });
  }

  return handlePut(req, res);
}

/**
 * PUT /api/users/[id]
 *
 * Actualiza nombre y/o rol de un usuario.
 * Solo accesible por ADMIN.
 *
 * Body:
 *   - name: string (opcional)
 *   - role: "USER" | "ADMIN" (opcional)
 */
async function handlePut(
  req: NextApiRequest,
  res: NextApiResponse<User | ErrorResponse>
) {
  try {
    const { id } = req.query;

    if (!id || typeof id !== 'string') {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'ID de usuario inválido',
      });
    }

    // Verificar que el usuario existe
    const existingUser = await prisma.user.findUnique({
      where: { id },
    });

    if (!existingUser) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Usuario no encontrado',
      });
    }

    const body = req.body as UpdateUserBody;

    // Validación
    const errors: string[] = [];

    if (body.name !== undefined && !body.name.trim()) {
      errors.push('El nombre no puede estar vacío');
    }

    if (body.role !== undefined && !['USER', 'ADMIN'].includes(body.role)) {
      errors.push('El rol debe ser USER o ADMIN');
    }

    if (errors.length > 0) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'Datos inválidos',
        details: errors,
      });
    }

    // Solo actualizar los campos que vienen en el body
    const updateData: { name?: string; role?: Role } = {};

    if (body.name !== undefined) {
      updateData.name = body.name.trim();
    }

    if (body.role !== undefined) {
      updateData.role = body.role;
    }

    // Si no hay nada que actualizar
    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'No se proporcionaron datos para actualizar',
      });
    }

    // Actualizar
    const updatedUser = await prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
      },
    });

    return res.status(200).json(updatedUser);
  } catch (error) {
    console.error('Error updating user:', error);
    return res.status(500).json({
      error: 'Internal Server Error',
      message: 'Error al actualizar el usuario',
    });
  }
}

export default withAuth(handler);
