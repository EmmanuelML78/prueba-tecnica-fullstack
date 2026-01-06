import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';
import { withAuth, type SessionData } from '@/lib/auth/session';
import { MovementType } from '@prisma/client';

/**
 * API Route: /api/movements
 *
 * GET  - Listar todos los movimientos (USER, ADMIN)
 * POST - Crear nuevo movimiento (solo ADMIN)
 *
 * Ambos métodos requieren autenticación.
 */

// Tipos para las respuestas
type Movement = {
  id: string;
  concept: string;
  amount: number;
  type: MovementType;
  date: string;
  user: {
    id: string;
    name: string;
  };
};

type MovementsResponse = {
  movements: Movement[];
  total: number;
};

type ErrorResponse = {
  error: string;
  message: string;
  details?: unknown;
};

// Tipo para el body del POST
type CreateMovementBody = {
  concept: string;
  amount: number;
  type: MovementType;
  date: string;
};

async function handler(
  req: NextApiRequest,
  res: NextApiResponse<MovementsResponse | Movement | ErrorResponse>,
  session: SessionData
) {
  switch (req.method) {
    case 'GET':
      return handleGet(req, res);

    case 'POST':
      return handlePost(req, res, session);

    default:
      res.setHeader('Allow', ['GET', 'POST']);
      return res.status(405).json({
        error: 'Method Not Allowed',
        message: `El método ${req.method} no está permitido`,
      });
  }
}

/**
 * GET /api/movements
 *
 * Lista todos los movimientos con paginación opcional.
 * Accesible por USER y ADMIN.
 *
 * Query params:
 *   - page: número de página (default: 1)
 *   - limit: items por página (default: 50)
 *   - type: filtrar por tipo (INCOME | EXPENSE)
 */
async function handleGet(
  req: NextApiRequest,
  res: NextApiResponse<MovementsResponse | ErrorResponse>
) {
  try {
    const { page = '1', limit = '50', type } = req.query;

    const pageNum = Math.max(1, parseInt(page as string, 10));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit as string, 10)));
    const skip = (pageNum - 1) * limitNum;

    // Filtro opcional por tipo
    const where =
      type && ['INCOME', 'EXPENSE'].includes(type as string)
        ? { type: type as MovementType }
        : {};

    // Obtener movimientos con usuario
    const [movements, total] = await Promise.all([
      prisma.movement.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { date: 'desc' },
        include: {
          user: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      }),
      prisma.movement.count({ where }),
    ]);

    // Transformar Decimal a number para JSON
    const formattedMovements: Movement[] = movements.map((m) => ({
      id: m.id,
      concept: m.concept,
      amount: Number(m.amount), // Decimal → number
      type: m.type,
      date: m.date.toISOString(),
      user: m.user,
    }));

    return res.status(200).json({
      movements: formattedMovements,
      total,
    });
  } catch (error) {
    console.error('Error fetching movements:', error);
    return res.status(500).json({
      error: 'Internal Server Error',
      message: 'Error al obtener los movimientos',
    });
  }
}

/**
 * POST /api/movements
 *
 * Crea un nuevo movimiento.
 * Solo accesible por ADMIN.
 *
 * Body:
 *   - concept: string (requerido)
 *   - amount: number (requerido, > 0)
 *   - type: "INCOME" | "EXPENSE" (requerido)
 *   - date: string ISO (requerido)
 */
async function handlePost(
  req: NextApiRequest,
  res: NextApiResponse<Movement | ErrorResponse>,
  session: SessionData
) {
  // Verificar que sea ADMIN
  if (session.user.role !== 'ADMIN') {
    return res.status(403).json({
      error: 'Forbidden',
      message: 'Solo los administradores pueden crear movimientos',
    });
  }

  try {
    const body = req.body as CreateMovementBody;

    // Validación básica
    const errors: string[] = [];

    if (!body.concept?.trim()) {
      errors.push('El concepto es requerido');
    }

    if (typeof body.amount !== 'number' || body.amount <= 0) {
      errors.push('El monto debe ser un número mayor a 0');
    }

    if (!['INCOME', 'EXPENSE'].includes(body.type)) {
      errors.push('El tipo debe ser INCOME o EXPENSE');
    }

    if (!body.date || isNaN(Date.parse(body.date))) {
      errors.push('La fecha es inválida');
    }

    if (errors.length > 0) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'Datos inválidos',
        details: errors,
      });
    }

    // Crear el movimiento
    const movement = await prisma.movement.create({
      data: {
        concept: body.concept.trim(),
        amount: body.amount,
        type: body.type,
        date: new Date(body.date),
        userId: session.user.id, // El usuario logueado
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return res.status(201).json({
      id: movement.id,
      concept: movement.concept,
      amount: Number(movement.amount),
      type: movement.type,
      date: movement.date.toISOString(),
      user: movement.user,
    });
  } catch (error) {
    console.error('Error creating movement:', error);
    return res.status(500).json({
      error: 'Internal Server Error',
      message: 'Error al crear el movimiento',
    });
  }
}

// Exportar con protección de autenticación
// Cualquier usuario autenticado puede acceder, pero POST verifica ADMIN internamente
export default withAuth(handler);
