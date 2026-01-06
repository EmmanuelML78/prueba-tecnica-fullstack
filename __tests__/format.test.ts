/**
 * Tests para utilidades de formateo
 */

import {
  formatCurrency,
  formatMonth,
  calculateBalance,
} from '@/lib/utils/format';

describe('formatCurrency', () => {
  it('formatea números positivos correctamente', () => {
    const result = formatCurrency(1000000);
    // Verifica que contenga el número formateado (el formato exacto puede variar)
    expect(result).toContain('1.000.000');
  });

  it('formatea cero correctamente', () => {
    const result = formatCurrency(0);
    expect(result).toContain('0');
  });

  it('formatea números negativos correctamente', () => {
    const result = formatCurrency(-500000);
    expect(result).toContain('500.000');
  });

  it('formatea decimales correctamente', () => {
    const result = formatCurrency(1234.56);
    // En formato colombiano: $ 1.234,56
    expect(result).toContain('1.234');
  });
});

describe('formatMonth', () => {
  it('formatea enero correctamente', () => {
    expect(formatMonth('2024-01')).toBe('Ene 24');
  });

  it('formatea diciembre correctamente', () => {
    expect(formatMonth('2024-12')).toBe('Dic 24');
  });

  it('formatea meses intermedios correctamente', () => {
    expect(formatMonth('2025-06')).toBe('Jun 25');
    expect(formatMonth('2023-09')).toBe('Sep 23');
  });
});

describe('calculateBalance', () => {
  it('calcula balance con solo ingresos', () => {
    const movements = [
      { amount: 1000, type: 'INCOME' as const },
      { amount: 2000, type: 'INCOME' as const },
    ];
    expect(calculateBalance(movements)).toBe(3000);
  });

  it('calcula balance con solo egresos', () => {
    const movements = [
      { amount: 500, type: 'EXPENSE' as const },
      { amount: 300, type: 'EXPENSE' as const },
    ];
    expect(calculateBalance(movements)).toBe(-800);
  });

  it('calcula balance mixto correctamente', () => {
    const movements = [
      { amount: 5000, type: 'INCOME' as const },
      { amount: 2000, type: 'EXPENSE' as const },
      { amount: 1000, type: 'INCOME' as const },
      { amount: 500, type: 'EXPENSE' as const },
    ];
    // 5000 + 1000 - 2000 - 500 = 3500
    expect(calculateBalance(movements)).toBe(3500);
  });

  it('retorna 0 con array vacío', () => {
    expect(calculateBalance([])).toBe(0);
  });

  it('maneja decimales correctamente', () => {
    const movements = [
      { amount: 100.5, type: 'INCOME' as const },
      { amount: 50.25, type: 'EXPENSE' as const },
    ];
    expect(calculateBalance(movements)).toBeCloseTo(50.25);
  });
});
