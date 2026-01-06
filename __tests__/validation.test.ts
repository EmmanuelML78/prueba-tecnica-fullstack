/**
 * Tests para utilidades de validación
 */

import { validateMovement, validateUserUpdate } from '@/lib/utils/validation';

describe('validateMovement', () => {
  const validMovement = {
    concept: 'Salario mensual',
    amount: 5000000,
    type: 'INCOME',
    date: '2024-01-15',
  };

  it('valida un movimiento correcto', () => {
    const result = validateMovement(validMovement);
    expect(result.isValid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('rechaza concepto vacío', () => {
    const result = validateMovement({ ...validMovement, concept: '' });
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('El concepto es requerido');
  });

  it('rechaza concepto muy corto', () => {
    const result = validateMovement({ ...validMovement, concept: 'ab' });
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain(
      'El concepto debe tener al menos 3 caracteres'
    );
  });

  it('rechaza monto cero', () => {
    const result = validateMovement({ ...validMovement, amount: 0 });
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('El monto debe ser mayor a 0');
  });

  it('rechaza monto negativo', () => {
    const result = validateMovement({ ...validMovement, amount: -100 });
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('El monto debe ser mayor a 0');
  });

  it('rechaza tipo inválido', () => {
    const result = validateMovement({ ...validMovement, type: 'INVALID' });
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('El tipo debe ser INCOME o EXPENSE');
  });

  it('acepta tipo EXPENSE', () => {
    const result = validateMovement({ ...validMovement, type: 'EXPENSE' });
    expect(result.isValid).toBe(true);
  });

  it('rechaza fecha inválida', () => {
    const result = validateMovement({ ...validMovement, date: 'no-es-fecha' });
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('La fecha es inválida');
  });

  it('rechaza fecha vacía', () => {
    const result = validateMovement({ ...validMovement, date: '' });
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('La fecha es requerida');
  });

  it('acumula múltiples errores', () => {
    const result = validateMovement({
      concept: '',
      amount: -1,
      type: 'INVALID',
      date: '',
    });
    expect(result.isValid).toBe(false);
    expect(result.errors.length).toBeGreaterThanOrEqual(4);
  });
});

describe('validateUserUpdate', () => {
  it('valida actualización correcta', () => {
    const result = validateUserUpdate({ name: 'Juan Pérez', role: 'ADMIN' });
    expect(result.isValid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('permite actualización parcial (solo nombre)', () => {
    const result = validateUserUpdate({ name: 'Juan' });
    expect(result.isValid).toBe(true);
  });

  it('permite actualización parcial (solo rol)', () => {
    const result = validateUserUpdate({ role: 'USER' });
    expect(result.isValid).toBe(true);
  });

  it('rechaza nombre vacío', () => {
    const result = validateUserUpdate({ name: '' });
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('El nombre no puede estar vacío');
  });

  it('rechaza nombre muy corto', () => {
    const result = validateUserUpdate({ name: 'A' });
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain(
      'El nombre debe tener al menos 2 caracteres'
    );
  });

  it('rechaza rol inválido', () => {
    const result = validateUserUpdate({ role: 'SUPERADMIN' });
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('El rol debe ser USER o ADMIN');
  });

  it('acepta rol USER', () => {
    const result = validateUserUpdate({ role: 'USER' });
    expect(result.isValid).toBe(true);
  });

  it('acepta rol ADMIN', () => {
    const result = validateUserUpdate({ role: 'ADMIN' });
    expect(result.isValid).toBe(true);
  });
});
