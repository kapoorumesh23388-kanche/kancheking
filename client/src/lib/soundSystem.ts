// ============================================================
// SOUND SYSTEM — BGM themes + game sound effects
// ============================================================

export type BGMTheme = "dholak" | "shehnai" | "tabla" | "flute" | "electronic";

const BGM_THEMES: Record<BGMTheme, { name: string; emoji: string; desc: string }> = {
  dholak:     { name: "Dholak Beats",    emoji: "🥁", desc: "Traditional dhol rhythm" },
  shehnai:    { name: "Shehnai Classic", emoji: "🎺", desc: "Wedding shehnai vibes" },
  tabla:      { name: "Tabla Groove",    emoji: "🎵", desc: "Classic tabla taal" },
  flute:      { name: "Bansuri Flow",    emoji: "🎶", desc: "Peaceful bansuri melody" },
  electronic: { name: "Street Electronic", emoji: "⚡", desc: "Modern Indian fusion" },
};

export function getBGMThemes() {
  return BGM_THEMES;
}

// Web Audio context (singleton)
let ctx: AudioContext | null = null;
let currentBGMNodes: AudioNode[] = [];
let bgmGain: GainNode | null = null;
let isBGMPlaying = false;
let currentTheme: BGMTheme = "dholak";
let bgmIntervalId: ReturnType<typeof setInterval> | null = null;

function getCtx(): AudioContext {
  if (!ctx || ctx.state === "closed") {
    ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  if (ctx.state === "suspended") ctx.resume();
  return ctx;
}

// ---- Tone generator helpers ----
function playNote(freq: number, start: number, dur: number, vol = 0.3, type: OscillatorType = "sine") {
  const c = getCtx();
  const osc = c.createOscillator();
  const g = c.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, c.currentTime + start);
  g.gain.setValueAtTime(0, c.currentTime + start);
  g.gain.linearRampToValueAtTime(vol, c.currentTime + start + 0.02);
  g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + start + dur);
  osc.connect(g);
  if (bgmGain) g.connect(bgmGain);
  else g.connect(c.destination);
  osc.start(c.currentTime + start);
  osc.stop(c.currentTime + start + dur + 0.05);
  currentBGMNodes.push(osc, g);
}

function playDrum(freq: number, start: number, vol = 0.4) {
  const c = getCtx();
  const osc = c.createOscillator();
  const g = c.createGain();
  osc.type = "triangle";
  osc.frequency.setValueAtTime(freq, c.currentTime + start);
  osc.frequency.exponentialRampToValueAtTime(20, c.currentTime + start + 0.2);
  g.gain.setValueAtTime(vol, c.currentTime + start);
  g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + start + 0.3);
  osc.connect(g);
  if (bgmGain) g.connect(bgmGain);
  else g.connect(c.destination);
  osc.start(c.currentTime + start);
  osc.stop(c.currentTime + start + 0.4);
  currentBGMNodes.push(osc, g);
}

// ---- BGM Theme patterns (looping bars) ----
function playDholakBar() {
  // Strong dholak beat: dhaa ge na tee na kaa
  const hits = [0, 0.5, 0.75, 1.0, 1.25, 1.5, 1.75];
  const freqs = [80, 200, 120, 80, 200, 150, 80];
  const vols  = [0.5, 0.3, 0.2, 0.4, 0.25, 0.2, 0.5];
  hits.forEach((t, i) => playDrum(freqs[i], t, vols[i]));
  // Melodic undertone
  [0, 0.5, 1.0, 1.5].forEach(t => playNote(196, t, 0.4, 0.08, "sawtooth"));
}

function playTablaBar() {
  const hits = [0, 0.33, 0.66, 1.0, 1.33, 1.66];
  const freqs = [90, 250, 90, 90, 150, 90];
  hits.forEach((t, i) => playDrum(freqs[i], t, 0.3));
  playNote(261, 0, 0.3, 0.07, "triangle");
  playNote(329, 0.66, 0.3, 0.07, "triangle");
}

function playShehnaiBar() {
  // Simple shehnai-like rising melody
  const scale = [293, 329, 369, 392, 440, 392, 369, 329];
  scale.forEach((f, i) => playNote(f, i * 0.25, 0.28, 0.2, "sawtooth"));
  [0, 0.5, 1.0, 1.5].forEach(t => playDrum(100, t, 0.2));
}

function playFluteBar() {
  // Pentatonic bansuri phrase
  const scale = [523, 587, 659, 784, 880, 784, 659, 523];
  scale.forEach((f, i) => playNote(f, i * 0.25, 0.3, 0.15, "sine"));
}

function playElectronicBar() {
  // Electronic beats with synth bass
  [0, 0.5, 1.0, 1.5].forEach(t => playDrum(55, t, 0.5));
  [0.25, 0.75, 1.25, 1.75].forEach(t => playDrum(180, t, 0.2));
  [0, 0.5, 1.0, 1.5].forEach(t => playNote(110, t, 0.45, 0.18, "square"));
  [0.25, 0.75].forEach(t => playNote(329, t, 0.2, 0.1, "square"));
}

function playThemeBar(theme: BGMTheme) {
  switch (theme) {
    case "dholak":     return playDholakBar();
    case "tabla":      return playTablaBar();
    case "shehnai":    return playShehnaiBar();
    case "flute":      return playFluteBar();
    case "electronic": return playElectronicBar();
  }
}

export function startBGM(theme: BGMTheme = "dholak", volume = 0.4) {
  stopBGM();
  currentTheme = theme;
  isBGMPlaying = true;

  const c = getCtx();
  bgmGain = c.createGain();
  bgmGain.gain.value = volume;
  bgmGain.connect(c.destination);

  // Play immediately and then loop every 2 seconds
  playThemeBar(theme);
  bgmIntervalId = setInterval(() => {
    if (isBGMPlaying) playThemeBar(currentTheme);
  }, 2000);
}

export function stopBGM() {
  isBGMPlaying = false;
  if (bgmIntervalId) { clearInterval(bgmIntervalId); bgmIntervalId = null; }
  currentBGMNodes.forEach(n => { try { (n as OscillatorNode).stop?.(); } catch {} });
  currentBGMNodes = [];
  if (bgmGain) { try { bgmGain.disconnect(); } catch {} bgmGain = null; }
}

export function switchBGM(theme: BGMTheme) {
  if (isBGMPlaying) {
    stopBGM();
    startBGM(theme);
  } else {
    currentTheme = theme;
  }
}

export function setBGMVolume(vol: number) {
  if (bgmGain) bgmGain.gain.value = Math.max(0, Math.min(1, vol));
}

export function isBGMEnabled() { return isBGMPlaying; }

// ---- Game Sound Effects ----
export function playSfxMarbleHide() {
  const c = getCtx();
  // Rapid shake sound
  for (let i = 0; i < 6; i++) {
    const o = c.createOscillator();
    const g = c.createGain();
    o.type = "sine";
    o.frequency.value = 800 + Math.random() * 400;
    g.gain.setValueAtTime(0.3, c.currentTime + i * 0.06);
    g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + i * 0.06 + 0.08);
    o.connect(g); g.connect(c.destination);
    o.start(c.currentTime + i * 0.06);
    o.stop(c.currentTime + i * 0.06 + 0.1);
  }
}

export function playSfxReveal() {
  const c = getCtx();
  // Whoosh + sparkle
  const freqs = [400, 500, 650, 800, 1000, 1200];
  freqs.forEach((f, i) => {
    const o = c.createOscillator();
    const g = c.createGain();
    o.type = "sine";
    o.frequency.setValueAtTime(f, c.currentTime + i * 0.04);
    g.gain.setValueAtTime(0.25, c.currentTime + i * 0.04);
    g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + i * 0.04 + 0.15);
    o.connect(g); g.connect(c.destination);
    o.start(c.currentTime + i * 0.04);
    o.stop(c.currentTime + i * 0.04 + 0.2);
  });
}

export function playSfxWin() {
  const c = getCtx();
  // Ascending fanfare
  const notes = [523, 659, 784, 1047, 1319];
  notes.forEach((f, i) => {
    const o = c.createOscillator();
    const g = c.createGain();
    o.type = "sine";
    o.frequency.value = f;
    g.gain.setValueAtTime(0.4, c.currentTime + i * 0.15);
    g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + i * 0.15 + 0.35);
    o.connect(g); g.connect(c.destination);
    o.start(c.currentTime + i * 0.15);
    o.stop(c.currentTime + i * 0.15 + 0.4);
  });
}

export function playSfxLose() {
  const c = getCtx();
  // Descending sad tones
  const notes = [400, 350, 300, 250];
  notes.forEach((f, i) => {
    const o = c.createOscillator();
    const g = c.createGain();
    o.type = "triangle";
    o.frequency.value = f;
    g.gain.setValueAtTime(0.3, c.currentTime + i * 0.2);
    g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + i * 0.2 + 0.3);
    o.connect(g); g.connect(c.destination);
    o.start(c.currentTime + i * 0.2);
    o.stop(c.currentTime + i * 0.2 + 0.35);
  });
}

export function playSfxGuess() {
  const c = getCtx();
  const o = c.createOscillator();
  const g = c.createGain();
  o.type = "sine";
  o.frequency.setValueAtTime(600, c.currentTime);
  o.frequency.linearRampToValueAtTime(900, c.currentTime + 0.1);
  g.gain.setValueAtTime(0.25, c.currentTime);
  g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.2);
  o.connect(g); g.connect(c.destination);
  o.start(c.currentTime);
  o.stop(c.currentTime + 0.25);
}

export function playSfxMarbleClick() {
  const c = getCtx();
  const o = c.createOscillator();
  const g = c.createGain();
  o.type = "sine";
  o.frequency.value = 1200 + Math.random() * 300;
  g.gain.setValueAtTime(0.15, c.currentTime);
  g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.07);
  o.connect(g); g.connect(c.destination);
  o.start(c.currentTime);
  o.stop(c.currentTime + 0.08);
}
