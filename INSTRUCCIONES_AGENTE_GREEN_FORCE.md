# PLAN DE FEATURES — Green Force PWA
# 10 Mejoras organizadas por impacto · IE Barro Blanco

---

## MATRIZ DE PRIORIZACIÓN

| # | Feature | Impacto | Complejidad | Horas est. | Sprint |
|---|---------|---------|-------------|------------|--------|
| 7 | Splash screen animado | Alto | Baja | 2–3h | Sprint 1 |
| 8 | Transiciones entre vistas | Alto | Baja | 3–4h | Sprint 1 |
| 1 | Contador regresivo | Alto | Baja | 3–4h | Sprint 1 |
| 6 | Pantalla offline dedicada | Medio | Baja | 2–3h | Sprint 1 |
| 4 | Dashboard de impacto | Alto | Media | 6–8h | Sprint 2 |
| 3 | Reproductor video inline | Medio | Media | 4–6h | Sprint 2 |
| 9 | Generador de certificados | Alto | Media | 8–10h | Sprint 2 |
| 2 | Modo presentación | Medio | Media | 5–7h | Sprint 3 |
| 10 | Módulo de votaciones | Alto | Alta | 10–14h | Sprint 3 |
| 5 | Background sync offline | Bajo | Alta | 12–16h | Sprint 3+ |

---

## SPRINT 1 — Bajo esfuerzo, alto retorno visual

---

### FEATURE 1 — Contador Regresivo Próximo Evento
**Complejidad:** Baja | **Horas estimadas:** 3–4h | **Sprint:** 1

#### Caso de uso real
Cuando un visitante o jurado de ENISI abre la app, ve en el hero de inicio
cuántos días faltan para la próxima actividad. Genera anticipación y
demuestra que el proyecto está activo.

#### Estructura Firestore
Usa la colección `eventos` que ya existe. Solo necesitas que cada documento
tenga el campo `fecha` como Timestamp de Firestore. El contador lee el
primer evento cuya fecha sea mayor a `now()` ordenado por fecha ascendente.

```
/eventos/{eventoId}
  titulo: "Siembra de árboles nativos"
  fecha: Timestamp  ← ya debe existir
  estado: "upcoming"
```

No requiere cambios en Firestore si los eventos ya tienen campo `fecha`.

#### Archivos a modificar
- `index.html`
- `styles.css`

#### INSTRUCCIONES

**PASO 1 — HTML:** Dentro de `.hero-content`, justo después del div
`.hero-message`, agrega:

```html
<!-- Countdown Widget -->
<div id="countdown-widget" class="countdown-widget" style="display:none;">
  <p class="countdown-label">
    <i class="fas fa-calendar-star"></i>
    <span id="countdown-event-name">Próxima actividad</span>
  </p>
  <div class="countdown-units">
    <div class="countdown-unit"><span id="cd-days">--</span><label>días</label></div>
    <div class="countdown-sep">:</div>
    <div class="countdown-unit"><span id="cd-hours">--</span><label>horas</label></div>
    <div class="countdown-sep">:</div>
    <div class="countdown-unit"><span id="cd-mins">--</span><label>min</label></div>
  </div>
</div>
```

**PASO 2 — CSS:** Agrega en `styles.css`:

```css
/* ===== COUNTDOWN WIDGET ===== */
.countdown-widget {
  margin-top: 1.5rem;
  background: rgba(16, 185, 129, 0.1);
  border: 1px solid rgba(16, 185, 129, 0.25);
  border-radius: 16px;
  padding: 1rem 1.5rem;
  display: inline-block;
}
.countdown-label {
  font-size: 0.78rem;
  color: rgba(255,255,255,0.6);
  margin: 0 0 0.6rem;
  text-align: center;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}
.countdown-label i { color: #10b981; margin-right: 6px; }
.countdown-units { display: flex; align-items: center; gap: 4px; }
.countdown-unit { display: flex; flex-direction: column; align-items: center; min-width: 52px; }
.countdown-unit span { font-size: 2rem; font-weight: 700; color: #10b981; line-height: 1; }
.countdown-unit label { font-size: 0.65rem; color: rgba(255,255,255,0.4); text-transform: uppercase; margin-top: 2px; }
.countdown-sep { font-size: 1.5rem; color: rgba(16,185,129,0.5); margin-bottom: 12px; }
```

**PASO 3 — JS:** Agrega la función en el script principal de `index.html`
y llámala desde `window.loadSecureContent`:

```javascript
// ─── COUNTDOWN ───────────────────────────────────────────────
async function initCountdown() {
  try {
    const { db } = await import('./firebase-config.js');
    const { collection, query, where, orderBy, limit, getDocs, Timestamp }
      = await import('https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js');

    const now = Timestamp.now();
    const q = query(
      collection(db, 'eventos'),
      where('fecha', '>=', now),
      where('estado', '==', 'upcoming'),
      orderBy('fecha', 'asc'),
      limit(1)
    );

    const snap = await getDocs(q);
    if (snap.empty) return;

    const data = snap.docs[0].data();
    const targetDate = data.fecha.toDate();
    const widget = document.getElementById('countdown-widget');
    const nameEl = document.getElementById('countdown-event-name');
    if (!widget || !nameEl) return;

    nameEl.textContent = data.titulo || 'Próxima actividad';
    widget.style.display = 'inline-block';

    function tick() {
      const diff = targetDate - new Date();
      if (diff <= 0) { widget.style.display = 'none'; return; }
      document.getElementById('cd-days').textContent  = String(Math.floor(diff / 86400000)).padStart(2,'0');
      document.getElementById('cd-hours').textContent = String(Math.floor((diff % 86400000) / 3600000)).padStart(2,'0');
      document.getElementById('cd-mins').textContent  = String(Math.floor((diff % 3600000) / 60000)).padStart(2,'0');
    }
    tick();
    setInterval(tick, 60000);
  } catch(e) { /* Widget no aparece si hay error */ }
}
// ─── END COUNTDOWN ────────────────────────────────────────────
```

En `loadSecureContent` agrega: `initCountdown();`

#### Consideraciones técnicas
- Requiere índice compuesto en Firestore: `eventos` → `estado ASC` + `fecha ASC`
- Si no hay evento futuro, el widget simplemente no se muestra
- El intervalo usa 60s (no segundos) para no sobrecargar; cambiar a 1000ms si quieres segundos visibles

---

### FEATURE 7 — Splash Screen Animado
**Complejidad:** Baja | **Horas estimadas:** 2–3h | **Sprint:** 1

#### Caso de uso real
En lugar del spinner negro genérico, la app muestra el logo de Green Force
con una animación de carga que refuerza la identidad del proyecto mientras
Firebase confirma la sesión.

#### Archivos a modificar
- `index.html`
- `styles.css`

#### INSTRUCCIONES

**PASO 1 — HTML:** Reemplaza el contenido de `<div id="auth-loader">`:

```html
<div id="auth-loader">
  <div class="splash-content">
    <div class="splash-logo-wrap">
      <img src="assets/images/1. logo 3.jpg" alt="Green Force" class="splash-logo">
      <div class="splash-ring"></div>
    </div>
    <p class="splash-title">Green Force</p>
    <p class="splash-sub">Sembrando Futuro</p>
    <div class="splash-bar-wrap"><div class="splash-bar"></div></div>
  </div>
</div>
```

**PASO 2 — CSS:** En el bloque `<style>` mínimo del head de `index.html`
(o en `styles.css`), reemplaza los estilos de `#auth-loader` por:

```css
#auth-loader {
  position: fixed; inset: 0; background: #050f0a;
  display: flex; justify-content: center; align-items: center;
  z-index: 9999;
  transition: opacity 0.5s ease, visibility 0.5s ease;
}
#auth-loader.hide { opacity: 0; visibility: hidden; pointer-events: none; }
.splash-content { display: flex; flex-direction: column; align-items: center; gap: 0.5rem; }
.splash-logo-wrap { position: relative; width: 96px; height: 96px; margin-bottom: 0.5rem; }
.splash-logo {
  width: 96px; height: 96px; border-radius: 50%; object-fit: cover;
  animation: splashPop 0.6s cubic-bezier(0.34,1.56,0.64,1) both;
}
.splash-ring {
  position: absolute; inset: -8px; border-radius: 50%;
  border: 2px solid transparent;
  border-top-color: #10b981; border-right-color: #10b981;
  animation: splashSpin 1.2s linear infinite;
}
.splash-title {
  font-family: 'Poppins', sans-serif; font-size: 1.4rem; font-weight: 700;
  color: #fff; margin: 0;
  animation: splashFade 0.6s ease 0.3s both;
}
.splash-sub {
  font-family: 'Poppins', sans-serif; font-size: 0.78rem;
  color: rgba(16,185,129,0.8); letter-spacing: 0.15em;
  text-transform: uppercase; margin: 0;
  animation: splashFade 0.6s ease 0.5s both;
}
.splash-bar-wrap {
  width: 120px; height: 3px; background: rgba(255,255,255,0.08);
  border-radius: 99px; margin-top: 1.2rem; overflow: hidden;
  animation: splashFade 0.6s ease 0.6s both;
}
.splash-bar {
  height: 100%; width: 0%;
  background: linear-gradient(90deg, #10b981, #34d399);
  border-radius: 99px;
  animation: splashLoad 2s ease 0.6s forwards;
}
@keyframes splashSpin { to { transform: rotate(360deg); } }
@keyframes splashPop  { from { opacity:0; transform:scale(0.7); } to { opacity:1; transform:scale(1); } }
@keyframes splashFade { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }
@keyframes splashLoad { 0%{width:0%} 60%{width:75%} 100%{width:100%} }
```

**PASO 3 — JS:** En `auth.js`, reemplaza la línea que oculta el loader:

```javascript
// ANTES:
if (loader) loader.style.display = 'none';

// DESPUÉS:
if (loader) {
  loader.classList.add('hide');
  setTimeout(() => { loader.style.display = 'none'; }, 500);
}
```

#### Consideraciones técnicas
- La barra de progreso es decorativa (animación CSS fija de 2s)
- La transición de `.hide` es de 500ms para que no se sienta brusco
- El fondo `#050f0a` evita cualquier flash de contenido no autenticado

---

### FEATURE 8 — Transiciones Animadas entre Vistas
**Complejidad:** Baja | **Horas estimadas:** 3–4h | **Sprint:** 1

#### Caso de uso real
Al navegar entre Inicio, Galería, Cronograma y Configuración, la vista entra
con un fade+slide suave. Da sensación de app nativa real.

#### Archivos a modificar
- `styles.css`
- `index.html` (modificar `showView()`)

#### INSTRUCCIONES

**PASO 1 — CSS:** Agrega en `styles.css`:

```css
/* ===== VIEW TRANSITIONS ===== */
.view-section.view-enter {
  animation: viewEnter 0.28s cubic-bezier(0.22, 1, 0.36, 1) both;
}
@keyframes viewEnter {
  from { opacity: 0; transform: translateY(14px); }
  to   { opacity: 1; transform: translateY(0); }
}
```

**PASO 2 — JS:** Dentro de `showView(viewName)`, localiza la parte donde
se activa la nueva vista (donde se asigna `viewEl.classList.add('active')`).
Reemplaza ese bloque por:

```javascript
// Al activar la nueva vista:
viewEl.style.display = '';
viewEl.classList.remove('view-enter');
void viewEl.offsetWidth; // fuerza reflow para reiniciar animación CSS
viewEl.classList.add('active', 'view-enter');
setTimeout(() => viewEl.classList.remove('view-enter'), 300);
```

Y donde se desactiva la vista anterior (donde se asigna `el.style.display = 'none'`):

```javascript
// Al desactivar la vista anterior — envolver en un pequeño delay:
setTimeout(() => {
  el.classList.remove('active');
  el.style.display = 'none';
}, 80);
```

#### Consideraciones técnicas
- `void viewEl.offsetWidth` fuerza reflow y permite reiniciar la animación
  si el usuario navega dos veces seguidas a la misma sección
- El delay de 80ms en la salida evita que se vean dos vistas simultáneas
- Sin librerías externas; funciona en todos los navegadores modernos

---

### FEATURE 6 — Pantalla Offline Dedicada
**Complejidad:** Baja | **Horas estimadas:** 2–3h | **Sprint:** 1

#### Caso de uso real
Un estudiante abre la app sin internet y en lugar del error del navegador
ve una pantalla bonita con el logo de Green Force y un botón de reintentar.

#### Archivos a modificar
- Crear `offline.html` (nuevo, en la raíz del proyecto)
- Modificar `sw.js`

#### INSTRUCCIONES

**PASO 1 — Crear `offline.html`:**

```html
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Sin conexión — Green Force</title>
  <link rel="manifest" href="manifest.json">
  <meta name="theme-color" content="#2E7D32">
  <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;600;700&display=swap" rel="stylesheet">
  <style>
    *{margin:0;padding:0;box-sizing:border-box}
    body {
      font-family:'Poppins',sans-serif; background:#050f0a; color:#fff;
      min-height:100vh; display:flex; flex-direction:column;
      align-items:center; justify-content:center; padding:2rem; text-align:center;
    }
    .icon {
      width:80px;height:80px;border-radius:50%;
      background:rgba(16,185,129,0.1);border:1px solid rgba(16,185,129,0.2);
      display:flex;align-items:center;justify-content:center;
      margin:0 auto 1.5rem;font-size:2.2rem;
      animation:pulse 2s ease infinite;
    }
    @keyframes pulse {
      0%,100%{box-shadow:0 0 0 0 rgba(16,185,129,0.3)}
      50%{box-shadow:0 0 0 16px rgba(16,185,129,0)}
    }
    h1{font-size:1.4rem;font-weight:600;margin-bottom:0.5rem}
    p{font-size:0.9rem;color:rgba(255,255,255,0.5);line-height:1.6;max-width:300px;margin:0 auto}
    .brand{font-size:0.72rem;color:rgba(16,185,129,0.7);letter-spacing:0.1em;text-transform:uppercase;margin-bottom:1.5rem}
    .logo{width:52px;height:52px;border-radius:50%;object-fit:cover;margin-bottom:0.75rem;opacity:0.6}
    .btn{
      margin-top:2rem;padding:12px 28px;
      background:linear-gradient(135deg,#10b981,#059669);
      border:none;border-radius:12px;color:#fff;
      font-size:0.9rem;font-weight:600;font-family:'Poppins',sans-serif;
      cursor:pointer;transition:opacity 0.2s,transform 0.2s;
    }
    .btn:hover{opacity:0.9;transform:translateY(-1px)}
  </style>
</head>
<body>
  <img src="assets/images/1. logo 3.jpg" alt="Green Force" class="logo">
  <p class="brand">Green Force · IE Barro Blanco</p>
  <div class="icon">📶</div>
  <h1>Sin conexión</h1>
  <p>Parece que no hay internet en este momento. Reconéctate para ver las últimas actividades del proyecto.</p>
  <button class="btn" onclick="location.reload()">↺ Reintentar</button>
</body>
</html>
```

**PASO 2 — Modificar `sw.js`:**

En el evento `install`, agrega `'offline.html'` al array de archivos
precacheados.

En el evento `fetch`, agrega el fallback al final del handler:

```javascript
event.respondWith(
  fetch(event.request).catch(() => {
    if (event.request.mode === 'navigate') {
      return caches.match('offline.html');
    }
  })
);
```

#### Consideraciones técnicas
- El ícono usa emoji SVG para garantizar que renderice sin Font Awesome
- `skipWaiting()` debe estar activo en el SW para que la nueva versión aplique sin cerrar la app
- El botón "Reintentar" recarga → si hay conexión, el flujo normal de auth se ejecuta

---

## SPRINT 2 — Impacto alto, complejidad media

---

### FEATURE 4 — Dashboard de Impacto Ambiental
**Complejidad:** Media | **Horas estimadas:** 6–8h | **Sprint:** 2

#### Caso de uso real
En la pantalla de inicio, debajo de "Sobre el Proyecto", aparece una fila
de tarjetas con contadores animados: 938 estudiantes, 50+ árboles, actividades
realizadas, kg de residuos. El admin actualiza los números en Firestore sin
tocar código. Es el argumento visual más fuerte ante jurados y prensa.

#### Estructura Firestore

```
/impacto/datos   (documento único)
  estudiantes_beneficiados: 938
  docentes_involucrados: 54
  arboles_plantados: 50
  actividades_realizadas: 24
  kilos_residuos: 120
  litros_agua_lluvia: 800
  comunidad_impactada: 1000
  ano_actualizacion: "2025"
```

#### Archivos a modificar
- `index.html`
- `styles.css`

#### INSTRUCCIONES

**PASO 1 — HTML:** Dentro de `div.view-section.view-home`, justo después
del cierre de `<section id="sobre">`, agrega:

```html
<section id="impacto" class="impact-section">
  <h2><i class="fas fa-chart-bar"></i> Nuestro Impacto</h2>
  <p class="impact-subtitle">Números reales de lo que hemos logrado juntos</p>
  <div class="impact-grid" id="impactGrid">
    <div class="impact-skeleton"></div>
    <div class="impact-skeleton"></div>
    <div class="impact-skeleton"></div>
    <div class="impact-skeleton"></div>
  </div>
  <p class="impact-note" id="impactNote"></p>
</section>
```

**PASO 2 — CSS:** Agrega en `styles.css`:

```css
/* ===== IMPACT DASHBOARD ===== */
.impact-section { padding: 2rem 1rem; }
.impact-subtitle { text-align:center; color:rgba(255,255,255,0.5); font-size:0.88rem; margin-bottom:1.5rem; }
.impact-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 1rem; max-width: 700px; margin: 0 auto;
}
.impact-card {
  background: rgba(16,185,129,0.07);
  border: 1px solid rgba(16,185,129,0.15);
  border-radius: 16px; padding: 1.2rem 1rem; text-align: center;
  transition: transform 0.25s, border-color 0.25s;
}
.impact-card:hover { transform: translateY(-3px); border-color: rgba(16,185,129,0.35); }
.impact-card .ic-icon { font-size: 1.5rem; color: #10b981; margin-bottom: 0.5rem; }
.impact-card .ic-value { font-size: 2rem; font-weight: 700; color: #fff; line-height: 1; display: block; }
.impact-card .ic-label { font-size: 0.72rem; color: rgba(255,255,255,0.5); text-transform: uppercase; letter-spacing: 0.05em; margin-top: 4px; display: block; }
.impact-skeleton { background: rgba(255,255,255,0.05); border-radius: 16px; height: 110px; animation: shimmer 1.5s ease infinite; }
@keyframes shimmer { 0%,100%{opacity:0.4} 50%{opacity:0.8} }
.impact-note { text-align:center; font-size:0.72rem; color:rgba(255,255,255,0.3); margin-top:1rem; }
```

**PASO 3 — JS:** Agrega la función y llámala desde `loadSecureContent`:

```javascript
// ─── IMPACT DASHBOARD ────────────────────────────────────────
const IMPACT_CONFIG = [
  { key: 'estudiantes_beneficiados', label: 'Estudiantes',       icon: 'fa-user-graduate', suffix: '' },
  { key: 'arboles_plantados',        label: 'Árboles nativos',   icon: 'fa-tree',          suffix: '+' },
  { key: 'actividades_realizadas',   label: 'Actividades',       icon: 'fa-leaf',          suffix: '' },
  { key: 'kilos_residuos',           label: 'Kg residuos',       icon: 'fa-recycle',       suffix: '' },
  { key: 'litros_agua_lluvia',       label: 'Litros agua lluvia',icon: 'fa-tint',          suffix: '' },
  { key: 'comunidad_impactada',      label: 'Comunidad',         icon: 'fa-users',         suffix: '+' },
];

async function loadImpactDashboard() {
  try {
    const { db } = await import('./firebase-config.js');
    const { doc, getDoc } = await import('https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js');
    const snap = await getDoc(doc(db, 'impacto', 'datos'));
    const grid = document.getElementById('impactGrid');
    const note = document.getElementById('impactNote');
    if (!grid) return;

    const data = snap.exists() ? snap.data() : {};
    grid.innerHTML = '';

    IMPACT_CONFIG.forEach(({ key, label, icon, suffix }) => {
      const rawVal = data[key];
      if (rawVal === undefined) return;
      const card = document.createElement('div');
      card.className = 'impact-card';
      card.innerHTML = `
        <div class="ic-icon"><i class="fas ${icon}"></i></div>
        <span class="ic-value" data-target="${rawVal}">0</span>
        <span class="ic-label">${label}</span>`;
      grid.appendChild(card);
    });

    // Animar contadores
    grid.querySelectorAll('[data-target]').forEach(el => {
      const target = parseInt(el.dataset.target);
      const suf = IMPACT_CONFIG.find(c =>
        el.closest('.impact-card')?.querySelector('.ic-label')?.textContent === c.label
      )?.suffix || '';
      let current = 0;
      const step = Math.ceil(target / 60);
      const t = setInterval(() => {
        current = Math.min(current + step, target);
        el.textContent = current.toLocaleString('es-CO') + suf;
        if (current >= target) clearInterval(t);
      }, 25);
    });

    if (data.ano_actualizacion) note.textContent = `Datos actualizados · ${data.ano_actualizacion}`;
  } catch(e) {
    const grid = document.getElementById('impactGrid');
    if (grid) grid.innerHTML = '';
  }
}
// ─── END IMPACT DASHBOARD ────────────────────────────────────
```

Agrega en `loadSecureContent`: `loadImpactDashboard();`

#### Consideraciones técnicas
- Los contadores tienen `clearInterval` → sin memory leak
- Si el documento `impacto/datos` no existe, no muestra nada (graceful)
- El admin actualiza valores directo en Firebase Console sin redeploy
- Regla Firestore: `allow read: if true; allow write: if request.auth.token.admin == true;`

---

### FEATURE 3 — Reproductor de Video Inline
**Complejidad:** Media | **Horas estimadas:** 4–6h | **Sprint:** 2

#### Caso de uso real
En la vista de videos, en lugar de abrir YouTube externamente, el video
se reproduce dentro de la app con un modal elegante. Mejor experiencia en
modo PWA instalado.

#### Estructura Firestore
```
/videos/{videoId}
  titulo: "Siembra de 1000 árboles"
  descripcion: "Jornada de reforestación 2025"
  youtube_id: "dQw4w9WgXcQ"    ← solo el ID
  fecha: Timestamp
  activo: true
```

#### Archivos a modificar
- `index.html`
- `styles.css`
- `gallery.js` (modificar cómo se renderizan las tarjetas de video)

#### INSTRUCCIONES

**PASO 1 — HTML:** Justo antes del cierre `</body>`, agrega:

```html
<!-- Modal Video Inline -->
<div id="videoModal" class="video-modal-overlay" onclick="closeVideoModal(event)">
  <div class="video-modal-container">
    <div class="video-modal-header">
      <h3 id="videoModalTitle">Cargando...</h3>
      <button class="close-modal" onclick="closeVideoModal(null, true)">
        <i class="fas fa-times"></i>
      </button>
    </div>
    <div class="video-modal-player">
      <iframe id="videoIframe" src="" frameborder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowfullscreen></iframe>
    </div>
    <p id="videoModalDesc" class="video-modal-desc"></p>
  </div>
</div>
```

**PASO 2 — CSS:**

```css
/* ===== VIDEO MODAL ===== */
.video-modal-overlay {
  position: fixed; inset: 0; background: rgba(0,0,0,0.85);
  z-index: 10000; display: none; align-items: center; justify-content: center;
  padding: 1rem; backdrop-filter: blur(4px);
}
.video-modal-overlay.open { display: flex; }
.video-modal-container {
  background: #0d1f16; border: 1px solid rgba(16,185,129,0.2);
  border-radius: 20px; width: 100%; max-width: 680px; overflow: hidden;
  animation: slideUp 0.3s cubic-bezier(0.22,1,0.36,1);
}
@keyframes slideUp {
  from { opacity:0; transform:translateY(30px) scale(0.97); }
  to   { opacity:1; transform:translateY(0) scale(1); }
}
.video-modal-header {
  display: flex; justify-content: space-between; align-items: center;
  padding: 1rem 1.25rem; border-bottom: 1px solid rgba(255,255,255,0.06);
}
.video-modal-header h3 { margin:0; font-size:0.95rem; color:#fff; font-weight:600; }
.video-modal-player { position:relative; width:100%; aspect-ratio:16/9; background:#000; }
.video-modal-player iframe { position:absolute; inset:0; width:100%; height:100%; }
.video-modal-desc { padding:0.75rem 1.25rem; font-size:0.82rem; color:rgba(255,255,255,0.5); margin:0; }
```

**PASO 3 — JS:**

```javascript
// ─── VIDEO MODAL ─────────────────────────────────────────────
function openVideoModal(youtubeId, title, description) {
  const modal  = document.getElementById('videoModal');
  const iframe = document.getElementById('videoIframe');
  if (!modal || !iframe) return;
  document.getElementById('videoModalTitle').textContent = title || 'Video';
  document.getElementById('videoModalDesc').textContent  = description || '';
  iframe.src = `https://www.youtube.com/embed/${youtubeId}?autoplay=1&rel=0`;
  modal.classList.add('open');
  document.body.style.overflow = 'hidden';
}
function closeVideoModal(event, force = false) {
  if (!force && event && event.target !== document.getElementById('videoModal')) return;
  const modal  = document.getElementById('videoModal');
  const iframe = document.getElementById('videoIframe');
  if (!modal) return;
  modal.classList.remove('open');
  iframe.src = ''; // Detiene el audio
  document.body.style.overflow = '';
}
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeVideoModal(null, true); });
window.openVideoModal  = openVideoModal;
window.closeVideoModal = closeVideoModal;
// ─── END VIDEO MODAL ─────────────────────────────────────────
```

**PASO 4 — Modificar `gallery.js`:** Donde se construye cada tarjeta de
video, reemplaza el `<a href="https://youtube.com/...">` por:

```javascript
card.innerHTML = `
  <div class="video-card" style="cursor:pointer;"
    onclick="openVideoModal('${video.youtube_id}', '${titulo}', '${desc}')">
    <div class="video-thumbnail" style="position:relative;">
      <img src="https://img.youtube.com/vi/${video.youtube_id}/mqdefault.jpg"
           alt="${titulo}" loading="lazy" style="width:100%;border-radius:12px;">
      <div style="position:absolute;inset:0;display:flex;align-items:center;
        justify-content:center;">
        <div style="width:48px;height:48px;background:rgba(16,185,129,0.9);
          border-radius:50%;display:flex;align-items:center;justify-content:center;">
          <i class="fas fa-play" style="color:#fff;font-size:18px;margin-left:3px;"></i>
        </div>
      </div>
    </div>
    <h3 style="margin:0.5rem 0 0.25rem;font-size:0.9rem;">${titulo}</h3>
    <p style="font-size:0.78rem;color:rgba(255,255,255,0.5);margin:0;">${desc}</p>
  </div>`;
```

#### Consideraciones técnicas
- `iframe.src = ''` al cerrar es crítico para detener el audio del video
- El thumbnail `mqdefault.jpg` (320x180) siempre está disponible sin API key
- `aspect-ratio: 16/9` requiere navegadores modernos. Fallback: usar
  `padding-top: 56.25%; position: relative;` con iframe absolutamente posicionado

---

### FEATURE 9 — Generador de Certificados PDF
**Complejidad:** Media | **Horas estimadas:** 8–10h | **Sprint:** 2

#### Caso de uso real
El admin selecciona una actividad y escribe el nombre del participante.
La app genera un certificado PDF institucional con logo, nombre, evento,
fecha y firma del docente. `html2pdf.js` ya está importado en el proyecto.

#### Estructura Firestore
```
/certificados/{certId}
  participante_nombre: "Nicolás Gañán Bedoya"
  participante_grado: "Grado 11°"
  evento_nombre: "Siembra 1000 árboles"
  emitido_por: "Luis Fernando Alzate López"
  fecha_emision: Timestamp
  uid_generado_por: "uid-admin"
```

#### Archivos a modificar
- `index.html`
- `styles.css`

#### INSTRUCCIONES

**PASO 1 — Botón en el cronograma:** Dentro de `#view-cronograma`,
junto al botón PDF existente, agrega (visible solo para admins igual que
`cronogramaNewBtn`):

```html
<button class="premium-action-btn" id="certBtn" style="display:none;"
  onclick="openCertModal()">
  <i class="fas fa-certificate"></i> Certificar
</button>
```

En el JS donde se muestra/oculta `cronogramaNewBtn`, agrega la misma lógica
para `certBtn`.

**PASO 2 — HTML modal + plantilla:** Antes del cierre `</body>`:

```html
<!-- Modal Certificados -->
<div id="certModal" class="modal-overlay-dark" style="display:none;">
  <div class="modal-card-premium" style="max-width:520px;">
    <div class="modal-header-premium">
      <h3><i class="fas fa-certificate"></i> Generar Certificado</h3>
      <button class="close-modal" onclick="closeCertModal()">×</button>
    </div>
    <div class="form-grid-premium" style="grid-template-columns:1fr;">
      <div class="form-group-premium">
        <label>Actividad / Evento</label>
        <select id="certEventoSelect" class="form-group-premium input">
          <option value="">Selecciona un evento...</option>
        </select>
      </div>
      <div class="form-group-premium">
        <label>Nombre del participante</label>
        <input type="text" id="certNombre" placeholder="Ej: Nicolás Gañán Bedoya">
      </div>
      <div class="form-group-premium">
        <label>Grado / Rol</label>
        <input type="text" id="certGrado" placeholder="Ej: Grado 11° · Líder Green Force">
      </div>
      <div class="form-group-premium">
        <label>Firma (nombre del docente)</label>
        <input type="text" id="certFirma" value="Luis Fernando Alzate López">
      </div>
    </div>
    <div class="modal-actions-premium">
      <button class="btn-cancel" onclick="closeCertModal()">Cancelar</button>
      <button class="btn-save-premium" onclick="generarCertificado()">
        <i class="fas fa-download"></i> Generar PDF
      </button>
    </div>
  </div>
</div>

<!-- Plantilla HTML del certificado (oculta, capturada por html2pdf) -->
<div id="cert-template" style="display:none;">
  <div style="width:794px;height:561px;background:#fff;font-family:'Poppins',sans-serif;
    padding:60px 70px;position:relative;overflow:hidden;
    border:8px solid #10b981;box-sizing:border-box;">
    <div style="position:absolute;top:-40px;right:-40px;width:250px;height:250px;
      border-radius:50%;background:rgba(16,185,129,0.06);"></div>
    <div style="position:relative;height:100%;display:flex;flex-direction:column;justify-content:space-between;">
      <div style="display:flex;justify-content:space-between;align-items:flex-start;">
        <div>
          <p style="color:#10b981;font-size:11px;letter-spacing:0.15em;text-transform:uppercase;margin:0 0 4px;font-weight:600;">Institución Educativa Barro Blanco</p>
          <h1 style="color:#1a1a1a;font-size:28px;font-weight:700;margin:0;">CERTIFICADO</h1>
          <p style="color:#6b7280;font-size:11px;margin:2px 0 0;">de participación</p>
        </div>
        <div style="text-align:right;">
          <p style="color:#10b981;font-size:13px;font-weight:700;margin:0;">GREEN FORCE</p>
          <p style="color:#9ca3af;font-size:10px;margin:2px 0 0;">Sembrando Futuro</p>
        </div>
      </div>
      <div style="text-align:center;padding:10px 0;">
        <p style="color:#6b7280;font-size:13px;margin:0 0 12px;">Se certifica que</p>
        <h2 id="cert-nombre-display" style="color:#1a1a1a;font-size:30px;font-weight:700;margin:0 0 8px;letter-spacing:-0.02em;">Nombre</h2>
        <p id="cert-grado-display" style="color:#10b981;font-size:13px;font-weight:600;margin:0 0 20px;">Grado</p>
        <p style="color:#374151;font-size:13px;margin:0 0 6px;">participó activamente en la actividad</p>
        <h3 id="cert-evento-display" style="color:#1a1a1a;font-size:18px;font-weight:600;margin:0;">Evento</h3>
      </div>
      <div style="display:flex;justify-content:space-between;align-items:flex-end;">
        <div>
          <p id="cert-fecha-display" style="color:#6b7280;font-size:11px;margin:0;">Fecha</p>
          <p style="color:#9ca3af;font-size:10px;margin:4px 0 0;">Rionegro, Antioquia — Colombia</p>
        </div>
        <div style="text-align:center;">
          <div style="width:160px;border-top:1px solid #d1d5db;padding-top:6px;">
            <p id="cert-firma-display" style="color:#374151;font-size:11px;font-weight:600;margin:0;">Firma</p>
            <p style="color:#9ca3af;font-size:10px;margin:2px 0 0;">Docente titular del proyecto</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>
```

**PASO 3 — JS:**

```javascript
// ─── CERT GENERATOR ──────────────────────────────────────────
async function openCertModal() {
  const modal  = document.getElementById('certModal');
  const select = document.getElementById('certEventoSelect');
  if (!modal) return;
  try {
    const { db } = await import('./firebase-config.js');
    const { collection, getDocs, orderBy, query }
      = await import('https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js');
    const snap = await getDocs(query(collection(db, 'eventos'), orderBy('fecha','desc')));
    select.innerHTML = '<option value="">Selecciona un evento...</option>';
    snap.forEach(doc => {
      const opt = document.createElement('option');
      opt.value = opt.textContent = doc.data().titulo;
      select.appendChild(opt);
    });
  } catch(e) {}
  modal.style.display = 'flex';
}

function closeCertModal() {
  const m = document.getElementById('certModal');
  if (m) m.style.display = 'none';
}

function generarCertificado() {
  const nombre = document.getElementById('certNombre')?.value?.trim();
  const grado  = document.getElementById('certGrado')?.value?.trim();
  const evento = document.getElementById('certEventoSelect')?.value;
  const firma  = document.getElementById('certFirma')?.value?.trim();

  if (!nombre || !evento) {
    showToast('Completa el nombre y selecciona el evento.', 'warning');
    return;
  }

  document.getElementById('cert-nombre-display').textContent = nombre;
  document.getElementById('cert-grado-display').textContent  = grado || '';
  document.getElementById('cert-evento-display').textContent = evento;
  document.getElementById('cert-firma-display').textContent  = firma || '';
  document.getElementById('cert-fecha-display').textContent  =
    new Date().toLocaleDateString('es-CO', { year:'numeric', month:'long', day:'numeric' });

  const el = document.getElementById('cert-template').firstElementChild;
  el.style.display = 'block';

  html2pdf().set({
    margin: 0,
    filename: `Certificado_${nombre.replace(/\s+/g,'_')}.pdf`,
    image: { type:'jpeg', quality:0.98 },
    html2canvas: { scale:2, useCORS:true },
    jsPDF: { unit:'px', format:[794,561], orientation:'landscape' }
  }).from(el).save().then(() => {
    el.style.display = 'none';
    showToast('Certificado generado.', 'success');
    closeCertModal();
  });
}

window.openCertModal  = openCertModal;
window.closeCertModal = closeCertModal;
window.generarCertificado = generarCertificado;
// ─── END CERT GENERATOR ──────────────────────────────────────
```

#### Consideraciones técnicas
- `html2canvas` necesita `useCORS: true` si el logo viene de Firebase Storage
- El formato `[794, 561]` es A4 apaisado en píxeles a 96dpi
- La plantilla está en el DOM pero invisible; `html2pdf` la captura sin que el usuario la vea
- Guarda el registro en Firestore `/certificados/{id}` después del `.save()` si necesitas historial

---

## SPRINT 3 — Funcionalidades avanzadas

---

### FEATURE 2 — Modo Presentación
**Complejidad:** Media | **Horas estimadas:** 5–7h | **Sprint:** 3

#### Caso de uso real
En ferias y ante el jurado ENISI el docente activa modo presentación.
La app entra en pantalla completa y cicla automáticamente entre vistas
cada 8 segundos con una barra de progreso visible. Control con flechas
del teclado o con un presenter remoto.

#### Archivos a modificar
- `index.html`
- `styles.css`

#### INSTRUCCIONES

**PASO 1 — HTML:** En el menú de perfil, después del botón "Compartir App":

```html
<div class="menu-item" onclick="startPresentationMode(); closeProfileDropdown();">
  <div class="menu-item-icon bg-blue"><i class="fas fa-tv"></i></div>
  <span>Modo Presentación</span>
  <i class="fas fa-chevron-right arrow-link"></i>
</div>
```

Antes del cierre `</body>`, agrega la barra de control:

```html
<div id="presentationControls" class="presentation-bar" style="display:none;">
  <div class="pres-progress-wrap"><div id="presProgress" class="pres-progress"></div></div>
  <div class="pres-actions">
    <button onclick="prevPresSlide()"><i class="fas fa-chevron-left"></i></button>
    <span id="presCounter" class="pres-counter">1 / 4</span>
    <button onclick="nextPresSlide()"><i class="fas fa-chevron-right"></i></button>
    <button onclick="stopPresentationMode()" class="pres-exit">
      <i class="fas fa-times"></i> Salir
    </button>
  </div>
</div>
```

**PASO 2 — CSS:**

```css
/* ===== PRESENTATION MODE ===== */
.presentation-bar {
  position:fixed;bottom:0;left:0;right:0;
  background:rgba(10,10,10,0.92);backdrop-filter:blur(8px);
  z-index:20000;padding:0.5rem 1.5rem;display:flex;flex-direction:column;gap:0.4rem;
}
.pres-progress-wrap { height:3px;background:rgba(255,255,255,0.1);border-radius:99px;overflow:hidden; }
.pres-progress { height:100%;width:0%;background:#10b981;border-radius:99px;transition:width 0.1s linear; }
.pres-actions { display:flex;align-items:center;justify-content:center;gap:1rem; }
.pres-actions button {
  background:rgba(255,255,255,0.08);border:none;color:#fff;
  width:36px;height:36px;border-radius:50%;cursor:pointer;font-size:0.8rem;
  display:flex;align-items:center;justify-content:center;transition:background 0.2s;
}
.pres-actions button:hover { background:rgba(255,255,255,0.15); }
.pres-exit { width:auto!important;padding:0 14px!important;border-radius:20px!important;font-size:0.75rem!important; }
.pres-counter { font-size:0.78rem;color:rgba(255,255,255,0.5); }
```

**PASO 3 — JS:**

```javascript
// ─── PRESENTATION MODE ───────────────────────────────────────
const PRES_SLIDES    = ['home', 'cronograma', 'galeria', 'video'];
const PRES_DURATION  = 8000;
let _presIndex = 0, _presTimer = null, _presProgressTimer = null, _presProgress = 0;

function startPresentationMode() {
  const controls = document.getElementById('presentationControls');
  if (!controls) return;
  controls.style.display = 'flex';
  if (document.documentElement.requestFullscreen) {
    document.documentElement.requestFullscreen().catch(() => {});
  }
  _presGoToSlide(0);
}

function _presGoToSlide(idx) {
  _presIndex = (idx + PRES_SLIDES.length) % PRES_SLIDES.length;
  showView(PRES_SLIDES[_presIndex]);
  const counter = document.getElementById('presCounter');
  if (counter) counter.textContent = `${_presIndex + 1} / ${PRES_SLIDES.length}`;
  clearInterval(_presProgressTimer);
  clearTimeout(_presTimer);
  _presProgress = 0;
  const bar = document.getElementById('presProgress');
  if (bar) bar.style.width = '0%';
  _presProgressTimer = setInterval(() => {
    _presProgress += (100 / (PRES_DURATION / 100));
    if (bar) bar.style.width = Math.min(_presProgress, 100) + '%';
  }, 100);
  _presTimer = setTimeout(() => nextPresSlide(), PRES_DURATION);
}

function nextPresSlide() { _presGoToSlide(_presIndex + 1); }
function prevPresSlide() { _presGoToSlide(_presIndex - 1); }

function stopPresentationMode() {
  clearInterval(_presProgressTimer);
  clearTimeout(_presTimer);
  const controls = document.getElementById('presentationControls');
  if (controls) controls.style.display = 'none';
  if (document.exitFullscreen) document.exitFullscreen().catch(() => {});
  showView('home');
}

// Control con teclado / presenter remoto
document.addEventListener('keydown', e => {
  const c = document.getElementById('presentationControls');
  if (!c || c.style.display === 'none') return;
  if (e.key === 'ArrowRight' || e.key === ' ') nextPresSlide();
  if (e.key === 'ArrowLeft') prevPresSlide();
  if (e.key === 'Escape') stopPresentationMode();
});

window.startPresentationMode = startPresentationMode;
window.nextPresSlide  = nextPresSlide;
window.prevPresSlide  = prevPresSlide;
window.stopPresentationMode = stopPresentationMode;
// ─── END PRESENTATION MODE ────────────────────────────────────
```

#### Consideraciones técnicas
- `requestFullscreen` en iOS requiere un gesto del usuario previo; el modo
  funcionará igual sin pantalla completa en esos casos
- El array `PRES_SLIDES` puede reordenarse según la narrativa de la presentación
- Agrega la vista 'impacto' al array cuando el dashboard de impacto esté listo

---

### FEATURE 10 — Módulo de Votaciones en Tiempo Real
**Complejidad:** Alta | **Horas estimadas:** 10–14h | **Sprint:** 3

#### Caso de uso real
El docente abre una votación "¿Qué actividad te gustó más?". Los estudiantes
votan desde sus teléfonos y los resultados se actualizan en tiempo real con
barras animadas. Ideal para asambleas, talleres y presentaciones ante la
comunidad educativa.

#### Estructura Firestore

```
/votaciones/{votacionId}
  pregunta: "¿Qué actividad te gustó más?"
  opciones: ["Siembra", "Compostaje", "Visita AGROSAVIA", "Reforestación"]
  activa: true
  creada_por: "uid-admin"
  fecha_creacion: Timestamp
  fecha_cierre: Timestamp | null

/votaciones/{votacionId}/votos/{uid}
  opcion_index: 2
  timestamp: Timestamp
```

Índice compuesto necesario: `votaciones` → `activa DESC` + `fecha_creacion DESC`

#### Archivos a modificar
- `index.html`
- `styles.css`

#### INSTRUCCIONES

**PASO 1 — Nav y vista:** En el `bottom-nav`, agrega:

```html
<a href="#votaciones" class="nav-item">
  <i class="fas fa-poll"></i>
  <span>Votar</span>
</a>
```

Agrega `'votaciones'` al array de vistas válidas en `showView()` y en el
listener de hash de DOMContentLoaded. Declara `let _votacionesLoaded = false;`
junto a los demás flags.

**PASO 2 — HTML de la vista:**

```html
<!-- VIEW: VOTACIONES -->
<div id="view-votaciones" class="view-section" style="display:none;">
  <section class="relative-section">
    <h2><i class="fas fa-poll"></i> Votaciones</h2>
    <div id="votacion-activa-wrap">
      <div style="text-align:center;padding:3rem 0;color:rgba(255,255,255,0.3);">
        <i class="fas fa-spinner fa-spin"></i> Buscando votación activa...
      </div>
    </div>
    <!-- Panel admin: solo visible para admins (JS lo muestra) -->
    <div id="votacion-admin-panel" style="display:none;" class="settings-card">
      <div class="settings-card-header">
        <div class="settings-icon-wrap bg-blue"><i class="fas fa-plus-circle"></i></div>
        <div>
          <h3 class="settings-card-title">Nueva Votación</h3>
          <p class="settings-card-desc">Visible solo para administradores</p>
        </div>
      </div>
      <div style="padding:1rem 0;display:flex;flex-direction:column;gap:0.75rem;">
        <input type="text" id="v-pregunta" class="form-group-premium input" placeholder="¿Cuál es tu pregunta?">
        <input type="text" id="v-op1" class="form-group-premium input" placeholder="Opción 1">
        <input type="text" id="v-op2" class="form-group-premium input" placeholder="Opción 2">
        <input type="text" id="v-op3" class="form-group-premium input" placeholder="Opción 3 (opcional)">
        <input type="text" id="v-op4" class="form-group-premium input" placeholder="Opción 4 (opcional)">
        <button class="btn-save-premium" onclick="crearVotacion()">
          <i class="fas fa-paper-plane"></i> Publicar Votación
        </button>
      </div>
    </div>
  </section>
</div>
```

**PASO 3 — CSS:**

```css
/* ===== VOTACIONES ===== */
.votacion-card {
  background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08);
  border-radius: 18px; padding: 1.5rem; max-width: 520px; margin: 0 auto 2rem;
}
.votacion-pregunta { font-size:1.1rem;font-weight:600;margin-bottom:1.2rem;text-align:center;color:#fff; }
.votacion-opciones { display:flex;flex-direction:column;gap:0.65rem; }
.voto-btn {
  position:relative;width:100%;padding:12px 16px;border-radius:12px;
  border:1px solid rgba(255,255,255,0.1);background:rgba(255,255,255,0.04);
  color:#fff;font-family:'Poppins',sans-serif;font-size:0.9rem;
  text-align:left;cursor:pointer;overflow:hidden;transition:border-color 0.2s;
}
.voto-btn:hover { border-color: rgba(16,185,129,0.4); }
.voto-btn.votado { border-color:#10b981;background:rgba(16,185,129,0.1); }
.voto-barra {
  position:absolute;top:0;left:0;bottom:0;background:rgba(16,185,129,0.12);
  border-radius:12px;transition:width 0.5s cubic-bezier(0.22,1,0.36,1);z-index:0;
}
.voto-texto { position:relative;z-index:1;display:flex;justify-content:space-between;align-items:center; }
.voto-pct { font-size:0.78rem;color:#10b981;font-weight:600; }
.votacion-total { text-align:center;font-size:0.75rem;color:rgba(255,255,255,0.35);margin-top:0.75rem; }
.votacion-cerrar-btn {
  display:block;margin:1rem auto 0;padding:8px 20px;
  background:rgba(239,68,68,0.12);border:1px solid rgba(239,68,68,0.2);
  color:#ef4444;border-radius:10px;cursor:pointer;
  font-size:0.8rem;font-family:'Poppins',sans-serif;
}
```

**PASO 4 — JS:**

```javascript
// ─── VOTACIONES ──────────────────────────────────────────────
let _votacionUnsub = null;

async function initVotaciones() {
  const wrap       = document.getElementById('votacion-activa-wrap');
  const adminPanel = document.getElementById('votacion-admin-panel');
  if (!wrap) return;

  const { db, auth } = await import('./firebase-config.js');
  const { collection, query, where, orderBy, limit, onSnapshot,
          doc, getDoc, getDocs }
    = await import('https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js');

  // Mostrar panel admin si el usuario tiene role admin
  const user = auth.currentUser;
  if (user && adminPanel) {
    const uDoc = await getDoc(doc(db, 'users', user.uid));
    if (uDoc.exists() && uDoc.data().role === 'admin') adminPanel.style.display = 'block';
  }

  // Suscripción en tiempo real a la votación activa
  if (_votacionUnsub) _votacionUnsub();
  const q = query(
    collection(db, 'votaciones'),
    where('activa', '==', true),
    orderBy('fecha_creacion', 'desc'),
    limit(1)
  );

  _votacionUnsub = onSnapshot(q, async snap => {
    if (snap.empty) {
      wrap.innerHTML = '<p style="text-align:center;padding:3rem 0;color:rgba(255,255,255,0.3);">No hay ninguna votación activa.</p>';
      return;
    }
    const votId = snap.docs[0].id;
    const vot   = snap.docs[0].data();

    let yaVoto = null;
    if (user) {
      const mv = await getDoc(doc(db, 'votaciones', votId, 'votos', user.uid));
      if (mv.exists()) yaVoto = mv.data().opcion_index;
    }

    const conteos = new Array(vot.opciones.length).fill(0);
    const vSnap = await getDocs(collection(db, 'votaciones', votId, 'votos'));
    vSnap.forEach(v => { if (v.data().opcion_index !== undefined) conteos[v.data().opcion_index]++; });
    const total = conteos.reduce((a,b) => a+b, 0);

    const isAdmin = adminPanel?.style.display !== 'none';
    const optsHtml = vot.opciones.map((op, i) => {
      const pct   = total > 0 ? Math.round((conteos[i]/total)*100) : 0;
      const activo = yaVoto === i ? 'votado' : '';
      return `<button class="voto-btn ${activo}" onclick="registrarVoto('${votId}', ${i})">
        <div class="voto-barra" style="width:${yaVoto !== null ? pct : 0}%"></div>
        <div class="voto-texto">
          <span>${op}</span>
          ${yaVoto !== null ? `<span class="voto-pct">${pct}%</span>` : ''}
        </div>
      </button>`;
    }).join('');

    wrap.innerHTML = `
      <div class="votacion-card">
        <p class="votacion-pregunta">${vot.pregunta}</p>
        <div class="votacion-opciones">${optsHtml}</div>
        <p class="votacion-total">${total} ${total === 1 ? 'voto' : 'votos'}</p>
        ${isAdmin ? `<button class="votacion-cerrar-btn" onclick="cerrarVotacion('${votId}')">
          <i class="fas fa-stop-circle"></i> Cerrar votación</button>` : ''}
      </div>`;
  });
}

async function registrarVoto(votacionId, opcionIndex) {
  const { db, auth } = await import('./firebase-config.js');
  const { doc, setDoc, serverTimestamp }
    = await import('https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js');
  const user = auth.currentUser;
  if (!user) { showToast('Debes iniciar sesión para votar.', 'warning'); return; }
  try {
    await setDoc(doc(db, 'votaciones', votacionId, 'votos', user.uid), {
      opcion_index: opcionIndex,
      timestamp: serverTimestamp()
    });
    showToast('¡Voto registrado!', 'success');
  } catch(e) { showToast('Error al registrar voto.', 'error'); }
}

async function crearVotacion() {
  const pregunta = document.getElementById('v-pregunta')?.value?.trim();
  const ops = ['v-op1','v-op2','v-op3','v-op4']
    .map(id => document.getElementById(id)?.value?.trim()).filter(Boolean);
  if (!pregunta || ops.length < 2) {
    showToast('Escribe la pregunta y al menos 2 opciones.', 'warning');
    return;
  }
  try {
    const { db, auth } = await import('./firebase-config.js');
    const { collection, addDoc, serverTimestamp }
      = await import('https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js');
    await addDoc(collection(db, 'votaciones'), {
      pregunta, opciones: ops, activa: true,
      creada_por: auth.currentUser?.uid,
      fecha_creacion: serverTimestamp(), fecha_cierre: null
    });
    ['v-pregunta','v-op1','v-op2','v-op3','v-op4'].forEach(id => {
      const el = document.getElementById(id); if(el) el.value = '';
    });
    showToast('Votación publicada.', 'success');
  } catch(e) { showToast('Error al crear la votación.', 'error'); }
}

async function cerrarVotacion(votacionId) {
  if (!confirm('¿Cerrar esta votación?')) return;
  try {
    const { db } = await import('./firebase-config.js');
    const { doc, updateDoc, serverTimestamp }
      = await import('https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js');
    await updateDoc(doc(db, 'votaciones', votacionId), {
      activa: false, fecha_cierre: serverTimestamp()
    });
    showToast('Votación cerrada.', 'info');
  } catch(e) { showToast('Error al cerrar la votación.', 'error'); }
}

window.registrarVoto  = registrarVoto;
window.crearVotacion  = crearVotacion;
window.cerrarVotacion = cerrarVotacion;
// ─── END VOTACIONES ───────────────────────────────────────────
```

En `showView()`:

```javascript
if (viewName === 'votaciones' && !_votacionesLoaded) {
  initVotaciones();
  _votacionesLoaded = true;
}
```

#### Consideraciones técnicas
- El listener `onSnapshot` se suscribe solo cuando el usuario navega a esa vista
- Un usuario solo puede votar una vez: el UID es el ID del documento en la subcolección
- `_votacionUnsub()` cancela el listener si se reinicializa, evitando listeners duplicados
- Reglas Firestore recomendadas:
  ```
  match /votaciones/{vid} {
    allow read: if true;
    allow create: if request.auth != null;
    allow update: if request.auth.token.admin == true;
  }
  match /votaciones/{vid}/votos/{uid} {
    allow read: if true;
    allow create: if request.auth.uid == uid;
    allow update, delete: if false;
  }
  ```

---

### FEATURE 5 — Background Sync para Uploads Offline
**Complejidad:** Alta | **Horas estimadas:** 12–16h | **Sprint:** 3+

#### Caso de uso real
Un admin sube una foto desde el patio sin señal. La imagen se guarda en
IndexedDB con un badge "⏳ Pendiente". Cuando vuelve el internet, el
Service Worker sincroniza automáticamente.

#### Estructura local (IndexedDB)
```
DB: greenforce-offline
Store: pending-uploads
  { id(autoincrement), titulo, descripcion, year, imageBlob, timestamp }
```

#### Archivos a modificar
- Crear `offline-queue.js` (nuevo módulo)
- Modificar `sw.js`
- Modificar `index.html` (handler del submit de nueva actividad)

#### INSTRUCCIONES

**PASO 1 — Crear `offline-queue.js`:**

```javascript
const DB_NAME = 'greenforce-offline', STORE = 'pending-uploads', VER = 1;

function openDB() {
  return new Promise((res, rej) => {
    const r = indexedDB.open(DB_NAME, VER);
    r.onupgradeneeded = e => e.target.result.createObjectStore(STORE, { keyPath:'id', autoIncrement:true });
    r.onsuccess = e => res(e.target.result);
    r.onerror   = e => rej(e.target.error);
  });
}
export async function addPendingUpload(data) {
  const db = await openDB();
  const tx = db.transaction(STORE, 'readwrite');
  return new Promise((res, rej) => {
    const r = tx.objectStore(STORE).add({ ...data, timestamp: Date.now() });
    r.onsuccess = () => res(r.result);
    r.onerror   = () => rej(r.error);
  });
}
export async function getPendingUploads() {
  const db = await openDB();
  return new Promise((res, rej) => {
    const r = db.transaction(STORE,'readonly').objectStore(STORE).getAll();
    r.onsuccess = () => res(r.result);
    r.onerror   = () => rej(r.error);
  });
}
export async function removePendingUpload(id) {
  const db = await openDB();
  return new Promise((res, rej) => {
    const r = db.transaction(STORE,'readwrite').objectStore(STORE).delete(id);
    r.onsuccess = () => res();
    r.onerror   = () => rej(r.error);
  });
}
```

**PASO 2 — En `sw.js`, agrega al final:**

```javascript
self.addEventListener('sync', event => {
  if (event.tag === 'sync-activities') event.waitUntil(syncPendingActivities());
});
async function syncPendingActivities() {
  // Aquí implementas la lógica de sincronización usando la Firestore REST API
  // o una Cloud Function. Outline mínimo:
  // 1. Abrir IndexedDB, obtener pending-uploads
  // 2. Para cada item, hacer fetch a Firestore REST API con el blob
  // 3. Si exitoso, eliminar de IndexedDB con removePendingUpload(id)
}
```

**PASO 3 — En `index.html`, en el handler del submit de nueva actividad:**

```javascript
async function handleNewActivity(formData) {
  if (!navigator.onLine) {
    const { addPendingUpload } = await import('./offline-queue.js');
    await addPendingUpload(formData);
    if ('serviceWorker' in navigator && 'SyncManager' in window) {
      const reg = await navigator.serviceWorker.ready;
      await reg.sync.register('sync-activities');
    }
    showToast('Sin conexión. Se sincronizará al reconectarse.', 'warning', 5000);
    return;
  }
  await uploadActivity(formData); // función existente
}
```

**PASO 4 — Indicador de pendientes al cargar la galería:**

```javascript
async function checkPendingUploads() {
  try {
    const { getPendingUploads } = await import('./offline-queue.js');
    const pending = await getPendingUploads();
    if (pending.length > 0) {
      showToast(`${pending.length} actividad(es) pendientes de sincronizar.`, 'warning', 6000);
    }
  } catch(e) {}
}
```

Llama `checkPendingUploads()` cuando se carga la vista galería.

#### Consideraciones técnicas
- Background Sync NO está disponible en iOS Safari < 17.4. Fallback:
  `window.addEventListener('online', () => syncPendingActivities())` que
  intenta sincronizar cuando el usuario abre la app con conexión
- Limita el tamaño máximo de imagen offline a 2MB para no saturar IndexedDB
- Para Sprint 3+ se recomienda empezar solo con el indicador visual (Paso 4)
  y el listener `online` antes de implementar el SW sync completo

---

## RESUMEN EJECUTIVO

### Sprints y horas totales

| Sprint | Features | Horas estimadas |
|--------|----------|-----------------|
| Sprint 1 | Splash (7) + Transiciones (8) + Countdown (1) + Offline page (6) | 10–14h |
| Sprint 2 | Dashboard impacto (4) + Video inline (3) + Certificados (9) | 18–24h |
| Sprint 3 | Presentación (2) + Votaciones (10) + Background Sync (5) | 27–37h |

### Colecciones Firestore nuevas a crear

| Colección | Descripción |
|-----------|-------------|
| `/impacto/datos` | Documento único con métricas del proyecto |
| `/votaciones/{id}` | Votaciones con subcolección `/votos/{uid}` |
| `/certificados/{id}` | Registro de certificados emitidos |

### Reglas Firestore consolidadas para agregar

```javascript
match /impacto/{doc} {
  allow read: if true;
  allow write: if request.auth.token.admin == true;
}
match /votaciones/{vid} {
  allow read: if true;
  allow create: if request.auth != null;
  allow update: if request.auth.token.admin == true;
}
match /votaciones/{vid}/votos/{uid} {
  allow read: if true;
  allow create: if request.auth.uid == uid;
  allow update, delete: if false;
}
match /certificados/{cid} {
  allow read, write: if request.auth.token.admin == true;
}
```
