export const APP_ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/registro',
  COMMERCE_DETAIL: '/comercio/:id',
  CART: '/carrito',
  CHECKOUT: '/checkout',
  ADDRESSES: '/direcciones',
  MY_ORDERS: '/mis-pedidos',
  ORDER_DETAIL: '/pedidos/:id',
  PROFILE: '/perfil',
  ENCOMIENDAS: '/encomiendas',

  // Comercio
  COMMERCE_DASHBOARD: '/comercio-panel',
  COMMERCE_PRODUCTS: '/comercio-panel/productos',
  COMMERCE_ORDERS: '/comercio-panel/pedidos',
  COMMERCE_BRANCHES: '/comercio-panel/sucursales',

  // Domiciliario
  DELIVERY_DASHBOARD: '/domiciliario-panel',
  DELIVERY_ACTIVE_ORDERS: '/domiciliario-panel/en-curso',

  // Admin
  ADMIN_DASHBOARD: '/admin-panel',
  ADMIN_USERS: '/admin-panel/usuarios',
  ADMIN_CATEGORIES: '/admin-panel/categorias',
  ADMIN_COMMERCES: '/admin-panel/comercios',
} as const;
