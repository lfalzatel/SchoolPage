// ══════════════════════════════════════════════════════════════════════════
//  Green Force — Módulo Huerta Escolar
//  farm-overworld.js — Motor de Mapa Isométrico 2.5D Estilo Top Heroes
// ══════════════════════════════════════════════════════════════════════════

import {
  playAmbientChirp,
  playActionBlocked,
  playBuildingEnterSound,
  playClickSound,
  playWatering,
  playFertilizing,
  playHarvest,
  playUnlockPlot
} from "./farm-sounds.js";

import {
  logRiego,
  logFertilizacion,
  logCosecha,
  awardUserGamification
} from "./huerta-service.js";

let onSelectZoneCallback = null;
let onRefreshDataCallback = null;

export function renderOverworldMap(container, {
  schoolCrops = [],
  personalCrops = [],
  schoolPlots = [],
  personalPlots = [],
  user,
  role,
  onSelectZone,
  onRefreshData
}) {
  onSelectZoneCallback = onSelectZone;
  onRefreshDataCallback = onRefreshData;
  if (!container) return;

  const nowMs = Date.now();
  
  // Conteo de tareas pendientes
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

  // Renderizado del HUD de Top Heroes + Escenario Isométrico
  container.innerHTML = `
    <div class="top-heroes-game-viewport" id="overworldWrapper">
      
      <!-- 1. HUD SUPERIOR DE VIDEOJUEGO (Bajo el Header de la App) -->
      <div class="top-heroes-hud-bar">
        <div class="hud-player-profile">
          <div class="hud-avatar-circle">👩‍🌾</div>
          <div class="hud-player-meta">
            <span class="hud-player-name">${user ? (user.displayName || 'Estudiante') : 'Invitado'}</span>
            <span class="hud-level-badge"><i class="fas fa-star" style="color:#ffd54f;"></i> NIVEL 1</span>
          </div>
        </div>

        <div class="hud-resource-pills">
          <div class="resource-pill xp-pill" title="Experiencia Ganada">
            <span class="res-icon">🌟</span>
            <span class="res-value" id="hudXpValue">${user ? (user.farmXp || 0) : 0}</span>
          </div>
          <div class="resource-pill coins-pill" title="Monedas Verdes">
            <span class="res-icon">🪙</span>
            <span class="res-value" id="hudCoinsValue">${user ? (user.farmCoins || 0) : 0}</span>
          </div>
        </div>

        <div class="hud-view-toggle">
          <button class="hud-toggle-btn active" onclick="window.switchHuertaViewMode('juego')" title="Vista de Juego 2.5D">🌻</button>
          <button class="hud-toggle-btn" onclick="window.switchHuertaViewMode('clasica')" title="Vista Lista Clásica">📋</button>
        </div>
      </div>

      <!-- 2. TRACKER DE MISIÓN FLOTANTE (Abajo Izquierda) -->
      <div class="hud-quest-tracker">
        <div class="quest-icon">📜</div>
        <div class="quest-text">
          <span class="quest-label">MISIÓN ACTUAL</span>
          <span class="quest-title">${schoolPendingCount > 0 ? `Atender ${schoolPendingCount} labor(es) en Huerta Escolar` : '¡Huerta saludable y al día!'}</span>
        </div>
      </div>

      <!-- 3. ESCENARIO VISUAL ISOMÉTRICO EN 2.5D (Grass Landscape) -->
      <div class="isometric-world-scene" id="isometricWorldScene">
        
        <!-- CIELO Y CLIMA ANIMADO -->
        <div class="iso-sky-layer">
          <div class="iso-cloud cloud-a">☁️</div>
          <div class="iso-cloud cloud-b">☁️</div>
          <div class="iso-sun-glow">☀️</div>
        </div>

        <!-- PLANO ISOMÉTRICO EN 45 GRADOS (Terreno y Senderos) -->
        <div class="iso-terrain-grid">
          
          <!-- SVG DE CAMINOS Y RÍO DE AGUA ANIMADA -->
          <svg class="iso-paths-svg" viewBox="0 0 100 100" preserveAspectRatio="none">
            <!-- Río lateral animado -->
            <path d="M 0 50 Q 25 60 50 48 T 100 60" stroke="#0288d1" stroke-width="10" fill="none" opacity="0.8" />
            <path d="M 0 50 Q 25 60 50 48 T 100 60" stroke="#4fc3f7" stroke-width="4" stroke-dasharray="3,3" fill="none" class="river-flow" />
            <!-- Puente de Madera -->
            <rect x="44" y="44" width="12" height="20" fill="#5d4037" rx="2" stroke="#3e2723" stroke-width="1" />
            
            <!-- Senderos de empedrado diagonal que conectan los edificios -->
            <path d="M 28 30 L 50 50 L 72 30" stroke="#d7ccc8" stroke-width="5" stroke-dasharray="2,2" fill="none" />
            <path d="M 28 75 L 50 50 L 72 75" stroke="#d7ccc8" stroke-width="5" stroke-dasharray="2,2" fill="none" />
          </svg>

          <!-- DECORACIONES ISOMÉTRICAS DE NATURALEZA (Árboles, Cercas, Flores) -->
          <div class="iso-decor tree-tl">🌲</div>
          <div class="iso-decor tree-tr">🌳</div>
          <div class="iso-decor tree-bl">🌲</div>
          <div class="iso-decor tree-br">🌳</div>
          <div class="iso-decor flowers-l">🌸</div>
          <div class="iso-decor flowers-r">🌼</div>
          <div class="iso-decor fence-l">🪵</div>
          <div class="iso-decor fence-r">🪵</div>
          <div class="iso-decor cow-anim">🐮</div>

          <!-- AGRICULTOR CAMINANTE EN EL SENDEROS (AVATAR) -->
          <div class="iso-farmer-avatar" id="farmerAvatar" style="top: 48%; left: 47%;">
            <div class="farmer-sprite walk-bounce">👩‍🌾</div>
            <span class="farmer-shadow"></span>
          </div>

          <!-- EDIFICIO 1: ESCUELA IE BARRO BLANCO + BANCALES REALES EN LA HIERRA -->
          <div class="iso-building-structure school-building" style="top: 10%; left: 6%;" onclick="window.enterIsoZone(event, 'colegio', 18, 22)">
            ${schoolPendingCount > 0 ? `<div class="iso-crate-badge pulse-bounce">🧺 ${schoolPendingCount} pendientes</div>` : ''}
            <div class="building-artwork">
              <span class="structure-badge">IE BARRO BLANCO</span>
              <div class="artwork-sprite">🏫</div>
              <div class="structure-title-box">
                <span>🌾 Huerta Escolar Colectiva</span>
              </div>
            </div>

            <!-- BANCALES DE MADERA 2.5D REALES SOBRE EL CÉSPED DEL COLEGIO -->
            <div class="iso-plots-row">
              ${renderOnMapPlotBeds(schoolCrops, schoolPlots, 'colegio')}
            </div>
          </div>

          <!-- EDIFICIO 2: MI GRANJA / RANCHO DEL ESTUDIANTE -->
          <div class="iso-building-structure farm-building" style="top: 10%; left: 54%;" onclick="window.enterIsoZone(event, 'individual', 18, 70)">
            ${personalPendingCount > 0 ? `<div class="iso-crate-badge farm-crate pulse-bounce">🪴 ${personalPendingCount} pendientes</div>` : ''}
            <div class="building-artwork farm-art">
              <span class="structure-badge farm-badge">MI GRANJA</span>
              <div class="artwork-sprite">🏡</div>
              <div class="structure-title-box">
                <span>👩‍🌾 Rancho & Práctica</span>
              </div>
            </div>

            <!-- BANCALES DE MADERA 2.5D REALES SOBRE EL CÉSPED DE LA GRANJA -->
            <div class="iso-plots-row">
              ${renderOnMapPlotBeds(personalCrops, personalPlots, 'individual')}
            </div>
          </div>

          <!-- EDIFICIO 3: COMPOSTERA ESCOLAR (Nivel 5) -->
          <div class="iso-building-structure locked-building" style="top: 62%; left: 6%;" onclick="window.enterIsoZone(event, 'locked_compost', 68, 22)">
            <div class="building-artwork dim-art">
              <span class="structure-badge lock-badge">NIVEL 5</span>
              <div class="artwork-sprite dim-sprite">♻️</div>
              <div class="structure-title-box dim-box">
                <span>🔒 Compostera</span>
              </div>
            </div>
          </div>

          <!-- EDIFICIO 4: MERCADO VERDE (Nivel 10) -->
          <div class="iso-building-structure locked-building" style="top: 62%; left: 54%;" onclick="window.enterIsoZone(event, 'locked_market', 68, 70)">
            <div class="building-artwork dim-art">
              <span class="structure-badge lock-badge">NIVEL 10</span>
              <div class="artwork-sprite dim-sprite">🧺</div>
              <div class="structure-title-box dim-box">
                <span>🔒 Mercado Verde</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  `;

  playAmbientChirp();
}

// Generador de Bancales de Madera 2.5D integrados directamente en el césped del mapa
function renderOnMapPlotBeds(cropsList, plotsList, scope) {
  if (!plotsList || plotsList.length === 0) return '';
  
  const nowMs = Date.now();
  let html = '';

  // Renderizar máximo 2 bancales directamente visibles en el mapa para no saturar
  const displayPlots = plotsList.slice(0, 2);

  displayPlots.forEach((plot, index) => {
    const crop = cropsList.find(c => c.plotId === plot.id && c.status !== 'cosechado' && c.status !== 'perdido');
    const isPractice = plot.isReal === false;

    if (crop) {
      // Calcular estado del cultivo
      const plantedMs = crop.plantedDate ? crop.plantedDate.toMillis() : nowMs;
      const harvestMs = crop.expectedHarvestDate ? crop.expectedHarvestDate.toMillis() : (plantedMs + 30 * 86400000);
      const totalCycle = Math.max(harvestMs - plantedMs, 1);
      const elapsed = Math.max(nowMs - plantedMs, 0);
      const growthRatio = Math.min(elapsed / totalCycle, 1.0);

      const isWaterDue = crop.nextWateringDue && crop.nextWateringDue.toMillis() <= nowMs + (12 * 3600 * 1000);
      const isFertDue = crop.nextFertilizingDue && crop.nextFertilizingDue.toMillis() <= nowMs + (12 * 3600 * 1000);
      const isReady = crop.status === 'listo_para_cosecha' || growthRatio >= 1.0;

      let stageIcon = '🌱';
      if (isReady) stageIcon = crop.cropTypeIcon || '🥬';
      else if (growthRatio >= 0.6) stageIcon = crop.cropTypeIcon || '🪴';
      else if (growthRatio >= 0.2) stageIcon = '🌿';

      // Burbuja flotante de 1-Tap Harvest / Riego / Abono
      let actionBadgeHtml = '';
      if (isReady) {
        actionBadgeHtml = `<button class="plot-harvest-bubble ready-glow pulse-bounce" onclick="window.onMapDirectAction(event, 'cosecha', '${crop.id}')">🧺 Cosechar</button>`;
      } else if (isWaterDue) {
        actionBadgeHtml = `<button class="plot-harvest-bubble water-glow pulse-bounce" onclick="window.onMapDirectAction(event, 'riego', '${crop.id}')">💧 Regar</button>`;
      } else if (isFertDue) {
        actionBadgeHtml = `<button class="plot-harvest-bubble fert-glow pulse-bounce" onclick="window.onMapDirectAction(event, 'fertilizacion', '${crop.id}')">🍃 Abonar</button>`;
      }

      html += `
        <div class="on-map-plot-bed ${isPractice ? 'practice-bed' : ''}">
          ${actionBadgeHtml}
          <div class="wooden-bed-box">
            <span class="bed-crop-sprite">${stageIcon}</span>
            <small class="bed-crop-name">${crop.cropTypeName}</small>
          </div>
        </div>
      `;
    } else {
      // Bancal disponible
      html += `
        <div class="on-map-plot-bed empty-bed" onclick="event.stopPropagation(); window.enterIsoZone(null, '${scope}', 0, 0);">
          <div class="wooden-bed-box soil-empty">
            <span class="bed-crop-sprite">🪴</span>
            <small class="bed-crop-name">+ Sembrar</small>
          </div>
        </div>
      `;
    }
  });

  return html;
}

// Guía al personaje caminante y luego ingresa a la zona
window.enterIsoZone = function(evt, zone, targetTop, targetLeft) {
  playClickSound();

  const farmer = document.getElementById("farmerAvatar");
  if (farmer && targetTop > 0) {
    farmer.style.transition = "top 0.5s cubic-bezier(0.25, 1, 0.5, 1), left 0.5s cubic-bezier(0.25, 1, 0.5, 1)";
    farmer.style.top = `${targetTop}%`;
    farmer.style.left = `${targetLeft}%`;
  }

  if (zone.startsWith('locked')) {
    setTimeout(() => {
      playActionBlocked();
      alert("🔒 Este edificio requiere Nivel 5 o Nivel 10 de experiencia ambiental. ¡Sigue cuidando la huerta para desbloquearlo!");
    }, 350);
    return;
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
  }, 400);
};

// Acción directa en 1-tap desde las burbujas flotantes sobre los bancales del mapa
window.onMapDirectAction = async function(evt, action, cropId) {
  if (evt) evt.stopPropagation();
  playClickSound();

  const user = window.currentUserGlobal || null;
  if (!user) {
    alert("🌱 Debes iniciar sesión con tu cuenta de Green Force para registrar labores de la huerta.");
    return;
  }

  try {
    const rect = evt.currentTarget.getBoundingClientRect();

    if (action === 'riego') {
      const isRain = confirm("¿Fue un riego por lluvia natural?");
      await logRiego(cropId, { isRain, user });
      playWatering();
      spawnFloatingText(rect.left + rect.width / 2, rect.top, "💧 +10 XP • +5 Monedas", "#4fc3f7");
      await awardUserGamification(user.uid, 10, 5);
    } else if (action === 'fertilizacion') {
      const product = prompt("Tipo de abono utilizado:", "Compost orgánico escolar");
      if (!product) return;
      await logFertilizacion(cropId, { product, user });
      playFertilizing();
      spawnFloatingText(rect.left + rect.width / 2, rect.top, "🍃 +15 XP • +10 Monedas", "#81c784");
      await awardUserGamification(user.uid, 15, 10);
    } else if (action === 'cosecha') {
      const qtyStr = prompt("Cantidad cosechada:", "1");
      if (!qtyStr) return;
      const result = await logCosecha(cropId, { quantity: Number(qtyStr), isFinalHarvest: true, user });

      if (result.plotUnlocked) {
        playUnlockPlot();
        spawnFloatingText(rect.left + rect.width / 2, rect.top, "🔓 ¡BANCAL DESBLOQUEADO! +50 XP", "#ffd54f");
        await awardUserGamification(user.uid, 50, 25);
      } else {
        playHarvest();
        spawnFloatingText(rect.left + rect.width / 2, rect.top, "🧺 +30 XP • +15 Monedas", "#ffd54f");
        await awardUserGamification(user.uid, 30, 15);
      }
    }

    if (onRefreshDataCallback) await onRefreshDataCallback();
  } catch (err) {
    console.error("Error en acción directa de mapa:", err);
    alert("Error: " + err.message);
  }
};

window.switchHuertaViewMode = function(mode) {
  if (window.switchHuertaViewModeGlobal) {
    window.switchHuertaViewModeGlobal(mode);
  }
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
