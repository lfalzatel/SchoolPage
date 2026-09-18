# INSTRUCCIONES PARA EL AGENTE — Módulo "Bitácora de Cultivos" (Green Force)

## 0. Contexto y objetivo

Este módulo se construye **dentro de la app Green Force existente** (grupo
ambiental de IE Barro Blanco, Firebase/Firestore, tema oscuro glassmorphism),
no como app separada ni como parte de HuertaHéroes (que es un proyecto
comercial distinto, sin relación con el colegio).

Objetivo: llevar el ciclo de vida de cada cultivo de la huerta escolar —
siembra, riego, abono/fertilización, cosecha — con alertas cuando toca actuar.

Roles definidos por el usuario:
- **Ambos registran**, con permisos distintos: estudiantes del grupo Green
  Force y docentes/administradores.
- **Sí quiere alertas** (no solo registro histórico).

---

## 1. Modelo de datos (Firestore, nuevas colecciones dentro del proyecto de Green Force)

### `cropTypes/{id}` — catálogo de especies (gestionado por docentes/admin)
```ts
{
  name: string,              // 'Zanahoria', 'Lechuga', 'Cilantro'...
  scientificName: string | null,
  wateringIntervalDays: number,     // cada cuánto regar, ej. 2
  fertilizingIntervalDays: number,  // cada cuánto abonar, ej. 21
  daysToHarvest: number,            // días desde siembra a cosecha estimada
  sunlight: 'pleno sol' | 'sombra parcial' | 'sombra',
  notes: string | null,
  icon: string | null,
  createdAt, updatedAt: Timestamp
}
```

### `plots/{id}` — bancales/zonas de la huerta (opcional pero recomendado)
```ts
{ name: string, description: string | null, isActive: boolean }
```

### `crops/{id}` — una siembra concreta (una "corrida" de un cultivo)
```ts
{
  cropTypeId: string, cropTypeName: string,    // desnormalizado
  plotId: string | null, plotName: string | null,
  plantedDate: Timestamp,
  expectedHarvestDate: Timestamp,     // = plantedDate + daysToHarvest del tipo
  status: 'sembrado' | 'creciendo' | 'listo_para_cosecha' | 'cosechado' | 'perdido',
  plantedByUid: string, plantedByName: string,
  quantity: number | null,           // nº de plantas o m² sembrados
  photo: string | null,
  notes: string | null,
  // campos calculados para las alertas (ver sección 3)
  lastWateredAt: Timestamp | null,
  lastFertilizedAt: Timestamp | null,
  nextWateringDue: Timestamp,
  nextFertilizingDue: Timestamp | null,
  createdAt, updatedAt: Timestamp
}
```

### Subcolecciones de `crops/{id}`

- **`riegos/{id}`**: `{ date, doneByUid, doneByName, notes }`
- **`fertilizaciones/{id}`**: `{ date, product, quantity, doneByUid, doneByName, notes }`
- **`cosechas/{id}`**: `{ date, quantity, unit, doneByUid, doneByName, notes, photo }`
- **`incidencias/{id}`** (opcional, útil pedagógicamente): `{ date, type: 'plaga'|'enfermedad'|'clima'|'otro', description, doneByUid }`

Cada vez que se crea un documento en `riegos`, actualizar en la misma
transacción `crops/{id}.lastWateredAt` y `nextWateringDue`. Igual para
`fertilizaciones`. Al crear una `cosecha`, cambiar `status` a `cosechado` si se
registra como cosecha final.

---

## 2. Roles y permisos

Reutilizar el sistema de usuarios que ya tiene Green Force (no crear uno
nuevo). Se asume que ya existe `role` en el documento de usuario
(`estudiante` / `docente` o `admin`); si no existe, agregarlo.

| Acción | Estudiante | Docente/Admin |
|---|---|---|
| Ver cultivos y alertas | ✅ | ✅ |
| Registrar riego | ✅ | ✅ |
| Registrar fertilización | ✅ | ✅ |
| Registrar cosecha | ✅ | ✅ |
| Registrar incidencia | ✅ | ✅ |
| Crear/editar tipos de cultivo (catálogo) | ❌ | ✅ |
| Crear una nueva siembra (`crops`) | ❌ (o solo sugerir) | ✅ |
| Editar/borrar cualquier registro | ❌ (solo el propio, mismo día) | ✅ |
| Editar/borrar bancales (`plots`) | ❌ | ✅ |

Reglas de Firestore: usar la misma función `isAdmin()`/`isDocente()` si ya
existe en `firestore.rules` de Green Force; si no, crearla igual que se hizo
para las demás colecciones del proyecto.

---

## 3. Sistema de alertas

**Cálculo de vencimiento** (se guarda en el documento `crops/{id}` para poder
consultarlo sin escanear subcolecciones):

- `nextWateringDue = (lastWateredAt ?? plantedDate) + wateringIntervalDays`
- `nextFertilizingDue = (lastFertilizedAt ?? plantedDate) + fertilizingIntervalDays`
  (null si el tipo de cultivo no define fertilización periódica)
- Cambiar `status` a `listo_para_cosecha` automáticamente cuando
  `hoy >= expectedHarvestDate` y el estado sigue en `creciendo`.

**En la app (siempre disponible, sin depender de notificaciones push):**
Un panel "Pendientes hoy" en el dashboard de la huerta, calculado en el
cliente contra `crops` con `where('nextWateringDue', '<=', hoy)` — riegos
vencidos, fertilizaciones vencidas y cultivos listos para cosechar, cada uno
como tarjeta con acción rápida ("Registrar riego ahora").

**Notificaciones push (fuera de la app):**
Para avisar aunque nadie tenga la app abierta se necesita un proceso que
corra solo, todos los días, y envíe notificaciones — eso requiere **Cloud
Functions con Cloud Scheduler**, lo cual exige que el proyecto de Firebase
esté en **plan Blaze** (pago por uso; sigue siendo gratis dentro de la cuota,
pero requiere tarjeta asociada). Antes de construir esta parte, confirmar en
qué plan está el proyecto de Firebase de Green Force.

- Si está en Blaze (o se puede pasar a Blaze): función programada diaria
  (`onSchedule`) que recorre `crops` con vencimientos de hoy/atrasados y envía
  notificación vía Firebase Cloud Messaging a los tokens registrados de
  estudiantes/docentes suscritos al grupo.
- Si se queda en Spark: implementar solo el panel "Pendientes hoy" dentro de
  la app (sección 3, primer punto) más una notificación local del navegador
  cuando el usuario abre la app y hay pendientes — sin garantía de aviso si
  nadie abre la app ese día. Dejarlo documentado como limitación conocida.

---

## 4. Pantallas (mismo lenguaje visual oscuro/glassmorphism de Green Force, sin mezclarlo con el estilo "videojuego" de HuertaHéroes)

| Pantalla | Contenido |
|---|---|
| `/huerta` (dashboard del módulo) | Tarjetas de cultivos activos con estado, panel "Pendientes hoy" (riegos, fertilizaciones, cosechas), acceso al catálogo (solo docente/admin) |
| `/huerta/[cropId]` | Ficha del cultivo: datos, línea de tiempo de riegos/fertilizaciones/cosechas/incidencias, botones de registro rápido |
| `/huerta/nueva-siembra` (solo docente/admin) | Formulario: tipo de cultivo, bancal, fecha de siembra, cantidad |
| `/huerta/catalogo` (solo docente/admin) | CRUD de `cropTypes`: intervalos de riego/abono, días a cosecha |
| `/huerta/bancales` (solo docente/admin) | CRUD de `plots` |

---

## 5. Fases de entrega

Entregar por fases, contenido completo de cada archivo modificado/creado (sin
diffs parciales), verificando que cada fase compila antes de seguir.

- **Fase 1:** colecciones y tipos TypeScript, reglas de Firestore para el
  módulo, catálogo `cropTypes` con 8–10 especies típicas de huerta escolar
  precargadas (zanahoria, lechuga, cilantro, rábano, tomate, fríjol, cebolla,
  acelga) con sus intervalos.
- **Fase 2:** pantallas de siembra y ficha de cultivo, registro de riego/
  fertilización/cosecha/incidencia, cálculo de `nextWateringDue` /
  `nextFertilizingDue` en cada registro.
- **Fase 3:** panel "Pendientes hoy" en el dashboard del módulo.
- **Fase 4:** notificaciones push (solo si el proyecto está o pasa a Blaze) o,
  en su defecto, refuerzo del aviso dentro de la app.
- **Fase 5:** permisos por rol probados (estudiante vs docente/admin) y
  pulido visual acorde al resto de Green Force.

---

## 6. Criterios de aceptación

1. Un estudiante puede registrar riego/fertilización/cosecha pero no puede
   crear tipos de cultivo, bancales, ni nuevas siembras.
2. Un docente/admin puede hacer todo lo anterior y editar/borrar registros de
   otros usuarios.
3. `nextWateringDue` y `nextFertilizingDue` se recalculan automáticamente al
   registrar el cuidado correspondiente, sin intervención manual.
4. El estado del cultivo pasa solo a `listo_para_cosecha` cuando corresponde
   por fecha, sin que nadie lo tenga que cambiar a mano.
5. El panel "Pendientes hoy" funciona sin depender de las notificaciones push.
6. Si el proyecto sigue en plan Spark, no se intenta desplegar Cloud
   Functions programadas: se documenta la limitación en el README en vez de
   dejar una función que falle al desplegar.
7. Las reglas de Firestore del módulo quedan desplegadas de verdad
   (`firebase deploy --only firestore:rules`, verificado en la consola).
