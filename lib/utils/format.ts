/**
 * Utilidades de formateo
 *
 * Funciones puras para formatear datos en la UI.
 * Al ser funciones puras, son fáciles de testear.
 */

/**
 * Formatea un número como moneda colombiana (COP)
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
  }).format(amount);
}

/**
 * Formatea una fecha ISO a formato legible
 */
export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('es-CO', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

/**
 * Formatea un mes (YYYY-MM) a formato corto
 */
export function formatMonth(monthStr: string): string {
  const [year, month] = monthStr.split('-');
  const months = [
    'Ene',
    'Feb',
    'Mar',
    'Abr',
    'May',
    'Jun',
    'Jul',
    'Ago',
    'Sep',
    'Oct',
    'Nov',
    'Dic',
  ];
  return `${months[parseInt(month) - 1]} ${year.slice(2)}`;
}

/**
 * Calcula el balance total de un array de movimientos
 */
export function calculateBalance(
  movements: Array<{ amount: number; type: 'INCOME' | 'EXPENSE' }>
): number {
  return movements.reduce((acc, m) => {
    return m.type === 'INCOME' ? acc + m.amount : acc - m.amount;
  }, 0);
}
