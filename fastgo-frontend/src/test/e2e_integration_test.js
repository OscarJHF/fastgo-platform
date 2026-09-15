/**
 * FASTGO E2E INTEGRATION TEST SUITE
 * Tests the real frontend API contract against the live backend (http://localhost:8080)
 * Validates the full 10-step lifecycle requested in Phase 37
 */

const BASE_URL = process.env.VITE_API_URL || 'http://localhost:8080';

async function request(path, options = {}) {
  const url = `${BASE_URL}${path}`;
  const headers = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    ...(options.headers || {}),
  };

  const response = await fetch(url, {
    ...options,
    headers,
  });

  const text = await response.text();
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    data = text;
  }

  return {
    status: response.status,
    ok: response.ok,
    data,
  };
}

async function runE2ESuite() {
  console.log('====================================================');
  console.log('FASTGO E2E LIVE INTEGRATION VALIDATION');
  console.log(`Target Backend: ${BASE_URL}`);
  console.log('====================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`  ✓ PASS: ${message}`);
      passed++;
    } else {
      console.error(`  ✗ FAIL: ${message}`);
      failed++;
    }
  }

  try {
    // ----------------------------------------------------
    // FLOW 1: Multi-role Authentication
    // ----------------------------------------------------
    console.log('[FLOW 1] Multi-role Authentication (CLIENTE, COMERCIO, DOMICILIARIO, ADMIN)');
    
    // Login Cliente
    const loginCliente = await request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ correo: 'cliente@fastgo.com', password: 'ClientePassword123!' }),
    });
    assert(loginCliente.status === 200 && loginCliente.data.token, 'Cliente login succeeds and yields JWT');
    const tokenCliente = loginCliente.data.token;

    // Login Comercio
    const loginComercio = await request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ correo: 'comercio@fastgo.com', password: 'ComercioPassword123!' }),
    });
    assert(loginComercio.status === 200 && loginComercio.data.token, 'Comercio login succeeds and yields JWT');
    const tokenComercio = loginComercio.data.token;

    // Login Domiciliario
    const loginDom = await request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ correo: 'domiciliario@fastgo.com', password: 'DomiciliarioPassword123!' }),
    });
    assert(loginDom.status === 200 && loginDom.data.token, 'Domiciliario login succeeds and yields JWT');
    const tokenDom = loginDom.data.token;

    // Login Admin
    const loginAdmin = await request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ correo: 'admin@fastgo.com', password: 'AdminPassword123!' }),
    });
    assert(loginAdmin.status === 200 && loginAdmin.data.token, 'Admin login succeeds and yields JWT');
    const tokenAdmin = loginAdmin.data.token;

    // ----------------------------------------------------
    // FLOW 2: Cliente Entra y Verifica Perfil
    // ----------------------------------------------------
    console.log('\n[FLOW 2] Cliente Session & Profile Verification');
    const meRes = await request('/api/usuarios/me', {
      headers: { Authorization: `Bearer ${tokenCliente}` },
    });
    assert(meRes.status === 200 && meRes.data.rol === 'CLIENTE', 'Cliente profile verified via GET /api/usuarios/me');

    // ----------------------------------------------------
    // FLOW 3: Cliente Busca Comercio y Sucursal
    // ----------------------------------------------------
    console.log('\n[FLOW 3] Cliente Discovery (Comercios & Sucursales)');
    const commercesRes = await request('/api/comercios');
    assert(commercesRes.status === 200 && Array.isArray(commercesRes.data) && commercesRes.data.length > 0, 'Commerces listed');
    const targetCommerce = commercesRes.data[0];

    const branchesRes = await request(`/api/sucursales/comercio/${targetCommerce.id}`);
    assert(branchesRes.status === 200 && Array.isArray(branchesRes.data) && branchesRes.data.length > 0, 'Branches listed for commerce');
    const targetBranch = branchesRes.data[0];

    // ----------------------------------------------------
    // FLOW 4: Cliente Agrega Producto al Carrito
    // ----------------------------------------------------
    console.log('\n[FLOW 4] Cliente Adds Product to Cart');
    const productsRes = await request(`/api/productos/sucursal/${targetBranch.id}`);
    assert(productsRes.status === 200 && Array.isArray(productsRes.data) && productsRes.data.length > 0, 'Products listed for branch');
    const targetProduct = productsRes.data[0];

    const cartRes = await request(`/api/carritos?sucursalId=${targetBranch.id}`, {
      headers: { Authorization: `Bearer ${tokenCliente}` },
    });
    assert(cartRes.status === 200 && cartRes.data.id, 'Cart retrieved or created for branch');
    const cartId = cartRes.data.id;

    // Vaciar carrito previo si existe para asegurar estado limpio
    await request(`/api/carritos/${cartId}/productos`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${tokenCliente}` },
    });

    const addProductRes = await request('/api/carritos/productos', {
      method: 'POST',
      headers: { Authorization: `Bearer ${tokenCliente}` },
      body: JSON.stringify({
        carritoId: cartId,
        productoId: targetProduct.id,
        cantidad: 2,
      }),
    });
    assert(addProductRes.status === 200 && addProductRes.data.cantidad === 2, 'Product added to cart with quantity 2');

    // ----------------------------------------------------
    // FLOW 5: Cliente Abre y Revisa Carrito
    // ----------------------------------------------------
    console.log('\n[FLOW 5] Cliente Inspects Cart Details');
    const cartItemsRes = await request(`/api/carritos/${cartId}/productos`, {
      headers: { Authorization: `Bearer ${tokenCliente}` },
    });
    assert(cartItemsRes.status === 200 && Array.isArray(cartItemsRes.data) && cartItemsRes.data.length > 0, 'Cart details verified');

    // ----------------------------------------------------
    // FLOW 6: Cliente Crea Pedido Autoritativo
    // ----------------------------------------------------
    console.log('\n[FLOW 6] Cliente Creates Authoritative Order');
    // Asegurar dirección de entrega
    let addressesRes = await request('/api/direcciones', {
      headers: { Authorization: `Bearer ${tokenCliente}` },
    });
    let addressId;
    if (addressesRes.data && addressesRes.data.length > 0) {
      addressId = addressesRes.data[0].id;
    } else {
      const newAddr = await request('/api/direcciones', {
        method: 'POST',
        headers: { Authorization: `Bearer ${tokenCliente}` },
        body: JSON.stringify({
          alias: 'Casa',
          direccion: 'Calle 100 # 15-20',
          ciudad: 'Bogotá',
          departamento: 'Cundinamarca',
          codigoPostal: '110111',
          latitud: 4.6854,
          longitud: -74.0531,
          principal: true,
        }),
      });
      addressId = newAddr.data.id;
    }
    assert(addressId > 0, 'Delivery address verified');

    const createOrderRes = await request(
      `/api/pedidos?carritoId=${cartId}&direccionId=${addressId}&observaciones=E2E+Automated+Flow`,
      {
        method: 'POST',
        headers: { Authorization: `Bearer ${tokenCliente}` },
      }
    );
    assert(createOrderRes.status === 200 && createOrderRes.data.id && createOrderRes.data.estado === 'PENDIENTE', 'Order created in state PENDIENTE with authoritative total');
    const createdOrderId = createOrderRes.data.id;

    // ----------------------------------------------------
    // FLOW 7: Comercio Consulta Pedido
    // ----------------------------------------------------
    console.log('\n[FLOW 7] Comercio Inspects Pending Order');
    const commerceOrdersRes = await request(`/api/pedidos/sucursal/${targetBranch.id}`, {
      headers: { Authorization: `Bearer ${tokenComercio}` },
    });
    assert(
      commerceOrdersRes.status === 200 &&
      Array.isArray(commerceOrdersRes.data) &&
      commerceOrdersRes.data.some((o) => o.id === createdOrderId),
      'Order visible to assigned Comercio branch'
    );

    // ----------------------------------------------------
    // FLOW 8: Comercio Ejecuta Máquina de Estados
    // ----------------------------------------------------
    console.log('\n[FLOW 8] Comercio Progresses Order State Machine');
    // PENDIENTE -> CONFIRMADO
    const confirmRes = await request(`/api/pedidos/${createdOrderId}/confirmar`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${tokenComercio}` },
    });
    assert(confirmRes.status === 200 && confirmRes.data.estado === 'CONFIRMADO', 'State transition: PENDIENTE -> CONFIRMADO');

    // CONFIRMADO -> EN_PREPARACION
    const prepareRes = await request(`/api/pedidos/${createdOrderId}/preparar`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${tokenComercio}` },
    });
    assert(prepareRes.status === 200 && (prepareRes.data.estado === 'PREPARANDO' || prepareRes.data.estado === 'EN_PREPARACION'), 'State transition: CONFIRMADO -> PREPARANDO');

    // EN_PREPARACION -> LISTO_PARA_ENTREGA
    const readyRes = await request(`/api/pedidos/${createdOrderId}/listo`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${tokenComercio}` },
    });
    assert(readyRes.status === 200 && (readyRes.data.estado === 'LISTO' || readyRes.data.estado === 'LISTO_PARA_ENTREGA'), 'State transition: PREPARANDO -> LISTO');

    // ----------------------------------------------------
    // FLOW 9: Domiciliario Toma Pedido y Sale en Ruta
    // ----------------------------------------------------
    console.log('\n[FLOW 9] Domiciliario Claims Order & Departs on Delivery');
    const poolRes = await request('/api/pedidos/domiciliario/disponibles', {
      headers: { Authorization: `Bearer ${tokenDom}` },
    });
    assert(
      poolRes.status === 200 &&
      Array.isArray(poolRes.data) &&
      poolRes.data.some((o) => o.id === createdOrderId),
      'Order present in Domiciliario available pool'
    );

    const claimRes = await request(`/api/pedidos/${createdOrderId}/tomar`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${tokenDom}` },
    });
    assert(claimRes.status === 200 && claimRes.data.domiciliarioId, 'Order claimed atomically by Domiciliario');

    const transitRes = await request(`/api/pedidos/${createdOrderId}/en-camino`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${tokenDom}` },
    });
    assert(transitRes.status === 200 && transitRes.data.estado === 'EN_CAMINO', 'State transition: LISTO_PARA_ENTREGA -> EN_CAMINO');

    // ----------------------------------------------------
    // FLOW 10: Domiciliario Entrega Pedido
    // ----------------------------------------------------
    console.log('\n[FLOW 10] Domiciliario Completes Final Delivery');
    const deliverRes = await request(`/api/pedidos/${createdOrderId}/entregar`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${tokenDom}` },
    });
    assert(deliverRes.status === 200 && deliverRes.data.estado === 'ENTREGADO', 'State transition: EN_CAMINO -> ENTREGADO');

    // Cliente consulta pedido final
    const finalClientCheck = await request(`/api/pedidos/${createdOrderId}`, {
      headers: { Authorization: `Bearer ${tokenCliente}` },
    });
    assert(finalClientCheck.status === 200 && finalClientCheck.data.estado === 'ENTREGADO', 'Cliente verifies final state is ENTREGADO');

    // ----------------------------------------------------
    // Summary
    // ----------------------------------------------------
    console.log('\n====================================================');
    console.log(`E2E SUMMARY: ${passed} PASSED, ${failed} FAILED`);
    console.log('====================================================');

    if (failed > 0) {
      process.exit(1);
    } else {
      process.exit(0);
    }
  } catch (err) {
    console.error('Fatal E2E error:', err);
    process.exit(1);
  }
}

runE2ESuite();
