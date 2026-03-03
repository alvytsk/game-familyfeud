let ctx: AudioContext | null = null;
let muted = false;

function getCtx(): AudioContext {
  if (!ctx) ctx = new AudioContext();
  return ctx;
}

export function ensureResumed(): void {
  if (ctx?.state === 'suspended') ctx.resume();
}

export function setMuted(value: boolean): void {
  muted = value;
}

export function isMuted(): boolean {
  return muted;
}

function canPlay(): boolean {
  if (muted) return false;
  const c = getCtx();
  return c.state === 'running';
}

/** Bell/chime — two sine oscillators (880Hz + 1760Hz), ~400ms decay */
export function playDing(): void {
  if (!canPlay()) return;
  const c = getCtx();
  const now = c.currentTime;

  const gain = c.createGain();
  gain.gain.setValueAtTime(0.3, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
  gain.connect(c.destination);

  const o1 = c.createOscillator();
  o1.type = 'sine';
  o1.frequency.value = 880;
  o1.connect(gain);
  o1.start(now);
  o1.stop(now + 0.4);

  const o2 = c.createOscillator();
  o2.type = 'sine';
  o2.frequency.value = 1760;
  const g2 = c.createGain();
  g2.gain.setValueAtTime(0.15, now);
  g2.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
  o2.connect(g2);
  g2.connect(c.destination);
  o2.start(now);
  o2.stop(now + 0.4);
}

/** Harsh buzzer — two detuned sawtooth oscillators (150Hz + 151Hz), ~800ms */
export function playBuzzer(): void {
  if (!canPlay()) return;
  const c = getCtx();
  const now = c.currentTime;

  const gain = c.createGain();
  gain.gain.setValueAtTime(0.35, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.8);
  gain.connect(c.destination);

  const o1 = c.createOscillator();
  o1.type = 'sawtooth';
  o1.frequency.value = 150;
  o1.connect(gain);
  o1.start(now);
  o1.stop(now + 0.8);

  const o2 = c.createOscillator();
  o2.type = 'sawtooth';
  o2.frequency.value = 151;
  o2.connect(gain);
  o2.start(now);
  o2.stop(now + 0.8);
}

/** Clock tick — short square wave (800Hz), ~80ms */
export function playTick(): void {
  if (!canPlay()) return;
  const c = getCtx();
  const now = c.currentTime;

  const gain = c.createGain();
  gain.gain.setValueAtTime(0.15, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
  gain.connect(c.destination);

  const o = c.createOscillator();
  o.type = 'square';
  o.frequency.value = 800;
  o.connect(gain);
  o.start(now);
  o.stop(now + 0.08);
}

/** Urgent tick — higher square wave (1200Hz), louder, ~80ms */
export function playWarningTick(): void {
  if (!canPlay()) return;
  const c = getCtx();
  const now = c.currentTime;

  const gain = c.createGain();
  gain.gain.setValueAtTime(0.3, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
  gain.connect(c.destination);

  const o = c.createOscillator();
  o.type = 'square';
  o.frequency.value = 1200;
  o.connect(gain);
  o.start(now);
  o.stop(now + 0.08);
}

/** Rising arpeggio C5-E5-G5 (sine), ~600ms */
export function playGameStart(): void {
  if (!canPlay()) return;
  const c = getCtx();
  const now = c.currentTime;
  const notes = [523.25, 659.25, 783.99]; // C5, E5, G5

  notes.forEach((freq, i) => {
    const t = now + i * 0.15;
    const gain = c.createGain();
    gain.gain.setValueAtTime(0.001, t);
    gain.gain.linearRampToValueAtTime(0.25, t + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.3);
    gain.connect(c.destination);

    const o = c.createOscillator();
    o.type = 'sine';
    o.frequency.value = freq;
    o.connect(gain);
    o.start(t);
    o.stop(t + 0.3);
  });
}

/** Victory fanfare C5-E5-G5-C6 (sine), ~1200ms */
export function playGameOver(): void {
  if (!canPlay()) return;
  const c = getCtx();
  const now = c.currentTime;
  const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6

  notes.forEach((freq, i) => {
    const t = now + i * 0.2;
    const duration = i === notes.length - 1 ? 0.6 : 0.3;
    const gain = c.createGain();
    gain.gain.setValueAtTime(0.001, t);
    gain.gain.linearRampToValueAtTime(0.25, t + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, t + duration);
    gain.connect(c.destination);

    const o = c.createOscillator();
    o.type = 'sine';
    o.frequency.value = freq;
    o.connect(gain);
    o.start(t);
    o.stop(t + duration);
  });
}
