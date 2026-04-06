# Análisis del Menú Inferior (Bottom Nav) - Green Force

## 1. Estructura HTML

**Ubicación:** Línea 2258-2280 en `index.html`

```html
<nav class="bottom-nav">
  <a href="#sobre" class="nav-item active">
    <i class="fas fa-home"></i>
    <span>Inicio</span>
  </a>
  <a href="#cronograma" class="nav-item">
    <i class="fas fa-leaf"></i>
    <span>Cronograma</span>
  </a>
  <a href="#galeria" class="nav-item">
    <i class="fas fa-images"></i>
    <span>Galería</span>
  </a>
  <a href="#video" class="nav-item">
    <i class="fas fa-play-circle"></i>
    <span>Videos</span>
  </a>
  <a href="#documentos" class="nav-item">
    <i class="fas fa-file-alt"></i>
    <span>Docs</span>
  </a>
  <a id="groupChatBtn" href="https://chat.whatsapp.com/L0hrcQ9JWmUB5DQui9ZrXv" class="nav-item" target="_blank" rel="noopener noreferrer" title="Abrir chat grupal del Grupo Ambiental">
    <i class="fas fa-comments"></i>
    <span>Chat</span>
  </a>
</nav>
```

El menú tiene **6 items de navegación**: Inicio, Cronograma, Galería, Videos, Docs y Chat.

---

## 2. Animaciones CSS del Menú Inferior

### A) Contenedor Principal (.bottom-nav)

**Ubicación:** Línea 2028-2075 en `styles.css`

```css
/* Bottom Navigation - Premium Floating Glassmorphism Style */
.bottom-nav {
  display: flex !important;
  position: fixed !important;
  bottom: 20px !important;
  left: 50% !important;
  transform: translateX(-50%) !important;

  width: auto !important;
  min-width: 320px;
  max-width: 90%;
  height: 65px;
  padding: 0 25px;

  /* ✅ Glassmorphism real */
  background: rgba(255, 255, 255, 0.12) !important;
  backdrop-filter: blur(20px) saturate(180%);
  -webkit-backdrop-filter: blur(20px) saturate(180%);

  border: 1px solid rgba(255, 255, 255, 0.25);
  box-shadow:
    0 8px 32px rgba(0, 0, 0, 0.25),
    inset 0 1px 0 rgba(255, 255, 255, 0.3);
  border-radius: 50px;

  z-index: 10000 !important;
  visibility: visible !important;
  opacity: 1 !important;

  justify-content: space-between;
  align-items: center;
  gap: 10px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  padding-bottom: env(safe-area-inset-bottom);
  margin-bottom: env(safe-area-inset-bottom);
}
```

**Características principales:**
- **Efecto Glassmorphism:** Fondo translúcido con `backdrop-filter: blur(20px)`
- **Sombra doble:** Una sombra externa y una interna (inset) para profundidad
- **Posicionamiento:** Fijo en la parte inferior, centrado horizontalmente
- **Curva de animación:** `cubic-bezier(0.4, 0, 0.2, 1)` para transiciones suaves

### B) Estados del Menú (Hover)

**Ubicación:** Línea 2064-2071 en `styles.css`

```css
.bottom-nav:hover {
  box-shadow:
    0 15px 40px rgba(0, 0, 0, 0.35),
    inset 0 1px 0 rgba(255, 255, 255, 0.4);
  transform: translateX(-50%) translateY(-3px) !important;
}
```

**Al pasar el mouse:**
- La sombra se intensifica (de 8px a 15px)
- El menú **sube 3 píxeles** (`translateY(-3px)`)
- Efecto de "levantamiento" sutil

---

### C) Items del Menú (.nav-item)

**Ubicación:** Línea 2080-2110 en `styles.css`

```css
.nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #99fbad;
  text-decoration: none;
  font-size: 0.65rem;
  font-weight: 500;
  gap: 2px;
  transition: all 0.3s ease;
  padding: 5px 0;
  border-radius: 12px;
  flex: 1;
  position: relative;
}

.nav-item i {
  font-size: 1.4rem;
  margin-bottom: 2px;
  transition: transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}
```

**Propiedades:**
- **Color por defecto:** Verde claro `#99fbad`
- **Transición de iconos:** `0.2s` con curva elástica
- **Curva ElÃ¡stica:** `cubic-bezier(0.175, 0.885, 0.32, 1.275)` - Efecto "rebote"

---

### D) Estado Activo (.nav-item.active)

**Ubicación:** Línea 2110-2135 en `styles.css`

```css
.nav-item.active {
  color: var(--primary);
}

.nav-item.active i {
  transform: scale(1.1);
  filter: drop-shadow(0 4px 6px rgba(46, 125, 50, 0.3));
  color: var(--primary);
}

.nav-item.active span {
  opacity: 1;
  font-weight: 700;
}

/* Specific styling for the Active indicator */
.nav-item.active::after {
  content: '';
  position: absolute;
  bottom: 5px;
  width: 4px;
  height: 4px;
  background: var(--primary);
  border-radius: 50%;
  box-shadow: 0 0 8px var(--primary);
}
```

**Animaciones cuando está activo:**
- **Icono:** Ampliado al 110% (`scale(1.1)`)
- **Sombra del icono:** `drop-shadow(0 4px 6px rgba(46, 125, 50, 0.3))`
- **Texto:** Negrita (`font-weight: 700`)
- **Indicador de punto:** Un círculo de 4x4px con brillo verde (`box-shadow: 0 0 8px var(--primary)`)

---

### E) Botón de Chat (#groupChatBtn)

**Ubicación:** Línea 2140-2175 en `styles.css`

```css
/* Styling for Chat button in bottom nav */
#groupChatBtn {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #25D366 !important;
  text-decoration: none;
  font-size: 0.65rem;
  font-weight: 500;
  gap: 2px;
  transition: all 0.3s ease;
  padding: 5px 0;
  border-radius: 12px;
  flex: 1;
  position: relative;
}

#groupChatBtn i {
  font-size: 1.4rem;
  margin-bottom: 2px;
  transition: transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  color: #25D366;
  display: block;
}

#groupChatBtn:hover {
  color: #25D366 !important;
}

#groupChatBtn:hover i {
  transform: scale(1.15);
  filter: drop-shadow(0 4px 8px rgba(37, 211, 102, 0.4));
}

#groupChatBtn span {
  font-weight: 500;
  transition: opacity 0.2s;
  color: #25D366;
}

/* Chat button indicator dot */
#groupChatBtn::after {
  content: '';
  position: absolute;
  bottom: 5px;
  width: 4px;
  height: 4px;
  background: #25D366;
  border-radius: 50%;
  box-shadow: 0 0 8px rgba(37, 211, 102, 0.6);
}
```

**Especial del botón de WhatsApp:**
- **Color:** Verde WhatsApp `#25D366`
- **Hover:** Amplía al 115% (`scale(1.15)`)
- **Sombra:** Verde con opacidad `rgba(37, 211, 102, 0.4)`
- **Punto indicador:** Con brillo verde WhatsApp

---

## 3. Animación por JavaScript

**Ubicación:** Línea 1774-1785 en `index.html`

```javascript
// Update Bottom Nav State
const navLinks = document.querySelectorAll('.bottom-nav .nav-item');
navLinks.forEach(el => {
  el.classList.remove('active');  // Remueve la clase 'active'
  const href = el.getAttribute('href').substring(1);
  if (href === viewName || (viewName === 'home' && href === 'sobre')) {
    el.classList.add('active');  // Agrega 'active' al item actual
  }
});
```

**Función:**
- Obtiene todos los items del menú inferior
- Remueve la clase `active` de todos
- Agrega la clase `active` al item correspondiente según la sección actual
- Esta lógica se ejecuta cuando se navega entre secciones

---

## 4. Resumen de Animaciones

| **Elemento** | **Animación** | **Duración** | **Efecto** |
|---|---|---|---|
| `.bottom-nav` (menú entero) | `hover` | 0.3s | Sube 3px + sombra más fuerte |
| `.nav-item i` (icono) | `hover` | 0.2s cubic-bezier | Escala a 1.2x |
| `.nav-item.active i` | Estado activo | - | Escala 1.1x + sombra verde |
| `.nav-item.active::after` | Indicador de punto | - | Punto brillante verde con glow |
| `#groupChatBtn i` (WhatsApp) | `hover` | 0.2s cubic-bezier | Escala 1.15x + sombra WhatsApp |

---

## 5. Curvas de Animación (Easing)

### Curva Principal del Menú
```
cubic-bezier(0.4, 0, 0.2, 1)
```
- **Efecto:** Transición suave y natural
- **Velocidad:** Rápida al inicio, lenta al final (ease-out)

### Curva de los Iconos (Efecto Elástico)
```
cubic-bezier(0.175, 0.885, 0.32, 1.275)
```
- **Efecto:** Rebote elástico (overshoot)
- **Velocidad:** Llega a 127.5% antes de volver atrás
- **Sensación:** Más dinámica y juguetona

---

## 6. Variables CSS Usadas

```css
--primary: #059669;              /* Verde principal */
--secondary: #047857;            /* Verde secundario */
--accent: #10b981;               /* Verde acento */
```

**Colores especiales:**
- Item activo: `var(--primary)` = `#059669`
- Chat WhatsApp: `#25D366`
- Verde claro (default): `#99fbad`

---

## 7. Diseño Responsivo

**Ubicación:** Línea 2177-2220 en `styles.css`

```css
/* Adjust Body Padding */
body {
  padding-bottom: 80px;  /* Space for bottom nav */
}
```

El menú inferior deja espacio en la parte inferior del body para no cubrir contenido.

---

## Conclusión

El menú inferior de Green Force utiliza:
1. **Glassmorphism:** Efecto de vidrio translúcido moderno
2. **Animaciones suaves:** Transiciones de 0.2s a 0.3s
3. **Feedback visual:** Cambio de escala y color al interactuar
4. **Indicadores de estado:** Punto brillante que muestra qué sección está activa
5. **Diseño accesible:** Iconos grandes (1.4rem) con etiquetas de texto

