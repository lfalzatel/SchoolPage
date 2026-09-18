# INSTRUCCIONES PARA EL AGENTE — Sonidos y Animaciones de Celebración (Huerta Escolar)

Este documento complementa a `INSTRUCCIONES_AGENTE_HUERTA_JUEGO.md`. Define el
sistema de audio sintetizado (sin archivos de sonido) y el overlay de
celebración desacoplado por eventos, con control total de accesibilidad.

## 1. Principios

- **Cero archivos de audio.** Todo se sintetiza en tiempo real con Web Audio
  API (osciladores). Cero peso de descarga, cero licencias.
- **Un interruptor maestro por encima de todo.** Si el usuario apaga sonido y
  animaciones en Configuración, ninguna acción del juego produce audio ni
  overlay, sin excepciones.
- **`prefers-reduced-motion` se respeta siempre**, independientemente de lo
  que el usuario haya configurado manualmente — es una señal del sistema
  operativo, tiene prioridad.
- **La voz por texto (TTS) viene apagada por defecto.** Son estudiantes
  compartiendo dispositivo en clase; una voz que narra cada acción es
  disruptiva en ese contexto. Se deja como opción, no como comportamiento
  inicial.
- El overlay de celebración y los sonidos se disparan **por evento**, nunca
  incrustados directamente en cada componente de acción — así cualquier
  acción nueva del juego los reutiliza sin duplicar código.

---

## 2. Preferencias (persistidas en `localStorage`, con prefijo `hh_`)

```ts
hh_sound_enabled: 'true' | 'false'        // maestro de sonido
hh_anim_enabled: 'true' | 'false'         // maestro de animaciones de celebración
hh_ambient_animals_enabled: 'true' | 'false'
hh_voice_enabled: 'true' | 'false'        // default 'false'
```

Se agregan como una subsección "Sonidos y animaciones de la huerta" dentro de
la pantalla de Configuración existente (de Green Force o del módulo), con un
`Toggle` maestro arriba y los tres siguientes debajo, deshabilitados
visualmente si el maestro está apagado.

---

## 3. Sonidos sintetizados (`src/lib/farmSounds.ts`)

```ts
let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (localStorage.getItem('hh_sound_enabled') === 'false') return null;
  if (!audioCtx) {
    const Ctx = window.AudioContext || (window as any).webkitAudioContext;
    if (!Ctx) return null;
    audioCtx = new Ctx();
  }
  return audioCtx;
}

function tone(freqStart: number, freqEnd: number, duration: number, type: OscillatorType = 'sine', gainPeak = 0.15) {
  const ctx = getAudioContext();
  if (!ctx) return;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freqStart, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(freqEnd, ctx.currentTime + duration);
  gain.gain.setValueAtTime(gainPeak, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start();
  osc.stop(ctx.currentTime + duration);
}

function sequence(notes: { freq: number; duration: number; delay: number }[], type: OscillatorType = 'triangle') {
  const ctx = getAudioContext();
  if (!ctx) return;
  notes.forEach(({ freq, duration, delay }) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, ctx.currentTime + delay);
    gain.gain.setValueAtTime(0.18, ctx.currentTime + delay);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + duration);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(ctx.currentTime + delay);
    osc.stop(ctx.currentTime + delay + duration);
  });
}

// --- Acciones del juego ---

export function playWatering() {
  // dos pulsos ascendentes cortos, tipo "goteo"
  tone(300, 500, 0.09, 'sine', 0.12);
  setTimeout(() => tone(300, 500, 0.09, 'sine', 0.1), 110);
}

export function playFertilizing() {
  tone(180, 220, 0.15, 'sine', 0.14);
}

export function playHarvest() {
  // arpegio ascendente do-mi-sol
  sequence([
    { freq: 523.25, duration: 0.14, delay: 0 },
    { freq: 659.25, duration: 0.14, delay: 0.1 },
    { freq: 783.99, duration: 0.2, delay: 0.2 },
  ]);
}

export function playUnlockPlot() {
  // fanfarria corta de 4 notas, la más elaborada del set
  sequence([
    { freq: 523.25, duration: 0.12, delay: 0 },
    { freq: 659.25, duration: 0.12, delay: 0.1 },
    { freq: 783.99, duration: 0.12, delay: 0.2 },
    { freq: 1046.5, duration: 0.28, delay: 0.3 },
  ]);
}

export function playActionBlocked() {
  // tono corto y seco: "esto no se puede todavía"
  tone(220, 180, 0.12, 'square', 0.08);
}
```

Cada función revisa el maestro de sonido a través de `getAudioContext()`; si
está apagado, no hace nada — no hace falta chequear el flag en cada llamador.

---

## 4. Overlay de celebración desacoplado por evento

### Disparo (desde cualquier componente de acción)

```ts
window.dispatchEvent(new CustomEvent('huerta:celebrate', {
  detail: {
    kind: 'riego' | 'abono' | 'cosecha' | 'desbloqueo',
    title: string,        // ej. '¡Lechuga regada!'
    subtitle: string,     // ej. '+5 XP'
  }
}));
```

### Componente (`src/components/game/CelebrationOverlay.tsx`)

Se monta una sola vez en el layout del módulo, escucha el evento y decide
internamente si mostrar algo según las preferencias:

```tsx
export default function CelebrationOverlay() {
  const [event, setEvent] = useState<CelebrationDetail | null>(null);
  const reducedMotion = usePrefersReducedMotion(); // hook con matchMedia('(prefers-reduced-motion: reduce)')

  useEffect(() => {
    function handle(e: Event) {
      const detail = (e as CustomEvent).detail as CelebrationDetail;
      const soundFn = {
        riego: playWatering,
        abono: playFertilizing,
        cosecha: playHarvest,
        desbloqueo: playUnlockPlot,
      }[detail.kind];
      soundFn?.();

      if (localStorage.getItem('hh_voice_enabled') === 'true') {
        speak(`${detail.title}. ${detail.subtitle}`);
      }

      if (localStorage.getItem('hh_anim_enabled') !== 'false' && !reducedMotion) {
        setEvent(detail);
        setTimeout(() => setEvent(null), 1600);
      }
    }
    window.addEventListener('huerta:celebrate', handle);
    return () => window.removeEventListener('huerta:celebrate', handle);
  }, [reducedMotion]);

  if (!event) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-[200] flex items-center justify-center">
      {/* hojas/pétalos cayendo (paleta verde/tierra, no dorado tipo casino),
          texto title/subtitle con entrada tipo rebote vía Framer Motion */}
    </div>
  );
}
```

Nota de diseño visual: usar **hojas y pétalos**, no confeti dorado — mantiene
la identidad de granja/huerta en vez de leer como celebración de casino.

### Función de voz opcional (`speak`)

```ts
function speak(text: string) {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'es-CO';
  utterance.rate = 1.0;
  window.speechSynthesis.speak(utterance);
}
```

---

## 5. Animal ambiental apareciendo (sonido opcional, muy discreto)

Si `hh_ambient_animals_enabled` está activo, cada aparición puede reproducir
un sonido muy corto y bajo (ej. un solo "pío" o "cri-cri" sintetizado con
`tone()` a volumen bajo, `gainPeak: 0.04`). Por defecto **sin sonido**, solo
visual — el sonido de fondo constante de una clase de 30 estudiantes
regando/cosechando ya es suficiente estímulo auditivo.

---

## 6. Botón deshabilitado (feedback de "no todavía")

Cuando el estudiante toca una acción bloqueada por intervalo (regar antes de
tiempo, cosechar sin madurar), no se dispara `huerta:celebrate` — se reproduce
`playActionBlocked()` y se muestra un tooltip/mensaje breve ("Vuelve a
regarla el jueves"), sin animación de celebración. Esto refuerza que el juego
distingue entre una acción válida y una inválida, en vez de premiar cualquier
toque.

---

## 7. Criterios de aceptación

1. Con el interruptor maestro de sonido apagado, ninguna función de
   `farmSounds.ts` produce audio, sin necesidad de chequearlo en cada
   componente que las llama.
2. Con `prefers-reduced-motion` activo, `CelebrationOverlay` nunca muestra
   animación, sin importar el valor guardado en `hh_anim_enabled`.
3. `hh_voice_enabled` empieza en `false` para todo usuario nuevo.
4. Ninguna acción bloqueada por intervalo dispara `huerta:celebrate`.
5. Los sonidos de acciones válidas (`playWatering`, `playFertilizing`,
   `playHarvest`, `playUnlockPlot`) son audiblemente distintos entre sí sin
   necesidad de ver la pantalla.
6. El overlay usa partículas de hojas/pétalos, no confeti dorado.
