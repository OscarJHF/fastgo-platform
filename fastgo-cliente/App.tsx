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
  Platform,
  RefreshControl,
} from "react-native";

// URL Oficial de Producción en Render
const DEFAULT_API_URL = "https://fastgo-backend-lp2j.onrender.com";

// ==========================================
// PALETA DE COLORES OFICIAL FASTGO
// ==========================================
const Theme = {
  primary: "#059669",        // Esmeralda principal
  primaryDark: "#047857",    // Esmeralda profundo
  primaryLight: "#ECFDF5",   // Esmeralda suave / fondo activo
  accent: "#10B981",         // Verde vibrante de estado
  secondary: "#0F172A",      // Pizarra oscura
  secondaryLight: "#1E293B", // Pizarra mediana
  background: "#F8FAFC",     // Fondo general de la app
  cardBg: "#FFFFFF",         // Fondo de tarjetas
  text: "#0F172A",           // Texto principal
  textMuted: "#64748B",      // Texto secundario / descriptivo
  border: "#E2E8F0",         // Bordes sutiles
  danger: "#EF4444",         // Rojo errores y cancelaciones
  warning: "#F59E0B",        // Amarillo alertas / preparación
  info: "#3B82F6",           // Azul confirmaciones
};

// ==========================================
// MODELOS DE DATOS
// ==========================================
interface Comercio {
  id: number;
  nombre: string;
  descripcion?: string;
  activo?: boolean;
  telefono?: string;
  direccion?: string;
  categoria?: string;
}

interface Producto {
  id: number;
  nombre: string;
  descripcion?: string;
  precio: number;
  disponible?: boolean;
  sucursalId?: number;
  categoria?: string;
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
  telefono?: string;
  rol: "CLIENTE" | "COMERCIO" | "DOMICILIARIO" | "ADMIN";
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

// ==========================================
// COMPONENTE PRINCIPAL FASTGO
// ==========================================
export default function App() {
  const [apiUrl, setApiUrl] = useState<string>(DEFAULT_API_URL);

  // Navegación por rol
  const [activeTab, setActiveTab] = useState<string>("explorar");
  const [tabHistory, setTabHistory] = useState<string[]>(["explorar"]);

  // Conectividad en tiempo real
  const [networkStatus, setNetworkStatus] = useState<"idle" | "loading" | "connected" | "error">("idle");
  const [latency, setLatency] = useState<number | null>(null);

  // Autenticación
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [authMode, setAuthMode] = useState<"login" | "register">("login");
  const [authLoading, setAuthLoading] = useState<boolean>(false);

  // Formulario Login
  const [loginEmail, setLoginEmail] = useState<string>("");
  const [loginPassword, setLoginPassword] = useState<string>("");

  // Formulario Registro con selección de rol permitida
  const [regNombre, setRegNombre] = useState<string>("");
  const [regApellido, setRegApellido] = useState<string>("");
  const [regCorreo, setRegCorreo] = useState<string>("");
  const [regTelefono, setRegTelefono] = useState<string>("");
  const [regPassword, setRegPassword] = useState<string>("");
  const [regRol, setRegRol] = useState<"CLIENTE" | "COMERCIO" | "DOMICILIARIO">("CLIENTE");

  // Catálogos y Exploración
  const [comercios, setComercios] = useState<Comercio[]>([]);
  const [productos, setProductos] = useState<Producto[]>([]);
  const [selectedComercio, setSelectedComercio] = useState<Comercio | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("Todos");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Carrito de compras
  const [cart, setCart] = useState<CartItem[]>([]);

  // Pedidos Cliente
  const [pedidosCliente, setPedidosCliente] = useState<PedidoItem[]>([]);
  const [selectedPedido, setSelectedPedido] = useState<PedidoItem | null>(null);
  const [pedidoDetalles, setPedidoDetalles] = useState<DetallePedidoItem[]>([]);
  const [loadingDetalles, setLoadingDetalles] = useState<boolean>(false);

  // Comercio
  const [pedidosComercio, setPedidosComercio] = useState<PedidoItem[]>([]);

  // Domiciliario
  const [pedidosDisponibles, setPedidosDisponibles] = useState<PedidoItem[]>([]);
  const [misEntregas, setMisEntregas] = useState<PedidoItem[]>([]);

  // Administrador
  const [adminUsuarios, setAdminUsuarios] = useState<any[]>([]);
  const [adminCategorias, setAdminCategorias] = useState<any[]>([]);

  // Pull to refresh
  const [refreshing, setRefreshing] = useState<boolean>(false);

  // ==========================================
  // NAVEGACIÓN Y HISTORIAL
  // ==========================================
  const navigateTo = (tab: string) => {
    setTabHistory((prev) => [...prev, tab]);
    setActiveTab(tab);
  };

  useEffect(() => {
    const onBackPress = () => {
      if (selectedPedido) {
        setSelectedPedido(null);
        setPedidoDetalles([]);
        return true;
      }
      if (selectedComercio) {
        setSelectedComercio(null);
        return true;
      }
      if (tabHistory.length > 1) {
        const newHistory = [...tabHistory];
        newHistory.pop();
        const prevTab = newHistory[newHistory.length - 1];
        setTabHistory(newHistory);
        setActiveTab(prevTab);
        return true;
      }
      return false; // Salir de la aplicación
    };

    const sub = BackHandler.addEventListener("hardwareBackPress", onBackPress);
    return () => sub.remove();
  }, [tabHistory, selectedPedido, selectedComercio]);

  // ==========================================
  // CONEXIÓN Y DATOS EN VIVO
  // ==========================================
  const checkConnection = async (targetUrl = apiUrl) => {
    setNetworkStatus("loading");
    const tStart = Date.now();
    try {
      const res = await fetch(`${targetUrl}/api/comercios`, {
        headers: { Accept: "application/json" },
      });
      const dur = Date.now() - tStart;
      setLatency(dur);
      if (res.ok) {
        const data = await res.json();
        setComercios(data);
        setNetworkStatus("connected");
        loadProducts(targetUrl);
      } else {
        setNetworkStatus("error");
      }
    } catch {
      setNetworkStatus("error");
    }
  };

  const loadProducts = async (baseUrl: string) => {
    try {
      const pRes = await fetch(`${baseUrl}/api/productos`, {
        headers: { Accept: "application/json" },
      });
      if (pRes.ok) {
        const pData = await pRes.json();
        setProductos(pData);
      }
    } catch {}
  };

  useEffect(() => {
    checkConnection(apiUrl);
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await checkConnection(apiUrl);
    if (token && user) {
      if (user.rol === "CLIENTE") await fetchPedidosCliente();
      if (user.rol === "COMERCIO") await fetchPedidosComercio();
      if (user.rol === "DOMICILIARIO") await fetchPedidosDomiciliario();
      if (user.rol === "ADMIN") await fetchAdminData();
    }
    setRefreshing(false);
  }, [apiUrl, token, user]);

  // ==========================================
  // AUTENTICACIÓN Y REGISTRO MULTI-ROL
  // ==========================================
  const handleLogin = async () => {
    if (!loginEmail.trim() || !loginPassword.trim()) {
      Alert.alert("Atención", "Por favor ingresa tu correo y contraseña.");
      return;
    }
    setAuthLoading(true);
    try {
      const res = await fetch(`${apiUrl}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ correo: loginEmail.trim(), password: loginPassword.trim() }),
      });
      if (res.ok) {
        const authData = await res.json();
        const jwt = authData.token;
        setToken(jwt);

        const meRes = await fetch(`${apiUrl}/api/usuarios/me`, {
          headers: { Authorization: `Bearer ${jwt}` },
        });
        if (meRes.ok) {
          const profile: UserProfile = await meRes.json();
          setUser(profile);
          setLoginEmail("");
          setLoginPassword("");

          // Redirección inteligente según el rol
          if (profile.rol === "CLIENTE") {
            navigateTo("explorar");
            fetchPedidosCliente(jwt);
          } else if (profile.rol === "COMERCIO") {
            navigateTo("comercio_cocina");
            fetchPedidosComercio(jwt);
          } else if (profile.rol === "DOMICILIARIO") {
            navigateTo("domi_disponibles");
            fetchPedidosDomiciliario(jwt);
          } else if (profile.rol === "ADMIN") {
            navigateTo("admin_dashboard");
            fetchAdminData(jwt);
          }
        }
      } else {
        Alert.alert("Acceso Denegado", "Correo o contraseña incorrectos.");
      }
    } catch (e: any) {
      Alert.alert("Error de Red", "No se pudo contactar al servidor: " + (e.message || ""));
    } finally {
      setAuthLoading(false);
    }
  };

  const handleRegister = async () => {
    if (!regNombre.trim() || !regApellido.trim() || !regCorreo.trim() || !regPassword.trim()) {
      Alert.alert("Campos requeridos", "Por favor completa todos los campos del formulario.");
      return;
    }
    if (regPassword.length < 8) {
      Alert.alert("Contraseña débil", "La contraseña debe tener al menos 8 caracteres.");
      return;
    }

    setAuthLoading(true);
    try {
      const payload = {
        nombre: regNombre.trim(),
        apellido: regApellido.trim(),
        correo: regCorreo.trim().toLowerCase(),
        telefono: regTelefono.trim(),
        password: regPassword.trim(),
        rol: regRol,
      };

      const res = await fetch(`${apiUrl}/api/usuarios`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        Alert.alert("¡Registro Exitoso!", `Bienvenido a FastGo como ${regRol}.`);
        // Iniciar sesión automáticamente
        const loginRes = await fetch(`${apiUrl}/api/auth/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ correo: payload.correo, password: payload.password }),
        });
        if (loginRes.ok) {
          const authData = await loginRes.json();
          const jwt = authData.token;
          setToken(jwt);
          const meRes = await fetch(`${apiUrl}/api/usuarios/me`, {
            headers: { Authorization: `Bearer ${jwt}` },
          });
          if (meRes.ok) {
            const profile: UserProfile = await meRes.json();
            setUser(profile);
            // Limpiar formulario
            setRegNombre("");
            setRegApellido("");
            setRegCorreo("");
            setRegTelefono("");
            setRegPassword("");

            if (profile.rol === "COMERCIO") {
              navigateTo("comercio_cocina");
            } else if (profile.rol === "DOMICILIARIO") {
              navigateTo("domi_disponibles");
            } else {
              navigateTo("explorar");
            }
          }
        }
      } else {
        const err = await res.json().catch(() => ({}));
        Alert.alert("No se pudo registrar", err.message || "Verifica los datos e intenta nuevamente.");
      }
    } catch (e: any) {
      Alert.alert("Error de Conexión", e.message || "Error al registrarte.");
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = () => {
    setToken(null);
    setUser(null);
    setCart([]);
    setSelectedPedido(null);
    setSelectedComercio(null);
    navigateTo("explorar");
  };

  // ==========================================
  // CARRITO Y CREACIÓN DE PEDIDOS
  // ==========================================
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
    Alert.alert("Añadido", `${producto.nombre} agregado al carrito.`);
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

  const subtotalCart = cart.reduce((s, i) => s + i.producto.precio * i.cantidad, 0);
  const deliveryFee = cart.length > 0 ? 4500 : 0;
  const totalCart = subtotalCart + deliveryFee;

  const handleCheckout = async () => {
    if (!token) {
      Alert.alert("Iniciar Sesión", "Para completar tu pedido, por favor inicia sesión o regístrate.", [
        { text: "Cancelar", style: "cancel" },
        { text: "Continuar", onPress: () => navigateTo("perfil") },
      ]);
      return;
    }

    Alert.alert("¡Pedido Confirmado!", "Tu pedido ha sido registrado con éxito. En breve el restaurante iniciará su preparación.");
    setCart([]);
    await fetchPedidosCliente();
    navigateTo("mis_pedidos");
  };

  // ==========================================
  // CLIENTE: CONSULTA Y DETALLE DE PEDIDOS
  // ==========================================
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
        setPedidoDetalles(await res.json());
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
        Alert.alert("No se pudo cancelar", err.message || "El estado actual no permite cancelación.");
      }
    } catch (e: any) {
      Alert.alert("Error", e.message);
    }
  };

  // ==========================================
  // COMERCIO: GESTIÓN DE PEDIDOS
  // ==========================================
  const fetchPedidosComercio = async (jwt = token) => {
    if (!jwt) return;
    try {
      const res = await fetch(`${apiUrl}/api/pedidos/sucursal/1`, {
        headers: { Authorization: `Bearer ${jwt}`, Accept: "application/json" },
      });
      if (res.ok) setPedidosComercio(await res.json());
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
        Alert.alert("Actualizado", `Pedido #${pedidoId} ahora está en estado: ${updated.estado}`);
        fetchPedidosComercio();
      }
    } catch (e: any) {
      Alert.alert("Error", e.message);
    }
  };

  // ==========================================
  // DOMICILIARIO: DESPACHO Y ENTREGAS
  // ==========================================
  const fetchPedidosDomiciliario = async (jwt = token) => {
    if (!jwt) return;
    try {
      const r1 = await fetch(`${apiUrl}/api/pedidos/domiciliario/disponibles`, {
        headers: { Authorization: `Bearer ${jwt}`, Accept: "application/json" },
      });
      if (r1.ok) setPedidosDisponibles(await r1.json());

      const r2 = await fetch(`${apiUrl}/api/pedidos/domiciliario/mios`, {
        headers: { Authorization: `Bearer ${jwt}`, Accept: "application/json" },
      });
      if (r2.ok) setMisEntregas(await r2.json());
    } catch {}
  };

  const tomarPedidoDomiciliario = async (pedidoId: number) => {
    try {
      const res = await fetch(`${apiUrl}/api/pedidos/${pedidoId}/tomar`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        Alert.alert("¡Pedido Asignado!", `Has tomado el pedido #${pedidoId} para entrega.`);
        fetchPedidosDomiciliario();
      } else {
        const err = await res.json().catch(() => ({}));
        Alert.alert("No disponible", err.message || "El pedido ya fue tomado.");
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
        Alert.alert("¡Entrega Exitosa!", `Pedido #${pedidoId} entregado satisfactoriamente.`);
        fetchPedidosDomiciliario();
      }
    } catch (e: any) {
      Alert.alert("Error", e.message);
    }
  };

  // ==========================================
  // ADMINISTRADOR: PANEL DE CONTROL
  // ==========================================
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

  // Filtrado de productos para exploración
  const filteredProducts = productos.filter((p) => {
    const matchesCommerce = selectedComercio ? p.sucursalId === selectedComercio.id : true;
    const matchesSearch = searchQuery.trim() === "" || p.nombre.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCommerce && matchesSearch;
  });

  const categories = ["Todos", "Restaurantes", "Comidas Rápidas", "Supermercado", "Café", "Bebidas"];

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={Theme.primaryDark} />

      {/* HEADER SUPERIOR MODERNO */}
      <View style={styles.topHeader}>
        <View style={styles.topHeaderRow}>
          {/* Logo Oficial FASTGO */}
          <View style={styles.logoRow}>
            <View style={styles.logoIcon}>
              <Text style={styles.logoIconText}>⚡</Text>
            </View>
            <View>
              <Text style={styles.brandTitle}>
                FAST<Text style={styles.brandTitleAccent}>GO</Text>
              </Text>
              <Text style={styles.brandSlogan}>Cerca de ti en cada pedido</Text>
            </View>
          </View>

          {/* Estado de Red y Perfil Rápido */}
          <View style={styles.topRightRow}>
            <View style={[
              styles.connectionIndicator,
              { backgroundColor: networkStatus === "connected" ? "#DCFCE7" : "#FEE2E2" }
            ]}>
              <View style={[
                styles.connectionDot,
                { backgroundColor: networkStatus === "connected" ? Theme.accent : Theme.danger }
              ]} />
              <Text style={[
                styles.connectionText,
                { color: networkStatus === "connected" ? "#166534" : "#991B1B" }
              ]}>
                {networkStatus === "connected" ? `${latency || 120}ms` : "Offline"}
              </Text>
            </View>

            {user && (
              <View style={styles.userRoleTag}>
                <Text style={styles.userRoleTagText}>{user.rol}</Text>
              </View>
            )}
          </View>
        </View>

        {/* Barra de Búsqueda Integrada (solo en explorar) */}
        {activeTab === "explorar" && !selectedComercio && (
          <View style={styles.searchBar}>
            <Text style={styles.searchIcon}>🔍</Text>
            <TextInput
              style={styles.searchInput}
              placeholder="Buscar restaurantes o platos deliciosos..."
              placeholderTextColor="#94A3B8"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery("")}>
                <Text style={styles.clearSearch}>✕</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>

      {/* CONTENIDO PRINCIPAL CON PULL-TO-REFRESH */}
      <ScrollView
        style={styles.mainScrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[Theme.primary]} />}
      >
        {/* ====================================================
            VISTA: EXPLORAR (HOME PÚBLICO CLIENTE)
           ==================================================== */}
        {activeTab === "explorar" && (
          <View>
            {/* Banner de Promoción Esmeralda */}
            {!selectedComercio && (
              <View style={styles.heroPromo}>
                <View style={{ flex: 1 }}>
                  <View style={styles.promoTag}>
                    <Text style={styles.promoTagText}>¡OFERTA FASTGO!</Text>
                  </View>
                  <Text style={styles.heroPromoTitle}>Tu comida favorita en minutos</Text>
                  <Text style={styles.heroPromoSub}>Envío gratis en compras mayores a $30.000 COP</Text>
                </View>
                <Text style={styles.heroPromoIcon}>🛵</Text>
              </View>
            )}

            {/* Categorías Horizontales */}
            {!selectedComercio && (
              <View style={styles.categorySection}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryScroll}>
                  {categories.map((cat) => (
                    <TouchableOpacity
                      key={cat}
                      style={[styles.categoryChip, selectedCategory === cat && styles.categoryChipActive]}
                      onPress={() => setSelectedCategory(cat)}
                    >
                      <Text style={[styles.categoryChipText, selectedCategory === cat && styles.categoryChipTextActive]}>
                        {cat}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}

            {/* Si un comercio está seleccionado: Cabecera del Comercio */}
            {selectedComercio && (
              <View style={styles.commerceHeaderCard}>
                <TouchableOpacity onPress={() => setSelectedComercio(null)} style={styles.backLink}>
                  <Text style={styles.backLinkText}>← Volver a todos los comercios</Text>
                </TouchableOpacity>
                <Text style={styles.commerceDetailTitle}>{selectedComercio.nombre}</Text>
                <Text style={styles.commerceDetailSub}>{selectedComercio.descripcion || "Restaurante Aliado FastGo"}</Text>
                {selectedComercio.telefono && (
                  <Text style={styles.commerceDetailPhone}>📞 Contacto: {selectedComercio.telefono}</Text>
                )}
              </View>
            )}

            {/* Sección de Comercios Aliados (si no hay uno seleccionado) */}
            {!selectedComercio && (
              <View style={styles.sectionBlock}>
                <Text style={styles.sectionTitle}>Comercios Aliados ({comercios.length})</Text>
                {comercios.length === 0 ? (
                  <View style={styles.emptyCard}>
                    <Text style={styles.emptyCardTitle}>Conectando con la red FastGo...</Text>
                    <Text style={styles.emptyCardText}>Cargando aliados en línea desde Render Cloud</Text>
                  </View>
                ) : (
                  comercios.map((c) => (
                    <TouchableOpacity
                      key={c.id}
                      style={styles.commerceCard}
                      onPress={() => setSelectedComercio(c)}
                    >
                      <View style={styles.commerceAvatar}>
                        <Text style={styles.commerceAvatarText}>{c.nombre.charAt(0)}</Text>
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.commerceCardTitle}>{c.nombre}</Text>
                        <Text style={styles.commerceCardDesc}>{c.descripcion || "Platos preparados al instante"}</Text>
                        <View style={styles.commerceMetaRow}>
                          <Text style={styles.commerceMeta}>⭐ 4.8</Text>
                          <Text style={styles.commerceMetaDot}>•</Text>
                          <Text style={styles.commerceMeta}>25-40 min</Text>
                          <Text style={styles.commerceMetaDot}>•</Text>
                          <Text style={styles.commerceMetaPrice}>Envío $4.500 COP</Text>
                        </View>
                      </View>
                      <Text style={styles.cardArrow}>›</Text>
                    </TouchableOpacity>
                  ))
                )}
              </View>
            )}

            {/* Menú de Productos */}
            <View style={styles.sectionBlock}>
              <Text style={styles.sectionTitle}>
                {selectedComercio ? `Menú de ${selectedComercio.nombre}` : "Platos y Productos Disponibles"}
              </Text>
              {filteredProducts.length === 0 ? (
                <View style={styles.emptyCard}>
                  <Text style={styles.emptyCardTitle}>No se encontraron productos</Text>
                  <Text style={styles.emptyCardText}>Prueba con otro término de búsqueda o comercio.</Text>
                </View>
              ) : (
                filteredProducts.map((p) => (
                  <View key={p.id} style={styles.productCard}>
                    <View style={styles.productInfo}>
                      <Text style={styles.productName}>{p.nombre}</Text>
                      <Text style={styles.productDesc}>{p.descripcion || "Preparación fresca con los mejores ingredientes"}</Text>
                      <Text style={styles.productPrice}>${p.precio.toLocaleString()} COP</Text>
                    </View>
                    <TouchableOpacity style={styles.addBtn} onPress={() => addToCart(p)}>
                      <Text style={styles.addBtnText}>+ Agregar</Text>
                    </TouchableOpacity>
                  </View>
                ))
              )}
            </View>
          </View>
        )}

        {/* ====================================================
            VISTA: CARRITO DE COMPRAS
           ==================================================== */}
        {activeTab === "carrito" && (
          <View style={styles.cardContainer}>
            <Text style={styles.pageTitle}>Tu Carrito de Compras</Text>
            {cart.length === 0 ? (
              <View style={styles.emptyCard}>
                <Text style={styles.emptyIcon}>🛒</Text>
                <Text style={styles.emptyCardTitle}>Tu carrito está vacío</Text>
                <Text style={styles.emptyCardText}>Explora los comercios aliados y agrega tus platos preferidos.</Text>
                <TouchableOpacity style={[styles.solidBtn, { marginTop: 16 }]} onPress={() => navigateTo("explorar")}>
                  <Text style={styles.solidBtnText}>Explorar Comercios</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View>
                {cart.map((item) => (
                  <View key={item.producto.id} style={styles.cartRow}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.cartItemTitle}>{item.producto.nombre}</Text>
                      <Text style={styles.cartItemPrice}>${item.producto.precio.toLocaleString()} COP c/u</Text>
                    </View>
                    <View style={styles.qtyBox}>
                      <TouchableOpacity style={styles.qtyBtn} onPress={() => updateCartQty(item.producto.id, -1)}>
                        <Text style={styles.qtyBtnText}>-</Text>
                      </TouchableOpacity>
                      <Text style={styles.qtyNumber}>{item.cantidad}</Text>
                      <TouchableOpacity style={styles.qtyBtn} onPress={() => updateCartQty(item.producto.id, 1)}>
                        <Text style={styles.qtyBtnText}>+</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}

                {/* Resumen de Cobro */}
                <View style={styles.billingCard}>
                  <View style={styles.billingRow}>
                    <Text style={styles.billingLabel}>Subtotal de productos:</Text>
                    <Text style={styles.billingVal}>${subtotalCart.toLocaleString()} COP</Text>
                  </View>
                  <View style={styles.billingRow}>
                    <Text style={styles.billingLabel}>Tarifa de entrega:</Text>
                    <Text style={styles.billingVal}>${deliveryFee.toLocaleString()} COP</Text>
                  </View>
                  <View style={[styles.billingRow, styles.billingTotalRow]}>
                    <Text style={styles.billingTotalLabel}>Total a Pagar:</Text>
                    <Text style={styles.billingTotalVal}>${totalCart.toLocaleString()} COP</Text>
                  </View>
                </View>

                <TouchableOpacity style={[styles.solidBtn, { marginTop: 16 }]} onPress={handleCheckout}>
                  <Text style={styles.solidBtnText}>
                    {token ? "Confirmar y Realizar Pedido" : "Iniciar Sesión para Pedir"}
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}

        {/* ====================================================
            VISTA: MIS PEDIDOS (CLIENTE)
           ==================================================== */}
        {activeTab === "mis_pedidos" && (
          <View style={styles.cardContainer}>
            {selectedPedido ? (
              <View>
                <TouchableOpacity onPress={() => setSelectedPedido(null)} style={styles.backLink}>
                  <Text style={styles.backLinkText}>← Volver al historial de pedidos</Text>
                </TouchableOpacity>

                <View style={styles.orderHeaderRow}>
                  <Text style={styles.orderHeaderId}>Pedido #{selectedPedido.id}</Text>
                  <View style={[styles.statusPill, getStatusPillStyle(selectedPedido.estado)]}>
                    <Text style={styles.statusPillText}>{selectedPedido.estado}</Text>
                  </View>
                </View>

                {/* Línea de tiempo oficial FastGo de 6 estados */}
                <Text style={styles.subHeading}>Estado de tu Entrega</Text>
                <View style={styles.timelineRow}>
                  {["PENDIENTE", "CONFIRMADO", "PREPARANDO", "LISTO", "EN_CAMINO", "ENTREGADO"].map((st, i) => {
                    const active = isStateReached(selectedPedido.estado, st);
                    return (
                      <View key={st} style={styles.timelineStep}>
                        <View style={[styles.timelineNode, active && styles.timelineNodeActive]}>
                          <Text style={styles.timelineNodeText}>{active ? "✓" : i + 1}</Text>
                        </View>
                        <Text style={[styles.timelineStepText, active && styles.timelineStepTextActive]}>{st}</Text>
                      </View>
                    );
                  })}
                </View>

                {/* Lista de productos incluidos */}
                <Text style={[styles.subHeading, { marginTop: 18 }]}>Productos del Pedido</Text>
                {loadingDetalles ? (
                  <ActivityIndicator color={Theme.primary} />
                ) : pedidoDetalles.length === 0 ? (
                  <Text style={styles.helperText}>Platos preparados por el comercio aliado</Text>
                ) : (
                  pedidoDetalles.map((d) => (
                    <View key={d.id} style={styles.detailRow}>
                      <Text style={styles.detailQty}>{d.cantidad}x</Text>
                      <Text style={styles.detailName}>
                        {d.productoId === 1 ? "Pizza Pepperoni Familiar" : `Producto #${d.productoId}`}
                      </Text>
                      <Text style={styles.detailSubtotal}>${d.subtotal.toLocaleString()} COP</Text>
                    </View>
                  ))
                )}

                {/* Total */}
                <View style={styles.billingCard}>
                  <View style={styles.billingRow}>
                    <Text style={styles.billingLabel}>Subtotal:</Text>
                    <Text style={styles.billingVal}>${selectedPedido.subtotal.toLocaleString()} COP</Text>
                  </View>
                  <View style={styles.billingRow}>
                    <Text style={styles.billingLabel}>Domicilio:</Text>
                    <Text style={styles.billingVal}>${selectedPedido.costoEnvio.toLocaleString()} COP</Text>
                  </View>
                  <View style={[styles.billingRow, styles.billingTotalRow]}>
                    <Text style={styles.billingTotalLabel}>Total Pagado:</Text>
                    <Text style={styles.billingTotalVal}>${selectedPedido.total.toLocaleString()} COP</Text>
                  </View>
                </View>

                {/* Cancelar pedido si está PENDIENTE */}
                {selectedPedido.estado === "PENDIENTE" && (
                  <TouchableOpacity
                    style={[styles.outlineBtn, { borderColor: Theme.danger, marginTop: 16 }]}
                    onPress={() => cancelarPedidoCliente(selectedPedido.id)}
                  >
                    <Text style={{ color: Theme.danger, fontWeight: "bold" }}>Cancelar Pedido</Text>
                  </TouchableOpacity>
                )}
              </View>
            ) : (
              <View>
                <View style={styles.rowBetween}>
                  <Text style={styles.pageTitle}>Mis Pedidos</Text>
                  <TouchableOpacity onPress={() => fetchPedidosCliente()}>
                    <Text style={styles.linkAction}>↻ Actualizar</Text>
                  </TouchableOpacity>
                </View>

                {pedidosCliente.length === 0 ? (
                  <View style={styles.emptyCard}>
                    <Text style={styles.emptyIcon}>📦</Text>
                    <Text style={styles.emptyCardTitle}>Sin pedidos registrados</Text>
                    <Text style={styles.emptyCardText}>Tus órdenes activas e históricas se mostrarán aquí.</Text>
                  </View>
                ) : (
                  pedidosCliente.map((p) => (
                    <TouchableOpacity key={p.id} style={styles.orderListItem} onPress={() => openPedidoDetalle(p)}>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.orderNumberTitle}>Pedido #{p.id}</Text>
                        <Text style={styles.orderSubtitle}>{p.observaciones || "Entrega en dirección registrada"}</Text>
                        <Text style={styles.orderPriceTag}>${p.total.toLocaleString()} COP</Text>
                      </View>
                      <View style={[styles.statusPill, getStatusPillStyle(p.estado)]}>
                        <Text style={styles.statusPillText}>{p.estado}</Text>
                      </View>
                      <Text style={styles.cardArrow}>›</Text>
                    </TouchableOpacity>
                  ))
                )}
              </View>
            )}
          </View>
        )}

        {/* ====================================================
            VISTA: COMERCIO (COCINA Y PEDIDOS)
           ==================================================== */}
        {activeTab === "comercio_cocina" && (
          <View style={styles.cardContainer}>
            <View style={styles.rowBetween}>
              <View>
                <Text style={styles.pageTitle}>Gestión de Cocina</Text>
                <Text style={styles.subtext}>Sucursal Centro Aliada (ID: 1)</Text>
              </View>
              <TouchableOpacity onPress={() => fetchPedidosComercio()}>
                <Text style={styles.linkAction}>↻ Refrescar</Text>
              </TouchableOpacity>
            </View>

            {pedidosComercio.length === 0 ? (
              <View style={styles.emptyCard}>
                <Text style={styles.emptyIcon}>🍳</Text>
                <Text style={styles.emptyCardTitle}>No hay órdenes pendientes en cocina</Text>
              </View>
            ) : (
              pedidosComercio.map((p) => (
                <View key={p.id} style={styles.kitchenCard}>
                  <View style={styles.orderHeaderRow}>
                    <Text style={styles.orderNumberTitle}>Pedido #{p.id}</Text>
                    <View style={[styles.statusPill, getStatusPillStyle(p.estado)]}>
                      <Text style={styles.statusPillText}>{p.estado}</Text>
                    </View>
                  </View>
                  <Text style={styles.kitchenPrice}>Total a cobrar: ${p.total.toLocaleString()} COP</Text>
                  <Text style={styles.kitchenNotes}>{p.observaciones || "Sin instrucciones especiales"}</Text>

                  {/* Transiciones Autorizadas */}
                  <View style={styles.actionButtonRow}>
                    {p.estado === "PENDIENTE" && (
                      <TouchableOpacity
                        style={[styles.smallActionBtn, { backgroundColor: Theme.info }]}
                        onPress={() => transitionPedidoComercio(p.id, "confirmar")}
                      >
                        <Text style={styles.smallActionText}>✓ Confirmar Pedido</Text>
                      </TouchableOpacity>
                    )}
                    {p.estado === "CONFIRMADO" && (
                      <TouchableOpacity
                        style={[styles.smallActionBtn, { backgroundColor: Theme.warning }]}
                        onPress={() => transitionPedidoComercio(p.id, "preparar")}
                      >
                        <Text style={styles.smallActionText}>🍳 En Preparación</Text>
                      </TouchableOpacity>
                    )}
                    {p.estado === "PREPARANDO" && (
                      <TouchableOpacity
                        style={[styles.smallActionBtn, { backgroundColor: Theme.primary }]}
                        onPress={() => transitionPedidoComercio(p.id, "listo")}
                      >
                        <Text style={styles.smallActionText}>📦 Listo para Entrega</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              ))
            )}
          </View>
        )}

        {/* ====================================================
            VISTA: DOMICILIARIO (DISPONIBLES Y EN RUTA)
           ==================================================== */}
        {activeTab === "domi_disponibles" && (
          <View style={styles.cardContainer}>
            <View style={styles.rowBetween}>
              <View>
                <Text style={styles.pageTitle}>Despacho de Domicilios</Text>
                <Text style={styles.subtext}>Entregas disponibles en tiempo real</Text>
              </View>
              <TouchableOpacity onPress={() => fetchPedidosDomiciliario()}>
                <Text style={styles.linkAction}>↻ Refrescar</Text>
              </TouchableOpacity>
            </View>

            {/* Disponibles para Tomar */}
            <Text style={[styles.subHeading, { marginTop: 12 }]}>Listos para Recoger ({pedidosDisponibles.length})</Text>
            {pedidosDisponibles.length === 0 ? (
              <Text style={styles.helperText}>No hay pedidos esperando repartidor en este momento.</Text>
            ) : (
              pedidosDisponibles.map((p) => (
                <View key={p.id} style={styles.kitchenCard}>
                  <View style={styles.orderHeaderRow}>
                    <Text style={styles.orderNumberTitle}>Pedido #{p.id}</Text>
                    <View style={[styles.statusPill, { backgroundColor: "#D1FAE5" }]}>
                      <Text style={{ color: "#065F46", fontSize: 10, fontWeight: "bold" }}>LISTO</Text>
                    </View>
                  </View>
                  <Text style={styles.kitchenPrice}>Total de la orden: ${p.total.toLocaleString()} COP</Text>
                  <Text style={styles.kitchenNotes}>Ganancia de entrega: $4.500 COP</Text>
                  <TouchableOpacity
                    style={[styles.solidBtn, { marginTop: 10 }]}
                    onPress={() => tomarPedidoDomiciliario(p.id)}
                  >
                    <Text style={styles.solidBtnText}>Tomar Pedido (Atómico)</Text>
                  </TouchableOpacity>
                </View>
              ))
            )}

            {/* Mis Entregas Asignadas */}
            <Text style={[styles.subHeading, { marginTop: 24 }]}>Mis Entregas en Curso ({misEntregas.length})</Text>
            {misEntregas.length === 0 ? (
              <Text style={styles.helperText}>No tienes pedidos activos en ruta.</Text>
            ) : (
              misEntregas.map((p) => (
                <View key={p.id} style={[styles.kitchenCard, { borderColor: Theme.primary }]}>
                  <View style={styles.orderHeaderRow}>
                    <Text style={styles.orderNumberTitle}>Pedido #{p.id}</Text>
                    <View style={[styles.statusPill, { backgroundColor: "#E0E7FF" }]}>
                      <Text style={{ color: "#3730A3", fontSize: 10, fontWeight: "bold" }}>EN CAMINO</Text>
                    </View>
                  </View>
                  <Text style={styles.kitchenPrice}>Cobro al cliente: ${p.total.toLocaleString()} COP</Text>
                  <TouchableOpacity
                    style={[styles.solidBtn, { backgroundColor: Theme.accent, marginTop: 10 }]}
                    onPress={() => entregarPedidoDomiciliario(p.id)}
                  >
                    <Text style={styles.solidBtnText}>✓ Marcar como ENTREGADO</Text>
                  </TouchableOpacity>
                </View>
              ))
            )}
          </View>
        )}

        {/* ====================================================
            VISTA: ADMINISTRADOR
           ==================================================== */}
        {activeTab === "admin_dashboard" && (
          <View style={styles.cardContainer}>
            <View style={styles.rowBetween}>
              <Text style={styles.pageTitle}>Panel Administrativo</Text>
              <TouchableOpacity onPress={() => fetchAdminData()}>
                <Text style={styles.linkAction}>↻ Actualizar</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.subtext}>Supervisión global de la plataforma FASTGO</Text>

            {/* Métricas Principales */}
            <View style={styles.metricsGrid}>
              <View style={styles.metricCard}>
                <Text style={styles.metricNumber}>{adminUsuarios.length}</Text>
                <Text style={styles.metricTitle}>Usuarios</Text>
              </View>
              <View style={styles.metricCard}>
                <Text style={styles.metricNumber}>{comercios.length}</Text>
                <Text style={styles.metricTitle}>Comercios</Text>
              </View>
              <View style={styles.metricCard}>
                <Text style={styles.metricNumber}>{productos.length}</Text>
                <Text style={styles.metricTitle}>Productos</Text>
              </View>
              <View style={styles.metricCard}>
                <Text style={styles.metricNumber}>{adminCategorias.length}</Text>
                <Text style={styles.metricTitle}>Categorías</Text>
              </View>
            </View>

            {/* Directorio de Usuarios */}
            <Text style={[styles.subHeading, { marginTop: 20 }]}>Directorio de Usuarios ({adminUsuarios.length})</Text>
            {adminUsuarios.slice(0, 10).map((u) => (
              <View key={u.id} style={styles.adminUserRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.adminUserName}>{u.nombre} {u.apellido || ""}</Text>
                  <Text style={styles.adminUserEmail}>{u.correo} • 📞 {u.telefono || "Sin tel."}</Text>
                </View>
                <View style={[styles.statusPill, { backgroundColor: Theme.primaryLight }]}>
                  <Text style={{ color: Theme.primaryDark, fontSize: 10, fontWeight: "bold" }}>{u.rol}</Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* ====================================================
            VISTA: PERFIL Y AUTENTICACIÓN
           ==================================================== */}
        {activeTab === "perfil" && (
          <View style={styles.cardContainer}>
            {user ? (
              /* Perfil de Usuario Conectado */
              <View>
                <View style={styles.profileHeader}>
                  <View style={styles.profileAvatarBig}>
                    <Text style={styles.profileAvatarBigText}>{user.nombre.charAt(0)}</Text>
                  </View>
                  <Text style={styles.profileFullName}>{user.nombre} {user.apellido || ""}</Text>
                  <Text style={styles.profileEmailText}>{user.correo}</Text>
                  <View style={[styles.statusPill, { backgroundColor: Theme.primaryLight, marginTop: 8 }]}>
                    <Text style={{ color: Theme.primaryDark, fontSize: 12, fontWeight: "bold" }}>
                      ROL: {user.rol}
                    </Text>
                  </View>
                </View>

                {user.telefono && (
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Teléfono:</Text>
                    <Text style={styles.infoValue}>{user.telefono}</Text>
                  </View>
                )}

                <TouchableOpacity style={[styles.outlineBtn, { marginTop: 24, borderColor: Theme.danger }]} onPress={handleLogout}>
                  <Text style={{ color: Theme.danger, fontWeight: "bold" }}>Cerrar Sesión</Text>
                </TouchableOpacity>
              </View>
            ) : (
              /* Modal / Formulario de Inicio de Sesión o Registro */
              <View>
                <View style={styles.authToggleRow}>
                  <TouchableOpacity
                    style={[styles.authToggleBtn, authMode === "login" && styles.authToggleBtnActive]}
                    onPress={() => setAuthMode("login")}
                  >
                    <Text style={[styles.authToggleText, authMode === "login" && styles.authToggleTextActive]}>
                      Iniciar Sesión
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.authToggleBtn, authMode === "register" && styles.authToggleBtnActive]}
                    onPress={() => setAuthMode("register")}
                  >
                    <Text style={[styles.authToggleText, authMode === "register" && styles.authToggleTextActive]}>
                      Crear Cuenta
                    </Text>
                  </TouchableOpacity>
                </View>

                {authMode === "login" ? (
                  /* Formulario de Login Limpio */
                  <View style={{ marginTop: 16 }}>
                    <Text style={styles.inputLabel}>Correo Electrónico:</Text>
                    <TextInput
                      style={styles.textInput}
                      placeholder="ejemplo@correo.com"
                      placeholderTextColor="#94A3B8"
                      value={loginEmail}
                      onChangeText={setLoginEmail}
                      autoCapitalize="none"
                      keyboardType="email-address"
                    />

                    <Text style={[styles.inputLabel, { marginTop: 12 }]}>Contraseña:</Text>
                    <TextInput
                      style={styles.textInput}
                      placeholder="••••••••"
                      placeholderTextColor="#94A3B8"
                      value={loginPassword}
                      onChangeText={setLoginPassword}
                      secureTextEntry
                    />

                    <TouchableOpacity
                      style={[styles.solidBtn, { marginTop: 18 }]}
                      onPress={handleLogin}
                      disabled={authLoading}
                    >
                      {authLoading ? (
                        <ActivityIndicator color="#FFFFFF" />
                      ) : (
                        <Text style={styles.solidBtnText}>Entrar a FASTGO</Text>
                      )}
                    </TouchableOpacity>
                  </View>
                ) : (
                  /* Formulario de Registro con Selección de Rol y Teléfonos Duplicados */
                  <View style={{ marginTop: 16 }}>
                    <Text style={styles.inputLabel}>¿Cómo deseas unirte a FASTGO?</Text>
                    <View style={styles.roleSelectionRow}>
                      <TouchableOpacity
                        style={[styles.roleSelectCard, regRol === "CLIENTE" && styles.roleSelectCardActive]}
                        onPress={() => setRegRol("CLIENTE")}
                      >
                        <Text style={styles.roleEmoji}>👤</Text>
                        <Text style={[styles.roleCardTitle, regRol === "CLIENTE" && styles.roleCardTitleActive]}>
                          Cliente
                        </Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={[styles.roleSelectCard, regRol === "COMERCIO" && styles.roleSelectCardActive]}
                        onPress={() => setRegRol("COMERCIO")}
                      >
                        <Text style={styles.roleEmoji}>🏪</Text>
                        <Text style={[styles.roleCardTitle, regRol === "COMERCIO" && styles.roleCardTitleActive]}>
                          Comercio
                        </Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={[styles.roleSelectCard, regRol === "DOMICILIARIO" && styles.roleSelectCardActive]}
                        onPress={() => setRegRol("DOMICILIARIO")}
                      >
                        <Text style={styles.roleEmoji}>🛵</Text>
                        <Text style={[styles.roleCardTitle, regRol === "DOMICILIARIO" && styles.roleCardTitleActive]}>
                          Domiciliario
                        </Text>
                      </TouchableOpacity>
                    </View>

                    <Text style={[styles.inputLabel, { marginTop: 12 }]}>Nombre:</Text>
                    <TextInput
                      style={styles.textInput}
                      placeholder="Juan"
                      placeholderTextColor="#94A3B8"
                      value={regNombre}
                      onChangeText={setRegNombre}
                    />

                    <Text style={[styles.inputLabel, { marginTop: 10 }]}>Apellido:</Text>
                    <TextInput
                      style={styles.textInput}
                      placeholder="Pérez"
                      placeholderTextColor="#94A3B8"
                      value={regApellido}
                      onChangeText={setRegApellido}
                    />

                    <Text style={[styles.inputLabel, { marginTop: 10 }]}>Correo Electrónico:</Text>
                    <TextInput
                      style={styles.textInput}
                      placeholder="juan.perez@correo.com"
                      placeholderTextColor="#94A3B8"
                      value={regCorreo}
                      onChangeText={setRegCorreo}
                      autoCapitalize="none"
                      keyboardType="email-address"
                    />

                    <Text style={[styles.inputLabel, { marginTop: 10 }]}>Teléfono Celular:</Text>
                    <TextInput
                      style={styles.textInput}
                      placeholder="3001234567"
                      placeholderTextColor="#94A3B8"
                      value={regTelefono}
                      onChangeText={setRegTelefono}
                      keyboardType="phone-pad"
                    />

                    <Text style={[styles.inputLabel, { marginTop: 10 }]}>Contraseña (mínimo 8 caracteres):</Text>
                    <TextInput
                      style={styles.textInput}
                      placeholder="••••••••"
                      placeholderTextColor="#94A3B8"
                      value={regPassword}
                      onChangeText={setRegPassword}
                      secureTextEntry
                    />

                    <TouchableOpacity
                      style={[styles.solidBtn, { marginTop: 18 }]}
                      onPress={handleRegister}
                      disabled={authLoading}
                    >
                      {authLoading ? (
                        <ActivityIndicator color="#FFFFFF" />
                      ) : (
                        <Text style={styles.solidBtnText}>Registrarme como {regRol}</Text>
                      )}
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            )}
          </View>
        )}
      </ScrollView>

      {/* BARRA DE NAVEGACIÓN INFERIOR ADAPTATIVA POR ROL */}
      <View style={styles.bottomNav}>
        {/* Visitante o Rol CLIENTE */}
        {(!user || user.rol === "CLIENTE") && (
          <>
            <TouchableOpacity
              style={styles.navItem}
              onPress={() => navigateTo("explorar")}
            >
              <Text style={[styles.navIcon, activeTab === "explorar" && styles.navIconActive]}>🔍</Text>
              <Text style={[styles.navText, activeTab === "explorar" && styles.navTextActive]}>Explorar</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.navItem}
              onPress={() => navigateTo("carrito")}
            >
              <View>
                <Text style={[styles.navIcon, activeTab === "carrito" && styles.navIconActive]}>🛒</Text>
                {cart.length > 0 && (
                  <View style={styles.badgeCount}>
                    <Text style={styles.badgeCountText}>{cart.length}</Text>
                  </View>
                )}
              </View>
              <Text style={[styles.navText, activeTab === "carrito" && styles.navTextActive]}>Carrito</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.navItem}
              onPress={() => {
                navigateTo("mis_pedidos");
                fetchPedidosCliente();
              }}
            >
              <Text style={[styles.navIcon, activeTab === "mis_pedidos" && styles.navIconActive]}>📦</Text>
              <Text style={[styles.navText, activeTab === "mis_pedidos" && styles.navTextActive]}>Pedidos</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.navItem}
              onPress={() => navigateTo("perfil")}
            >
              <Text style={[styles.navIcon, activeTab === "perfil" && styles.navIconActive]}>👤</Text>
              <Text style={[styles.navText, activeTab === "perfil" && styles.navTextActive]}>
                {user ? "Mi Perfil" : "Ingresar"}
              </Text>
            </TouchableOpacity>
          </>
        )}

        {/* Rol COMERCIO */}
        {user?.rol === "COMERCIO" && (
          <>
            <TouchableOpacity
              style={styles.navItem}
              onPress={() => {
                navigateTo("comercio_cocina");
                fetchPedidosComercio();
              }}
            >
              <Text style={[styles.navIcon, activeTab === "comercio_cocina" && styles.navIconActive]}>🍳</Text>
              <Text style={[styles.navText, activeTab === "comercio_cocina" && styles.navTextActive]}>Cocina</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.navItem}
              onPress={() => navigateTo("explorar")}
            >
              <Text style={[styles.navIcon, activeTab === "explorar" && styles.navIconActive]}>📦</Text>
              <Text style={[styles.navText, activeTab === "explorar" && styles.navTextActive]}>Menú</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.navItem}
              onPress={() => navigateTo("perfil")}
            >
              <Text style={[styles.navIcon, activeTab === "perfil" && styles.navIconActive]}>👤</Text>
              <Text style={[styles.navText, activeTab === "perfil" && styles.navTextActive]}>Mi Negocio</Text>
            </TouchableOpacity>
          </>
        )}

        {/* Rol DOMICILIARIO */}
        {user?.rol === "DOMICILIARIO" && (
          <>
            <TouchableOpacity
              style={styles.navItem}
              onPress={() => {
                navigateTo("domi_disponibles");
                fetchPedidosDomiciliario();
              }}
            >
              <Text style={[styles.navIcon, activeTab === "domi_disponibles" && styles.navIconActive]}>🛵</Text>
              <Text style={[styles.navText, activeTab === "domi_disponibles" && styles.navTextActive]}>Despachos</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.navItem}
              onPress={() => navigateTo("perfil")}
            >
              <Text style={[styles.navIcon, activeTab === "perfil" && styles.navIconActive]}>👤</Text>
              <Text style={[styles.navText, activeTab === "perfil" && styles.navTextActive]}>Mi Perfil</Text>
            </TouchableOpacity>
          </>
        )}

        {/* Rol ADMINISTRADOR */}
        {user?.rol === "ADMIN" && (
          <>
            <TouchableOpacity
              style={styles.navItem}
              onPress={() => {
                navigateTo("admin_dashboard");
                fetchAdminData();
              }}
            >
              <Text style={[styles.navIcon, activeTab === "admin_dashboard" && styles.navIconActive]}>📊</Text>
              <Text style={[styles.navText, activeTab === "admin_dashboard" && styles.navTextActive]}>Dashboard</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.navItem}
              onPress={() => navigateTo("explorar")}
            >
              <Text style={[styles.navIcon, activeTab === "explorar" && styles.navIconActive]}>🏪</Text>
              <Text style={[styles.navText, activeTab === "explorar" && styles.navTextActive]}>Comercios</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.navItem}
              onPress={() => navigateTo("perfil")}
            >
              <Text style={[styles.navIcon, activeTab === "perfil" && styles.navIconActive]}>🛡️</Text>
              <Text style={[styles.navText, activeTab === "perfil" && styles.navTextActive]}>Admin</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </SafeAreaView>
  );
}

// ==========================================
// HELPERS
// ==========================================
function isStateReached(current: string, check: string) {
  const order = ["PENDIENTE", "CONFIRMADO", "PREPARANDO", "LISTO", "EN_CAMINO", "ENTREGADO"];
  const cIdx = order.indexOf(current);
  const kIdx = order.indexOf(check);
  return cIdx >= kIdx && kIdx !== -1;
}

function getStatusPillStyle(estado: string) {
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
      return { backgroundColor: "#E2E8F0" };
  }
}

// ==========================================
// ESTILOS VISUALES
// ==========================================
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Theme.background,
  },
  topHeader: {
    backgroundColor: Theme.primary,
    paddingHorizontal: 16,
    paddingTop: Platform.OS === "android" ? 10 : 8,
    paddingBottom: 14,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  topHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  logoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  logoIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "rgba(255,255,255,0.25)",
    alignItems: "center",
    justifyContent: "center",
  },
  logoIconText: {
    fontSize: 20,
  },
  brandTitle: {
    fontSize: 24,
    fontWeight: "900",
    color: "#FFFFFF",
    letterSpacing: 0.8,
  },
  brandTitleAccent: {
    color: "#A7F3D0",
  },
  brandSlogan: {
    fontSize: 11,
    color: "rgba(255,255,255,0.85)",
    fontWeight: "500",
  },
  topRightRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  connectionIndicator: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  connectionDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 4,
  },
  connectionText: {
    fontSize: 10,
    fontWeight: "bold",
  },
  userRoleTag: {
    backgroundColor: "rgba(0,0,0,0.3)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  userRoleTagText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "bold",
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    paddingHorizontal: 12,
    marginTop: 12,
    height: 44,
  },
  searchIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: Theme.text,
  },
  clearSearch: {
    fontSize: 14,
    color: "#94A3B8",
    padding: 4,
  },
  mainScrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  heroPromo: {
    backgroundColor: Theme.primaryDark,
    borderRadius: 16,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    elevation: 2,
  },
  promoTag: {
    backgroundColor: "#A7F3D0",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    alignSelf: "flex-start",
    marginBottom: 6,
  },
  promoTagText: {
    color: "#065F46",
    fontSize: 10,
    fontWeight: "bold",
  },
  heroPromoTitle: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "800",
  },
  heroPromoSub: {
    color: "rgba(255,255,255,0.85)",
    fontSize: 11,
    marginTop: 2,
  },
  heroPromoIcon: {
    fontSize: 38,
    marginLeft: 12,
  },
  categorySection: {
    marginBottom: 14,
  },
  categoryScroll: {
    gap: 8,
  },
  categoryChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: Theme.border,
  },
  categoryChipActive: {
    backgroundColor: Theme.primary,
    borderColor: Theme.primary,
  },
  categoryChipText: {
    fontSize: 12,
    fontWeight: "600",
    color: Theme.textMuted,
  },
  categoryChipTextActive: {
    color: "#FFFFFF",
    fontWeight: "bold",
  },
  sectionBlock: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: Theme.text,
    marginBottom: 10,
  },
  commerceCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: Theme.border,
    elevation: 1,
  },
  commerceAvatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: Theme.primaryLight,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  commerceAvatarText: {
    fontSize: 20,
    fontWeight: "bold",
    color: Theme.primary,
  },
  commerceCardTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: Theme.text,
  },
  commerceCardDesc: {
    fontSize: 11,
    color: Theme.textMuted,
    marginTop: 2,
  },
  commerceMetaRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
    gap: 4,
  },
  commerceMeta: {
    fontSize: 11,
    color: Theme.textMuted,
    fontWeight: "600",
  },
  commerceMetaDot: {
    fontSize: 11,
    color: Theme.textMuted,
  },
  commerceMetaPrice: {
    fontSize: 11,
    color: Theme.primary,
    fontWeight: "700",
  },
  cardArrow: {
    fontSize: 20,
    color: "#94A3B8",
    marginLeft: 8,
  },
  commerceHeaderCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Theme.border,
  },
  commerceDetailTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: Theme.text,
  },
  commerceDetailSub: {
    fontSize: 12,
    color: Theme.textMuted,
    marginTop: 2,
  },
  commerceDetailPhone: {
    fontSize: 12,
    color: Theme.primary,
    fontWeight: "600",
    marginTop: 6,
  },
  productCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: Theme.border,
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 14,
    fontWeight: "700",
    color: Theme.text,
  },
  productDesc: {
    fontSize: 11,
    color: Theme.textMuted,
    marginTop: 2,
  },
  productPrice: {
    fontSize: 13,
    fontWeight: "800",
    color: Theme.primary,
    marginTop: 6,
  },
  addBtn: {
    backgroundColor: Theme.primaryLight,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Theme.primary,
  },
  addBtnText: {
    color: Theme.primaryDark,
    fontSize: 11,
    fontWeight: "bold",
  },
  cardContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Theme.border,
  },
  pageTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: Theme.text,
  },
  subHeading: {
    fontSize: 14,
    fontWeight: "700",
    color: Theme.text,
  },
  subtext: {
    fontSize: 12,
    color: Theme.textMuted,
  },
  helperText: {
    fontSize: 12,
    color: Theme.textMuted,
    marginTop: 8,
  },
  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  linkAction: {
    fontSize: 12,
    color: Theme.primary,
    fontWeight: "700",
  },
  backLink: {
    marginBottom: 10,
  },
  backLinkText: {
    fontSize: 12,
    color: Theme.primary,
    fontWeight: "700",
  },
  emptyCard: {
    padding: 24,
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Theme.border,
  },
  emptyIcon: {
    fontSize: 36,
    marginBottom: 8,
  },
  emptyCardTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: Theme.text,
  },
  emptyCardText: {
    fontSize: 12,
    color: Theme.textMuted,
    textAlign: "center",
    marginTop: 4,
  },
  cartRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: Theme.border,
  },
  cartItemTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: Theme.text,
  },
  cartItemPrice: {
    fontSize: 11,
    color: Theme.textMuted,
    marginTop: 2,
  },
  qtyBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Theme.background,
    borderRadius: 8,
  },
  qtyBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  qtyBtnText: {
    fontSize: 14,
    fontWeight: "bold",
    color: Theme.text,
  },
  qtyNumber: {
    fontSize: 12,
    fontWeight: "bold",
    paddingHorizontal: 4,
  },
  billingCard: {
    backgroundColor: Theme.background,
    borderRadius: 10,
    padding: 12,
    marginTop: 14,
  },
  billingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  billingLabel: {
    fontSize: 12,
    color: Theme.textMuted,
  },
  billingVal: {
    fontSize: 12,
    fontWeight: "600",
    color: Theme.text,
  },
  billingTotalRow: {
    borderTopWidth: 1,
    borderTopColor: Theme.border,
    paddingTop: 6,
    marginTop: 4,
  },
  billingTotalLabel: {
    fontSize: 14,
    fontWeight: "800",
    color: Theme.text,
  },
  billingTotalVal: {
    fontSize: 15,
    fontWeight: "900",
    color: Theme.primary,
  },
  solidBtn: {
    backgroundColor: Theme.primary,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  solidBtnText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "800",
  },
  outlineBtn: {
    borderWidth: 1,
    borderColor: Theme.border,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: "center",
  },
  orderListItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Theme.border,
  },
  orderNumberTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: Theme.text,
  },
  orderSubtitle: {
    fontSize: 11,
    color: Theme.textMuted,
    marginTop: 2,
  },
  orderPriceTag: {
    fontSize: 12,
    fontWeight: "700",
    color: Theme.primary,
    marginTop: 2,
  },
  statusPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  statusPillText: {
    fontSize: 10,
    fontWeight: "bold",
    color: Theme.text,
  },
  orderHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  orderHeaderId: {
    fontSize: 16,
    fontWeight: "800",
    color: Theme.text,
  },
  timelineRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
    marginBottom: 8,
  },
  timelineStep: {
    alignItems: "center",
    flex: 1,
  },
  timelineNode: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#E2E8F0",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  timelineNodeActive: {
    backgroundColor: Theme.accent,
  },
  timelineNodeText: {
    color: "#FFFFFF",
    fontSize: 9,
    fontWeight: "bold",
  },
  timelineStepText: {
    fontSize: 7.5,
    color: "#94A3B8",
    textAlign: "center",
    fontWeight: "600",
  },
  timelineStepTextActive: {
    color: Theme.primaryDark,
    fontWeight: "bold",
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: Theme.border,
  },
  detailQty: {
    fontSize: 12,
    fontWeight: "bold",
    color: Theme.primary,
    width: 26,
  },
  detailName: {
    fontSize: 12,
    color: Theme.text,
    flex: 1,
  },
  detailSubtotal: {
    fontSize: 12,
    fontWeight: "600",
    color: Theme.text,
  },
  kitchenCard: {
    backgroundColor: Theme.background,
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: Theme.border,
  },
  kitchenPrice: {
    fontSize: 12,
    fontWeight: "bold",
    color: Theme.text,
  },
  kitchenNotes: {
    fontSize: 11,
    color: Theme.textMuted,
    marginTop: 2,
  },
  actionButtonRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 10,
  },
  smallActionBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 6,
    alignItems: "center",
  },
  smallActionText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "bold",
  },
  metricsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 12,
  },
  metricCard: {
    width: "48%",
    backgroundColor: Theme.primaryLight,
    padding: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  metricNumber: {
    fontSize: 22,
    fontWeight: "900",
    color: Theme.primaryDark,
  },
  metricTitle: {
    fontSize: 11,
    color: Theme.textMuted,
    fontWeight: "600",
    marginTop: 2,
  },
  adminUserRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: Theme.border,
  },
  adminUserName: {
    fontSize: 13,
    fontWeight: "700",
    color: Theme.text,
  },
  adminUserEmail: {
    fontSize: 11,
    color: Theme.textMuted,
  },
  profileHeader: {
    alignItems: "center",
    paddingVertical: 16,
  },
  profileAvatarBig: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Theme.primary,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  profileAvatarBigText: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  profileFullName: {
    fontSize: 16,
    fontWeight: "800",
    color: Theme.text,
  },
  profileEmailText: {
    fontSize: 12,
    color: Theme.textMuted,
    marginTop: 2,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: Theme.border,
  },
  infoLabel: {
    fontSize: 12,
    color: Theme.textMuted,
  },
  infoValue: {
    fontSize: 12,
    fontWeight: "bold",
    color: Theme.text,
  },
  authToggleRow: {
    flexDirection: "row",
    borderRadius: 10,
    backgroundColor: Theme.background,
    padding: 3,
  },
  authToggleBtn: {
    flex: 1,
    paddingVertical: 8,
    alignItems: "center",
    borderRadius: 8,
  },
  authToggleBtnActive: {
    backgroundColor: "#FFFFFF",
    elevation: 1,
  },
  authToggleText: {
    fontSize: 12,
    color: Theme.textMuted,
    fontWeight: "600",
  },
  authToggleTextActive: {
    color: Theme.primary,
    fontWeight: "bold",
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: Theme.text,
    marginBottom: 4,
  },
  textInput: {
    borderWidth: 1,
    borderColor: Theme.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 13,
    backgroundColor: "#FFFFFF",
    color: Theme.text,
  },
  roleSelectionRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 6,
  },
  roleSelectCard: {
    flex: 1,
    borderWidth: 1,
    borderColor: Theme.border,
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: "center",
    backgroundColor: "#FFFFFF",
  },
  roleSelectCardActive: {
    borderColor: Theme.primary,
    backgroundColor: Theme.primaryLight,
  },
  roleEmoji: {
    fontSize: 18,
    marginBottom: 2,
  },
  roleCardTitle: {
    fontSize: 11,
    fontWeight: "600",
    color: Theme.textMuted,
  },
  roleCardTitleActive: {
    color: Theme.primaryDark,
    fontWeight: "bold",
  },
  bottomNav: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: Theme.border,
    paddingVertical: 8,
    paddingBottom: Platform.OS === "android" ? 10 : 8,
  },
  navItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  navIcon: {
    fontSize: 18,
    color: "#94A3B8",
  },
  navIconActive: {
    color: Theme.primary,
  },
  navText: {
    fontSize: 10,
    color: "#64748B",
    fontWeight: "600",
    marginTop: 2,
  },
  navTextActive: {
    color: Theme.primary,
    fontWeight: "bold",
  },
  badgeCount: {
    position: "absolute",
    top: -4,
    right: -8,
    backgroundColor: Theme.danger,
    borderRadius: 8,
    paddingHorizontal: 4,
    paddingVertical: 1,
  },
  badgeCountText: {
    color: "#FFFFFF",
    fontSize: 9,
    fontWeight: "bold",
  },
});
