# INSTRUCCIONES PARA EL AGENTE — Huerta Escolar: Bitácora de Cultivos + Vista de Granja (Green Force)

Este documento reemplaza/extiende a `INSTRUCCIONES_AGENTE_HUERTA_ESCOLAR.md`:
mantiene el mismo modelo de datos y reglas de negocio, y agrega una **vista de
juego** como interfaz alternativa sobre los mismos datos reales.

## 0. Principio de diseño (no negociable)

**Un solo dato, dos renderizados. Nunca dos fuentes de verdad.**
No existe un "modo juego" con puntos falsos separado de un "modo real" con
formularios. Cada acción del juego (regar, abonar, cosechar) escribe
directamente en las mismas colecciones de Firestore que usa la vista clásica.
La animación es la confirmación visual de una escritura real, no una capa
decorativa aparte. Esto es crítico porque estos datos alimentan investigación
educativa real (UNADE) y la administración de la huerta del colegio: no pueden
ser ficticios.

**El juego respeta los intervalos reales de cada especie.** El botón de
"Regar" está deshabilitado hasta que `nextWateringDue` (definido en el módulo
base) realmente se cumpla. No se puede ganar XP regando varias veces el mismo
día. El juego premia el cuidado correcto, no el clic.

---

## 1. Modelo de datos (resumen — ver detalle completo en el documento base del módulo)

Colecciones ya definidas: `cropTypes`, `plots`, `crops` (con subcolecciones
`riegos`, `fertilizaciones`, `cosechas`, `incidencias`). Se agregan los
siguientes campos para soportar la progresión de juego:

### `plots/{id}` — se agregan campos
```ts
{
  // ...campos existentes (name, description, isActive)...
  order: number,                 // orden de desbloqueo, empezando en 0
  gameStatus: 'bloqueada' | 'desbloqueada' | 'en_uso',
  unlockedAt: Timestamp | null,
  unlockedByHarvestOf: string | null   // id de crops que la desbloqueó
}
```

Regla de desbloqueo: al registrar una cosecha (`crops/{id}` pasa a
`cosechado`) sobre la cama actualmente `en_uso`, se busca el `plot` con el
siguiente `order` y, si existe y está `bloqueada`, se actualiza a
`desbloqueada` en la misma transacción. La primera cama (`order: 0`) arranca
`desbloqueada` desde el seed inicial; el resto arrancan `bloqueada`.

### `users/{uid}` — se agrega campo
```ts
{
  // ...campos existentes...
  preferredView: 'juego' | 'clasica',   // default 'juego'
  farmXp: number,      // puede ser el mismo XP si Green Force ya tiene gamificación general, o uno propio del módulo
  farmCoins: number
}
```

---

## 2. Referencias visuales (mezclar, no copiar ninguna al 100%)

- **Stardew Valley** → etapas de crecimiento por sprite (semilla → brote →
  creciendo → lista para cosecha) y paleta cálida, acogedora.
- **Hay Day / Township** → mecánica de desbloqueo de la siguiente cama al
  completar la actual; sensación de progreso tangible.
- **Animal Crossing** → animales ambientales (gallina, mariposa, pájaro) que
  cruzan la escena sin ninguna lógica de datos detrás — puro ambiente.

No usar sprites ni assets de estas franquicias: son referencia de *estilo*,
todo el arte debe ser propio (ilustración SVG encargada/generada, o banco de
assets libres de derechos con licencia clara).

---

## 3. Arquitectura técnica de la vista de juego

**No usar un motor de videojuego** (Phaser, Unity, PixiJS con físicas/cámaras).
Es una PWA de datos con piel de juego que debe correr fluida en celulares de
estudiantes del colegio; un motor completo agrega peso y complejidad
innecesarios. En su lugar:

- **Escena de la huerta**: contenedor con perspectiva 2.5D lograda con CSS
  (`transform`, tamaños y posiciones escalonadas) o SVG con `viewBox` fijo —
  cada bancal es un elemento posicionado en una grilla, no un canvas de juego
  con motor de físicas.
- **Animación**: Framer Motion para transiciones entre etapas de crecimiento,
  microinteracciones al tocar una planta (rebote, partículas de agua/XP), y
  loops de los animales ambientales.
- **Animales ambientales**: componentes SVG independientes que se montan cada
  cierto tiempo aleatorio (p. ej. cada 30–90 s) en un punto de entrada de la
  escena y recorren una trayectoria simple antes de desmontarse. Sin estado
  persistido, sin vínculo a ningún dato real — es decoración pura y así debe
  quedar documentado en el código para que nadie intente engancharle lógica.
- **Rendimiento**: máximo un animal ambiental visible a la vez por defecto;
  pausar animaciones cuando la pestaña no está visible
  (`document.visibilityState`); respetar `prefers-reduced-motion`
  desactivando rebotes y animales, dejando solo transiciones de estado.

### Etapas de crecimiento (mapeo dato → sprite)

| Estado real de `crops` | Etapa visual |
|---|---|
| `sembrado`, día 0–20% del ciclo hacia `expectedHarvestDate` | Semilla / tierra removida |
| `creciendo`, 20–60% del ciclo | Brote pequeño |
| `creciendo`, 60–100% del ciclo | Planta desarrollada |
| `listo_para_cosecha` | Planta madura con brillo/indicador de acción |
| `cosechado` | Cama vacía, lista para nueva siembra |
| Riego vencido (`nextWateringDue` pasado) | Overlay: hojas caídas / color apagado, gota parpadeante |
| Fertilización vencida | Overlay: signo de nutriente sobre la planta |

El porcentaje del ciclo se calcula en el cliente:
`(hoy - plantedDate) / (expectedHarvestDate - plantedDate)`.

### Interacción

Tocar una planta abre una hoja de acciones contextual (no un modal completo,
para no romper la inmersión) con las acciones disponibles según el estado
real:
- Si `nextWateringDue <= hoy` → "Regar 💧" (habilitado)
- Si no → "Ya está hidratada 🙂" (deshabilitado, muestra próxima fecha)
- Igual patrón para "Abonar 🌱"
- Si `status === 'listo_para_cosecha'` → "Cosechar 🧺" (habilitado, dispara
  también la lógica de desbloqueo de cama de la sección 1)

Cada acción exitosa dispara: escritura real en Firestore → animación de
confirmación (agua cayendo, hojas reverdeciendo, monedas/XP saliendo) → toast
con el XP/monedas ganados, igual que en la vista clásica.

### Camas bloqueadas

Una cama `bloqueada` se ve en la escena como una parcela con maleza/cerca y un
candado, sin acción disponible salvo un tooltip "Cosecha la cama anterior para
desbloquear esta". No se muestra vacía ni invita a sembrar.

---

## 4. Las dos pestañas

`/huerta` tiene un selector (segmented control) "Granja 🌻 / Clásica 📋" en la
parte superior. Ambas pestañas leen exactamente las mismas colecciones — la
diferencia es solo el componente de renderizado. La preferencia se guarda en
`users/{uid}.preferredView` y se usa como pestaña inicial en la siguiente
visita; el selector siempre queda visible para cambiar en cualquier momento.

La vista clásica (tablas, tarjetas, panel "Pendientes hoy") es la ya definida
en el documento base del módulo — no cambia.

---

## 5. Notificaciones (recordatorio de lo ya definido)

Sigue aplicando lo del documento base: panel "Pendientes hoy" dentro de la
app siempre disponible; notificaciones push solo si el proyecto de Firebase
de Green Force está (o pasa a) plan Blaze, por el requisito de Cloud
Functions programadas. En la vista de juego, los pendientes se ven además
como overlays directamente sobre las plantas en la escena (sección 3), lo cual
ya cubre gran parte de la necesidad de aviso sin depender de push.

---

## 6. Fases de entrega

Sobre las fases ya definidas en el documento base (colecciones, catálogo,
pantallas clásicas, alertas), agregar:

- **Fase A — Progresión de camas:** campos `order`/`gameStatus` en `plots`,
  lógica de desbloqueo al cosechar, seed con la primera cama desbloqueada y
  el resto bloqueadas.
- **Fase B — Escena base de la granja:** grilla 2.5D, render de camas en sus
  3 estados (bloqueada/desbloqueada/en uso), sin animales todavía.
- **Fase C — Plantas y etapas:** mapeo de estado real a etapa visual, overlays
  de riego/fertilización vencidos, hoja de acciones contextual conectada a
  las escrituras reales.
- **Fase D — Confirmaciones y progreso:** animaciones de acción exitosa,
  toasts de XP/monedas, animación de desbloqueo de cama nueva.
- **Fase E — Ambiente:** animales decorativos, `prefers-reduced-motion`,
  pausa cuando la pestaña no está visible.
- **Fase F — Selector de vista:** segmented control, persistencia de
  `preferredView`, verificación de que ambas vistas muestran exactamente los
  mismos datos en todo momento (probar registrando desde una y viendo el
  reflejo inmediato en la otra).

---

## 7. Criterios de aceptación

1. Ninguna acción del juego crea datos que no existan también en el modelo
   real (`riegos`, `fertilizaciones`, `cosechas`) — cero estado paralelo.
2. El botón de regar/abonar está deshabilitado hasta que el intervalo real se
   cumpla; no es posible ganar XP regando fuera de tiempo.
3. Una cama bloqueada no permite sembrar ni ver acciones, solo un tooltip
   explicando cómo desbloquearla.
4. Cosechar la cama en uso desbloquea automáticamente la siguiente, sin
   intervención de un docente/admin.
5. Los animales ambientales no afectan ningún dato ni bloquean interacciones
   con las plantas.
6. Con `prefers-reduced-motion` activo, no hay rebotes ni animales, solo
   cambios de estado directos.
7. Cambiar entre pestaña Granja y Clásica en cualquier momento muestra
   siempre el mismo estado de cada cultivo — no hay desfase ni datos de
   ejemplo en ninguna de las dos.
8. La app se mantiene fluida (sin caídas de fps perceptibles) en un celular
   gama media con varias camas activas en pantalla a la vez.
