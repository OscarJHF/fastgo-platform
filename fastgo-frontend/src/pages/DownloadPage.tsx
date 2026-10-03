import React, { useEffect } from 'react';
import { Download, Smartphone, ShieldCheck, QrCode } from 'lucide-react';
import { FastGoLogo } from '../components/common/FastGoLogo';
import { analyticsService } from '../services/analyticsService';

export const DownloadPage: React.FC = () => {
  useEffect(() => {
    analyticsService.track({
      eventType: 'DOWNLOAD_PAGE_VIEW',
      platform: 'WEB',
      pathOrScreen: '/descargar',
    });
  }, []);

  const handleDownloadClick = () => {
    analyticsService.track({
      eventType: 'APK_DOWNLOAD',
      platform: 'WEB',
      appVersion: '2.2.3',
      pathOrScreen: '/descargar/apk',
      utmSource: 'web_button',
    });
  };

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center py-10 px-4 sm:px-6">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl shadow-slate-200/60 border border-slate-100 p-8 sm:p-10 text-center relative overflow-hidden">
        {/* Decoración sutil de fondo */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-emerald-50 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-teal-50 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col items-center">
          {/* Logo Oficial FASTGO */}
          <div className="mb-4">
            <FastGoLogo size="lg" />
          </div>

          {/* Títulos Principales */}
          <h1 className="text-3xl font-black text-slate-900 tracking-tight mt-2">
            Descarga FASTGO
          </h1>
          <p className="text-sm font-medium text-slate-500 mt-1">
            La aplicación oficial para Android
          </p>

          {/* Badge Disponible para Android */}
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200/80 text-xs font-bold mt-4 shadow-sm">
            <Smartphone className="w-3.5 h-3.5 text-emerald-600" />
            <span>Disponible para Android</span>
          </div>

          {/* Sección de Código QR */}
          <div className="mt-8 flex flex-col items-center w-full">
            <p className="text-xs font-extrabold uppercase tracking-wider text-slate-600 mb-3 flex items-center gap-1.5">
              <QrCode className="w-4 h-4 text-emerald-600" />
              Escanea para descargar FASTGO
            </p>

            <div className="p-4 bg-white rounded-2xl border-2 border-slate-200 shadow-md inline-block transition-transform hover:scale-105 duration-200">
              <img
                src="/fastgo-qr-descargar.svg"
                alt="Código QR oficial para descargar FASTGO"
                className="w-52 h-52 sm:w-56 sm:h-56 object-contain block"
                loading="eager"
              />
            </div>

            <p className="text-xs font-black tracking-widest uppercase text-slate-400 mt-2.5">
              Android
            </p>
          </div>

          {/* Botón Principal de Descarga */}
          <div className="mt-8 w-full">
            <a
              href="https://fastgo-app.fastgo-frontend.workers.dev/descargar/apk"
              download="FASTGO-release-2.2.3.apk"
              onClick={handleDownloadClick}
              className="w-full inline-flex items-center justify-center gap-3 px-6 py-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-black text-base shadow-lg shadow-emerald-600/25 hover:shadow-emerald-600/40 transition-all duration-200 active:scale-[0.98] group"
              id="btn-descargar-apk"
            >
              <Download className="w-5 h-5 group-hover:translate-y-0.5 transition-transform" />
              <span>DESCARGAR FASTGO</span>
            </a>

            <div className="flex items-center justify-center gap-2 mt-3 text-[11px] text-slate-400 font-semibold">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Instalador oficial seguro • Versión 2.2.3</span>
            </div>
          </div>

          {/* Pasos rápidos de instalación */}
          <div className="mt-8 pt-6 border-t border-slate-100 w-full text-left">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">
              ¿Cómo instalar en tu teléfono?
            </h3>
            <div className="space-y-2.5 text-xs text-slate-500">
              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 font-black flex items-center justify-center flex-shrink-0 text-[10px]">
                  1
                </span>
                <span>Pulsa <strong>DESCARGAR FASTGO</strong> o escanea el QR con tu cámara.</span>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 font-black flex items-center justify-center flex-shrink-0 text-[10px]">
                  2
                </span>
                <span>Abre la notificación del archivo descargado y presiona <strong>Instalar</strong>.</span>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 font-black flex items-center justify-center flex-shrink-0 text-[10px]">
                  3
                </span>
                <span>¡Listo! Disfruta de la experiencia oficial de FASTGO.</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
