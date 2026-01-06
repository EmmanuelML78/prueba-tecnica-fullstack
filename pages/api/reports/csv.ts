import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';
import { withAuth, type SessionData } from '@/lib/auth/session';

/**
 * API Route: /api/reports/csv
 *
 * GET - Descargar reporte de movimientos en formato CSV (solo ADMIN)
 *
 * El CSV incluye:
 *   - Concepto
 *   - Monto
 *   - Tipo (Ingreso/Egreso)
 *   - Fecha
 *   - Usuario
 */

async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
  session: SessionData
) {
  // Solo ADMIN puede descargar reportes
  if (session.user.role !== 'ADMIN') {
    return res.status(403).json({
      error: 'Forbidden',
      message: 'Solo los administradores pueden descargar reportes',
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

async function handleGet(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Obtener todos los movimientos con usuario
    const movements = await prisma.movement.findMany({
      include: {
        user: {
          select: {
            name: true,
          },
        },
      },
      orderBy: { date: 'desc' },
    });

    // Generar CSV con punto y coma (;) como separador
    // Excel en español/latinoamérica usa ; en vez de ,
    const headers = ['Concepto', 'Monto', 'Tipo', 'Fecha', 'Usuario'];

    const rows = movements.map((m) => [
      // Escapar comillas en el concepto
      `"${m.concept.replace(/"/g, '""')}"`,
      Number(m.amount).toFixed(2),
      m.type === 'INCOME' ? 'Ingreso' : 'Egreso',
      m.date.toISOString().slice(0, 10), // Solo fecha, sin hora
      `"${m.user.name.replace(/"/g, '""')}"`,
    ]);

    // Construir el CSV con ; como separador
    const csv = [headers.join(';'), ...rows.map((row) => row.join(';'))].join(
      '\n'
    );

    // Agregar BOM para que Excel reconozca UTF-8
    const bom = '\uFEFF';
    const csvWithBom = bom + csv;

    // Configurar headers para descarga
    const filename = `reporte-movimientos-${new Date().toISOString().slice(0, 10)}.csv`;

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

    return res.status(200).send(csvWithBom);
  } catch (error) {
    console.error('Error generating CSV:', error);
    return res.status(500).json({
      error: 'Internal Server Error',
      message: 'Error al generar el CSV',
    });
  }
}

export default withAuth(handler);
