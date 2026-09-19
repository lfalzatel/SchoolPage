// ══════════════════════════════════════════════════════════════════════════
//  Green Force — Módulo Huerta Escolar
//  farm-overworld.js — Mapa Interactivo del Territorio (Estilo Top Heroes RPG)
// ══════════════════════════════════════════════════════════════════════════

import { playAmbientChirp, playActionBlocked, playBuildingEnterSound, playClickSound } from "./farm-sounds.js";

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
    <div class="top-heroes-map-scene zoom-fade-in" id="overworldWrapper">
      
      <!-- Cielo & Clima Animado -->
      <div class="map-sky-overlay">
        <div class="map-cloud cloud-1">☁️</div>
        <div class="map-cloud cloud-2">☁️</div>
        <div class="map-sun">☀️</div>
      </div>

      <!-- Banner Titular de Zona -->
      <div class="map-header-hud">
        <span class="hud-location-title">🗺️ Mapa del Territorio — IE Barro Blanco</span>
        <small class="hud-subtitle">Toca un edificio para guiar al agricultor e ingresar</small>
      </div>

      <!-- ESCENARIO VISUAL DEL MAPA (Terreno, Senderos y Decoración) -->
      <div class="map-terrain-canvas" id="mapTerrainCanvas">
        
        <!-- SVG de Senderos y Río -->
        <svg class="map-paths-svg" viewBox="0 0 100 100" preserveAspectRatio="none">
          <!-- Río lateral con puente -->
          <path d="M 0 45 Q 30 55 50 45 T 100 55" stroke="rgba(3, 169, 244, 0.45)" stroke-width="8" fill="none" stroke-linecap="round" />
          <rect x="46" y="40" width="8" height="18" fill="#8d6e63" rx="2" stroke="#5d4037" stroke-width="0.8" />
          
          <!-- Caminos de piedra (Empedrado entre edificios) -->
          <path d="M 25 28 L 50 48 L 75 28" stroke="#d7ccc8" stroke-width="4.5" stroke-dasharray="2,2" fill="none" stroke-linecap="round" />
          <path d="M 25 75 L 50 48 L 75 75" stroke="#d7ccc8" stroke-width="4.5" stroke-dasharray="2,2" fill="none" stroke-linecap="round" />
        </svg>

        <!-- Elementos de Naturaleza y Decoración en el Mapa -->
        <div class="map-decor tree-1">🌲</div>
        <div class="map-decor tree-2">🌳</div>
        <div class="map-decor tree-3">🌲</div>
        <div class="map-decor tree-4">🌳</div>
        <div class="map-decor flowers-1">🌸</div>
        <div class="map-decor flowers-2">🌼</div>
        <div class="map-decor fence-left">🪵</div>
        <div class="map-decor fence-right">🪵</div>

        <!-- PERSONAJE / AVATAR AGRICULTOR CAMINANTE -->
        <div class="map-farmer-avatar" id="farmerAvatar" style="top: 45%; left: 47%;">
          <div class="avatar-sprite bounce-walk">👩‍🌾</div>
          <span class="avatar-nametag">Estudiante</span>
        </div>

        <!-- NODOS DE EDIFICIOS EN EL MAPA (Coordenadas Geográficas) -->
        
        <!-- EDIFICIO 1: COLEGIO / HUERTA ESCOLAR (Arriba Izquierda) -->
        <div class="map-building-node school-node" style="top: 14%; left: 8%;" onclick="window.guideFarmerAndEnter(event, 'colegio', 20, 24)">
          ${schoolPendingCount > 0 ? `<div class="map-floating-crate pulse-float">🧺 ${schoolPendingCount}</div>` : ''}
          <div class="building-visual-card">
            <span class="node-tag-badge">ESCUELA</span>
            <div class="building-icon-sprite">🏫</div>
            <div class="node-title-box">
              <span>🌾 Huerta Escolar</span>
            </div>
          </div>
        </div>

        <!-- EDIFICIO 2: MI GRANJA / HUERTA INDIVIDUAL (Arriba Derecha) -->
        <div class="map-building-node farm-node" style="top: 14%; left: 56%;" onclick="window.guideFarmerAndEnter(event, 'individual', 20, 68)">
          ${personalPendingCount > 0 ? `<div class="map-floating-crate pulse-float">🪴 ${personalPendingCount}</div>` : ''}
          <div class="building-visual-card">
            <span class="node-tag-badge farm-tag">MI GRANJA</span>
            <div class="building-icon-sprite">🏡</div>
            <div class="node-title-box">
              <span>👩‍🌾 Mi Rancho</span>
            </div>
          </div>
        </div>

        <!-- EDIFICIO 3: COMPOSTERA (Abajo Izquierda - Nivel 5) -->
        <div class="map-building-node locked-node" style="top: 60%; left: 8%;" onclick="window.guideFarmerAndEnter(event, 'locked_compost', 65, 24)">
          <div class="building-visual-card dim-node">
            <span class="node-tag-badge lock-tag">NIVEL 5</span>
            <div class="building-icon-sprite dim-icon">♻️</div>
            <div class="node-title-box dim-title">
              <span>🔒 Compostera</span>
            </div>
          </div>
        </div>

        <!-- EDIFICIO 4: MERCADO VERDE (Abajo Derecha - Nivel 10) -->
        <div class="map-building-node locked-node" style="top: 60%; left: 56%;" onclick="window.guideFarmerAndEnter(event, 'locked_market', 65, 68)">
          <div class="building-visual-card dim-node">
            <span class="node-tag-badge lock-tag">NIVEL 10</span>
            <div class="building-icon-sprite dim-icon">🧺</div>
            <div class="node-title-box dim-title">
              <span>🔒 Mercado Verde</span>
            </div>
          </div>
        </div>

      </div>

    </div>
  `;

  playAmbientChirp();
}

window.guideFarmerAndEnter = function(evt, zone, targetTopPercent, targetLeftPercent) {
  playClickSound();

  const farmer = document.getElementById("farmerAvatar");
  if (farmer) {
    farmer.style.transition = "top 0.5s ease-in-out, left 0.5s ease-in-out";
    farmer.style.top = `${targetTopPercent}%`;
    farmer.style.left = `${targetLeftPercent}%`;
  }

  if (zone.startsWith('locked')) {
    setTimeout(() => {
      playActionBlocked();
      alert("🔒 Este edificio requiere Nivel 5 / 10 de experiencia en Green Force. ¡Sigue cultivando para desbloquearlo!");
    }, 400);
    return;
  }

  const node = evt ? evt.currentTarget : null;
  if (node) {
    node.classList.add("building-pulse-tap");
  }

  setTimeout(() => {
    playBuildingEnterSound();
    const wrapper = document.getElementById("overworldWrapper");
    if (wrapper) wrapper.classList.add("zoom-out-transition");

    setTimeout(() => {
      if (onSelectZoneCallback) {
        onSelectZoneCallback(zone);
      }
    }, 350);
  }, 450);
};

export function spawnFloatingText(x, y, text, color = "#ffd54f") {
  const el = document.createElement("div");
  el.className = "floating-game-text";
  el.innerText = text;
  el.style.cssText = `
    position: fixed;
    left: ${x}px;
    top: ${y}px;
    color: ${color};
    font-weight: 800;
    font-size: 1.1rem;
    pointer-events: none;
    z-index: 99999;
    text-shadow: 0 2px 8px rgba(0,0,0,0.8);
    transform: translate(-50%, 0);
    animation: floatUpGlow 1.2s cubic-bezier(0.25, 1, 0.5, 1) forwards;
  `;
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 1200);
}
