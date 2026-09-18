// ============================================================
//  sound-effects.js — Green Force Web Audio & Speech API
//  Sintetización de audio en tiempo real sin archivos pesados MP3
// ============================================================

let audioCtx = null;

// Obtener o crear contexto de audio
export function getAudioContext() {
  if (typeof window === 'undefined') return null;
  if (localStorage.getItem('gf_sound_enabled') === 'false') return null;

  if (!audioCtx) {
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) return null;
    audioCtx = new Ctx();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
}

// Reproducir un tono individual con rampa de frecuencia y ganancia
export function playTone(freqStart, freqEnd, duration, type = 'sine', gainPeak = 0.15) {
  const ctx = getAudioContext();
  if (!ctx) return;
  try {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freqStart, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(Math.max(1, freqEnd), ctx.currentTime + duration);
    gain.gain.setValueAtTime(gainPeak, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + duration);
  } catch (e) {
    console.warn('[SoundEffects] Error al reproducir tono:', e);
  }
}

// Reproducir secuencia de notas
export function playSequence(notes, type = 'triangle', gainPeak = 0.15) {
  const ctx = getAudioContext();
  if (!ctx) return;
  try {
    notes.forEach(({ freq, duration, delay }) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, ctx.currentTime + delay);
      gain.gain.setValueAtTime(gainPeak, ctx.currentTime + delay);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + delay + duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(ctx.currentTime + delay);
      osc.stop(ctx.currentTime + delay + duration);
    });
  } catch (e) {
    console.warn('[SoundEffects] Error al reproducir secuencia:', e);
  }
}

// ── MICRO-SONIDOS TÁCTILES ──────────────────────────────────────────────────

export function playPop() {
  playTone(440, 880, 0.08, 'sine', 0.15);
}

export function playClick() {
  playTone(800, 300, 0.04, 'square', 0.08);
}

export function playChime() {
  playSequence([
    { freq: 523.25, duration: 0.1, delay: 0 },
    { freq: 659.25, duration: 0.1, delay: 0.08 },
    { freq: 783.99, duration: 0.18, delay: 0.16 }
  ], 'sine', 0.12);
}

export function playArcade() {
  playSequence([
    { freq: 300, duration: 0.05, delay: 0 },
    { freq: 450, duration: 0.05, delay: 0.05 },
    { freq: 600, duration: 0.05, delay: 0.1 },
    { freq: 900, duration: 0.12, delay: 0.15 }
  ], 'square', 0.1);
}

export function playHaptic() {
  playTone(150, 80, 0.05, 'triangle', 0.2);
}

// ── SONIDOS DE LA HUERTA ESCOLAR & GAMIFICACIÓN ──────────────────────────

export function playWatering() {
  playTone(300, 500, 0.09, 'sine', 0.12);
  setTimeout(() => playTone(350, 550, 0.09, 'sine', 0.1), 100);
}

export function playFertilizing() {
  playSequence([
    { freq: 220, duration: 0.08, delay: 0 },
    { freq: 330, duration: 0.08, delay: 0.07 },
    { freq: 440, duration: 0.1, delay: 0.14 }
  ], 'sawtooth', 0.08);
}

export function playHarvest() {
  playSequence([
    { freq: 523.25, duration: 0.08, delay: 0 },
    { freq: 659.25, duration: 0.08, delay: 0.07 },
    { freq: 783.99, duration: 0.08, delay: 0.14 },
    { freq: 1046.50, duration: 0.2, delay: 0.21 }
  ], 'triangle', 0.15);
}

export function playLevelUp() {
  playSequence([
    { freq: 440, duration: 0.09, delay: 0 },
    { freq: 554.37, duration: 0.09, delay: 0.09 },
    { freq: 659.25, duration: 0.09, delay: 0.18 },
    { freq: 880, duration: 0.3, delay: 0.27 }
  ], 'sine', 0.18);
}

export function playFanfare() {
  playSequence([
    { freq: 523.25, duration: 0.12, delay: 0 },
    { freq: 523.25, duration: 0.12, delay: 0.13 },
    { freq: 523.25, duration: 0.12, delay: 0.26 },
    { freq: 659.25, duration: 0.25, delay: 0.39 },
    { freq: 783.99, duration: 0.12, delay: 0.65 },
    { freq: 1046.50, duration: 0.4, delay: 0.78 }
  ], 'triangle', 0.18);
}

export function playSoundByProfile(profileId) {
  switch (profileId) {
    case 'pop': playPop(); break;
    case 'click': playClick(); break;
    case 'chime': playChime(); break;
    case 'arcade': playArcade(); break;
    case 'haptic': playHaptic(); break;
    case 'silent': break;
    default: playPop(); break;
  }
}

// ── ASISTENTE DE VOZ (WEB SPEECH API) ──────────────────────────────────────

export function speakVoiceConfirmation(text, category = 'gamification') {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
  if (localStorage.getItem('gf_sound_enabled') === 'false') return;
  if (localStorage.getItem('gf_voice_enabled') === 'false') return;

  if (category === 'toggles' && localStorage.getItem('gf_voice_toggles_enabled') === 'false') return;
  if (category === 'gamification' && localStorage.getItem('gf_voice_gamification_enabled') === 'false') return;

  try {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text.replace(/Green Force/gi, 'Green Force'));
    utterance.lang = 'es-CO';
    utterance.rate = 1.05;
    utterance.pitch = 1.15;
    window.speechSynthesis.speak(utterance);
  } catch (e) {
    console.warn('[SpeechSynthesis] Error:', e);
  }
}

// ── AUTOPLAY & ESCUCHADOR GLOBAL DE CLICS DE BOTONES ─────────────────────
if (typeof window !== 'undefined') {
  // Desbloquear AudioContext en la primera interacción táctil/clic
  const unlockAudio = () => {
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume().catch(() => {});
    }
  };
  window.addEventListener('click', unlockAudio, { once: true });
  window.addEventListener('pointerdown', unlockAudio, { once: true });

  // Escuchador global para reproducir sonido táctil en TODOS los botones y elementos interactivos
  document.addEventListener('click', (e) => {
    if (localStorage.getItem('gf_sound_enabled') === 'false') return;

    const profile = localStorage.getItem('gf_sound_profile') || 'pop';
    if (profile === 'silent') return;

    const target = e.target.closest('button, a, select, input, [role="button"], .nav-item, .menu-item, .year-pill, .gf-accordion-header, .gf-setting-row, .gf-badge, .btn');
    if (target && !target.hasAttribute('data-no-sound')) {
      playSoundByProfile(profile);
    }
  }, { capture: true });

  window.GFSound = {
    playPop,
    playClick,
    playChime,
    playArcade,
    playHaptic,
    playWatering,
    playFertilizing,
    playHarvest,
    playLevelUp,
    playFanfare,
    playSoundByProfile,
    speakVoiceConfirmation
  };
}
