/**
 * Moteur de synthèse de percussions électroniques (style TR-808/909).
 * 100% Web Audio API — aucune dépendance, aucun sample.
 * Génère l'audio via OfflineAudioContext puis l'encode en WAV PCM 16-bit,
 * directement utilisable dans Ableton Live ou tout autre DAW.
 */

export type DrumType = 'kick' | 'snare' | 'clap' | 'hihat-closed' | 'hihat-open' | 'tom' | 'rimshot' | 'cowbell' | 'cymbal';

export interface DrumParams {
  /** 0..1 — hauteur / fréquence de base */
  pitch: number;
  /** 0..1 — durée de l'extinction du son */
  decay: number;
  /** 0..1 — timbre : filtrage / rapport bruit-tonalité selon l'instrument */
  tone: number;
  /** 0..1 — saturation / drive analogique */
  drive: number;
  /** 0..1 — niveau de sortie */
  level: number;
}

export const DEFAULT_PARAMS: Record<DrumType, DrumParams> = {
  kick:          { pitch: 0.5, decay: 0.5, tone: 0.4, drive: 0.35, level: 0.9 },
  snare:         { pitch: 0.5, decay: 0.4, tone: 0.5, drive: 0.2,  level: 0.85 },
  clap:          { pitch: 0.5, decay: 0.45, tone: 0.5, drive: 0.15, level: 0.85 },
  'hihat-closed':{ pitch: 0.5, decay: 0.15, tone: 0.5, drive: 0.1, level: 0.75 },
  'hihat-open':  { pitch: 0.5, decay: 0.6, tone: 0.5, drive: 0.1,  level: 0.75 },
  tom:           { pitch: 0.5, decay: 0.5, tone: 0.4, drive: 0.2,  level: 0.85 },
  rimshot:       { pitch: 0.5, decay: 0.2, tone: 0.5, drive: 0.15, level: 0.8 },
  cowbell:       { pitch: 0.5, decay: 0.35, tone: 0.5, drive: 0.1, level: 0.75 },
  cymbal:        { pitch: 0.5, decay: 0.75, tone: 0.5, drive: 0.1, level: 0.7 },
};

export const DRUM_LABELS: Record<DrumType, string> = {
  kick: 'Kick',
  snare: 'Snare',
  clap: 'Clap',
  'hihat-closed': 'Hi-Hat fermé',
  'hihat-open': 'Hi-Hat ouvert',
  tom: 'Tom',
  rimshot: 'Rimshot',
  cowbell: 'Cowbell',
  cymbal: 'Cymbale',
};

const SAMPLE_RATE = 44100;

/** Bruit blanc dans un buffer réutilisable */
function createNoiseBuffer(ctx: BaseAudioContext, duration: number): AudioBuffer {
  const length = Math.max(1, Math.floor(ctx.sampleRate * duration));
  const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < length; i++) data[i] = Math.random() * 2 - 1;
  return buffer;
}

/** Waveshaper pour simuler une saturation analogique (drive) */
function createSaturationCurve(amount: number): Float32Array<ArrayBuffer> {
  const n = 1024;
  const curve = new Float32Array(new ArrayBuffer(n * 4));
  const k = amount * 50; // 0..50
  for (let i = 0; i < n; i++) {
    const x = (i / (n - 1)) * 2 - 1;
    curve[i] = k === 0 ? x : ((1 + k) * x) / (1 + k * Math.abs(x));
  }
  return curve;
}

function applyDrive(ctx: BaseAudioContext, input: AudioNode, drive: number, output: AudioNode) {
  if (drive <= 0.001) {
    input.connect(output);
    return;
  }
  const shaper = ctx.createWaveShaper();
  shaper.curve = createSaturationCurve(drive);
  shaper.oversample = '4x';
  input.connect(shaper);
  shaper.connect(output);
}

function lerp(a: number, b: number, t: number) { return a + (b - a) * t; }

/** Synthétise un KICK 808-style : sinus + pitch-envelope descendante + clic transitoire */
function synthKick(ctx: BaseAudioContext, dest: AudioNode, p: DrumParams) {
  const baseFreq = lerp(35, 90, p.pitch);
  const duration = lerp(0.25, 1.1, p.decay);
  const now = 0;

  const osc = ctx.createOscillator();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(baseFreq * 5, now);
  osc.frequency.exponentialRampToValueAtTime(Math.max(baseFreq, 1), now + 0.045);
  osc.frequency.exponentialRampToValueAtTime(Math.max(baseFreq * 0.85, 1), now + duration);

  const ampGain = ctx.createGain();
  ampGain.gain.setValueAtTime(1, now);
  ampGain.gain.exponentialRampToValueAtTime(0.001, now + duration);

  const driveGain = ctx.createGain();
  driveGain.gain.value = lerp(0.7, 1.6, p.tone);

  osc.connect(ampGain);
  ampGain.connect(driveGain);

  const out = ctx.createGain();
  out.gain.value = p.level;
  applyDrive(ctx, driveGain, p.drive, out);
  out.connect(dest);

  // Clic d'attaque (transitoire haute fréquence très court)
  const clickNoise = createNoiseBuffer(ctx, 0.006);
  const clickSrc = ctx.createBufferSource();
  clickSrc.buffer = clickNoise;
  const clickFilter = ctx.createBiquadFilter();
  clickFilter.type = 'highpass';
  clickFilter.frequency.value = 1200;
  const clickGain = ctx.createGain();
  clickGain.gain.setValueAtTime(lerp(0.15, 0.5, p.tone), now);
  clickGain.gain.exponentialRampToValueAtTime(0.001, now + 0.02);
  clickSrc.connect(clickFilter);
  clickFilter.connect(clickGain);
  clickGain.connect(out);

  osc.start(now);
  osc.stop(now + duration);
  clickSrc.start(now);

  return duration + 0.05;
}

/** Synthétise une SNARE : bruit filtré (corps) + deux oscillateurs (tonalité) */
function synthSnare(ctx: BaseAudioContext, dest: AudioNode, p: DrumParams) {
  const duration = lerp(0.12, 0.5, p.decay);
  const now = 0;
  const toneFreq = lerp(120, 280, p.pitch);

  const out = ctx.createGain();
  out.gain.value = p.level;

  // Corps tonal (deux oscillateurs légèrement désaccordés)
  const oscGain = ctx.createGain();
  oscGain.gain.setValueAtTime(0.7, now);
  oscGain.gain.exponentialRampToValueAtTime(0.001, now + duration * 0.55);
  [1, 1.5].forEach(mult => {
    const osc = ctx.createOscillator();
    osc.type = 'triangle';
    osc.frequency.value = toneFreq * mult;
    osc.connect(oscGain);
    osc.start(now);
    osc.stop(now + duration * 0.55 + 0.02);
  });

  // Bruit filtré (le "snap")
  const noiseBuffer = createNoiseBuffer(ctx, duration + 0.05);
  const noiseSrc = ctx.createBufferSource();
  noiseSrc.buffer = noiseBuffer;

  const bandpass = ctx.createBiquadFilter();
  bandpass.type = 'bandpass';
  bandpass.frequency.value = lerp(900, 2800, p.tone);
  bandpass.Q.value = 0.7;

  const highpass = ctx.createBiquadFilter();
  highpass.type = 'highpass';
  highpass.frequency.value = 700;

  const noiseGain = ctx.createGain();
  noiseGain.gain.setValueAtTime(1, now);
  noiseGain.gain.exponentialRampToValueAtTime(0.001, now + duration);

  noiseSrc.connect(bandpass);
  bandpass.connect(highpass);
  highpass.connect(noiseGain);

  const mix = ctx.createGain();
  oscGain.connect(mix);
  noiseGain.connect(mix);

  applyDrive(ctx, mix, p.drive, out);
  out.connect(dest);

  noiseSrc.start(now);
  return duration + 0.05;
}

/** Synthétise un CLAP : plusieurs bursts de bruit filtré décalés (simule les mains) */
function synthClap(ctx: BaseAudioContext, dest: AudioNode, p: DrumParams) {
  const tailDuration = lerp(0.15, 0.6, p.decay);
  const now = 0;

  const out = ctx.createGain();
  out.gain.value = p.level;

  const bandpass = ctx.createBiquadFilter();
  bandpass.type = 'bandpass';
  bandpass.frequency.value = lerp(900, 2200, p.tone);
  bandpass.Q.value = 1.2;
  applyDrive(ctx, bandpass, p.drive, out);
  out.connect(dest);

  // 3 bursts rapprochés (le "flam") + une queue plus longue
  const burstOffsets = [0, 0.011, 0.022, 0.034];
  const noiseBuffer = createNoiseBuffer(ctx, tailDuration + 0.05);

  burstOffsets.forEach((offset, i) => {
    const src = ctx.createBufferSource();
    src.buffer = noiseBuffer;
    const g = ctx.createGain();
    const isLast = i === burstOffsets.length - 1;
    const burstDur = isLast ? tailDuration : 0.02;
    g.gain.setValueAtTime(0.9, now + offset);
    g.gain.exponentialRampToValueAtTime(0.001, now + offset + burstDur);
    src.connect(g);
    g.connect(bandpass);
    src.start(now + offset);
  });

  return tailDuration + burstOffsets[burstOffsets.length - 1] + 0.05;
}

/** Synthétise un HI-HAT (fermé ou ouvert) : 6 oscillateurs carrés désaccordés → passe-haut */
function synthHihat(ctx: BaseAudioContext, dest: AudioNode, p: DrumParams, open: boolean) {
  const duration = open ? lerp(0.25, 1.0, p.decay) : lerp(0.04, 0.25, p.decay);
  const now = 0;
  const baseFreq = lerp(280, 500, p.pitch);
  // Ratios inharmoniques typiques d'un métal (cymbale)
  const ratios = [2, 3, 4.16, 5.43, 6.79, 8.21];

  const out = ctx.createGain();
  out.gain.value = p.level;

  const bandpass = ctx.createBiquadFilter();
  bandpass.type = 'bandpass';
  bandpass.frequency.value = 5000;
  bandpass.Q.value = 0.5;

  const highpass = ctx.createBiquadFilter();
  highpass.type = 'highpass';
  highpass.frequency.value = lerp(4000, 9000, p.tone);

  const ampGain = ctx.createGain();
  ampGain.gain.setValueAtTime(1, now);
  ampGain.gain.exponentialRampToValueAtTime(0.001, now + duration);

  const mix = ctx.createGain();
  mix.gain.value = 0.35;

  ratios.forEach(r => {
    const osc = ctx.createOscillator();
    osc.type = 'square';
    osc.frequency.value = baseFreq * r;
    osc.connect(mix);
    osc.start(now);
    osc.stop(now + duration + 0.02);
  });

  mix.connect(bandpass);
  bandpass.connect(highpass);
  highpass.connect(ampGain);
  applyDrive(ctx, ampGain, p.drive, out);
  out.connect(dest);

  return duration + 0.05;
}

/** Synthétise un TOM : sinus + pitch-envelope, tessiture plus haute et enveloppe plus douce que le kick */
function synthTom(ctx: BaseAudioContext, dest: AudioNode, p: DrumParams) {
  const baseFreq = lerp(90, 260, p.pitch);
  const duration = lerp(0.2, 0.7, p.decay);
  const now = 0;

  const osc = ctx.createOscillator();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(baseFreq * 2.2, now);
  osc.frequency.exponentialRampToValueAtTime(Math.max(baseFreq, 1), now + 0.09);

  const ampGain = ctx.createGain();
  ampGain.gain.setValueAtTime(1, now);
  ampGain.gain.exponentialRampToValueAtTime(0.001, now + duration);

  const toneGain = ctx.createGain();
  toneGain.gain.value = lerp(0.6, 1.3, p.tone);

  osc.connect(ampGain);
  ampGain.connect(toneGain);

  const out = ctx.createGain();
  out.gain.value = p.level;
  applyDrive(ctx, toneGain, p.drive, out);
  out.connect(dest);

  osc.start(now);
  osc.stop(now + duration + 0.02);

  return duration + 0.05;
}

/** Synthétise un RIMSHOT : clic filtré court + pointe tonale, façon coup de baguette sur le cerclage */
function synthRimshot(ctx: BaseAudioContext, dest: AudioNode, p: DrumParams) {
  const duration = lerp(0.06, 0.22, p.decay);
  const now = 0;
  const toneFreq = lerp(300, 550, p.pitch);

  const out = ctx.createGain();
  out.gain.value = p.level;

  // Pointe tonale (deux oscillateurs carrés très courts)
  const oscGain = ctx.createGain();
  oscGain.gain.setValueAtTime(0.8, now);
  oscGain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
  [1, 1.8].forEach(mult => {
    const osc = ctx.createOscillator();
    osc.type = 'square';
    osc.frequency.value = toneFreq * mult;
    osc.connect(oscGain);
    osc.start(now);
    osc.stop(now + 0.05);
  });

  // Clic de bruit filtré (l'attaque sèche caractéristique du rimshot)
  const noiseBuffer = createNoiseBuffer(ctx, duration + 0.02);
  const noiseSrc = ctx.createBufferSource();
  noiseSrc.buffer = noiseBuffer;
  const bandpass = ctx.createBiquadFilter();
  bandpass.type = 'bandpass';
  bandpass.frequency.value = lerp(1500, 3500, p.tone);
  bandpass.Q.value = 2;
  const noiseGain = ctx.createGain();
  noiseGain.gain.setValueAtTime(0.7, now);
  noiseGain.gain.exponentialRampToValueAtTime(0.001, now + duration);
  noiseSrc.connect(bandpass);
  bandpass.connect(noiseGain);

  const mix = ctx.createGain();
  oscGain.connect(mix);
  noiseGain.connect(mix);
  applyDrive(ctx, mix, p.drive, out);
  out.connect(dest);

  noiseSrc.start(now);
  return duration + 0.05;
}

/** Synthétise un COWBELL : deux oscillateurs carrés désaccordés (ratio ~1.5), façon 808 */
function synthCowbell(ctx: BaseAudioContext, dest: AudioNode, p: DrumParams) {
  const duration = lerp(0.15, 0.5, p.decay);
  const now = 0;
  const baseFreq = lerp(400, 620, p.pitch);

  const out = ctx.createGain();
  out.gain.value = p.level;

  const bandpass = ctx.createBiquadFilter();
  bandpass.type = 'bandpass';
  bandpass.frequency.value = lerp(600, 1400, p.tone);
  bandpass.Q.value = 1.5;

  const ampGain = ctx.createGain();
  ampGain.gain.setValueAtTime(1, now);
  ampGain.gain.exponentialRampToValueAtTime(0.001, now + duration);

  [1, 1.48].forEach(mult => {
    const osc = ctx.createOscillator();
    osc.type = 'square';
    osc.frequency.value = baseFreq * mult;
    osc.connect(ampGain);
    osc.start(now);
    osc.stop(now + duration + 0.02);
  });

  ampGain.connect(bandpass);
  applyDrive(ctx, bandpass, p.drive, out);
  out.connect(dest);

  return duration + 0.05;
}

/** Synthétise une CYMBALE (crash/ride) : nombreux oscillateurs inharmoniques, enveloppe longue */
function synthCymbal(ctx: BaseAudioContext, dest: AudioNode, p: DrumParams) {
  const duration = lerp(0.6, 2.0, p.decay);
  const now = 0;
  const baseFreq = lerp(250, 420, p.pitch);
  const ratios = [1, 1.65, 2.41, 3.12, 4.09, 5.43, 6.87, 8.15];

  const out = ctx.createGain();
  out.gain.value = p.level;

  const highpass = ctx.createBiquadFilter();
  highpass.type = 'highpass';
  highpass.frequency.value = lerp(2500, 6000, p.tone);

  const ampGain = ctx.createGain();
  ampGain.gain.setValueAtTime(1, now);
  ampGain.gain.exponentialRampToValueAtTime(0.001, now + duration);

  const mix = ctx.createGain();
  mix.gain.value = 0.25;

  ratios.forEach(r => {
    const osc = ctx.createOscillator();
    osc.type = 'square';
    osc.frequency.value = baseFreq * r;
    osc.connect(mix);
    osc.start(now);
    osc.stop(now + duration + 0.02);
  });

  mix.connect(highpass);
  highpass.connect(ampGain);
  applyDrive(ctx, ampGain, p.drive, out);
  out.connect(dest);

  return duration + 0.05;
}

/**
 * Rend un son de batterie hors-ligne et retourne l'AudioBuffer résultant.
 */
export async function renderDrumSound(type: DrumType, params: DrumParams): Promise<AudioBuffer> {
  // Durée max de rendu (large marge selon le type + decay)
  const maxDuration = 2.1;
  const ctx = new OfflineAudioContext(1, Math.ceil(SAMPLE_RATE * maxDuration), SAMPLE_RATE);

  const master = ctx.createGain();
  master.gain.value = 1;
  master.connect(ctx.destination);

  let actualDuration = 0.5;
  switch (type) {
    case 'kick': actualDuration = synthKick(ctx, master, params); break;
    case 'snare': actualDuration = synthSnare(ctx, master, params); break;
    case 'clap': actualDuration = synthClap(ctx, master, params); break;
    case 'hihat-closed': actualDuration = synthHihat(ctx, master, params, false); break;
    case 'hihat-open': actualDuration = synthHihat(ctx, master, params, true); break;
    case 'tom': actualDuration = synthTom(ctx, master, params); break;
    case 'rimshot': actualDuration = synthRimshot(ctx, master, params); break;
    case 'cowbell': actualDuration = synthCowbell(ctx, master, params); break;
    case 'cymbal': actualDuration = synthCymbal(ctx, master, params); break;
  }

  const rendered = await ctx.startRendering();

  // Tronque le buffer à la durée réelle (+ marge) pour éviter un silence de fin trop long
  const trimSamples = Math.min(rendered.length, Math.ceil(SAMPLE_RATE * Math.min(actualDuration, maxDuration)));
  const trimmed = new AudioBuffer({ length: trimSamples, sampleRate: SAMPLE_RATE, numberOfChannels: 1 });
  trimmed.copyToChannel(rendered.getChannelData(0).slice(0, trimSamples), 0);
  return trimmed;
}

/** Génère des paramètres aléatoires "musicalement plausibles" autour des valeurs par défaut */
export function randomizeParams(type: DrumType): DrumParams {
  const base = DEFAULT_PARAMS[type];
  const jitter = (v: number, amount = 0.35) => {
    const next = v + (Math.random() * 2 - 1) * amount;
    return Math.min(1, Math.max(0, next));
  };
  return {
    pitch: jitter(base.pitch),
    decay: jitter(base.decay),
    tone: jitter(base.tone),
    drive: jitter(base.drive, 0.25),
    level: base.level,
  };
}

/** Encode un AudioBuffer mono en WAV PCM 16-bit (compatible Ableton / tout DAW) */
export function audioBufferToWav(buffer: AudioBuffer): Blob {
  const numChannels = 1;
  const sampleRate = buffer.sampleRate;
  const data = buffer.getChannelData(0);
  const bytesPerSample = 2;
  const blockAlign = numChannels * bytesPerSample;
  const dataSize = data.length * bytesPerSample;
  const bufferLength = 44 + dataSize;

  const arrayBuffer = new ArrayBuffer(bufferLength);
  const view = new DataView(arrayBuffer);

  const writeString = (offset: number, str: string) => {
    for (let i = 0; i < str.length; i++) view.setUint8(offset + i, str.charCodeAt(i));
  };

  writeString(0, 'RIFF');
  view.setUint32(4, bufferLength - 8, true);
  writeString(8, 'WAVE');
  writeString(12, 'fmt ');
  view.setUint32(16, 16, true); // fmt chunk size
  view.setUint16(20, 1, true); // PCM
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * blockAlign, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, bytesPerSample * 8, true);
  writeString(36, 'data');
  view.setUint32(40, dataSize, true);

  let offset = 44;
  for (let i = 0; i < data.length; i++) {
    const s = Math.max(-1, Math.min(1, data[i]));
    view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7fff, true);
    offset += 2;
  }

  return new Blob([arrayBuffer], { type: 'audio/wav' });
}
