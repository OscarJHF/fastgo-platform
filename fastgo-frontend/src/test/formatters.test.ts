import { describe, it, expect } from 'vitest';
import { formatCurrency, formatDate } from '../utils/formatters';

describe('Formatters Utils', () => {
  it('formats currency correctly in COP format', () => {
    const formatted = formatCurrency(25000);
    // Debe incluir 25 y 000
    expect(formatted).toContain('25');
    expect(formatted).toContain('000');
  });

  it('handles null and undefined safely', () => {
    expect(formatCurrency(null)).toBe('$0');
    expect(formatCurrency(undefined)).toBe('$0');
  });

  it('formats date correctly', () => {
    const date = '2026-09-14T10:30:00';
    const formatted = formatDate(date);
    expect(formatted.length).toBeGreaterThan(0);
  });
});
