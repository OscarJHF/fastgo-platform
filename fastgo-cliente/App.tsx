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
  Linking,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as ImagePicker from "expo-image-picker";
import * as DocumentPicker from "expo-document-picker";

// URL de conexión oficial FastGo (Producción por defecto / configurable vía EXPO_PUBLIC_FASTGO_API_URL)
const DEFAULT_API_URL = process.env.EXPO_PUBLIC_FASTGO_API_URL || "https://fastgo-backend-lp2j.onrender.com";
const APP_VERSION = "2.2.4";

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
  esPrincipal?: boolean;
  estado?: string;
  esGratuito?: boolean;
  tipoPlan?: string;
  estadoSuscripcion?: string;
  fechaInicioSuscripcion?: string;
  fechaFinSuscripcion?: string;
  precioMensual?: number;
  precioActivacion?: number;
  diasRestantes?: number;
  alertaVencimiento?: boolean;
  comprobanteSuscripcionUrl?: string;
  motivoRechazoSuscripcion?: string;
  bancoNombre?: string;
  bancoTipoCuenta?: string;
  bancoNumeroCuenta?: string;
  bancoTitular?: string;
  bancoDocumento?: string;
  instruccionesPago?: string;
  destacado?: boolean;
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
  gananciaDomiciliario?: number;
  destinoDireccion?: string;
  destinoCiudad?: string;
  destinoReferencia?: string;
  motivoRechazoPago?: string;
  destinoLatitud?: number | null;
  destinoLongitud?: number | null;
  origenLatitud?: number | null;
  origenLongitud?: number | null;
  origenTelefono?: string;
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

interface Departamento {
  id: number;
  codigoDane: string;
  nombre: string;
}

interface Municipio {
  id: number;
  codigoDane: string;
  nombre: string;
  departamentoId: number;
}

const generateUUID = (): string => {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

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

  // Multi-tiendas y Suscripciones (Fase 2)
  const [misTiendas, setMisTiendas] = useState<any[]>([]);
  const [selectedStoreId, setSelectedStoreId] = useState<number | null>(null);
  const [subConfig, setSubConfig] = useState<any>(null);
  const [showStoreSwitcherModal, setShowStoreSwitcherModal] = useState<boolean>(false);
  const [showNewStoreModal, setShowNewStoreModal] = useState<boolean>(false);
  const [newStoreNombre, setNewStoreNombre] = useState<string>("");
  const [newStoreDireccion, setNewStoreDireccion] = useState<string>("");
  const [newStoreTelefono, setNewStoreTelefono] = useState<string>("");
  const [newStoreCorreo, setNewStoreCorreo] = useState<string>("");
  const [newStoreCiudad, setNewStoreCiudad] = useState<string>("Bogotá");
  const [isCreatingNewStore, setIsCreatingNewStore] = useState<boolean>(false);

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

  // Negociación y Ofertas de Encomienda
  const [encValorInicialPropuesto, setEncValorInicialPropuesto] = useState<string>("");
  const [ofertasPorEncomienda, setOfertasPorEncomienda] = useState<Record<number, any[]>>({});
  const [expandedEncClienteId, setExpandedEncClienteId] = useState<number | null>(null);
  const [loadingOfertasCliente, setLoadingOfertasCliente] = useState<boolean>(false);
  const [processingOfertaId, setProcessingOfertaId] = useState<number | null>(null);

  // Modal Contraoferta Domiciliario
  const [domiOfertaModalEnc, setDomiOfertaModalEnc] = useState<any | null>(null);
  const [domiOfertaValor, setDomiOfertaValor] = useState<string>("");
  const [domiOfertaMensaje, setDomiOfertaMensaje] = useState<string>("");
  const [isSubmittingDomiOferta, setIsSubmittingDomiOferta] = useState<boolean>(false);

  // Catálogos y Exploración
  const [comercios, setComercios] = useState<Comercio[]>([]);
  const [productos, setProductos] = useState<Producto[]>([]);
  const [selectedComercio, setSelectedComercio] = useState<Comercio | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("Todos");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Geografía Colombiana (DANE)
  const [departamentos, setDepartamentos] = useState<Departamento[]>([]);
  const [municipios, setMunicipios] = useState<Municipio[]>([]);
  const [selectedDepartamentoId, setSelectedDepartamentoId] = useState<number | null>(null);
  const [selectedMunicipioId, setSelectedMunicipioId] = useState<number | null>(null);
  const [showGeoModal, setShowGeoModal] = useState<boolean>(false);
  const [geoSearchDepto, setGeoSearchDepto] = useState<string>("");
  const [geoSearchMuni, setGeoSearchMuni] = useState<string>("");

  // Tienda Adicional - Geografía
  const [newStoreDeptoId, setNewStoreDeptoId] = useState<number | null>(null);
  const [newStoreMuniId, setNewStoreMuniId] = useState<number | null>(null);
  const [newStoreMunicipios, setNewStoreMunicipios] = useState<Municipio[]>([]);

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

  // Notificaciones Móviles de Nuevos Pedidos y Despachos (Fase I)
  const [newMobileOrderAlert, setNewMobileOrderAlert] = useState<PedidoItem | null>(null);
  const [newMobileDeliveryAlert, setNewMobileDeliveryAlert] = useState<PedidoItem | null>(null);
  const knownMerchantOrdersRef = React.useRef<Set<number>>(new Set());
  const isFirstMerchantLoadRef = React.useRef<boolean>(true);
  const knownDomiOrdersRef = React.useRef<Set<number>>(new Set());
  const isFirstDomiLoadRef = React.useRef<boolean>(true);

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
  const [isUploadingSubProof, setIsUploadingSubProof] = useState<boolean>(false);

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

  // Helper para seleccionar comprobante bancario (JPG, PNG o PDF)
  const pickComprobanteLocal = async () => {
    Alert.alert(
      "Adjuntar Comprobante",
      "Selecciona el origen del comprobante:",
      [
        {
          text: "Galería de Fotos",
          onPress: async () => {
            try {
              const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
              if (!permissionResult.granted) {
                Alert.alert(
                  "Permiso Requerido",
                  "Se necesita acceso a la galería para seleccionar la foto del comprobante."
                );
                return;
              }

              const pickerResult = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ['images'],
                allowsEditing: true,
                quality: 0.8,
              });

              if (!pickerResult.canceled && pickerResult.assets && pickerResult.assets.length > 0) {
                const asset = pickerResult.assets[0];
                setCheckoutComprobanteAsset(asset);
                setCheckoutComprobanteUrl(asset.uri);
                Alert.alert("Comprobante Seleccionado", "Comprobante listo. Se enviará al confirmar el pedido.");
              }
            } catch (err: any) {
              Alert.alert("Error", err.message || "Error al seleccionar la imagen.");
            }
          },
        },
        {
          text: "Archivos / PDF",
          onPress: async () => {
            try {
              const docRes = await DocumentPicker.getDocumentAsync({
                type: ["application/pdf", "image/*"],
                copyToCacheDirectory: true,
              });
              if (!docRes.canceled && docRes.assets && docRes.assets.length > 0) {
                const doc = docRes.assets[0];
                if (doc.size && doc.size > 5 * 1024 * 1024) {
                  Alert.alert("Archivo muy pesado", "El archivo no debe superar 5MB.");
                  return;
                }
                const isPdf = doc.name.toLowerCase().endsWith(".pdf") || doc.mimeType?.includes("pdf");
                setCheckoutComprobanteAsset({
                  uri: doc.uri,
                  fileName: doc.name,
                  mimeType: isPdf ? "application/pdf" : (doc.mimeType || "image/jpeg"),
                });
                setCheckoutComprobanteUrl(doc.uri);
                Alert.alert("Comprobante Seleccionado", `Archivo "${doc.name}" adjuntado correctamente.`);
              }
            } catch (e: any) {
              Alert.alert("Error", e.message || "Error al seleccionar el archivo.");
            }
          },
        },
        { text: "Cancelar", style: "cancel" },
      ]
    );
  };

  // Helper para subir o actualizar comprobante en un pedido ya creado
  const uploadOrderComprobante = async (orderId: number) => {
    Alert.alert(
      "Subir Comprobante de Pago",
      "Selecciona el origen del archivo:",
      [
        {
          text: "Galería de Fotos",
          onPress: async () => {
            try {
              const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
              if (!perm.granted) {
                Alert.alert("Permiso Requerido", "Se necesita acceso a la galería.");
                return;
              }
              const pickerRes = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ['images'],
                allowsEditing: true,
                quality: 0.8,
              });
              if (!pickerRes.canceled && pickerRes.assets && pickerRes.assets.length > 0) {
                const asset = pickerRes.assets[0];
                await doUploadComprobante(orderId, {
                  uri: asset.uri,
                  fileName: asset.fileName || "comprobante.jpg",
                  mimeType: asset.mimeType || "image/jpeg",
                });
              }
            } catch (err: any) {
              Alert.alert("Error", err.message || "Error al seleccionar imagen.");
            }
          },
        },
        {
          text: "Archivos / PDF",
          onPress: async () => {
            try {
              const docRes = await DocumentPicker.getDocumentAsync({
                type: ["application/pdf", "image/*"],
                copyToCacheDirectory: true,
              });
              if (!docRes.canceled && docRes.assets && docRes.assets.length > 0) {
                const doc = docRes.assets[0];
                if (doc.size && doc.size > 5 * 1024 * 1024) {
                  Alert.alert("Archivo muy pesado", "El archivo no debe superar 5MB.");
                  return;
                }
                const isPdf = doc.name.toLowerCase().endsWith(".pdf") || doc.mimeType?.includes("pdf");
                await doUploadComprobante(orderId, {
                  uri: doc.uri,
                  fileName: doc.name,
                  mimeType: isPdf ? "application/pdf" : (doc.mimeType || "image/jpeg"),
                });
              }
            } catch (err: any) {
              Alert.alert("Error", err.message || "Error al seleccionar archivo.");
            }
          },
        },
        { text: "Cancelar", style: "cancel" },
      ]
    );
  };

  const doUploadComprobante = async (orderId: number, fileAsset: { uri: string; fileName: string; mimeType: string }) => {
    try {
      const res = await uploadMultipartAsync(
        `${apiUrl}/api/pedidos/${orderId}/comprobante`,
        "POST",
        token,
        "file",
        fileAsset
      );
      if (res.ok) {
        Alert.alert("Comprobante Enviado", "Comprobante enviado para verificación.");
        fetchPedidosCliente();
        if (selectedPedido && selectedPedido.id === orderId) {
          const updRes = await fetch(`${apiUrl}/api/pedidos/${orderId}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (updRes.ok) {
            const updData = await updRes.json();
            setSelectedPedido(updData);
          }
        }
      } else {
        const err = res.data || {};
        Alert.alert("Error", err.message || "No se pudo subir el comprobante.");
      }
    } catch (err: any) {
      Alert.alert("Error", err.message || "Error al subir el comprobante.");
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

  const loadComercios = async (
    baseUrl = apiUrl,
    deptoId: number | null = selectedDepartamentoId,
    muniId: number | null = selectedMunicipioId
  ) => {
    try {
      let query = `${baseUrl}/api/comercios`;
      const params: string[] = [];
      if (deptoId != null) params.push(`departamentoId=${deptoId}`);
      if (muniId != null) params.push(`municipioId=${muniId}`);
      if (params.length > 0) query += `?${params.join("&")}`;

      const res = await fetch(query, {
        headers: { Accept: "application/json" },
      });
      if (res.ok) {
        const data = await res.json();
        setComercios(data);
        loadProducts(baseUrl);
      }
    } catch {}
  };

  const handleSelectDepartamento = async (deptId: number | null) => {
    setSelectedDepartamentoId(deptId);
    setSelectedMunicipioId(null);
    if (deptId != null) {
      try {
        const res = await fetch(`${apiUrl}/api/geografia/departamentos/${deptId}/municipios`, {
          headers: { Accept: "application/json" },
        });
        if (res.ok) {
          const mData = await res.json();
          setMunicipios(mData);
        }
      } catch {}
    } else {
      setMunicipios([]);
    }
    loadComercios(apiUrl, deptId, null);
  };

  const handleSelectMunicipio = (muniId: number | null) => {
    setSelectedMunicipioId(muniId);
    loadComercios(apiUrl, selectedDepartamentoId, muniId);
    setShowGeoModal(false);
  };

  const fetchDepartamentos = async (baseUrl = apiUrl) => {
    try {
      const res = await fetch(`${baseUrl}/api/geografia/departamentos`, {
        headers: { Accept: "application/json" },
      });
      if (res.ok) {
        const data = await res.json();
        setDepartamentos(data);
      }
    } catch {}
  };

  const handleSelectNewStoreDepto = async (deptId: number | null) => {
    setNewStoreDeptoId(deptId);
    setNewStoreMuniId(null);
    if (deptId != null) {
      try {
        const res = await fetch(`${apiUrl}/api/geografia/departamentos/${deptId}/municipios`, {
          headers: { Accept: "application/json" },
        });
        if (res.ok) {
          const mData = await res.json();
          setNewStoreMunicipios(mData);
        }
      } catch {}
    } else {
      setNewStoreMunicipios([]);
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
    const initApp = async () => {
      checkConnection(apiUrl);

      // 1. Reportar APP_FIRST_OPEN de forma idempotente con UUID anónimo
      try {
        let anonId = await AsyncStorage.getItem("fastgo_anonymous_device_id");
        if (!anonId) {
          anonId = generateUUID();
          await AsyncStorage.setItem("fastgo_anonymous_device_id", anonId);
        }
        const alreadyReported = await AsyncStorage.getItem("fastgo_first_open_reported");
        if (!alreadyReported) {
          fetch(`${apiUrl}/api/analytics/track`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              eventType: "APP_FIRST_OPEN",
              platform: "ANDROID",
              appVersion: APP_VERSION,
              anonymousId: anonId,
              metadata: JSON.stringify({
                os: Platform.OS,
                version: Platform.Version,
                appVersion: APP_VERSION,
              }),
            }),
          }).then((r) => {
            if (r.ok) {
              AsyncStorage.setItem("fastgo_first_open_reported", "true");
            }
          }).catch(() => {});
        }
      } catch {}

      // 2. Cargar Departamentos de Colombia (DANE)
      fetch(`${apiUrl}/api/geografia/departamentos`, {
        headers: { Accept: "application/json" },
      })
        .then((r) => (r.ok ? r.json() : []))
        .then((data) => setDepartamentos(data))
        .catch(() => {});

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
    await fetchDepartamentos(apiUrl);
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

  // Registro de Push Tokens para Notificaciones Móviles (Fase I)
  const registrarDispositivoPush = async (jwt?: string | null) => {
    const activeJwt = jwt || token;
    if (!activeJwt) return;
    try {
      const pushToken = `FASTGO_EXPO_PUSH_${Platform.OS}_${Date.now()}`;
      await fetch(`${apiUrl}/api/dispositivos/registrar`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${activeJwt}`,
        },
        body: JSON.stringify({
          pushToken,
          plataforma: Platform.OS === "android" ? "ANDROID" : Platform.OS === "ios" ? "IOS" : "WEB",
          dispositivoId: `${Platform.OS}-${Platform.Version || "v1"}`,
        }),
      });
    } catch {}
  };

  // ==========================================
  // AUTENTICACIÓN Y REGISTRO MULTI-ROL
  // ==========================================
  const routeUserToDashboard = (role: string, jwt = token) => {
    if (jwt) {
      registrarDispositivoPush(jwt);
    }
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

  const fetchComercioPropio = async (jwt = token, targetStoreId?: number) => {
    if (!jwt) return;
    try {
      // 1. Cargar todas las tiendas del comerciante (Fase 2 Multitiendas)
      const resStores = await fetch(`${apiUrl}/api/comercios/mis-tiendas`, {
        headers: { Authorization: `Bearer ${jwt}`, Accept: "application/json" },
      });
      let stores: Comercio[] = [];
      if (resStores.ok) {
        stores = await resStores.json();
        setMisTiendas(stores);
      }

      // 2. Cargar tarifas de suscripciones
      fetch(`${apiUrl}/api/comercios/suscripciones/configuracion`, {
        headers: { Authorization: `Bearer ${jwt}`, Accept: "application/json" },
      })
        .then((r) => (r.ok ? r.json() : null))
        .then((cfg) => {
          if (cfg) setSubConfig(cfg);
        })
        .catch(() => {});

      // 3. Determinar tienda a seleccionar
      let activeStore: any = null;
      if (stores.length > 0) {
        if (targetStoreId) {
          activeStore = stores.find((s) => s.id === targetStoreId) || stores[0];
        } else if (selectedStoreId) {
          activeStore = stores.find((s) => s.id === selectedStoreId) || stores[0];
        } else {
          activeStore = stores.find((s) => s.esPrincipal) || stores[0];
        }
      } else {
        const resSingle = await fetch(`${apiUrl}/api/comercios/propio`, {
          headers: { Authorization: `Bearer ${jwt}`, Accept: "application/json" },
        });
        if (resSingle.ok) {
          activeStore = await resSingle.json();
          setMisTiendas([activeStore]);
        }
      }

      if (activeStore) {
        setSelectedStoreId(activeStore.id);
        setComercioPropio(activeStore);
        setStoreTarifaDomicilio(String(activeStore.tarifaDomicilio || 2000));
        setStoreBancolombiaActivo(Boolean(activeStore.bancolombiaActivo));
        setStoreBancolombiaTipoCuenta(activeStore.bancolombiaTipoCuenta || "AHORROS");
        setStoreBancolombiaNumeroCuenta(activeStore.bancolombiaNumeroCuenta || "");
        setStoreBancolombiaTitular(activeStore.bancolombiaTitular || "");
        setStoreBancolombiaDocTitular(activeStore.bancolombiaDocTitular || "");
        setStoreLogoUrl(activeStore.logo || activeStore.logoUrl || "");
        setStoreBannerUrl(activeStore.banner || activeStore.bannerUrl || "");
        fetchPedidosComercio(jwt, activeStore);
      }
    } catch {}
  };

  const handleSelectStore = (store: any) => {
    setSelectedStoreId(store.id);
    setComercioPropio(store);
    setStoreTarifaDomicilio(String(store.tarifaDomicilio || 2000));
    setStoreBancolombiaActivo(Boolean(store.bancolombiaActivo));
    setStoreBancolombiaTipoCuenta(store.bancolombiaTipoCuenta || "AHORROS");
    setStoreBancolombiaNumeroCuenta(store.bancolombiaNumeroCuenta || "");
    setStoreBancolombiaTitular(store.bancolombiaTitular || "");
    setStoreBancolombiaDocTitular(store.bancolombiaDocTitular || "");
    setStoreLogoUrl(store.logo || store.logoUrl || "");
    setStoreBannerUrl(store.banner || store.bannerUrl || "");
    setShowStoreSwitcherModal(false);
    fetchPedidosComercio(token, store);
  };

  const handleCreateAdditionalStore = async () => {
    if (!token) return;
    if (!newStoreNombre.trim() || !newStoreDireccion.trim() || !newStoreTelefono.trim() || !newStoreCorreo.trim()) {
      Alert.alert("Campos Requeridos", "Por favor ingresa nombre, dirección, teléfono y correo de la nueva tienda.");
      return;
    }
    setIsCreatingNewStore(true);
    try {
      const res = await fetch(`${apiUrl}/api/comercios`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          nombre: newStoreNombre.trim(),
          direccion: newStoreDireccion.trim(),
          telefono: newStoreTelefono.trim(),
          correo: newStoreCorreo.trim(),
          ciudad: newStoreCiudad.trim() || "Bogotá",
          departamentoId: newStoreDeptoId || undefined,
          municipioId: newStoreMuniId || undefined,
          categoriaId: 1,
          horaApertura: "08:00",
          horaCierre: "20:00",
          diasAtencion: "Lunes a Domingo",
          tiempoPreparacionMin: 25,
          tarifaDomicilio: 2000,
          metodosPago: "EFECTIVO, TARJETA, PSE, TRANSFERENCIA",
          activo: false,
        }),
      });

      if (res.ok) {
        const created = await res.json();
        Alert.alert(
          "¡Tienda Creada!",
          `Tu tienda "${created.nombre}" fue registrada exitosamente en estado PENDIENTE DE ACTIVACIÓN. El equipo administrativo revisará y activará la sede para recibir pedidos.`
        );
        setShowNewStoreModal(false);
        setNewStoreNombre("");
        setNewStoreDireccion("");
        setNewStoreTelefono("");
        setNewStoreCorreo("");
        setNewStoreDeptoId(null);
        setNewStoreMuniId(null);
        await fetchComercioPropio(token, created.id);
      } else {
        const err = await res.json().catch(() => ({}));
        Alert.alert("Error", err.message || err.mensaje || "No se pudo crear la tienda adicional.");
      }
    } catch (e: any) {
      Alert.alert("Error de Red", e.message || "Error al conectar con el servidor.");
    } finally {
      setIsCreatingNewStore(false);
    }
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

      const url = comercioPropio?.id ? `${apiUrl}/api/comercios/${comercioPropio.id}` : `${apiUrl}/api/comercios/propio`;
      const res = await fetch(url, {
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
        setMisTiendas((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
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

  const handleUploadSubscriptionProofMobile = async () => {
    if (!token || !comercioPropio) return;
    try {
      const docRes = await DocumentPicker.getDocumentAsync({
        type: ["image/*", "application/pdf"],
        copyToCacheDirectory: true,
      });
      if (docRes.canceled || !docRes.assets || docRes.assets.length === 0) return;
      const fileAsset = docRes.assets[0];

      setIsUploadingSubProof(true);
      const res = await uploadMultipartAsync(
        `${apiUrl}/api/comercios/${comercioPropio.id}/suscripcion/comprobante`,
        "POST",
        token,
        "comprobante",
        {
          uri: fileAsset.uri,
          fileName: fileAsset.name,
          mimeType: fileAsset.mimeType || "application/octet-stream",
        }
      );

      if (res.ok) {
        Alert.alert(
          "¡Comprobante Enviado!",
          "Tu comprobante de pago ha sido enviado exitosamente y se encuentra en revisión por el equipo administrativo de FASTGO."
        );
        await fetchComercioPropio(token, comercioPropio.id);
      } else {
        Alert.alert("Error", res.data?.message || res.data?.mensaje || "No se pudo subir el comprobante.");
      }
    } catch (e: any) {
      Alert.alert("Error", e.message || "Error al subir comprobante de suscripción.");
    } finally {
      setIsUploadingSubProof(false);
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
        comercioId: comercioPropio?.id,
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
        setMisTiendas((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
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

          // Track LOGIN analytics
          try {
            const anonId = await AsyncStorage.getItem("fastgo_anonymous_device_id");
            fetch(`${apiUrl}/api/analytics/track`, {
              method: "POST",
              headers: { "Content-Type": "application/json", Authorization: `Bearer ${jwt}` },
              body: JSON.stringify({
                eventType: "LOGIN",
                platform: "ANDROID",
                appVersion: APP_VERSION,
                anonymousId: anonId || undefined,
                pathOrScreen: "login",
              }),
            }).catch(() => {});
          } catch {}

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

            // Track REGISTER analytics
            try {
              const anonId = await AsyncStorage.getItem("fastgo_anonymous_device_id");
              fetch(`${apiUrl}/api/analytics/track`, {
                method: "POST",
                headers: { "Content-Type": "application/json", Authorization: `Bearer ${jwt}` },
                body: JSON.stringify({
                  eventType: "REGISTER",
                  platform: "ANDROID",
                  appVersion: APP_VERSION,
                  anonymousId: anonId || undefined,
                  pathOrScreen: "register",
                }),
              }).catch(() => {});
            } catch {}

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
      const tarifaCalculada = calcTarifa(encDistanciaKm);
      const tarifaFinal = encValorInicialPropuesto ? Number(encValorInicialPropuesto) : tarifaCalculada;
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
          costoEnvio: tarifaFinal,
          tarifaAceptada: true,
        }),
      });

      if (res.ok) {
        const nueva = await res.json();
        Alert.alert("¡Encomienda Solicitada!", `Tu servicio #ENC-${nueva.id} fue creado con éxito. Un domiciliario cercano será asignado pronto.`);
        setEncDescripcion("");
        setEncValorInicialPropuesto("");
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

  const fetchOfertasEncomienda = async (encId: number) => {
    if (!token) return;
    try {
      const res = await fetch(`${apiUrl}/api/encomiendas/${encId}/ofertas`, {
        headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
      });
      if (res.ok) {
        const data = await res.json();
        setOfertasPorEncomienda((prev) => ({ ...prev, [encId]: data }));
      }
    } catch {}
  };

  const handleToggleOfertasCliente = async (encId: number) => {
    if (expandedEncClienteId === encId) {
      setExpandedEncClienteId(null);
      return;
    }
    setExpandedEncClienteId(encId);
    setLoadingOfertasCliente(true);
    await fetchOfertasEncomienda(encId);
    setLoadingOfertasCliente(false);
  };

  const handleAceptarOferta = async (encId: number, ofertaId: number) => {
    setProcessingOfertaId(ofertaId);
    try {
      const res = await fetch(`${apiUrl}/api/encomiendas/${encId}/ofertas/${ofertaId}/aceptar`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        Alert.alert("¡Oferta Aceptada!", "El domiciliario ha sido asignado al envío.");
        fetchEncomiendasCliente();
        fetchOfertasEncomienda(encId);
      } else {
        const err = await res.json().catch(() => ({}));
        Alert.alert("Error", err.message || "No se pudo aceptar la oferta.");
      }
    } catch (e: any) {
      Alert.alert("Error", e.message || "Fallo al procesar la aceptación.");
    } finally {
      setProcessingOfertaId(null);
    }
  };

  const handleRechazarOferta = async (encId: number, ofertaId: number) => {
    setProcessingOfertaId(ofertaId);
    try {
      const res = await fetch(`${apiUrl}/api/encomiendas/${encId}/ofertas/${ofertaId}/rechazar`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        Alert.alert("Oferta Rechazada", "La contraoferta ha sido declinada.");
        fetchOfertasEncomienda(encId);
        fetchEncomiendasCliente();
      } else {
        const err = await res.json().catch(() => ({}));
        Alert.alert("Error", err.message || "No se pudo rechazar la oferta.");
      }
    } catch (e: any) {
      Alert.alert("Error", e.message || "Fallo al rechazar oferta.");
    } finally {
      setProcessingOfertaId(null);
    }
  };

  const handleCrearOfertaDomi = async () => {
    if (!domiOfertaModalEnc) return;
    const monto = Number(domiOfertaValor);
    if (!monto || monto <= 0) {
      Alert.alert("Monto Inválido", "Por favor ingresa un monto válido en pesos COP para tu contraoferta.");
      return;
    }

    setIsSubmittingDomiOferta(true);
    try {
      const res = await fetch(`${apiUrl}/api/encomiendas/${domiOfertaModalEnc.id}/ofertas`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          valor: monto,
          mensaje: domiOfertaMensaje.trim() || undefined,
        }),
      });

      if (res.ok) {
        Alert.alert("¡Contraoferta Enviada!", `Has propuesto $${monto.toLocaleString()} COP para la encomienda #ENC-${domiOfertaModalEnc.id}.`);
        setDomiOfertaModalEnc(null);
        setDomiOfertaValor("");
        setDomiOfertaMensaje("");
        fetchEncomiendasDomi();
      } else {
        const err = await res.json().catch(() => ({}));
        Alert.alert("Error", err.message || "No fue posible enviar la contraoferta.");
      }
    } catch (e: any) {
      Alert.alert("Error de Red", e.message || "Fallo de conexión al enviar oferta.");
    } finally {
      setIsSubmittingDomiOferta(false);
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

    // Si el carrito ya tiene productos de otra sucursal o comercio, requerir confirmación
    if (cart.length > 0) {
      const sucursalActual = cart[0].producto.sucursalId;
      if (producto.sucursalId && sucursalActual && producto.sucursalId !== sucursalActual) {
        Alert.alert(
          "Cambio de Comercio",
          "Ya tienes productos de otra tienda en el carrito. Solo puedes pedir productos de una misma tienda a la vez.\n\n¿Deseas vaciar el carrito actual para agregar este producto?",
          [
            { text: "Cancelar", style: "cancel" },
            {
              text: "Vaciar y Agregar",
              style: "destructive",
              onPress: () => {
                setCart([{ producto, cantidad: 1 }]);
                Alert.alert("Añadido", `${producto.nombre} agregado al carrito.`);
              },
            },
          ]
        );
        return;
      }
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

      // 2. Obtener la sucursal real de los productos del carrito
      const itemSucursalId = cart[0]?.producto?.sucursalId;
      let sucursalId = itemSucursalId;
      if (!sucursalId && selectedComercio?.id) {
        try {
          const sucRes = await fetch(`${apiUrl}/api/sucursales/comercio/${selectedComercio.id}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (sucRes.ok) {
            const sucs = await sucRes.json();
            if (sucs && sucs.length > 0) {
              sucursalId = sucs[0].id;
            }
          }
        } catch {}
      }
      if (!sucursalId) {
        sucursalId = 1;
      }

      // Obtener o crear carrito para esa sucursal en el backend
      const cartRes = await fetch(`${apiUrl}/api/carritos?sucursalId=${sucursalId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!cartRes.ok) {
        const errData = await cartRes.json().catch(() => ({}));
        throw new Error(errData.message || "No se pudo sincronizar el carrito con la tienda.");
      }
      const cData = await cartRes.json();
      const backendCartId = cData.id;

      // Limpiar ítems previos del carrito en el backend para evitar mezclas o datos huérfanos
      await fetch(`${apiUrl}/api/carritos/${backendCartId}/productos`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      }).catch(() => {});

      // Sincronizar ítems actuales asegurando que cada uno se agregue correctamente
      for (const item of cart) {
        const addRes = await fetch(`${apiUrl}/api/carritos/productos`, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
          body: JSON.stringify({
            carritoId: backendCartId,
            productoId: item.producto.id,
            cantidad: item.cantidad,
          }),
        });
        if (!addRes.ok) {
          const addErr = await addRes.json().catch(() => ({}));
          throw new Error(addErr.message || `No se pudo agregar "${item.producto.nombre}" al pedido.`);
        }
      }

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
        // Track ORDER_CREATED analytics
        try {
          const anonId = await AsyncStorage.getItem("fastgo_anonymous_device_id");
          fetch(`${apiUrl}/api/analytics/track`, {
            method: "POST",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
            body: JSON.stringify({
              eventType: "ORDER_CREATED",
              platform: "ANDROID",
              appVersion: APP_VERSION,
              anonymousId: anonId || undefined,
              pathOrScreen: "carrito",
              metadata: JSON.stringify({
                pedidoId: nuevoPedido.id,
                total: nuevoPedido.total || totalCart,
                metodoPago: metodoPagoSeleccionado,
              }),
            }),
          }).catch(() => {});
        } catch {}

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
    } catch (e: any) {
      Alert.alert("Error al procesar el pedido", e.message || "Ocurrió un error inesperado al procesar el pedido.");
      return;
    }
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
  const fetchPedidosComercio = async (jwt = token, store = comercioPropio) => {
    if (!jwt) return;
    try {
      const storeId = store?.id;
      const sucursalId = store?.sucursalId || storeId || 1;
      const url = storeId
        ? `${apiUrl}/api/pedidos/sucursal/${sucursalId}?comercioId=${storeId}`
        : `${apiUrl}/api/pedidos/sucursal/${sucursalId}`;
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${jwt}`, Accept: "application/json" },
      });
      if (res.ok) {
        const data: PedidoItem[] = await res.json();
        setPedidosComercio(data);

        // Notificación de nuevo pedido entrante en Cocina (Fase I)
        if (!isFirstMerchantLoadRef.current) {
          const incoming = data.filter(
            (p) => (p.estado === "PENDIENTE" || p.estado === "CONFIRMADO") && !knownMerchantOrdersRef.current.has(p.id)
          );
          if (incoming.length > 0) {
            setNewMobileOrderAlert(incoming[0]);
          }
        } else {
          isFirstMerchantLoadRef.current = false;
        }
        data.forEach((p) => knownMerchantOrdersRef.current.add(p.id));
      }
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
      if (r1.ok) {
        const disponibles: PedidoItem[] = await r1.json();
        setPedidosDisponibles(disponibles);

        // Notificación de nuevo pedido disponible para repartidor (Fase I)
        if (!isFirstDomiLoadRef.current) {
          const fresh = disponibles.filter((p) => !knownDomiOrdersRef.current.has(p.id));
          if (fresh.length > 0) {
            setNewMobileDeliveryAlert(fresh[0]);
          }
        } else {
          isFirstDomiLoadRef.current = false;
        }
        disponibles.forEach((p) => knownDomiOrdersRef.current.add(p.id));
      }

      const r2 = await fetch(`${apiUrl}/api/pedidos/domiciliario/mios`, {
        headers: { Authorization: `Bearer ${jwt}`, Accept: "application/json" },
      });
      if (r2.ok) setMisEntregas(await r2.json());
    } catch {}
  };

  // Polling automático de pedidos para Comercio y Domiciliario (Fase I)
  useEffect(() => {
    if (!token || !user) return;
    const userRole = user.activeRole || user.rol;
    if (activeTab === "comercio_cocina" || userRole === "COMERCIO") {
      const timer = setInterval(() => {
        fetchPedidosComercio();
      }, 12000);
      return () => clearInterval(timer);
    }
  }, [token, user, activeTab, comercioPropio]);

  useEffect(() => {
    if (!token || !user) return;
    const userRole = user.activeRole || user.rol;
    if (activeTab === "domi_disponibles" || userRole === "DOMICILIARIO") {
      const timer = setInterval(() => {
        fetchPedidosDomiciliario();
      }, 12000);
      return () => clearInterval(timer);
    }
  }, [token, user, activeTab]);

  // Telemetría GPS en tiempo real para Domiciliario en ruta
  useEffect(() => {
    if (!token || (user?.activeRole || user?.rol) !== "DOMICILIARIO") return;
    const pedidoEnRuta = misEntregas.find((p) => p.estado === "EN_CAMINO");
    if (!pedidoEnRuta) return;

    const emitirGps = () => {
      if (typeof navigator !== "undefined" && (navigator as any).geolocation) {
        (navigator as any).geolocation.getCurrentPosition(
          (pos: any) => {
            fetch(`${apiUrl}/api/tracking/ubicacion`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({
                pedidoId: pedidoEnRuta.id,
                latitud: pos.coords.latitude,
                longitud: pos.coords.longitude,
                precision: pos.coords.accuracy,
                rumbo: pos.coords.heading || undefined,
                velocidad: pos.coords.speed || undefined,
              }),
            }).catch(() => {});
          },
          () => {},
          { enableHighAccuracy: true, timeout: 8000 }
        );
      }
    };

    emitirGps();
    const interval = setInterval(emitirGps, 15000);
    return () => clearInterval(interval);
  }, [token, user, misEntregas, apiUrl]);

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
        // Track ORDER_DELIVERED analytics
        try {
          const anonId = await AsyncStorage.getItem("fastgo_anonymous_device_id");
          fetch(`${apiUrl}/api/analytics/track`, {
            method: "POST",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
            body: JSON.stringify({
              eventType: "ORDER_DELIVERED",
              platform: "ANDROID",
              appVersion: APP_VERSION,
              anonymousId: anonId || undefined,
              pathOrScreen: "domi_disponibles",
              metadata: JSON.stringify({ pedidoId }),
            }),
          }).catch(() => {});
        } catch {}

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

        {/* Barra de Búsqueda Integrada con Lupa Clickeable (solo en explorar) */}
        {activeTab === "explorar" && !selectedComercio && (
          <View style={styles.searchBar}>
            <TouchableOpacity
              onPress={() => {
                if (searchQuery.trim().length > 0) {
                  // Lupa clickeable que activa/valida búsqueda
                }
              }}
              style={{ paddingRight: 4, paddingVertical: 4 }}
              activeOpacity={0.7}
              accessibilityLabel="Buscar restaurantes, tiendas o productos"
              accessibilityRole="button"
            >
              <Text style={styles.searchIcon}>🔍</Text>
            </TouchableOpacity>
            <TextInput
              style={styles.searchInput}
              placeholder="🔍 Buscar restaurantes, tiendas o platos..."
              placeholderTextColor="#94A3B8"
              value={searchQuery}
              onChangeText={setSearchQuery}
              returnKeyType="search"
              onSubmitEditing={() => {
                // Submit mediante teclado/Enter
              }}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery("")}>
                <Text style={styles.clearSearch}>✕</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Selector de Ubicación Colombiana DANE */}
        {activeTab === "explorar" && !selectedComercio && (
          <TouchableOpacity
            style={styles.geoFilterBar}
            onPress={() => {
              if (departamentos.length === 0) fetchDepartamentos();
              setShowGeoModal(true);
            }}
          >
            <Text style={{ fontSize: 14 }}>📍</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.geoFilterText} numberOfLines={1}>
                {selectedDepartamentoId
                  ? `${departamentos.find((d) => d.id === selectedDepartamentoId)?.nombre || "Departamento"}${
                      selectedMunicipioId
                        ? ` • ${municipios.find((m) => m.id === selectedMunicipioId)?.nombre || "Municipio"}`
                        : " • Todos los municipios"
                    }`
                  : "🇨🇴 Toda Colombia • Todos los departamentos"}
              </Text>
            </View>
            <Text style={styles.geoFilterArrow}>▼</Text>
          </TouchableOpacity>
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

            {/* Banner de Tiendas Destacadas (Configuradas exclusivamente por ADMIN) */}
            {!selectedComercio && comercios.some((c) => c.destacado) && (
              <View style={styles.sectionBlock}>
                <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                  <Text style={[styles.sectionTitle, { marginBottom: 0 }]}>⭐ Comercios Destacados</Text>
                  <View style={[styles.statusPill, { backgroundColor: "#FEF3C7" }]}>
                    <Text style={{ color: "#92400E", fontSize: 9, fontWeight: "bold" }}>SELECCIÓN FASTGO</Text>
                  </View>
                </View>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12, paddingBottom: 6 }}>
                  {comercios
                    .filter((c) => c.destacado)
                    .map((c) => (
                      <TouchableOpacity
                        key={`destacado-${c.id}`}
                        style={{
                          width: 240,
                          backgroundColor: "#FFFFFF",
                          borderRadius: 20,
                          borderWidth: 1,
                          borderColor: "#FDE68A",
                          overflow: "hidden",
                          shadowColor: "#F59E0B",
                          shadowOffset: { width: 0, height: 2 },
                          shadowOpacity: 0.1,
                          shadowRadius: 6,
                          elevation: 3,
                        }}
                        onPress={() => setSelectedComercio(c)}
                        activeOpacity={0.85}
                      >
                        <View style={{ height: 100, backgroundColor: "#FEF3C7", position: "relative" }}>
                          {c.banner || c.bannerUrl ? (
                            <Image
                              source={{ uri: resolveMediaUrl(c.banner || c.bannerUrl) || "" }}
                              style={{ width: "100%", height: "100%" }}
                              resizeMode="cover"
                            />
                          ) : (
                            <View style={{ width: "100%", height: "100%", backgroundColor: "#FEF3C7", alignItems: "center", justifyContent: "center" }}>
                              <Text style={{ fontSize: 32 }}>🏪</Text>
                            </View>
                          )}
                          <View style={{ position: "absolute", top: 8, right: 8, backgroundColor: "#F59E0B", paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10 }}>
                            <Text style={{ color: "#FFF", fontSize: 9, fontWeight: "900" }}>⭐ DESTACADO</Text>
                          </View>
                        </View>
                        <View style={{ padding: 12 }}>
                          <Text style={{ fontSize: 14, fontWeight: "bold", color: Theme.text }} numberOfLines={1}>
                            {c.nombre}
                          </Text>
                          <Text style={{ fontSize: 11, color: Theme.textMuted, marginTop: 2 }} numberOfLines={1}>
                            {c.descripcion || c.categoria || "Comercio Aliado FastGo"}
                          </Text>
                          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 8, paddingTop: 8, borderTopWidth: 1, borderTopColor: "#F1F5F9" }}>
                            <Text style={{ fontSize: 11, fontWeight: "700", color: Theme.primary }}>
                              🛵 ${(c.tarifaDomicilio || 2000).toLocaleString()} COP
                            </Text>
                            <Text style={{ fontSize: 10, color: Theme.textMuted }}>
                              ~{c.tiempoPreparacionMin || 25} min
                            </Text>
                          </View>
                        </View>
                      </TouchableOpacity>
                    ))}
                </ScrollView>
              </View>
            )}

            {/* Sección de Comercios Aliados (si no hay uno seleccionado) */}
            {!selectedComercio && (
              <View style={styles.sectionBlock}>
                <Text style={styles.sectionTitle}>Comercios Aliados</Text>
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

            {/* Menú de Productos: Solo se muestra si hay una tienda seleccionada O si el usuario está buscando */}
            {(selectedComercio || searchQuery.trim().length > 0) && (
              <View style={styles.sectionBlock}>
                <Text style={styles.sectionTitle}>
                  {selectedComercio
                    ? `Menú de ${selectedComercio.nombre}`
                    : `Resultados de búsqueda: "${searchQuery}"`}
                </Text>
                {filteredProducts.length === 0 ? (
                  <View style={styles.emptyCard}>
                    <Text style={styles.emptyCardTitle}>No se encontraron productos</Text>
                    <Text style={styles.emptyCardText}>Prueba con otro término de búsqueda o comercio.</Text>
                  </View>
                ) : (
                  filteredProducts.map((p) => {
                    const isOutOfStock = p.disponible === false || (p.stock != null && p.stock <= 0);
                    const isStoreClosed = selectedComercio?.abierto === false || selectedComercio?.pausaManual;
                    return (
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
                            {isOutOfStock && (
                              <View style={[styles.statusPill, { backgroundColor: "#FEE2E2" }]}>
                                <Text style={{ color: "#991B1B", fontSize: 9, fontWeight: "bold" }}>AGOTADO</Text>
                              </View>
                            )}
                          </View>
                          <Text style={styles.productDesc}>{p.descripcion || "Preparación fresca con los mejores ingredientes"}</Text>
                          <Text style={styles.productPrice}>${p.precio.toLocaleString()} COP</Text>
                        </View>
                        <TouchableOpacity
                          style={[
                            styles.addBtn,
                            (isOutOfStock || isStoreClosed) && { backgroundColor: "#F1F5F9", borderColor: "#CBD5E1" }
                          ]}
                          onPress={() => addToCart(p)}
                          disabled={isOutOfStock || isStoreClosed}
                        >
                          <Text style={[styles.addBtnText, (isOutOfStock || isStoreClosed) && { color: "#94A3B8" }]}>
                            {isStoreClosed ? "Cerrado" : isOutOfStock ? "Agotado" : "+ Agregar"}
                          </Text>
                        </TouchableOpacity>
                      </View>
                    );
                  })
                )}
              </View>
            )}
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
                          {checkoutComprobanteAsset?.mimeType === "application/pdf" || checkoutComprobanteAsset?.fileName?.toLowerCase().endsWith(".pdf") ? (
                            <View style={{ width: 48, height: 48, borderRadius: 8, backgroundColor: "#FEE2E2", alignItems: "center", justifyContent: "center" }}>
                              <Text style={{ fontSize: 24 }}>📄</Text>
                            </View>
                          ) : (
                            <Image
                              source={{ uri: checkoutComprobanteAsset?.uri || resolveMediaUrl(checkoutComprobanteUrl) || "" }}
                              style={{ width: 48, height: 48, borderRadius: 8, backgroundColor: "#E2E8F0" }}
                            />
                          )}
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

                {/* Banner de estado de pago Bancolombia / Transferencia */}
                {(selectedPedido.metodoPago === "BANCOLOMBIA" || selectedPedido.metodoPago === "TRANSFERENCIA") && (
                  <View style={{
                    marginTop: 10,
                    padding: 10,
                    borderRadius: 10,
                    backgroundColor: selectedPedido.estadoPago === "APROBADO" ? "#ECFDF5" : selectedPedido.estadoPago === "RECHAZADO" ? "#FEF2F2" : "#FFFBEB",
                    borderWidth: 1,
                    borderColor: selectedPedido.estadoPago === "APROBADO" ? "#6EE7B7" : selectedPedido.estadoPago === "RECHAZADO" ? "#FCA5A5" : "#FDE68A",
                  }}>
                    <Text style={{ fontSize: 11, fontWeight: "bold", color: selectedPedido.estadoPago === "APROBADO" ? "#065F46" : selectedPedido.estadoPago === "RECHAZADO" ? "#991B1B" : "#92400E" }}>
                      Estado del Pago: {selectedPedido.estadoPago === "APROBADO" ? "✓ APROBADO POR EL COMERCIO" : selectedPedido.estadoPago === "RECHAZADO" ? `✕ RECHAZADO: ${selectedPedido.motivoRechazoPago || "Comprobante no válido"}` : "⏳ EN VERIFICACIÓN POR EL COMERCIO"}
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

                    {/* Botón para subir o reenviar comprobante si no está aprobado */}
                    {selectedPedido.estadoPago !== "APROBADO" && selectedPedido.estado !== "CANCELADO" && selectedPedido.estado !== "ENTREGADO" && (
                      <TouchableOpacity
                        style={{
                          marginTop: 8,
                          backgroundColor: Theme.primary,
                          paddingVertical: 7,
                          paddingHorizontal: 12,
                          borderRadius: 8,
                          alignItems: "center",
                          flexDirection: "row",
                          justifyContent: "center",
                          gap: 6,
                        }}
                        onPress={() => uploadOrderComprobante(selectedPedido.id)}
                      >
                        <Text style={{ color: "#FFFFFF", fontSize: 11, fontWeight: "bold" }}>
                          📤 {selectedPedido.comprobantePagoUrl ? "Reenviar Comprobante" : "Subir Comprobante de Pago"}
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
                        ${(encValorInicialPropuesto ? Number(encValorInicialPropuesto) : calcTarifa(encDistanciaKm)).toLocaleString()} COP
                      </Text>
                    </View>
                  </View>

                  {/* Tarifa Inicial Propuesta (Opcional - Negociable) */}
                  <View style={{ marginTop: 10, padding: 10, backgroundColor: "#1E293B", borderRadius: 10, borderWidth: 1, borderColor: "#334155" }}>
                    <Text style={{ color: "#93C5FD", fontSize: 11, fontWeight: "bold" }}>
                      💵 Tarifa Inicial Propuesta (Negociable):
                    </Text>
                    <TextInput
                      style={[styles.textInput, { backgroundColor: "#0F172A", color: "#FFFFFF", borderColor: "#475569", marginTop: 4 }]}
                      placeholder={`Sugerido: $${calcTarifa(encDistanciaKm).toLocaleString()} COP`}
                      placeholderTextColor="#64748B"
                      value={encValorInicialPropuesto}
                      onChangeText={setEncValorInicialPropuesto}
                      keyboardType="numeric"
                    />
                    <Text style={{ color: "#94A3B8", fontSize: 10, marginTop: 4 }}>
                      Los repartidores podrán aceptar este valor o proponerte contraofertas.
                    </Text>
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
                      Acepto expresamente la tarifa inicial de{" "}
                      <Text style={{ color: "#34D399", fontWeight: "bold" }}>
                        ${(encValorInicialPropuesto ? Number(encValorInicialPropuesto) : calcTarifa(encDistanciaKm)).toLocaleString()} COP
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
                  encomiendasCliente.map((enc) => {
                    const isExpanded = expandedEncClienteId === enc.id;
                    const ofertas = ofertasPorEncomienda[enc.id] || [];
                    const numOfertas = enc.numeroOfertas || 0;

                    return (
                      <View key={enc.id} style={[styles.kitchenCard, { borderColor: Theme.border }]}>
                        <View style={styles.orderHeaderRow}>
                          <Text style={styles.orderNumberTitle}>#ENC-{enc.id}</Text>
                          <View style={[styles.statusPill, { 
                            backgroundColor: enc.estado === "ENTREGADA" ? "#DCFCE7" : enc.estado === "OFERTA" ? "#FEF3C7" : "#EFF6FF" 
                          }]}>
                            <Text style={{ 
                              color: enc.estado === "ENTREGADA" ? "#166534" : enc.estado === "OFERTA" ? "#92400E" : "#1E40AF", 
                              fontSize: 10, 
                              fontWeight: "bold" 
                            }}>
                              {enc.estado === "OFERTA" ? "CON OFERTAS" : enc.estado}
                            </Text>
                          </View>
                        </View>

                        {enc.valorInicial && enc.costoEnvio && enc.valorInicial !== enc.costoEnvio ? (
                          <View style={{ marginVertical: 2 }}>
                            <Text style={{ fontSize: 11, color: Theme.textMuted, textDecorationLine: "line-through" }}>
                              Inicial: ${enc.valorInicial?.toLocaleString()} COP
                            </Text>
                            <Text style={[styles.kitchenPrice, { color: Theme.primaryDark }]}>
                              Pactado: ${enc.costoEnvio?.toLocaleString()} COP
                            </Text>
                          </View>
                        ) : (
                          <Text style={styles.kitchenPrice}>Costo de envío: ${enc.costoEnvio?.toLocaleString()} COP</Text>
                        )}

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

                        {/* Acordeón de Contraofertas Recibidas */}
                        {(enc.estado === "PENDIENTE" || enc.estado === "OFERTA" || numOfertas > 0) && (
                          <View style={{ marginTop: 8, borderTopWidth: 1, borderTopColor: "#F1F5F9", paddingTop: 8 }}>
                            <TouchableOpacity
                              style={[styles.smallActionBtn, { backgroundColor: "#FEF3C7", paddingVertical: 6 }]}
                              onPress={() => handleToggleOfertasCliente(enc.id)}
                            >
                              <Text style={[styles.smallActionText, { color: "#92400E", fontWeight: "bold" }]}>
                                💬 Contraofertas ({numOfertas}) {isExpanded ? "▲ Ocultar" : "▼ Ver Ofertas"}
                              </Text>
                            </TouchableOpacity>

                            {isExpanded && (
                              <View style={{ marginTop: 8, gap: 6 }}>
                                {loadingOfertasCliente ? (
                                  <ActivityIndicator size="small" color={Theme.primary} />
                                ) : ofertas.length === 0 ? (
                                  <Text style={[styles.helperText, { textAlign: "center" }]}>
                                    No hay contraofertas registradas aún.
                                  </Text>
                                ) : (
                                  ofertas.map((of: any) => (
                                    <View
                                      key={of.id}
                                      style={{
                                        padding: 8,
                                        borderRadius: 8,
                                        borderWidth: 1,
                                        borderColor: of.estado === "ACEPTADA" ? "#86EFAC" : of.estado === "RECHAZADA" ? "#FECDD3" : "#FDE68A",
                                        backgroundColor: of.estado === "ACEPTADA" ? "#F0FDF4" : of.estado === "RECHAZADA" ? "#FFF1F2" : "#FFFBEB",
                                      }}
                                    >
                                      <View style={styles.rowBetween}>
                                        <Text style={{ fontSize: 12, fontWeight: "bold", color: Theme.text }}>
                                          {of.domiciliarioNombre || "Domiciliario"}
                                        </Text>
                                        <Text style={{ fontSize: 13, fontWeight: "900", color: Theme.primaryDark }}>
                                          ${of.valor?.toLocaleString()} COP
                                        </Text>
                                      </View>
                                      {of.mensaje ? (
                                        <Text style={{ fontSize: 11, fontStyle: "italic", color: Theme.textMuted, marginTop: 2 }}>
                                          "{of.mensaje}"
                                        </Text>
                                      ) : null}
                                      <Text style={{ fontSize: 10, color: Theme.textMuted, marginTop: 2 }}>
                                        Estado: <Text style={{ fontWeight: "bold" }}>{of.estado}</Text>
                                      </Text>

                                      {of.estado === "PENDIENTE" && enc.estado !== "ACEPTADA" && (
                                        <View style={{ flexDirection: "row", gap: 6, marginTop: 6 }}>
                                          <TouchableOpacity
                                            style={[styles.smallActionBtn, { flex: 1, backgroundColor: Theme.primary }]}
                                            onPress={() => handleAceptarOferta(enc.id, of.id)}
                                            disabled={processingOfertaId === of.id}
                                          >
                                            <Text style={styles.smallActionText}>✓ Aceptar</Text>
                                          </TouchableOpacity>
                                          <TouchableOpacity
                                            style={[styles.smallActionBtn, { flex: 1, backgroundColor: Theme.danger }]}
                                            onPress={() => handleRechazarOferta(enc.id, of.id)}
                                            disabled={processingOfertaId === of.id}
                                          >
                                            <Text style={styles.smallActionText}>✕ Rechazar</Text>
                                          </TouchableOpacity>
                                        </View>
                                      )}
                                    </View>
                                  ))
                                )}
                              </View>
                            )}
                          </View>
                        )}
                      </View>
                    );
                  })
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

            {/* Alerta de Nuevo Pedido Entrante en Cocina (Fase I) */}
            {newMobileOrderAlert && (
              <View
                style={{
                  backgroundColor: "#FEF3C7",
                  borderColor: "#F59E0B",
                  borderWidth: 1.5,
                  borderRadius: 14,
                  padding: 14,
                  marginTop: 12,
                  marginBottom: 4,
                }}
              >
                <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <View style={{ flex: 1, marginRight: 8 }}>
                    <Text style={{ fontWeight: "900", color: "#92400E", fontSize: 15, marginBottom: 2 }}>
                      🔔 ¡Nuevo Pedido Recibido! #{newMobileOrderAlert.id}
                    </Text>
                    <Text style={{ fontSize: 13, color: "#78350F", marginBottom: 2 }}>
                      Cliente: {newMobileOrderAlert.clienteNombre || "Cliente"} • Total: ${newMobileOrderAlert.total?.toLocaleString("es-CO")}
                    </Text>
                    <Text style={{ fontSize: 12, color: "#B45309" }}>
                      Método: {newMobileOrderAlert.metodoPago} • Estado: {newMobileOrderAlert.estado}
                    </Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => setNewMobileOrderAlert(null)}
                    style={{
                      paddingHorizontal: 8,
                      paddingVertical: 4,
                      backgroundColor: "#FDE68A",
                      borderRadius: 8,
                    }}
                  >
                    <Text style={{ fontWeight: "700", color: "#92400E", fontSize: 12 }}>✕ Cerrar</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {/* Multi-Tiendas y Planes FASTGO */}
            <View
              style={{
                marginTop: 12,
                padding: 12,
                backgroundColor: "#F1F5F9",
                borderRadius: 16,
                borderWidth: 1,
                borderColor: "#CBD5E1",
                gap: 8,
              }}
            >
              <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 6, flex: 1 }}>
                  <Text style={{ fontSize: 18 }}>🏬</Text>
                  <View style={{ flex: 1 }}>
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                      <Text style={{ fontSize: 13, fontWeight: "900", color: Theme.text }}>
                        {comercioPropio ? comercioPropio.nombre : "Sin Tienda"}
                      </Text>
                      {comercioPropio?.esPrincipal && (
                        <View style={{ backgroundColor: "#EDE9FE", paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 }}>
                          <Text style={{ fontSize: 9, fontWeight: "900", color: "#6D28D9" }}>Principal (6m gratis)</Text>
                        </View>
                      )}
                      <View
                        style={{
                          backgroundColor:
                            comercioPropio?.estado === "ACTIVA"
                              ? "#D1FAE5"
                              : comercioPropio?.estado === "PENDIENTE_ACTIVACION"
                              ? "#FEF3C7"
                              : "#FEE2E2",
                          paddingHorizontal: 6,
                          paddingVertical: 2,
                          borderRadius: 6,
                        }}
                      >
                        <Text
                          style={{
                            fontSize: 9,
                            fontWeight: "900",
                            color:
                              comercioPropio?.estado === "ACTIVA"
                                ? "#065F46"
                                : comercioPropio?.estado === "PENDIENTE_ACTIVACION"
                                ? "#92400E"
                                : "#991B1B",
                          }}
                        >
                          {comercioPropio?.estado || "ACTIVA"}
                        </Text>
                      </View>
                    </View>
                    <Text style={{ fontSize: 10, color: Theme.textMuted, marginTop: 2 }}>
                      {comercioPropio?.direccion || "Bogotá"}
                    </Text>
                  </View>
                </View>

                <View style={{ flexDirection: "row", gap: 6 }}>
                  <TouchableOpacity
                    style={{
                      backgroundColor: Theme.secondary,
                      paddingHorizontal: 10,
                      paddingVertical: 6,
                      borderRadius: 10,
                    }}
                    onPress={() => setShowStoreSwitcherModal(true)}
                  >
                    <Text style={{ color: "#FFF", fontSize: 11, fontWeight: "bold" }}>
                      Mis Tiendas ({misTiendas.length})
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={{
                      backgroundColor: Theme.primary,
                      paddingHorizontal: 10,
                      paddingVertical: 6,
                      borderRadius: 10,
                    }}
                    onPress={() => setShowNewStoreModal(true)}
                  >
                    <Text style={{ color: "#FFF", fontSize: 11, fontWeight: "bold" }}>+ Nueva</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Banner informativo si no está ACTIVA */}
              {comercioPropio && comercioPropio.estado !== "ACTIVA" && (
                <View
                  style={{
                    backgroundColor: "#FFFBEB",
                    padding: 8,
                    borderRadius: 10,
                    borderWidth: 1,
                    borderColor: "#FCD34D",
                  }}
                >
                  <Text style={{ fontSize: 10, color: "#92400E", fontWeight: "bold" }}>
                    ⚠️ Tienda en estado {comercioPropio.estado}. Pendiente de activación administrativa. Podrás configurar tus productos mientras el equipo FASTGO revisa y activa la tienda.
                  </Text>
                </View>
              )}
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

            {/* Alerta de Nueva Entrega Disponible (Fase I) */}
            {newMobileDeliveryAlert && (
              <View
                style={{
                  backgroundColor: "#ECFDF5",
                  borderColor: "#10B981",
                  borderWidth: 1.5,
                  borderRadius: 14,
                  padding: 14,
                  marginTop: 12,
                  marginBottom: 4,
                }}
              >
                <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <View style={{ flex: 1, marginRight: 8 }}>
                    <Text style={{ fontWeight: "900", color: "#065F46", fontSize: 15, marginBottom: 2 }}>
                      🛵 ¡Nueva Entrega Disponible! #{newMobileDeliveryAlert.id}
                    </Text>
                    <Text style={{ fontSize: 13, color: "#047857", marginBottom: 2 }}>
                      Comercio: {newMobileDeliveryAlert.comercioNombre || "Comercio FastGo"}
                    </Text>
                    <Text style={{ fontSize: 12, color: "#059669", marginBottom: 6 }}>
                      Entrega en: {newMobileDeliveryAlert.destinoDireccion || newMobileDeliveryAlert.direccionTexto || "Dirección de cliente"} • Total: ${newMobileDeliveryAlert.total?.toLocaleString("es-CO")}
                    </Text>
                    <View style={{ flexDirection: "row", gap: 8, marginTop: 4 }}>
                      <TouchableOpacity
                        onPress={() => {
                          const id = newMobileDeliveryAlert.id;
                          setNewMobileDeliveryAlert(null);
                          tomarPedidoDomiciliario(id);
                        }}
                        style={{
                          backgroundColor: Theme.primary,
                          paddingHorizontal: 12,
                          paddingVertical: 6,
                          borderRadius: 8,
                        }}
                      >
                        <Text style={{ color: "#FFFFFF", fontWeight: "800", fontSize: 12 }}>Tomar Pedido</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => setNewMobileDeliveryAlert(null)}
                        style={{
                          backgroundColor: "#D1FAE5",
                          paddingHorizontal: 10,
                          paddingVertical: 6,
                          borderRadius: 8,
                        }}
                      >
                        <Text style={{ color: "#065F46", fontWeight: "700", fontSize: 12 }}>Descartar</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                  <TouchableOpacity
                    onPress={() => setNewMobileDeliveryAlert(null)}
                    style={{
                      paddingHorizontal: 8,
                      paddingVertical: 4,
                      backgroundColor: "#D1FAE5",
                      borderRadius: 8,
                    }}
                  >
                    <Text style={{ fontWeight: "700", color: "#065F46", fontSize: 12 }}>✕</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

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
                            {p.destinoDireccion || p.direccionTexto || "Dirección de entrega asignada"}
                            {p.destinoCiudad ? ` (${p.destinoCiudad})` : ""}
                          </Text>
                          {p.destinoReferencia ? (
                            <Text style={{ fontSize: 10, fontStyle: "italic", color: Theme.textMuted, marginTop: 2 }}>
                              Ref: {p.destinoReferencia}
                            </Text>
                          ) : null}
                          {p.destinoLatitud != null && p.destinoLongitud != null ? (
                            <Text style={{ fontSize: 10, fontWeight: "bold", color: "#2563EB", marginTop: 2 }}>
                              GPS: {p.destinoLatitud.toFixed(4)}, {p.destinoLongitud.toFixed(4)}
                            </Text>
                          ) : null}
                        </View>
                      </View>

                      {/* Ganancia del Domiciliario */}
                      <View style={{ backgroundColor: "#ECFDF5", padding: 10, borderRadius: 10, borderWidth: 1, borderColor: "#A7F3D0", marginVertical: 4 }}>
                        <Text style={{ fontSize: 10, fontWeight: "bold", color: "#065F46", textTransform: "uppercase" }}>
                          💵 Ganancia por Domicilio:
                        </Text>
                        <Text style={{ fontSize: 16, fontWeight: "900", color: "#047857" }}>
                          ${(p.gananciaDomiciliario ?? p.costoEnvio ?? 2000).toLocaleString()} COP
                        </Text>
                        <Text style={{ fontSize: 9, color: "#065F46", marginTop: 2 }}>
                          Tarifa fija congelada en el pedido
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
                          {p.origenTelefono ? (
                            <Text style={{ fontSize: 10, fontWeight: "bold", color: "#7C3AED", marginTop: 2 }}>
                              📞 Tel Comercio: {p.origenTelefono}
                            </Text>
                          ) : null}
                        </View>
                        <View style={{ borderTopWidth: 1, borderTopColor: "#E2E8F0", paddingTop: 6 }}>
                          <Text style={{ fontSize: 10, fontWeight: "bold", color: "#059669", textTransform: "uppercase" }}>
                            📍 Entregar a:
                          </Text>
                          <Text style={{ fontSize: 12, fontWeight: "bold", color: Theme.text }}>
                            {p.clienteNombre || "Cliente"} {p.clienteTelefono ? `(📞 ${p.clienteTelefono})` : ""}
                          </Text>
                          <Text style={{ fontSize: 11, color: Theme.textMuted }}>
                            {p.destinoDireccion || p.direccionTexto || "Dirección de entrega"}
                            {p.destinoCiudad ? ` (${p.destinoCiudad})` : ""}
                          </Text>
                          {p.destinoReferencia ? (
                            <Text style={{ fontSize: 10, fontStyle: "italic", color: Theme.textMuted, marginTop: 2 }}>
                              Ref: {p.destinoReferencia}
                            </Text>
                          ) : null}
                          {p.destinoLatitud != null && p.destinoLongitud != null ? (
                            <Text style={{ fontSize: 10, fontWeight: "bold", color: "#2563EB", marginTop: 2 }}>
                              GPS: {p.destinoLatitud.toFixed(4)}, {p.destinoLongitud.toFixed(4)}
                            </Text>
                          ) : null}
                        </View>
                      </View>

                      <View style={{ backgroundColor: "#ECFDF5", padding: 8, borderRadius: 8, borderWidth: 1, borderColor: "#A7F3D0", marginBottom: 6 }}>
                        <Text style={{ fontSize: 11, fontWeight: "bold", color: "#065F46" }}>
                          💵 Tu ganancia: ${(p.gananciaDomiciliario ?? p.costoEnvio ?? 2000).toLocaleString()} COP
                        </Text>
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
                        <View style={[styles.statusPill, { backgroundColor: enc.estado === "OFERTA" ? "#FEF3C7" : "#DCFCE7" }]}>
                          <Text style={{ color: enc.estado === "OFERTA" ? "#92400E" : "#166534", fontSize: 10, fontWeight: "bold" }}>
                            {enc.estado === "OFERTA" ? "EN NEGOCIACIÓN" : "DISPONIBLE"}
                          </Text>
                        </View>
                      </View>
                      <Text style={styles.kitchenPrice}>Tarifa Propuesta: ${enc.costoEnvio?.toLocaleString()} COP</Text>
                      {enc.numeroOfertas > 0 && (
                        <Text style={{ fontSize: 11, color: "#D97706", fontWeight: "bold", marginTop: 2 }}>
                          💬 {enc.numeroOfertas} contraoferta(s) activa(s)
                        </Text>
                      )}
                      <Text style={styles.kitchenNotes}>{enc.descripcion} ({enc.tamanoPeso || "Estándar"})</Text>
                      <View style={{ marginTop: 6, padding: 8, backgroundColor: "#FFFFFF", borderRadius: 8, borderWidth: 1, borderColor: Theme.border }}>
                        <Text style={{ fontSize: 11, color: Theme.text }}><Text style={{ fontWeight: "bold" }}>Origen:</Text> {enc.direccionOrigen}</Text>
                        <Text style={{ fontSize: 11, color: Theme.text, marginTop: 2 }}><Text style={{ fontWeight: "bold" }}>Destino:</Text> {enc.direccionDestino}</Text>
                      </View>
                      
                      <View style={{ flexDirection: "row", gap: 8, marginTop: 10 }}>
                        <TouchableOpacity
                          style={[styles.solidBtn, { flex: 1, backgroundColor: "#D97706" }]}
                          onPress={() => {
                            setDomiOfertaModalEnc(enc);
                            setDomiOfertaValor(String(enc.costoEnvio || 2000));
                            setDomiOfertaMensaje("");
                          }}
                        >
                          <Text style={[styles.solidBtnText, { fontSize: 12 }]}>Contraofertar</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={[styles.solidBtn, { flex: 1 }]}
                          onPress={() => handleTomarEncomienda(enc.id)}
                        >
                          <Text style={[styles.solidBtnText, { fontSize: 12 }]}>Aceptar Tarifa</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  ))
                )}
              </View>
            )}

            {/* Modal de Contraoferta Domiciliario */}
            <Modal visible={!!domiOfertaModalEnc} transparent animationType="fade">
              <View style={styles.modalBackdrop}>
                <View style={[styles.modalCardContainer, { maxWidth: 400 }]}>
                  <Text style={styles.modalHeaderTitle}>Enviar Contraoferta</Text>
                  {domiOfertaModalEnc && (
                    <Text style={[styles.subtext, { marginBottom: 10 }]}>
                      #ENC-{domiOfertaModalEnc.id} | Tarifa propuesta: ${domiOfertaModalEnc.costoEnvio?.toLocaleString()} COP
                    </Text>
                  )}
                  <Text style={styles.inputLabel}>Tu Tarifa Propuesta (COP):</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="Ej. 10000"
                    placeholderTextColor="#94A3B8"
                    value={domiOfertaValor}
                    onChangeText={setDomiOfertaValor}
                    keyboardType="numeric"
                  />
                  <Text style={[styles.inputLabel, { marginTop: 10 }]}>Mensaje para el Cliente (Opcional):</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="Ej. Llego en moto en 3 min con cajón seguro"
                    placeholderTextColor="#94A3B8"
                    value={domiOfertaMensaje}
                    onChangeText={setDomiOfertaMensaje}
                    maxLength={255}
                  />
                  <View style={{ flexDirection: "row", gap: 10, marginTop: 16 }}>
                    <TouchableOpacity
                      style={[styles.outlineBtn, { flex: 1 }]}
                      onPress={() => setDomiOfertaModalEnc(null)}
                    >
                      <Text style={{ color: Theme.text, fontWeight: "bold" }}>Cancelar</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.solidBtn, { flex: 1, backgroundColor: "#D97706" }]}
                      onPress={handleCrearOfertaDomi}
                      disabled={isSubmittingDomiOferta}
                    >
                      {isSubmittingDomiOferta ? (
                        <ActivityIndicator color="#FFFFFF" size="small" />
                      ) : (
                        <Text style={styles.solidBtnText}>Enviar Oferta</Text>
                      )}
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </Modal>
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
                  <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
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

                    <TouchableOpacity
                      style={{
                        backgroundColor: Theme.secondary,
                        paddingHorizontal: 8,
                        paddingVertical: 5,
                        borderRadius: 8,
                      }}
                      onPress={() => setShowStoreSwitcherModal(true)}
                    >
                      <Text style={{ color: "#FFF", fontSize: 10, fontWeight: "bold" }}>
                        Tiendas ({misTiendas.length})
                      </Text>
                    </TouchableOpacity>
                  </View>

                  {/* Plan y Estado Actual */}
                  {comercioPropio && (
                    <View
                      style={{
                        padding: 10,
                        backgroundColor: "#F8FAFC",
                        borderRadius: 10,
                        borderWidth: 1,
                        borderColor: Theme.border,
                        gap: 4,
                      }}
                    >
                      <View style={{ flexDirection: "row", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                        <Text style={{ fontSize: 11, fontWeight: "bold", color: Theme.text }}>
                          {comercioPropio.esPrincipal ? "⭐ Tienda Principal" : "🏬 Sede Adicional"}
                        </Text>
                        <View
                          style={{
                            backgroundColor:
                              comercioPropio.estado === "ACTIVA"
                                ? "#D1FAE5"
                                : comercioPropio.estado === "PENDIENTE_VERIFICACION"
                                ? "#DBEAFE"
                                : comercioPropio.estado === "PENDIENTE_ACTIVACION"
                                ? "#FEF3C7"
                                : "#FEE2E2",
                            paddingHorizontal: 6,
                            paddingVertical: 2,
                            borderRadius: 6,
                          }}
                        >
                          <Text
                            style={{
                              fontSize: 9,
                              fontWeight: "900",
                              color:
                                comercioPropio.estado === "ACTIVA"
                                  ? "#065F46"
                                  : comercioPropio.estado === "PENDIENTE_VERIFICACION"
                                  ? "#1E40AF"
                                  : comercioPropio.estado === "PENDIENTE_ACTIVACION"
                                  ? "#92400E"
                                  : "#991B1B",
                            }}
                          >
                            {comercioPropio.estado === "PENDIENTE_VERIFICACION"
                              ? "EN REVISIÓN"
                              : comercioPropio.estado === "SUSPENDIDA_POR_MORA"
                              ? "MORA"
                              : comercioPropio.estado || "ACTIVA"}
                          </Text>
                        </View>
                      </View>

                      <Text style={{ fontSize: 10, color: Theme.textMuted }}>
                        {comercioPropio.esPrincipal
                          ? "Periodo de prueba: 6 meses sin costo ($0 COP), luego $20.000 COP/mes."
                          : "Tarifa de activación: $50.000 COP y suscripción mensual: $30.000 COP."}
                      </Text>

                      {/* Alerta de Vencimiento Próximo (3 días o menos) */}
                      {Boolean(comercioPropio.alertaVencimiento) && (
                        <View style={{
                          backgroundColor: "#FEF3C7",
                          padding: 10,
                          borderRadius: 8,
                          borderWidth: 1,
                          borderColor: "#F59E0B",
                          marginTop: 6,
                          gap: 3,
                        }}>
                          <Text style={{ fontSize: 11, fontWeight: "900", color: "#92400E" }}>
                            ⚠️ Tu tienda vence en {comercioPropio.diasRestantes ?? 0} {comercioPropio.diasRestantes === 1 ? "día" : "días"}
                          </Text>
                          <Text style={{ fontSize: 10, color: "#78350F", lineHeight: 14 }}>
                            Transfiere a la cuenta oficial de FASTGO y adjunta tu comprobante para evitar la suspensión del servicio.
                          </Text>
                        </View>
                      )}

                      {/* Tarjeta de Activación / Pago / Subida de Comprobante cuando no está ACTIVA */}
                      {comercioPropio.estado !== "ACTIVA" && (
                        <View style={{
                          marginTop: 8,
                          padding: 10,
                          borderRadius: 10,
                          backgroundColor: comercioPropio.estado === "RECHAZADA" ? "#FEF2F2" : comercioPropio.estado === "PENDIENTE_VERIFICACION" ? "#EFF6FF" : "#FFFBEB",
                          borderWidth: 1,
                          borderColor: comercioPropio.estado === "RECHAZADA" ? "#FECACA" : comercioPropio.estado === "PENDIENTE_VERIFICACION" ? "#BFDBFE" : "#FDE68A",
                          gap: 6,
                        }}>
                          <Text style={{
                            fontSize: 11,
                            fontWeight: "900",
                            color: comercioPropio.estado === "RECHAZADA" ? "#991B1B" : comercioPropio.estado === "PENDIENTE_VERIFICACION" ? "#1E40AF" : "#92400E",
                          }}>
                            {comercioPropio.estado === "PENDIENTE_ACTIVACION" && "⏳ Pendiente de Activación"}
                            {comercioPropio.estado === "PENDIENTE_VERIFICACION" && "🔍 Comprobante en Revisión por FASTGO"}
                            {comercioPropio.estado === "RECHAZADA" && "❌ Comprobante Rechazado"}
                            {comercioPropio.estado === "SUSPENDIDA_POR_MORA" && "⛔ Tienda Suspendida por Mora"}
                            {comercioPropio.estado === "SUSPENDIDA" && "⚠️ Tienda Suspendida"}
                          </Text>

                          {comercioPropio.estado === "RECHAZADA" && (
                            <Text style={{ fontSize: 10, color: "#7F1D1D" }}>
                              Motivo: <Text style={{ fontWeight: "bold" }}>{comercioPropio.motivoRechazoSuscripcion || "Comprobante rechazado por administración"}</Text>.
                            </Text>
                          )}

                          {/* Cuenta Bancaria FASTGO */}
                          {(comercioPropio.bancoNumeroCuenta || subConfig?.bancoNumeroCuenta) && (
                            <View style={{ backgroundColor: "#FFFFFF", padding: 8, borderRadius: 8, borderWidth: 1, borderColor: "#E2E8F0", gap: 2 }}>
                              <Text style={{ fontSize: 10, fontWeight: "bold", color: Theme.text }}>
                                🏦 Cuenta Oficial FASTGO para Pago:
                              </Text>
                              <Text style={{ fontSize: 9, color: Theme.textMuted }}>
                                Banco: <Text style={{ fontWeight: "bold", color: Theme.text }}>{comercioPropio.bancoNombre || subConfig?.bancoNombre || "Bancolombia"}</Text> ({comercioPropio.bancoTipoCuenta || subConfig?.bancoTipoCuenta || "Ahorros"})
                              </Text>
                              <Text style={{ fontSize: 9, color: Theme.textMuted }}>
                                Cuenta: <Text style={{ fontWeight: "bold", color: Theme.primaryDark }}>{comercioPropio.bancoNumeroCuenta || subConfig?.bancoNumeroCuenta}</Text>
                              </Text>
                              <Text style={{ fontSize: 9, color: Theme.textMuted }}>
                                Titular: <Text style={{ fontWeight: "bold", color: Theme.text }}>{comercioPropio.bancoTitular || subConfig?.bancoTitular || "FastGo S.A.S."}</Text>
                              </Text>
                              <Text style={{ fontSize: 9, color: Theme.textMuted }}>
                                NIT: <Text style={{ fontWeight: "bold", color: Theme.text }}>{comercioPropio.bancoDocumento || subConfig?.bancoDocumento || "NIT 901.888.777-1"}</Text>
                              </Text>
                              {(comercioPropio.instruccionesPago || subConfig?.instruccionesPago) && (
                                <Text style={{ fontSize: 8, color: "#64748B", fontStyle: "italic", marginTop: 2 }}>
                                  💡 {comercioPropio.instruccionesPago || subConfig?.instruccionesPago}
                                </Text>
                              )}
                            </View>
                          )}

                          {/* Botón Subir Comprobante */}
                          {comercioPropio.estado !== "PENDIENTE_VERIFICACION" && (
                            <TouchableOpacity
                              style={[styles.solidBtn, { backgroundColor: Theme.primary, paddingVertical: 8, marginTop: 4 }]}
                              onPress={handleUploadSubscriptionProofMobile}
                              disabled={isUploadingSubProof}
                            >
                              {isUploadingSubProof ? (
                                <ActivityIndicator color="#FFF" size="small" />
                              ) : (
                                <Text style={[styles.solidBtnText, { fontSize: 11 }]}>📎 Subir Comprobante de Pago</Text>
                              )}
                            </TouchableOpacity>
                          )}

                          {comercioPropio.comprobanteSuscripcionUrl && (
                            <TouchableOpacity
                              onPress={() => setViewingReceiptUrl(comercioPropio.comprobanteSuscripcionUrl)}
                              style={{ alignSelf: "flex-start", paddingVertical: 2 }}
                            >
                              <Text style={{ fontSize: 10, fontWeight: "bold", color: Theme.info, textDecorationLine: "underline" }}>
                                👁️ Ver Comprobante Enviado
                              </Text>
                            </TouchableOpacity>
                          )}
                        </View>
                      )}
                    </View>
                  )}

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
      {viewingReceiptUrl && (() => {
        let fullReceiptUrl = resolveMediaUrl(viewingReceiptUrl) || "";
        if (token && !fullReceiptUrl.includes("token=")) {
          fullReceiptUrl += (fullReceiptUrl.includes("?") ? "&" : "?") + `token=${encodeURIComponent(token)}`;
        }
        const isPdf = viewingReceiptUrl.toLowerCase().includes(".pdf");

        return (
          <View style={styles.modalBackdrop}>
            <View style={[styles.modalCardContainer, { padding: 16, maxHeight: "90%" }]}>
              <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <Text style={{ fontSize: 15, fontWeight: "900", color: Theme.text }}>
                  🧾 Comprobante de Pago
                </Text>
                <TouchableOpacity onPress={() => setViewingReceiptUrl(null)} style={{ padding: 4 }}>
                  <Text style={{ fontSize: 16, fontWeight: "bold", color: Theme.textMuted }}>✕</Text>
                </TouchableOpacity>
              </View>

              {isPdf ? (
                <View style={{ padding: 24, alignItems: "center", justifyContent: "center", backgroundColor: "#F8FAFC", borderRadius: 12, borderWidth: 1, borderColor: Theme.border, gap: 10 }}>
                  <Text style={{ fontSize: 44 }}>📄</Text>
                  <Text style={{ fontSize: 13, fontWeight: "bold", color: Theme.text, textAlign: "center" }}>
                    Comprobante en formato PDF
                  </Text>
                  <Text style={{ fontSize: 11, color: Theme.textMuted, textAlign: "center" }}>
                    Puedes abrir el documento PDF con el visor de tu dispositivo.
                  </Text>
                  <TouchableOpacity
                    style={[styles.solidBtn, { paddingHorizontal: 16, paddingVertical: 10, marginTop: 4 }]}
                    onPress={() => Linking.openURL(fullReceiptUrl).catch(() => Alert.alert("Error", "No se pudo abrir el archivo PDF."))}
                  >
                    <Text style={{ color: "#FFFFFF", fontWeight: "bold", fontSize: 12 }}>
                      Abrir PDF en Visor Externo
                    </Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <View>
                  <View style={{ borderRadius: 12, overflow: "hidden", backgroundColor: "#000000", alignItems: "center", justifyContent: "center" }}>
                    <Image
                      source={{
                        uri: fullReceiptUrl,
                        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
                      }}
                      style={{ width: "100%", height: 350 }}
                      resizeMode="contain"
                    />
                  </View>
                  <TouchableOpacity
                    style={{ marginTop: 8, alignItems: "center" }}
                    onPress={() => Linking.openURL(fullReceiptUrl).catch(() => Alert.alert("Error", "No se pudo abrir la imagen."))}
                  >
                    <Text style={{ color: Theme.primary, fontSize: 11, fontWeight: "bold" }}>
                      🔍 Abrir imagen en visor del sistema
                    </Text>
                  </TouchableOpacity>
                </View>
              )}

              <TouchableOpacity
                style={[styles.outlineBtn, { marginTop: 14 }]}
                onPress={() => setViewingReceiptUrl(null)}
              >
                <Text style={{ color: Theme.text, fontWeight: "bold" }}>Cerrar Visor</Text>
              </TouchableOpacity>
            </View>
          </View>
        );
      })()}

      {/* MODAL SELECTOR DE TIENDAS (MIS TIENDAS) */}
      {showStoreSwitcherModal && (
        <View style={styles.modalBackdrop}>
          <View style={[styles.modalCardContainer, { padding: 18, maxHeight: "85%" }]}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <View>
                <Text style={{ fontSize: 16, fontWeight: "900", color: Theme.text }}>
                  🏬 Mis Tiendas FASTGO
                </Text>
                <Text style={{ fontSize: 11, color: Theme.textMuted, marginTop: 2 }}>
                  Selecciona la sede que deseas administrar
                </Text>
              </View>
              <TouchableOpacity onPress={() => setShowStoreSwitcherModal(false)} style={{ padding: 4 }}>
                <Text style={{ fontSize: 16, fontWeight: "bold", color: Theme.textMuted }}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 320 }}>
              {misTiendas.length === 0 ? (
                <Text style={{ fontSize: 12, color: Theme.textMuted, textAlign: "center", marginVertical: 20 }}>
                  No tienes tiendas registradas.
                </Text>
              ) : (
                misTiendas.map((store) => {
                  const isSelected = comercioPropio?.id === store.id;
                  return (
                    <TouchableOpacity
                      key={store.id}
                      style={{
                        padding: 12,
                        backgroundColor: isSelected ? "#F0FDF4" : "#FFFFFF",
                        borderRadius: 14,
                        borderWidth: 1.5,
                        borderColor: isSelected ? Theme.primary : Theme.border,
                        marginBottom: 10,
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: "space-between",
                      }}
                      onPress={() => handleSelectStore(store)}
                    >
                      <View style={{ flex: 1, marginRight: 8 }}>
                        <View style={{ flexDirection: "row", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                          <Text style={{ fontSize: 13, fontWeight: "900", color: Theme.text }}>
                            {store.nombre}
                          </Text>
                          {store.esPrincipal && (
                            <View style={{ backgroundColor: "#EDE9FE", paddingHorizontal: 6, paddingVertical: 1, borderRadius: 6 }}>
                              <Text style={{ fontSize: 9, fontWeight: "900", color: "#6D28D9" }}>Principal</Text>
                            </View>
                          )}
                          <View
                            style={{
                              backgroundColor:
                                store.estado === "ACTIVA"
                                  ? "#D1FAE5"
                                  : store.estado === "PENDIENTE_ACTIVACION"
                                  ? "#FEF3C7"
                                  : "#FEE2E2",
                              paddingHorizontal: 6,
                              paddingVertical: 1,
                              borderRadius: 6,
                            }}
                          >
                            <Text
                              style={{
                                fontSize: 9,
                                fontWeight: "900",
                                color:
                                  store.estado === "ACTIVA"
                                    ? "#065F46"
                                    : store.estado === "PENDIENTE_ACTIVACION"
                                    ? "#92400E"
                                    : "#991B1B",
                              }}
                            >
                              {store.estado || "ACTIVA"}
                            </Text>
                          </View>
                        </View>
                        <Text style={{ fontSize: 10, color: Theme.textMuted, marginTop: 3 }}>
                          📍 {store.direccion || "Sin dirección"} • {store.ciudad || "Bogotá"}
                        </Text>
                      </View>

                      {isSelected && (
                        <View style={{ width: 22, height: 22, borderRadius: 11, backgroundColor: Theme.primary, alignItems: "center", justifyContent: "center" }}>
                          <Text style={{ color: "#FFF", fontSize: 12, fontWeight: "bold" }}>✓</Text>
                        </View>
                      )}
                    </TouchableOpacity>
                  );
                })
              )}
            </ScrollView>

            <View style={{ marginTop: 14, gap: 8 }}>
              <TouchableOpacity
                style={[styles.solidBtn, { backgroundColor: Theme.primary }]}
                onPress={() => {
                  setShowStoreSwitcherModal(false);
                  setShowNewStoreModal(true);
                }}
              >
                <Text style={styles.solidBtnText}>+ Crear Tienda Adicional</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.outlineBtn}
                onPress={() => setShowStoreSwitcherModal(false)}
              >
                <Text style={{ color: Theme.text, fontWeight: "bold" }}>Cerrar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}

      {/* MODAL REGISTRAR NUEVA TIENDA / SEDE ADICIONAL */}
      {showNewStoreModal && (
        <View style={styles.modalBackdrop}>
          <View style={[styles.modalCardContainer, { padding: 18, maxHeight: "90%" }]}>
            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <View>
                  <Text style={{ fontSize: 16, fontWeight: "900", color: Theme.text }}>
                    ✨ Registrar Nueva Tienda / Sede
                  </Text>
                  <Text style={{ fontSize: 11, color: Theme.textMuted, marginTop: 2 }}>
                    Apertura de tienda adicional en FASTGO
                  </Text>
                </View>
                <TouchableOpacity onPress={() => setShowNewStoreModal(false)} style={{ padding: 4 }}>
                  <Text style={{ fontSize: 16, fontWeight: "bold", color: Theme.textMuted }}>✕</Text>
                </TouchableOpacity>
              </View>

              {/* Condiciones y Tarifas */}
              <View
                style={{
                  padding: 12,
                  backgroundColor: "#F5F3FF",
                  borderRadius: 14,
                  borderWidth: 1,
                  borderColor: "#DDD6FE",
                  marginBottom: 14,
                  gap: 6,
                }}
              >
                <Text style={{ fontSize: 12, fontWeight: "900", color: "#5B21B6" }}>
                  💎 Tarifas para Tiendas Adicionales
                </Text>
                <Text style={{ fontSize: 11, color: "#4C1D95", lineHeight: 16 }}>
                  • Activación: <Text style={{ fontWeight: "900" }}>${(subConfig?.additionalStoreActivationPrice || 50000).toLocaleString()} COP</Text> (pago único)
                </Text>
                <Text style={{ fontSize: 11, color: "#4C1D95", lineHeight: 16 }}>
                  • Mensualidad: <Text style={{ fontWeight: "900" }}>${(subConfig?.additionalStoreMonthlyPrice || 30000).toLocaleString()} COP/mes</Text>
                </Text>
                <View style={{ marginTop: 4, padding: 8, backgroundColor: "#FFFFFF", borderRadius: 8 }}>
                  <Text style={{ fontSize: 10, color: "#6D28D9", fontWeight: "bold" }}>
                    📌 Importante: La tienda nacerá en estado PENDIENTE DE ACTIVACIÓN. El equipo administrativo revisará los datos para habilitarla.
                  </Text>
                </View>
              </View>

              {/* Formulario */}
              <View style={{ gap: 10 }}>
                <View>
                  <Text style={styles.inputLabel}>Nombre de la Tienda / Sede *</Text>
                  <TextInput
                    style={styles.textInput}
                    value={newStoreNombre}
                    onChangeText={setNewStoreNombre}
                    placeholder="Ej. Mi Negocio - Sede Norte"
                  />
                </View>

                <View>
                  <Text style={styles.inputLabel}>Dirección de Recogida *</Text>
                  <TextInput
                    style={styles.textInput}
                    value={newStoreDireccion}
                    onChangeText={setNewStoreDireccion}
                    placeholder="Ej. Carrera 15 # 85-30"
                  />
                </View>

                <View>
                  <Text style={styles.inputLabel}>Teléfono de Contacto *</Text>
                  <TextInput
                    style={styles.textInput}
                    keyboardType="phone-pad"
                    value={newStoreTelefono}
                    onChangeText={setNewStoreTelefono}
                    placeholder="Ej. 3101234567"
                  />
                </View>

                <View>
                  <Text style={styles.inputLabel}>Correo Electrónico de la Tienda *</Text>
                  <TextInput
                    style={styles.textInput}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    value={newStoreCorreo}
                    onChangeText={setNewStoreCorreo}
                    placeholder="Ej. sedenorte@minegocio.com"
                  />
                </View>

                <View>
                  <Text style={styles.inputLabel}>Departamento (Colombia) *</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginVertical: 6 }}>
                    <View style={{ flexDirection: "row", gap: 6 }}>
                      {departamentos.map((d) => {
                        const isSel = newStoreDeptoId === d.id;
                        return (
                          <TouchableOpacity
                            key={d.id}
                            style={[
                              styles.categoryChip,
                              isSel && styles.categoryChipActive,
                            ]}
                            onPress={() => handleSelectNewStoreDepto(d.id)}
                          >
                            <Text style={[styles.categoryChipText, isSel && styles.categoryChipTextActive]}>
                              {d.nombre}
                            </Text>
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  </ScrollView>
                </View>

                {newStoreDeptoId != null && newStoreMunicipios.length > 0 && (
                  <View>
                    <Text style={styles.inputLabel}>Municipio *</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginVertical: 6 }}>
                      <View style={{ flexDirection: "row", gap: 6 }}>
                        {newStoreMunicipios.map((m) => {
                          const isSel = newStoreMuniId === m.id;
                          return (
                            <TouchableOpacity
                              key={m.id}
                              style={[
                                styles.categoryChip,
                                isSel && styles.categoryChipActive,
                              ]}
                              onPress={() => {
                                setNewStoreMuniId(m.id);
                                setNewStoreCiudad(m.nombre);
                              }}
                            >
                              <Text style={[styles.categoryChipText, isSel && styles.categoryChipTextActive]}>
                                {m.nombre}
                              </Text>
                            </TouchableOpacity>
                          );
                        })}
                      </View>
                    </ScrollView>
                  </View>
                )}

                <View>
                  <Text style={styles.inputLabel}>Ciudad / Cabecera *</Text>
                  <TextInput
                    style={styles.textInput}
                    value={newStoreCiudad}
                    onChangeText={setNewStoreCiudad}
                    placeholder="Bogotá"
                  />
                </View>
              </View>

              <View style={{ marginTop: 16, gap: 8 }}>
                <TouchableOpacity
                  style={[styles.solidBtn, { backgroundColor: Theme.primary }]}
                  onPress={handleCreateAdditionalStore}
                  disabled={isCreatingNewStore}
                >
                  {isCreatingNewStore ? (
                    <ActivityIndicator color="#FFF" size="small" />
                  ) : (
                    <Text style={styles.solidBtnText}>Crear Tienda Adicional</Text>
                  )}
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.outlineBtn}
                  onPress={() => setShowNewStoreModal(false)}
                  disabled={isCreatingNewStore}
                >
                  <Text style={{ color: Theme.text, fontWeight: "bold" }}>Cancelar</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      )}

      {/* MODAL DE SELECCIÓN DE GEOGRAFÍA (DANE) */}
      {showGeoModal && (
        <View style={styles.modalBackdrop}>
          <View style={[styles.modalCardContainer, { maxHeight: "88%", padding: 18 }]}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <View>
                <Text style={{ fontSize: 16, fontWeight: "900", color: Theme.text }}>
                  📍 Ubicación de Comercios
                </Text>
                <Text style={{ fontSize: 11, color: Theme.textMuted, marginTop: 2 }}>
                  Filtra por Departamento y Municipio de Colombia (DANE)
                </Text>
              </View>
              <TouchableOpacity onPress={() => setShowGeoModal(false)} style={{ padding: 4 }}>
                <Text style={{ fontSize: 16, fontWeight: "bold", color: Theme.textMuted }}>✕</Text>
              </TouchableOpacity>
            </View>

            {/* Opción Restablecer / Toda Colombia */}
            <TouchableOpacity
              style={[
                styles.geoOptionCard,
                !selectedDepartamentoId && { borderColor: Theme.primary, backgroundColor: "#ECFDF5" },
              ]}
              onPress={() => {
                handleSelectDepartamento(null);
                setShowGeoModal(false);
              }}
            >
              <Text style={{ fontSize: 18, marginRight: 8 }}>🇨🇴</Text>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 13, fontWeight: "bold", color: Theme.text }}>
                  Toda Colombia
                </Text>
                <Text style={{ fontSize: 10, color: Theme.textMuted }}>
                  Mostrar todos los comercios aliados del país
                </Text>
              </View>
              {!selectedDepartamentoId && (
                <Text style={{ color: Theme.primary, fontWeight: "900" }}>✓</Text>
              )}
            </TouchableOpacity>

            <ScrollView showsVerticalScrollIndicator={false} style={{ marginTop: 10 }}>
              {/* Sección Departamentos */}
              <Text style={{ fontSize: 12, fontWeight: "bold", color: Theme.secondary, marginBottom: 6 }}>
                1. Selecciona Departamento ({departamentos.length})
              </Text>
              <TextInput
                style={[styles.textInput, { height: 38, marginBottom: 8, fontSize: 12 }]}
                placeholder="Buscar departamento (ej. Caldas, Antioquia)..."
                placeholderTextColor="#94A3B8"
                value={geoSearchDepto}
                onChangeText={setGeoSearchDepto}
              />
              <View style={{ maxHeight: 160, marginBottom: 14 }}>
                <ScrollView nestedScrollEnabled style={{ borderWidth: 1, borderColor: Theme.border, borderRadius: 10, padding: 4 }}>
                  {departamentos
                    .filter((d) => d.nombre.toLowerCase().includes(geoSearchDepto.toLowerCase()))
                    .map((d) => {
                      const isDeptActive = selectedDepartamentoId === d.id;
                      return (
                        <TouchableOpacity
                          key={d.id}
                          style={[
                            styles.geoListItem,
                            isDeptActive && { backgroundColor: "#D1FAE5" },
                          ]}
                          onPress={() => handleSelectDepartamento(d.id)}
                        >
                          <Text style={[styles.geoListItemText, isDeptActive && { fontWeight: "900", color: "#065F46" }]}>
                            {d.nombre} ({d.codigoDane})
                          </Text>
                          {isDeptActive && <Text style={{ color: "#065F46", fontWeight: "bold" }}>✓</Text>}
                        </TouchableOpacity>
                      );
                    })}
                </ScrollView>
              </View>

              {/* Sección Municipios (si hay departamento seleccionado) */}
              {selectedDepartamentoId && (
                <View>
                  <Text style={{ fontSize: 12, fontWeight: "bold", color: Theme.secondary, marginBottom: 6 }}>
                    2. Selecciona Municipio ({municipios.length})
                  </Text>

                  {/* Opción Todos los municipios del departamento */}
                  <TouchableOpacity
                    style={[
                      styles.geoListItem,
                      !selectedMunicipioId && { backgroundColor: "#D1FAE5" },
                      { marginBottom: 6, borderWidth: 1, borderColor: Theme.border, borderRadius: 8 },
                    ]}
                    onPress={() => handleSelectMunicipio(null)}
                  >
                    <Text style={[styles.geoListItemText, !selectedMunicipioId && { fontWeight: "900", color: "#065F46" }]}>
                      📍 Todos los municipios de este departamento
                    </Text>
                    {!selectedMunicipioId && <Text style={{ color: "#065F46", fontWeight: "bold" }}>✓</Text>}
                  </TouchableOpacity>

                  <TextInput
                    style={[styles.textInput, { height: 38, marginBottom: 8, fontSize: 12 }]}
                    placeholder="Buscar municipio (ej. Aguadas, Pácora)..."
                    placeholderTextColor="#94A3B8"
                    value={geoSearchMuni}
                    onChangeText={setGeoSearchMuni}
                  />
                  <View style={{ maxHeight: 160 }}>
                    <ScrollView nestedScrollEnabled style={{ borderWidth: 1, borderColor: Theme.border, borderRadius: 10, padding: 4 }}>
                      {municipios
                        .filter((m) => m.nombre.toLowerCase().includes(geoSearchMuni.toLowerCase()))
                        .map((m) => {
                          const isMuniActive = selectedMunicipioId === m.id;
                          return (
                            <TouchableOpacity
                              key={m.id}
                              style={[
                                styles.geoListItem,
                                isMuniActive && { backgroundColor: "#D1FAE5" },
                              ]}
                              onPress={() => handleSelectMunicipio(m.id)}
                            >
                              <Text style={[styles.geoListItemText, isMuniActive && { fontWeight: "900", color: "#065F46" }]}>
                                {m.nombre} ({m.codigoDane})
                              </Text>
                              {isMuniActive && <Text style={{ color: "#065F46", fontWeight: "bold" }}>✓</Text>}
                            </TouchableOpacity>
                          );
                        })}
                    </ScrollView>
                  </View>
                </View>
              )}
            </ScrollView>

            <TouchableOpacity
              style={[styles.outlineBtn, { marginTop: 12 }]}
              onPress={() => setShowGeoModal(false)}
            >
              <Text style={{ color: Theme.text, fontWeight: "bold" }}>Listo / Cerrar</Text>
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
  geoFilterBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.18)",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 7,
    marginTop: 8,
    gap: 8,
  },
  geoFilterText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "700",
  },
  geoFilterArrow: {
    color: "#A7F3D0",
    fontSize: 10,
    fontWeight: "bold",
  },
  geoOptionCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: Theme.border,
    backgroundColor: "#F8FAFC",
    marginBottom: 10,
  },
  geoListItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 8,
    marginBottom: 2,
  },
  geoListItemText: {
    fontSize: 12,
    color: Theme.text,
  },
});
