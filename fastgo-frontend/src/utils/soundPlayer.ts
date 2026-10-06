// ==============================================================================
// FASTGO - REPRODUCTOR NATIVO DE ALERTAS SONORAS (WEB AUDIO API)
// Cero dependencias externas de archivos MP3. 100% confiable y autónomo.
// ==============================================================================

class SoundPlayer {
  private ctx: AudioContext | null = null;

  private getAudioContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  /**
   * Chime armónico y agradable para nuevos pedidos de comercio.
   * Acorde ascendente C5 (523Hz) -> G5 (784Hz) -> C6 (1046Hz)
   */
  public playOrderAlertSound() {
    try {
      const ctx = this.getAudioContext();
      if (!ctx) return;

      const now = ctx.currentTime;
      const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
      const noteDuration = 0.12;

      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * noteDuration);

        // Envolvente suave: ataque rápido, decaimiento orgánico
        gain.gain.setValueAtTime(0.001, now + idx * noteDuration);
        gain.gain.exponentialRampToValueAtTime(0.25, now + idx * noteDuration + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, now + (idx + 1) * noteDuration + 0.1);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + idx * noteDuration);
        osc.stop(now + (idx + 1) * noteDuration + 0.15);
      });
    } catch (e) {
      console.warn('AudioContext no disponible o bloqueado:', e);
    }
  }

  /**
   * Alerta viva y clara para domicilios disponibles listos para entrega.
   * Dos tonos rítmicos: E5 (659Hz) -> A5 (880Hz)
   */
  public playDeliveryAlertSound() {
    try {
      const ctx = this.getAudioContext();
      if (!ctx) return;

      const now = ctx.currentTime;
      const notes = [659.25, 880.0];
      const noteDuration = 0.14;

      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + idx * noteDuration);

        gain.gain.setValueAtTime(0.001, now + idx * noteDuration);
        gain.gain.exponentialRampToValueAtTime(0.28, now + idx * noteDuration + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, now + (idx + 1) * noteDuration + 0.12);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + idx * noteDuration);
        osc.stop(now + (idx + 1) * noteDuration + 0.15);
      });
    } catch (e) {
      console.warn('AudioContext no disponible o bloqueado:', e);
    }
  }
}

export const soundPlayer = new SoundPlayer();
