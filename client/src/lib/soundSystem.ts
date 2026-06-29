export type BGMTheme = "street" | "dhol" | "festival" | "electronic" | "chill";

const BGM_THEMES: Record<BGMTheme, { name: string; emoji: string; desc: string }> = {
  street:     { name: "Street Rush",     emoji: "ðŸƒ", desc: "Energetic street vibe" },
  dhol:       { name: "Dhol Beats",      emoji: "ðŸ¥", desc: "Powerful dhol rhythm" },
  festival:   { name: "Festival Hype",   emoji: "ðŸŽŠ", desc: "Celebration energy" },
  electronic: { name: "Electric Storm",  emoji: "âš¡", desc: "Modern electronic" },
  chill:      { name: "Chill Groove",    emoji: "ðŸŽ¶", desc: "Relaxed Indian melody" },
};

export function getBGMThemes() { return BGM_THEMES; }

let ctx: AudioContext | null = null;
let masterGain: GainNode | null = null;       // BGM gain (feeds into masterVolumeGain)
let masterVolumeGain: GainNode | null = null; // Global volume control (feeds destination)
let sfxGain: GainNode | null = null;          // SFX gain (feeds into masterVolumeGain)
let bgmIntervalId: ReturnType<typeof setInterval> | null = null;
let isBGMPlaying = false;
let currentTheme: BGMTheme = "street";
let beatCount = 0;
let bgmBaseVolume = 0.35;

// Global audio settings - loaded from localStorage
let globalVolume = 0.7;     // 0-1
let sfxEnabled = true;
let musicEnabledFlag = true;

// Call this once on app start (e.g. in GameHeader) to sync settings from localStorage
export function initAudioSettings() {
  if (typeof window === "undefined") return;
  const vol = localStorage.getItem("volume");
  if (vol !== null) globalVolume = Math.max(0, Math.min(100, parseInt(vol))) / 100;
  const sound = localStorage.getItem("soundEnabled");
  if (sound !== null) sfxEnabled = sound !== "false";
  const music = localStorage.getItem("musicEnabled");
  if (music !== null) musicEnabledFlag = music !== "false";

  // Apply immediately if audio graph already exists
  if (masterVolumeGain) masterVolumeGain.gain.value = globalVolume;
  if (sfxGain) sfxGain.gain.value = sfxEnabled ? 1 : 0;
  if (masterGain) masterGain.gain.value = musicEnabledFlag ? bgmBaseVolume : 0;
}

export function setMasterVolume(vol: number) {
  globalVolume = Math.max(0, Math.min(1, vol));
  if (masterVolumeGain) masterVolumeGain.gain.value = globalVolume;
}

export function setSfxEnabled(enabled: boolean) {
  sfxEnabled = enabled;
  if (sfxGain) sfxGain.gain.value = enabled ? 1 : 0;
}

export function isSfxEnabled() { return sfxEnabled; }

export function setMusicEnabledFlag(enabled: boolean) {
  musicEnabledFlag = enabled;
  if (masterGain) masterGain.gain.value = enabled ? bgmBaseVolume : 0;
}

function ensureAudioGraph() {
  if (!ctx) return;
  if (!masterVolumeGain) {
    masterVolumeGain = ctx.createGain();
    masterVolumeGain.gain.value = globalVolume;
    masterVolumeGain.connect(ctx.destination);
  }
  if (!sfxGain) {
    sfxGain = ctx.createGain();
    sfxGain.gain.value = sfxEnabled ? 1 : 0;
    sfxGain.connect(masterVolumeGain);
  }
}

function getCtx(): AudioContext {
  if (!ctx || ctx.state === "closed") {
    ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  if (ctx.state === "suspended") ctx.resume();
  ensureAudioGraph();
  return ctx;
}

function tone(freq: number, start: number, dur: number, vol = 0.3, type: OscillatorType = "sine", detune = 0) {
  const c = getCtx();
  if (!masterGain) return;
  const osc = c.createOscillator();
  const g = c.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  osc.detune.value = detune;
  g.gain.setValueAtTime(0.001, c.currentTime + start);
  g.gain.linearRampToValueAtTime(vol, c.currentTime + start + 0.01);
  g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + start + dur);
  osc.connect(g);
  g.connect(masterGain);
  osc.start(c.currentTime + start);
  osc.stop(c.currentTime + start + dur + 0.05);
}

function kick(start: number, vol = 0.6) {
  const c = getCtx();
  if (!masterGain) return;
  const o = c.createOscillator();
  const g = c.createGain();
  o.type = "sine";
  o.frequency.setValueAtTime(180, c.currentTime + start);
  o.frequency.exponentialRampToValueAtTime(40, c.currentTime + start + 0.15);
  g.gain.setValueAtTime(vol, c.currentTime + start);
  g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + start + 0.3);
  o.connect(g); g.connect(masterGain!);
  o.start(c.currentTime + start);
  o.stop(c.currentTime + start + 0.35);
}

function snare(start: number, vol = 0.4) {
  const c = getCtx();
  if (!masterGain) return;
  const buf = c.createBuffer(1, c.sampleRate * 0.15, c.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / data.length);
  const src = c.createBufferSource();
  src.buffer = buf;
  const g = c.createGain();
  const filt = c.createBiquadFilter();
  filt.type = "highpass";
  filt.frequency.value = 1500;
  g.gain.setValueAtTime(vol, c.currentTime + start);
  g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + start + 0.15);
  src.connect(filt); filt.connect(g); g.connect(masterGain!);
  src.start(c.currentTime + start);
}

function hihat(start: number, vol = 0.2) {
  const c = getCtx();
  if (!masterGain) return;
  const buf = c.createBuffer(1, c.sampleRate * 0.05, c.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / data.length);
  const src = c.createBufferSource();
  src.buffer = buf;
  const g = c.createGain();
  const filt = c.createBiquadFilter();
  filt.type = "highpass";
  filt.frequency.value = 7000;
  g.gain.setValueAtTime(vol, c.currentTime + start);
  g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + start + 0.05);
  src.connect(filt); filt.connect(g); g.connect(masterGain!);
  src.start(c.currentTime + start);
}

// â”€â”€â”€ THEME PATTERNS â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// Street Rush â€” fast, energetic like subway surfers
function playStreet(beat: number) {
  const b = beat % 4;
  // Hard kick pattern
  [0, 0.25, 0.5, 0.75].forEach(t => kick(t, 0.5));
  // Snare on 2 and 4
  snare(0.5, 0.5); snare(1.5, 0.5);
  // Hi-hats every 8th
  for (let i = 0; i < 8; i++) hihat(i * 0.25, 0.25);
  // Energetic bass run
  const bassNotes = [110, 130, 155, 110, 98, 110, 130, 155];
  bassNotes.forEach((f, i) => tone(f, i * 0.25, 0.22, 0.25, "sawtooth"));
  // Lead melody â€” upbeat
  const melody = b === 0 ? [523, 659, 784, 659] : b === 1 ? [784, 880, 784, 659] : b === 2 ? [659, 784, 880, 1047] : [1047, 880, 784, 659];
  melody.forEach((f, i) => tone(f, i * 0.5, 0.4, 0.15, "square"));
}

// Dhol Beats â€” powerful Indian percussion
function playDhol(beat: number) {
  const dhol1 = [0, 0.33, 0.5, 0.83, 1.0, 1.33, 1.5, 1.83];
  dhol1.forEach((t, i) => kick(t, i % 3 === 0 ? 0.6 : 0.35));
  snare(0.66, 0.5); snare(1.16, 0.5); snare(1.66, 0.5);
  for (let i = 0; i < 16; i++) hihat(i * 0.125, 0.15);
  const scale = [196, 220, 261, 293, 329, 261, 220, 196];
  scale.forEach((f, i) => tone(f, i * 0.25, 0.23, 0.2, "triangle"));
  const melody = [392, 440, 523, 587, 523, 440, 392, 349];
  melody.forEach((f, i) => tone(f, i * 0.25, 0.22, 0.12, "sawtooth", beat % 2 === 0 ? 5 : -5));
}

// Festival Hype
function playFestival(beat: number) {
  [0, 0.375, 0.75, 1.125, 1.5, 1.875].forEach(t => kick(t, 0.5));
  [0.5, 1.0, 1.5].forEach(t => snare(t, 0.5));
  for (let i = 0; i < 16; i++) hihat(i * 0.125, 0.2);
  const bass = [87, 87, 98, 110, 87, 87, 98, 130];
  bass.forEach((f, i) => tone(f, i * 0.25, 0.23, 0.3, "sawtooth"));
  const lead = beat % 2 === 0
    ? [523, 659, 784, 880, 784, 659, 784, 659]
    : [659, 784, 880, 1047, 880, 784, 659, 784];
  lead.forEach((f, i) => tone(f, i * 0.25, 0.22, 0.15, "square", 10));
}

// Electric Storm
function playElectronic(beat: number) {
  [0, 0.5, 1.0, 1.5].forEach(t => kick(t, 0.6));
  [0.25, 0.75, 1.25, 1.75].forEach(t => snare(t, 0.4));
  for (let i = 0; i < 16; i++) hihat(i * 0.125, 0.2);
  const bass = [55, 55, 73, 55, 55, 82, 55, 73];
  bass.forEach((f, i) => tone(f, i * 0.25, 0.24, 0.35, "square"));
  const arp = beat % 4 === 0 ? [440, 554, 659, 880] : beat % 4 === 1 ? [494, 622, 740, 988] : beat % 4 === 2 ? [523, 659, 784, 1047] : [392, 494, 587, 784];
  arp.forEach((f, i) => { tone(f, i * 0.25, 0.1, 0.2, "square"); tone(f * 2, i * 0.25 + 0.125, 0.08, 0.1, "square"); });
}

// Chill Groove
function playChill(beat: number) {
  [0, 1.0].forEach(t => kick(t, 0.4));
  snare(0.5, 0.35); snare(1.5, 0.35);
  for (let i = 0; i < 8; i++) hihat(i * 0.25, 0.15);
  const bass = [110, 110, 130, 147, 130, 110, 98, 110];
  bass.forEach((f, i) => tone(f, i * 0.25, 0.24, 0.2, "sine"));
  const pentatonic = [523, 659, 784, 880, 784, 659, 523, 440];
  pentatonic.forEach((f, i) => tone(f, i * 0.25, 0.3, 0.1, "sine"));
}

function playBeat(theme: BGMTheme, beat: number) {
  switch (theme) {
    case "street":     return playStreet(beat);
    case "dhol":       return playDhol(beat);
    case "festival":   return playFestival(beat);
    case "electronic": return playElectronic(beat);
    case "chill":      return playChill(beat);
  }
}

export function startBGM(theme: BGMTheme = "street", volume = 0.35) {
  stopBGM();
  currentTheme = theme;
  isBGMPlaying = true;
  beatCount = 0;
  bgmBaseVolume = volume;

  const c = getCtx();
  masterGain = c.createGain();
  masterGain.gain.value = musicEnabledFlag ? volume : 0;
  masterGain.connect(masterVolumeGain!);

  playBeat(theme, beatCount++);
  bgmIntervalId = setInterval(() => {
    if (isBGMPlaying) playBeat(currentTheme, beatCount++);
  }, 2000);
}

export function stopBGM() {
  isBGMPlaying = false;
  if (bgmIntervalId) { clearInterval(bgmIntervalId); bgmIntervalId = null; }
  if (masterGain) { try { masterGain.disconnect(); } catch {} masterGain = null; }
  beatCount = 0;
}

export function switchBGM(theme: BGMTheme) {
  if (isBGMPlaying) { stopBGM(); startBGM(theme); }
  else currentTheme = theme;
}

export function setBGMVolume(vol: number) {
  bgmBaseVolume = Math.max(0, Math.min(1, vol));
  if (masterGain) masterGain.gain.value = musicEnabledFlag ? bgmBaseVolume : 0;
}

export function isBGMEnabled() { return isBGMPlaying; }

// â”€â”€â”€ SFX â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export function playSfxMarbleHide() {
  if (!sfxEnabled) return;
  const c = getCtx();
  for (let i = 0; i < 5; i++) {
    const o = c.createOscillator();
    const g = c.createGain();
    o.type = "sine";
    o.frequency.value = 600 + Math.random() * 600;
    g.gain.setValueAtTime(0.3, c.currentTime + i * 0.04);
    g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + i * 0.04 + 0.08);
    o.connect(g); g.connect(sfxGain || c.destination);
    o.start(c.currentTime + i * 0.04);
    o.stop(c.currentTime + i * 0.04 + 0.1);
  }
}

export function playSfxReveal() {
  if (!sfxEnabled) return;
  const c = getCtx();
  [300, 400, 550, 750, 1000, 1300].forEach((f, i) => {
    const o = c.createOscillator();
    const g = c.createGain();
    o.type = "sine";
    o.frequency.value = f;
    g.gain.setValueAtTime(0.25, c.currentTime + i * 0.05);
    g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + i * 0.05 + 0.2);
    o.connect(g); g.connect(sfxGain || c.destination);
    o.start(c.currentTime + i * 0.05);
    o.stop(c.currentTime + i * 0.05 + 0.25);
  });
}

export function playSfxWin() {
  if (!sfxEnabled) return;
  const c = getCtx();
  // Subway surfers style win â€” fast ascending + chime
  [523, 659, 784, 1047, 1319, 1568].forEach((f, i) => {
    const o = c.createOscillator();
    const g = c.createGain();
    o.type = i < 3 ? "square" : "sine";
    o.frequency.value = f;
    g.gain.setValueAtTime(0.4, c.currentTime + i * 0.1);
    g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + i * 0.1 + 0.3);
    o.connect(g); g.connect(sfxGain || c.destination);
    o.start(c.currentTime + i * 0.1);
    o.stop(c.currentTime + i * 0.1 + 0.35);
  });
}

export function playSfxLose() {
  if (!sfxEnabled) return;
  const c = getCtx();
  [400, 350, 300, 250, 200].forEach((f, i) => {
    const o = c.createOscillator();
    const g = c.createGain();
    o.type = "triangle";
    o.frequency.value = f;
    g.gain.setValueAtTime(0.3, c.currentTime + i * 0.15);
    g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + i * 0.15 + 0.25);
    o.connect(g); g.connect(sfxGain || c.destination);
    o.start(c.currentTime + i * 0.15);
    o.stop(c.currentTime + i * 0.15 + 0.3);
  });
}

export function playSfxGuess() {
  if (!sfxEnabled) return;
  const c = getCtx();
  const o = c.createOscillator();
  const g = c.createGain();
  o.type = "sine";
  o.frequency.setValueAtTime(500, c.currentTime);
  o.frequency.linearRampToValueAtTime(900, c.currentTime + 0.15);
  g.gain.setValueAtTime(0.3, c.currentTime);
  g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.25);
  o.connect(g); g.connect(sfxGain || c.destination);
  o.start(c.currentTime);
  o.stop(c.currentTime + 0.3);
}

export function playSfxMarbleClick() {
  if (!sfxEnabled) return;
  const c = getCtx();
  const o = c.createOscillator();
  const g = c.createGain();
  o.type = "sine";
  o.frequency.value = 1200 + Math.random() * 400;
  g.gain.setValueAtTime(0.15, c.currentTime);
  g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.06);
  o.connect(g); g.connect(sfxGain || c.destination);
  o.start(c.currentTime);
  o.stop(c.currentTime + 0.08);
}


