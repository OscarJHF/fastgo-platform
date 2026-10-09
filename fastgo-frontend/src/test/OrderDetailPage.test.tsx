import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import React from 'react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { OrderDetailPage } from '../pages/client/OrderDetailPage';
import { pedidoService } from '../services/pedidoService';
import { pagoService } from '../services/pagoService';
import { trackingService } from '../services/trackingService';
import { ToastProvider } from '../context/ToastContext';

vi.mock('../services/pedidoService', () => ({
  pedidoService: {
    getOrder: vi.fn(),
    getOrderDetails: vi.fn(),
    getComprobanteBlob: vi.fn(),
    cancelOrder: vi.fn(),
  },
}));

vi.mock('../services/pagoService', () => ({
  pagoService: {
    getPaymentsByOrder: vi.fn().mockResolvedValue([]),
  },
}));

vi.mock('../services/trackingService', () => ({
  trackingService: {
    obtenerUltimaUbicacion: vi.fn().mockResolvedValue(null),
  },
}));

const mockOrder = {
  id: 20,
  usuarioId: 31,
  sucursalId: 1,
  sucursalNombre: 'Sede Principal',
  comercioNombre: 'Hamburguesas QA',
  comercioDireccion: 'Calle 100 # 15-20, Bogotá',
  direccionTexto: 'Carrera 7 # 72-10, Bogotá',
  destinoReferencia: 'Apto 402',
  domiciliarioId: 33,
  domiciliarioNombre: 'Daniel Domiciliario Uno',
  domiciliarioTelefono: '3105550000',
  estado: 'EN_CAMINO' as const,
  estadoPago: 'APROBADO',
  metodoPago: 'EFECTIVO' as const,
  subtotal: 44000,
  costoEnvio: 3500,
  total: 47500,
  creadoEn: '2026-10-06T15:30:00',
};

const mockDetails = [
  {
    id: 22,
    pedidoId: 20,
    productoId: 12,
    productoNombre: 'Hamburguesa Especial E2E',
    cantidad: 2,
    precio: 18000,
    subtotal: 36000,
  },
  {
    id: 23,
    pedidoId: 20,
    productoId: 13,
    productoNombre: 'Papas Rústicas E2E',
    cantidad: 1,
    precio: 8000,
    subtotal: 8000,
  },
];

describe('OrderDetailPage Component Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders order detail with full commerce, driver, and historical product names', async () => {
    vi.mocked(pedidoService.getOrder).mockResolvedValue(mockOrder as any);
    vi.mocked(pedidoService.getOrderDetails).mockResolvedValue(mockDetails as any);

    render(
      <MemoryRouter initialEntries={['/pedidos/20']}>
        <ToastProvider>
          <Routes>
            <Route path="/pedidos/:id" element={<OrderDetailPage />} />
          </Routes>
        </ToastProvider>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Pedido #20')).toBeInTheDocument();
    });

    expect(screen.getByText('Hamburguesas QA')).toBeInTheDocument();
    expect(screen.getByText(/Calle 100 # 15-20, Bogotá/)).toBeInTheDocument();
    expect(screen.getByText(/Sucursal: Sede Principal/)).toBeInTheDocument();

    expect(screen.getByText('Daniel Domiciliario Uno')).toBeInTheDocument();
    expect(screen.getByText('Llamar')).toHaveAttribute('href', 'tel:3105550000');

    expect(screen.getByText('Hamburguesa Especial E2E')).toBeInTheDocument();
    expect(screen.getByText('Papas Rústicas E2E')).toBeInTheDocument();
    expect(screen.queryByText('Producto #12')).not.toBeInTheDocument();

    expect(screen.getByText('2x')).toBeInTheDocument();
    expect(screen.getByText('1x')).toBeInTheDocument();
  });

  it('displays user-friendly error screen with retry button when loading fails', async () => {
    vi.mocked(pedidoService.getOrder).mockRejectedValue(new Error('Network error'));
    vi.mocked(pedidoService.getOrderDetails).mockRejectedValue(new Error('Network error'));

    render(
      <MemoryRouter initialEntries={['/pedidos/99']}>
        <ToastProvider>
          <Routes>
            <Route path="/pedidos/:id" element={<OrderDetailPage />} />
          </Routes>
        </ToastProvider>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('No pudimos cargar los detalles del pedido.')).toBeInTheDocument();
    });

    const retryButton = screen.getByRole('button', { name: 'Reintentar' });
    expect(retryButton).toBeInTheDocument();
    expect(screen.getByText('Volver a mis pedidos')).toBeInTheDocument();

    vi.mocked(pedidoService.getOrder).mockResolvedValue(mockOrder as any);
    vi.mocked(pedidoService.getOrderDetails).mockResolvedValue(mockDetails as any);

    fireEvent.click(retryButton);

    await waitFor(() => {
      expect(screen.getByText('Pedido #20')).toBeInTheDocument();
    });
  });

  it('renders gracefully without crashing when tracking data has null latitud/longitud (e.g. Pedido #33)', async () => {
    vi.mocked(pedidoService.getOrder).mockResolvedValue(mockOrder as any);
    vi.mocked(pedidoService.getOrderDetails).mockResolvedValue(mockDetails as any);
    vi.mocked(trackingService.obtenerUltimaUbicacion).mockResolvedValue({
      id: null,
      pedidoId: 33,
      domiciliarioId: 3,
      estadoPedido: 'EN_CAMINO',
      activo: true,
      latitud: null,
      longitud: null,
      precision: null,
      velocidad: null,
      rumbo: null,
      fechaHora: null,
      actualizadoEn: null,
    } as any);

    render(
      <MemoryRouter initialEntries={['/pedidos/33']}>
        <ToastProvider>
          <Routes>
            <Route path="/pedidos/:id" element={<OrderDetailPage />} />
          </Routes>
        </ToastProvider>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Pedido #20')).toBeInTheDocument();
      expect(screen.getByText(/Esperando primera transmisión de coordenadas/i)).toBeInTheDocument();
    });
  });
});
