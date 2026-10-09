import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AdminCommercesPage } from '../pages/admin/AdminCommercesPage';
import { adminService } from '../services/adminService';
import { geografiaService } from '../services/geografiaService';
import { ToastProvider } from '../context/ToastContext';

vi.mock('../services/adminService');
vi.mock('../services/geografiaService');

const mockStores = [
  {
    id: 10,
    nombre: 'Pizzeria Bella Napoli',
    descripcion: 'Pizzas artesanales al horno de leña',
    telefono: '3001234567',
    esPrincipal: true,
    estado: 'ACTIVA',
    activo: true,
    fechaCreacion: '2026-09-01T10:00:00',
    destacado: true,
    usuarioId: 5,
    propietarioNombre: 'Mario Rossi',
    propietarioCorreo: 'mario@pizzeria.com',
    propietarioTelefono: '3001234567',
    direccion: 'Calle 10 # 5-20',
    ciudad: 'Bogotá',
    departamentoId: '11',
    departamentoNombre: 'Bogotá D.C.',
    municipioId: '11001',
    municipioNombre: 'Bogotá',
    totalSucursales: 2,
    totalProductos: 15,
    totalPedidos: 42,
    pedidosActivos: 3,
    tipoPlan: 'TIENDA_PRINCIPAL',
    estadoSuscripcion: 'ACTIVA',
    fechaVencimiento: '2026-12-31T23:59:59',
  },
  {
    id: 11,
    nombre: 'Burger King Express',
    descripcion: 'Hamburguesas rápidas',
    telefono: '3009876543',
    esPrincipal: false,
    estado: 'DESACTIVADA',
    activo: false,
    fechaCreacion: '2026-09-10T15:30:00',
    destacado: false,
    usuarioId: 6,
    propietarioNombre: 'Carlos Gómez',
    propietarioCorreo: 'carlos@burgers.com',
    propietarioTelefono: '3009876543',
    direccion: 'Carrera 7 # 45-10',
    ciudad: 'Medellín',
    totalSucursales: 1,
    totalProductos: 8,
    totalPedidos: 12,
    pedidosActivos: 0,
    tipoPlan: 'TIENDA_ADICIONAL',
    estadoSuscripcion: 'INACTIVA',
  },
];

describe('AdminCommercesPage Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(adminService.listStores).mockResolvedValue(mockStores as any);
    vi.mocked(adminService.getSubscriptionConfig).mockResolvedValue({
      freePrimaryStores: 1,
      primaryFreePeriodMonths: 6,
      primaryMonthlyPrice: 20000,
      additionalStoreActivationPrice: 50000,
      additionalStoreMonthlyPrice: 30000,
      allowNewStores: true,
    } as any);
    vi.mocked(adminService.listAuditLogs).mockResolvedValue([]);
    vi.mocked(adminService.listPendingSubscriptions).mockResolvedValue([]);
    vi.mocked(geografiaService.getDepartamentos).mockResolvedValue([]);
  });

  it('renders stores list with names, status badges, and action buttons', async () => {
    render(
      <ToastProvider>
        <MemoryRouter>
          <AdminCommercesPage />
        </MemoryRouter>
      </ToastProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Pizzeria Bella Napoli')).toBeInTheDocument();
      expect(screen.getByText('Burger King Express')).toBeInTheDocument();
    });

    // Check status badges
    expect(screen.getByText('ACTIVA')).toBeInTheDocument();
    expect(screen.getByText('DESACTIVADA')).toBeInTheDocument();

    // Check detail buttons
    const detailButtons = screen.getAllByText('Ver Detalle');
    expect(detailButtons.length).toBe(2);

    // Active store has Suspender and Desactivar buttons
    expect(screen.getByText('Suspender')).toBeInTheDocument();
    // Inactive store has Activar button
    expect(screen.getByText('Activar Tienda')).toBeInTheDocument();
  });

  it('opens store detail modal when clicking Ver Detalle', async () => {
    render(
      <ToastProvider>
        <MemoryRouter>
          <AdminCommercesPage />
        </MemoryRouter>
      </ToastProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Pizzeria Bella Napoli')).toBeInTheDocument();
    });

    const detailButtons = screen.getAllByText('Ver Detalle');
    fireEvent.click(detailButtons[0]);

    // Modal title should appear
    await waitFor(() => {
      expect(screen.getByText('Detalle de Tienda: Pizzeria Bella Napoli')).toBeInTheDocument();
    });

    // Modal content checks
    expect(screen.getAllByText('Mario Rossi').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('mario@pizzeria.com').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('Operaciones y Catálogo')).toBeInTheDocument();
    expect(screen.getByText('Cerrar')).toBeInTheDocument();

    // Close modal
    fireEvent.click(screen.getByText('Cerrar'));
    await waitFor(() => {
      expect(screen.queryByText('Detalle de Tienda: Pizzeria Bella Napoli')).not.toBeInTheDocument();
    });
  });

  it('opens confirmation modal with reason input when executing an action', async () => {
    render(
      <ToastProvider>
        <MemoryRouter>
          <AdminCommercesPage />
        </MemoryRouter>
      </ToastProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Pizzeria Bella Napoli')).toBeInTheDocument();
    });

    // Click Suspender on active store
    const suspenderBtn = screen.getByText('Suspender');
    fireEvent.click(suspenderBtn);

    // Confirmation modal should appear
    await waitFor(() => {
      expect(screen.getByText(/Confirmar Acción Administrativa: SUSPENDER/i)).toBeInTheDocument();
    });

    expect(screen.getByPlaceholderText(/Ej. Pago verificado \/ Suspensión por mora \/ Reactivación.../i)).toBeInTheDocument();
    expect(screen.getByText('Confirmar suspender')).toBeInTheDocument();
  });
});
