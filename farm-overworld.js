// ══════════════════════════════════════════════════════════════════════════
//  Green Force — Módulo Huerta Escolar
//  farm-overworld.js — Mapa Isométrico Principal (Overworld tipo Top Heroes)
// ══════════════════════════════════════════════════════════════════════════

import { playAmbientChirp, playActionBlocked } from "./farm-sounds.js";

let onSelectZoneCallback = null;

export function renderOverworldMap(container, { schoolCrops = [], personalCrops = [], user, role, onSelectZone }) {
  onSelectZoneCallback = onSelectZone;
  if (!container) return;

  const nowMs = Date.now();
  const schoolPendingCount = schoolCrops.filter(c => {
    if (c.status === 'cosechado' || c.status === 'perdido') return false;
    const isWater = c.nextWateringDue && c.nextWateringDue.toMillis() <= nowMs + (12 * 3600 * 1000);
    const isFert = c.nextFertilizingDue && c.nextFertilizingDue.toMillis() <= nowMs + (12 * 3600 * 1000);
    const isReady = c.status === 'listo_para_cosecha';
    return isWater || isFert || isReady;
  }).length;

  const personalPendingCount = personalCrops.filter(c => {
    if (c.status === 'cosechado' || c.status === 'perdido') return false;
    const isWater = c.nextWateringDue && c.nextWateringDue.toMillis() <= nowMs + (12 * 3600 * 1000);
    const isFert = c.nextFertilizingDue && c.nextFertilizingDue.toMillis() <= nowMs + (12 * 3600 * 1000);
    const isReady = c.status === 'listo_para_cosecha';
    return isWater || isFert || isReady;
  }).length;

  container.innerHTML = `
    <div class="overworld-wrapper">
      <div class="overworld-sky">
        <div class="overworld-cloud cloud-1">☁️</div>
        <div class="overworld-cloud cloud-2">☁️</div>
        <div class="overworld-sun">☀️</div>
      </div>

      <div class="overworld-banner">
        <span>🗺️ Mapa del Territorio Green Force</span>
        <small>Toca un edificio o zona verde para ingresar a cultivar</small>
      </div>

      <div class="overworld-map-grid">
        <!-- ZONA 1: ESCUELA IE BARRO BLANCO + HUERTA ESCOLAR -->
        <div class="overworld-building-card school-zone" onclick="window.enterOverworldZone('colegio')">
          <div class="building-sprite-wrapper">
            <span class="building-badge-tag">IE BARRO BLANCO</span>
            <div class="building-icon-large">🏫</div>
            <div class="garden-patch-indicator">
              <span>🌾 Huerta Escolar Colectiva</span>
              ${schoolPendingCount > 0 ? `<span class="pending-bubble pulse">${schoolPendingCount}</span>` : ''}
            </div>
          </div>
          <div class="building-footer-title">
            <i class="fas fa-school"></i> Entrar a Huerta Escolar
          </div>
        </div>

        <!-- ZONA 2: GRANJA PERSONAL / RANCHO DEL ESTUDIANTE -->
        <div class="overworld-building-card farm-zone" onclick="window.enterOverworldZone('individual')">
          <div class="building-sprite-wrapper">
            <span class="building-badge-tag">MI GRANJA</span>
            <div class="building-icon-large">🏡</div>
            <div class="garden-patch-indicator">
              <span>👩‍🌾 Rancho & Camas de Práctica</span>
              ${personalPendingCount > 0 ? `<span class="pending-bubble pulse">${personalPendingCount}</span>` : ''}
            </div>
          </div>
          <div class="building-footer-title">
            <i class="fas fa-user-circle"></i> Entrar a Mi Granja
          </div>
        </div>

        <!-- ZONA 3: COMPOSTERA Y MERCADO VERDE (FUTURO) -->
        <div class="overworld-building-card locked-zone" onclick="window.enterOverworldZone('locked_compost')">
          <div class="building-sprite-wrapper">
            <span class="building-badge-tag lock-tag">NIVEL 5</span>
            <div class="building-icon-large dim-icon">♻️</div>
            <div class="garden-patch-indicator dim-patch">
              <span>Compostera Escolar</span>
              <span class="lock-icon-small">🔒</span>
            </div>
          </div>
          <div class="building-footer-title dim-title">
            <i class="fas fa-lock"></i> Próximamente (Nivel 5)
          </div>
        </div>

        <div class="overworld-building-card locked-zone" onclick="window.enterOverworldZone('locked_market')">
          <div class="building-sprite-wrapper">
            <span class="building-badge-tag lock-tag">NIVEL 10</span>
            <div class="building-icon-large dim-icon">🧺</div>
            <div class="garden-patch-indicator dim-patch">
              <span>Mercado Verde</span>
              <span class="lock-icon-small">🔒</span>
            </div>
          </div>
          <div class="building-footer-title dim-title">
            <i class="fas fa-lock"></i> Próximamente (Nivel 10)
          </div>
        </div>
      </div>
    </div>
  `;

  playAmbientChirp();
}

window.enterOverworldZone = function(zone) {
  if (zone.startsWith('locked')) {
    playActionBlocked();
    alert("🔒 Este edificio se desbloqueará en niveles superiores de Green Force cuando ganes más XP cultivando.");
    return;
  }

  if (onSelectZoneCallback) {
    onSelectZoneCallback(zone);
  }
};
