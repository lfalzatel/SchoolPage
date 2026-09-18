// ============================================================
//  celebration-overlay.js — Green Force Celebration & 3D Confetti
//  Overlay de celebración desacoplado por eventos (greenforce:celebrate)
// ============================================================

import { playFanfare, playLevelUp, speakVoiceConfirmation } from './sound-effects.js';

let overlayContainer = null;

function createOverlayDOM() {
  if (document.getElementById('gf-celebration-overlay')) return;

  const overlay = document.createElement('div');
  overlay.id = 'gf-celebration-overlay';
  overlay.className = 'gf-celebration-overlay hidden';
  overlay.innerHTML = `
    <div class="gf-celebration-backdrop" id="gfCelebrationBackdrop"></div>
    <div class="gf-celebration-content">
      <div class="gf-sunbeams"></div>
      <div class="gf-badge-3d-wrapper">
        <div class="gf-badge-3d" id="gfBadge3D">
          <i class="fas fa-trophy" id="gfCelebrationIcon"></i>
        </div>
      </div>
      <h2 class="gf-celebration-title" id="gfCelebrationTitle">¡Excelente Trabajo!</h2>
      <p class="gf-celebration-subtitle" id="gfCelebrationSubtitle">Has completado una misión ambiental en Green Force</p>
      <div class="gf-celebration-status" id="gfCelebrationStatus">🟢 +100 Puntos Verdes</div>
      <button class="gf-celebration-btn" id="gfCelebrationCloseBtn">Continuar 🌿</button>
    </div>
    <div class="gf-particles-container" id="gfParticlesContainer"></div>
  `;
  document.body.appendChild(overlay);

  document.getElementById('gfCelebrationBackdrop').addEventListener('click', hideCelebrationOverlay);
  document.getElementById('gfCelebrationCloseBtn').addEventListener('click', hideCelebrationOverlay);

  overlayContainer = overlay;
}

export function showCelebrationOverlay({
  title = '¡Excelente Trabajo!',
  subtitle = 'Has completado una acción ambiental',
  statusText = '🟢 Puntos Verdes Otorgados',
  iconClass = 'fa-trophy',
  sound = 'fanfare',
  speak = true
} = {}) {
  createOverlayDOM();

  const overlay = document.getElementById('gf-celebration-overlay');
  const titleEl = document.getElementById('gfCelebrationTitle');
  const subEl = document.getElementById('gfCelebrationSubtitle');
  const statEl = document.getElementById('gfCelebrationStatus');
  const iconEl = document.getElementById('gfCelebrationIcon');
  const particlesContainer = document.getElementById('gfParticlesContainer');

  if (titleEl) titleEl.textContent = title;
  if (subEl) subEl.textContent = subtitle;
  if (statEl) statEl.textContent = statusText;
  if (iconEl) iconEl.className = `fas ${iconClass}`;

  // Generar partículas animadas (confetti y hojas verdes)
  particlesContainer.innerHTML = '';
  const colors = ['#22c55e', '#10b981', '#fbbf24', '#3b82f6', '#ec4899', '#8b5cf6'];
  const totalParticles = 42;

  for (let i = 0; i < totalParticles; i++) {
    const p = document.createElement('div');
    p.className = 'gf-particle';
    const isLeaf = i % 3 === 0;
    p.style.backgroundColor = isLeaf ? 'transparent' : colors[i % colors.length];
    if (isLeaf) {
      p.innerHTML = '🍃';
      p.style.fontSize = `${Math.random() * 12 + 12}px`;
    }
    p.style.left = `${Math.random() * 100}%`;
    p.style.animationDuration = `${Math.random() * 2 + 1.8}s`;
    p.style.animationDelay = `${Math.random() * 0.5}s`;
    p.style.width = isLeaf ? 'auto' : `${Math.random() * 8 + 6}px`;
    p.style.height = isLeaf ? 'auto' : `${Math.random() * 14 + 10}px`;
    particlesContainer.appendChild(p);
  }

  overlay.classList.remove('hidden');
  overlay.classList.add('active');

  // Sonido
  if (sound === 'fanfare') playFanfare();
  else if (sound === 'levelup') playLevelUp();

  // Voz
  if (speak && title) {
    speakVoiceConfirmation(`${title}. ${subtitle}`, 'gamification');
  }
}

export function hideCelebrationOverlay() {
  const overlay = document.getElementById('gf-celebration-overlay');
  if (overlay) {
    overlay.classList.remove('active');
    setTimeout(() => overlay.classList.add('hidden'), 300);
  }
}

if (typeof window !== 'undefined') {
  // Escuchar eventos globales `greenforce:celebrate`
  window.addEventListener('greenforce:celebrate', (e) => {
    if (localStorage.getItem('gf_anim_enabled') === 'false') return;
    showCelebrationOverlay(e.detail || {});
  });

  window.GFCelebration = {
    show: showCelebrationOverlay,
    hide: hideCelebrationOverlay
  };
}
