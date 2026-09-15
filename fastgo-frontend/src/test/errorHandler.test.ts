import { describe, it, expect } from 'vitest';
import { parseApiError } from '../utils/errorHandler';

describe('Error Handler', () => {
  it('parses generic Error correctly', () => {
    const err = new Error('Conexión fallida');
    const result = parseApiError(err);
    expect(result.status).toBe(500);
    expect(result.message).toBe('Conexión fallida');
    expect(result.error).toBe('UNKNOWN_ERROR');
  });

  it('handles non-error inputs smoothly', () => {
    const result = parseApiError('something bad');
    expect(result.status).toBe(500);
    expect(result.message).toBe('Error inesperado en la aplicación');
  });
});
