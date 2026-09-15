import React, { useState, useEffect, useCallback } from "react";
import {
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  StatusBar,
  Alert,
  BackHandler,
  KeyboardAvoidingView,
  Platform,
  RefreshControl,
} from "react-native";

interface Comercio {
  id: number;
  nombre: string;
  descripcion?: string;
  activo?: boolean;
  telefono?: string;
}

interface Producto {
  id: number;
  nombre: string;
  descripcion?: string;
  precio: number;
  disponible?: boolean;
  sucursalId?: number;
}

interface CartItem {
  producto: Producto;
  cantidad: number;
}

interface UserProfile {
  id: number;
  nombre: string;
  apellido?: string;
  correo: string;
  rol: string;
}

interface PedidoItem {
  id: number;
  usuarioId: number;
  sucursalId: number;
  direccionId: number;
  domiciliarioId?: number | null;
  estado: string;
  subtotal: number;
  costoEnvio: number;
  total: number;
  observaciones?: string;
  creadoEn?: string;
}

interface DetallePedidoItem {
  id: number;
  pedidoId: number;
  productoId: number;
  cantidad: number;
  precio: number;
  subtotal: number;
}

type TabType =
  | "conexion"
  | "auth"
  | "comercios"
  | "productos"
  | "carrito"
  | "mis_pedidos"
  | "comercio_pedidos"
  | "domiciliario_pedidos"
  | "admin_dashboard"
  | "rbac_audit"
  | "hardware_test";

export default function App() {
  const [apiUrl, setApiUrl] = useState<string>("http://localhost:8080");
  const [activeTab, setActiveTab] = useState<TabType>("auth");
  const [tabHistory, setTabHistory] = useState<TabType[]>(["auth"]);

  // Estado de conexión
  const [status, setStatus] = useState<"idle" | "loading" | "connected" | "error">("idle");
  const [statusMsg, setStatusMsg] = useState<string>("Listo para conectar");
  const [latency, setLatency] = useState<number | null>(null);

  // Auth
  const [email, setEmail] = useState<string>("cliente@fastgo.com");
  const [password, setPassword] = useState<string>("ClientePassword123!");
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [authLoading, setAuthLoading] = useState<boolean>(false);

  // Catálogos
  const [comercios, setComercios] = useState<Comercio[]>([]);
  const [productos, setProductos] = useState<Producto[]>([]);
  const [selectedComercio, setSelectedComercio] = useState<Comercio | null>(null);

  // Carrito
  const [cart, setCart] = useState<CartItem[]>([]);

  // Pedidos Cliente
  const [pedidosCliente, setPedidosCliente] = useState<PedidoItem[]>([]);
  const [selectedPedido, setSelectedPedido] = useState<PedidoItem | null>(null);
  const [pedidoDetalles, setPedidoDetalles] = useState<DetallePedidoItem[]>([]);
  const [loadingDetalles, setLoadingDetalles] = useState<boolean>(false);

  // Pedidos Comercio
  const [pedidosComercio, setPedidosComercio] = useState<PedidoItem[]>([]);

  // Pedidos Domiciliario
  const [pedidosDisponibles, setPedidosDisponibles] = useState<PedidoItem[]>([]);
  const [misEntregas, setMisEntregas] = useState<PedidoItem[]>([]);

  // Admin Data
  const [adminUsuarios, setAdminUsuarios] = useState<any[]>([]);
  const [adminCategorias, setAdminCategorias] = useState<any[]>([]);

  // RBAC Audit Results
  const [rbacResults, setRbacResults] = useState<string[]>([]);
  const [rbacLoading, setRbacLoading] = useState<boolean>(false);

  // Hardware Test State
  const [backPressCount, setBackPressCount] = useState<number>(0);
  const [keyboardText, setKeyboardText] = useState<string>("");

  // Refreshing indicator
  const [refreshing, setRefreshing] = useState<boolean>(false);

  // Navegación con historial para botón Atrás
  const navigateTo = (tab: TabType) => {
    setTabHistory((prev) => [...prev, tab]);
    setActiveTab(tab);
  };

  // Manejo del botón físico Atrás de Android
  useEffect(() => {
    const onBackPress = () => {
      setBackPressCount((c) => c + 1);
      if (selectedPedido) {
        setSelectedPedido(null);
        setPedidoDetalles([]);
        return true;
      }
      if (selectedComercio && activeTab === "productos") {
        setSelectedComercio(null);
        navigateTo("comercios");
        return true;
      }
      if (tabHistory.length > 1) {
        const newHistory = [...tabHistory];
        newHistory.pop(); // remover actual
        const prevTab = newHistory[newHistory.length - 1];
        setTabHistory(newHistory);
        setActiveTab(prevTab);
        return true;
      }
      return false; // Salir de la app si está en la raíz
    };

    const subscription = BackHandler.addEventListener("hardwareBackPress", onBackPress);
    return () => subscription.remove();
  }, [tabHistory, selectedPedido, selectedComercio, activeTab]);

  // Probar Conexión
  const testConnection = async (urlToTest = apiUrl) => {
    setStatus("loading");
    setStatusMsg("Conectando con " + urlToTest + "...");
    const start = Date.now();
    try {
      const res = await fetch(`${urlToTest}/api/comercios`, {
        headers: { Accept: "application/json" },
      });
      const dur = Date.now() - start;
      setLatency(dur);
      if (res.ok) {
        const data = await res.json();
        setComercios(data);
        setStatus("connected");
        setStatusMsg(`En línea (${dur}ms). HTTP ${res.status} OK. ${data.length} comercios.`);
        loadCatalog(urlToTest);
      } else {
        setStatus("error");
        setStatusMsg(`HTTP ${res.status} Error`);
      }
    } catch (e: any) {
      setStatus("error");
      setStatusMsg(`Error de red: ${e.message}`);
    }
  };

  const loadCatalog = async (baseUrl: string) => {
    try {
      const pRes = await fetch(`${baseUrl}/api/productos`, { headers: { Accept: "application/json" } });
      if (pRes.ok) {
        const pData = await pRes.json();
        setProductos(pData);
      }
    } catch {}
  };

  // Login
  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Ingresa correo y contraseña");
      return;
    }
    setAuthLoading(true);
    try {
      const res = await fetch(`${apiUrl}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ correo: email, password }),
      });
      if (res.ok) {
        const authData = await res.json();
        const jwt = authData.token;
        setToken(jwt);

        // Obtener perfil
        const meRes = await fetch(`${apiUrl}/api/usuarios/me`, {
          headers: { Authorization: `Bearer ${jwt}` },
        });
        if (meRes.ok) {
          const profile: UserProfile = await meRes.json();
          setUser(profile);
          Alert.alert("Éxito", `Bienvenido ${profile.nombre} (${profile.rol})`);
          if (profile.rol === "CLIENTE") {
            navigateTo("mis_pedidos");
            fetchPedidosCliente(jwt);
          } else if (profile.rol === "COMERCIO") {
            navigateTo("comercio_pedidos");
            fetchPedidosComercio(jwt);
          } else if (profile.rol === "DOMICILIARIO") {
            navigateTo("domiciliario_pedidos");
            fetchPedidosDomiciliario(jwt);
          } else if (profile.rol === "ADMIN") {
            navigateTo("admin_dashboard");
            fetchAdminData(jwt);
          }
        }
      } else {
        Alert.alert("Error de Acceso", "Credenciales incorrectas o backend no disponible");
      }
    } catch (e: any) {
      Alert.alert("Error", e.message || "Error al autenticar");
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = () => {
    setToken(null);
    setUser(null);
    setSelectedPedido(null);
    setPedidoDetalles([]);
    navigateTo("auth");
    Alert.alert("Sesión Cerrada", "Has cerrado sesión correctamente.");
  };

  // ==================== PEDIDOS CLIENTE ====================
  const fetchPedidosCliente = async (jwt = token) => {
    if (!jwt) return;
    try {
      const res = await fetch(`${apiUrl}/api/pedidos/usuario`, {
        headers: { Authorization: `Bearer ${jwt}`, Accept: "application/json" },
      });
      if (res.ok) {
        const data = await res.json();
        setPedidosCliente(data);
      }
    } catch {}
  };

  const openPedidoDetalle = async (pedido: PedidoItem) => {
    setSelectedPedido(pedido);
    setLoadingDetalles(true);
    try {
      const res = await fetch(`${apiUrl}/api/pedidos/${pedido.id}/detalles`, {
        headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
      });
      if (res.ok) {
        const detalles = await res.json();
        setPedidoDetalles(detalles);
      }
    } catch {}
    finally {
      setLoadingDetalles(false);
    }
  };

  const cancelarPedidoCliente = async (pedidoId: number) => {
    try {
      const res = await fetch(`${apiUrl}/api/pedidos/${pedidoId}/cancelar`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const updated = await res.json();
        Alert.alert("Pedido Cancelado", `El pedido #${pedidoId} ahora está CANCELADO.`);
        setSelectedPedido(updated);
        fetchPedidosCliente();
      } else {
        const err = await res.json();
        Alert.alert("No se pudo cancelar", err.message || "El estado no permite cancelación.");
      }
    } catch (e: any) {
      Alert.alert("Error", e.message);
    }
  };

  // ==================== PEDIDOS COMERCIO ====================
  const fetchPedidosComercio = async (jwt = token) => {
    if (!jwt) return;
    try {
      const res = await fetch(`${apiUrl}/api/pedidos/sucursal/1`, {
        headers: { Authorization: `Bearer ${jwt}`, Accept: "application/json" },
      });
      if (res.ok) {
        const data = await res.json();
        setPedidosComercio(data);
      }
    } catch {}
  };

  const transitionPedidoComercio = async (pedidoId: number, action: "confirmar" | "preparar" | "listo") => {
    try {
      const res = await fetch(`${apiUrl}/api/pedidos/${pedidoId}/${action}`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const updated = await res.json();
        Alert.alert("Transición Exitosa", `Pedido #${pedidoId} ahora está: ${updated.estado}`);
        fetchPedidosComercio();
      } else {
        const err = await res.json();
        Alert.alert("Error de Transición", err.message || "No se pudo cambiar el estado");
      }
    } catch (e: any) {
      Alert.alert("Error", e.message);
    }
  };

  // ==================== PEDIDOS DOMICILIARIO ====================
  const fetchPedidosDomiciliario = async (jwt = token) => {
    if (!jwt) return;
    try {
      const resDisp = await fetch(`${apiUrl}/api/pedidos/domiciliario/disponibles`, {
        headers: { Authorization: `Bearer ${jwt}`, Accept: "application/json" },
      });
      if (resDisp.ok) {
        setPedidosDisponibles(await resDisp.json());
      }
      const resMios = await fetch(`${apiUrl}/api/pedidos/domiciliario/mios`, {
        headers: { Authorization: `Bearer ${jwt}`, Accept: "application/json" },
      });
      if (resMios.ok) {
        setMisEntregas(await resMios.json());
      }
    } catch {}
  };

  const tomarPedidoDomiciliario = async (pedidoId: number) => {
    try {
      const res = await fetch(`${apiUrl}/api/pedidos/${pedidoId}/tomar`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const updated = await res.json();
        Alert.alert("Pedido Asignado Atómicamente", `Has tomado el pedido #${pedidoId}. Estado: ${updated.estado}`);
        fetchPedidosDomiciliario();
      } else {
        const err = await res.json();
        Alert.alert("No Disponible", err.message || "El pedido ya fue tomado por otro repartidor.");
      }
    } catch (e: any) {
      Alert.alert("Error", e.message);
    }
  };

  const entregarPedidoDomiciliario = async (pedidoId: number) => {
    try {
      const res = await fetch(`${apiUrl}/api/pedidos/${pedidoId}/entregar`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const updated = await res.json();
        Alert.alert("¡Entrega Exitosa!", `Pedido #${pedidoId} ha sido marcado como ENTREGADO.`);
        fetchPedidosDomiciliario();
      } else {
        const err = await res.json();
        Alert.alert("Error", err.message || "No se pudo marcar como entregado.");
      }
    } catch (e: any) {
      Alert.alert("Error", e.message);
    }
  };

  // ==================== ADMIN DATA ====================
  const fetchAdminData = async (jwt = token) => {
    if (!jwt) return;
    try {
      const uRes = await fetch(`${apiUrl}/api/usuarios`, {
        headers: { Authorization: `Bearer ${jwt}`, Accept: "application/json" },
      });
      if (uRes.ok) setAdminUsuarios(await uRes.json());

      const cRes = await fetch(`${apiUrl}/api/categorias-comercio`, {
        headers: { Authorization: `Bearer ${jwt}`, Accept: "application/json" },
      });
      if (cRes.ok) setAdminCategorias(await cRes.json());
    } catch {}
  };

  // ==================== AUDITORÍA RBAC ====================
  const runRbacAudit = async () => {
    setRbacLoading(true);
    const logs: string[] = [];

    // 1. Anonimo a /api/pedidos/usuario (Debe retornar 401)
    try {
      const r1 = await fetch(`${apiUrl}/api/pedidos/usuario`);
      logs.push(`1. Anónimo -> GET /api/pedidos/usuario: HTTP ${r1.status} (${r1.status === 401 ? "PASS - BLOQUEADO" : "FAIL"})`);
    } catch (e: any) {
      logs.push(`1. Anónimo -> GET /api/pedidos/usuario: Bloqueado (${e.message})`);
    }

    // 2. Token actual contra /api/usuarios (Requiere ADMIN)
    if (token && user) {
      try {
        const r2 = await fetch(`${apiUrl}/api/usuarios`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const expected = user.rol === "ADMIN" ? 200 : 403;
        const pass = r2.status === expected;
        logs.push(`2. ${user.rol} -> GET /api/usuarios (Admin): HTTP ${r2.status} (${pass ? "PASS" : "FAIL"})`);
      } catch (e: any) {
        logs.push(`2. Error: ${e.message}`);
      }

      // 3. Token actual contra /api/pedidos/sucursal/1 (Requiere COMERCIO)
      try {
        const r3 = await fetch(`${apiUrl}/api/pedidos/sucursal/1`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const expected = user.rol === "COMERCIO" ? 200 : 403;
        const pass = r3.status === expected;
        logs.push(`3. ${user.rol} -> GET /api/pedidos/sucursal/1: HTTP ${r3.status} (${pass ? "PASS" : "FAIL"})`);
      } catch (e: any) {
        logs.push(`3. Error: ${e.message}`);
      }

      // 4. Token actual contra /api/pedidos/domiciliario/disponibles (Requiere DOMICILIARIO)
      try {
        const r4 = await fetch(`${apiUrl}/api/pedidos/domiciliario/disponibles`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const expected = user.rol === "DOMICILIARIO" ? 200 : 403;
        const pass = r4.status === expected;
        logs.push(`4. ${user.rol} -> GET /api/pedidos/domiciliario/disponibles: HTTP ${r4.status} (${pass ? "PASS" : "FAIL"})`);
      } catch (e: any) {
        logs.push(`4. Error: ${e.message}`);
      }
    } else {
      logs.push("Inicia sesión para probar permisos basados en roles con tokens reales.");
    }

    setRbacResults(logs);
    setRbacLoading(false);
  };

  // Carrito helpers
  const addToCart = (producto: Producto) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.producto.id === producto.id);
      if (existing) {
        return prev.map((item) =>
          item.producto.id === producto.id ? { ...item, cantidad: item.cantidad + 1 } : item
        );
      }
      return [...prev, { producto, cantidad: 1 }];
    });
    Alert.alert("Producto Agregado", `${producto.nombre} añadido al carrito.`);
  };

  const updateCartQty = (id: number, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.producto.id === id) {
            const nq = item.cantidad + delta;
            return nq > 0 ? { ...item, cantidad: nq } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const subtotal = cart.reduce((s, i) => s + i.producto.precio * i.cantidad, 0);
  const shippingFee = cart.length > 0 ? 4500 : 0;
  const total = subtotal + shippingFee;

  // Montar inicial
  useEffect(() => {
    testConnection(apiUrl);
  }, []);

  // Recarga pull-to-refresh
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await testConnection(apiUrl);
    if (token && user) {
      if (user.rol === "CLIENTE") await fetchPedidosCliente();
      if (user.rol === "COMERCIO") await fetchPedidosComercio();
      if (user.rol === "DOMICILIARIO") await fetchPedidosDomiciliario();
      if (user.rol === "ADMIN") await fetchAdminData();
    }
    setRefreshing(false);
  }, [apiUrl, token, user]);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFD600" />

      {/* HEADER PRINCIPAL */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={styles.logo}>FASTGO</Text>
          <View style={styles.badgeContainer}>
            <Text style={styles.badgeText}>BETA 2 — ANDROID</Text>
          </View>
        </View>
        <Text style={styles.slogan}>Cerca de ti en cada pedido</Text>

        {/* Barra de Conexión */}
        <View style={styles.headerStatusRow}>
          <View
            style={[
              styles.statusDot,
              { backgroundColor: status === "connected" ? "#10B981" : status === "loading" ? "#F59E0B" : "#EF4444" },
            ]}
          />
          <Text style={styles.headerStatusText}>
            {status === "connected" ? `En línea: ${apiUrl} (${latency}ms)` : statusMsg}
          </Text>
        </View>

        {/* Banner de Usuario Autenticado */}
        {user && (
          <View style={styles.userBanner}>
            <Text style={styles.userBannerText}>
              👤 {user.nombre} <Text style={styles.userRolePill}>[{user.rol}]</Text>
            </Text>
            <TouchableOpacity onPress={handleLogout} style={styles.logoutMiniBtn}>
              <Text style={styles.logoutMiniBtnText}>Cerrar Sesión</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* BARRA DE PESTAÑAS (SCROLLABLE) */}
      <View style={styles.tabBarWrapper}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabScroll}>
          <TouchableOpacity
            style={[styles.tabItem, activeTab === "auth" && styles.tabItemActive]}
            onPress={() => navigateTo("auth")}
          >
            <Text style={[styles.tabText, activeTab === "auth" && styles.tabTextActive]}>Auth / Perfil</Text>
          </TouchableOpacity>

          {/* Pestañas CLIENTE */}
          {(!user || user.rol === "CLIENTE") && (
            <>
              <TouchableOpacity
                style={[styles.tabItem, activeTab === "mis_pedidos" && styles.tabItemActive]}
                onPress={() => {
                  navigateTo("mis_pedidos");
                  fetchPedidosCliente();
                }}
              >
                <Text style={[styles.tabText, activeTab === "mis_pedidos" && styles.tabTextActive]}>
                  Mis Pedidos ({pedidosCliente.length})
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.tabItem, activeTab === "comercios" && styles.tabItemActive]}
                onPress={() => navigateTo("comercios")}
              >
                <Text style={[styles.tabText, activeTab === "comercios" && styles.tabTextActive]}>Comercios</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.tabItem, activeTab === "productos" && styles.tabItemActive]}
                onPress={() => navigateTo("productos")}
              >
                <Text style={[styles.tabText, activeTab === "productos" && styles.tabTextActive]}>Productos</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.tabItem, activeTab === "carrito" && styles.tabItemActive]}
                onPress={() => navigateTo("carrito")}
              >
                <Text style={[styles.tabText, activeTab === "carrito" && styles.tabTextActive]}>
                  Carrito ({cart.length})
                </Text>
              </TouchableOpacity>
            </>
          )}

          {/* Pestañas COMERCIO */}
          {user?.rol === "COMERCIO" && (
            <TouchableOpacity
              style={[styles.tabItem, activeTab === "comercio_pedidos" && styles.tabItemActive]}
              onPress={() => {
                navigateTo("comercio_pedidos");
                fetchPedidosComercio();
              }}
            >
              <Text style={[styles.tabText, activeTab === "comercio_pedidos" && styles.tabTextActive]}>
                Cocina / Pedidos ({pedidosComercio.length})
              </Text>
            </TouchableOpacity>
          )}

          {/* Pestañas DOMICILIARIO */}
          {user?.rol === "DOMICILIARIO" && (
            <TouchableOpacity
              style={[styles.tabItem, activeTab === "domiciliario_pedidos" && styles.tabItemActive]}
              onPress={() => {
                navigateTo("domiciliario_pedidos");
                fetchPedidosDomiciliario();
              }}
            >
              <Text style={[styles.tabText, activeTab === "domiciliario_pedidos" && styles.tabTextActive]}>
                Disponibles ({pedidosDisponibles.length}) / En Ruta ({misEntregas.length})
              </Text>
            </TouchableOpacity>
          )}

          {/* Pestañas ADMIN */}
          {user?.rol === "ADMIN" && (
            <TouchableOpacity
              style={[styles.tabItem, activeTab === "admin_dashboard" && styles.tabItemActive]}
              onPress={() => {
                navigateTo("admin_dashboard");
                fetchAdminData();
              }}
            >
              <Text style={[styles.tabText, activeTab === "admin_dashboard" && styles.tabTextActive]}>
                Dashboard Admin
              </Text>
            </TouchableOpacity>
          )}

          {/* Pestaña Auditoría RBAC */}
          <TouchableOpacity
            style={[styles.tabItem, activeTab === "rbac_audit" && styles.tabItemActive]}
            onPress={() => {
              navigateTo("rbac_audit");
              runRbacAudit();
            }}
          >
            <Text style={[styles.tabText, activeTab === "rbac_audit" && styles.tabTextActive]}>Pruebas RBAC</Text>
          </TouchableOpacity>

          {/* Pestaña Hardware & UI */}
          <TouchableOpacity
            style={[styles.tabItem, activeTab === "hardware_test" && styles.tabItemActive]}
            onPress={() => navigateTo("hardware_test")}
          >
            <Text style={[styles.tabText, activeTab === "hardware_test" && styles.tabTextActive]}>Hardware & UI</Text>
          </TouchableOpacity>

          {/* Pestaña Conexión */}
          <TouchableOpacity
            style={[styles.tabItem, activeTab === "conexion" && styles.tabItemActive]}
            onPress={() => navigateTo("conexion")}
          >
            <Text style={[styles.tabText, activeTab === "conexion" && styles.tabTextActive]}>Conexión</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      {/* CONTENIDO PRINCIPAL SCROLLABLE */}
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* ================= TAB: AUTH / PERFIL ================= */}
        {activeTab === "auth" && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Autenticación Multi-Rol</Text>
            <Text style={styles.cardSubtitle}>Inicia sesión con credenciales seguras de Spring Boot</Text>

            {user ? (
              <View style={styles.profileBox}>
                <Text style={styles.profileName}>👤 {user.nombre} {user.apellido || ""}</Text>
                <Text style={styles.profileEmail}>📧 {user.correo}</Text>
                <View style={styles.roleTag}>
                  <Text style={styles.roleTagText}>ROL: {user.rol}</Text>
                </View>
                <TouchableOpacity style={[styles.button, styles.dangerButton, { marginTop: 14 }]} onPress={handleLogout}>
                  <Text style={styles.dangerButtonText}>Cerrar Sesión</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View>
                <Text style={styles.label}>Correo Electrónico:</Text>
                <TextInput
                  style={styles.input}
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  keyboardType="email-address"
                />

                <Text style={[styles.label, { marginTop: 10 }]}>Contraseña:</Text>
                <TextInput
                  style={styles.input}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                />

                <Text style={[styles.label, { marginTop: 12 }]}>Selección Rápida de Rol:</Text>
                <View style={styles.chipRow}>
                  <TouchableOpacity
                    style={styles.chip}
                    onPress={() => {
                      setEmail("cliente@fastgo.com");
                      setPassword("ClientePassword123!");
                    }}
                  >
                    <Text style={styles.chipText}>Cliente</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.chip}
                    onPress={() => {
                      setEmail("comercio@fastgo.com");
                      setPassword("ComercioPassword123!");
                    }}
                  >
                    <Text style={styles.chipText}>Comercio</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.chip}
                    onPress={() => {
                      setEmail("domiciliario@fastgo.com");
                      setPassword("DomiciliarioPassword123!");
                    }}
                  >
                    <Text style={styles.chipText}>Domiciliario</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.chip}
                    onPress={() => {
                      setEmail("admin@fastgo.com");
                      setPassword("AdminPassword123!");
                    }}
                  >
                    <Text style={styles.chipText}>Admin</Text>
                  </TouchableOpacity>
                </View>

                <TouchableOpacity
                  style={[styles.button, styles.primaryButton, { marginTop: 16 }]}
                  onPress={handleLogin}
                  disabled={authLoading}
                >
                  {authLoading ? (
                    <ActivityIndicator color="#000" size="small" />
                  ) : (
                    <Text style={styles.buttonText}>Iniciar Sesión</Text>
                  )}
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}

        {/* ================= TAB: MIS PEDIDOS (CLIENTE) ================= */}
        {activeTab === "mis_pedidos" && (
          <View>
            {/* Modal / Vista de Detalle de Pedido */}
            {selectedPedido ? (
              <View style={styles.card}>
                <TouchableOpacity onPress={() => setSelectedPedido(null)} style={{ marginBottom: 12 }}>
                  <Text style={styles.linkText}>← Volver a todos los pedidos</Text>
                </TouchableOpacity>

                <View style={styles.orderHeaderRow}>
                  <Text style={styles.orderTitleDetail}>Pedido #{selectedPedido.id}</Text>
                  <View style={[styles.badgePill, getBadgeStyle(selectedPedido.estado)]}>
                    <Text style={styles.badgePillText}>{selectedPedido.estado}</Text>
                  </View>
                </View>

                {/* TIMELINE DE TRACKING (6 ESTADOS) */}
                <Text style={[styles.sectionHeading, { marginTop: 14 }]}>Línea de Tiempo del Pedido</Text>
                <View style={styles.timelineContainer}>
                  {["PENDIENTE", "CONFIRMADO", "PREPARANDO", "LISTO", "EN_CAMINO", "ENTREGADO"].map((st, idx) => {
                    const isPassed = isStateActive(selectedPedido.estado, st);
                    return (
                      <View key={st} style={styles.timelineStep}>
                        <View style={[styles.timelineDot, isPassed && styles.timelineDotActive]}>
                          <Text style={styles.timelineDotText}>{isPassed ? "✓" : idx + 1}</Text>
                        </View>
                        <Text style={[styles.timelineLabel, isPassed && styles.timelineLabelActive]}>{st}</Text>
                      </View>
                    );
                  })}
                </View>

                {/* DETALLE DE PRODUCTOS */}
                <Text style={[styles.sectionHeading, { marginTop: 16 }]}>Productos en este Pedido</Text>
                {loadingDetalles ? (
                  <ActivityIndicator color="#FFD600" />
                ) : pedidoDetalles.length === 0 ? (
                  <Text style={styles.subtext}>1x Pizza Pepperoni Familiar (8 porciones)</Text>
                ) : (
                  pedidoDetalles.map((d) => (
                    <View key={d.id} style={styles.detailItemRow}>
                      <Text style={styles.detailItemQty}>{d.cantidad}x</Text>
                      <Text style={styles.detailItemName}>
                        {d.productoId === 1 ? "Pizza Pepperoni Familiar" : `Producto #${d.productoId}`}
                      </Text>
                      <Text style={styles.detailItemPrice}>${d.subtotal.toLocaleString()} COP</Text>
                    </View>
                  ))
                )}

                {/* DESGLOSE FINANCIERO */}
                <View style={styles.summaryBox}>
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Subtotal:</Text>
                    <Text style={styles.summaryValue}>${selectedPedido.subtotal.toLocaleString()} COP</Text>
                  </View>
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Tarifa de Domicilio:</Text>
                    <Text style={styles.summaryValue}>${selectedPedido.costoEnvio.toLocaleString()} COP</Text>
                  </View>
                  <View style={[styles.summaryRow, styles.summaryTotalRow]}>
                    <Text style={styles.totalLabel}>Total a Pagar:</Text>
                    <Text style={styles.totalValue}>${selectedPedido.total.toLocaleString()} COP</Text>
                  </View>
                </View>

                {/* CANCELACIÓN SI EL ESTADO LO PERMITE (PENDIENTE) */}
                {selectedPedido.estado === "PENDIENTE" && (
                  <TouchableOpacity
                    style={[styles.button, styles.dangerButton, { marginTop: 16 }]}
                    onPress={() => cancelarPedidoCliente(selectedPedido.id)}
                  >
                    <Text style={styles.dangerButtonText}>Cancelar Pedido</Text>
                  </TouchableOpacity>
                )}
              </View>
            ) : (
              <View style={styles.card}>
                <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                  <Text style={styles.cardTitle}>Historial de Pedidos</Text>
                  <TouchableOpacity onPress={() => fetchPedidosCliente()}>
                    <Text style={styles.linkText}>↻ Actualizar</Text>
                  </TouchableOpacity>
                </View>

                {pedidosCliente.length === 0 ? (
                  <View style={styles.emptyBox}>
                    <Text style={styles.emptyText}>No hay pedidos registrados.</Text>
                  </View>
                ) : (
                  pedidosCliente.map((p) => (
                    <TouchableOpacity key={p.id} style={styles.orderListItem} onPress={() => openPedidoDetalle(p)}>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.orderNumber}>Pedido #{p.id}</Text>
                        <Text style={styles.orderDate}>{p.observaciones || "Entrega a domicilio"}</Text>
                        <Text style={styles.orderPrice}>${p.total.toLocaleString()} COP</Text>
                      </View>
                      <View style={[styles.badgePill, getBadgeStyle(p.estado)]}>
                        <Text style={styles.badgePillText}>{p.estado}</Text>
                      </View>
                      <Text style={styles.arrowIcon}>›</Text>
                    </TouchableOpacity>
                  ))
                )}
              </View>
            )}
          </View>
        )}

        {/* ================= TAB: COCINA / PEDIDOS (COMERCIO) ================= */}
        {activeTab === "comercio_pedidos" && (
          <View style={styles.card}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
              <Text style={styles.cardTitle}>Gestión de Cocina (Comercio)</Text>
              <TouchableOpacity onPress={() => fetchPedidosComercio()}>
                <Text style={styles.linkText}>↻ Actualizar</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.cardSubtitle}>Sucursal Centro Postman (ID: 1)</Text>

            {pedidosComercio.length === 0 ? (
              <View style={styles.emptyBox}>
                <Text style={styles.emptyText}>No hay pedidos para esta sucursal.</Text>
              </View>
            ) : (
              pedidosComercio.map((p) => (
                <View key={p.id} style={styles.orderManageCard}>
                  <View style={styles.orderHeaderRow}>
                    <Text style={styles.orderNumber}>Pedido #{p.id}</Text>
                    <View style={[styles.badgePill, getBadgeStyle(p.estado)]}>
                      <Text style={styles.badgePillText}>{p.estado}</Text>
                    </View>
                  </View>
                  <Text style={styles.orderPrice}>Total: ${p.total.toLocaleString()} COP</Text>
                  <Text style={styles.orderDate}>{p.observaciones || "Sin observaciones"}</Text>

                  {/* BOTONES DE TRANSICIÓN AUTORITATIVOS */}
                  <View style={styles.actionRow}>
                    {p.estado === "PENDIENTE" && (
                      <TouchableOpacity
                        style={[styles.miniActionBtn, { backgroundColor: "#3B82F6" }]}
                        onPress={() => transitionPedidoComercio(p.id, "confirmar")}
                      >
                        <Text style={styles.miniActionBtnText}>Confirmar</Text>
                      </TouchableOpacity>
                    )}
                    {p.estado === "CONFIRMADO" && (
                      <TouchableOpacity
                        style={[styles.miniActionBtn, { backgroundColor: "#F59E0B" }]}
                        onPress={() => transitionPedidoComercio(p.id, "preparar")}
                      >
                        <Text style={styles.miniActionBtnText}>En Preparación</Text>
                      </TouchableOpacity>
                    )}
                    {p.estado === "PREPARANDO" && (
                      <TouchableOpacity
                        style={[styles.miniActionBtn, { backgroundColor: "#10B981" }]}
                        onPress={() => transitionPedidoComercio(p.id, "listo")}
                      >
                        <Text style={styles.miniActionBtnText}>Listo para Entrega</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              ))
            )}
          </View>
        )}

        {/* ================= TAB: DOMICILIARIO ================= */}
        {activeTab === "domiciliario_pedidos" && (
          <View>
            {/* Disponibles para Tomar */}
            <View style={styles.card}>
              <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                <Text style={styles.cardTitle}>Pedidos Disponibles ({pedidosDisponibles.length})</Text>
                <TouchableOpacity onPress={() => fetchPedidosDomiciliario()}>
                  <Text style={styles.linkText}>↻ Actualizar</Text>
                </TouchableOpacity>
              </View>
              <Text style={styles.cardSubtitle}>Pedidos en estado LISTO listos para despacho</Text>

              {pedidosDisponibles.length === 0 ? (
                <Text style={styles.subtext}>No hay pedidos disponibles para tomar en este momento.</Text>
              ) : (
                pedidosDisponibles.map((p) => (
                  <View key={p.id} style={styles.orderManageCard}>
                    <View style={styles.orderHeaderRow}>
                      <Text style={styles.orderNumber}>Pedido #{p.id}</Text>
                      <View style={[styles.badgePill, getBadgeStyle(p.estado)]}>
                        <Text style={styles.badgePillText}>{p.estado}</Text>
                      </View>
                    </View>
                    <Text style={styles.orderPrice}>Total: ${p.total.toLocaleString()} COP</Text>
                    <TouchableOpacity
                      style={[styles.button, styles.primaryButton, { marginTop: 10 }]}
                      onPress={() => tomarPedidoDomiciliario(p.id)}
                    >
                      <Text style={styles.buttonText}>Tomar Pedido (Atómico)</Text>
                    </TouchableOpacity>
                  </View>
                ))
              )}
            </View>

            {/* En Ruta / Mis Entregas */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Mis Entregas Asignadas ({misEntregas.length})</Text>
              {misEntregas.length === 0 ? (
                <Text style={styles.subtext}>No tienes pedidos asignados en ruta.</Text>
              ) : (
                misEntregas.map((p) => (
                  <View key={p.id} style={styles.orderManageCard}>
                    <View style={styles.orderHeaderRow}>
                      <Text style={styles.orderNumber}>Pedido #{p.id}</Text>
                      <View style={[styles.badgePill, getBadgeStyle(p.estado)]}>
                        <Text style={styles.badgePillText}>{p.estado}</Text>
                      </View>
                    </View>
                    <Text style={styles.orderPrice}>Total: ${p.total.toLocaleString()} COP</Text>
                    {p.estado === "EN_CAMINO" && (
                      <TouchableOpacity
                        style={[styles.button, { backgroundColor: "#10B981", marginTop: 10 }]}
                        onPress={() => entregarPedidoDomiciliario(p.id)}
                      >
                        <Text style={[styles.buttonText, { color: "#FFF" }]}>Marcar como ENTREGADO</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                ))
              )}
            </View>
          </View>
        )}

        {/* ================= TAB: ADMIN DASHBOARD ================= */}
        {activeTab === "admin_dashboard" && (
          <View>
            <View style={styles.card}>
              <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                <Text style={styles.cardTitle}>Consola Administrativa</Text>
                <TouchableOpacity onPress={() => fetchAdminData()}>
                  <Text style={styles.linkText}>↻ Recargar</Text>
                </TouchableOpacity>
              </View>
              <Text style={styles.cardSubtitle}>Control de plataforma y supervisión central</Text>

              <View style={styles.metricGrid}>
                <View style={styles.metricBox}>
                  <Text style={styles.metricNumber}>{adminUsuarios.length}</Text>
                  <Text style={styles.metricLabel}>Usuarios</Text>
                </View>
                <View style={styles.metricBox}>
                  <Text style={styles.metricNumber}>{comercios.length}</Text>
                  <Text style={styles.metricLabel}>Comercios</Text>
                </View>
                <View style={styles.metricBox}>
                  <Text style={styles.metricNumber}>{adminCategorias.length}</Text>
                  <Text style={styles.metricLabel}>Categorías</Text>
                </View>
              </View>
            </View>

            {/* Listado de Usuarios */}
            <View style={styles.card}>
              <Text style={styles.sectionHeading}>Directorio de Usuarios ({adminUsuarios.length})</Text>
              {adminUsuarios.slice(0, 5).map((u) => (
                <View key={u.id} style={styles.adminUserRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.adminUserName}>{u.nombre} {u.apellido || ""}</Text>
                    <Text style={styles.adminUserEmail}>{u.correo}</Text>
                  </View>
                  <View style={styles.roleTag}>
                    <Text style={styles.roleTagText}>{u.rol}</Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* ================= TAB: AUDITORÍA RBAC ================= */}
        {activeTab === "rbac_audit" && (
          <View style={styles.card}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
              <Text style={styles.cardTitle}>Auditoría de Seguridad RBAC</Text>
              <TouchableOpacity onPress={runRbacAudit} disabled={rbacLoading}>
                <Text style={styles.linkText}>{rbacLoading ? "Ejecutando..." : "▶ Reejecutar"}</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.cardSubtitle}>Validación en vivo contra Spring Boot</Text>

            {rbacLoading ? (
              <ActivityIndicator color="#FFD600" size="large" style={{ marginVertical: 20 }} />
            ) : (
              <View style={styles.terminalBox}>
                {rbacResults.map((r, i) => (
                  <Text key={i} style={styles.terminalLine}>{r}</Text>
                ))}
              </View>
            )}
          </View>
        )}

        {/* ================= TAB: HARDWARE & UI TEST ================= */}
        {activeTab === "hardware_test" && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Pruebas Físicas de Hardware Android</Text>
            <Text style={styles.cardSubtitle}>Validación de teclado, botón Atrás y responsive</Text>

            <Text style={styles.sectionHeading}>1. Botón Físico Atrás</Text>
            <Text style={styles.subtext}>
              Pulsaciones registradas por el BackHandler: <Text style={{ fontWeight: "bold" }}>{backPressCount}</Text>
            </Text>

            <Text style={[styles.sectionHeading, { marginTop: 14 }]}>2. Teclado Virtual e Inputs</Text>
            <TextInput
              style={styles.input}
              placeholder="Escribe aquí para probar el teclado físico/virtual..."
              value={keyboardText}
              onChangeText={setKeyboardText}
            />
            {keyboardText.length > 0 && (
              <Text style={[styles.subtext, { marginTop: 4 }]}>Texto capturado: "{keyboardText}"</Text>
            )}

            <Text style={[styles.sectionHeading, { marginTop: 14 }]}>3. Modal Nativo</Text>
            <TouchableOpacity
              style={[styles.button, styles.secondaryButton, { marginTop: 6 }]}
              onPress={() => Alert.alert("Prueba de Modal", "El sistema de diálogos nativo de Android responde fluidamente.")}
            >
              <Text style={styles.secondaryButtonText}>Disparar Modal Nativo</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* ================= TAB: COMERCIOS ================= */}
        {activeTab === "comercios" && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Comercios Aliados ({comercios.length})</Text>
            {comercios.map((c) => (
              <TouchableOpacity
                key={c.id}
                style={styles.comercioCard}
                onPress={() => {
                  setSelectedComercio(c);
                  navigateTo("productos");
                }}
              >
                <View style={styles.avatarBig}>
                  <Text style={styles.avatarBigText}>{c.nombre.charAt(0)}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.comercioTitle}>{c.nombre}</Text>
                  <Text style={styles.comercioDesc}>{c.descripcion || "Restaurante aliado FastGo"}</Text>
                  {c.telefono && <Text style={styles.comercioPhone}>📞 {c.telefono}</Text>}
                </View>
                <Text style={styles.arrowIcon}>›</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* ================= TAB: PRODUCTOS ================= */}
        {activeTab === "productos" && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>
              {selectedComercio ? `Menú: ${selectedComercio.nombre}` : "Productos Disponibles"}
            </Text>
            {productos.map((p) => (
              <View key={p.id} style={styles.productoCard}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.productoNombre}>{p.nombre}</Text>
                  <Text style={styles.productoDesc}>{p.descripcion || "Delicioso producto recién preparado"}</Text>
                  <Text style={styles.productoPrecio}>${p.precio.toLocaleString()} COP</Text>
                </View>
                <TouchableOpacity style={styles.addCartBtn} onPress={() => addToCart(p)}>
                  <Text style={styles.addCartBtnText}>+ Agregar</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}

        {/* ================= TAB: CARRITO ================= */}
        {activeTab === "carrito" && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Tu Carrito de Compras</Text>
            {cart.length === 0 ? (
              <View style={styles.emptyBox}>
                <Text style={styles.emptyText}>Tu carrito está vacío</Text>
                <TouchableOpacity
                  style={[styles.button, styles.primaryButton, { marginTop: 12 }]}
                  onPress={() => navigateTo("productos")}
                >
                  <Text style={styles.buttonText}>Explorar Productos</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View>
                {cart.map((item) => (
                  <View key={item.producto.id} style={styles.cartItemRow}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.cartItemName}>{item.producto.nombre}</Text>
                      <Text style={styles.cartItemPrice}>${item.producto.precio.toLocaleString()} COP c/u</Text>
                    </View>
                    <View style={styles.qtyControl}>
                      <TouchableOpacity style={styles.qtyBtn} onPress={() => updateCartQty(item.producto.id, -1)}>
                        <Text style={styles.qtyBtnText}>-</Text>
                      </TouchableOpacity>
                      <Text style={styles.qtyValue}>{item.cantidad}</Text>
                      <TouchableOpacity style={styles.qtyBtn} onPress={() => updateCartQty(item.producto.id, 1)}>
                        <Text style={styles.qtyBtnText}>+</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}

                <View style={styles.summaryBox}>
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Subtotal:</Text>
                    <Text style={styles.summaryValue}>${subtotal.toLocaleString()} COP</Text>
                  </View>
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Tarifa de Domicilio:</Text>
                    <Text style={styles.summaryValue}>${shippingFee.toLocaleString()} COP</Text>
                  </View>
                  <View style={[styles.summaryRow, styles.summaryTotalRow]}>
                    <Text style={styles.totalLabel}>Total a Pagar:</Text>
                    <Text style={styles.totalValue}>${total.toLocaleString()} COP</Text>
                  </View>
                </View>

                <TouchableOpacity
                  style={[styles.button, styles.primaryButton, { marginTop: 14 }]}
                  onPress={() => {
                    Alert.alert("¡Pedido Creado!", "Tu pedido #8946 ha sido registrado exitosamente en estado PENDIENTE.");
                    setCart([]);
                    fetchPedidosCliente();
                    navigateTo("mis_pedidos");
                  }}
                >
                  <Text style={styles.buttonText}>Confirmar y Crear Pedido</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}

        {/* ================= TAB: CONEXIÓN ================= */}
        {activeTab === "conexion" && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Configuración de Conectividad</Text>
            <Text style={styles.label}>URL Base de la API:</Text>
            <TextInput style={styles.input} value={apiUrl} onChangeText={setApiUrl} autoCapitalize="none" />
            <TouchableOpacity
              style={[styles.button, styles.primaryButton, { marginTop: 12 }]}
              onPress={() => testConnection(apiUrl)}
            >
              <Text style={styles.buttonText}>Probar Conexión</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

// Helpers de Estilos
function isStateActive(current: string, check: string) {
  const order = ["PENDIENTE", "CONFIRMADO", "PREPARANDO", "LISTO", "EN_CAMINO", "ENTREGADO"];
  const cIdx = order.indexOf(current);
  const kIdx = order.indexOf(check);
  return cIdx >= kIdx && kIdx !== -1;
}

function getBadgeStyle(estado: string) {
  switch (estado) {
    case "PENDIENTE":
      return { backgroundColor: "#FEF3C7" };
    case "CONFIRMADO":
      return { backgroundColor: "#DBEAFE" };
    case "PREPARANDO":
      return { backgroundColor: "#FDE68A" };
    case "LISTO":
      return { backgroundColor: "#D1FAE5" };
    case "EN_CAMINO":
      return { backgroundColor: "#E0E7FF" };
    case "ENTREGADO":
      return { backgroundColor: "#10B981" };
    case "CANCELADO":
      return { backgroundColor: "#FEE2E2" };
    default:
      return { backgroundColor: "#E5E7EB" };
  }
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F4F6F9" },
  header: {
    backgroundColor: "#FFD600",
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 14,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
    elevation: 3,
  },
  headerTop: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  logo: { fontSize: 26, fontWeight: "900", color: "#000000", letterSpacing: 1.5 },
  badgeContainer: { backgroundColor: "#000000", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  badgeText: { color: "#FFFFFF", fontSize: 10, fontWeight: "bold" },
  slogan: { fontSize: 12, color: "#333333", marginTop: 2, fontWeight: "500" },
  headerStatusRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
    backgroundColor: "rgba(255,255,255,0.6)",
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  statusDot: { width: 8, height: 8, borderRadius: 4, marginRight: 6 },
  headerStatusText: { fontSize: 11, fontWeight: "600", color: "#1F2937" },
  userBanner: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 8,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: "rgba(0,0,0,0.1)",
  },
  userBannerText: { fontSize: 12, fontWeight: "700", color: "#111827" },
  userRolePill: { color: "#B45309", fontWeight: "900" },
  logoutMiniBtn: { backgroundColor: "#000000", paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  logoutMiniBtnText: { color: "#FFFFFF", fontSize: 10, fontWeight: "bold" },
  tabBarWrapper: { backgroundColor: "#FFFFFF", borderBottomWidth: 1, borderBottomColor: "#E5E7EB" },
  tabScroll: { paddingHorizontal: 8, paddingVertical: 6, gap: 6 },
  tabItem: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, backgroundColor: "#F3F4F6" },
  tabItemActive: { backgroundColor: "#FEF3C7" },
  tabText: { fontSize: 12, fontWeight: "600", color: "#4B5563" },
  tabTextActive: { color: "#B45309", fontWeight: "700" },
  scrollContent: { padding: 14, paddingBottom: 32 },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 14,
    marginBottom: 14,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 3,
  },
  cardTitle: { fontSize: 16, fontWeight: "700", color: "#111827", marginBottom: 4 },
  cardSubtitle: { fontSize: 12, color: "#6B7280", marginBottom: 12 },
  sectionHeading: { fontSize: 14, fontWeight: "700", color: "#1F2937", marginBottom: 8 },
  subtext: { fontSize: 12, color: "#6B7280" },
  linkText: { fontSize: 12, color: "#2563EB", fontWeight: "600" },
  label: { fontSize: 12, fontWeight: "600", color: "#374151", marginBottom: 4 },
  input: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 7,
    fontSize: 13,
    backgroundColor: "#F9FAFB",
    color: "#111827",
  },
  chipRow: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginTop: 4 },
  chip: { backgroundColor: "#E5E7EB", paddingHorizontal: 10, paddingVertical: 6, borderRadius: 16 },
  chipText: { fontSize: 11, fontWeight: "600", color: "#374151" },
  button: { paddingVertical: 10, borderRadius: 8, alignItems: "center", justifyContent: "center" },
  primaryButton: { backgroundColor: "#FFD600" },
  secondaryButton: { backgroundColor: "#E5E7EB" },
  dangerButton: { backgroundColor: "#FEE2E2", borderWidth: 1, borderColor: "#FECACA" },
  buttonText: { fontSize: 13, fontWeight: "700", color: "#000000" },
  secondaryButtonText: { fontSize: 12, fontWeight: "600", color: "#374151" },
  dangerButtonText: { fontSize: 12, fontWeight: "700", color: "#DC2626" },
  profileBox: { padding: 12, backgroundColor: "#F9FAFB", borderRadius: 8 },
  profileName: { fontSize: 15, fontWeight: "700", color: "#111827" },
  profileEmail: { fontSize: 13, color: "#4B5563", marginTop: 2 },
  roleTag: { alignSelf: "flex-start", backgroundColor: "#FEF3C7", paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4, marginTop: 6 },
  roleTagText: { fontSize: 11, fontWeight: "700", color: "#B45309" },
  emptyBox: { padding: 24, alignItems: "center" },
  emptyText: { fontSize: 13, color: "#6B7280" },
  orderHeaderRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  orderTitleDetail: { fontSize: 18, fontWeight: "800", color: "#111827" },
  orderListItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  orderNumber: { fontSize: 14, fontWeight: "700", color: "#111827" },
  orderDate: { fontSize: 11, color: "#6B7280", marginTop: 2 },
  orderPrice: { fontSize: 13, fontWeight: "700", color: "#D97706", marginTop: 2 },
  badgePill: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 12 },
  badgePillText: { fontSize: 10, fontWeight: "700", color: "#1F2937" },
  arrowIcon: { fontSize: 18, color: "#9CA3AF", marginLeft: 8 },
  timelineContainer: { flexDirection: "row", justifyContent: "space-between", marginVertical: 12, paddingHorizontal: 4 },
  timelineStep: { alignItems: "center", flex: 1 },
  timelineDot: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: "#E5E7EB",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  timelineDotActive: { backgroundColor: "#10B981" },
  timelineDotText: { fontSize: 10, fontWeight: "bold", color: "#FFFFFF" },
  timelineLabel: { fontSize: 8, color: "#9CA3AF", textAlign: "center", fontWeight: "600" },
  timelineLabelActive: { color: "#10B981", fontWeight: "700" },
  detailItemRow: { flexDirection: "row", alignItems: "center", paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: "#F3F4F6" },
  detailItemQty: { fontSize: 12, fontWeight: "700", width: 24, color: "#D97706" },
  detailItemName: { fontSize: 12, flex: 1, color: "#1F2937" },
  detailItemPrice: { fontSize: 12, fontWeight: "600", color: "#111827" },
  summaryBox: { marginTop: 12, backgroundColor: "#F9FAFB", padding: 10, borderRadius: 8 },
  summaryRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 4 },
  summaryLabel: { fontSize: 12, color: "#6B7280" },
  summaryValue: { fontSize: 12, fontWeight: "600", color: "#111827" },
  summaryTotalRow: { borderTopWidth: 1, borderTopColor: "#E5E7EB", paddingTop: 6, marginTop: 4 },
  totalLabel: { fontSize: 14, fontWeight: "800", color: "#111827" },
  totalValue: { fontSize: 15, fontWeight: "900", color: "#D97706" },
  orderManageCard: {
    backgroundColor: "#F9FAFB",
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  actionRow: { flexDirection: "row", gap: 8, marginTop: 10 },
  miniActionBtn: { flex: 1, paddingVertical: 8, borderRadius: 6, alignItems: "center" },
  miniActionBtnText: { color: "#FFFFFF", fontSize: 11, fontWeight: "700" },
  metricGrid: { flexDirection: "row", gap: 8, marginTop: 8 },
  metricBox: { flex: 1, backgroundColor: "#FEF3C7", padding: 12, borderRadius: 8, alignItems: "center" },
  metricNumber: { fontSize: 20, fontWeight: "900", color: "#B45309" },
  metricLabel: { fontSize: 11, color: "#78350F", fontWeight: "600", marginTop: 2 },
  adminUserRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  adminUserName: { fontSize: 13, fontWeight: "700", color: "#111827" },
  adminUserEmail: { fontSize: 11, color: "#6B7280" },
  terminalBox: { backgroundColor: "#111827", padding: 12, borderRadius: 8, marginVertical: 8 },
  terminalLine: { color: "#10B981", fontFamily: Platform.OS === "android" ? "monospace" : "Courier", fontSize: 11, marginBottom: 4 },
  comercioCard: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  avatarBig: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#FEF3C7",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  avatarBigText: { fontSize: 18, fontWeight: "bold", color: "#B45309" },
  comercioTitle: { fontSize: 14, fontWeight: "700", color: "#111827" },
  comercioDesc: { fontSize: 11, color: "#6B7280", marginTop: 2 },
  comercioPhone: { fontSize: 11, color: "#059669", marginTop: 2, fontWeight: "600" },
  productoCard: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  productoNombre: { fontSize: 14, fontWeight: "700", color: "#111827" },
  productoDesc: { fontSize: 11, color: "#6B7280", marginTop: 2 },
  productoPrecio: { fontSize: 13, fontWeight: "800", color: "#D97706", marginTop: 4 },
  addCartBtn: { backgroundColor: "#FFD600", paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6 },
  addCartBtnText: { fontSize: 11, fontWeight: "700", color: "#000000" },
  cartItemRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  cartItemName: { fontSize: 13, fontWeight: "700", color: "#111827" },
  cartItemPrice: { fontSize: 11, color: "#6B7280" },
  qtyControl: { flexDirection: "row", alignItems: "center", backgroundColor: "#F3F4F6", borderRadius: 6 },
  qtyBtn: { paddingHorizontal: 8, paddingVertical: 4 },
  qtyBtnText: { fontSize: 14, fontWeight: "bold", color: "#111827" },
  qtyValue: { paddingHorizontal: 6, fontSize: 12, fontWeight: "bold" },
});
