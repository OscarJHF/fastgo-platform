import { OrderStatus } from '../types';

export interface OrderStatusMeta {
  label: string;
  badgeClass: string;
  color: string;
  description: string;
}

export const ORDER_STATUS_DETAILS: Record<string, OrderStatusMeta> = {
  PENDIENTE: {
    label: 'Pendiente',
    badgeClass: 'bg-amber-100 text-amber-800 border-amber-300',
    color: '#D97706',
    description: 'El pedido fue recibido y está a la espera de confirmación por el comercio.',
  },
  CONFIRMADO: {
    label: 'Confirmado',
    badgeClass: 'bg-blue-100 text-blue-800 border-blue-300',
    color: '#2563EB',
    description: 'El comercio ha confirmado el pedido y pronto iniciará su preparación.',
  },
  PREPARANDO: {
    label: 'En Preparación',
    badgeClass: 'bg-purple-100 text-purple-800 border-purple-300',
    color: '#7C3AED',
    description: 'El comercio está preparando los productos de tu pedido.',
  },
  EN_PREPARACION: {
    label: 'En Preparación',
    badgeClass: 'bg-purple-100 text-purple-800 border-purple-300',
    color: '#7C3AED',
    description: 'El comercio está preparando los productos de tu pedido.',
  },
  LISTO: {
    label: 'Listo para Recogida',
    badgeClass: 'bg-indigo-100 text-indigo-800 border-indigo-300',
    color: '#4F46E5',
    description: 'El pedido está empacado esperando ser recogido por un domiciliario.',
  },
  LISTO_PARA_ENTREGA: {
    label: 'Listo para Entrega',
    badgeClass: 'bg-indigo-100 text-indigo-800 border-indigo-300',
    color: '#4F46E5',
    description: 'El pedido está empacado esperando ser recogido por un domiciliario.',
  },
  EN_CAMINO: {
    label: 'En Camino',
    badgeClass: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    color: '#CA8A04',
    description: 'El domiciliario va en camino hacia la dirección de entrega.',
  },
  ENTREGADO: {
    label: 'Entregado',
    badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    color: '#059669',
    description: 'El pedido fue entregado con éxito al cliente.',
  },
  CANCELADO: {
    label: 'Cancelado',
    badgeClass: 'bg-rose-100 text-rose-800 border-rose-300',
    color: '#E11D48',
    description: 'El pedido fue cancelado.',
  },
};
