# INSTRUCCIONES PARA EL AGENTE — Huerta del Colegio + Huertas Individuales (Huerta Escolar)

Complementa a `INSTRUCCIONES_AGENTE_HUERTA_ESCOLAR.md`,
`INSTRUCCIONES_AGENTE_HUERTA_JUEGO.md` y
`INSTRUCCIONES_AGENTE_HUERTA_SONIDOS.md`.

## 0. Decisiones confirmadas

- Existen **dos ámbitos** de huerta dentro del mismo juego: la **huerta del
  colegio** (compartida, la que ya diseñamos con progresión de camas) y una
  **huerta individual** por estudiante.
- La huerta individual **puede ser real o de práctica según el estudiante**:
  algunos tienen una cama/maceta física asignada (datos reales, sirven para
  investigación y administración), otros usan un espacio de práctica sin
  planta física detrás (motivación/aprendizaje, pero **nunca** se mezcla con
  los datos reales).
- Cuando la huerta del colegio necesita riego/siembra/abono, **todo el grupo
  Green Force lo ve por igual** — es responsabilidad compartida, no de una
  sola persona.

---

## 1. Modelo de datos (extensión de `plots` y `crops`)

Se agregan estos campos a `plots/{id}` y se denormalizan también en
`crops/{id}` (para poder filtrar sin joins):

```ts
{
  // ...campos existentes (name, order, gameStatus, etc.)...
  ownerScope: 'colegio' | 'individual',
  ownerUid: string | null,     // null si ownerScope === 'colegio'
  ownerName: string | null,    // desnormalizado, para mostrar sin lookup
  isReal: boolean,             // true = corresponde a una planta física real
                                // false = espacio de práctica, sin planta física
}
```

Reglas de combinación válidas:
- `colegio` → `ownerUid: null`, `isReal: true` siempre.
- `individual` + `isReal: true` → cama real asignada a un estudiante.
- `individual` + `isReal: false` → espacio de práctica del estudiante.

`crops/{id}` copia `ownerScope`, `ownerUid`, `isReal` del `plot` al que
pertenece, en el momento de crear la siembra. Así cualquier consulta o
exportación de datos filtra directo por estos campos sin necesidad de
resolver el `plot` primero.

**Regla dura para investigación/reportes:** cualquier pantalla de reportes,
ranking general del colegio, o exportación de datos para la investigación
UNADE debe filtrar `isReal === true` por defecto. Los datos de práctica
(`isReal: false`) solo aparecen si se piden explícitamente y siempre
etiquetados como "práctica".

---

## 2. Quién crea qué

| Acción | Estudiante | Docente/Admin |
|---|---|---|
| Crear cama de práctica propia (`individual`, `isReal: false`) | ✅, sin aprobación, hasta un máximo de 3 activas por estudiante | ✅ |
| Asignar una cama real a un estudiante (`individual`, `isReal: true`) | ❌ | ✅ — elige al estudiante de la lista de Green Force y crea el `plot` a su nombre |
| Crear/editar camas de la huerta del colegio (`colegio`) | ❌ | ✅ |
| Registrar riego/abono/cosecha en cualquier cama a la que tenga acceso | ✅ | ✅ |

Un estudiante solo ve y actúa sobre: las camas `colegio`, sus propias camas
`individual` (reales y de práctica). Nunca ve ni puede tocar la huerta
individual de otro estudiante.

---

## 3. Notificaciones y panel "Pendientes hoy"

El panel ya definido en el módulo base se organiza en dos secciones,
siempre visibles para todo el grupo Green Force:

- **"Huerta del colegio"** — pendientes de todas las camas `ownerScope:
  'colegio'`. Visible y accionable por cualquier miembro del grupo, sin
  importar quién sembró originalmente. Es responsabilidad compartida.
- **"Mi huerta"** — pendientes de las camas `individual` donde
  `ownerUid === uid del usuario actual`. Solo el dueño las ve en su panel
  personal (un docente/admin sí puede verlas todas si necesita hacer
  seguimiento, pero no aparecen mezcladas en el panel de otros estudiantes).

Si en el futuro se activan notificaciones push (sección ya cubierta en el
documento base, sujeta a plan Blaze), los pendientes de `colegio` se envían a
**todos** los tokens registrados del grupo; los pendientes `individual` solo
al token del estudiante dueño.

---

## 4. Diferenciación visual real vs. práctica (sección de Juego)

Para que nunca se confunda una cama de práctica con una real, ambas dentro de
la vista de juego siguen la misma escena (sección 3 de
`INSTRUCCIONES_AGENTE_HUERTA_JUEGO.md`) pero con una marca visual clara en
toda cama/planta con `isReal: false`:

- Borde punteado en vez de sólido alrededor de la cama.
- Etiqueta pequeña "PRÁCTICA" en la esquina de la cama, siempre visible.
- Paleta ligeramente desaturada respecto a las camas reales.

El XP y las monedas ganados en modo práctica **sí suman** al perfil del
estudiante (mantiene la motivación), pero nunca cuentan para el progreso o
las estadísticas de la huerta del colegio ni para reportes de investigación.

---

## 5. Navegación dentro de la vista de Juego

Dentro de la pestaña "Granja 🌻" (ver sección 4 del documento de juego), se
agrega un segundo selector para moverse entre ámbitos:

`Huerta del colegio 🏫 | Mi huerta 🙋`

- **Huerta del colegio**: la escena compartida con progresión de camas ya
  diseñada.
- **Mi huerta**: escena personal del estudiante con sus propias camas
  (reales y de práctica mezcladas, cada una con su marca visual de la
  sección 4). Si el estudiante no tiene ninguna cama real asignada ni de
  práctica creada, se muestra un estado vacío invitando a crear su primera
  cama de práctica.

La pestaña "Clásica 📋" también se divide igual (colegio / mi huerta) con
tablas separadas, para quien prefiera esa vista.

---

## 6. Reglas de Firestore (ajuste)

- Lectura de `plots`/`crops` con `ownerScope == 'colegio'`: cualquier
  autenticado del grupo.
- Lectura de `plots`/`crops` con `ownerScope == 'individual'`: solo si
  `ownerUid == request.auth.uid`, o si el usuario es `admin`/`docente`.
- Creación de `plots` con `ownerScope == 'individual' && isReal == false`:
  cualquier autenticado, pero solo con `ownerUid == request.auth.uid` (no se
  puede crear una cama de práctica a nombre de otro).
- Creación de `plots` con `isReal == true` (sea `colegio` o `individual`):
  solo `admin`/`docente`.
- Límite de 3 camas de práctica activas por estudiante: validarlo también en
  las reglas (contar documentos existentes) además de en la interfaz, para
  que no se pueda saltar desde la consola o con otro cliente.

---

## 7. Fases de entrega

- **Fase G — Modelo:** campos `ownerScope`/`ownerUid`/`ownerName`/`isReal`
  en `plots` y `crops`, reglas de Firestore actualizadas.
- **Fase H — Asignación docente:** pantalla para que un docente/admin cree
  una cama real individual y la asigne a un estudiante de la lista de
  Green Force.
- **Fase I — Práctica del estudiante:** flujo para que un estudiante cree su
  propia cama de práctica (con el límite de 3), marca visual punteada/
  etiquetada en la escena.
- **Fase J — Panel dividido:** secciones "Huerta del colegio" / "Mi huerta"
  en el panel de pendientes, en ambas vistas (juego y clásica).
- **Fase K — Filtro de reportes:** cualquier pantalla de reportes o
  exportación aplica `isReal === true` por defecto, con opción explícita
  para incluir práctica.

---

## 8. Criterios de aceptación

1. Un estudiante nunca ve ni puede editar la huerta individual de otro
   estudiante.
2. Los pendientes de la huerta del colegio aparecen igual para todos los
   miembros del grupo, sin importar quién sembró cada planta.
3. Una cama marcada `isReal: false` es visualmente inconfundible con una
   real en cualquiera de las dos vistas.
4. Ningún reporte o exportación por defecto mezcla datos de práctica con
   datos reales.
5. Un estudiante no puede crear más de 3 camas de práctica activas, ni
   crear una cama real para sí mismo ni para otros.
6. Borrar/desactivar una cama de práctica no afecta el XP ya ganado, pero
   tampoco resta ni suma a ninguna estadística de la huerta del colegio.
