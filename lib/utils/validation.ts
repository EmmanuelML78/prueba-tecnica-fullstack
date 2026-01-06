/**
 * Utilidades de validación
 *
 * Funciones para validar datos de entrada.
 * Usadas tanto en frontend como en las API routes.
 */

export type MovementInput = {
  concept?: string;
  amount?: number;
  type?: string;
  date?: string;
};

export type ValidationResult = {
  isValid: boolean;
  errors: string[];
};

/**
 * Valida los datos de un movimiento
 */
export function validateMovement(data: MovementInput): ValidationResult {
  const errors: string[] = [];

  // Validar concepto
  if (!data.concept?.trim()) {
    errors.push('El concepto es requerido');
  } else if (data.concept.trim().length < 3) {
    errors.push('El concepto debe tener al menos 3 caracteres');
  }

  // Validar monto
  if (data.amount === undefined || data.amount === null) {
    errors.push('El monto es requerido');
  } else if (typeof data.amount !== 'number' || isNaN(data.amount)) {
    errors.push('El monto debe ser un número válido');
  } else if (data.amount <= 0) {
    errors.push('El monto debe ser mayor a 0');
  }

  // Validar tipo
  if (!data.type) {
    errors.push('El tipo es requerido');
  } else if (!['INCOME', 'EXPENSE'].includes(data.type)) {
    errors.push('El tipo debe ser INCOME o EXPENSE');
  }

  // Validar fecha
  if (!data.date) {
    errors.push('La fecha es requerida');
  } else if (isNaN(Date.parse(data.date))) {
    errors.push('La fecha es inválida');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Valida los datos de actualización de usuario
 */
export function validateUserUpdate(data: {
  name?: string;
  role?: string;
}): ValidationResult {
  const errors: string[] = [];

  if (data.name !== undefined) {
    if (!data.name.trim()) {
      errors.push('El nombre no puede estar vacío');
    } else if (data.name.trim().length < 2) {
      errors.push('El nombre debe tener al menos 2 caracteres');
    }
  }

  if (data.role !== undefined) {
    if (!['USER', 'ADMIN'].includes(data.role)) {
      errors.push('El rol debe ser USER o ADMIN');
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}
