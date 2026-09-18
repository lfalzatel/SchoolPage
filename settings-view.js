// ============================================================
//  settings-view.js — Green Force Settings & Control Center
//  Vista de configuración modular en acordeón con modales y probador
// ============================================================

import {
  playSoundByProfile,
  playWatering,
  playHarvest,
  playLevelUp,
  playFanfare,
  playChime,
  speakVoiceConfirmation
} from './sound-effects.js';

import { showCelebrationOverlay } from './celebration-overlay.js';
import { auth } from './firebase-config.js';

// Inicializar preferencias por defecto en localStorage
export function initSettingsDefaults() {
  if (localStorage.getItem('gf_sound_enabled') === null) localStorage.setItem('gf_sound_enabled', 'true');
  if (localStorage.getItem('gf_anim_enabled') === null) localStorage.setItem('gf_anim_enabled', 'true');
  if (localStorage.getItem('gf_voice_enabled') === null) localStorage.setItem('gf_voice_enabled', 'true');
  if (localStorage.getItem('gf_voice_toggles_enabled') === null) localStorage.setItem('gf_voice_toggles_enabled', 'true');
  if (localStorage.getItem('gf_voice_gamification_enabled') === null) localStorage.setItem('gf_voice_gamification_enabled', 'true');
  if (localStorage.getItem('gf_sound_profile') === null) localStorage.setItem('gf_sound_profile', 'pop');
  if (localStorage.getItem('gf_theme') === null) localStorage.setItem('gf_theme', 'eco');

  // Aplicar tema en el elemento html
  const theme = localStorage.getItem('gf_theme') || 'eco';
  document.documentElement.setAttribute('data-theme', theme);
  document.body.setAttribute('data-theme', theme);

  // Mostrar modal de aviso inicial de sonido en primera visita
  checkFirstVisitAudioNotice();
}

// Modal informativo de primera visita sobre sonido activo
function checkFirstVisitAudioNotice() {
  if (localStorage.getItem('gf_audio_notice_shown')) return;

  setTimeout(() => {
    const modal = document.createElement('div');
    modal.className = 'gf-modal-overlay active';
    modal.innerHTML = `
      <div class="gf-modal-card">
        <h3 class="gf-modal-title">🔊 ¡Efectos de Sonido Activos!</h3>
        <p style="font-size:0.88rem; color:var(--text-light); margin: 8px 0 16px 0; line-height:1.4;">
          Los sonidos táctiles y de la huerta escolar están <strong>activados por defecto</strong> para enriquecer tu experiencia en Green Force.
        </p>
        <p style="font-size:0.82rem; color:var(--text-light); margin-bottom: 20px;">
          Puedes cambiarlos o desactivarlos en cualquier momento desde el menú de <strong>Configuración</strong>.
        </p>
        <button id="gfAudioNoticeOkBtn" class="gf-celebration-btn" style="width:100%; border-radius:14px; padding:12px;">
          ¡Entendido, continuar! 🌿
        </button>
      </div>
    `;
    document.body.appendChild(modal);

    document.getElementById('gfAudioNoticeOkBtn').addEventListener('click', () => {
      localStorage.setItem('gf_audio_notice_shown', 'true');
      modal.classList.remove('active');
      setTimeout(() => modal.remove(), 300);
      playSoundByProfile(localStorage.getItem('gf_sound_profile') || 'pop');
    });
  }, 1200);
}

// Renderizar Vista de Configuración
export function renderSettingsView(containerEl) {
  if (!containerEl) return;

  const currentUser = auth.currentUser;
  const userName = currentUser ? (currentUser.displayName || currentUser.email.split('@')[0]) : 'Invitado';
  const userEmail = currentUser ? currentUser.email : 'Sin iniciar sesión';
  const userPhoto = currentUser ? (currentUser.photoURL || 'assets/icons/icon-192.png') : 'assets/icons/icon-192.png';

  const soundEnabled = localStorage.getItem('gf_sound_enabled') !== 'false';
  const animEnabled = localStorage.getItem('gf_anim_enabled') !== 'false';
  const voiceEnabled = localStorage.getItem('gf_voice_enabled') !== 'false';
  const voiceToggles = localStorage.getItem('gf_voice_toggles_enabled') !== 'false';
  const voiceGamification = localStorage.getItem('gf_voice_gamification_enabled') !== 'false';
  const soundProfile = localStorage.getItem('gf_sound_profile') || 'pop';
  const currentTheme = localStorage.getItem('gf_theme') || 'eco';

  containerEl.innerHTML = `
    <div class="gf-settings-container">
      <div class="gf-settings-header">
        <i class="fas fa-sliders-h" style="font-size:1.5rem; color:var(--primary);"></i>
        <div>
          <h2 class="gf-settings-title">Centro de Control y Ajustes</h2>
          <p style="font-size:0.78rem; color:var(--text-light); margin:0;">Personaliza el sonido, los temas y las animaciones 3D de Green Force</p>
        </div>
      </div>

      <div class="gf-accordion">

        <!-- 1. CUENTA Y PERFIL -->
        <div class="gf-accordion-item active">
          <button class="gf-accordion-header" onclick="window.toggleGFSection(this)">
            <span><i class="fas fa-user-circle" style="color:#10b981; margin-right:8px;"></i> 1. Cuenta y Perfil</span>
            <i class="fas fa-chevron-down chevron-icon"></i>
          </button>
          <div class="gf-accordion-body">
            <div class="gf-setting-row" style="cursor:pointer;" id="gfProfileRow">
              <img src="${userPhoto}" style="width:40px; height:40px; border-radius:50%; object-fit:cover;" alt="Avatar">
              <div class="gf-setting-info">
                <p class="gf-setting-title">${userName}</p>
                <p class="gf-setting-subtitle">${userEmail}</p>
              </div>
              <span class="gf-badge">Ver Ficha</span>
            </div>
          </div>
        </div>

        <!-- 2. NOTIFICACIONES & ALERTAS -->
        <div class="gf-accordion-item">
          <button class="gf-accordion-header" onclick="window.toggleGFSection(this)">
            <span><i class="fas fa-bell" style="color:#3b82f6; margin-right:8px;"></i> 2. Notificaciones y Alertas</span>
            <i class="fas fa-chevron-down chevron-icon"></i>
          </button>
          <div class="gf-accordion-body">
            <div class="gf-setting-row">
              <div class="gf-setting-icon" style="background:rgba(59,130,246,0.15); color:#3b82f6;">
                <i class="fas fa-volume-up"></i>
              </div>
              <div class="gf-setting-info">
                <p class="gf-setting-title">Sonido Maestro de Sistema</p>
                <p class="gf-setting-subtitle">Activa o desactiva todos los efectos de audio</p>
              </div>
              <label class="gf-toggle">
                <input type="checkbox" id="gfSoundMasterToggle" ${soundEnabled ? 'checked' : ''}>
                <span class="gf-toggle-slider"></span>
              </label>
            </div>
          </div>
        </div>

        <!-- 3. SONIDOS DE INTERFAZ (WEB AUDIO) -->
        <div class="gf-accordion-item">
          <button class="gf-accordion-header" onclick="window.toggleGFSection(this)">
            <span><i class="fas fa-music" style="color:#8b5cf6; margin-right:8px;"></i> 3. Sonidos Táctiles (Web Audio)</span>
            <i class="fas fa-chevron-down chevron-icon"></i>
          </button>
          <div class="gf-accordion-body">
            <div class="gf-setting-row">
              <div class="gf-setting-icon" style="background:rgba(139,92,246,0.15); color:#8b5cf6;">
                <i class="fas fa-hand-pointer"></i>
              </div>
              <div class="gf-setting-info">
                <p class="gf-setting-title">Perfil de Micro-Sonido Táctil</p>
                <p class="gf-setting-subtitle">Respuesta sonora sintetizada al pulsar botones</p>
              </div>
              <div style="display:flex; align-items:center; gap:6px;">
                <select id="gfSoundProfileSelect" class="gf-select">
                  <option value="pop" ${soundProfile === 'pop' ? 'selected' : ''}>Pop (Suave)</option>
                  <option value="click" ${soundProfile === 'click' ? 'selected' : ''}>Click (Seco)</option>
                  <option value="chime" ${soundProfile === 'chime' ? 'selected' : ''}>Chime (Campana)</option>
                  <option value="arcade" ${soundProfile === 'arcade' ? 'selected' : ''}>Arcade (Retro)</option>
                  <option value="haptic" ${soundProfile === 'haptic' ? 'selected' : ''}>Háptico (Grave)</option>
                  <option value="silent" ${soundProfile === 'silent' ? 'selected' : ''}>Silencioso</option>
                </select>
                <button id="gfTestSoundProfileBtn" title="Preescuchar" style="padding:6px 10px; border-radius:10px; border:none; background:rgba(139,92,246,0.2); color:#8b5cf6; cursor:pointer;">
                  <i class="fas fa-play"></i>
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- 4. GAMIFICACIÓN Y EFECTOS 3D -->
        <div class="gf-accordion-item">
          <button class="gf-accordion-header" onclick="window.toggleGFSection(this)">
            <span><i class="fas fa-trophy" style="color:#f59e0b; margin-right:8px;"></i> 4. Gamificación & Probador 3D</span>
            <i class="fas fa-chevron-down chevron-icon"></i>
          </button>
          <div class="gf-accordion-body">
            <div class="gf-setting-row">
              <div class="gf-setting-icon" style="background:rgba(245,158,11,0.15); color:#f59e0b;">
                <i class="fas fa-sparkles"></i>
              </div>
              <div class="gf-setting-info">
                <p class="gf-setting-title">Animaciones 3D y Confeti</p>
                <p class="gf-setting-subtitle">Efectos visuales al subir de nivel o ganar logros</p>
              </div>
              <label class="gf-toggle">
                <input type="checkbox" id="gfAnimToggle" ${animEnabled ? 'checked' : ''}>
                <span class="gf-toggle-slider"></span>
              </label>
            </div>

            <div class="gf-setting-row">
              <div class="gf-setting-icon" style="background:rgba(236,72,153,0.15); color:#ec4899;">
                <i class="fas fa-comment-dots"></i>
              </div>
              <div class="gf-setting-info">
                <p class="gf-setting-title">Asistente de Voz (TTS)</p>
                <p class="gf-setting-subtitle">Lectura por voz sintetizada en español</p>
              </div>
              <label class="gf-toggle">
                <input type="checkbox" id="gfVoiceToggle" ${voiceEnabled ? 'checked' : ''}>
                <span class="gf-toggle-slider"></span>
              </label>
            </div>

            <div style="margin-top:14px; padding:12px; background:rgba(255,255,255,0.05); border-radius:14px; border:1px dashed rgba(255,255,255,0.15);">
              <p style="font-size:0.78rem; font-weight:700; margin:0 0 10px 0; color:#ffffff;">
                🧪 Probador de Experiencia Interactivo:
              </p>
              <div style="display:flex; flex-wrap:wrap; gap:8px;">
                <button id="gfTest5StarsBtn" class="gf-badge" style="cursor:pointer; border:1px solid rgba(245,158,11,0.4); background:rgba(245,158,11,0.2); color:#fbbf24;">
                  🏆 5 Estrellas
                </button>
                <button id="gfTestHarvestBtn" class="gf-badge" style="cursor:pointer; border:1px solid rgba(34,197,94,0.4); background:rgba(34,197,94,0.2); color:#4ade80;">
                  🌾 Cosecha Huerta
                </button>
                <button id="gfTestFanfareBtn" class="gf-badge" style="cursor:pointer; border:1px solid rgba(99,102,241,0.4); background:rgba(99,102,241,0.2); color:#a5b4fc;">
                  🎵 Fanfarria
                </button>
                <button id="gfTestTTSBtn" class="gf-badge" style="cursor:pointer; border:1px solid rgba(236,72,153,0.4); background:rgba(236,72,153,0.2); color:#f472b6;">
                  🗣️ Voz TTS
                </button>
                <button id="gfTestConfettiBtn" class="gf-badge" style="cursor:pointer; border:1px solid rgba(20,184,166,0.4); background:rgba(20,184,166,0.2); color:#2dd4bf;">
                  ✨ Confeti 3D
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- 5. GESTIÓN DE USUARIOS Y CIFRAS (ADMIN) -->
        <div class="gf-accordion-item">
          <button class="gf-accordion-header" onclick="window.toggleGFSection(this)">
            <span><i class="fas fa-users-cog" style="color:#ef4444; margin-right:8px;"></i> 5. Panel de Administración</span>
            <i class="fas fa-chevron-down chevron-icon"></i>
          </button>
          <div class="gf-accordion-body">
            <div class="gf-setting-row" style="cursor:pointer;" onclick="window.location.href='gestion_usuarios.html'">
              <div class="gf-setting-icon" style="background:rgba(239,68,68,0.15); color:#ef4444;">
                <i class="fas fa-user-shield"></i>
              </div>
              <div class="gf-setting-info">
                <p class="gf-setting-title">Administrar Roles y Usuarios</p>
                <p class="gf-setting-subtitle">Panel para cambiar permisos de docentes y estudiantes</p>
              </div>
              <i class="fas fa-chevron-right" style="color:rgba(255,255,255,0.6);"></i>
            </div>
            <div class="gf-setting-row" style="cursor:pointer;" onclick="window.openImpactModal && window.openImpactModal()">
              <div class="gf-setting-icon" style="background:rgba(16,185,129,0.15); color:#10b981;">
                <i class="fas fa-chart-line"></i>
              </div>
              <div class="gf-setting-info">
                <p class="gf-setting-title">Gestionar Impacto Ambiental</p>
                <p class="gf-setting-subtitle">Actualizar cifras de reciclaje, árboles plantados, agua y estudiantes</p>
              </div>
              <span class="gf-badge">Editar</span>
            </div>
          </div>
        </div>

        <!-- 6. APARIENCIA & TEMAS -->
        <div class="gf-accordion-item">
          <button class="gf-accordion-header" onclick="window.toggleGFSection(this)">
            <span><i class="fas fa-palette" style="color:#06b6d4; margin-right:8px;"></i> 6. Apariencia & Temas Visuales</span>
            <i class="fas fa-chevron-down chevron-icon"></i>
          </button>
          <div class="gf-accordion-body">
            <div class="gf-setting-row" style="cursor:pointer;" id="gfOpenThemeModalBtn">
              <div class="gf-setting-icon" style="background:rgba(6,182,212,0.15); color:#06b6d4;">
                <i class="fas fa-paint-brush"></i>
              </div>
              <div class="gf-setting-info">
                <p class="gf-setting-title">Seleccionar Tema Activo</p>
                <p class="gf-setting-subtitle">Actualmente: <strong id="gfCurrentThemeLabel" style="text-transform:capitalize;">${currentTheme}</strong></p>
              </div>
              <span class="gf-badge">Cambiar</span>
            </div>
          </div>
        </div>

        <!-- 7. INFORMACIÓN Y SOPORTE -->
        <div class="gf-accordion-item">
          <button class="gf-accordion-header" onclick="window.toggleGFSection(this)">
            <span><i class="fas fa-info-circle" style="color:#64748b; margin-right:8px;"></i> 7. Información y Soporte PWA</span>
            <i class="fas fa-chevron-down chevron-icon"></i>
          </button>
          <div class="gf-accordion-body">
            <div class="gf-setting-row" onclick="window.open('https://chat.whatsapp.com/L0hrcQ9JWmUB5DQui9ZrXv', '_blank')" style="cursor:pointer;">
              <div class="gf-setting-icon" style="background:rgba(34,197,94,0.15); color:#22c55e;">
                <i class="fab fa-whatsapp"></i>
              </div>
              <div class="gf-setting-info">
                <p class="gf-setting-title">Comunidad y Soporte WhatsApp</p>
                <p class="gf-setting-subtitle">Unirse al grupo oficial de Green Force</p>
              </div>
              <i class="fas fa-external-link-alt" style="color:var(--text-light); font-size:0.8rem;"></i>
            </div>
            <div class="gf-setting-row">
              <div class="gf-setting-icon" style="background:rgba(100,116,139,0.15); color:#64748b;">
                <i class="fas fa-code-branch"></i>
              </div>
              <div class="gf-setting-info">
                <p class="gf-setting-title">Versión de la Plataforma</p>
                <p class="gf-setting-subtitle">Green Force IE Barro Blanco</p>
              </div>
              <span class="gf-badge">v1.0.0</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  `;

  // Registrar Event Listeners de la Vista
  bindSettingsEvents();
}

// Alternar Secciones del Acordeón
if (typeof window !== 'undefined') {
  window.toggleGFSection = function(btnEl) {
    const item = btnEl.closest('.gf-accordion-item');
    if (!item) return;
    const isActive = item.classList.contains('active');
    item.classList.toggle('active', !isActive);
    playSoundByProfile(localStorage.getItem('gf_sound_profile') || 'pop');
  };
}

// Event Listeners de los Controles de Configuración
function bindSettingsEvents() {
  // Toggle Sonido Maestro
  const soundToggle = document.getElementById('gfSoundMasterToggle');
  if (soundToggle) {
    soundToggle.addEventListener('change', (e) => {
      localStorage.setItem('gf_sound_enabled', e.target.checked ? 'true' : 'false');
      if (e.target.checked) playChime();
    });
  }

  // Toggle Animaciones
  const animToggle = document.getElementById('gfAnimToggle');
  if (animToggle) {
    animToggle.addEventListener('change', (e) => {
      localStorage.setItem('gf_anim_enabled', e.target.checked ? 'true' : 'false');
    });
  }

  // Toggle Voz TTS
  const voiceToggle = document.getElementById('gfVoiceToggle');
  if (voiceToggle) {
    voiceToggle.addEventListener('change', (e) => {
      localStorage.setItem('gf_voice_enabled', e.target.checked ? 'true' : 'false');
      if (e.target.checked) speakVoiceConfirmation('Asistente de voz activado en Green Force', 'toggles');
    });
  }

  // Cambiar Perfil de Sonido
  const soundSelect = document.getElementById('gfSoundProfileSelect');
  if (soundSelect) {
    soundSelect.addEventListener('change', (e) => {
      localStorage.setItem('gf_sound_profile', e.target.value);
      playSoundByProfile(e.target.value);
    });
  }

  // Botón Preescuchar Sonido
  const testSoundBtn = document.getElementById('gfTestSoundProfileBtn');
  if (testSoundBtn) {
    testSoundBtn.addEventListener('click', () => {
      const profile = localStorage.getItem('gf_sound_profile') || 'pop';
      playSoundByProfile(profile);
    });
  }

  // Botones del Probador Interactivo
  document.getElementById('gfTest5StarsBtn')?.addEventListener('click', () => {
    showCelebrationOverlay({
      title: '🏆 ¡5 Estrellas Obtenidas!',
      subtitle: 'Completaste con éxito la jornada de siembra',
      statusText: '🟢 +250 Puntos Verdes',
      iconClass: 'fa-star',
      sound: 'fanfare'
    });
  });

  document.getElementById('gfTestHarvestBtn')?.addEventListener('click', () => {
    playHarvest();
    showCelebrationOverlay({
      title: '🌾 ¡Cosecha Exitosa!',
      subtitle: 'Recolectaste hortalizas orgánicas de la Huerta',
      statusText: '🟢 +150 Puntos Verdes',
      iconClass: 'fa-seedling',
      sound: 'levelup'
    });
  });

  document.getElementById('gfTestFanfareBtn')?.addEventListener('click', () => {
    playFanfare();
  });

  document.getElementById('gfTestTTSBtn')?.addEventListener('click', () => {
    speakVoiceConfirmation('Prueba del asistente de voz de Green Force. ¡Todo funcionando perfectamente!', 'gamification');
  });

  document.getElementById('gfTestConfettiBtn')?.addEventListener('click', () => {
    showCelebrationOverlay({
      title: '✨ Lluvia de Celebración 3D',
      subtitle: 'Probando partículas de confeti y hojas animadas',
      statusText: '🟢 Simulación de Logro',
      iconClass: 'fa-sparkles',
      sound: 'fanfare'
    });
  });

  // Abrir Modal de Temas
  document.getElementById('gfOpenThemeModalBtn')?.addEventListener('click', openThemeModal);

  // Abrir Modal de Perfil
  document.getElementById('gfProfileRow')?.addEventListener('click', openProfileModal);
}

// ── MODAL DE TEMAS VISUALES ──────────────────────────────────────────────────
export function openThemeModal() {
  const currentTheme = localStorage.getItem('gf_theme') || 'eco';
  const themes = [
    { id: 'eco', label: 'Modo Eco (Día)', icon: '🌲', color: '#15803d' },
    { id: 'noche', label: 'Huerta Nocturna', icon: '🌙', color: '#052e16' },
    { id: 'sol', label: 'Sol Radiante', icon: '☀️', color: '#d97706' },
    { id: 'glass', label: 'Glassmorphic', icon: '💎', color: '#10b981' },
    { id: 'cyber', label: 'Cyber Ambiental', icon: '⚡', color: '#00f0ff' }
  ];

  const modal = document.createElement('div');
  modal.className = 'gf-modal-overlay active';
  modal.innerHTML = `
    <div class="gf-modal-card">
      <h3 class="gf-modal-title"><i class="fas fa-palette" style="color:var(--primary);"></i> Seleccionar Tema Visual</h3>
      <p style="font-size:0.82rem; color:var(--text-light); margin-bottom:12px;">Elige el tema de interfaz que prefieras:</p>
      
      <div class="gf-theme-grid">
        ${themes.map(t => `
          <div class="gf-theme-option ${currentTheme === t.id ? 'selected' : ''}" data-theme-id="${t.id}">
            <span style="font-size:1.8rem;">${t.icon}</span>
            <span>${t.label}</span>
          </div>
        `).join('')}
      </div>

      <button id="gfCloseThemeModalBtn" class="gf-celebration-btn" style="width:100%; border-radius:14px; margin-top:10px;">
        Guardar Tema 🌿
      </button>
    </div>
  `;
  document.body.appendChild(modal);

  modal.querySelectorAll('.gf-theme-option').forEach(opt => {
    opt.addEventListener('click', () => {
      modal.querySelectorAll('.gf-theme-option').forEach(o => o.classList.remove('selected'));
      opt.classList.add('selected');
      const themeId = opt.getAttribute('data-theme-id');
      document.documentElement.setAttribute('data-theme', themeId);
      document.body.setAttribute('data-theme', themeId);
      localStorage.setItem('gf_theme', themeId);
      playSoundByProfile(localStorage.getItem('gf_sound_profile') || 'pop');
    });
  });

  document.getElementById('gfCloseThemeModalBtn').addEventListener('click', () => {
    modal.classList.remove('active');
    setTimeout(() => modal.remove(), 300);
    const label = document.getElementById('gfCurrentThemeLabel');
    if (label) label.textContent = localStorage.getItem('gf_theme');
  });
}

// ── MODAL DE FICHA DE PERFIL DE USUARIO ──────────────────────────────────────
export function openProfileModal() {
  const currentUser = auth.currentUser;
  const userName = currentUser ? (currentUser.displayName || currentUser.email.split('@')[0]) : 'Invitado';
  const userEmail = currentUser ? currentUser.email : 'Sin iniciar sesión';
  const userPhoto = currentUser ? (currentUser.photoURL || 'assets/icons/icon-192.png') : 'assets/icons/icon-192.png';

  const modal = document.createElement('div');
  modal.className = 'gf-modal-overlay active';
  modal.innerHTML = `
    <div class="gf-modal-card" style="text-align:center;">
      <img src="${userPhoto}" style="width:80px; height:80px; border-radius:50%; margin:0 auto 12px auto; object-fit:cover; border:3px solid var(--primary);" alt="User Photo">
      <h3 style="font-size:1.2rem; font-weight:700; margin:0; color:#ffffff;">${userName}</h3>
      <p style="font-size:0.85rem; color:rgba(255,255,255,0.7); margin:4px 0 16px 0;">${userEmail}</p>

      <div style="background:rgba(255,255,255,0.06); padding:12px; border-radius:16px; border:1px solid rgba(255,255,255,0.1); margin-bottom:20px; text-align:left; color:#f3f4f6;">
        <p style="font-size:0.8rem; margin:4px 0;"><strong>Institución:</strong> IE Barro Blanco</p>
        <p style="font-size:0.8rem; margin:4px 0;"><strong>Proyecto:</strong> Ambiental Green Force</p>
        <p style="font-size:0.8rem; margin:4px 0;"><strong>Rol Activo:</strong> Estudiante / Miembro Ambiental</p>
      </div>

      <button id="gfCloseProfileModalBtn" class="gf-celebration-btn" style="width:100%; border-radius:14px;">
        Cerrar Ficha 🌿
      </button>
    </div>
  `;
  document.body.appendChild(modal);

  document.getElementById('gfCloseProfileModalBtn').addEventListener('click', () => {
    modal.classList.remove('active');
    setTimeout(() => modal.remove(), 300);
  });
}
