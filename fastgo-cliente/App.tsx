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
  Image,
  Modal,
  Switch,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as ImagePicker from "expo-image-picker";

// URL de pruebas locales mediante ADB reverse en dispositivo fisico
const DEFAULT_API_URL = "http://localhost:8080";

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
  horaApertura?: string;
  horaCierre?: string;
  diasAtencion?: string;
  tiempoPreparacionMin?: number;
  pausaManual?: boolean;
  metodosPago?: string;
  abierto?: boolean;
  dentroDeHorario?: boolean;
  mensajeEstado?: string;
  tarifaDomicilio?: number;
  bancolombiaActivo?: boolean;
  bancolombiaTipoCuenta?: string;
  bancolombiaNumeroCuenta?: string;
  bancolombiaTitular?: string;
  bancolombiaDocTitular?: string;
  logo?: string;
  banner?: string;
  logoUrl?: string;
  bannerUrl?: string;
}

interface Producto {
  id: number;
  nombre: string;
  descripcion?: string;
  precio: number;
  disponible?: boolean;
  stock?: number;
  sucursalId?: number;
  categoriaId?: number;
  categoria?: string;
  imagenUrl?: string;
  imagenPrincipal?: string;
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
  activeRole?: "CLIENTE" | "COMERCIO" | "DOMICILIARIO" | "ADMIN";
  availableRoles?: ("CLIENTE" | "COMERCIO" | "DOMICILIARIO" | "ADMIN")[];
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
  metodoPago?: string;
  estadoPago?: "PENDIENTE_VERIFICACION" | "APROBADO" | "RECHAZADO" | string;
  comprobantePagoUrl?: string | null;
  clienteNombre?: string;
  clienteTelefono?: string;
  direccionTexto?: string;
  origenNombre?: string;
  origenDireccion?: string;
  comercioNombre?: string;
  comercioDireccion?: string;
  distanciaKm?: number;
  creadoEn?: string;
}

interface DetallePedidoItem {
  id: number;
  pedidoId: number;
  productoId: number;
  productoNombre?: string;
  cantidad: number;
  precio: number;
  subtotal: number;
}

// ==========================================
// SESIÓN PERSISTENTE SEGURA
// ==========================================
const STORAGE_KEYS = {
  TOKEN: "fastgo_auth_token",
  USER: "fastgo_auth_user",
};

const getStoredSession = async (): Promise<{ token: string; user: UserProfile } | null> => {
  try {
    let savedToken: string | null = null;
    let savedUserStr: string | null = null;
    if (AsyncStorage) {
      savedToken = await AsyncStorage.getItem(STORAGE_KEYS.TOKEN);
      savedUserStr = await AsyncStorage.getItem(STORAGE_KEYS.USER);
    }
    if (!savedToken && typeof globalThis !== "undefined" && (globalThis as any).localStorage) {
      savedToken = (globalThis as any).localStorage.getItem(STORAGE_KEYS.TOKEN);
      savedUserStr = (globalThis as any).localStorage.getItem(STORAGE_KEYS.USER);
    }
    if (savedToken && savedUserStr) {
      return { token: savedToken, user: JSON.parse(savedUserStr) };
    }
  } catch {}
  return null;
};

const persistSession = async (jwt: string | null, profile: UserProfile | null) => {
  try {
    if (jwt && profile) {
      if (AsyncStorage) {
        await AsyncStorage.setItem(STORAGE_KEYS.TOKEN, jwt);
        await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(profile));
      }
      if (typeof globalThis !== "undefined" && (globalThis as any).localStorage) {
        (globalThis as any).localStorage.setItem(STORAGE_KEYS.TOKEN, jwt);
        (globalThis as any).localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(profile));
      }
    } else {
      if (AsyncStorage) {
        await AsyncStorage.removeItem(STORAGE_KEYS.TOKEN);
        await AsyncStorage.removeItem(STORAGE_KEYS.USER);
      }
      if (typeof globalThis !== "undefined" && (globalThis as any).localStorage) {
        (globalThis as any).localStorage.removeItem(STORAGE_KEYS.TOKEN);
        (globalThis as any).localStorage.removeItem(STORAGE_KEYS.USER);
      }
    }
  } catch {}
};

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
  const [authMode, setAuthMode] = useState<"login" | "register" | "forgot_password" | "reset_password">("login");
  const [authLoading, setAuthLoading] = useState<boolean>(false);
  const [isInitializing, setIsInitializing] = useState<boolean>(true);

  // Recuperación de Contraseña State
  const [forgotEmail, setForgotEmail] = useState<string>("");
  const [resetToken, setResetToken] = useState<string>("");
  const [resetNewPassword, setResetNewPassword] = useState<string>("");
  const [resetConfirmPassword, setResetConfirmPassword] = useState<string>("");
  const [showResetPassword, setShowResetPassword] = useState<boolean>(false);
  const [showResetConfirmPassword, setShowResetConfirmPassword] = useState<boolean>(false);

  // Multi-Rol y Selector
  const [showRoleModal, setShowRoleModal] = useState<boolean>(false);
  const [pendingRoles, setPendingRoles] = useState<string[]>([]);
  const [switchingRole, setSwitchingRole] = useState<boolean>(false);

  // Comercio y Tienda Propia
  const [comercioPropio, setComercioPropio] = useState<any>(null);
  const [togglingPause, setTogglingPause] = useState<boolean>(false);

  // Método de Pago Seleccionado
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>("EFECTIVO");

  // Formulario Login
  const [loginEmail, setLoginEmail] = useState<string>("");
  const [loginPassword, setLoginPassword] = useState<string>("");
  const [showLoginPassword, setShowLoginPassword] = useState<boolean>(false);

  // Formulario Registro con selección de rol permitida y confirmación
  const [regNombre, setRegNombre] = useState<string>("");
  const [regApellido, setRegApellido] = useState<string>("");
  const [regCorreo, setRegCorreo] = useState<string>("");
  const [regTelefono, setRegTelefono] = useState<string>("");
  const [regPassword, setRegPassword] = useState<string>("");
  const [regConfirmPassword, setRegConfirmPassword] = useState<string>("");
  const [showRegPassword, setShowRegPassword] = useState<boolean>(false);
  const [showRegConfirmPassword, setShowRegConfirmPassword] = useState<boolean>(false);
  const [regRol, setRegRol] = useState<"CLIENTE" | "COMERCIO" | "DOMICILIARIO">("CLIENTE");
  const [reusableData, setReusableData] = useState<{
    nombre?: string;
    apellido?: string;
    telefono?: string;
    rolesExistentes: string[];
  } | null>(null);

  // Encomiendas Urbanas State
  const [encomiendasCliente, setEncomiendasCliente] = useState<any[]>([]);
  const [encomiendasDisponibles, setEncomiendasDisponibles] = useState<any[]>([]);
  const [misEncomiendasDomi, setMisEncomiendasDomi] = useState<any[]>([]);
  const [encomiendaTab, setEncomiendaTab] = useState<"nueva" | "mis_envios">("nueva");
  const [domiServiceTab, setDomiServiceTab] = useState<"pedidos" | "encomiendas">("pedidos");

  // Formulario de Encomienda
  const [encRemitenteNombre, setEncRemitenteNombre] = useState<string>("");
  const [encRemitenteTel, setEncRemitenteTel] = useState<string>("");
  const [encOrigen, setEncOrigen] = useState<string>("");
  const [encDestinatarioNombre, setEncDestinatarioNombre] = useState<string>("");
  const [encDestinatarioTel, setEncDestinatarioTel] = useState<string>("");
  const [encDestino, setEncDestino] = useState<string>("");
  const [encDescripcion, setEncDescripcion] = useState<string>("");
  const [encTamano, setEncTamano] = useState<string>("Pequeño (< 2kg)");
  const [encDistanciaKm, setEncDistanciaKm] = useState<number>(2.0);
  const [encTarifaAceptada, setEncTarifaAceptada] = useState<boolean>(false);
  const [encSubmitting, setEncSubmitting] = useState<boolean>(false);

  // Catálogos y Exploración
  const [comercios, setComercios] = useState<Comercio[]>([]);
  const [productos, setProductos] = useState<Producto[]>([]);
  const [selectedComercio, setSelectedComercio] = useState<Comercio | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("Todos");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Carrito de compras
  const [cart, setCart] = useState<CartItem[]>([]);
  const [metodoPagoSeleccionado, setMetodoPagoSeleccionado] = useState<string>("EFECTIVO");

  // Pedidos Cliente
  const [pedidosCliente, setPedidosCliente] = useState<PedidoItem[]>([]);
  const [selectedPedido, setSelectedPedido] = useState<PedidoItem | null>(null);
  const [pedidoDetalles, setPedidoDetalles] = useState<DetallePedidoItem[]>([]);
  const [loadingDetalles, setLoadingDetalles] = useState<boolean>(false);

  // Comercio
  const [pedidosComercio, setPedidosComercio] = useState<PedidoItem[]>([]);
  const [expandedKitchenOrders, setExpandedKitchenOrders] = useState<Record<number, DetallePedidoItem[]>>({});
  const [loadingKitchenDetails, setLoadingKitchenDetails] = useState<Record<number, boolean>>({});

  // Domiciliario
  const [pedidosDisponibles, setPedidosDisponibles] = useState<PedidoItem[]>([]);
  const [misEntregas, setMisEntregas] = useState<PedidoItem[]>([]);

  // Administrador
  const [adminUsuarios, setAdminUsuarios] = useState<any[]>([]);
  const [adminCategorias, setAdminCategorias] = useState<any[]>([]);

  // Pull to refresh
  const [refreshing, setRefreshing] = useState<boolean>(false);

  // Bancolombia Checkout Comprobante State
  const [checkoutComprobanteUrl, setCheckoutComprobanteUrl] = useState<string | null>(null);
  const [checkoutComprobanteAsset, setCheckoutComprobanteAsset] = useState<any | null>(null);
  const [isUploadingComprobante, setIsUploadingComprobante] = useState<boolean>(false);
  const [viewingReceiptUrl, setViewingReceiptUrl] = useState<string | null>(null);

  // Configuración de Comercio Propio (Tarifa y Bancolombia)
  const [storeTarifaDomicilio, setStoreTarifaDomicilio] = useState<string>("2000");
  const [storeBancolombiaActivo, setStoreBancolombiaActivo] = useState<boolean>(false);
  const [storeBancolombiaTipoCuenta, setStoreBancolombiaTipoCuenta] = useState<string>("AHORROS");
  const [storeBancolombiaNumeroCuenta, setStoreBancolombiaNumeroCuenta] = useState<string>("");
  const [storeBancolombiaTitular, setStoreBancolombiaTitular] = useState<string>("");
  const [storeBancolombiaDocTitular, setStoreBancolombiaDocTitular] = useState<string>("");
  const [storeLogoUrl, setStoreLogoUrl] = useState<string>("");
  const [storeBannerUrl, setStoreBannerUrl] = useState<string>("");
  const [isSavingStoreConfig, setIsSavingStoreConfig] = useState<boolean>(false);
  const [isUploadingStoreLogo, setIsUploadingStoreLogo] = useState<boolean>(false);
  const [isUploadingStoreBanner, setIsUploadingStoreBanner] = useState<boolean>(false);

  // Gestión de Productos del Comercio
  const [showProductModal, setShowProductModal] = useState<boolean>(false);
  const [editingProduct, setEditingProduct] = useState<Producto | null>(null);
  const [prodFormNombre, setProdFormNombre] = useState<string>("");
  const [prodFormDesc, setProdFormDesc] = useState<string>("");
  const [prodFormPrecio, setProdFormPrecio] = useState<string>("");
  const [prodFormCategoria, setProdFormCategoria] = useState<string>("Plato Principal");
  const [prodFormDisponible, setProdFormDisponible] = useState<boolean>(true);
  const [prodFormImagen, setProdFormImagen] = useState<string>("");
  const [isUploadingProductImage, setIsUploadingProductImage] = useState<boolean>(false);
  const [isSavingProduct, setIsSavingProduct] = useState<boolean>(false);

  // Helper para resolver URLs de imágenes
  const resolveMediaUrl = (url?: string | null): string | null => {
    if (!url) return null;
    if (url.startsWith("http://") || url.startsWith("https://")) return url;
    if (url.startsWith("/")) return `${apiUrl}${url}`;
    return `${apiUrl}/api/uploads/${url}`;
  };

  // Helper robusto para subidas multipart nativas en Android/iOS usando XMLHttpRequest (OkHttp)
  // Evita el error 'Unsupported FormDataPart implementation' de Expo Fetch al usar streaming nativo
  const uploadMultipartAsync = (
    url: string,
    method: string,
    authToken: string | null,
    fieldName: string,
    fileAsset: { uri: string; fileName?: string | null; mimeType?: string | null }
  ): Promise<{ ok: boolean; status: number; data: any; json: () => Promise<any>; text: () => Promise<string> }> => {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open(method, url, true);
      xhr.timeout = 60000;

      if (authToken) {
        xhr.setRequestHeader("Authorization", `Bearer ${authToken}`);
      }
      // NOTA: NO agregar header Content-Type manualmente.
      // React Native / OkHttp genera automáticamente el multipart/form-data con su boundary único.

      xhr.onload = () => {
        let parsedData: any = {};
        const rawText = xhr.responseText || "";
        try {
          if (rawText) {
            parsedData = JSON.parse(rawText);
          }
        } catch {
          parsedData = { message: rawText || "Respuesta del servidor recibida" };
        }
        resolve({
          ok: xhr.status >= 200 && xhr.status < 300,
          status: xhr.status,
          data: parsedData,
          json: async () => parsedData,
          text: async () => rawText,
        });
      };

      xhr.onerror = () => {
        reject(new Error("Error de red al conectar con el servidor para la subida."));
      };

      xhr.ontimeout = () => {
        reject(new Error("Tiempo de espera agotado al transferir el archivo al servidor."));
      };

      const uri = fileAsset.uri;
      let filename = fileAsset.fileName || uri.split("/").pop() || "upload.jpg";
      if (!filename.includes(".")) {
        const ext = fileAsset.mimeType ? fileAsset.mimeType.split("/")[1] : "jpg";
        filename = `${filename}.${ext}`;
      }

      let mimeType = fileAsset.mimeType;
      if (!mimeType) {
        const ext = filename.split(".").pop()?.toLowerCase();
        if (ext === "png") mimeType = "image/png";
        else if (ext === "webp") mimeType = "image/webp";
        else if (ext === "pdf") mimeType = "application/pdf";
        else mimeType = "image/jpeg";
      }

      const formData = new FormData();
      formData.append(fieldName, {
        uri: Platform.OS === "android" ? uri : uri.replace("file://", ""),
        name: filename,
        type: mimeType,
      } as any);

      xhr.send(formData);
    });
  };

  // Helper para seleccionar y cargar imágenes al backend
  const pickAndUploadImage = async (
    onSuccess: (url: string) => void,
    setLoadingState?: (loading: boolean) => void
  ) => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permissionResult.granted) {
        Alert.alert(
          "Permiso Requerido",
          "Se necesita acceso a la galería para seleccionar imágenes."
        );
        return;
      }

      const pickerResult = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        quality: 0.8,
      });

      if (pickerResult.canceled || !pickerResult.assets || pickerResult.assets.length === 0) {
        return;
      }

      if (setLoadingState) setLoadingState(true);

      const asset = pickerResult.assets[0];
      const res = await uploadMultipartAsync(
        `${apiUrl}/api/uploads`,
        "POST",
        token,
        "file",
        {
          uri: asset.uri,
          fileName: asset.fileName,
          mimeType: asset.mimeType,
        }
      );

      if (res.ok) {
        const data = res.data;
        const finalUrl = data.url || data.fileName || "";
        onSuccess(finalUrl);
        Alert.alert("Imagen Cargada", "La imagen se subió exitosamente al servidor.");
      } else {
        const err = res.data || {};
        Alert.alert("Error de subida", err.message || "No se pudo subir la imagen.");
      }
    } catch (err: any) {
      Alert.alert("Error", err.message || "Error al seleccionar o subir el archivo.");
    } finally {
      if (setLoadingState) setLoadingState(false);
    }
  };

  // Helper para seleccionar comprobante bancario privado de forma local
  const pickComprobanteLocal = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permissionResult.granted) {
        Alert.alert(
          "Permiso Requerido",
          "Se necesita acceso a la galería para seleccionar el comprobante."
        );
        return;
      }

      const pickerResult = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        quality: 0.8,
      });

      if (pickerResult.canceled || !pickerResult.assets || pickerResult.assets.length === 0) {
        return;
      }

      const asset = pickerResult.assets[0];
      setCheckoutComprobanteAsset(asset);
      setCheckoutComprobanteUrl(asset.uri);
      Alert.alert("Comprobante Seleccionado", "Comprobante listo. Se enviará de forma privada y protegida al confirmar el pedido.");
    } catch (err: any) {
      Alert.alert("Error", err.message || "Error al seleccionar el comprobante.");
    }
  };

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
      const healthRes = await fetch(`${targetUrl}/api/health`, {
        headers: { Accept: "application/json" },
      });
      const dur = Date.now() - tStart;
      setLatency(dur);
      if (healthRes.ok) {
        setNetworkStatus("connected");
        loadComercios(targetUrl);
      } else {
        setNetworkStatus("error");
      }
    } catch {
      setNetworkStatus("error");
    }
  };

  const loadComercios = async (baseUrl = apiUrl) => {
    try {
      const res = await fetch(`${baseUrl}/api/comercios`, {
        headers: { Accept: "application/json" },
      });
      if (res.ok) {
        const data = await res.json();
        setComercios(data);
        loadProducts(baseUrl);
      }
    } catch {}
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
    const initApp = async () => {
      checkConnection(apiUrl);

      const saved = await getStoredSession();
      if (saved && saved.token) {
        try {
          const meRes = await fetch(`${apiUrl}/api/usuarios/me`, {
            headers: { Authorization: `Bearer ${saved.token}`, Accept: "application/json" },
          });
          if (meRes.ok) {
            const profile: UserProfile = await meRes.json();
            setToken(saved.token);
            setUser(profile);
            persistSession(saved.token, profile);
            routeUserToDashboard(profile.activeRole || profile.rol, saved.token);
            setIsInitializing(false);
            return;
          } else {
            persistSession(null, null);
          }
        } catch {
          if (saved.user) {
            setToken(saved.token);
            setUser(saved.user);
            routeUserToDashboard(saved.user.activeRole || saved.user.rol, saved.token);
            setIsInitializing(false);
            return;
          }
        }
      }

      setToken(null);
      setUser(null);
      setIsInitializing(false);
    };

    initApp();
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await checkConnection(apiUrl);
    if (token && user) {
      if (user.rol === "CLIENTE") {
        await fetchPedidosCliente();
        await fetchEncomiendasCliente();
      }
      if (user.rol === "COMERCIO") await fetchPedidosComercio();
      if (user.rol === "DOMICILIARIO") {
        await fetchPedidosDomiciliario();
        await fetchEncomiendasDomi();
      }
      if (user.rol === "ADMIN") await fetchAdminData();
    }
    setRefreshing(false);
  }, [apiUrl, token, user]);

  // ==========================================
  // AUTENTICACIÓN Y REGISTRO MULTI-ROL
  // ==========================================
  const routeUserToDashboard = (role: string, jwt = token) => {
    if (role === "CLIENTE") {
      navigateTo("explorar");
      fetchPedidosCliente(jwt);
      fetchEncomiendasCliente(jwt);
    } else if (role === "COMERCIO") {
      navigateTo("comercio_cocina");
      fetchPedidosComercio(jwt);
      fetchComercioPropio(jwt);
    } else if (role === "DOMICILIARIO") {
      navigateTo("domi_disponibles");
      fetchPedidosDomiciliario(jwt);
      fetchEncomiendasDomi(jwt);
    } else if (role === "ADMIN") {
      navigateTo("admin_dashboard");
      fetchAdminData(jwt);
    }
  };

  const handleSwitchRole = async (targetRole: string) => {
    if (!token) return;
    setSwitchingRole(true);
    try {
      const res = await fetch(`${apiUrl}/api/auth/cambiar-rol`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ nuevoRol: targetRole }),
      });
      if (res.ok) {
        const data = await res.json();
        setToken(data.token);
        const meRes = await fetch(`${apiUrl}/api/usuarios/me`, {
          headers: { Authorization: `Bearer ${data.token}` },
        });
        if (meRes.ok) {
          const profile: UserProfile = await meRes.json();
          setUser(profile);
          persistSession(data.token, profile);
          setShowRoleModal(false);
          routeUserToDashboard(targetRole, data.token);
          Alert.alert("Perfil Actualizado", `Has ingresado con éxito como ${targetRole}.`);
        }
      } else {
        Alert.alert("Error", "No fue posible cambiar al rol seleccionado.");
      }
    } catch (e: any) {
      Alert.alert("Error de Red", e.message || "Error al cambiar de perfil.");
    } finally {
      setSwitchingRole(false);
    }
  };

  const fetchComercioPropio = async (jwt = token) => {
    if (!jwt) return;
    try {
      const res = await fetch(`${apiUrl}/api/comercios/propio`, {
        headers: { Authorization: `Bearer ${jwt}`, Accept: "application/json" },
      });
      if (res.ok) {
        const data = await res.json();
        setComercioPropio(data);
        setStoreTarifaDomicilio(String(data.tarifaDomicilio || 2000));
        setStoreBancolombiaActivo(Boolean(data.bancolombiaActivo));
        setStoreBancolombiaTipoCuenta(data.bancolombiaTipoCuenta || "AHORROS");
        setStoreBancolombiaNumeroCuenta(data.bancolombiaNumeroCuenta || "");
        setStoreBancolombiaTitular(data.bancolombiaTitular || "");
        setStoreBancolombiaDocTitular(data.bancolombiaDocTitular || "");
        setStoreLogoUrl(data.logo || data.logoUrl || "");
        setStoreBannerUrl(data.banner || data.bannerUrl || "");
      }
    } catch {}
  };

  const handleSaveStoreConfig = async () => {
    if (!token || !comercioPropio) return;
    const tarifaNum = parseFloat(storeTarifaDomicilio);
    if (isNaN(tarifaNum) || tarifaNum < 2000) {
      Alert.alert("Tarifa Inválida", "La tarifa mínima de domicilio permitida por la plataforma es de $2.000 COP.");
      return;
    }
    setIsSavingStoreConfig(true);
    try {
      const payload = {
        nombre: comercioPropio.nombre,
        categoriaId: comercioPropio.categoriaId || 1,
        descripcion: comercioPropio.descripcion || "",
        telefono: comercioPropio.telefono || "",
        correo: comercioPropio.correo || "",
        direccion: comercioPropio.direccion || "",
        ciudad: comercioPropio.ciudad || "Bogotá",
        logo: storeLogoUrl,
        banner: storeBannerUrl,
        nit: comercioPropio.nit || "",
        activo: comercioPropio.activo ?? true,
        metodosPago: comercioPropio.metodosPago || "EFECTIVO, TARJETA, PSE, TRANSFERENCIA",
        horaApertura: comercioPropio.horaApertura || "08:00",
        horaCierre: comercioPropio.horaCierre || "20:00",
        diasAtencion: comercioPropio.diasAtencion || "Lunes a Domingo",
        tiempoPreparacionMin: comercioPropio.tiempoPreparacionMin || 25,
        pausaManual: comercioPropio.pausaManual ?? false,
        tarifaDomicilio: tarifaNum,
        bancolombiaActivo: storeBancolombiaActivo,
        bancolombiaTipoCuenta: storeBancolombiaTipoCuenta,
        bancolombiaNumeroCuenta: storeBancolombiaNumeroCuenta,
        bancolombiaTitular: storeBancolombiaTitular,
        bancolombiaDocTitular: storeBancolombiaDocTitular,
      };

      const res = await fetch(`${apiUrl}/api/comercios/propio`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const updated = await res.json();
        setComercioPropio(updated);
        Alert.alert("Éxito", "Configuración de comercio y Bancolombia guardada correctamente.");
        loadComercios();
      } else {
        const err = await res.json().catch(() => ({}));
        Alert.alert("Error", err.message || "No se pudo actualizar la configuración.");
      }
    } catch (e: any) {
      Alert.alert("Error", e.message || "Error al conectar con el servidor.");
    } finally {
      setIsSavingStoreConfig(false);
    }
  };

  const handleOpenProductModal = (prod?: Producto) => {
    if (prod) {
      setEditingProduct(prod);
      setProdFormNombre(prod.nombre);
      setProdFormDesc(prod.descripcion || "");
      setProdFormPrecio(String(prod.precio));
      setProdFormCategoria(prod.categoria || "Plato Principal");
      setProdFormDisponible(prod.disponible ?? true);
      setProdFormImagen(prod.imagenPrincipal || prod.imagenUrl || "");
    } else {
      setEditingProduct(null);
      setProdFormNombre("");
      setProdFormDesc("");
      setProdFormPrecio("");
      setProdFormCategoria("Plato Principal");
      setProdFormDisponible(true);
      setProdFormImagen("");
    }
    setShowProductModal(true);
  };

  const handleSaveProduct = async () => {
    if (!prodFormNombre.trim()) {
      Alert.alert("Campo requerido", "Ingresa el nombre del producto.");
      return;
    }
    const precioNum = parseFloat(prodFormPrecio);
    if (isNaN(precioNum) || precioNum <= 0) {
      Alert.alert("Precio inválido", "Ingresa un precio válido mayor a 0.");
      return;
    }
    setIsSavingProduct(true);
    try {
      const payload = {
        nombre: prodFormNombre.trim(),
        descripcion: prodFormDesc.trim(),
        precio: precioNum,
        categoriaId: editingProduct?.categoriaId || 1,
        categoria: prodFormCategoria,
        disponible: prodFormDisponible,
        imagenPrincipal: prodFormImagen || undefined,
        imagenUrl: prodFormImagen || undefined,
        sucursalId: comercioPropio?.sucursalId || comercioPropio?.id || 1,
        tiempoPreparacion: 15,
        destacado: false,
        stock: 50,
      };

      const url = editingProduct
        ? `${apiUrl}/api/productos/${editingProduct.id}`
        : `${apiUrl}/api/productos`;
      const method = editingProduct ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        Alert.alert("Éxito", `Producto ${editingProduct ? "actualizado" : "creado"} correctamente.`);
        setShowProductModal(false);
        loadComercios();
      } else {
        const err = await res.json().catch(() => ({}));
        Alert.alert("Error", err.message || "No se pudo guardar el producto.");
      }
    } catch (e: any) {
      Alert.alert("Error", e.message || "Error al conectar con el servidor.");
    } finally {
      setIsSavingProduct(false);
    }
  };

  const handleTogglePausaTienda = async () => {
    if (!token || !comercioPropio) return;
    setTogglingPause(true);
    try {
      const nuevoEstado = !comercioPropio.pausaManual;
      const res = await fetch(`${apiUrl}/api/comercios/${comercioPropio.id}/pausa-manual?pausaManual=${nuevoEstado}`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const updated = await res.json();
        setComercioPropio(updated);
        Alert.alert("Tienda Actualizada", `La tienda ha sido ${nuevoEstado ? "PAUSADA temporalmente" : "REANUDADA para recibir pedidos"}.`);
      }
    } catch (e: any) {
      Alert.alert("Error", e.message || "Error al cambiar pausa.");
    } finally {
      setTogglingPause(false);
    }
  };

  const handleToggleProductoDisponibilidad = async (prodId: number, estadoActual: boolean) => {
    if (!token) return;
    try {
      const nuevo = !estadoActual;
      const res = await fetch(`${apiUrl}/api/productos/${prodId}/disponibilidad?disponible=${nuevo}`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setProductos((prev) =>
          prev.map((p) => (p.id === prodId ? { ...p, disponible: nuevo } : p))
        );
        Alert.alert("Producto Actualizado", `Disponibilidad cambiada a ${nuevo ? "DISPONIBLE" : "AGOTADO"}.`);
      }
    } catch (e: any) {
      Alert.alert("Error", e.message || "Error al actualizar producto.");
    }
  };

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
          persistSession(jwt, profile);
          setLoginEmail("");
          setLoginPassword("");

          const roles = authData.availableRoles || profile.availableRoles || [profile.rol];
          if (roles.length > 1) {
            setPendingRoles(roles);
            setShowRoleModal(true);
            return;
          }

          routeUserToDashboard(profile.activeRole || profile.rol, jwt);
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

  const handleForgotPassword = async () => {
    if (!forgotEmail.trim()) {
      Alert.alert("Atención", "Por favor ingresa tu correo electrónico.");
      return;
    }
    setAuthLoading(true);
    try {
      const res = await fetch(`${apiUrl}/api/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ correo: forgotEmail.trim() }),
      });
      const data = await res.json();
      Alert.alert(
        "Instrucciones Enviadas",
        data.message || "Si el correo está registrado, recibirás instrucciones para recuperar tu contraseña.",
        [
          { text: "Ingresar Token", onPress: () => setAuthMode("reset_password") },
          { text: "Volver al Login", onPress: () => setAuthMode("login") },
        ]
      );
    } catch (e: any) {
      Alert.alert("Error de Red", "No se pudo contactar al servidor: " + (e.message || ""));
    } finally {
      setAuthLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!resetToken.trim()) {
      Alert.alert("Atención", "Por favor ingresa el token de recuperación recibido.");
      return;
    }
    if (resetNewPassword.length < 6) {
      Alert.alert("Atención", "La nueva contraseña debe tener al menos 6 caracteres.");
      return;
    }
    if (resetNewPassword !== resetConfirmPassword) {
      Alert.alert("Atención", "Las contraseñas no coinciden.");
      return;
    }
    setAuthLoading(true);
    try {
      const res = await fetch(`${apiUrl}/api/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: resetToken.trim(), nuevaPassword: resetNewPassword }),
      });
      if (res.ok) {
        Alert.alert(
          "¡Contraseña Restablecida!",
          "Tu contraseña ha sido actualizada con éxito. Ahora puedes iniciar sesión con tu nueva clave.",
          [{ text: "Iniciar Sesión", onPress: () => {
            setResetToken("");
            setResetNewPassword("");
            setResetConfirmPassword("");
            setAuthMode("login");
          }}]
        );
      } else {
        const err = await res.json();
        Alert.alert("Error", err.message || "El token es inválido o ha expirado.");
      }
    } catch (e: any) {
      Alert.alert("Error de Red", "No se pudo contactar al servidor: " + (e.message || ""));
    } finally {
      setAuthLoading(false);
    }
  };

  // Reutilización inteligente de datos al escribir/desenfocar correo
  const checkReusableData = async (email: string) => {
    const trimmed = email.trim().toLowerCase();
    if (!trimmed || !trimmed.includes("@") || !trimmed.includes(".")) {
      setReusableData(null);
      return;
    }
    try {
      const res = await fetch(`${apiUrl}/api/usuarios/datos-reutilizables?correo=${encodeURIComponent(trimmed)}`);
      if (res.ok) {
        const data = await res.json();
        if (data && data.rolesExistentes && data.rolesExistentes.length > 0) {
          setReusableData(data);
          // NO autorrellenar datos personales (nombre, apellido, teléfono) automáticamente
        } else {
          setReusableData(null);
        }
      }
    } catch {
      setReusableData(null);
    }
  };

  const handleRegister = async () => {
    if (!regNombre.trim() || !regApellido.trim() || !regCorreo.trim() || !regPassword.trim()) {
      Alert.alert("Campos requeridos", "Por favor completa todos los campos del formulario.");
      return;
    }
    if (regPassword !== regConfirmPassword) {
      Alert.alert("Contraseñas no coinciden", "Por favor asegúrate de que ambas contraseñas sean idénticas.");
      return;
    }
    if (regPassword.length < 8) {
      Alert.alert("Contraseña débil", "La contraseña debe tener al menos 8 caracteres.");
      return;
    }
    if (reusableData?.rolesExistentes?.includes(regRol)) {
      Alert.alert(
        "Rol ya registrado",
        `Tu correo ya cuenta con perfil activo como ${regRol}. Por favor inicia sesión con tu contraseña o selecciona otro rol.`
      );
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
        // Iniciar sesión automáticamente pasando el rol registrado
        const loginRes = await fetch(`${apiUrl}/api/auth/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ correo: payload.correo, password: payload.password, rol: payload.rol }),
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
            persistSession(jwt, profile);
            // Limpiar formulario
            setRegNombre("");
            setRegApellido("");
            setRegCorreo("");
            setRegTelefono("");
            setRegPassword("");
            setRegConfirmPassword("");
            setReusableData(null);

            // Redirección inmediata según el rol
            routeUserToDashboard(profile.activeRole || profile.rol, jwt);
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

  // Tarifa Oficial FastGo: Base $2,000 COP hasta 1 km, + $200 COP por km adicional (ceil)
  const calcTarifa = (d: number) => {
    return d <= 1.0 ? 2000 : 2000 + Math.ceil(d) * 200;
  };

  const fetchEncomiendasCliente = async (jwt = token) => {
    if (!jwt) return;
    try {
      const res = await fetch(`${apiUrl}/api/encomiendas/mis-encomiendas`, {
        headers: { Authorization: `Bearer ${jwt}`, Accept: "application/json" },
      });
      if (res.ok) setEncomiendasCliente(await res.json());
    } catch {}
  };

  const fetchEncomiendasDomi = async (jwt = token) => {
    if (!jwt) return;
    try {
      const [disp, asig] = await Promise.all([
        fetch(`${apiUrl}/api/encomiendas/disponibles`, {
          headers: { Authorization: `Bearer ${jwt}`, Accept: "application/json" },
        }).then((r) => (r.ok ? r.json() : [])),
        fetch(`${apiUrl}/api/encomiendas/asignadas`, {
          headers: { Authorization: `Bearer ${jwt}`, Accept: "application/json" },
        }).then((r) => (r.ok ? r.json() : [])),
      ]);
      setEncomiendasDisponibles(disp);
      setMisEncomiendasDomi(asig);
    } catch {}
  };

  const handleCrearEncomienda = async () => {
    if (!token) {
      Alert.alert("Iniciar Sesión Requerido", "Para solicitar el envío de una encomienda, por favor ingresa con tu cuenta.", [
        { text: "Cancelar", style: "cancel" },
        { text: "Ingresar", onPress: () => navigateTo("perfil") },
      ]);
      return;
    }
    if (!encRemitenteNombre.trim() || !encRemitenteTel.trim() || !encOrigen.trim() ||
        !encDestinatarioNombre.trim() || !encDestinatarioTel.trim() || !encDestino.trim() || !encDescripcion.trim()) {
      Alert.alert("Campos Requeridos", "Por favor completa los datos de origen, destino y descripción del paquete.");
      return;
    }
    if (!encTarifaAceptada) {
      Alert.alert("Aceptación Obligatoria", "Debes marcar la casilla aceptando la tarifa oficial calculada para continuar.");
      return;
    }

    setEncSubmitting(true);
    try {
      const tarifa = calcTarifa(encDistanciaKm);
      const res = await fetch(`${apiUrl}/api/encomiendas`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          remitenteNombre: encRemitenteNombre.trim(),
          remitenteTelefono: encRemitenteTel.trim(),
          direccionOrigen: encOrigen.trim(),
          destinatarioNombre: encDestinatarioNombre.trim(),
          destinatarioTelefono: encDestinatarioTel.trim(),
          direccionDestino: encDestino.trim(),
          descripcion: encDescripcion.trim(),
          tamanoPeso: encTamano,
          distanciaKm: encDistanciaKm,
          costoEnvio: tarifa,
          tarifaAceptada: true,
        }),
      });

      if (res.ok) {
        const nueva = await res.json();
        Alert.alert("¡Encomienda Solicitada!", `Tu servicio #ENC-${nueva.id} fue creado con éxito. Un domiciliario cercano será asignado pronto.`);
        setEncDescripcion("");
        setEncTarifaAceptada(false);
        setEncomiendaTab("mis_envios");
        fetchEncomiendasCliente();
      } else {
        const err = await res.json().catch(() => ({}));
        Alert.alert("Error", err.message || "No fue posible crear la encomienda.");
      }
    } catch (e: any) {
      Alert.alert("Error de Red", e.message || "Fallo al enviar solicitud.");
    } finally {
      setEncSubmitting(false);
    }
  };

  const handleTomarEncomienda = async (id: number) => {
    try {
      const res = await fetch(`${apiUrl}/api/encomiendas/${id}/tomar`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        Alert.alert("¡Encomienda Asignada!", `Has tomado la encomienda #ENC-${id}.`);
        fetchEncomiendasDomi();
      } else {
        Alert.alert("No Disponible", "La encomienda ya fue tomada por otro domiciliario.");
      }
    } catch (e: any) {
      Alert.alert("Error", e.message);
    }
  };

  const handleEstadoEncomienda = async (id: number, nuevoEstado: string, label: string) => {
    try {
      const res = await fetch(`${apiUrl}/api/encomiendas/${id}/estado`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ estado: nuevoEstado }),
      });
      if (res.ok) {
        Alert.alert("Estado Actualizado", `Encomienda #ENC-${id}: ${label}`);
        fetchEncomiendasDomi();
      }
    } catch (e: any) {
      Alert.alert("Error", e.message);
    }
  };

  const handleLogout = () => {
    persistSession(null, null);
    setToken(null);
    setUser(null);
    setCart([]);
    setSelectedPedido(null);
    setSelectedComercio(null);
    setActiveTab("explorar");
    setAuthMode("login");
    setShowRoleModal(false);
  };

  // ==========================================
  // CARRITO Y CREACIÓN DE PEDIDOS
  // ==========================================
  const addToCart = (producto: Producto) => {
    if (selectedComercio && (selectedComercio.abierto === false || selectedComercio.pausaManual)) {
      Alert.alert(
        "Comercio Cerrado",
        `El comercio "${selectedComercio.nombre}" se encuentra cerrado en este momento. Horario: ${selectedComercio.horaApertura || '08:00'} - ${selectedComercio.horaCierre || '20:00'}.`
      );
      return;
    }
    if (producto.disponible === false) {
      Alert.alert("Producto Agotado", "Este producto no se encuentra disponible temporalmente.");
      return;
    }
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
  // Tarifa autoritativa fijada por el comercio (mínimo $2.000 COP)
  const deliveryFee = cart.length > 0
    ? (selectedComercio?.tarifaDomicilio != null ? Math.max(2000, Number(selectedComercio.tarifaDomicilio)) : 2000)
    : 0;
  const totalCart = subtotalCart + deliveryFee;

  const handleCheckout = async () => {
    if (!token) {
      Alert.alert("Iniciar Sesión", "Para completar tu pedido, por favor inicia sesión o regístrate.", [
        { text: "Cancelar", style: "cancel" },
        { text: "Continuar", onPress: () => navigateTo("perfil") },
      ]);
      return;
    }

    if (selectedComercio && (selectedComercio.abierto === false || selectedComercio.pausaManual)) {
      Alert.alert(
        "Comercio Cerrado",
        `El comercio "${selectedComercio.nombre}" no está recibiendo pedidos en este momento. Horario: ${selectedComercio.horaApertura || '08:00'} - ${selectedComercio.horaCierre || '20:00'}.`
      );
      return;
    }

    const agotado = cart.find((i) => i.producto.disponible === false);
    if (agotado) {
      Alert.alert("Producto Agotado", `El producto "${agotado.producto.nombre}" está agotado. Elimínalo del carrito para continuar.`);
      return;
    }

    // Validación Bancolombia comprobante obligatorio
    if (metodoPagoSeleccionado === "BANCOLOMBIA" && !checkoutComprobanteUrl) {
      Alert.alert(
        "Comprobante Requerido",
        "Debes adjuntar el comprobante de pago de Bancolombia para procesar tu pedido."
      );
      return;
    }

    try {
      // 1. Obtener o crear dirección de entrega para el usuario
      let dirId = 1;
      try {
        const dirRes = await fetch(`${apiUrl}/api/direcciones`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (dirRes.ok) {
          const dirs = await dirRes.json();
          if (Array.isArray(dirs) && dirs.length > 0) {
            dirId = dirs[0].id;
          } else {
            const createDirRes = await fetch(`${apiUrl}/api/direcciones`, {
              method: "POST",
              headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
              body: JSON.stringify({ direccion: "Dirección Principal FastGo", ciudad: "Bogotá", latitud: 4.6097, longitud: -74.0817 }),
            });
            if (createDirRes.ok) {
              const nd = await createDirRes.json();
              dirId = nd.id;
            }
          }
        }
      } catch {}

      // 2. Obtener o crear carrito en el backend
      const sucursalId = selectedComercio?.id || 1;
      const cartRes = await fetch(`${apiUrl}/api/carritos?sucursalId=${sucursalId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      let backendCartId = null;
      if (cartRes.ok) {
        const cData = await cartRes.json();
        backendCartId = cData.id;
        for (const item of cart) {
          await fetch(`${apiUrl}/api/carritos/productos`, {
            method: "POST",
            headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
            body: JSON.stringify({
              carritoId: backendCartId,
              productoId: item.producto.id,
              cantidad: item.cantidad,
            }),
          }).catch(() => {});
        }
      }

      if (backendCartId) {
        const qParams = new URLSearchParams({
          carritoId: String(backendCartId),
          direccionId: String(dirId),
          costoEnvio: String(deliveryFee),
          metodoPago: metodoPagoSeleccionado,
        });
        let pedRes: Response;
        if (metodoPagoSeleccionado === "BANCOLOMBIA" && checkoutComprobanteAsset) {
          pedRes = (await uploadMultipartAsync(
            `${apiUrl}/api/pedidos?${qParams.toString()}`,
            "POST",
            token,
            "comprobante",
            {
              uri: checkoutComprobanteAsset.uri,
              fileName: checkoutComprobanteAsset.fileName,
              mimeType: checkoutComprobanteAsset.mimeType,
            }
          )) as any;
        } else {
          if (metodoPagoSeleccionado === "BANCOLOMBIA" && checkoutComprobanteUrl) {
            qParams.append("comprobantePagoUrl", checkoutComprobanteUrl);
          }
          pedRes = await fetch(`${apiUrl}/api/pedidos?${qParams.toString()}`, {
            method: "POST",
            headers: { Authorization: `Bearer ${token}` },
          });
        }

        if (pedRes.ok) {
          const nuevoPedido = await pedRes.json();
          Alert.alert(
            "¡Pedido Confirmado!",
            `Tu pedido #${nuevoPedido.id} ha sido registrado con éxito.\nMétodo de pago: ${metodoPagoSeleccionado}\nTotal: $${Number(nuevoPedido.total || totalCart).toLocaleString()} COP.\n${metodoPagoSeleccionado === "BANCOLOMBIA" ? "Comprobante en verificación por el comercio." : "En breve el restaurante iniciará su preparación."}`
          );
          setCart([]);
          setCheckoutComprobanteUrl(null);
          setCheckoutComprobanteAsset(null);
          await fetchPedidosCliente();
          navigateTo("mis_pedidos");
          return;
        } else {
          const err = await pedRes.json().catch(() => ({}));
          Alert.alert("No se pudo crear el pedido", err.message || "Error al procesar el pedido.");
          return;
        }
      }
    } catch (e: any) {
      // Fallback
    }

    Alert.alert(
      "¡Pedido Confirmado!",
      `Tu pedido ha sido registrado con éxito.\nMétodo de pago: ${metodoPagoSeleccionado}\nTotal: $${totalCart.toLocaleString()} COP.\nEn breve el restaurante iniciará su preparación.`
    );
    setCart([]);
    setCheckoutComprobanteUrl(null);
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

  const transitionPedidoComercio = async (pedidoId: number, action: "confirmar" | "preparar" | "listo" | "rechazar") => {
    // REGLA CRÍTICA: Bloqueo de despacho para pedidos con Bancolombia pendientes de aprobación
    if (action === "listo") {
      const p = pedidosComercio.find((item) => item.id === pedidoId);
      if (p && p.metodoPago === "BANCOLOMBIA" && p.estadoPago !== "APROBADO") {
        Alert.alert(
          "Despacho Bloqueado",
          "No puedes marcar como LISTO ni despachar este pedido hasta que el comprobante de transferencia Bancolombia haya sido verificado y aprobado."
        );
        return;
      }
    }

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

  const handleAprobarPago = async (pedidoId: number) => {
    try {
      const res = await fetch(`${apiUrl}/api/pedidos/${pedidoId}/aprobar-pago`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        Alert.alert("Pago Aprobado", `El pago del pedido #${pedidoId} ha sido APROBADO.`);
        fetchPedidosComercio();
      } else {
        const err = await res.json().catch(() => ({}));
        Alert.alert("Error", err.message || "No se pudo aprobar el pago.");
      }
    } catch (e: any) {
      Alert.alert("Error", e.message);
    }
  };

  const handleRechazarPago = async (pedidoId: number) => {
    try {
      const res = await fetch(`${apiUrl}/api/pedidos/${pedidoId}/rechazar-pago`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        Alert.alert("Pago Rechazado", `El pago del pedido #${pedidoId} ha sido RECHAZADO.`);
        fetchPedidosComercio();
      } else {
        const err = await res.json().catch(() => ({}));
        Alert.alert("Error", err.message || "No se pudo rechazar el pago.");
      }
    } catch (e: any) {
      Alert.alert("Error", e.message);
    }
  };

  const toggleKitchenOrderDetails = async (orderId: number) => {
    if (expandedKitchenOrders[orderId]) {
      const next = { ...expandedKitchenOrders };
      delete next[orderId];
      setExpandedKitchenOrders(next);
      return;
    }
    setLoadingKitchenDetails((prev) => ({ ...prev, [orderId]: true }));
    try {
      const res = await fetch(`${apiUrl}/api/pedidos/${orderId}/detalles`, {
        headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
      });
      if (res.ok) {
        const data = await res.json();
        setExpandedKitchenOrders((prev) => ({ ...prev, [orderId]: data }));
      }
    } catch {}
    finally {
      setLoadingKitchenDetails((prev) => ({ ...prev, [orderId]: false }));
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
        const msg = err.message || "";
        if (msg.includes("Este domicilio ya fue tomado") || res.status === 409) {
          Alert.alert("No disponible", "Este domicilio ya fue tomado por otro domiciliario.");
        } else {
          Alert.alert("No disponible", msg || "Este domicilio ya fue tomado por otro domiciliario.");
        }
        fetchPedidosDomiciliario();
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

  if (isInitializing) {
    return (
      <SafeAreaView style={styles.splashContainer}>
        <StatusBar barStyle="light-content" backgroundColor={Theme.primaryDark} />
        <View style={styles.splashContent}>
          <View style={styles.splashLogoBadge}>
            <Text style={styles.splashLogoEmoji}>⚡</Text>
          </View>
          <Text style={styles.splashBrandTitle}>
            FAST<Text style={{ color: Theme.accent }}>GO</Text>
          </Text>
          <Text style={styles.splashBrandSlogan}>Cerca de ti en cada pedido</Text>
          <ActivityIndicator size="large" color="#FFFFFF" style={{ marginTop: 28 }} />
          <Text style={styles.splashLoadingText}>Conectando con FASTGO...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!user || !token) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="light-content" backgroundColor={Theme.primaryDark} />
        <ScrollView
          contentContainerStyle={styles.authScrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header Superior con Logo e Identidad Visual Oficial FastGo */}
          <View style={styles.authTopSection}>
            <View style={styles.authLogoBadge}>
              <Text style={styles.authLogoBadgeEmoji}>⚡</Text>
            </View>
            <Text style={styles.authMainTitle}>
              FAST<Text style={{ color: Theme.primary }}>GO</Text>
            </Text>
            <Text style={styles.authMainSubtitle}>Cerca de ti en cada pedido</Text>

            {/* Indicador de Estado de Servidor */}
            <View style={[
              styles.connectionIndicator,
              {
                backgroundColor: networkStatus === "connected" ? "#DCFCE7" : networkStatus === "loading" ? "#FEF3C7" : "#FEE2E2",
                alignSelf: "center",
                marginTop: 10,
              }
            ]}>
              <View style={[
                styles.connectionDot,
                { backgroundColor: networkStatus === "connected" ? Theme.accent : networkStatus === "loading" ? Theme.warning : Theme.danger }
              ]} />
              <Text style={[
                styles.connectionText,
                { color: networkStatus === "connected" ? "#166534" : networkStatus === "loading" ? "#92400E" : "#991B1B" }
              ]}>
                {networkStatus === "connected" ? `En línea (${latency || 120}ms)` : networkStatus === "loading" ? "Conectando..." : "Offline"}
              </Text>
            </View>
          </View>

          {/* Tarjeta Blanca de Autenticación */}
          <View style={styles.authCard}>
            {/* Si está en Login o Register: Switch tabs arriba */}
            {(authMode === "login" || authMode === "register") && (
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
                    Registrarse
                  </Text>
                </TouchableOpacity>
              </View>
            )}

            {/* MODO: INICIAR SESIÓN */}
            {authMode === "login" && (
              <View style={{ marginTop: 16 }}>
                <Text style={styles.authSectionHeading}>Iniciar Sesión</Text>
                <Text style={styles.authSectionSub}>Ingresa tus credenciales para acceder a FASTGO</Text>

                <Text style={styles.inputLabel}>Correo Electrónico</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="ejemplo@correo.com"
                  placeholderTextColor="#94A3B8"
                  value={loginEmail}
                  onChangeText={setLoginEmail}
                  autoCapitalize="none"
                  keyboardType="email-address"
                />

                <Text style={[styles.inputLabel, { marginTop: 12 }]}>Contraseña</Text>
                <View style={styles.passwordInputRow}>
                  <TextInput
                    style={[styles.textInput, { flex: 1, paddingRight: 40 }]}
                    placeholder="••••••••"
                    placeholderTextColor="#94A3B8"
                    value={loginPassword}
                    onChangeText={setLoginPassword}
                    secureTextEntry={!showLoginPassword}
                  />
                  <TouchableOpacity
                    style={styles.eyeBtn}
                    onPress={() => setShowLoginPassword((prev) => !prev)}
                  >
                    <Text style={styles.eyeIcon}>{showLoginPassword ? "👁️" : "🔒"}</Text>
                  </TouchableOpacity>
                </View>

                <View style={{ alignItems: "flex-end", marginTop: 8 }}>
                  <TouchableOpacity onPress={() => setAuthMode("forgot_password")}>
                    <Text style={{ fontSize: 12, color: Theme.primaryDark, fontWeight: "600" }}>
                      ¿Olvidaste tu contraseña?
                    </Text>
                  </TouchableOpacity>
                </View>

                <TouchableOpacity
                  style={[styles.solidBtn, { marginTop: 20 }]}
                  onPress={handleLogin}
                  disabled={authLoading}
                >
                  {authLoading ? (
                    <ActivityIndicator color="#FFFFFF" />
                  ) : (
                    <Text style={styles.solidBtnText}>Iniciar Sesión</Text>
                  )}
                </TouchableOpacity>

                <View style={{ marginTop: 18, alignItems: "center" }}>
                  <Text style={{ fontSize: 12, color: Theme.textMuted }}>
                    ¿No tienes una cuenta?{" "}
                    <Text
                      style={{ color: Theme.primaryDark, fontWeight: "bold" }}
                      onPress={() => setAuthMode("register")}
                    >
                      Regístrate aquí
                    </Text>
                  </Text>
                </View>
              </View>
            )}

            {/* MODO: REGISTRARSE */}
            {authMode === "register" && (
              <View style={{ marginTop: 16 }}>
                <Text style={styles.authSectionHeading}>Crear Cuenta</Text>
                <Text style={styles.authSectionSub}>Únete a FASTGO y disfruta de la mejor experiencia</Text>

                {/* Correo Electrónico Primero para Detectar Cuenta Existente */}
                <Text style={styles.inputLabel}>Correo Electrónico</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="tu.correo@ejemplo.com"
                  placeholderTextColor="#94A3B8"
                  value={regCorreo}
                  onChangeText={(v) => {
                    setRegCorreo(v);
                    checkReusableData(v);
                  }}
                  onBlur={() => checkReusableData(regCorreo)}
                  autoCapitalize="none"
                  keyboardType="email-address"
                />

                {/* Banner de Reutilización Inteligente de Datos */}
                {reusableData && (
                  <View style={styles.reusableBanner}>
                    <Text style={styles.reusableBannerTitle}>✨ ¡Cuenta existente detectada!</Text>
                    <Text style={styles.reusableBannerSub}>
                      Se han precargado tus datos personales. Tu correo ya cuenta con rol(es):{" "}
                      <Text style={{ fontWeight: "bold" }}>{reusableData.rolesExistentes.join(", ")}</Text>.
                      Puedes crear un nuevo rol manteniendo tu misma cuenta.
                    </Text>
                  </View>
                )}

                <Text style={[styles.inputLabel, { marginTop: 12 }]}>¿Cómo deseas unirte a FASTGO?</Text>
                <View style={styles.roleSelectionRow}>
                  <TouchableOpacity
                    style={[styles.roleSelectCard, regRol === "CLIENTE" && styles.roleSelectCardActive]}
                    onPress={() => setRegRol("CLIENTE")}
                  >
                    <Text style={styles.roleEmoji}>👤</Text>
                    <Text style={[styles.roleCardTitle, regRol === "CLIENTE" && styles.roleCardTitleActive]}>
                      Cliente
                    </Text>
                    {reusableData?.rolesExistentes?.includes("CLIENTE") && (
                      <Text style={{ fontSize: 9, color: Theme.textMuted, fontWeight: "bold" }}>(Registrado)</Text>
                    )}
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.roleSelectCard, regRol === "COMERCIO" && styles.roleSelectCardActive]}
                    onPress={() => setRegRol("COMERCIO")}
                  >
                    <Text style={styles.roleEmoji}>🏪</Text>
                    <Text style={[styles.roleCardTitle, regRol === "COMERCIO" && styles.roleCardTitleActive]}>
                      Comercio
                    </Text>
                    {reusableData?.rolesExistentes?.includes("COMERCIO") && (
                      <Text style={{ fontSize: 9, color: Theme.textMuted, fontWeight: "bold" }}>(Registrado)</Text>
                    )}
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.roleSelectCard, regRol === "DOMICILIARIO" && styles.roleSelectCardActive]}
                    onPress={() => setRegRol("DOMICILIARIO")}
                  >
                    <Text style={styles.roleEmoji}>🛵</Text>
                    <Text style={[styles.roleCardTitle, regRol === "DOMICILIARIO" && styles.roleCardTitleActive]}>
                      Domiciliario
                    </Text>
                    {reusableData?.rolesExistentes?.includes("DOMICILIARIO") && (
                      <Text style={{ fontSize: 9, color: Theme.textMuted, fontWeight: "bold" }}>(Registrado)</Text>
                    )}
                  </TouchableOpacity>
                </View>

                {reusableData?.rolesExistentes?.includes(regRol) && (
                  <Text style={{ fontSize: 11, color: Theme.warning, fontWeight: "bold", marginTop: 4 }}>
                    ⚠️ Ya estás registrado como {regRol}. Selecciona otro rol o inicia sesión.
                  </Text>
                )}

                <Text style={[styles.inputLabel, { marginTop: 12 }]}>Nombre</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="Juan"
                  placeholderTextColor="#94A3B8"
                  value={regNombre}
                  onChangeText={setRegNombre}
                />

                <Text style={[styles.inputLabel, { marginTop: 10 }]}>Apellido</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="Pérez"
                  placeholderTextColor="#94A3B8"
                  value={regApellido}
                  onChangeText={setRegApellido}
                />

                <Text style={[styles.inputLabel, { marginTop: 10 }]}>Teléfono Celular</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="3001234567"
                  placeholderTextColor="#94A3B8"
                  value={regTelefono}
                  onChangeText={setRegTelefono}
                  keyboardType="phone-pad"
                />

                <Text style={[styles.inputLabel, { marginTop: 10 }]}>Contraseña (mínimo 8 caracteres)</Text>
                <View style={styles.passwordInputRow}>
                  <TextInput
                    style={[styles.textInput, { flex: 1, paddingRight: 40 }]}
                    placeholder="••••••••"
                    placeholderTextColor="#94A3B8"
                    value={regPassword}
                    onChangeText={setRegPassword}
                    secureTextEntry={!showRegPassword}
                  />
                  <TouchableOpacity
                    style={styles.eyeBtn}
                    onPress={() => setShowRegPassword((prev) => !prev)}
                  >
                    <Text style={styles.eyeIcon}>{showRegPassword ? "👁️" : "🔒"}</Text>
                  </TouchableOpacity>
                </View>

                <Text style={[styles.inputLabel, { marginTop: 10 }]}>Confirmar Contraseña</Text>
                <View style={styles.passwordInputRow}>
                  <TextInput
                    style={[styles.textInput, { flex: 1, paddingRight: 40 }]}
                    placeholder="••••••••"
                    placeholderTextColor="#94A3B8"
                    value={regConfirmPassword}
                    onChangeText={setRegConfirmPassword}
                    secureTextEntry={!showRegConfirmPassword}
                  />
                  <TouchableOpacity
                    style={styles.eyeBtn}
                    onPress={() => setShowRegConfirmPassword((prev) => !prev)}
                  >
                    <Text style={styles.eyeIcon}>{showResetConfirmPassword ? "👁️" : "🔒"}</Text>
                  </TouchableOpacity>
                </View>

                <TouchableOpacity
                  style={[
                    styles.solidBtn,
                    {
                      marginTop: 20,
                      backgroundColor: reusableData?.rolesExistentes?.includes(regRol) ? "#94A3B8" : Theme.primary,
                    },
                  ]}
                  onPress={handleRegister}
                  disabled={authLoading || Boolean(reusableData?.rolesExistentes?.includes(regRol))}
                >
                  {authLoading ? (
                    <ActivityIndicator color="#FFFFFF" />
                  ) : (
                    <Text style={styles.solidBtnText}>
                      {reusableData?.rolesExistentes?.includes(regRol)
                        ? `Ya Registrado como ${regRol}`
                        : `Registrarme como ${regRol}`}
                    </Text>
                  )}
                </TouchableOpacity>

                <View style={{ marginTop: 18, alignItems: "center" }}>
                  <Text style={{ fontSize: 12, color: Theme.textMuted }}>
                    ¿Ya tienes una cuenta?{" "}
                    <Text
                      style={{ color: Theme.primaryDark, fontWeight: "bold" }}
                      onPress={() => setAuthMode("login")}
                    >
                      Inicia sesión aquí
                    </Text>
                  </Text>
                </View>
              </View>
            )}

            {/* MODO: RECUPERAR CONTRASEÑA */}
            {authMode === "forgot_password" && (
              <View style={{ marginTop: 16 }}>
                <Text style={styles.authSectionHeading}>Recuperar Contraseña</Text>
                <Text style={styles.authSectionSub}>
                  Ingresa el correo asociado a tu cuenta FASTGO para recibir las instrucciones de recuperación.
                </Text>

                <Text style={styles.inputLabel}>Correo Electrónico</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="ejemplo@correo.com"
                  placeholderTextColor="#94A3B8"
                  value={forgotEmail}
                  onChangeText={setForgotEmail}
                  autoCapitalize="none"
                  keyboardType="email-address"
                />

                <TouchableOpacity
                  style={[styles.solidBtn, { marginTop: 20 }]}
                  onPress={handleForgotPassword}
                  disabled={authLoading}
                >
                  {authLoading ? (
                    <ActivityIndicator color="#FFFFFF" />
                  ) : (
                    <Text style={styles.solidBtnText}>Enviar Enlace de Recuperación</Text>
                  )}
                </TouchableOpacity>

                <TouchableOpacity
                  style={{ marginTop: 16, alignItems: "center" }}
                  onPress={() => setAuthMode("reset_password")}
                >
                  <Text style={{ fontSize: 13, color: Theme.primaryDark, fontWeight: "600" }}>
                    ¿Ya tienes un token? Restablecer aquí
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={{ marginTop: 14, alignItems: "center" }}
                  onPress={() => setAuthMode("login")}
                >
                  <Text style={{ fontSize: 13, color: Theme.textMuted }}>
                    ← Volver a Iniciar Sesión
                  </Text>
                </TouchableOpacity>
              </View>
            )}

            {/* MODO: RESTABLECER CONTRASEÑA */}
            {authMode === "reset_password" && (
              <View style={{ marginTop: 16 }}>
                <Text style={styles.authSectionHeading}>Restablecer Contraseña</Text>
                <Text style={styles.authSectionSub}>
                  Ingresa el token de recuperación recibido por correo y define tu nueva contraseña.
                </Text>

                <Text style={styles.inputLabel}>Token de Recuperación</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="Pega aquí tu token"
                  placeholderTextColor="#94A3B8"
                  value={resetToken}
                  onChangeText={setResetToken}
                  autoCapitalize="none"
                />

                <Text style={[styles.inputLabel, { marginTop: 12 }]}>Nueva Contraseña (mínimo 8 caracteres)</Text>
                <View style={styles.passwordInputRow}>
                  <TextInput
                    style={[styles.textInput, { flex: 1, paddingRight: 40 }]}
                    placeholder="••••••••"
                    placeholderTextColor="#94A3B8"
                    value={resetNewPassword}
                    onChangeText={setResetNewPassword}
                    secureTextEntry={!showResetPassword}
                  />
                  <TouchableOpacity
                    style={styles.eyeBtn}
                    onPress={() => setShowResetPassword((prev) => !prev)}
                  >
                    <Text style={styles.eyeIcon}>{showResetPassword ? "👁️" : "🔒"}</Text>
                  </TouchableOpacity>
                </View>

                <Text style={[styles.inputLabel, { marginTop: 12 }]}>Confirmar Nueva Contraseña</Text>
                <View style={styles.passwordInputRow}>
                  <TextInput
                    style={[styles.textInput, { flex: 1, paddingRight: 40 }]}
                    placeholder="••••••••"
                    placeholderTextColor="#94A3B8"
                    value={resetConfirmPassword}
                    onChangeText={setResetConfirmPassword}
                    secureTextEntry={!showResetConfirmPassword}
                  />
                  <TouchableOpacity
                    style={styles.eyeBtn}
                    onPress={() => setShowResetConfirmPassword((prev) => !prev)}
                  >
                    <Text style={styles.eyeIcon}>{showResetConfirmPassword ? "👁️" : "🔒"}</Text>
                  </TouchableOpacity>
                </View>

                <TouchableOpacity
                  style={[styles.solidBtn, { marginTop: 20 }]}
                  onPress={handleResetPassword}
                  disabled={authLoading}
                >
                  {authLoading ? (
                    <ActivityIndicator color="#FFFFFF" />
                  ) : (
                    <Text style={styles.solidBtnText}>Actualizar Contraseña</Text>
                  )}
                </TouchableOpacity>

                <TouchableOpacity
                  style={{ marginTop: 16, alignItems: "center" }}
                  onPress={() => setAuthMode("login")}
                >
                  <Text style={{ fontSize: 13, color: Theme.textMuted }}>
                    ← Volver a Iniciar Sesión
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

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
              {
                backgroundColor: networkStatus === "connected"
                  ? "#DCFCE7"
                  : networkStatus === "loading"
                  ? "#FEF3C7"
                  : "#FEE2E2",
              }
            ]}>
              <View style={[
                styles.connectionDot,
                {
                  backgroundColor: networkStatus === "connected"
                    ? Theme.accent
                    : networkStatus === "loading"
                    ? Theme.warning
                    : Theme.danger,
                }
              ]} />
              <Text style={[
                styles.connectionText,
                {
                  color: networkStatus === "connected"
                    ? "#166534"
                    : networkStatus === "loading"
                    ? "#92400E"
                    : "#991B1B",
                }
              ]}>
                {networkStatus === "connected"
                  ? `${latency || 120}ms`
                  : networkStatus === "loading"
                  ? "Conectando..."
                  : "Offline"}
              </Text>
            </View>

            {/* Acciones Rápidas en Header según Rol */}
            {(user?.activeRole || user?.rol) === "CLIENTE" && cart.length > 0 && (
              <TouchableOpacity
                onPress={() => navigateTo("carrito")}
                style={{ flexDirection: "row", alignItems: "center", backgroundColor: Theme.primary, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 12, marginRight: 6 }}
              >
                <Text style={{ color: "#FFF", fontWeight: "bold", fontSize: 13 }}>🛒 {cart.reduce((s, i) => s + i.cantidad, 0)}</Text>
              </TouchableOpacity>
            )}

            {(user?.activeRole || user?.rol) === "COMERCIO" && (
              <TouchableOpacity
                onPress={() => {
                  if (activeTab === "comercio_cocina") {
                    navigateTo("perfil");
                  } else {
                    navigateTo("comercio_cocina");
                    fetchPedidosComercio();
                  }
                }}
                style={{ flexDirection: "row", alignItems: "center", backgroundColor: activeTab === "comercio_cocina" ? Theme.primary : "#475569", paddingHorizontal: 10, paddingVertical: 5, borderRadius: 12, marginRight: 6 }}
              >
                <Text style={{ color: "#FFF", fontWeight: "bold", fontSize: 12 }}>
                  {activeTab === "comercio_cocina" ? "🏪 Menú" : "🍳 Cocina"}
                </Text>
              </TouchableOpacity>
            )}

            {(user?.activeRole || user?.rol) === "DOMICILIARIO" && (
              <TouchableOpacity
                onPress={() => {
                  navigateTo("domi_disponibles");
                  fetchPedidosDomiciliario();
                }}
                style={{ flexDirection: "row", alignItems: "center", backgroundColor: Theme.primary, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 12, marginRight: 6 }}
              >
                <Text style={{ color: "#FFF", fontWeight: "bold", fontSize: 12 }}>📦 Despachos</Text>
              </TouchableOpacity>
            )}

            {user && (
              <TouchableOpacity
                onPress={() => navigateTo("perfil")}
                style={styles.userRoleTag}
              >
                <Text style={styles.userRoleTagText}>{user.activeRole || user.rol}</Text>
              </TouchableOpacity>
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
      <View style={{ flex: 1 }}>
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
            {/* Cabecera Compacta y Moderna */}
            {!selectedComercio && (
              <View style={styles.compactHeaderRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.compactHeaderGreeting}>
                    {user ? `¡Hola, ${user.nombre}!` : "Bienvenido a FASTGO"}
                  </Text>
                  <Text style={styles.compactHeaderSub}>¿Qué deseas pedir hoy?</Text>
                </View>
                <View style={styles.compactHeaderBadge}>
                  <Text style={styles.compactHeaderBadgeText}>⚡ Envíos Rápidos</Text>
                </View>
              </View>
            )}

            {/* Servicios Principales FastGo */}
            {!selectedComercio && (
              <View style={styles.servicesGridRow}>
                <TouchableOpacity
                  style={[styles.serviceCard, { backgroundColor: "#ECFDF5", borderColor: "#A7F3D0" }]}
                  onPress={() => setSelectedCategory("Todos")}
                >
                  <View style={{ flex: 1 }}>
                    <View style={[styles.serviceBadge, { backgroundColor: "#D1FAE5" }]}>
                      <Text style={[styles.serviceBadgeText, { color: Theme.primaryDark }]}>COMERCIOS</Text>
                    </View>
                    <Text style={styles.serviceTitle}>Restaurantes y Tiendas</Text>
                    <Text style={styles.serviceSub}>Platos y víveres aliados</Text>
                  </View>
                  <Text style={styles.serviceIcon}>🍔</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.serviceCard, { backgroundColor: "#0F172A", borderColor: "#334155" }]}
                  onPress={() => {
                    navigateTo("encomiendas");
                    fetchEncomiendasCliente();
                  }}
                >
                  <View style={{ flex: 1 }}>
                    <View style={[styles.serviceBadge, { backgroundColor: "#064E3B" }]}>
                      <Text style={[styles.serviceBadgeText, { color: "#34D399" }]}>DESDE $2.000</Text>
                    </View>
                    <Text style={[styles.serviceTitle, { color: "#FFFFFF" }]}>Enviar Encomienda</Text>
                    <Text style={[styles.serviceSub, { color: "#94A3B8" }]}>Paquetes urbanos exprés</Text>
                  </View>
                  <Text style={styles.serviceIcon}>📦</Text>
                </TouchableOpacity>
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
                <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 4 }}>
                  <Text style={styles.commerceDetailTitle}>{selectedComercio.nombre}</Text>
                  <View style={[styles.statusPill, { backgroundColor: selectedComercio.abierto !== false && !selectedComercio.pausaManual ? "#DCFCE7" : "#FEE2E2" }]}>
                    <Text style={{ color: selectedComercio.abierto !== false && !selectedComercio.pausaManual ? "#166534" : "#991B1B", fontSize: 9, fontWeight: "bold" }}>
                      {selectedComercio.abierto !== false && !selectedComercio.pausaManual ? "🟢 ABIERTO" : "🔴 CERRADO"}
                    </Text>
                  </View>
                </View>
                <Text style={styles.commerceDetailSub}>{selectedComercio.descripcion || "Comercio Aliado FastGo"}</Text>
                <View style={{ flexDirection: "row", flexWrap: "wrap", alignItems: "center", gap: 6, marginTop: 4 }}>
                  <Text style={{ fontSize: 11, fontWeight: "700", color: Theme.primary }}>
                    🛵 Domicilio: ${(selectedComercio.tarifaDomicilio || 2000).toLocaleString()} COP
                  </Text>
                  {selectedComercio.bancolombiaActivo && (
                    <View style={[styles.statusPill, { backgroundColor: "#FEF08A" }]}>
                      <Text style={{ color: "#854D0E", fontSize: 9, fontWeight: "bold" }}>
                        💳 Bancolombia Disponible
                      </Text>
                    </View>
                  )}
                </View>
                <Text style={{ fontSize: 11, color: Theme.textMuted, marginTop: 4 }}>
                  ⏰ Horario: {selectedComercio.horaApertura || "08:00"} - {selectedComercio.horaCierre || "20:00"} ({selectedComercio.diasAtencion || "Todos los días"})
                </Text>
                {selectedComercio.telefono && (
                  <Text style={styles.commerceDetailPhone}>📞 Contacto: {selectedComercio.telefono}</Text>
                )}

                {/* Aviso si está cerrado */}
                {(selectedComercio.abierto === false || selectedComercio.pausaManual) && (
                  <View style={[styles.closedStoreBanner, { marginTop: 10 }]}>
                    <Text style={{ fontSize: 16 }}>⚠️</Text>
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontSize: 12, fontWeight: "bold", color: "#991B1B" }}>
                        Este comercio se encuentra actualmente cerrado
                      </Text>
                      <Text style={{ fontSize: 10, color: "#7F1D1D", marginTop: 2 }}>
                        {selectedComercio.pausaManual
                          ? "Tienda en pausa temporal."
                          : selectedComercio.mensajeEstado || "No está recibiendo pedidos en este momento."}
                      </Text>
                    </View>
                  </View>
                )}
              </View>
            )}

            {/* Sección de Comercios Aliados (si no hay uno seleccionado) */}
            {!selectedComercio && (
              <View style={styles.sectionBlock}>
                <Text style={styles.sectionTitle}>Comercios Aliados ({comercios.length})</Text>
                {comercios.length === 0 ? (
                  <View style={styles.emptyCard}>
                    <Text style={styles.emptyCardTitle}>
                      {networkStatus === "loading"
                        ? "Conectando con la red FastGo..."
                        : "No hay comercios registrados aún"}
                    </Text>
                    <Text style={styles.emptyCardText}>
                      {networkStatus === "loading"
                        ? "Cargando aliados en línea desde Render Cloud"
                        : "Pronto se sumarán nuevos aliados a tu zona."}
                    </Text>
                  </View>
                ) : (
                  comercios.map((c) => (
                    <TouchableOpacity
                      key={c.id}
                      style={styles.commerceCard}
                      onPress={() => setSelectedComercio(c)}
                    >
                      {c.logo || c.logoUrl ? (
                        <Image
                          source={{ uri: resolveMediaUrl(c.logo || c.logoUrl) || "" }}
                          style={{ width: 44, height: 44, borderRadius: 22, marginRight: 12, backgroundColor: "#E2E8F0" }}
                        />
                      ) : (
                        <View style={styles.commerceAvatar}>
                          <Text style={styles.commerceAvatarText}>{c.nombre.charAt(0)}</Text>
                        </View>
                      )}
                      <View style={{ flex: 1 }}>
                        <Text style={styles.commerceCardTitle}>{c.nombre}</Text>
                        <Text style={styles.commerceCardDesc}>{c.descripcion || "Platos preparados al instante"}</Text>
                        <View style={styles.commerceMetaRow}>
                          <Text style={styles.commerceMeta}>⭐ 4.8</Text>
                          <Text style={styles.commerceMetaDot}>•</Text>
                          <Text style={styles.commerceMeta}>25-40 min</Text>
                          <Text style={styles.commerceMetaDot}>•</Text>
                          <Text style={styles.commerceMetaPrice}>Envío: ${(c.tarifaDomicilio || 2000).toLocaleString()} COP</Text>
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
                    {(p.imagenPrincipal || p.imagenUrl) ? (
                      <Image
                        source={{ uri: resolveMediaUrl(p.imagenPrincipal || p.imagenUrl) || "" }}
                        style={{ width: 64, height: 64, borderRadius: 12, marginRight: 12, backgroundColor: "#F1F5F9" }}
                        resizeMode="cover"
                      />
                    ) : null}
                    <View style={styles.productInfo}>
                      <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                        <Text style={styles.productName}>{p.nombre}</Text>
                        {p.disponible === false && (
                          <View style={[styles.statusPill, { backgroundColor: "#FEE2E2" }]}>
                            <Text style={{ color: "#991B1B", fontSize: 9, fontWeight: "bold" }}>AGOTADO</Text>
                          </View>
                        )}
                      </View>
                      <Text style={styles.productDesc}>{p.descripcion || "Preparación fresca con los mejores ingredientes"}</Text>
                      <Text style={styles.productPrice}>${p.precio.toLocaleString()} COP{p.stock != null ? ` • Stock: ${p.stock}` : ""}</Text>
                    </View>
                    <TouchableOpacity
                      style={[
                        styles.addBtn,
                        (p.disponible === false || selectedComercio?.abierto === false || selectedComercio?.pausaManual) && { backgroundColor: "#F1F5F9", borderColor: "#CBD5E1" }
                      ]}
                      onPress={() => addToCart(p)}
                      disabled={p.disponible === false || selectedComercio?.abierto === false || selectedComercio?.pausaManual}
                    >
                      <Text style={[styles.addBtnText, (p.disponible === false || selectedComercio?.abierto === false || selectedComercio?.pausaManual) && { color: "#94A3B8" }]}>
                        {selectedComercio?.abierto === false || selectedComercio?.pausaManual ? "Cerrado" : p.disponible === false ? "Agotado" : "+ Agregar"}
                      </Text>
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
                    <Text style={styles.billingVal}>${deliveryFee.toLocaleString()} COP (Comercio)</Text>
                  </View>
                  <View style={[styles.billingRow, styles.billingTotalRow]}>
                    <Text style={styles.billingTotalLabel}>Total a Pagar:</Text>
                    <Text style={styles.billingTotalVal}>${totalCart.toLocaleString()} COP</Text>
                  </View>
                </View>

                {/* Banner de comercio cerrado o pausado */}
                {(selectedComercio?.pausaManual || selectedComercio?.abierto === false) && (
                  <View style={styles.closedStoreBanner}>
                    <Text style={{ fontSize: 16 }}>⚠️</Text>
                    <Text style={{ flex: 1, fontSize: 11, color: "#991B1B", fontWeight: "bold" }}>
                      El comercio seleccionado se encuentra cerrado o pausado y no recibe pedidos en este momento.
                    </Text>
                  </View>
                )}

                {/* Métodos de Pago Habilitados */}
                <View style={{ marginTop: 12 }}>
                  <Text style={styles.inputLabel}>Método de Pago:</Text>
                  <View style={styles.paymentMethodsRow}>
                    {[
                      { id: "EFECTIVO", label: "💵 Efectivo" },
                      ...(selectedComercio?.bancolombiaActivo ? [{ id: "BANCOLOMBIA", label: "📲 Bancolombia" }] : []),
                      { id: "TARJETA", label: "💳 Tarjeta" },
                      { id: "PSE", label: "🏦 PSE" },
                    ].map((m) => (
                      <TouchableOpacity
                        key={m.id}
                        style={[
                          styles.paymentMethodChip,
                          metodoPagoSeleccionado === m.id && styles.paymentMethodChipActive,
                        ]}
                        onPress={() => setMetodoPagoSeleccionado(m.id)}
                      >
                        <Text
                          style={[
                            styles.paymentMethodText,
                            metodoPagoSeleccionado === m.id && styles.paymentMethodTextActive,
                          ]}
                        >
                          {m.label}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                {/* Sección de Pago con Bancolombia y Comprobante */}
                {metodoPagoSeleccionado === "BANCOLOMBIA" && (
                  <View style={{
                    marginTop: 14,
                    padding: 14,
                    backgroundColor: "#FFFBEB",
                    borderRadius: 14,
                    borderWidth: 1.5,
                    borderColor: "#FCD34D",
                    gap: 10,
                  }}>
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                      <Text style={{ fontSize: 20 }}>📲</Text>
                      <View>
                        <Text style={{ fontSize: 13, fontWeight: "900", color: "#78350F" }}>
                          Transferencia Bancolombia
                        </Text>
                        <Text style={{ fontSize: 10, color: "#92400E" }}>
                          Transfiere a los datos oficiales del comercio
                        </Text>
                      </View>
                    </View>

                    <View style={{ backgroundColor: "#FFFFFF", padding: 10, borderRadius: 10, borderWidth: 1, borderColor: "#FDE68A", gap: 4 }}>
                      <Text style={{ fontSize: 11, color: Theme.text }}>
                        <Text style={{ fontWeight: "bold" }}>Tipo de Cuenta:</Text> {selectedComercio?.bancolombiaTipoCuenta || "Ahorros"}
                      </Text>
                      <Text style={{ fontSize: 13, fontWeight: "900", color: Theme.primaryDark }}>
                        <Text style={{ fontWeight: "bold", color: Theme.text, fontSize: 11 }}>Número:</Text> {selectedComercio?.bancolombiaNumeroCuenta || "No configurado"}
                      </Text>
                      {selectedComercio?.bancolombiaTitular ? (
                        <Text style={{ fontSize: 11, color: Theme.text }}>
                          <Text style={{ fontWeight: "bold" }}>Titular:</Text> {selectedComercio.bancolombiaTitular}
                        </Text>
                      ) : null}
                      {selectedComercio?.bancolombiaDocTitular ? (
                        <Text style={{ fontSize: 11, color: Theme.text }}>
                          <Text style={{ fontWeight: "bold" }}>Documento:</Text> {selectedComercio.bancolombiaDocTitular}
                        </Text>
                      ) : null}
                      <View style={{ borderTopWidth: 1, borderTopColor: "#F1F5F9", paddingTop: 4, marginTop: 4 }}>
                        <Text style={{ fontSize: 12, fontWeight: "900", color: "#B45309" }}>
                          Total exacto a transferir: ${totalCart.toLocaleString()} COP
                        </Text>
                      </View>
                    </View>

                    {/* Carga del Comprobante */}
                    <View style={{ gap: 6 }}>
                      <Text style={{ fontSize: 11, fontWeight: "bold", color: "#78350F" }}>
                        Comprobante de Pago (Obligatorio):
                      </Text>
                      {checkoutComprobanteUrl ? (
                        <View style={{
                          flexDirection: "row",
                          alignItems: "center",
                          backgroundColor: "#ECFDF5",
                          padding: 10,
                          borderRadius: 10,
                          borderWidth: 1,
                          borderColor: "#A7F3D0",
                          gap: 10,
                        }}>
                          <Image
                            source={{ uri: checkoutComprobanteAsset?.uri || resolveMediaUrl(checkoutComprobanteUrl) || "" }}
                            style={{ width: 48, height: 48, borderRadius: 8, backgroundColor: "#E2E8F0" }}
                          />
                          <View style={{ flex: 1 }}>
                            <Text style={{ fontSize: 11, fontWeight: "bold", color: "#065F46" }}>
                              ✓ Comprobante listo
                            </Text>
                            <Text style={{ fontSize: 10, color: Theme.textMuted }}>
                              Adjuntado correctamente para verificación privada.
                            </Text>
                          </View>
                          <TouchableOpacity
                            onPress={() => {
                              setCheckoutComprobanteUrl(null);
                              setCheckoutComprobanteAsset(null);
                            }}
                            style={{ padding: 6 }}
                          >
                            <Text style={{ color: Theme.danger, fontSize: 11, fontWeight: "bold" }}>Eliminar</Text>
                          </TouchableOpacity>
                        </View>
                      ) : (
                        <TouchableOpacity
                          style={{
                            backgroundColor: "#FFFFFF",
                            borderWidth: 1.5,
                            borderStyle: "dashed",
                            borderColor: "#F59E0B",
                            borderRadius: 12,
                            padding: 12,
                            alignItems: "center",
                            justifyContent: "center",
                            flexDirection: "row",
                            gap: 8,
                          }}
                          onPress={pickComprobanteLocal}
                          disabled={isUploadingComprobante}
                        >
                          {isUploadingComprobante ? (
                            <ActivityIndicator size="small" color="#F59E0B" />
                          ) : (
                            <>
                              <Text style={{ fontSize: 16 }}>📎</Text>
                              <Text style={{ fontSize: 12, fontWeight: "bold", color: "#B45309" }}>
                                Adjuntar Comprobante Privado (JPG/PNG)
                              </Text>
                            </>
                          )}
                        </TouchableOpacity>
                      )}
                    </View>
                  </View>
                )}

                <TouchableOpacity
                  style={[
                    styles.solidBtn,
                    {
                      marginTop: 14,
                      backgroundColor:
                        selectedComercio?.pausaManual || selectedComercio?.abierto === false
                          ? "#94A3B8"
                          : Theme.primary,
                    },
                  ]}
                  onPress={handleCheckout}
                  disabled={Boolean(selectedComercio?.pausaManual || selectedComercio?.abierto === false)}
                >
                  <Text style={styles.solidBtnText}>
                    {token
                      ? selectedComercio?.pausaManual || selectedComercio?.abierto === false
                        ? "Comercio Cerrado"
                        : "Confirmar Pedido"
                      : "Iniciar Sesión para Pedir"}
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
                  <View style={styles.billingRow}>
                    <Text style={styles.billingLabel}>Método de Pago:</Text>
                    <Text style={[styles.billingVal, { fontWeight: "bold" }]}>{selectedPedido.metodoPago || "EFECTIVO"}</Text>
                  </View>
                  <View style={[styles.billingRow, styles.billingTotalRow]}>
                    <Text style={styles.billingTotalLabel}>Total:</Text>
                    <Text style={styles.billingTotalVal}>${selectedPedido.total.toLocaleString()} COP</Text>
                  </View>
                </View>

                {/* Banner de estado de pago Bancolombia */}
                {selectedPedido.metodoPago === "BANCOLOMBIA" && (
                  <View style={{
                    marginTop: 10,
                    padding: 10,
                    borderRadius: 10,
                    backgroundColor: selectedPedido.estadoPago === "APROBADO" ? "#ECFDF5" : selectedPedido.estadoPago === "RECHAZADO" ? "#FEF2F2" : "#FFFBEB",
                    borderWidth: 1,
                    borderColor: selectedPedido.estadoPago === "APROBADO" ? "#6EE7B7" : selectedPedido.estadoPago === "RECHAZADO" ? "#FCA5A5" : "#FDE68A",
                  }}>
                    <Text style={{ fontSize: 11, fontWeight: "bold", color: selectedPedido.estadoPago === "APROBADO" ? "#065F46" : selectedPedido.estadoPago === "RECHAZADO" ? "#991B1B" : "#92400E" }}>
                      Estado del Pago: {selectedPedido.estadoPago === "APROBADO" ? "✓ APROBADO POR EL COMERCIO" : selectedPedido.estadoPago === "RECHAZADO" ? "✕ RECHAZADO POR EL COMERCIO" : "⏳ EN VERIFICACIÓN POR EL COMERCIO"}
                    </Text>
                    {selectedPedido.comprobantePagoUrl && (
                      <TouchableOpacity
                        style={{ marginTop: 6 }}
                        onPress={() => setViewingReceiptUrl(selectedPedido.comprobantePagoUrl || null)}
                      >
                        <Text style={{ fontSize: 11, color: Theme.primary, fontWeight: "bold" }}>
                          👁️ Ver Comprobante Adjunto
                        </Text>
                      </TouchableOpacity>
                    )}
                  </View>
                )}

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
            VISTA: ENCOMIENDAS URBANAS (CLIENTE)
           ==================================================== */}
        {activeTab === "encomiendas" && (
          <View style={styles.cardContainer}>
            <View style={styles.rowBetween}>
              <View>
                <Text style={styles.pageTitle}>📦 Encomiendas FastGo</Text>
                <Text style={styles.subtext}>Envíos urbanos exprés con tarifa transparente</Text>
              </View>
              <TouchableOpacity onPress={() => fetchEncomiendasCliente()}>
                <Text style={styles.linkAction}>↻ Refrescar</Text>
              </TouchableOpacity>
            </View>

            {/* Selector de sub-pestaña */}
            <View style={[styles.authToggleRow, { marginTop: 12 }]}>
              <TouchableOpacity
                style={[styles.authToggleBtn, encomiendaTab === "nueva" && styles.authToggleBtnActive]}
                onPress={() => setEncomiendaTab("nueva")}
              >
                <Text style={[styles.authToggleText, encomiendaTab === "nueva" && styles.authToggleTextActive]}>
                  + Nueva Solicitud
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.authToggleBtn, encomiendaTab === "mis_envios" && styles.authToggleBtnActive]}
                onPress={() => {
                  setEncomiendaTab("mis_envios");
                  fetchEncomiendasCliente();
                }}
              >
                <Text style={[styles.authToggleText, encomiendaTab === "mis_envios" && styles.authToggleTextActive]}>
                  Mis Envíos ({encomiendasCliente.length})
                </Text>
              </TouchableOpacity>
            </View>

            {encomiendaTab === "nueva" ? (
              <View style={{ marginTop: 16 }}>
                {/* Remitente */}
                <View style={[styles.kitchenCard, { backgroundColor: "#F0FDF4", borderColor: "#BBF7D0" }]}>
                  <Text style={[styles.subHeading, { color: Theme.primaryDark, marginTop: 0 }]}>📍 Punto A (Recogida)</Text>
                  <Text style={[styles.inputLabel, { marginTop: 6 }]}>Nombre del Remitente:</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="Tu nombre completo"
                    placeholderTextColor="#94A3B8"
                    value={encRemitenteNombre}
                    onChangeText={setEncRemitenteNombre}
                  />
                  <Text style={[styles.inputLabel, { marginTop: 6 }]}>Teléfono del Remitente:</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="3001234567"
                    placeholderTextColor="#94A3B8"
                    value={encRemitenteTel}
                    onChangeText={setEncRemitenteTel}
                    keyboardType="phone-pad"
                  />
                  <Text style={[styles.inputLabel, { marginTop: 6 }]}>Dirección de Recogida:</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="Calle 123 # 45 - 67, Apto 301"
                    placeholderTextColor="#94A3B8"
                    value={encOrigen}
                    onChangeText={setEncOrigen}
                  />
                </View>

                {/* Destinatario */}
                <View style={[styles.kitchenCard, { backgroundColor: "#EFF6FF", borderColor: "#BFDBFE", marginTop: 8 }]}>
                  <Text style={[styles.subHeading, { color: "#1E40AF", marginTop: 0 }]}>🎯 Punto B (Entrega)</Text>
                  <Text style={[styles.inputLabel, { marginTop: 6 }]}>Nombre del Destinatario:</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="Nombre de quien recibe"
                    placeholderTextColor="#94A3B8"
                    value={encDestinatarioNombre}
                    onChangeText={setEncDestinatarioNombre}
                  />
                  <Text style={[styles.inputLabel, { marginTop: 6 }]}>Teléfono del Destinatario:</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="3109876543"
                    placeholderTextColor="#94A3B8"
                    value={encDestinatarioTel}
                    onChangeText={setEncDestinatarioTel}
                    keyboardType="phone-pad"
                  />
                  <Text style={[styles.inputLabel, { marginTop: 6 }]}>Dirección de Entrega:</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="Carrera 45 # 67 - 89, Casa 2"
                    placeholderTextColor="#94A3B8"
                    value={encDestino}
                    onChangeText={setEncDestino}
                  />
                </View>

                {/* Detalle del Paquete */}
                <View style={[styles.kitchenCard, { marginTop: 8 }]}>
                  <Text style={[styles.subHeading, { marginTop: 0 }]}>📦 Detalles del Envío</Text>
                  <Text style={[styles.inputLabel, { marginTop: 6 }]}>Descripción del Contenido:</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="Ej. Documentos notaría, llaves, caja pequeña..."
                    placeholderTextColor="#94A3B8"
                    value={encDescripcion}
                    onChangeText={setEncDescripcion}
                  />

                  <Text style={[styles.inputLabel, { marginTop: 10 }]}>Tamaño / Peso Aprox:</Text>
                  <View style={styles.roleSelectionRow}>
                    {["Pequeño (< 2kg)", "Mediano (2-5kg)", "Grande (5-10kg)"].map((tam) => (
                      <TouchableOpacity
                        key={tam}
                        style={[styles.roleSelectCard, encTamano === tam && styles.roleSelectCardActive]}
                        onPress={() => setEncTamano(tam)}
                      >
                        <Text style={[styles.roleCardTitle, encTamano === tam && styles.roleCardTitleActive, { fontSize: 10 }]}>
                          {tam}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>

                  <Text style={[styles.inputLabel, { marginTop: 10 }]}>
                    Distancia Estimada: <Text style={{ color: Theme.primaryDark, fontWeight: "900" }}>{encDistanciaKm.toFixed(1)} km</Text>
                  </Text>
                  <View style={styles.distanceChipsRow}>
                    {[1.0, 2.0, 3.0, 4.0, 5.4, 8.0].map((d) => (
                      <TouchableOpacity
                        key={d}
                        style={[styles.distanceChip, encDistanciaKm === d && styles.distanceChipActive]}
                        onPress={() => setEncDistanciaKm(d)}
                      >
                        <Text style={[styles.distanceChipText, encDistanciaKm === d && styles.distanceChipTextActive]}>
                          {d} km
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                {/* Tarifa Oficial y Aceptación Expresa */}
                <View style={[styles.kitchenCard, { backgroundColor: Theme.secondary, borderColor: Theme.secondaryLight, marginTop: 8 }]}>
                  <View style={styles.rowBetween}>
                    <View>
                      <Text style={{ color: "#34D399", fontSize: 11, fontWeight: "bold", textTransform: "uppercase" }}>
                        Cotización Oficial FastGo
                      </Text>
                      <Text style={{ color: "#FFFFFF", fontSize: 13, fontWeight: "bold", marginTop: 2 }}>
                        Base $2.000 COP + $200/km (ceil)
                      </Text>
                    </View>
                    <View style={{ alignItems: "flex-end" }}>
                      <Text style={{ color: "#94A3B8", fontSize: 10 }}>Total a Cobrar</Text>
                      <Text style={{ color: "#34D399", fontSize: 20, fontWeight: "900" }}>
                        ${calcTarifa(encDistanciaKm).toLocaleString()} COP
                      </Text>
                    </View>
                  </View>

                  {/* Casilla de Aceptación Expresa Obligatoria */}
                  <TouchableOpacity
                    style={[styles.checkboxRow, encTarifaAceptada && styles.checkboxRowActive]}
                    onPress={() => setEncTarifaAceptada(!encTarifaAceptada)}
                  >
                    <View style={[styles.checkboxBox, encTarifaAceptada && styles.checkboxBoxActive]}>
                      {encTarifaAceptada && <Text style={styles.checkboxCheck}>✓</Text>}
                    </View>
                    <Text style={[styles.checkboxLabel, { flex: 1 }]}>
                      Acepto expresamente la tarifa calculada de{" "}
                      <Text style={{ color: "#34D399", fontWeight: "bold" }}>
                        ${calcTarifa(encDistanciaKm).toLocaleString()} COP
                      </Text>{" "}
                      para el transporte y entrega de esta encomienda.
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.solidBtn,
                      { backgroundColor: encTarifaAceptada ? Theme.accent : "#475569", marginTop: 14 }
                    ]}
                    onPress={handleCrearEncomienda}
                    disabled={!encTarifaAceptada || encSubmitting}
                  >
                    {encSubmitting ? (
                      <ActivityIndicator color="#FFFFFF" />
                    ) : (
                      <Text style={styles.solidBtnText}>Confirmar y Solicitar Domiciliario</Text>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              /* Mis Envíos Solicitados */
              <View style={{ marginTop: 14 }}>
                {encomiendasCliente.length === 0 ? (
                  <View style={styles.emptyCard}>
                    <Text style={styles.emptyIcon}>📦</Text>
                    <Text style={styles.emptyCardTitle}>No tienes encomiendas registradas</Text>
                    <Text style={styles.emptyCardText}>Crea una nueva solicitud para pedir un mensajero urbano.</Text>
                  </View>
                ) : (
                  encomiendasCliente.map((enc) => (
                    <View key={enc.id} style={[styles.kitchenCard, { borderColor: Theme.border }]}>
                      <View style={styles.orderHeaderRow}>
                        <Text style={styles.orderNumberTitle}>#ENC-{enc.id}</Text>
                        <View style={[styles.statusPill, { backgroundColor: enc.estado === "ENTREGADA" ? "#DCFCE7" : "#FEF3C7" }]}>
                          <Text style={{ color: enc.estado === "ENTREGADA" ? "#166534" : "#92400E", fontSize: 10, fontWeight: "bold" }}>
                            {enc.estado}
                          </Text>
                        </View>
                      </View>
                      <Text style={styles.kitchenPrice}>Costo de envío: ${enc.costoEnvio?.toLocaleString()} COP</Text>
                      <Text style={styles.kitchenNotes}>Paquete: {enc.descripcion} ({enc.tamanoPeso || "Estándar"})</Text>
                      <View style={{ marginTop: 6, padding: 8, backgroundColor: "#FFFFFF", borderRadius: 8, borderWidth: 1, borderColor: Theme.border }}>
                        <Text style={{ fontSize: 11, color: Theme.text }}><Text style={{ fontWeight: "bold" }}>De:</Text> {enc.direccionOrigen}</Text>
                        <Text style={{ fontSize: 11, color: Theme.text, marginTop: 2 }}><Text style={{ fontWeight: "bold" }}>A:</Text> {enc.direccionDestino}</Text>
                      </View>
                      {enc.domiciliarioNombre && (
                        <Text style={{ fontSize: 11, color: Theme.primaryDark, fontWeight: "bold", marginTop: 6 }}>
                          🛵 Domiciliario: {enc.domiciliarioNombre}
                        </Text>
                      )}
                    </View>
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
                <Text style={styles.subtext}>
                  {comercioPropio ? comercioPropio.nombre : "Sucursal Aliada FastGo"}
                </Text>
              </View>
              <TouchableOpacity onPress={() => fetchPedidosComercio()}>
                <Text style={styles.linkAction}>↻ Refrescar</Text>
              </TouchableOpacity>
            </View>

            {/* Control Dedicado: ABRIR TIENDA / CERRAR TIENDA */}
            <View
              style={{
                marginTop: 12,
                padding: 14,
                backgroundColor: comercioPropio?.abierto !== false && !comercioPropio?.pausaManual ? "#ECFDF5" : "#FEF2F2",
                borderRadius: 16,
                borderWidth: 1.5,
                borderColor: comercioPropio?.abierto !== false && !comercioPropio?.pausaManual ? "#6EE7B7" : "#FCA5A5",
                gap: 10,
              }}
            >
              <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                  <Text style={{ fontSize: 20 }}>🏪</Text>
                  <View>
                    <Text style={{ fontSize: 13, fontWeight: "900", color: Theme.text }}>
                      ESTADO: {comercioPropio?.abierto !== false && !comercioPropio?.pausaManual ? "● ABIERTO" : "○ CERRADO"}
                    </Text>
                    <Text style={{ fontSize: 10, color: Theme.textMuted, marginTop: 1 }}>
                      {comercioPropio?.mensajeEstado || (comercioPropio?.pausaManual ? "Pausa manual activada por el comercio" : "Recibiendo pedidos con normalidad")}
                    </Text>
                  </View>
                </View>
                <View
                  style={[
                    styles.statusPill,
                    {
                      backgroundColor: comercioPropio?.abierto !== false && !comercioPropio?.pausaManual ? "#10B981" : "#EF4444",
                      paddingHorizontal: 8,
                      paddingVertical: 3,
                    },
                  ]}
                >
                  <Text style={{ color: "#FFFFFF", fontSize: 9, fontWeight: "900" }}>
                    {comercioPropio?.abierto !== false && !comercioPropio?.pausaManual ? "EN LÍNEA" : "CERRADO"}
                  </Text>
                </View>
              </View>

              <Text style={{ fontSize: 10, color: Theme.textMuted }}>
                ⏰ Horario: {comercioPropio?.horaApertura || "08:00"} a {comercioPropio?.horaCierre || "20:00"} ({comercioPropio?.diasAtencion || "Todos los días"})
              </Text>

              <TouchableOpacity
                style={{
                  backgroundColor: comercioPropio?.abierto !== false && !comercioPropio?.pausaManual ? "#DC2626" : "#059669",
                  paddingVertical: 10,
                  borderRadius: 12,
                  alignItems: "center",
                  justifyContent: "center",
                  minHeight: 44,
                }}
                onPress={handleTogglePausaTienda}
                disabled={togglingPause}
              >
                <Text style={{ color: "#FFFFFF", fontSize: 12, fontWeight: "900", textTransform: "uppercase" }}>
                  {togglingPause
                    ? "Actualizando..."
                    : comercioPropio?.abierto !== false && !comercioPropio?.pausaManual
                    ? "CERRAR TIENDA (Pausar)"
                    : "ABRIR TIENDA (Reanudar)"}
                </Text>
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

                  {/* Datos del Cliente y Entrega */}
                  <View style={{ backgroundColor: "#F8FAFC", padding: 8, borderRadius: 8, marginVertical: 6, borderWidth: 1, borderColor: "#E2E8F0" }}>
                    <Text style={{ fontSize: 11, fontWeight: "bold", color: Theme.text }}>
                      👤 Cliente: {p.clienteNombre || "Cliente FastGo"} {p.clienteTelefono ? `(${p.clienteTelefono})` : ""}
                    </Text>
                    <Text style={{ fontSize: 11, color: Theme.textMuted, marginTop: 2 }}>
                      📍 Entrega: {p.direccionTexto || "Dirección registrada"}
                    </Text>
                    <Text style={{ fontSize: 11, color: Theme.primary, fontWeight: "600", marginTop: 2 }}>
                      💳 Pago: {p.metodoPago || "EFECTIVO"}
                    </Text>
                    <Text style={{ fontSize: 10, color: Theme.textMuted, marginTop: 4 }}>
                      Subtotal: ${p.subtotal ? p.subtotal.toLocaleString() : "0"} • Domicilio: ${p.costoEnvio ? p.costoEnvio.toLocaleString() : "0"}
                    </Text>
                  </View>

                  {/* Banner de Pago Bancolombia y Comprobante */}
                  {p.metodoPago === "BANCOLOMBIA" && (
                    <View style={{
                      backgroundColor: p.estadoPago === "APROBADO" ? "#ECFDF5" : p.estadoPago === "RECHAZADO" ? "#FEF2F2" : "#FFFBEB",
                      borderColor: p.estadoPago === "APROBADO" ? "#6EE7B7" : p.estadoPago === "RECHAZADO" ? "#FCA5A5" : "#FDE68A",
                      borderWidth: 1.5,
                      borderRadius: 10,
                      padding: 10,
                      marginVertical: 6,
                    }}>
                      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                        <Text style={{ fontSize: 11, fontWeight: "900", color: p.estadoPago === "APROBADO" ? "#065F46" : p.estadoPago === "RECHAZADO" ? "#991B1B" : "#92400E" }}>
                          {p.estadoPago === "APROBADO" ? "✓ PAGO BANCOLOMBIA APROBADO" : p.estadoPago === "RECHAZADO" ? "✕ PAGO BANCOLOMBIA RECHAZADO" : "⚠️ PAGO BANCOLOMBIA PENDIENTE"}
                        </Text>
                        <View style={[styles.statusPill, {
                          backgroundColor: p.estadoPago === "APROBADO" ? "#10B981" : p.estadoPago === "RECHAZADO" ? "#EF4444" : "#F59E0B"
                        }]}>
                          <Text style={{ color: "#FFFFFF", fontSize: 9, fontWeight: "bold" }}>
                            {p.estadoPago || "PENDIENTE"}
                          </Text>
                        </View>
                      </View>

                      {p.comprobantePagoUrl && (
                        <TouchableOpacity
                          style={{
                            marginTop: 8,
                            paddingVertical: 6,
                            paddingHorizontal: 10,
                            backgroundColor: "#FFFFFF",
                            borderRadius: 8,
                            borderWidth: 1,
                            borderColor: Theme.border,
                            flexDirection: "row",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: 6,
                          }}
                          onPress={() => setViewingReceiptUrl(p.comprobantePagoUrl || null)}
                        >
                          <Text style={{ fontSize: 13 }}>👁️</Text>
                          <Text style={{ fontSize: 11, fontWeight: "bold", color: Theme.primary }}>
                            Ver Comprobante de Pago
                          </Text>
                        </TouchableOpacity>
                      )}

                      {/* Botones de Aprobar / Rechazar Pago */}
                      {p.estadoPago !== "APROBADO" && (
                        <View style={{ flexDirection: "row", gap: 8, marginTop: 8 }}>
                          <TouchableOpacity
                            style={{
                              flex: 1,
                              backgroundColor: Theme.primary,
                              paddingVertical: 7,
                              borderRadius: 8,
                              alignItems: "center",
                            }}
                            onPress={() => handleAprobarPago(p.id)}
                          >
                            <Text style={{ color: "#FFFFFF", fontSize: 10, fontWeight: "bold" }}>✓ Aprobar Pago</Text>
                          </TouchableOpacity>
                          <TouchableOpacity
                            style={{
                              flex: 1,
                              backgroundColor: Theme.danger,
                              paddingVertical: 7,
                              borderRadius: 8,
                              alignItems: "center",
                            }}
                            onPress={() => handleRechazarPago(p.id)}
                          >
                            <Text style={{ color: "#FFFFFF", fontSize: 10, fontWeight: "bold" }}>✕ Rechazar Pago</Text>
                          </TouchableOpacity>
                        </View>
                      )}
                    </View>
                  )}

                  <Text style={styles.kitchenPrice}>Total a cobrar: ${p.total.toLocaleString()} COP</Text>
                  {p.observaciones ? (
                    <Text style={[styles.kitchenNotes, { fontStyle: "italic", backgroundColor: "#FEF3C7", padding: 6, borderRadius: 6, color: "#92400E" }]}>
                      Nota: {p.observaciones}
                    </Text>
                  ) : null}

                  {/* Toggle para ver productos a empacar */}
                  <TouchableOpacity
                    style={{ paddingVertical: 6, flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginVertical: 4 }}
                    onPress={() => toggleKitchenOrderDetails(p.id)}
                  >
                    <Text style={{ fontSize: 11, fontWeight: "bold", color: Theme.primary }}>
                      📦 {expandedKitchenOrders[p.id] ? "Ocultar productos a empacar ▲" : "Ver productos a empacar ▼"}
                    </Text>
                    {loadingKitchenDetails[p.id] && <ActivityIndicator size="small" color={Theme.primary} />}
                  </TouchableOpacity>

                  {expandedKitchenOrders[p.id] && (
                    <View style={{ backgroundColor: "#FFFFFF", padding: 8, borderRadius: 8, borderWidth: 1, borderColor: "#CBD5E1", marginBottom: 8 }}>
                      <Text style={{ fontSize: 10, fontWeight: "bold", color: Theme.textMuted, textTransform: "uppercase", marginBottom: 4 }}>
                        Ítems para cocina / empaque:
                      </Text>
                      {expandedKitchenOrders[p.id].map((it) => (
                        <View key={it.id} style={{ flexDirection: "row", justifyContent: "space-between", paddingVertical: 3, borderBottomWidth: 0.5, borderBottomColor: "#F1F5F9" }}>
                          <Text style={{ fontSize: 11, fontWeight: "bold", color: Theme.text }}>
                            {it.cantidad}x {it.productoNombre || `Producto #${it.productoId}`}
                          </Text>
                          <Text style={{ fontSize: 11, color: Theme.textMuted }}>
                            ${it.subtotal ? it.subtotal.toLocaleString() : (it.precio * it.cantidad).toLocaleString()} COP
                          </Text>
                        </View>
                      ))}
                    </View>
                  )}

                  {/* Transiciones Autorizadas */}
                  <View style={styles.actionButtonRow}>
                    {p.estado === "PENDIENTE" && (
                      <>
                        <TouchableOpacity
                          style={[styles.smallActionBtn, { backgroundColor: Theme.info, flex: 1, marginRight: 6 }]}
                          onPress={() => transitionPedidoComercio(p.id, "confirmar")}
                        >
                          <Text style={styles.smallActionText}>✓ Confirmar</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={[styles.smallActionBtn, { backgroundColor: Theme.danger, flex: 1 }]}
                          onPress={() => transitionPedidoComercio(p.id, "rechazar")}
                        >
                          <Text style={styles.smallActionText}>✕ Rechazar</Text>
                        </TouchableOpacity>
                      </>
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
                      <View style={{ width: "100%" }}>
                        {p.metodoPago === "BANCOLOMBIA" && p.estadoPago !== "APROBADO" && (
                          <View style={{ backgroundColor: "#FEF2F2", padding: 6, borderRadius: 6, marginBottom: 6, borderWidth: 1, borderColor: "#FCA5A5" }}>
                            <Text style={{ color: "#991B1B", fontSize: 10, fontWeight: "bold", textAlign: "center" }}>
                              🔒 Despacho Bloqueado: Verifica y aprueba el pago antes de marcar listo.
                            </Text>
                          </View>
                        )}
                        <TouchableOpacity
                          style={[
                            styles.smallActionBtn,
                            {
                              backgroundColor: p.metodoPago === "BANCOLOMBIA" && p.estadoPago !== "APROBADO" ? "#94A3B8" : Theme.primary,
                              width: "100%",
                            }
                          ]}
                          onPress={() => transitionPedidoComercio(p.id, "listo")}
                        >
                          <Text style={styles.smallActionText}>📦 Listo para Entrega</Text>
                        </TouchableOpacity>
                      </View>
                    )}
                    {p.estado === "LISTO" && (
                      <View style={{ padding: 6, backgroundColor: "#FEF3C7", borderRadius: 6, width: "100%", alignItems: "center" }}>
                        <Text style={{ color: "#92400E", fontSize: 11, fontWeight: "bold" }}>
                          ⏳ En mostrador — Esperando repartidor
                        </Text>
                      </View>
                    )}
                    {p.estado === "EN_CAMINO" && (
                      <View style={{ padding: 6, backgroundColor: "#DBEAFE", borderRadius: 6, width: "100%", alignItems: "center" }}>
                        <Text style={{ color: "#1E40AF", fontSize: 11, fontWeight: "bold" }}>
                          🛵 En camino con el repartidor
                        </Text>
                      </View>
                    )}
                    {p.estado === "ENTREGADO" && (
                      <View style={{ padding: 6, backgroundColor: "#DCFCE7", borderRadius: 6, width: "100%", alignItems: "center" }}>
                        <Text style={{ color: "#166534", fontSize: 11, fontWeight: "bold" }}>
                          ✅ Entregado con éxito
                        </Text>
                      </View>
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

            {/* Selector de Tipo de Servicio para Domiciliario */}
            <View style={[styles.authToggleRow, { marginTop: 12 }]}>
              <TouchableOpacity
                style={[styles.authToggleBtn, domiServiceTab === "pedidos" && styles.authToggleBtnActive]}
                onPress={() => setDomiServiceTab("pedidos")}
              >
                <Text style={[styles.authToggleText, domiServiceTab === "pedidos" && styles.authToggleTextActive]}>
                  🍔 Pedidos Comercio ({pedidosDisponibles.length})
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.authToggleBtn, domiServiceTab === "encomiendas" && styles.authToggleBtnActive]}
                onPress={() => {
                  setDomiServiceTab("encomiendas");
                  fetchEncomiendasDomi();
                }}
              >
                <Text style={[styles.authToggleText, domiServiceTab === "encomiendas" && styles.authToggleTextActive]}>
                  📦 Encomiendas ({encomiendasDisponibles.length})
                </Text>
              </TouchableOpacity>
            </View>

            {domiServiceTab === "pedidos" ? (
              <View>
                {/* Pedidos Disponibles para Tomar */}
                <Text style={[styles.subHeading, { marginTop: 14 }]}>Listos para Recoger ({pedidosDisponibles.length})</Text>
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

                      {/* Origen vs Destino */}
                      <View style={{ backgroundColor: "#F8FAFC", padding: 10, borderRadius: 10, marginVertical: 6, borderWidth: 1, borderColor: "#E2E8F0", gap: 6 }}>
                        <View>
                          <Text style={{ fontSize: 10, fontWeight: "bold", color: "#7C3AED", textTransform: "uppercase" }}>
                            🏢 Origen (Recogida):
                          </Text>
                          <Text style={{ fontSize: 12, fontWeight: "bold", color: Theme.text }}>
                            {p.comercioNombre || p.origenNombre || "Comercio Aliado FastGo"}
                          </Text>
                          <Text style={{ fontSize: 11, color: Theme.textMuted }}>
                            {p.comercioDireccion || p.origenDireccion || "Dirección de sede comercial"}
                          </Text>
                        </View>

                        <View style={{ borderTopWidth: 1, borderTopColor: "#E2E8F0", paddingTop: 6 }}>
                          <Text style={{ fontSize: 10, fontWeight: "bold", color: "#059669", textTransform: "uppercase" }}>
                            📍 Destino (Cliente):
                          </Text>
                          <Text style={{ fontSize: 12, fontWeight: "bold", color: Theme.text }}>
                            {p.clienteNombre || "Cliente FastGo"}
                          </Text>
                          <Text style={{ fontSize: 11, color: Theme.textMuted }}>
                            {p.direccionTexto || "Dirección de entrega asignada"}
                          </Text>
                        </View>
                      </View>

                      {/* Ganancia del Domiciliario */}
                      <View style={{ backgroundColor: "#ECFDF5", padding: 10, borderRadius: 10, borderWidth: 1, borderColor: "#A7F3D0", marginVertical: 4 }}>
                        <Text style={{ fontSize: 10, fontWeight: "bold", color: "#065F46", textTransform: "uppercase" }}>
                          💵 Ganancia por Domicilio:
                        </Text>
                        <Text style={{ fontSize: 16, fontWeight: "900", color: "#047857" }}>
                          ${(p.costoEnvio || 2000).toLocaleString()} COP
                        </Text>
                        <Text style={{ fontSize: 9, color: "#065F46", marginTop: 2 }}>
                          Tarifa fija fijada por el comercio
                        </Text>
                      </View>

                      <Text style={styles.kitchenPrice}>Total de la orden: ${p.total.toLocaleString()} COP ({p.metodoPago || "EFECTIVO"})</Text>

                      <TouchableOpacity
                        style={[styles.solidBtn, { marginTop: 10, backgroundColor: Theme.primary }]}
                        onPress={() => tomarPedidoDomiciliario(p.id)}
                      >
                        <Text style={[styles.solidBtnText, { fontWeight: "900" }]}>ACEPTAR DOMICILIO</Text>
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

                      {/* Origen vs Destino en curso */}
                      <View style={{ backgroundColor: "#F8FAFC", padding: 10, borderRadius: 10, marginVertical: 6, borderWidth: 1, borderColor: "#E2E8F0", gap: 6 }}>
                        <View>
                          <Text style={{ fontSize: 10, fontWeight: "bold", color: "#7C3AED", textTransform: "uppercase" }}>
                            🏢 Recoger en:
                          </Text>
                          <Text style={{ fontSize: 12, fontWeight: "bold", color: Theme.text }}>
                            {p.comercioNombre || p.origenNombre || "Comercio Aliado FastGo"}
                          </Text>
                          <Text style={{ fontSize: 11, color: Theme.textMuted }}>
                            {p.comercioDireccion || p.origenDireccion || "Dirección de la sede"}
                          </Text>
                        </View>
                        <View style={{ borderTopWidth: 1, borderTopColor: "#E2E8F0", paddingTop: 6 }}>
                          <Text style={{ fontSize: 10, fontWeight: "bold", color: "#059669", textTransform: "uppercase" }}>
                            📍 Entregar a:
                          </Text>
                          <Text style={{ fontSize: 12, fontWeight: "bold", color: Theme.text }}>
                            {p.clienteNombre || "Cliente"} {p.clienteTelefono ? `(${p.clienteTelefono})` : ""}
                          </Text>
                          <Text style={{ fontSize: 11, color: Theme.textMuted }}>
                            {p.direccionTexto || "Dirección de entrega"}
                          </Text>
                        </View>
                      </View>

                      <Text style={styles.kitchenPrice}>Cobro al cliente: ${p.total.toLocaleString()} COP ({p.metodoPago || "EFECTIVO"})</Text>
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
            ) : (
              /* SECCIÓN ENCOMIENDAS URBANAS */
              <View>
                {/* Encomiendas Asignadas en Curso */}
                <Text style={[styles.subHeading, { marginTop: 14 }]}>
                  Mis Encomiendas en Curso ({misEncomiendasDomi.filter(e => e.estado !== "ENTREGADA").length})
                </Text>
                {misEncomiendasDomi.filter(e => e.estado !== "ENTREGADA").length === 0 ? (
                  <Text style={styles.helperText}>No tienes encomiendas asignadas en este momento.</Text>
                ) : (
                  misEncomiendasDomi
                    .filter(e => e.estado !== "ENTREGADA")
                    .map((enc) => (
                      <View key={enc.id} style={[styles.kitchenCard, { borderColor: Theme.info }]}>
                        <View style={styles.orderHeaderRow}>
                          <Text style={styles.orderNumberTitle}>Encomienda #ENC-{enc.id}</Text>
                          <View style={[styles.statusPill, { backgroundColor: "#DBEAFE" }]}>
                            <Text style={{ color: "#1E40AF", fontSize: 10, fontWeight: "bold" }}>{enc.estado}</Text>
                          </View>
                        </View>
                        <Text style={styles.kitchenPrice}>Ganancia de envío: ${enc.costoEnvio?.toLocaleString()} COP</Text>
                        <Text style={styles.kitchenNotes}>Paquete: {enc.descripcion} ({enc.tamanoPeso || "Estándar"})</Text>
                        <View style={{ marginTop: 6, padding: 8, backgroundColor: "#FFFFFF", borderRadius: 8, borderWidth: 1, borderColor: Theme.border }}>
                          <Text style={{ fontSize: 11, color: Theme.text }}><Text style={{ fontWeight: "bold" }}>1. Recoger:</Text> {enc.direccionOrigen} ({enc.remitenteNombre} - {enc.remitenteTelefono})</Text>
                          <Text style={{ fontSize: 11, color: Theme.text, marginTop: 2 }}><Text style={{ fontWeight: "bold" }}>2. Entregar:</Text> {enc.direccionDestino} ({enc.destinatarioNombre} - {enc.destinatarioTelefono})</Text>
                        </View>

                        {/* Botones de acción según el estado */}
                        <View style={styles.actionButtonRow}>
                          {enc.estado === "ACEPTADA" && (
                            <TouchableOpacity
                              style={[styles.smallActionBtn, { backgroundColor: Theme.primary }]}
                              onPress={() => handleEstadoEncomienda(enc.id, "EN_RECOGIDA", "En camino a recoger paquete")}
                            >
                              <Text style={styles.smallActionText}>🛵 Ir a Recoger Paquete</Text>
                            </TouchableOpacity>
                          )}
                          {enc.estado === "EN_RECOGIDA" && (
                            <TouchableOpacity
                              style={[styles.smallActionBtn, { backgroundColor: Theme.info }]}
                              onPress={() => handleEstadoEncomienda(enc.id, "EN_CAMINO", "Paquete recogido, en ruta")}
                            >
                              <Text style={styles.smallActionText}>📦 Paquete Recogido (En Ruta)</Text>
                            </TouchableOpacity>
                          )}
                          {enc.estado === "EN_CAMINO" && (
                            <TouchableOpacity
                              style={[styles.smallActionBtn, { backgroundColor: Theme.accent }]}
                              onPress={() => handleEstadoEncomienda(enc.id, "ENTREGADA", "Encomienda entregada con éxito")}
                            >
                              <Text style={styles.smallActionText}>✓ Confirmar Entrega</Text>
                            </TouchableOpacity>
                          )}
                        </View>
                      </View>
                    ))
                )}

                {/* Encomiendas Disponibles */}
                <Text style={[styles.subHeading, { marginTop: 24 }]}>
                  Encomiendas Disponibles para Tomar ({encomiendasDisponibles.length})
                </Text>
                {encomiendasDisponibles.length === 0 ? (
                  <Text style={styles.helperText}>No hay encomiendas pendientes por repartidor.</Text>
                ) : (
                  encomiendasDisponibles.map((enc) => (
                    <View key={enc.id} style={styles.kitchenCard}>
                      <View style={styles.orderHeaderRow}>
                        <Text style={styles.orderNumberTitle}>#ENC-{enc.id}</Text>
                        <View style={[styles.statusPill, { backgroundColor: "#FEF3C7" }]}>
                          <Text style={{ color: "#92400E", fontSize: 10, fontWeight: "bold" }}>DISPONIBLE</Text>
                        </View>
                      </View>
                      <Text style={styles.kitchenPrice}>Ganancia del servicio: ${enc.costoEnvio?.toLocaleString()} COP</Text>
                      <Text style={styles.kitchenNotes}>{enc.descripcion} ({enc.tamanoPeso || "Estándar"})</Text>
                      <View style={{ marginTop: 6, padding: 8, backgroundColor: "#FFFFFF", borderRadius: 8, borderWidth: 1, borderColor: Theme.border }}>
                        <Text style={{ fontSize: 11, color: Theme.text }}><Text style={{ fontWeight: "bold" }}>Origen:</Text> {enc.direccionOrigen}</Text>
                        <Text style={{ fontSize: 11, color: Theme.text, marginTop: 2 }}><Text style={{ fontWeight: "bold" }}>Destino:</Text> {enc.direccionDestino}</Text>
                      </View>
                      <TouchableOpacity
                        style={[styles.solidBtn, { marginTop: 10 }]}
                        onPress={() => handleTomarEncomienda(enc.id)}
                      >
                        <Text style={styles.solidBtnText}>Tomar Encomienda (Atómico)</Text>
                      </TouchableOpacity>
                    </View>
                  ))
                )}
              </View>
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
        {/* ====================================================
            VISTA: PERFIL DE USUARIO
           ==================================================== */}
        {activeTab === "perfil" && user && (
          <View style={styles.cardContainer}>
            <View style={styles.profileHeader}>
              <View style={styles.profileAvatarBig}>
                <Text style={styles.profileAvatarBigText}>{user.nombre.charAt(0)}</Text>
              </View>
              <Text style={styles.profileFullName}>{user.nombre} {user.apellido || ""}</Text>
              <Text style={styles.profileEmailText}>{user.correo}</Text>
              <View style={[styles.statusPill, { backgroundColor: Theme.primaryLight, marginTop: 8 }]}>
                <Text style={{ color: Theme.primaryDark, fontSize: 12, fontWeight: "bold" }}>
                  ROL: {user.activeRole || user.rol}
                </Text>
              </View>
            </View>

            {user.telefono && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Teléfono:</Text>
                <Text style={styles.infoValue}>{user.telefono}</Text>
              </View>
            )}

            {/* SECCIÓN EXCLUSIVA COMERCIO: CONFIGURACIÓN DE TIENDA Y PRODUCTOS */}
            {(user.activeRole || user.rol) === "COMERCIO" && (
              <View style={{ marginTop: 18, gap: 16 }}>
                {/* 1. Configuración de Tienda, Tarifa y Bancolombia */}
                <View style={{
                  padding: 16,
                  backgroundColor: "#FFFFFF",
                  borderRadius: 16,
                  borderWidth: 1.5,
                  borderColor: Theme.primary,
                  gap: 12,
                }}>
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                    <Text style={{ fontSize: 22 }}>🏪</Text>
                    <View>
                      <Text style={{ fontSize: 15, fontWeight: "900", color: Theme.text }}>
                        Configuración de Mi Comercio
                      </Text>
                      <Text style={{ fontSize: 11, color: Theme.textMuted }}>
                        {comercioPropio ? comercioPropio.nombre : "Gestión oficial de sucursal"}
                      </Text>
                    </View>
                  </View>

                  {/* Tarifa de Domicilio */}
                  <View style={{ gap: 4 }}>
                    <Text style={{ fontSize: 12, fontWeight: "bold", color: Theme.text }}>
                      🛵 Tarifa de Domicilio (COP):
                    </Text>
                    <Text style={{ fontSize: 10, color: Theme.textMuted }}>
                      Mínimo $2.000 COP exigido por la plataforma.
                    </Text>
                    <TextInput
                      style={styles.textInput}
                      keyboardType="numeric"
                      value={storeTarifaDomicilio}
                      onChangeText={setStoreTarifaDomicilio}
                      placeholder="2000"
                    />
                  </View>

                  {/* Configuración Bancolombia */}
                  <View style={{
                    padding: 12,
                    backgroundColor: "#FFFBEB",
                    borderRadius: 12,
                    borderWidth: 1,
                    borderColor: "#FCD34D",
                    gap: 10,
                  }}>
                    <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                      <View style={{ flex: 1 }}>
                        <Text style={{ fontSize: 12, fontWeight: "bold", color: "#78350F" }}>
                          📲 Pagos Directos con Bancolombia
                        </Text>
                        <Text style={{ fontSize: 10, color: "#92400E" }}>
                          Permite a tus clientes pagar por transferencia
                        </Text>
                      </View>
                      <Switch
                        value={storeBancolombiaActivo}
                        onValueChange={setStoreBancolombiaActivo}
                        trackColor={{ false: "#CBD5E1", true: Theme.primary }}
                        thumbColor={storeBancolombiaActivo ? "#FFFFFF" : "#F8FAFC"}
                      />
                    </View>

                    {storeBancolombiaActivo && (
                      <View style={{ gap: 8, marginTop: 4 }}>
                        <View>
                          <Text style={{ fontSize: 11, fontWeight: "bold", color: Theme.text }}>Tipo de Cuenta:</Text>
                          <View style={{ flexDirection: "row", gap: 8, marginTop: 4 }}>
                            {["AHORROS", "CORRIENTE"].map((t) => (
                              <TouchableOpacity
                                key={t}
                                style={[
                                  styles.roleChoiceBtn,
                                  storeBancolombiaTipoCuenta === t && { backgroundColor: Theme.primary, borderColor: Theme.primary }
                                ]}
                                onPress={() => setStoreBancolombiaTipoCuenta(t)}
                              >
                                <Text style={{ fontSize: 11, fontWeight: "bold", color: storeBancolombiaTipoCuenta === t ? "#FFFFFF" : Theme.text }}>
                                  {t === "AHORROS" ? "Cuenta de Ahorros" : "Cuenta Corriente"}
                                </Text>
                              </TouchableOpacity>
                            ))}
                          </View>
                        </View>

                        <View>
                          <Text style={{ fontSize: 11, fontWeight: "bold", color: Theme.text }}>Número de Cuenta:</Text>
                          <TextInput
                            style={[styles.textInput, { backgroundColor: "#FFFFFF" }]}
                            keyboardType="numeric"
                            value={storeBancolombiaNumeroCuenta}
                            onChangeText={setStoreBancolombiaNumeroCuenta}
                            placeholder="Ej. 12345678901"
                          />
                        </View>

                        <View>
                          <Text style={{ fontSize: 11, fontWeight: "bold", color: Theme.text }}>Nombre del Titular:</Text>
                          <TextInput
                            style={[styles.textInput, { backgroundColor: "#FFFFFF" }]}
                            value={storeBancolombiaTitular}
                            onChangeText={setStoreBancolombiaTitular}
                            placeholder="Ej. Juan Pérez / Mi Negocio SAS"
                          />
                        </View>

                        <View>
                          <Text style={{ fontSize: 11, fontWeight: "bold", color: Theme.text }}>Documento / NIT del Titular:</Text>
                          <TextInput
                            style={[styles.textInput, { backgroundColor: "#FFFFFF" }]}
                            value={storeBancolombiaDocTitular}
                            onChangeText={setStoreBancolombiaDocTitular}
                            placeholder="Ej. 1020304050 / 901234567-1"
                          />
                        </View>
                      </View>
                    )}
                  </View>

                  {/* Logo y Banner del Comercio */}
                  <View style={{ gap: 8 }}>
                    <Text style={{ fontSize: 12, fontWeight: "bold", color: Theme.text }}>
                      🖼️ Imagen de Marca (Logo y Banner):
                    </Text>
                    <View style={{ flexDirection: "row", gap: 10 }}>
                      {/* Logo */}
                      <View style={{ flex: 1, alignItems: "center", backgroundColor: "#F8FAFC", padding: 8, borderRadius: 10, borderWidth: 1, borderColor: Theme.border }}>
                        <Text style={{ fontSize: 10, fontWeight: "bold", color: Theme.textMuted, marginBottom: 6 }}>LOGO</Text>
                        {storeLogoUrl ? (
                          <Image
                            source={{ uri: resolveMediaUrl(storeLogoUrl) || "" }}
                            style={{ width: 50, height: 50, borderRadius: 25, marginBottom: 6 }}
                          />
                        ) : (
                          <View style={{ width: 50, height: 50, borderRadius: 25, backgroundColor: "#E2E8F0", alignItems: "center", justifyContent: "center", marginBottom: 6 }}>
                            <Text style={{ fontSize: 18 }}>📷</Text>
                          </View>
                        )}
                        <TouchableOpacity
                          style={[styles.smallActionBtn, { backgroundColor: Theme.primary, width: "100%", alignItems: "center" }]}
                          onPress={() => pickAndUploadImage((url) => setStoreLogoUrl(url), setIsUploadingStoreLogo)}
                          disabled={isUploadingStoreLogo}
                        >
                          <Text style={styles.smallActionText}>
                            {isUploadingStoreLogo ? "Subiendo..." : "Subir Logo"}
                          </Text>
                        </TouchableOpacity>
                      </View>

                      {/* Banner */}
                      <View style={{ flex: 1, alignItems: "center", backgroundColor: "#F8FAFC", padding: 8, borderRadius: 10, borderWidth: 1, borderColor: Theme.border }}>
                        <Text style={{ fontSize: 10, fontWeight: "bold", color: Theme.textMuted, marginBottom: 6 }}>BANNER</Text>
                        {storeBannerUrl ? (
                          <Image
                            source={{ uri: resolveMediaUrl(storeBannerUrl) || "" }}
                            style={{ width: "100%", height: 50, borderRadius: 8, marginBottom: 6 }}
                            resizeMode="cover"
                          />
                        ) : (
                          <View style={{ width: "100%", height: 50, borderRadius: 8, backgroundColor: "#E2E8F0", alignItems: "center", justifyContent: "center", marginBottom: 6 }}>
                            <Text style={{ fontSize: 18 }}>🖼️</Text>
                          </View>
                        )}
                        <TouchableOpacity
                          style={[styles.smallActionBtn, { backgroundColor: Theme.primary, width: "100%", alignItems: "center" }]}
                          onPress={() => pickAndUploadImage((url) => setStoreBannerUrl(url), setIsUploadingStoreBanner)}
                          disabled={isUploadingStoreBanner}
                        >
                          <Text style={styles.smallActionText}>
                            {isUploadingStoreBanner ? "Subiendo..." : "Subir Banner"}
                          </Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>

                  {/* Botón Guardar Configuración */}
                  <TouchableOpacity
                    style={[styles.solidBtn, { marginTop: 6 }]}
                    onPress={handleSaveStoreConfig}
                    disabled={isSavingStoreConfig}
                  >
                    {isSavingStoreConfig ? (
                      <ActivityIndicator color="#FFFFFF" />
                    ) : (
                      <Text style={styles.solidBtnText}>💾 Guardar Configuración</Text>
                    )}
                  </TouchableOpacity>
                </View>

                {/* 2. Catálogo de Productos del Comercio */}
                <View style={{
                  padding: 16,
                  backgroundColor: "#FFFFFF",
                  borderRadius: 16,
                  borderWidth: 1,
                  borderColor: Theme.border,
                  gap: 12,
                }}>
                  <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                    <View>
                      <Text style={{ fontSize: 15, fontWeight: "900", color: Theme.text }}>
                        🍔 Mi Menú de Productos
                      </Text>
                      <Text style={{ fontSize: 11, color: Theme.textMuted }}>
                        Crea platos con imágenes y gestiona stock
                      </Text>
                    </View>
                    <TouchableOpacity
                      style={[styles.smallActionBtn, { backgroundColor: Theme.primary, paddingHorizontal: 12 }]}
                      onPress={() => handleOpenProductModal()}
                    >
                      <Text style={styles.smallActionText}>+ Crear Plato</Text>
                    </TouchableOpacity>
                  </View>

                  {/* Lista de Productos Propios */}
                  {productos.length === 0 ? (
                    <Text style={styles.helperText}>No tienes productos registrados en tu catálogo.</Text>
                  ) : (
                    productos.map((prod) => (
                      <View
                        key={prod.id}
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          padding: 10,
                          backgroundColor: "#F8FAFC",
                          borderRadius: 12,
                          borderWidth: 1,
                          borderColor: Theme.border,
                          gap: 10,
                        }}
                      >
                        {prod.imagenPrincipal || prod.imagenUrl ? (
                          <Image
                            source={{ uri: resolveMediaUrl(prod.imagenPrincipal || prod.imagenUrl) || "" }}
                            style={{ width: 50, height: 50, borderRadius: 8, backgroundColor: "#E2E8F0" }}
                            resizeMode="cover"
                          />
                        ) : (
                          <View style={{ width: 50, height: 50, borderRadius: 8, backgroundColor: "#E2E8F0", alignItems: "center", justifyContent: "center" }}>
                            <Text style={{ fontSize: 20 }}>🍽️</Text>
                          </View>
                        )}

                        <View style={{ flex: 1 }}>
                          <Text style={{ fontSize: 13, fontWeight: "bold", color: Theme.text }}>{prod.nombre}</Text>
                          <Text style={{ fontSize: 12, fontWeight: "800", color: Theme.primary }}>
                            ${prod.precio.toLocaleString()} COP
                          </Text>
                          <Text style={{ fontSize: 10, color: prod.disponible !== false ? "#166534" : "#991B1B", fontWeight: "bold" }}>
                            {prod.disponible !== false ? "● DISPONIBLE" : "○ AGOTADO"}
                          </Text>
                        </View>

                        <View style={{ alignItems: "flex-end", gap: 6 }}>
                          <TouchableOpacity
                            style={[styles.smallActionBtn, { backgroundColor: Theme.info, paddingVertical: 4, paddingHorizontal: 10 }]}
                            onPress={() => handleOpenProductModal(prod)}
                          >
                            <Text style={styles.smallActionText}>Editar</Text>
                          </TouchableOpacity>
                          <TouchableOpacity
                            style={[
                              styles.smallActionBtn,
                              { backgroundColor: prod.disponible !== false ? "#F59E0B" : "#10B981", paddingVertical: 4, paddingHorizontal: 8 }
                            ]}
                            onPress={() => handleToggleProductoDisponibilidad(prod.id, prod.disponible ?? true)}
                          >
                            <Text style={styles.smallActionText}>
                              {prod.disponible !== false ? "Agotar" : "Activar"}
                            </Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    ))
                  )}
                </View>
              </View>
            )}

            {/* Perfiles Asociados y Cambio de Rol */}
            {user.availableRoles && user.availableRoles.length > 1 && (
              <View style={{ marginTop: 16, padding: 14, backgroundColor: "#F8FAFC", borderRadius: 14, borderWidth: 1, borderColor: Theme.border }}>
                <Text style={{ fontSize: 13, fontWeight: "bold", color: Theme.text, marginBottom: 4 }}>
                  🔄 Cambiar de Perfil / Rol
                </Text>
                <Text style={{ fontSize: 11, color: Theme.textMuted, marginBottom: 10 }}>
                  Tu cuenta cuenta con múltiples perfiles autorizados. Toca para cambiar de modo:
                </Text>
                <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
                  {user.availableRoles.map((r) => {
                    const isActive = (user.activeRole || user.rol) === r;
                    return (
                      <TouchableOpacity
                        key={r}
                        onPress={() => !isActive && handleSwitchRole(r)}
                        disabled={switchingRole}
                        style={[
                          styles.roleChoiceBtn,
                          isActive && { backgroundColor: Theme.primary, borderColor: Theme.primary },
                        ]}
                      >
                        <Text style={{ fontSize: 12, fontWeight: "bold", color: isActive ? "#FFFFFF" : Theme.text }}>
                          {r === "CLIENTE" ? "🛍️ Cliente" : r === "COMERCIO" ? "🏪 Comercio" : r === "DOMICILIARIO" ? "🛵 Domiciliario" : "⚙️ Admin"}
                          {isActive ? " (Activo)" : ""}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            )}

            <TouchableOpacity style={[styles.outlineBtn, { marginTop: 24, borderColor: Theme.danger }]} onPress={handleLogout}>
              <Text style={{ color: Theme.danger, fontWeight: "bold" }}>Cerrar Sesión</Text>
            </TouchableOpacity>
          </View>
        )}
        </ScrollView>
      </View>

      {/* Botón Flotante de Carrito cuando hay productos */}
      {activeTab === "explorar" && cart.length > 0 && (
        <TouchableOpacity
          style={{
            position: "absolute",
            bottom: 74,
            left: 16,
            right: 16,
            backgroundColor: Theme.primary,
            borderRadius: 16,
            paddingVertical: 14,
            paddingHorizontal: 18,
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            elevation: 8,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 6,
            zIndex: 999,
          }}
          onPress={() => navigateTo("carrito")}
        >
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            <Text style={{ fontSize: 20 }}>🛒</Text>
            <Text style={{ color: "#FFFFFF", fontWeight: "bold", fontSize: 15 }}>
              Ver Carrito ({cart.reduce((s, i) => s + i.cantidad, 0)})
            </Text>
          </View>
          <Text style={{ color: "#FFFFFF", fontWeight: "900", fontSize: 15 }}>
            ${totalCart.toLocaleString()} COP →
          </Text>
        </TouchableOpacity>
      )}

      {/* BARRA DE NAVEGACIÓN INFERIOR ADAPTATIVA POR ROL */}
      <View style={styles.bottomNav}>
        {/* Rol CLIENTE */}
        {(user?.activeRole || user?.rol) === "CLIENTE" && (
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
              onPress={() => {
                navigateTo("encomiendas");
                fetchEncomiendasCliente();
              }}
            >
              <Text style={[styles.navIcon, activeTab === "encomiendas" && styles.navIconActive]}>🚚</Text>
              <Text style={[styles.navText, activeTab === "encomiendas" && styles.navTextActive]}>Encomiendas</Text>
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
              <Text style={[styles.navText, activeTab === "perfil" && styles.navTextActive]}>Mi Perfil</Text>
            </TouchableOpacity>
          </>
        )}

        {/* Rol COMERCIO */}
        {(user?.activeRole || user?.rol) === "COMERCIO" && (
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
        {(user?.activeRole || user?.rol) === "DOMICILIARIO" && (
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
        {(user?.activeRole || user?.rol) === "ADMIN" && (
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

      {/* MODAL DE SELECCIÓN DE PERFIL / MULTI-ROL */}
      {showRoleModal && (
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCardContainer}>
            <Text style={styles.modalEmoji}>👋</Text>
            <Text style={styles.modalHeaderTitle}>¿Cómo quieres usar FASTGO hoy?</Text>
            <Text style={styles.modalHeaderSub}>
              Tu cuenta tiene múltiples perfiles habilitados. Selecciona el perfil con el que deseas ingresar en esta sesión:
            </Text>

            <View style={{ gap: 10, marginTop: 14 }}>
              {pendingRoles.map((r) => {
                const roleMeta: Record<string, { label: string; desc: string; icon: string }> = {
                  CLIENTE: { label: "Cliente", desc: "Comprar comida, productos y solicitar envíos", icon: "🛍️" },
                  COMERCIO: { label: "Comercio", desc: "Gestionar mi tienda, productos y órdenes", icon: "🏪" },
                  DOMICILIARIO: { label: "Domiciliario", desc: "Aceptar despachos y repartir encomiendas", icon: "🛵" },
                  ADMIN: { label: "Administrador", desc: "Supervisión y control de la plataforma", icon: "⚙️" },
                };
                const meta = roleMeta[r] || { label: r, desc: "Ingresar como " + r, icon: "👤" };

                return (
                  <TouchableOpacity
                    key={r}
                    onPress={() => handleSwitchRole(r)}
                    disabled={switchingRole}
                    style={styles.modalRoleSelectionBtn}
                  >
                    <Text style={{ fontSize: 24, marginRight: 12 }}>{meta.icon}</Text>
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontSize: 14, fontWeight: "bold", color: Theme.text }}>{meta.label}</Text>
                      <Text style={{ fontSize: 11, color: Theme.textMuted, marginTop: 2 }}>{meta.desc}</Text>
                    </View>
                    <Text style={{ fontSize: 16, color: Theme.primary, fontWeight: "bold" }}>→</Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {switchingRole && (
              <View style={{ marginTop: 12, alignItems: "center" }}>
                <ActivityIndicator color={Theme.primary} />
                <Text style={{ fontSize: 11, color: Theme.textMuted, marginTop: 4 }}>Cambiando de perfil...</Text>
              </View>
            )}
          </View>
        </View>
      )}

      {/* MODAL CREAR / EDITAR PRODUCTO */}
      {showProductModal && (
        <View style={styles.modalBackdrop}>
          <View style={[styles.modalCardContainer, { maxHeight: "90%" }]}>
            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <Text style={{ fontSize: 16, fontWeight: "900", color: Theme.text }}>
                  {editingProduct ? "✏️ Editar Producto" : "✨ Nuevo Producto"}
                </Text>
                <TouchableOpacity onPress={() => setShowProductModal(false)} style={{ padding: 4 }}>
                  <Text style={{ fontSize: 16, fontWeight: "bold", color: Theme.textMuted }}>✕</Text>
                </TouchableOpacity>
              </View>

              {/* Nombre */}
              <View style={{ marginBottom: 10 }}>
                <Text style={styles.inputLabel}>Nombre del Producto *</Text>
                <TextInput
                  style={styles.textInput}
                  value={prodFormNombre}
                  onChangeText={setProdFormNombre}
                  placeholder="Ej. Hamburguesa Doble Queso"
                />
              </View>

              {/* Descripción */}
              <View style={{ marginBottom: 10 }}>
                <Text style={styles.inputLabel}>Descripción</Text>
                <TextInput
                  style={[styles.textInput, { height: 60, textAlignVertical: "top" }]}
                  multiline
                  value={prodFormDesc}
                  onChangeText={setProdFormDesc}
                  placeholder="Detalles de preparación, ingredientes, etc."
                />
              </View>

              {/* Precio */}
              <View style={{ marginBottom: 10 }}>
                <Text style={styles.inputLabel}>Precio en COP *</Text>
                <TextInput
                  style={styles.textInput}
                  keyboardType="numeric"
                  value={prodFormPrecio}
                  onChangeText={setProdFormPrecio}
                  placeholder="15000"
                />
              </View>

              {/* Categoría */}
              <View style={{ marginBottom: 10 }}>
                <Text style={styles.inputLabel}>Categoría</Text>
                <TextInput
                  style={styles.textInput}
                  value={prodFormCategoria}
                  onChangeText={setProdFormCategoria}
                  placeholder="Plato Principal, Bebidas, etc."
                />
              </View>

              {/* Imagen del Producto con Carga Nativa */}
              <View style={{ marginBottom: 14 }}>
                <Text style={styles.inputLabel}>Foto del Producto</Text>
                {prodFormImagen ? (
                  <View style={{ alignItems: "center", backgroundColor: "#F8FAFC", padding: 10, borderRadius: 12, borderWidth: 1, borderColor: Theme.border, gap: 8 }}>
                    <Image
                      source={{ uri: resolveMediaUrl(prodFormImagen) || "" }}
                      style={{ width: "100%", height: 140, borderRadius: 10, backgroundColor: "#E2E8F0" }}
                      resizeMode="cover"
                    />
                    <View style={{ flexDirection: "row", gap: 10, width: "100%" }}>
                      <TouchableOpacity
                        style={[styles.smallActionBtn, { flex: 1, backgroundColor: Theme.primary, alignItems: "center" }]}
                        onPress={() => pickAndUploadImage((url) => setProdFormImagen(url), setIsUploadingProductImage)}
                        disabled={isUploadingProductImage}
                      >
                        <Text style={styles.smallActionText}>
                          {isUploadingProductImage ? "Cargando..." : "Cambiar Foto"}
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[styles.smallActionBtn, { backgroundColor: Theme.danger, paddingHorizontal: 12, alignItems: "center" }]}
                        onPress={() => setProdFormImagen("")}
                      >
                        <Text style={styles.smallActionText}>Quitar</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ) : (
                  <TouchableOpacity
                    style={{
                      backgroundColor: "#F8FAFC",
                      borderWidth: 1.5,
                      borderStyle: "dashed",
                      borderColor: Theme.primary,
                      borderRadius: 12,
                      padding: 18,
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 6,
                    }}
                    onPress={() => pickAndUploadImage((url) => setProdFormImagen(url), setIsUploadingProductImage)}
                    disabled={isUploadingProductImage}
                  >
                    {isUploadingProductImage ? (
                      <ActivityIndicator color={Theme.primary} />
                    ) : (
                      <>
                        <Text style={{ fontSize: 24 }}>📷</Text>
                        <Text style={{ fontSize: 12, fontWeight: "bold", color: Theme.primary }}>
                          Cargar imagen desde el dispositivo
                        </Text>
                        <Text style={{ fontSize: 10, color: Theme.textMuted }}>
                          Formatos JPG, PNG (máx. 10MB)
                        </Text>
                      </>
                    )}
                  </TouchableOpacity>
                )}
              </View>

              {/* Disponibilidad */}
              <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 16, backgroundColor: "#F8FAFC", padding: 10, borderRadius: 10 }}>
                <Text style={{ fontSize: 12, fontWeight: "bold", color: Theme.text }}>Disponible para la venta:</Text>
                <Switch
                  value={prodFormDisponible}
                  onValueChange={setProdFormDisponible}
                  trackColor={{ false: "#CBD5E1", true: Theme.primary }}
                  thumbColor={prodFormDisponible ? "#FFFFFF" : "#F8FAFC"}
                />
              </View>

              {/* Botón Guardar */}
              <TouchableOpacity
                style={[styles.solidBtn, { marginBottom: 8 }]}
                onPress={handleSaveProduct}
                disabled={isSavingProduct}
              >
                {isSavingProduct ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.solidBtnText}>
                    {editingProduct ? "Guardar Cambios" : "Crear Producto"}
                  </Text>
                )}
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      )}

      {/* MODAL VISOR DE COMPROBANTE DE PAGO */}
      {viewingReceiptUrl && (
        <View style={styles.modalBackdrop}>
          <View style={[styles.modalCardContainer, { padding: 16, maxHeight: "90%" }]}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <Text style={{ fontSize: 15, fontWeight: "900", color: Theme.text }}>
                🧾 Comprobante de Transferencia
              </Text>
              <TouchableOpacity onPress={() => setViewingReceiptUrl(null)} style={{ padding: 4 }}>
                <Text style={{ fontSize: 16, fontWeight: "bold", color: Theme.textMuted }}>✕</Text>
              </TouchableOpacity>
            </View>

            <View style={{ borderRadius: 12, overflow: "hidden", backgroundColor: "#000000", alignItems: "center", justifyContent: "center" }}>
              <Image
                source={{
                  uri: resolveMediaUrl(viewingReceiptUrl) || "",
                  headers: token ? { Authorization: `Bearer ${token}` } : undefined,
                }}
                style={{ width: "100%", height: 350 }}
                resizeMode="contain"
              />
            </View>

            <TouchableOpacity
              style={[styles.outlineBtn, { marginTop: 14 }]}
              onPress={() => setViewingReceiptUrl(null)}
            >
              <Text style={{ color: Theme.text, fontWeight: "bold" }}>Cerrar Visor</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
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
  splashContainer: {
    flex: 1,
    backgroundColor: Theme.primaryDark,
    justifyContent: "center",
    alignItems: "center",
  },
  splashContent: {
    alignItems: "center",
    padding: 24,
  },
  splashLogoBadge: {
    width: 80,
    height: 80,
    borderRadius: 24,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  splashLogoEmoji: {
    fontSize: 44,
  },
  splashBrandTitle: {
    fontSize: 38,
    fontWeight: "900",
    color: "#FFFFFF",
    letterSpacing: 1,
    marginTop: 16,
  },
  splashBrandSlogan: {
    fontSize: 13,
    color: "rgba(255, 255, 255, 0.85)",
    fontWeight: "500",
    marginTop: 4,
  },
  splashLoadingText: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.75)",
    marginTop: 12,
  },
  authScrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: Platform.OS === "android" ? 30 : 20,
    paddingBottom: 40,
    backgroundColor: Theme.background,
  },
  authTopSection: {
    alignItems: "center",
    marginBottom: 20,
  },
  authLogoBadge: {
    width: 60,
    height: 60,
    borderRadius: 20,
    backgroundColor: Theme.primary,
    alignItems: "center",
    justifyContent: "center",
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 6,
  },
  authLogoBadgeEmoji: {
    fontSize: 32,
  },
  authMainTitle: {
    fontSize: 28,
    fontWeight: "900",
    color: Theme.secondary,
    letterSpacing: 0.5,
    marginTop: 10,
  },
  authMainSubtitle: {
    fontSize: 13,
    color: Theme.textMuted,
    fontWeight: "500",
    marginTop: 2,
  },
  authCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: Theme.border,
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 10,
  },
  authSectionHeading: {
    fontSize: 18,
    fontWeight: "800",
    color: Theme.text,
    marginBottom: 2,
  },
  authSectionSub: {
    fontSize: 12,
    color: Theme.textMuted,
    marginBottom: 16,
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
    paddingBottom: 110,
  },
  compactHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 14,
    paddingVertical: 2,
  },
  compactHeaderGreeting: {
    fontSize: 18,
    fontWeight: "900",
    color: Theme.text,
  },
  compactHeaderSub: {
    fontSize: 12,
    color: Theme.textMuted,
    marginTop: 1,
  },
  compactHeaderBadge: {
    backgroundColor: Theme.primaryLight,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#A7F3D0",
  },
  compactHeaderBadgeText: {
    fontSize: 11,
    fontWeight: "bold",
    color: Theme.primaryDark,
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
    paddingBottom: Platform.OS === "android" ? 14 : 8,
    minHeight: 64,
    flexShrink: 0,
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
  servicesGridRow: {
    flexDirection: "row",
    gap: 10,
    marginVertical: 12,
  },
  serviceCard: {
    flex: 1,
    borderRadius: 14,
    borderWidth: 1,
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
  },
  serviceBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    marginBottom: 4,
  },
  serviceBadgeText: {
    fontSize: 8,
    fontWeight: "900",
    letterSpacing: 0.5,
  },
  serviceTitle: {
    fontSize: 12,
    fontWeight: "900",
    color: Theme.text,
  },
  serviceSub: {
    fontSize: 10,
    color: Theme.textMuted,
    marginTop: 1,
  },
  serviceIcon: {
    fontSize: 24,
    marginLeft: 6,
  },
  passwordInputRow: {
    flexDirection: "row",
    alignItems: "center",
    position: "relative",
  },
  eyeBtn: {
    position: "absolute",
    right: 10,
    padding: 6,
  },
  eyeIcon: {
    fontSize: 14,
  },
  reusableBanner: {
    backgroundColor: "#ECFDF5",
    borderWidth: 1,
    borderColor: "#A7F3D0",
    borderRadius: 10,
    padding: 10,
    marginVertical: 8,
  },
  reusableBannerTitle: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#065F46",
    marginBottom: 2,
  },
  reusableBannerSub: {
    fontSize: 10,
    color: "#047857",
    lineHeight: 14,
  },
  distanceChipsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginTop: 6,
  },
  distanceChip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Theme.border,
    backgroundColor: "#FFFFFF",
  },
  distanceChipActive: {
    borderColor: Theme.primary,
    backgroundColor: Theme.primaryLight,
  },
  distanceChipText: {
    fontSize: 11,
    color: Theme.textMuted,
    fontWeight: "600",
  },
  distanceChipTextActive: {
    color: Theme.primaryDark,
    fontWeight: "bold",
  },
  checkboxRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1E293B",
    borderRadius: 10,
    padding: 10,
    marginTop: 10,
    borderWidth: 1,
    borderColor: "#334155",
  },
  checkboxRowActive: {
    borderColor: "#059669",
    backgroundColor: "#064E3B",
  },
  checkboxBox: {
    width: 20,
    height: 20,
    borderRadius: 5,
    borderWidth: 1.5,
    borderColor: "#94A3B8",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  checkboxBoxActive: {
    backgroundColor: "#10B981",
    borderColor: "#10B981",
  },
  checkboxCheck: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "bold",
  },
  checkboxLabel: {
    color: "#E2E8F0",
    fontSize: 11,
    lineHeight: 15,
  },
  modalBackdrop: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(15, 23, 42, 0.75)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 9999,
    padding: 20,
  },
  modalCardContainer: {
    width: "100%",
    maxWidth: 380,
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 24,
    alignItems: "center",
    elevation: 8,
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 10,
  },
  modalEmoji: {
    fontSize: 40,
    marginBottom: 8,
  },
  modalHeaderTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: Theme.text,
    textAlign: "center",
    marginBottom: 6,
  },
  modalHeaderSub: {
    fontSize: 12,
    color: Theme.textMuted,
    textAlign: "center",
    lineHeight: 18,
  },
  modalRoleSelectionBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: Theme.border,
    borderRadius: 14,
    padding: 14,
    width: "100%",
  },
  roleChoiceBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Theme.border,
    backgroundColor: "#FFFFFF",
  },
  paymentMethodsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 8,
    marginBottom: 12,
  },
  paymentMethodChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Theme.border,
    backgroundColor: "#FFFFFF",
  },
  paymentMethodChipActive: {
    backgroundColor: Theme.primary,
    borderColor: Theme.primary,
  },
  paymentMethodText: {
    fontSize: 11,
    fontWeight: "600",
    color: Theme.text,
  },
  paymentMethodTextActive: {
    color: "#FFFFFF",
    fontWeight: "bold",
  },
  closedStoreBanner: {
    backgroundColor: "#FEF2F2",
    borderColor: "#FECACA",
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
});
