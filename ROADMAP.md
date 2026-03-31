# Green Force PWA — Roadmap de Mejoras 🌱

Documento de features e impacto potencial basado en análisis del código actual.

---

## 🎯 Funcionalidades que le darían vida a la app

### 1. Contador Regresivo de Próximo Evento
**Impacto:** Alto | **Complejidad:** Media | **Tiempo:** 4-6 horas

- Mostrar "Próxima actividad en X días" en el hero de la pantalla de inicio
- Datos consultados directamente desde Firestore (cronograma)
- Diseño visual llamativo con animación de cuenta regresiva
- Actualización automática cada medianoche

**Técnica:**
```javascript
// Calcular diferencia de días hasta próximo evento
const proximoEvento = eventos.find(e => e.fecha > hoy);
const diasRestantes = Math.ceil((proximoEvento.fecha - hoy) / (1000 * 60 * 60 * 24));
```

---

### 2. Modo Presentación
**Impacto:** Alto | **Complejidad:** Media | **Tiempo:** 6-8 horas

- Botón de **"Modo Presentación"** que cierra interfaz de usuario
- Cicla automáticamente por: Galería → Estadísticas → Cronograma → Inicio
- Ciclo continuo cada 8 segundos (configurable)
- Transiciones suaves entre vistas
- Pantalla completa (fullscreen API)
- Ideal para ferias, presentaciones ante ENISI o comunidad

**Casos de uso:**
- Exposición en ferias ambientales
- Presentación ante jurado ENISI
- Displays en el colegio
- Difusión en eventos comunitarios

---

### 3. Reproductor de Video Inline
**Impacto:** Medio | **Complejidad:** Baja | **Tiempo:** 3-4 horas

- Galería actual solo muestra fotos, pero código soporta videos
- Reemplazar redirección a YouTube con reproductor nativo `<video>`
- Usar thumbnails como posters
- Controles nativos del navegador
- Fallback a enlace de YouTube si el navegador no soporta

**Ventajas:**
- Mejor experience sin salir de la app
- Funciona offline (si videos están cacheados)
- Menor consumo de datos
- Integración con Service Worker existente

---

## 📊 Datos e Impacto Ambiental

### 4. Dashboard de Impacto Animado
**Impacto:** Alto | **Complejidad:** Media | **Tiempo:** 8-10 horas

Visualizar datos concretos del proyecto con counters animados:

```
┌─────────────────────────────────────────┐
│  🌳 938 Estudiantes Participando       │
│  🌱 50 Árboles Plantados               │
│  ♻️  2,340 kg de Residuos Reciclados   │
│  📅 47 Actividades Realizadas          │
│  💧 12,500 L de Agua Ahorrada          │
└─────────────────────────────────────────┘
```

**Características:**
- Counters que animan de 0 → valor final
- Cards con iconos por categoría
- Datos editables por admin en Firestore
- Actualización en tiempo real
- Visualización de progreso semanal/mensual

**Estructura Firestore:**
```
/impacto
  ├── estudiantes: 938
  ├── arbolesPlantados: 50
  ├── residuosReciclados: 2340
  ├── actividadesRealizadas: 47
  ├── aguaAhorrada: 12500
  └── ultimaActualizacion: timestamp
```

---

## 🔄 Mejoras PWA Reales

### 5. Background Sync para Offline
**Impacto:** Alto | **Complejidad:** Alta | **Tiempo:** 10-12 horas

Sincronización automática de cambios cuando se recupera conexión:

- Admin sube actividad **sin conexión** → se encola en IndexedDB
- App muestra indicador "En espera de sincronización"
- Cuando vuelve internet → sincroniza automáticamente con Firestore
- Confirmación visual al usuario

**Casos de uso:**
- Upload de fotos en campo sin señal
- Creación de actividades en transporte
- Sincronización de comentarios/likes

---

### 6. Pantalla Offline Dedicada
**Impacto:** Medio | **Complejidad:** Baja | **Tiempo:** 3-4 horas

Reemplazar error de navegador genérico:

```
┌──────────────────────────────────┐
│     🌱 Green Force (Offline)      │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│                                  │
│   📡 Sin conexión a internet      │
│                                  │
│   Última actividad guardada:      │
│   • Proyecto de compostaje       │
│   • Charla ambiental             │
│   • Limpieza de río              │
│                                  │
│  [Reintentar conexión]  [Inicio] │
└──────────────────────────────────┘
```

**Ya implementado:** `offline.html` existe, mejorar con datos cacheados

---

## 👥 Experiencia del Usuario

### 7. Splash Screen Animado
**Impacto:** Medio | **Complejidad:** Media | **Tiempo:** 4-6 horas

Mejorar experiencia de autenticación y carga inicial:

- Logo de Green Force animado
- Barra de progreso verde (gradient institucional)
- Estado detallado: "Verificando identidad..." → "Cargando datos..." → "Listo"
- Duración máxima 3 segundos
- Fallback si autenticación falla

---

### 8. Transiciones Animadas Entre Vistas
**Impacto:** Medio | **Complejidad:** Baja | **Tiempo:** 4-5 horas

Mejorar sensación de app nativa:

- Fade suave al cambiar de sección
- Slide horizontal entrada/salida
- Bounce en header al cargar datos
- Animaciones solo en desktop/tablets (performance mobile)

**Rutas afectadas:**
- `#galeria` ↔ `#cronograma`
- `#videos` ↔ `#documentos`
- `#home` ↔ cualquier sección

---

## 🎓 Para el Contexto Escolar

### 9. Generador de Certificados PDF
**Impacto:** Alto | **Complejidad:** Media | **Tiempo:** 6-8 horas

Crear certificados de participación automáticamente:

```
┌─────────────────────────────────────┐
│                                     │
│         CERTIFICADO DE               │
│         PARTICIPACIÓN                │
│                                     │
│  El presente certifica que           │
│                                     │
│  Juan Pérez González                │
│                                     │
│  participó en la actividad:          │
│  "Jornada de Siembra 2025"          │
│                                     │
│  Realizada el 15 de marzo de 2025   │
│                                     │
│  IE Barro Blanco — Green Force      │
│  [Logo]        [Firma Admin]         │
└─────────────────────────────────────┘
```

**Workflow:**
1. Admin selecciona evento en cronograma
2. Admin elige estudiantes participantes
3. Click en "Generar Certificados"
4. App descarga PDF por cada estudiante
5. Nombre automático: `Certificado_JuanPerez_Siembra2025.pdf`

**Infraestructura disponible:** `html2pdf.js` ya está importado en index.html

---

### 10. Módulo de Votación/Encuesta en Tiempo Real
**Impacto:** Medio | **Complejidad:** Media | **Tiempo:** 6-7 horas

Encuestas rápidas con resultados en vivo:

```
📊 ¿Qué actividad te gustó más?

  🌳 Siembra de árboles       ███████ 42%
  ♻️  Taller de compostaje    ████ 28%
  💧 Limpieza de río          ███ 20%
  📚 Charla ambiental         ██ 10%

[Tu voto] [Ver resultados] [Compartir]
```

**Casos de uso:**
- Votaciones en vivo durante presentaciones
- Encuestas de satisfacción post-actividad
- Presenciar cambio de resultados en tiempo real (WebSocket/Firestore listeners)

**Estructura Firestore:**
```
/encuestas/{encuestaId}
  ├── pregunta: "¿Qué actividad te gustó más?"
  ├── opciones:
  │   ├── "Siembra de árboles": 42
  │   ├── "Taller de compostaje": 28
  │   ├── "Limpieza de río": 20
  │   └── "Charla ambiental": 10
  ├── activa: true
  └── createdAt: timestamp
```

---

## 📈 Matriz de Priorización

| # | Feature | Impacto | Complejidad | Horas | Prioridad |
|---|---------|---------|-------------|-------|-----------|
| 1 | Contador Regresivo | 🔴 Alto | 🟡 Media | 4-6 | 🥇 |
| 2 | Modo Presentación | 🔴 Alto | 🟡 Media | 6-8 | 🥇 |
| 4 | Dashboard Impacto | 🔴 Alto | 🟡 Media | 8-10 | 🥇 |
| 9 | Generador Certificados | 🔴 Alto | 🟡 Media | 6-8 | 🥈 |
| 3 | Reproductor Video | 🟠 Medio | 🟢 Baja | 3-4 | 🥈 |
| 5 | Background Sync | 🔴 Alto | 🔴 Alta | 10-12 | 🥉 |
| 8 | Transiciones | 🟠 Medio | 🟢 Baja | 4-5 | 🥉 |
| 10 | Votaciones | 🟠 Medio | 🟡 Media | 6-7 | 🥉 |
| 7 | Splash Screen | 🟠 Medio | 🟡 Media | 4-6 | 🥉 |
| 6 | Pantalla Offline | 🟠 Medio | 🟢 Baja | 3-4 | 🥉 |

---

## ✅ Próximos Pasos Recomendados

**Sprint 1 (Semana 1-2):**
- [ ] Feature #1: Contador Regresivo
- [ ] Feature #2: Modo Presentación
- [ ] Feature #4: Dashboard de Impacto

**Sprint 2 (Semana 3-4):**
- [ ] Feature #9: Generador de Certificados
- [ ] Feature #3: Reproductor de Video

**Sprint 3+ (Later):**
- [ ] Feature #5: Background Sync (complejo, requiere testing)
- [ ] Features #6-10: Polish y complementos

---

## 🔧 Consideraciones Técnicas

- **Todos los datos se guardan en Firestore** para sincronización en tiempo real
- **Service Worker v32** actual es base sólida para mejoras
- **Firebase Auth** se integra nativamente con todos los features
- **Responsive design** ya está, expandir animaciones con media queries
- **PWA manifest** actual soportará todos estos nuevos features

---

**Última actualización:** 31 de marzo de 2026  
**Estado:** Documento de Planificación  
**Responsable:** Equipo Green Force
