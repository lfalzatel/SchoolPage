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

      <!-- 3. ESCENARIO VISUAL ISOMÉTRICO EN 2.5D (Mapa de Granja) -->
      <div class="isometric-world-scene" id="isometricWorldScene">
        
        <!-- CIELO Y CLIMA ANIMADO -->
        <div class="iso-sky-layer">
          <div class="iso-cloud cloud-a">☁️</div>
          <div class="iso-cloud cloud-b">☁️</div>
          <div class="iso-sun-glow">☀️</div>

          <!-- Aves Volando con Sombra Proyectada -->
          <div class="flying-bird bird-1">🕊️<span class="bird-shadow"></span></div>
          <div class="flying-bird bird-2">🦅<span class="bird-shadow"></span></div>
        </div>

        <!-- PLANO ISOMÉTRICO EN 45 GRADOS (Terreno y Senderos) -->
        <div class="iso-terrain-grid" onclick="window.onTerrainClick(event)">
          
          <!-- Mariposas Revoloteando sobre las Flores -->
          <div class="flying-butterfly butterfly-1">🦋</div>
          <div class="flying-butterfly butterfly-2">🦋</div>

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

          <!-- ANIMALES CAMINANDO Y PASTANDO EN EL TERRENO -->
          <div class="iso-animal-walker cow-walker" id="cowWalker">
            <span class="animal-sprite">🐮</span>
            <span class="farmer-shadow"></span>
          </div>
          <div class="iso-animal-walker chicken-walker" id="chickenWalker">
            <span class="animal-sprite">🐔</span>
            <span class="farmer-shadow" style="width: 14px; height: 4px;"></span>
          </div>

          <!-- AGRICULTOR CAMINANTE EN EL SENDEROS (AVATAR TRABAJADOR) -->
          <div class="iso-farmer-avatar" id="farmerAvatar" style="top: 48%; left: 47%;">
            <div class="farmer-action-bubble" id="farmerBubble" style="display: none;">
              <span id="farmerTaskText">🛠️ Reparando la cerca...</span>
            </div>
            <div class="farmer-sprite-wrapper" id="farmerSpriteWrapper">
              <span class="farmer-emoji" id="farmerEmoji">👩‍🌾</span>
              <span class="farmer-tool-icon" id="farmerToolIcon" style="display: none;">🔨</span>
            </div>
            <span class="farmer-shadow"></span>
          </div>

          <!-- EDIFICIO 1: ESCUELA IE BARRO BLANCO + PINES DE MAPA + BANCALES -->
          <div class="iso-building-structure school-building" style="top: 8%; left: 6%;" onclick="window.selectMapPoi(event, 'colegio', 20, 24)">
            <div class="building-map-pin school-pin">
              <i class="fas fa-map-marker-alt"></i> IE BARRO BLANCO
            </div>
            ${schoolPendingCount > 0 ? `<div class="iso-crate-badge pulse-bounce">🧺 ${schoolPendingCount} pendientes</div>` : ''}
            <div class="building-artwork">
              <div class="artwork-sprite">🏫</div>
              <div class="structure-title-box">
                <span>🌾 Huerta Escolar</span>
              </div>
            </div>

            <!-- BANCALES DE MADERA 2.5D REALES SOBRE EL CÉSPED DEL COLEGIO -->
            <div class="iso-plots-row">
              ${renderOnMapPlotBeds(schoolCrops, schoolPlots, 'colegio')}
            </div>
          </div>

          <!-- EDIFICIO 2: MI GRANJA / RANCHO DEL ESTUDIANTE -->
          <div class="iso-building-structure farm-building" style="top: 8%; left: 54%;" onclick="window.selectMapPoi(event, 'individual', 20, 70)">
            <div class="building-map-pin farm-pin">
              <i class="fas fa-map-marker-alt"></i> MI HUERTA
            </div>
            ${personalPendingCount > 0 ? `<div class="iso-crate-badge farm-crate pulse-bounce">🪴 ${personalPendingCount} pendientes</div>` : ''}
            <div class="building-artwork farm-art">
              <div class="artwork-sprite">🏡</div>
              <div class="structure-title-box">
                <span>👩‍🌾 Rancho Individual</span>
              </div>
            </div>

            <!-- BANCALES DE MADERA 2.5D REALES SOBRE EL CÉSPED DE LA GRANJA -->
            <div class="iso-plots-row">
              ${renderOnMapPlotBeds(personalCrops, personalPlots, 'individual')}
            </div>
          </div>

          <!-- EDIFICIO 3: COMPOSTERA ESCOLAR (Nivel 5) -->
          <div class="iso-building-structure locked-building" style="top: 60%; left: 6%;" onclick="window.selectMapPoi(event, 'locked_compost', 66, 22)">
            <div class="building-map-pin lock-pin">
              <i class="fas fa-lock"></i> COMPOSTERA
            </div>
            <div class="building-artwork dim-art">
              <span class="structure-badge lock-badge">NIVEL 5</span>
              <div class="artwork-sprite dim-sprite">♻️</div>
              <div class="structure-title-box dim-box">
                <span>🔒 Abonos</span>
              </div>
            </div>
          </div>

          <!-- EDIFICIO 4: MERCADO VERDE (Nivel 10) -->
          <div class="iso-building-structure locked-building" style="top: 60%; left: 54%;" onclick="window.selectMapPoi(event, 'locked_market', 66, 70)">
            <div class="building-map-pin lock-pin">
              <i class="fas fa-lock"></i> MERCADO VERDE
            </div>
            <div class="building-artwork dim-art">
              <span class="structure-badge lock-badge">NIVEL 10</span>
              <div class="artwork-sprite dim-sprite">🧺</div>
              <div class="structure-title-box dim-box">
                <span>🔒 Tienda</span>
              </div>
            </div>
          </div>

        </div>

        <!-- TARJETA INFERIOR DE DESTINO SELECCIONADO EN EL MAPA (TIPO UBER/JUEGO) -->
        <div class="map-selected-poi-card" id="mapSelectedPoiCard" style="display: none;">
          <div class="poi-info">
            <span class="poi-title" id="poiCardTitle">🏫 IE Barro Blanco</span>
            <span class="poi-subtitle" id="poiCardSubtitle">Huerta Escolar Colectiva</span>
          </div>
          <button class="game-btn" id="poiCardEnterBtn" onclick="window.confirmEnterSelectedZone()">
            <i class="fas fa-door-open"></i> Entrar al Cultivo
          </button>
        </div>

      </div>
    </div>
  `;

  playAmbientChirp();
  initFarmerWorkerAI();
  initAnimalWanderingAI();
}

let farmerWorkerTimer = null;

function initFarmerWorkerAI() {
  if (farmerWorkerTimer) clearInterval(farmerWorkerTimer);

  const farmer = document.getElementById("farmerAvatar");
  const bubble = document.getElementById("farmerBubble");
  const taskText = document.getElementById("farmerTaskText");
  const toolIcon = document.getElementById("farmerToolIcon");
  const spriteWrapper = document.getElementById("farmerSpriteWrapper");

  if (!farmer || !bubble || !taskText || !toolIcon || !spriteWrapper) return;

  const waypoints = [
    { top: 62, left: 78, tool: "🔨", text: "🛠️ Reparando el cerco...", duration: 4500 },
    { top: 38, left: 24, tool: "💧", text: "💧 Regando las plantas...", duration: 4500 },
    { top: 65, left: 16, tool: "🪴", text: "🪴 Volteando el abono...", duration: 4500 },
    { top: 38, left: 72, tool: "🌱", text: "🌱 Cuidando brotes...", duration: 4500 },
    { top: 48, left: 46, tool: "🧹", text: "🧹 Limpiando el camino...", duration: 4500 }
  ];

  let currentIdx = 0;

  function moveToNextWaypoint() {
    const farmerEl = document.getElementById("farmerAvatar");
    if (!farmerEl) return;

    const wp = waypoints[currentIdx];
    currentIdx = (currentIdx + 1) % waypoints.length;

    bubble.style.display = "none";
    toolIcon.style.display = "none";

    const currentLeft = parseFloat(farmerEl.style.left) || 47;
    if (wp.left < currentLeft) {
      spriteWrapper.classList.add("facing-left");
    } else {
      spriteWrapper.classList.remove("facing-left");
    }

    farmerEl.style.transition = "top 3.2s linear, left 3.2s linear";
    farmerEl.style.top = `${wp.top}%`;
    farmerEl.style.left = `${wp.left}%`;

    setTimeout(() => {
      if (!document.getElementById("farmerAvatar")) return;
      taskText.innerText = wp.text;
      toolIcon.innerText = wp.tool;
      bubble.style.display = "block";
      toolIcon.style.display = "block";

      playAmbientChirp();

      setTimeout(() => {
        if (!document.getElementById("farmerAvatar")) return;
        moveToNextWaypoint();
      }, wp.duration);
    }, 3300);
  }

  setTimeout(() => {
    moveToNextWaypoint();
  }, 1200);
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

let selectedPoiZone = 'colegio';
let animalTimer = null;

function initAnimalWanderingAI() {
  if (animalTimer) clearInterval(animalTimer);

  const cow = document.getElementById("cowWalker");
  const chicken = document.getElementById("chickenWalker");

  animalTimer = setInterval(() => {
    if (cow) {
      const randTop = 74 + Math.random() * 8;
      const randLeft = 22 + Math.random() * 12;
      cow.style.top = `${randTop}%`;
      cow.style.left = `${randLeft}%`;
    }
    if (chicken) {
      const randTop = 40 + Math.random() * 8;
      const randLeft = 70 + Math.random() * 10;
      chicken.style.top = `${randTop}%`;
      chicken.style.left = `${randLeft}%`;
    }
  }, 6500);
}

// Selección de punto en el mapa (estilo Uber / Juego)
window.selectMapPoi = function(evt, zone, targetTop, targetLeft) {
  if (evt) evt.stopPropagation();
  playClickSound();

  selectedPoiZone = zone;

  // Dirigir al agricultor hacia el punto seleccionado
  const farmer = document.getElementById("farmerAvatar");
  const spriteWrapper = document.getElementById("farmerSpriteWrapper");
  if (farmer && targetTop > 0) {
    const currentLeft = parseFloat(farmer.style.left) || 47;
    if (spriteWrapper) {
      if (targetLeft < currentLeft) spriteWrapper.classList.add("facing-left");
      else spriteWrapper.classList.remove("facing-left");
    }
    farmer.style.transition = "top 1.2s cubic-bezier(0.25, 1, 0.5, 1), left 1.2s cubic-bezier(0.25, 1, 0.5, 1)";
    farmer.style.top = `${targetTop}%`;
    farmer.style.left = `${targetLeft}%`;
  }

  // Actualizar tarjeta inferior tipo Uber/GPS
  const card = document.getElementById("mapSelectedPoiCard");
  const title = document.getElementById("poiCardTitle");
  const subtitle = document.getElementById("poiCardSubtitle");
  const enterBtn = document.getElementById("poiCardEnterBtn");

  if (card && title && subtitle && enterBtn) {
    card.style.display = "flex";

    if (zone === 'colegio') {
      title.innerHTML = '🏫 IE Barro Blanco';
      subtitle.innerHTML = '🌾 Huerta Escolar Colectiva • Bancales Institucionales';
      enterBtn.innerHTML = '<i class="fas fa-door-open"></i> Entrar al Cultivo';
      enterBtn.style.background = 'linear-gradient(180deg, #7fc25c, #2e5b22)';
    } else if (zone === 'individual') {
      title.innerHTML = '🏡 Mi Huerta / Rancho';
      subtitle.innerHTML = '👩‍🌾 Parcela de Entrenamiento y Práctica Individual';
      enterBtn.innerHTML = '<i class="fas fa-door-open"></i> Entrar a Mi Huerta';
      enterBtn.style.background = 'linear-gradient(180deg, #ffb300, #b8860b)';
    } else if (zone === 'locked_compost') {
      title.innerHTML = '🔒 Compostera Escolar';
      subtitle.innerHTML = 'Requiere Nivel 5 de experiencia para procesar abonos.';
      enterBtn.innerHTML = '<i class="fas fa-lock"></i> Bloqueado (Nivel 5)';
      enterBtn.style.background = '#4a5568';
    } else if (zone === 'locked_market') {
      title.innerHTML = '🔒 Mercado Verde';
      subtitle.innerHTML = 'Requiere Nivel 10 para intercambiar semillas y cosechas.';
      enterBtn.innerHTML = '<i class="fas fa-lock"></i> Bloqueado (Nivel 10)';
      enterBtn.style.background = '#4a5568';
    }
  }
};

window.confirmEnterSelectedZone = function() {
  if (selectedPoiZone.startsWith('locked')) {
    playActionBlocked();
    alert("🔒 Este edificio requiere subir de nivel realizando riegos y cosechas en la huerta escolar.");
    return;
  }
  window.enterIsoZone(null, selectedPoiZone, 0, 0);
};

window.onTerrainClick = function(evt) {
  const terrain = evt.currentTarget.getBoundingClientRect();
  const clickX = evt.clientX - terrain.left;
  const clickY = evt.clientY - terrain.top;

  const pctX = Math.round((clickX / terrain.width) * 100);
  const pctY = Math.round((clickY / terrain.height) * 100);

  const farmer = document.getElementById("farmerAvatar");
  const spriteWrapper = document.getElementById("farmerSpriteWrapper");
  if (farmer) {
    playClickSound();
    const currentLeft = parseFloat(farmer.style.left) || 47;
    if (spriteWrapper) {
      if (pctX < currentLeft) spriteWrapper.classList.add("facing-left");
      else spriteWrapper.classList.remove("facing-left");
    }
    farmer.style.transition = "top 1.5s ease-out, left 1.5s ease-out";
    farmer.style.top = `${pctY}%`;
    farmer.style.left = `${pctX}%`;
  }
};

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
