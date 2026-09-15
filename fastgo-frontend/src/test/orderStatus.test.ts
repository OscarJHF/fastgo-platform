import { describe, it, expect } from 'vitest';
import { ORDER_STATUS_DETAILS } from '../constants/orderStatus';

describe('Order Status Constants', () => {
  it('defines all required state machine states', () => {
    expect(ORDER_STATUS_DETAILS['PENDIENTE']).toBeDefined();
    expect(ORDER_STATUS_DETAILS['CONFIRMADO']).toBeDefined();
    expect(ORDER_STATUS_DETAILS['EN_PREPARACION']).toBeDefined();
    expect(ORDER_STATUS_DETAILS['LISTO_PARA_ENTREGA']).toBeDefined();
    expect(ORDER_STATUS_DETAILS['EN_CAMINO']).toBeDefined();
    expect(ORDER_STATUS_DETAILS['ENTREGADO']).toBeDefined();
    expect(ORDER_STATUS_DETAILS['CANCELADO']).toBeDefined();
  });

  it('has valid labels and badge classes', () => {
    const pending = ORDER_STATUS_DETAILS['PENDIENTE'];
    expect(pending.label).toBe('Pendiente');
    expect(pending.badgeClass).toContain('amber');
  });
});
