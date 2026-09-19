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

// Configuración de Coordenadas Predeterminadas (en píxeles dentro del mapa 1200x1000)
const DEFAULT_BUILDING_LAYOUT = {
  colegio: { x: 200, y: 140 },
  individual: { x: 680, y: 140 },
  locked_compost: { x: 200, y: 580 },
  locked_market: { x: 680, y: 580 }
};

const STORAGE_KEY_LAYOUT = "green_force_building_layout_v1";

function loadBuildingLayout() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY_LAYOUT);
    if (saved) {
      const parsed = JSON.parse(saved);
      return { ...DEFAULT_BUILDING_LAYOUT, ...parsed };
    }
  } catch (e) {
    console.warn("Error cargando layout:", e);
  }
  return { ...DEFAULT_BUILDING_LAYOUT };
}

function saveBuildingLayout(layout) {
  try {
    localStorage.setItem(STORAGE_KEY_LAYOUT, JSON.stringify(layout));
  } catch (e) {
    console.error("Error guardando layout:", e);
  }
}

let cameraState = {
  x: 0,
  y: 0,
  scale: 0.85,
  isDragging: false,
  startX: 0,
  startY: 0,
  initialDistance: 0,
  isEditMode: false,
  activeDraggingBuilding: null,
  dragOffset: { x: 0, y: 0 }
};

let currentLayout = loadBuildingLayout();
let selectedPoiZone = 'colegio';
let farmerWorkerTimer = null;
let animalTimer = null;

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
  currentLayout = loadBuildingLayout();

  container.innerHTML = `
    <div class="top-heroes-game-viewport" id="overworldViewport">
      
      <!-- 1. HUD SUPERIOR DE VIDEOJUEGO -->
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

      <!-- CONTROLES FLOTANTES DE CÁMARA (ZOOM Y MODO MOVER) -->
      <div class="map-hud-controls">
        <button class="map-ctrl-btn" onclick="window.mapZoomIn()" title="Acercar Cámara">➕</button>
        <button class="map-ctrl-btn" onclick="window.mapZoomOut()" title="Alejar Cámara">➖</button>
        <button class="map-ctrl-btn" onclick="window.resetCameraView()" title="Centrar Vista">🎯</button>
        <button class="map-ctrl-btn" id="btnToggleEditMode" onclick="window.toggleMapEditMode()" title="Mover / Reubicar Edificios">🏗️</button>
      </div>

      <!-- BANNER SUPERIOR DEL MODO EDICIÓN (REUBICAR) -->
      <div class="edit-mode-banner" id="editModeBanner" style="display: none;">
        <span>🏗️ Modo Mover: Arrastra los edificios para cambiarlos de lugar</span>
        <div style="display: flex; gap: 4px;">
          <button class="btn-save-layout" onclick="window.saveMapLayout()">💾 Guardar</button>
          <button class="btn-cancel-layout" onclick="window.cancelMapLayout()">✖️</button>
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

      <!-- 3. LIENZO NAVEGABLE 2.5D (WORLD STAGE DE 1200x1000 px) -->
      <div class="world-camera-stage" id="worldCameraStage">
        
        <!-- CIELO Y CLIMA ANIMADO -->
        <div class="iso-sky-layer">
          <div class="iso-cloud cloud-a">☁️</div>
          <div class="iso-cloud cloud-b">☁️</div>
          <div class="iso-sun-glow">☀️</div>

          <!-- Aves Volando por el Mapa -->
          <div class="flying-bird bird-1">🕊️<span class="bird-shadow"></span></div>
          <div class="flying-bird bird-2">🦅<span class="bird-shadow"></span></div>
        </div>

        <!-- PLANO DE TERRENO Y SENDEROS -->
        <div class="iso-terrain-grid" id="isoTerrainGrid">
          
          <!-- Cuadrícula de Colocación (Activa en Modo Edición) -->
          <div class="building-placement-grid"></div>

          <!-- Mariposas Revoloteando sobre las Flores -->
          <div class="flying-butterfly butterfly-1">🦋</div>
          <div class="flying-butterfly butterfly-2">🦋</div>

          <!-- SVG DE CAMINOS Y RÍO DE AGUA ANIMADA -->
          <svg class="iso-paths-svg" viewBox="0 0 1200 1000" preserveAspectRatio="none">
            <!-- Río caudaloso en diagonal con curvas suaves -->
            <path d="M 0 500 Q 300 620 600 480 T 1200 580" stroke="#0277bd" stroke-width="64" fill="none" opacity="0.85" />
            <path d="M 0 500 Q 300 620 600 480 T 1200 580" stroke="#4fc3f7" stroke-width="28" stroke-dasharray="8,8" fill="none" class="river-flow" />
            
            <!-- Puente de Madera de Roble -->
            <rect x="540" y="440" width="120" height="90" fill="#5d4037" rx="6" stroke="#3e2723" stroke-width="4" />
            
            <!-- Senderos de empedrado diagonal que unen los edificios -->
            <path d="M 280 280 L 600 480 L 760 280" stroke="#d7ccc8" stroke-width="24" stroke-dasharray="6,6" fill="none" opacity="0.9" />
            <path d="M 280 720 L 600 480 L 760 720" stroke="#d7ccc8" stroke-width="24" stroke-dasharray="6,6" fill="none" opacity="0.9" />
          </svg>

          <!-- DECORACIONES NATURALES (Árboles Grandes y Arbustos) -->
          <div class="iso-decor tree-tl">🌲</div>
          <div class="iso-decor tree-tr">🌳</div>
          <div class="iso-decor tree-bl">🌲</div>
          <div class="iso-decor tree-br">🌳</div>
          <div class="iso-decor tree-mid">🌲</div>
          <div class="iso-decor flowers-l">🌸</div>
          <div class="iso-decor flowers-r">🌼</div>
          <div class="iso-decor fence-l">🪵</div>
          <div class="iso-decor fence-r">🪵</div>

          <!-- ANIMALES CAMINANDO Y PASTANDO EN EL TERRENO -->
          <div class="iso-animal-walker cow-walker" id="cowWalker">
            <span class="animal-sprite">🐮</span>
            <span class="farmer-shadow" style="width: 32px; height: 10px;"></span>
          </div>
          <div class="iso-animal-walker chicken-walker" id="chickenWalker">
            <span class="animal-sprite">🐔</span>
            <span class="farmer-shadow" style="width: 18px; height: 6px;"></span>
          </div>

          <!-- AGRICULTOR CAMINANTE EN EL SENDEROS (AVATAR TRABAJADOR) -->
          <div class="iso-farmer-avatar" id="farmerAvatar" style="top: 480px; left: 580px;">
            <div class="farmer-action-bubble" id="farmerBubble" style="display: none;">
              <span id="farmerTaskText">🛠️ Reparando la cerca...</span>
            </div>
            <div class="farmer-sprite-wrapper" id="farmerSpriteWrapper">
              <span class="farmer-emoji" id="farmerEmoji">👩‍🌾</span>
              <span class="farmer-tool-icon" id="farmerToolIcon" style="display: none;">🔨</span>
            </div>
            <span class="farmer-shadow"></span>
          </div>

          <!-- EDIFICIO 1: ESCUELA IE BARRO BLANCO (2.5D REAL - CERO TARJETAS) -->
          <div class="iso-building-structure school-building" id="building_colegio"
               style="left: ${currentLayout.colegio.x}px; top: ${currentLayout.colegio.y}px;"
               data-zone="colegio">
            <div class="building-map-pin school-pin">
              <i class="fas fa-map-marker-alt"></i> IE BARRO BLANCO
            </div>
            ${schoolPendingCount > 0 ? `<div class="iso-crate-badge pulse-bounce">🧺 ${schoolPendingCount} pendientes</div>` : ''}
            <div class="iso-building-sprite">
              <span class="building-emoji-art">🏫</span>
            </div>
            <div class="building-ground-shadow"></div>
            <div class="building-title-plaque">🌾 Huerta Escolar</div>

            <!-- Camas de Siembra de Madera en el Suelo -->
            <div class="iso-plots-cluster">
              ${renderOnMapTilledBeds(schoolCrops, schoolPlots, 'colegio')}
            </div>
          </div>

          <!-- EDIFICIO 2: MI GRANJA / RANCHO DEL ESTUDIANTE (2.5D REAL) -->
          <div class="iso-building-structure farm-building" id="building_individual"
               style="left: ${currentLayout.individual.x}px; top: ${currentLayout.individual.y}px;"
               data-zone="individual">
            <div class="building-map-pin farm-pin">
              <i class="fas fa-star"></i> MI GRANJA
            </div>
            ${personalPendingCount > 0 ? `<div class="iso-crate-badge farm-crate pulse-bounce">🪴 ${personalPendingCount} pendientes</div>` : ''}
            <div class="iso-building-sprite">
              <span class="building-emoji-art">🏡</span>
            </div>
            <div class="building-ground-shadow"></div>
            <div class="building-title-plaque">👩‍🌾 Rancho & Práctica</div>

            <!-- Camas de Siembra de Madera en el Suelo -->
            <div class="iso-plots-cluster">
              ${renderOnMapTilledBeds(personalCrops, personalPlots, 'individual')}
            </div>
          </div>

          <!-- EDIFICIO 3: COMPOSTERA ESCOLAR (Nivel 5) -->
          <div class="iso-building-structure locked-building" id="building_locked_compost"
               style="left: ${currentLayout.locked_compost.x}px; top: ${currentLayout.locked_compost.y}px;"
               data-zone="locked_compost">
            <div class="building-map-pin lock-pin">
              <i class="fas fa-lock"></i> COMPOSTERA
            </div>
            <div class="iso-building-sprite">
              <span class="building-emoji-art" style="filter: grayscale(0.5);">♻️</span>
            </div>
            <div class="building-ground-shadow"></div>
            <div class="building-title-plaque" style="background: #4a5568; border-color: #a0aec0;">🔒 Nivel 5: Abonos</div>
          </div>

          <!-- EDIFICIO 4: MERCADO VERDE (Nivel 10) -->
          <div class="iso-building-structure locked-building" id="building_locked_market"
               style="left: ${currentLayout.locked_market.x}px; top: ${currentLayout.locked_market.y}px;"
               data-zone="locked_market">
            <div class="building-map-pin lock-pin">
              <i class="fas fa-lock"></i> MERCADO VERDE
            </div>
            <div class="iso-building-sprite">
              <span class="building-emoji-art" style="filter: grayscale(0.5);">🧺</span>
            </div>
            <div class="building-ground-shadow"></div>
            <div class="building-title-plaque" style="background: #4a5568; border-color: #a0aec0;">🔒 Nivel 10: Tienda</div>
          </div>

        </div>

      </div>

      <!-- TARJETA INFERIOR DE DESTINO SELECCIONADO (TIPO UBER / HUD DE JUEGO) -->
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
  `;

  // Inicializar Motor de Cámara y Gestos Táctiles
  setupCameraControls();

  // Inicializar Sistema de Arrastre de Edificios en Modo Edición
  setupBuildingDragHandlers();

  // Inicializar IA de Granjero y Animales
  playAmbientChirp();
  initFarmerWorkerAI();
  initAnimalWanderingAI();
}

// Generador de Bancales de Madera 2.5D con Tierra Labrada
function renderOnMapTilledBeds(cropsList, plotsList, scope) {
  if (!plotsList || plotsList.length === 0) return '';
  const nowMs = Date.now();
  let html = '';

  const displayPlots = plotsList.slice(0, 2);
  displayPlots.forEach((plot) => {
    const crop = cropsList.find(c => c.plotId === plot.id && c.status !== 'cosechado' && c.status !== 'perdido');

    if (crop) {
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

      let bubbleAction = null;
      let bubbleText = '';
      let bubbleClass = '';

      if (isReady) {
        bubbleAction = 'cosecha';
        bubbleText = '🧺 Cosechar';
        bubbleClass = 'ready-glow';
      } else if (isWaterDue) {
        bubbleAction = 'riego';
        bubbleText = '💧 Regar';
        bubbleClass = 'water-glow';
      } else if (isFertDue) {
        bubbleAction = 'fertilizacion';
        bubbleText = '🍃 Abonar';
        bubbleClass = 'fert-glow';
      }

      html += `
        <div class="tilled-soil-bed-25d" onclick="event.stopPropagation(); window.onBuildingClick('${scope}');">
          ${bubbleAction ? `<div class="plot-harvest-bubble ${bubbleClass}" onclick="window.onMapDirectAction(event, '${bubbleAction}', '${crop.id}')">${bubbleText}</div>` : ''}
          <span class="bed-crop-icon">${stageIcon}</span>
        </div>
      `;
    } else {
      html += `
        <div class="tilled-soil-bed-25d" onclick="event.stopPropagation(); window.onBuildingClick('${scope}');" title="Bancal Libre">
          <span class="bed-crop-icon" style="opacity: 0.6;">🪴</span>
        </div>
      `;
    }
  });

  return html;
}

// ══════════════════════════════════════════════════════════════════════════
//  MOTOR DE CÁMARA 2.5D (PAN, ZOOM Y PINCH TÁCTIL)
// ══════════════════════════════════════════════════════════════════════════

function setupCameraControls() {
  const viewport = document.getElementById("overworldViewport");
  const stage = document.getElementById("worldCameraStage");
  if (!viewport || !stage) return;

  const vpWidth = viewport.clientWidth || 380;
  const vpHeight = viewport.clientHeight || 560;
  cameraState.scale = Math.min(vpWidth / 580, 1.0);
  cameraState.x = (vpWidth - (1200 * cameraState.scale)) / 2;
  cameraState.y = (vpHeight - (1000 * cameraState.scale)) / 2;

  applyCameraTransform();

  viewport.addEventListener("pointerdown", (e) => {
    if (cameraState.isEditMode && e.target.closest('.iso-building-structure')) {
      return;
    }
    cameraState.isDragging = true;
    cameraState.startX = e.clientX - cameraState.x;
    cameraState.startY = e.clientY - cameraState.y;
    viewport.classList.add("is-panning");
  });

  window.addEventListener("pointermove", (e) => {
    if (!cameraState.isDragging) return;
    cameraState.x = e.clientX - cameraState.startX;
    cameraState.y = e.clientY - cameraState.startY;
    clampCameraBounds(vpWidth, vpHeight);
    applyCameraTransform();
  });

  window.addEventListener("pointerup", () => {
    if (cameraState.isDragging) {
      cameraState.isDragging = false;
      viewport.classList.remove("is-panning");
    }
  });

  viewport.addEventListener("touchstart", (e) => {
    if (e.touches.length === 2) {
      cameraState.isDragging = false;
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      cameraState.initialDistance = Math.hypot(dx, dy);
    }
  }, { passive: true });

  viewport.addEventListener("touchmove", (e) => {
    if (e.touches.length === 2 && cameraState.initialDistance > 0) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      const currentDistance = Math.hypot(dx, dy);
      const factor = currentDistance / cameraState.initialDistance;

      let newScale = cameraState.scale * factor;
      newScale = Math.max(0.55, Math.min(1.5, newScale));
      cameraState.scale = newScale;
      cameraState.initialDistance = currentDistance;
      applyCameraTransform();
    }
  }, { passive: true });
}

function clampCameraBounds(vpWidth, vpHeight) {
  const scaledWidth = 1200 * cameraState.scale;
  const scaledHeight = 1000 * cameraState.scale;

  const minX = Math.min(0, vpWidth - scaledWidth - 100);
  const maxX = 100;
  const minY = Math.min(0, vpHeight - scaledHeight - 100);
  const maxY = 100;

  cameraState.x = Math.max(minX, Math.min(maxX, cameraState.x));
  cameraState.y = Math.max(minY, Math.min(maxY, cameraState.y));
}

function applyCameraTransform() {
  const stage = document.getElementById("worldCameraStage");
  if (stage) {
    stage.style.transform = `translate3d(${cameraState.x}px, ${cameraState.y}px, 0) scale(${cameraState.scale})`;
  }
}

window.mapZoomIn = function() {
  playClickSound();
  cameraState.scale = Math.min(1.5, cameraState.scale + 0.15);
  applyCameraTransform();
};

window.mapZoomOut = function() {
  playClickSound();
  cameraState.scale = Math.max(0.55, cameraState.scale - 0.15);
  applyCameraTransform();
};

window.resetCameraView = function() {
  playClickSound();
  const viewport = document.getElementById("overworldViewport");
  const vpWidth = viewport?.clientWidth || 380;
  const vpHeight = viewport?.clientHeight || 560;
  cameraState.scale = Math.min(vpWidth / 580, 1.0);
  cameraState.x = (vpWidth - (1200 * cameraState.scale)) / 2;
  cameraState.y = (vpHeight - (1000 * cameraState.scale)) / 2;
  applyCameraTransform();
};

// ══════════════════════════════════════════════════════════════════════════
//  SISTEMA DE MODO EDICIÓN (REUBICAR EDIFICIOS 🏗️)
// ══════════════════════════════════════════════════════════════════════════

window.toggleMapEditMode = function() {
  playClickSound();
  cameraState.isEditMode = !cameraState.isEditMode;

  const viewport = document.getElementById("overworldViewport");
  const banner = document.getElementById("editModeBanner");
  const btn = document.getElementById("btnToggleEditMode");

  if (viewport && banner && btn) {
    viewport.classList.toggle("is-edit-mode", cameraState.isEditMode);
    banner.style.display = cameraState.isEditMode ? "flex" : "none";
    btn.classList.toggle("active-mode", cameraState.isEditMode);
  }

  const poiCard = document.getElementById("mapSelectedPoiCard");
  if (poiCard) poiCard.style.display = "none";
};

function setupBuildingDragHandlers() {
  const buildings = document.querySelectorAll(".iso-building-structure");

  buildings.forEach(el => {
    let isDraggingThis = false;
    let startX = 0;
    let startY = 0;
    let origLeft = 0;
    let origTop = 0;

    const onPointerDown = (e) => {
      if (!cameraState.isEditMode) {
        const zone = el.getAttribute("data-zone");
        window.onBuildingClick(zone);
        return;
      }

      e.stopPropagation();
      isDraggingThis = true;
      el.classList.add("is-dragging");

      startX = e.clientX;
      startY = e.clientY;
      origLeft = parseFloat(el.style.left) || 0;
      origTop = parseFloat(el.style.top) || 0;
      el.setPointerCapture(e.pointerId);
    };

    const onPointerMove = (e) => {
      if (!isDraggingThis || !cameraState.isEditMode) return;
      e.stopPropagation();

      const dx = (e.clientX - startX) / cameraState.scale;
      const dy = (e.clientY - startY) / cameraState.scale;

      let newLeft = Math.round(origLeft + dx);
      let newTop = Math.round(origTop + dy);

      newLeft = Math.max(60, Math.min(1000, newLeft));
      newTop = Math.max(80, Math.min(840, newTop));

      el.style.left = `${newLeft}px`;
      el.style.top = `${newTop}px`;

      const zone = el.getAttribute("data-zone");
      if (zone && currentLayout[zone]) {
        currentLayout[zone].x = newLeft;
        currentLayout[zone].y = newTop;
      }
    };

    const onPointerUp = (e) => {
      if (!isDraggingThis) return;
      isDraggingThis = false;
      el.classList.remove("is-dragging");
      try { el.releasePointerCapture(e.pointerId); } catch (err) {}
      playClickSound();
    };

    el.addEventListener("pointerdown", onPointerDown);
    el.addEventListener("pointermove", onPointerMove);
    el.addEventListener("pointerup", onPointerUp);
    el.addEventListener("pointercancel", onPointerUp);
  });
}

window.saveMapLayout = function() {
  saveBuildingLayout(currentLayout);
  playBuildingEnterSound();
  alert("✨ ¡Distribución de edificios guardada con éxito!");
  window.toggleMapEditMode();
};

window.cancelMapLayout = function() {
  playClickSound();
  currentLayout = loadBuildingLayout();
  for (const [zone, pos] of Object.entries(currentLayout)) {
    const el = document.getElementById(`building_${zone}`);
    if (el) {
      el.style.left = `${pos.x}px`;
      el.style.top = `${pos.y}px`;
    }
  }
  window.toggleMapEditMode();
};

// ══════════════════════════════════════════════════════════════════════════
//  SELECCIÓN Y ENTRADA A EDIFICIOS (CERO TARJETAS)
// ══════════════════════════════════════════════════════════════════════════

window.onBuildingClick = function(zone) {
  if (cameraState.isEditMode) return;
  playClickSound();
  selectedPoiZone = zone;

  const buildingEl = document.getElementById(`building_${zone}`);
  if (buildingEl) {
    const bLeft = parseFloat(buildingEl.style.left) || 200;
    const bTop = parseFloat(buildingEl.style.top) || 200;

    const farmer = document.getElementById("farmerAvatar");
    const spriteWrapper = document.getElementById("farmerSpriteWrapper");
    if (farmer) {
      const currentLeft = parseFloat(farmer.style.left) || 480;
      if (spriteWrapper) {
        if (bLeft < currentLeft) spriteWrapper.classList.add("facing-left");
        else spriteWrapper.classList.remove("facing-left");
      }
      farmer.style.transition = "top 1.2s cubic-bezier(0.25, 1, 0.5, 1), left 1.2s cubic-bezier(0.25, 1, 0.5, 1)";
      farmer.style.top = `${bTop + 60}px`;
      farmer.style.left = `${bLeft + 20}px`;
    }
  }

  const card = document.getElementById("mapSelectedPoiCard");
  const title = document.getElementById("poiCardTitle");
  const subtitle = document.getElementById("poiCardSubtitle");
  const enterBtn = document.getElementById("poiCardEnterBtn");

  if (card && title && subtitle && enterBtn) {
    card.style.display = "flex";

    if (zone === 'colegio') {
      title.innerHTML = '🏫 IE Barro Blanco';
      subtitle.innerHTML = '🌾 Huerta Escolar Colectiva • Camas de Siembra';
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
  window.enterIsoZone(null, selectedPoiZone);
};

window.enterIsoZone = function(evt, zone) {
  playClickSound();

  if (zone.startsWith('locked')) {
    setTimeout(() => {
      playActionBlocked();
      alert("🔒 Este edificio requiere Nivel 5 o Nivel 10 de experiencia ambiental.");
    }, 300);
    return;
  }

  playBuildingEnterSound();
  const viewport = document.getElementById("overworldViewport");
  if (viewport) viewport.style.filter = "brightness(1.2)";

  setTimeout(() => {
    if (onSelectZoneCallback) {
      onSelectZoneCallback(zone);
    }
  }, 350);
};

// Acción directa en 1-tap sobre los bancales del mapa
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
    console.error("Error en acción directa:", err);
    alert("Error: " + err.message);
  }
};

window.switchHuertaViewMode = function(mode) {
  if (window.switchHuertaViewModeGlobal) {
    window.switchHuertaViewModeGlobal(mode);
  }
};

// ══════════════════════════════════════════════════════════════════════════
//  IA AUTÓNOMA DE GRANJERO Y ANIMALES
// ══════════════════════════════════════════════════════════════════════════

function initFarmerWorkerAI() {
  if (farmerWorkerTimer) clearInterval(farmerWorkerTimer);

  const farmer = document.getElementById("farmerAvatar");
  const bubble = document.getElementById("farmerBubble");
  const taskText = document.getElementById("farmerTaskText");
  const toolIcon = document.getElementById("farmerToolIcon");
  const spriteWrapper = document.getElementById("farmerSpriteWrapper");

  if (!farmer || !bubble || !taskText || !toolIcon || !spriteWrapper) return;

  const waypoints = [
    { top: 220, left: 320, tool: "💧", text: "💧 Regando la huerta escolar...", duration: 4500 },
    { top: 220, left: 780, tool: "🌱", text: "🌱 Revisando el rancho...", duration: 4500 },
    { top: 500, left: 560, tool: "🧹", text: "🧹 Limpiando el puente del río...", duration: 4500 },
    { top: 660, left: 320, tool: "🪴", text: "🪴 Volteando el compost...", duration: 4500 }
  ];

  let currentIdx = 0;

  function moveToNextWaypoint() {
    if (cameraState.isEditMode) return;
    const farmerEl = document.getElementById("farmerAvatar");
    if (!farmerEl) return;

    const wp = waypoints[currentIdx];
    currentIdx = (currentIdx + 1) % waypoints.length;

    bubble.style.display = "none";
    toolIcon.style.display = "none";

    const currentLeft = parseFloat(farmerEl.style.left) || 580;
    if (wp.left < currentLeft) {
      spriteWrapper.classList.add("facing-left");
    } else {
      spriteWrapper.classList.remove("facing-left");
    }

    farmerEl.style.transition = "top 3.2s linear, left 3.2s linear";
    farmerEl.style.top = `${wp.top}px`;
    farmerEl.style.left = `${wp.left}px`;

    setTimeout(() => {
      if (!document.getElementById("farmerAvatar") || cameraState.isEditMode) return;
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
  }, 1500);
}

function initAnimalWanderingAI() {
  if (animalTimer) clearInterval(animalTimer);

  const cow = document.getElementById("cowWalker");
  const chicken = document.getElementById("chickenWalker");

  animalTimer = setInterval(() => {
    if (cow) {
      const randTop = 720 + Math.random() * 60;
      const randLeft = 200 + Math.random() * 80;
      cow.style.top = `${randTop}px`;
      cow.style.left = `${randLeft}px`;
    }
    if (chicken) {
      const randTop = 420 + Math.random() * 50;
      const randLeft = 720 + Math.random() * 70;
      chicken.style.top = `${randTop}px`;
      chicken.style.left = `${randLeft}px`;
    }
  }, 6500);
}

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
