package com.fastgo.dto;

import java.util.List;

public class AnalyticsMetricsResponseDTO {

    private long visitasTotales;
    private long descargasIniciadas;
    private long descargasCompletadas;
    private long appPrimerasAperturas;
    private long registrosTotales;
    private long pedidosCreados;
    private long pedidosEntregados;

    private String periodo;
    private String fechaInicio;
    private String fechaFin;
    private String zonaHoraria;

    private ResumenDTO resumen;
    private List<EmbudoPasoDTO> embudo;
    private List<TendenciaDiariaDTO> tendencias;
    private List<FuenteTraficoDTO> fuentes;

    public AnalyticsMetricsResponseDTO() {
    }

    public static class ResumenDTO {
        private long totalVisitas;
        private long visitasDescarga;
        private long descargasApk;
        private long primerasAperturasApp;
        private long registros;
        private long pedidosCreados;
        private long pedidosEntregados;

        public ResumenDTO() {}

        public ResumenDTO(long totalVisitas, long visitasDescarga, long descargasApk,
                          long primerasAperturasApp, long registros, long pedidosCreados, long pedidosEntregados) {
            this.totalVisitas = totalVisitas;
            this.visitasDescarga = visitasDescarga;
            this.descargasApk = descargasApk;
            this.primerasAperturasApp = primerasAperturasApp;
            this.registros = registros;
            this.pedidosCreados = pedidosCreados;
            this.pedidosEntregados = pedidosEntregados;
        }

        public long getTotalVisitas() { return totalVisitas; }
        public void setTotalVisitas(long totalVisitas) { this.totalVisitas = totalVisitas; }
        public long getVisitasDescarga() { return visitasDescarga; }
        public void setVisitasDescarga(long visitasDescarga) { this.visitasDescarga = visitasDescarga; }
        public long getDescargasApk() { return descargasApk; }
        public void setDescargasApk(long descargasApk) { this.descargasApk = descargasApk; }
        public long getPrimerasAperturasApp() { return primerasAperturasApp; }
        public void setPrimerasAperturasApp(long primerasAperturasApp) { this.primerasAperturasApp = primerasAperturasApp; }
        public long getRegistros() { return registros; }
        public void setRegistros(long registros) { this.registros = registros; }
        public long getPedidosCreados() { return pedidosCreados; }
        public void setPedidosCreados(long pedidosCreados) { this.pedidosCreados = pedidosCreados; }
        public long getPedidosEntregados() { return pedidosEntregados; }
        public void setPedidosEntregados(long pedidosEntregados) { this.pedidosEntregados = pedidosEntregados; }
    }

    public static class EmbudoPasoDTO {
        private String etapa;
        private long conteo;
        private double tasaPasoAnterior; // % respecto al paso anterior
        private double tasaGlobal;       // % respecto al primer paso

        public EmbudoPasoDTO() {}
        public EmbudoPasoDTO(String etapa, long conteo, double tasaPasoAnterior, double tasaGlobal) {
            this.etapa = etapa;
            this.conteo = conteo;
            this.tasaPasoAnterior = tasaPasoAnterior;
            this.tasaGlobal = tasaGlobal;
        }

        public String getEtapa() { return etapa; }
        public void setEtapa(String etapa) { this.etapa = etapa; }

        public long getConteo() { return conteo; }
        public void setConteo(long conteo) { this.conteo = conteo; }

        public long getCantidad() { return conteo; }
        public void setCantidad(long cantidad) { this.conteo = cantidad; }

        public double getTasaPasoAnterior() { return tasaPasoAnterior; }
        public void setTasaPasoAnterior(double tasaPasoAnterior) { this.tasaPasoAnterior = tasaPasoAnterior; }

        public double getTasaGlobal() { return tasaGlobal; }
        public void setTasaGlobal(double tasaGlobal) { this.tasaGlobal = tasaGlobal; }

        public double getTasaConversion() { return tasaGlobal; }
        public void setTasaConversion(double tasaConversion) { this.tasaGlobal = tasaConversion; }
    }

    public static class TendenciaDiariaDTO {
        private String fecha;
        private long visitas;
        private long descargas;
        private long primerasAperturas;
        private long registros;
        private long pedidos;

        public TendenciaDiariaDTO() {}

        public TendenciaDiariaDTO(String fecha, long visitas, long descargas, long primerasAperturas, long registros, long pedidos) {
            this.fecha = fecha;
            this.visitas = visitas;
            this.descargas = descargas;
            this.primerasAperturas = primerasAperturas;
            this.registros = registros;
            this.pedidos = pedidos;
        }

        public TendenciaDiariaDTO(String fecha, long visitas, long descargas, long registros, long pedidos) {
            this(fecha, visitas, descargas, 0L, registros, pedidos);
        }

        public String getFecha() { return fecha; }
        public void setFecha(String fecha) { this.fecha = fecha; }
        public long getVisitas() { return visitas; }
        public void setVisitas(long visitas) { this.visitas = visitas; }
        public long getDescargas() { return descargas; }
        public void setDescargas(long descargas) { this.descargas = descargas; }
        public long getPrimerasAperturas() { return primerasAperturas; }
        public void setPrimerasAperturas(long primerasAperturas) { this.primerasAperturas = primerasAperturas; }
        public long getRegistros() { return registros; }
        public void setRegistros(long registros) { this.registros = registros; }
        public long getPedidos() { return pedidos; }
        public void setPedidos(long pedidos) { this.pedidos = pedidos; }
    }

    public static class FuenteTraficoDTO {
        private String fuente;
        private long conteo;
        private double porcentaje;

        public FuenteTraficoDTO() {}
        public FuenteTraficoDTO(String fuente, long conteo, double porcentaje) {
            this.fuente = fuente;
            this.conteo = conteo;
            this.porcentaje = porcentaje;
        }
        public String getFuente() { return fuente; }
        public void setFuente(String fuente) { this.fuente = fuente; }

        public String getOrigen() { return fuente; }
        public void setOrigen(String origen) { this.fuente = origen; }

        public long getConteo() { return conteo; }
        public void setConteo(long conteo) { this.conteo = conteo; }

        public long getCantidad() { return conteo; }
        public void setCantidad(long cantidad) { this.conteo = cantidad; }

        public double getPorcentaje() { return porcentaje; }
        public void setPorcentaje(double porcentaje) { this.porcentaje = porcentaje; }
    }

    public long getVisitasTotales() { return visitasTotales; }
    public void setVisitasTotales(long visitasTotales) { this.visitasTotales = visitasTotales; }
    public long getDescargasIniciadas() { return descargasIniciadas; }
    public void setDescargasIniciadas(long descargasIniciadas) { this.descargasIniciadas = descargasIniciadas; }
    public long getDescargasCompletadas() { return descargasCompletadas; }
    public void setDescargasCompletadas(long descargasCompletadas) { this.descargasCompletadas = descargasCompletadas; }
    public long getAppPrimerasAperturas() { return appPrimerasAperturas; }
    public void setAppPrimerasAperturas(long appPrimerasAperturas) { this.appPrimerasAperturas = appPrimerasAperturas; }
    public long getRegistrosTotales() { return registrosTotales; }
    public void setRegistrosTotales(long registrosTotales) { this.registrosTotales = registrosTotales; }
    public long getPedidosCreados() { return pedidosCreados; }
    public void setPedidosCreados(long pedidosCreados) { this.pedidosCreados = pedidosCreados; }
    public long getPedidosEntregados() { return pedidosEntregados; }
    public void setPedidosEntregados(long pedidosEntregados) { this.pedidosEntregados = pedidosEntregados; }

    public String getPeriodo() { return periodo; }
    public void setPeriodo(String periodo) { this.periodo = periodo; }
    public String getFechaInicio() { return fechaInicio; }
    public void setFechaInicio(String fechaInicio) { this.fechaInicio = fechaInicio; }
    public String getFechaFin() { return fechaFin; }
    public void setFechaFin(String fechaFin) { this.fechaFin = fechaFin; }
    public String getZonaHoraria() { return zonaHoraria; }
    public void setZonaHoraria(String zonaHoraria) { this.zonaHoraria = zonaHoraria; }

    public ResumenDTO getResumen() { return resumen; }
    public void setResumen(ResumenDTO resumen) { this.resumen = resumen; }

    public List<EmbudoPasoDTO> getEmbudo() { return embudo; }
    public void setEmbudo(List<EmbudoPasoDTO> embudo) { this.embudo = embudo; }

    public List<TendenciaDiariaDTO> getTendencias() { return tendencias; }
    public void setTendencias(List<TendenciaDiariaDTO> tendencias) { this.tendencias = tendencias; }

    public List<FuenteTraficoDTO> getFuentes() { return fuentes; }
    public void setFuentes(List<FuenteTraficoDTO> fuentes) { this.fuentes = fuentes; }

    public List<FuenteTraficoDTO> getFuentesTrafico() { return fuentes; }
    public void setFuentesTrafico(List<FuenteTraficoDTO> fuentesTrafico) { this.fuentes = fuentesTrafico; }
}
