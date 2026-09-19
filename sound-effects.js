// ============================================================
//  sound-effects.js — Green Force Web Audio & Speech API
//  Sintetización de audio en tiempo real con Normalizador y Compresor
// ============================================================

let audioCtx = null;
let masterGain = null;
let compressor = null;
let lastSoundTime = 0;

// Obtener o crear contexto de audio con DynamicsCompressor y MasterGain
export function getAudioContext() {
  if (typeof window === 'undefined') return null;
  if (localStorage.getItem('gf_sound_enabled') === 'false') return null;

  if (!audioCtx) {
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) return null;
    audioCtx = new Ctx();

    // Compresor de dinámica para normalizar el volumen y evitar distorsión o picos
    compressor = audioCtx.createDynamicsCompressor();
    compressor.threshold.setValueAtTime(-24, audioCtx.currentTime);
    compressor.knee.setValueAtTime(30, audioCtx.currentTime);
    compressor.ratio.setValueAtTime(12, audioCtx.currentTime);
    compressor.attack.setValueAtTime(0.003, audioCtx.currentTime);
    compressor.release.setValueAtTime(0.25, audioCtx.currentTime);

    // Ganancia Maestra
    masterGain = audioCtx.createGain();
    masterGain.gain.setValueAtTime(0.5, audioCtx.currentTime);

    masterGain.connect(compressor);
    compressor.connect(audioCtx.destination);
  }

  if (audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {});
  }

  return audioCtx;
}

// Reproducir un tono individual con rampa de ataque/decaimiento suave (sin clics/DC offset)
export function playTone(freqStart, freqEnd, duration, type = 'sine', gainPeak = 0.15) {
  const ctx = getAudioContext();
  if (!ctx || !masterGain) return;

  try {
    const now = ctx.currentTime;
    const attackTime = 0.005; // 5ms rampa de entrada suave

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = type;
    const safeStartFreq = Math.max(20, freqStart);
    const safeEndFreq = Math.max(20, freqEnd);

    osc.frequency.setValueAtTime(safeStartFreq, now);
    if (safeStartFreq !== safeEndFreq) {
      osc.frequency.exponentialRampToValueAtTime(safeEndFreq, now + duration);
    }

    // Ataque suave: de 0.0001 a gainPeak en 5ms
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(Math.max(0.001, gainPeak), now + attackTime);
    // Decaimiento suave: de gainPeak a 0.0001 al terminar
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    osc.connect(gain);
    gain.connect(masterGain);

    osc.start(now);
    osc.stop(now + duration + 0.01);
  } catch (e) {
    console.warn('[SoundEffects] Error al reproducir tono:', e);
  }
}

// Reproducir secuencia de notas suavemente
export function playSequence(notes, type = 'triangle', gainPeak = 0.15) {
  const ctx = getAudioContext();
  if (!ctx || !masterGain) return;

  try {
    const now = ctx.currentTime;
    const attackTime = 0.005;

    notes.forEach(({ freq, duration, delay }) => {
      const startAt = now + delay;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(Math.max(20, freq), startAt);

      gain.gain.setValueAtTime(0.0001, startAt);
      gain.gain.exponentialRampToValueAtTime(Math.max(0.001, gainPeak), startAt + attackTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, startAt + duration);

      osc.connect(gain);
      gain.connect(masterGain);

      osc.start(startAt);
      osc.stop(startAt + duration + 0.01);
    });
  } catch (e) {
    console.warn('[SoundEffects] Error al reproducir secuencia:', e);
  }
}

// ── MICRO-SONIDOS TÁCTILES ──────────────────────────────────────────────────

export function playPop() {
  playTone(440, 880, 0.07, 'sine', 0.14);
}

export function playClick() {
  playTone(700, 300, 0.04, 'square', 0.07);
}

export function playChime() {
  playSequence([
    { freq: 523.25, duration: 0.09, delay: 0 },
    { freq: 659.25, duration: 0.09, delay: 0.07 },
    { freq: 783.99, duration: 0.16, delay: 0.14 }
  ], 'sine', 0.12);
}

export function playArcade() {
  playSequence([
    { freq: 300, duration: 0.04, delay: 0 },
    { freq: 450, duration: 0.04, delay: 0.04 },
    { freq: 600, duration: 0.04, delay: 0.08 },
    { freq: 900, duration: 0.1, delay: 0.12 }
  ], 'square', 0.08);
}

export function playHaptic() {
  playTone(160, 90, 0.05, 'triangle', 0.18);
}

// ── SONIDOS DE LA HUERTA ESCOLAR & GAMIFICACIÓN ──────────────────────────

export function playWatering() {
  playTone(300, 500, 0.08, 'sine', 0.12);
  setTimeout(() => playTone(350, 550, 0.08, 'sine', 0.1), 90);
}

export function playFertilizing() {
  playSequence([
    { freq: 220, duration: 0.07, delay: 0 },
    { freq: 330, duration: 0.07, delay: 0.06 },
    { freq: 440, duration: 0.09, delay: 0.12 }
  ], 'sawtooth', 0.08);
}

export function playHarvest() {
  playSequence([
    { freq: 523.25, duration: 0.07, delay: 0 },
    { freq: 659.25, duration: 0.07, delay: 0.06 },
    { freq: 783.99, duration: 0.07, delay: 0.12 },
    { freq: 1046.50, duration: 0.18, delay: 0.18 }
  ], 'triangle', 0.14);
}

export function playLevelUp() {
  playSequence([
    { freq: 440, duration: 0.08, delay: 0 },
    { freq: 554.37, duration: 0.08, delay: 0.08 },
    { freq: 659.25, duration: 0.08, delay: 0.16 },
    { freq: 880, duration: 0.25, delay: 0.24 }
  ], 'sine', 0.16);
}

export function playFanfare() {
  playSequence([
    { freq: 523.25, duration: 0.1, delay: 0 },
    { freq: 523.25, duration: 0.1, delay: 0.11 },
    { freq: 523.25, duration: 0.1, delay: 0.22 },
    { freq: 659.25, duration: 0.22, delay: 0.33 },
    { freq: 783.99, duration: 0.1, delay: 0.55 },
    { freq: 1046.50, duration: 0.35, delay: 0.66 }
  ], 'triangle', 0.16);
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

// ── AUTOPLAY & ESCUCHADOR GLOBAL CON COOLDOWN (DEBOUNCE) ─────────────────────
if (typeof window !== 'undefined') {
  const unlockAudio = () => {
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume().catch(() => {});
    }
  };
  window.addEventListener('click', unlockAudio, { once: true });
  window.addEventListener('pointerdown', unlockAudio, { once: true });

  document.addEventListener('click', (e) => {
    if (localStorage.getItem('gf_sound_enabled') === 'false') return;

    const now = Date.now();
    // Cooldown de 60ms para prevenir doble disparo simultáneo o interferencia de fases
    if (now - lastSoundTime < 60) return;

    const profile = localStorage.getItem('gf_sound_profile') || 'pop';
    if (profile === 'silent') return;

    const target = e.target.closest('button, a, select, input, [role="button"], .nav-item, .menu-item, .year-pill, .gf-accordion-header, .gf-setting-row, .gf-badge, .btn');
    if (target && !target.hasAttribute('data-no-sound')) {
      lastSoundTime = now;
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
