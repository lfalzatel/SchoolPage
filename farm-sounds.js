// ══════════════════════════════════════════════════════════════════════════
//  Green Force — Módulo Huerta Escolar
//  farm-sounds.js — Audio Sintetizado con Web Audio API (Cero Archivos Audio)
// ══════════════════════════════════════════════════════════════════════════

let audioCtx = null;

function getAudioContext() {
  if (typeof window === 'undefined') return null;
  if (localStorage.getItem('hh_sound_enabled') === 'false') return null;
  
  if (!audioCtx) {
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) return null;
    audioCtx = new Ctx();
  }
  
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

function tone(freqStart, freqEnd, duration, type = 'sine', gainPeak = 0.15) {
  const ctx = getAudioContext();
  if (!ctx) return;
  try {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freqStart, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(freqEnd, ctx.currentTime + duration);
    gain.gain.setValueAtTime(gainPeak, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + duration);
  } catch (e) {
    console.warn("Error generando tono sintetizado:", e);
  }
}

function sequence(notes, type = 'triangle') {
  const ctx = getAudioContext();
  if (!ctx) return;
  try {
    notes.forEach(({ freq, duration, delay }) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, ctx.currentTime + delay);
      gain.gain.setValueAtTime(0.18, ctx.currentTime + delay);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(ctx.currentTime + delay);
      osc.stop(ctx.currentTime + delay + duration);
    });
  } catch (e) {
    console.warn("Error generando secuencia sintetizada:", e);
  }
}

// ──────────────────────────────────────────────────────────────
//  ACCIONES Y EVENTOS DEL JUEGO DE HUERTA
// ──────────────────────────────────────────────────────────────

export function playWatering() {
  // Dos pulsos ascendentes cortos, tipo "goteo"
  tone(300, 500, 0.09, 'sine', 0.12);
  setTimeout(() => tone(300, 500, 0.09, 'sine', 0.1), 110);
}

export function playFertilizing() {
  // Tono cálido de nutriente orgánico
  tone(180, 220, 0.15, 'sine', 0.14);
}

export function playHarvest() {
  // Arpegio ascendente Do-Mi-Sol (C5, E5, G5)
  sequence([
    { freq: 523.25, duration: 0.14, delay: 0 },
    { freq: 659.25, duration: 0.14, delay: 0.1 },
    { freq: 783.99, duration: 0.20, delay: 0.2 },
  ]);
}

export function playUnlockPlot() {
  // Fanfarria alegre de 4 notas de logro (Do-Mi-Sol-Do8)
  sequence([
    { freq: 523.25, duration: 0.12, delay: 0 },
    { freq: 659.25, duration: 0.12, delay: 0.1 },
    { freq: 783.99, duration: 0.12, delay: 0.2 },
    { freq: 1046.50, duration: 0.28, delay: 0.3 },
  ]);
}

export function playActionBlocked() {
  // Tono corto y seco: "esta acción aún no se puede realizar"
  tone(220, 180, 0.12, 'square', 0.08);
}

export function playClickSound() {
  // Tono suave de toque tipo madera/UI
  tone(600, 800, 0.05, 'triangle', 0.1);
}

export function playBuildingEnterSound() {
  // Arpegio mágico de ingreso a edificio estilo Top Heroes (Do-Sol-Mi-Do5)
  sequence([
    { freq: 440, duration: 0.08, delay: 0 },
    { freq: 554.37, duration: 0.08, delay: 0.06 },
    { freq: 659.25, duration: 0.1, delay: 0.12 },
    { freq: 880, duration: 0.18, delay: 0.18 }
  ]);
}

export function playAmbientChirp() {
  // Sonido ambiental muy tenue de ave o naturaleza
  if (localStorage.getItem('hh_ambient_animals_enabled') === 'false') return;
  tone(1200, 1600, 0.08, 'sine', 0.03);
}

