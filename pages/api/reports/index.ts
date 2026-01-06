import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';
import { withAuth, type SessionData } from '@/lib/auth/session';

/**
 * API Route: /api/reports
 *
 * GET - Obtener datos para el dashboard de reportes (solo ADMIN)
 *
 * Retorna:
 *   - Saldo actual (ingresos - egresos)
 *   - Resumen por tipo (total ingresos, total egresos)
 *   - Movimientos agrupados por mes para el gráfico
 */

type MonthlyData = {
  month: string; // "2024-01"
  income: number; // Total ingresos del mes
  expense: number; // Total egresos del mes
};

type ReportResponse = {
  balance: number; // Saldo actual
  totalIncome: number; // Total de ingresos
  totalExpense: number; // Total de egresos
  movementsCount: number; // Cantidad de movimientos
  monthlyData: MonthlyData[]; // Para el gráfico
};

type ErrorResponse = {
  error: string;
  message: string;
};

async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ReportResponse | ErrorResponse>,
  session: SessionData
) {
  // Solo ADMIN puede ver reportes
  if (session.user.role !== 'ADMIN') {
    return res.status(403).json({
      error: 'Forbidden',
      message: 'Solo los administradores pueden ver los reportes',
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

async function handleGet(
  req: NextApiRequest,
  res: NextApiResponse<ReportResponse | ErrorResponse>
) {
  try {
    // Obtener todos los movimientos
    const movements = await prisma.movement.findMany({
      select: {
        amount: true,
        type: true,
        date: true,
      },
      orderBy: { date: 'asc' },
    });

    // Calcular totales
    let totalIncome = 0;
    let totalExpense = 0;

    // Agrupar por mes
    const monthlyMap = new Map<string, { income: number; expense: number }>();

    for (const movement of movements) {
      const amount = Number(movement.amount);

      if (movement.type === 'INCOME') {
        totalIncome += amount;
      } else {
        totalExpense += amount;
      }

      // Agrupar por mes (formato: "2024-01")
      const monthKey = movement.date.toISOString().slice(0, 7);

      if (!monthlyMap.has(monthKey)) {
        monthlyMap.set(monthKey, { income: 0, expense: 0 });
      }

      const monthData = monthlyMap.get(monthKey)!;

      if (movement.type === 'INCOME') {
        monthData.income += amount;
      } else {
        monthData.expense += amount;
      }
    }

    // Convertir Map a array ordenado
    const monthlyData: MonthlyData[] = Array.from(monthlyMap.entries())
      .map(([month, data]) => ({
        month,
        income: Math.round(data.income * 100) / 100,
        expense: Math.round(data.expense * 100) / 100,
      }))
      .sort((a, b) => a.month.localeCompare(b.month));

    return res.status(200).json({
      balance: Math.round((totalIncome - totalExpense) * 100) / 100,
      totalIncome: Math.round(totalIncome * 100) / 100,
      totalExpense: Math.round(totalExpense * 100) / 100,
      movementsCount: movements.length,
      monthlyData,
    });
  } catch (error) {
    console.error('Error generating report:', error);
    return res.status(500).json({
      error: 'Internal Server Error',
      message: 'Error al generar el reporte',
    });
  }
}

export default withAuth(handler);
