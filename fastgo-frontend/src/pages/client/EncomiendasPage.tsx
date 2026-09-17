import React, { useEffect, useState } from 'react';
import { 
  Package, 
  MapPin, 
  User, 
  Phone, 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  Bike, 
  Navigation, 
  ShieldCheck, 
  Plus, 
  Send, 
  X,
  FileText
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Spinner } from '../../components/common/Spinner';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { encomiendaService } from '../../services/encomiendaService';
import { tarifaService } from '../../services/tarifaService';
import { Encomienda, EstadoEncomienda, TarifaResponse } from '../../types';
import { parseApiError } from '../../utils/errorHandler';

export const EncomiendasPage: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const { success, error: showError } = useToast();

  const [tab, setTab] = useState<'nueva' | 'mis_encomiendas'>('nueva');
  const [encomiendas, setEncomiendas] = useState<Encomienda[]>([]);
  const [loadingList, setLoadingList] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [remitenteNombre, setRemitenteNombre] = useState('');
  const [remitenteTelefono, setRemitenteTelefono] = useState('');
  const [direccionOrigen, setDireccionOrigen] = useState('');

  const [destinatarioNombre, setDestinatarioNombre] = useState('');
  const [destinatarioTelefono, setDestinatarioTelefono] = useState('');
  const [direccionDestino, setDireccionDestino] = useState('');

  const [descripcion, setDescripcion] = useState('');
  const [tamanoPeso, setTamanoPeso] = useState('Pequeño (< 2 kg)');
  const [distanciaKm, setDistanciaKm] = useState<number>(2.5);
  const [tarifaInfo, setTarifaInfo] = useState<TarifaResponse | null>(null);
  const [tarifaAceptada, setTarifaAceptada] = useState(false);
  const [observaciones, setObservaciones] = useState('');

  // Pre-cargar datos del usuario autenticado
  useEffect(() => {
    if (user) {
      setRemitenteNombre(`${user.nombre || ''} ${user.apellido || ''}`.trim());
      setRemitenteTelefono(user.telefono || '');
    }
  }, [user]);

  // Recalcular tarifa cada vez que cambie la distancia estimada
  useEffect(() => {
    const calcular = async () => {
      try {
        const res = await tarifaService.calcular({ distanciaKm });
        setTarifaInfo(res);
      } catch (err) {
        // Fallback local exacto a la regla de negocio FastGo
        const base = 2000;
        const total = distanciaKm <= 1.0 ? base : base + Math.ceil(distanciaKm) * 200;
        setTarifaInfo({
          distanciaKm,
          tarifaBase: base,
          costoEnvio: total,
          desglose: `Tarifa base $2.000 COP + ${Math.ceil(distanciaKm)} km x $200 COP`,
        });
      }
    };
    calcular();
  }, [distanciaKm]);

  // Cargar lista de encomiendas
  const loadEncomiendas = async () => {
    if (!isAuthenticated) return;
    setLoadingList(true);
    try {
      const data = await encomiendaService.misEncomiendas();
      setEncomiendas(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingList(false);
    }
  };

  useEffect(() => {
    if (tab === 'mis_encomiendas') {
      loadEncomiendas();
    }
  }, [tab, isAuthenticated]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tarifaAceptada) {
      showError('Debes aceptar expresamente la tarifa calculada para continuar.');
      return;
    }

    setSubmitting(true);
    try {
      const nueva = await encomiendaService.crear({
        remitenteNombre,
        remitenteTelefono,
        direccionOrigen,
        destinatarioNombre,
        destinatarioTelefono,
        direccionDestino,
        descripcion,
        tamanoPeso,
        distanciaKm,
        costoEnvio: tarifaInfo?.costoEnvio || 2000,
        tarifaAceptada: true,
        observaciones,
      });

      success(`¡Encomienda #${nueva.id} creada con éxito! Domiciliarios notificados.`);
      // Reset form parcial
      setDescripcion('');
      setObservaciones('');
      setTarifaAceptada(false);
      setTab('mis_encomiendas');
      loadEncomiendas();
    } catch (err) {
      const parsed = parseApiError(err);
      showError(parsed.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancelar = async (id: number) => {
    try {
      await encomiendaService.cancelar(id);
      success(`Encomienda #${id} cancelada.`);
      loadEncomiendas();
    } catch (err) {
      showError('No se pudo cancelar la encomienda.');
    }
  };

  const getStatusBadge = (estado: EstadoEncomienda) => {
    switch (estado) {
      case 'PENDIENTE':
        return <Badge variant="warning">Pendiente de Domiciliario</Badge>;
      case 'ACEPTADA':
        return <Badge variant="info">Domiciliario Asignado</Badge>;
      case 'EN_RECOGIDA':
        return <Badge variant="info">En Recogida</Badge>;
      case 'EN_CAMINO':
        return <Badge variant="info">En Camino a Destino</Badge>;
      case 'ENTREGADA':
        return <Badge variant="success">Entregada</Badge>;
      case 'CANCELADA':
        return <Badge variant="danger">Cancelada</Badge>;
      default:
        return <Badge variant="secondary">{estado}</Badge>;
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-5">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold mb-2">
            <Package className="w-3.5 h-3.5 text-emerald-600" />
            <span>Servicio Oficial FastGo</span>
          </div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">
            Encomiendas y Envíos Urbanos
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Envía paquetes, llaves, documentos o paquetes de forma rápida con repartidores verificados.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex bg-gray-100 p-1.5 rounded-2xl">
          <button
            onClick={() => setTab('nueva')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              tab === 'nueva'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Plus className="w-4 h-4 text-emerald-600" />
            Nueva Encomienda
          </button>
          <button
            onClick={() => setTab('mis_encomiendas')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              tab === 'mis_encomiendas'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Clock className="w-4 h-4 text-amber-500" />
            Mis Envíos
          </button>
        </div>
      </div>

      {tab === 'nueva' ? (
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Card Remitente & Destinatario */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Origen / Remitente */}
            <Card className="space-y-4 border-emerald-100/60 bg-emerald-50/20">
              <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
                <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-black text-xs">
                  A
                </div>
                <div>
                  <h2 className="text-sm font-bold text-gray-900">Punto de Recogida (Remitente)</h2>
                  <p className="text-[11px] text-gray-500">¿Dónde recogemos el paquete?</p>
                </div>
              </div>

              <Input
                label="Nombre del Remitente"
                placeholder="Tu nombre completo"
                value={remitenteNombre}
                onChange={(e) => setRemitenteNombre(e.target.value)}
                icon={<User className="w-4 h-4" />}
                required
              />

              <Input
                label="Teléfono del Remitente"
                placeholder="3001234567"
                value={remitenteTelefono}
                onChange={(e) => setRemitenteTelefono(e.target.value)}
                icon={<Phone className="w-4 h-4" />}
                required
              />

              <Input
                label="Dirección de Recogida"
                placeholder="Calle 123 # 45 - 67, Apto 302"
                value={direccionOrigen}
                onChange={(e) => setDireccionOrigen(e.target.value)}
                icon={<MapPin className="w-4 h-4 text-emerald-600" />}
                required
              />
            </Card>

            {/* Destino / Destinatario */}
            <Card className="space-y-4 border-blue-100/60 bg-blue-50/20">
              <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
                <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center font-black text-xs">
                  B
                </div>
                <div>
                  <h2 className="text-sm font-bold text-gray-900">Punto de Entrega (Destinatario)</h2>
                  <p className="text-[11px] text-gray-500">¿A quién y dónde lo entregamos?</p>
                </div>
              </div>

              <Input
                label="Nombre del Destinatario"
                placeholder="Nombre de quien recibe"
                value={destinatarioNombre}
                onChange={(e) => setDestinatarioNombre(e.target.value)}
                icon={<User className="w-4 h-4" />}
                required
              />

              <Input
                label="Teléfono del Destinatario"
                placeholder="3109876543"
                value={destinatarioTelefono}
                onChange={(e) => setDestinatarioTelefono(e.target.value)}
                icon={<Phone className="w-4 h-4" />}
                required
              />

              <Input
                label="Dirección de Entrega"
                placeholder="Carrera 45 # 67 - 89, Casa 4"
                value={direccionDestino}
                onChange={(e) => setDireccionDestino(e.target.value)}
                icon={<Navigation className="w-4 h-4 text-blue-600" />}
                required
              />
            </Card>
          </div>

          {/* Detalles del Paquete y Estimación de Distancia */}
          <Card className="space-y-5">
            <h2 className="text-sm font-bold text-gray-900 flex items-center gap-2">
              <Package className="w-4 h-4 text-emerald-600" />
              Detalles del Paquete & Distancia
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Descripción del contenido"
                placeholder="Ej. Documentos notaría, llaves de oficina, caja regalo..."
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                icon={<FileText className="w-4 h-4" />}
                required
              />

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  Tamaño / Peso Aprox.
                </label>
                <select
                  value={tamanoPeso}
                  onChange={(e) => setTamanoPeso(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/20 bg-white"
                >
                  <option value="Pequeño (< 2 kg)">Sobre / Pequeño (&lt; 2 kg)</option>
                  <option value="Mediano (2 - 5 kg)">Mediano (2 - 5 kg)</option>
                  <option value="Grande (5 - 10 kg)">Grande (5 - 10 kg)</option>
                </select>
              </div>
            </div>

            {/* Selector de Distancia Estimada */}
            <div className="space-y-2 pt-2 border-t border-gray-100">
              <div className="flex justify-between items-center text-xs font-bold text-gray-700">
                <span>Distancia estimada del recorrido:</span>
                <span className="text-emerald-700 text-sm">{distanciaKm.toFixed(1)} km</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="15.0"
                step="0.5"
                value={distanciaKm}
                onChange={(e) => setDistanciaKm(parseFloat(e.target.value))}
                className="w-full accent-emerald-600 h-2 bg-gray-200 rounded-lg cursor-pointer"
              />
              <div className="flex justify-between text-[11px] text-gray-400">
                <span>1 km (Tarifa Mínima)</span>
                <span>5 km</span>
                <span>10 km</span>
                <span>15 km</span>
              </div>
            </div>

            <Input
              label="Observaciones o Instrucciones Especiales (Opcional)"
              placeholder="Ej. Tocar timbre 302, dejar en portería si no responden..."
              value={observaciones}
              onChange={(e) => setObservaciones(e.target.value)}
            />
          </Card>

          {/* Tarifa Oficial FastGo y Aceptación Expresa */}
          <div className="rounded-3xl bg-slate-900 text-white p-6 shadow-xl space-y-4 border border-slate-800">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[11px] font-bold tracking-wider text-emerald-400 uppercase">
                  Cotización en Tiempo Real
                </span>
                <h3 className="text-xl font-black mt-0.5">Tarifa Oficial de Envío</h3>
                <p className="text-xs text-slate-400 mt-1">
                  Base $2.000 COP hasta 1 km + $200 COP por cada kilómetro adicional (redondeo hacia arriba).
                </p>
              </div>
              <div className="text-right">
                <span className="text-xs text-slate-400 block">Total a Pagar</span>
                <span className="text-3xl font-black text-emerald-400 tracking-tight">
                  {formatCurrency(tarifaInfo?.costoEnvio || 2000)}
                </span>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-800/80 border border-slate-700 text-xs text-slate-300 flex items-center justify-between">
              <span className="font-mono text-[11px]">
                {tarifaInfo?.desglose || `Distancia: ${distanciaKm} km`}
              </span>
              <span className="text-emerald-300 font-bold">100% Para el Domiciliario</span>
            </div>

            {/* Checkbox de Aceptación Expresa Requerida */}
            <label className="flex items-start gap-3 p-3.5 rounded-2xl bg-emerald-950/40 border border-emerald-800/50 cursor-pointer hover:bg-emerald-950/60 transition-colors">
              <input
                type="checkbox"
                checked={tarifaAceptada}
                onChange={(e) => setTarifaAceptada(e.target.checked)}
                className="mt-0.5 w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-gray-300"
              />
              <span className="text-xs text-emerald-100 font-medium leading-relaxed">
                Acepto expresamente la tarifa calculada de{' '}
                <strong className="text-emerald-400 font-black">
                  {formatCurrency(tarifaInfo?.costoEnvio || 2000)}
                </strong>{' '}
                para el transporte y entrega de esta encomienda.
              </span>
            </label>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full font-black py-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-lg shadow-emerald-500/20"
              isLoading={submitting}
              disabled={!tarifaAceptada}
            >
              <Send className="w-4 h-4 mr-2" />
              Confirmar y Solicitar Domiciliario
            </Button>
          </div>
        </form>
      ) : (
        /* Lista de Mis Encomiendas */
        <div className="space-y-4">
          {loadingList ? (
            <div className="py-12 flex justify-center">
              <Spinner size="lg" />
            </div>
          ) : encomiendas.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-3xl border border-gray-100 p-8 space-y-3">
              <Package className="w-12 h-12 text-gray-300 mx-auto" />
              <h3 className="text-base font-bold text-gray-900">No tienes envíos registrados</h3>
              <p className="text-xs text-gray-500 max-w-sm mx-auto">
                Crea una nueva encomienda para solicitar un mensajero urbano a tu ubicación.
              </p>
              <Button variant="primary" size="sm" onClick={() => setTab('nueva')}>
                Solicitar mi primer envío
              </Button>
            </div>
          ) : (
            encomiendas.map((enc) => (
              <Card key={enc.id} className="space-y-4 border-gray-200">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-100 pb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-black text-emerald-700 text-sm">
                        #ENC-{enc.id}
                      </span>
                      {getStatusBadge(enc.estado)}
                    </div>
                    <span className="text-[11px] text-gray-400 mt-0.5 block">
                      Creado el {formatDate(enc.creadoEn)}
                    </span>
                  </div>

                  <div className="text-right">
                    <span className="text-xs text-gray-400 block">Costo de Envío</span>
                    <span className="text-lg font-black text-gray-900">
                      {formatCurrency(enc.costoEnvio || 2000)}
                    </span>
                  </div>
                </div>

                {/* Ruta */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-gray-50/70 p-3.5 rounded-2xl">
                  <div>
                    <span className="text-gray-400 block font-semibold text-[10px] uppercase">
                      Recogida:
                    </span>
                    <p className="font-bold text-gray-900 mt-0.5">{enc.direccionOrigen}</p>
                    <p className="text-gray-600 text-[11px]">
                      {enc.remitenteNombre} ({enc.remitenteTelefono})
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-400 block font-semibold text-[10px] uppercase">
                      Entrega:
                    </span>
                    <p className="font-bold text-gray-900 mt-0.5">{enc.direccionDestino}</p>
                    <p className="text-gray-600 text-[11px]">
                      {enc.destinatarioNombre} ({enc.destinatarioTelefono})
                    </p>
                  </div>
                </div>

                {/* Paquete & Domiciliario */}
                <div className="flex flex-wrap items-center justify-between gap-3 text-xs pt-1">
                  <div>
                    <span className="text-gray-400">Contenido: </span>
                    <strong className="text-gray-800">{enc.descripcion}</strong>
                    {enc.tamanoPeso && (
                      <span className="text-gray-500 ml-2">({enc.tamanoPeso})</span>
                    )}
                  </div>

                  {enc.domiciliarioNombre ? (
                    <div className="flex items-center gap-1.5 text-amber-700 bg-amber-50 px-2.5 py-1 rounded-xl font-medium">
                      <Bike className="w-3.5 h-3.5" />
                      <span>Domiciliario: {enc.domiciliarioNombre}</span>
                    </div>
                  ) : (
                    <span className="text-gray-400 italic">Buscando domiciliario cercano...</span>
                  )}
                </div>

                {/* Acciones */}
                {enc.estado === 'PENDIENTE' && (
                  <div className="pt-2 border-t border-gray-100 flex justify-end">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-rose-600 hover:text-rose-700 hover:bg-rose-50 text-xs"
                      onClick={() => handleCancelar(enc.id)}
                    >
                      <X className="w-3.5 h-3.5 mr-1" />
                      Cancelar Solicitud
                    </Button>
                  </div>
                )}
              </Card>
            ))
          )}
        </div>
      )}
    </div>
  );
};
