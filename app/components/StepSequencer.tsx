'use client';

import { useEffect, useRef, useState } from 'react';
import { DrumType, DrumParams, DRUM_LABELS, renderDrumSound } from '@/lib/drumSynth';

const STEPS = 16;
const STEPS_PER_BEAT = 4; // grille en doubles-croches → 4 steps = 1 temps

const SEQUENCER_DRUMS: DrumType[] = [
  'kick', 'snare', 'clap', 'rimshot', 'tom', 'cowbell', 'hihat-closed', 'hihat-open', 'cymbal',
];

// Scheduler "lookahead" — évite la dérive de setInterval, cf. pattern standard Web Audio
const SCHEDULE_INTERVAL_MS = 25;
const LOOKAHEAD_SEC = 0.1;

interface StepSequencerProps {
  paramsByDrum: Record<DrumType, DrumParams>;
  getAudioCtx: () => AudioContext;
}

export default function StepSequencer({ paramsByDrum, getAudioCtx }: StepSequencerProps) {
  const [pattern, setPattern] = useState<Record<DrumType, boolean[]>>(() => {
    const init = {} as Record<DrumType, boolean[]>;
    SEQUENCER_DRUMS.forEach(d => { init[d] = new Array(STEPS).fill(false); });
    return init;
  });
  const [bpm, setBpm] = useState(120);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentStep, setCurrentStep] = useState(-1);

  // Buffers audio pré-rendus (un par instrument, régénérés si les réglages changent)
  const buffersRef = useRef<Partial<Record<DrumType, AudioBuffer>>>({});
  const patternRef = useRef(pattern);
  const bpmRef = useRef(bpm);
  const nextStepTimeRef = useRef(0);
  const stepIndexRef = useRef(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  patternRef.current = pattern;
  bpmRef.current = bpm;

  // Re-rend les buffers audio quand les réglages des instruments changent
  useEffect(() => {
    let cancelled = false;
    (async () => {
      for (const type of SEQUENCER_DRUMS) {
        const buffer = await renderDrumSound(type, paramsByDrum[type]);
        if (cancelled) return;
        buffersRef.current[type] = buffer;
      }
    })();
    return () => { cancelled = true; };
  }, [paramsByDrum]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const toggleStep = (drum: DrumType, step: number) => {
    setPattern(prev => ({
      ...prev,
      [drum]: prev[drum].map((v, i) => (i === step ? !v : v)),
    }));
  };

  const clearPattern = () => {
    const cleared = {} as Record<DrumType, boolean[]>;
    SEQUENCER_DRUMS.forEach(d => { cleared[d] = new Array(STEPS).fill(false); });
    setPattern(cleared);
  };

  const playStepSound = (ctx: AudioContext, type: DrumType, time: number) => {
    const buffer = buffersRef.current[type];
    if (!buffer) return;
    const liveBuffer = ctx.createBuffer(1, buffer.length, buffer.sampleRate);
    liveBuffer.copyToChannel(buffer.getChannelData(0), 0);
    const source = ctx.createBufferSource();
    source.buffer = liveBuffer;
    source.connect(ctx.destination);
    source.start(time);
  };

  const scheduler = (ctx: AudioContext) => {
    const secondsPerStep = 60 / bpmRef.current / STEPS_PER_BEAT;
    while (nextStepTimeRef.current < ctx.currentTime + LOOKAHEAD_SEC) {
      const step = stepIndexRef.current;
      SEQUENCER_DRUMS.forEach(type => {
        if (patternRef.current[type][step]) {
          playStepSound(ctx, type, nextStepTimeRef.current);
        }
      });
      const capturedStep = step;
      const delayMs = Math.max(0, (nextStepTimeRef.current - ctx.currentTime) * 1000);
      setTimeout(() => setCurrentStep(capturedStep), delayMs);

      nextStepTimeRef.current += secondsPerStep;
      stepIndexRef.current = (stepIndexRef.current + 1) % STEPS;
    }
  };

  const start = async () => {
    const ctx = getAudioCtx();
    if (ctx.state === 'suspended') await ctx.resume();
    stepIndexRef.current = 0;
    nextStepTimeRef.current = ctx.currentTime + 0.05;
    setIsPlaying(true);
    timerRef.current = setInterval(() => scheduler(ctx), SCHEDULE_INTERVAL_MS);
  };

  const stop = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = null;
    setIsPlaying(false);
    setCurrentStep(-1);
  };

  const togglePlay = () => {
    if (isPlaying) stop();
    else start();
  };

  return (
    <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 6, padding: '1.25rem 1.5rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.1rem', flexWrap: 'wrap', gap: '.75rem' }}>
        <p style={{ fontFamily: 'var(--font-mono)', fontSize: '.72rem', letterSpacing: '.06em', textTransform: 'uppercase', color: 'var(--accent)' }}>
          Séquenceur — 16 pas
        </p>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem' }}>
            <label style={{ fontFamily: 'var(--font-mono)', fontSize: '.65rem', color: 'var(--faint)' }}>BPM</label>
            <input
              type="number"
              min={40}
              max={220}
              value={bpm}
              onChange={e => setBpm(Math.min(220, Math.max(40, parseInt(e.target.value, 10) || 120)))}
              style={{
                width: 64, background: 'var(--bg)', border: '1px solid var(--border2)', borderRadius: 4,
                padding: '.3rem .5rem', color: 'var(--text)', fontFamily: 'var(--font-mono)', fontSize: '.75rem',
              }}
            />
            <input
              type="range"
              min={40}
              max={220}
              value={bpm}
              onChange={e => setBpm(parseInt(e.target.value, 10))}
              style={{ width: 120, accentColor: 'var(--accent)' }}
            />
          </div>

          <button
            onClick={clearPattern}
            style={{
              fontFamily: 'var(--font-mono)', fontSize: '.65rem', letterSpacing: '.03em',
              background: 'var(--surface2)', color: 'var(--muted)',
              border: '1px solid var(--border2)', padding: '.35rem .7rem', borderRadius: 4, cursor: 'pointer',
            }}
          >
            Effacer
          </button>

          <button
            onClick={togglePlay}
            style={{
              fontFamily: 'var(--font-mono)', fontSize: '.72rem', letterSpacing: '.03em', fontWeight: 600,
              background: isPlaying ? 'rgba(248,81,73,.1)' : 'var(--accent-bg)',
              color: isPlaying ? '#f85149' : 'var(--accent)',
              border: `1px solid ${isPlaying ? 'rgba(248,81,73,.3)' : 'var(--accent-border)'}`,
              padding: '.4rem 1rem', borderRadius: 4, cursor: 'pointer',
            }}
          >
            {isPlaying ? '■ Stop' : '▶ Play'}
          </button>
        </div>
      </div>

      {/* Grille du séquenceur */}
      <div style={{ overflowX: 'auto' }}>
        <div style={{ minWidth: 640 }}>
          {SEQUENCER_DRUMS.map(type => (
            <div key={type} style={{ display: 'flex', alignItems: 'center', gap: '.5rem', marginBottom: '.4rem' }}>
              <span style={{
                width: 96, flexShrink: 0,
                fontFamily: 'var(--font-mono)', fontSize: '.65rem', color: 'var(--muted)',
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
              }}>
                {DRUM_LABELS[type]}
              </span>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(16, 1fr)', gap: '.25rem', flex: 1 }}>
                {pattern[type].map((active, step) => {
                  const isCurrent = isPlaying && currentStep === step;
                  const isBeatStart = step % STEPS_PER_BEAT === 0;
                  return (
                    <button
                      key={step}
                      onClick={() => toggleStep(type, step)}
                      style={{
                        height: 26,
                        borderRadius: 3,
                        cursor: 'pointer',
                        background: active
                          ? 'var(--accent)'
                          : isCurrent
                            ? 'var(--border2)'
                            : isBeatStart ? 'var(--surface2)' : 'var(--bg)',
                        border: `1px solid ${active ? 'var(--accent-border)' : isCurrent ? 'var(--accent)' : 'var(--border2)'}`,
                        opacity: active ? 1 : isBeatStart ? 0.9 : 0.6,
                        transition: 'background .05s',
                      }}
                      aria-label={`${DRUM_LABELS[type]} step ${step + 1}`}
                    />
                  );
                })}
              </div>
            </div>
          ))}

          {/* Repères de temps */}
          <div style={{ display: 'flex', gap: '.5rem', marginTop: '.5rem' }}>
            <span style={{ width: 96, flexShrink: 0 }} />
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(16, 1fr)', gap: '.25rem', flex: 1 }}>
              {Array.from({ length: STEPS }).map((_, step) => (
                <span
                  key={step}
                  style={{
                    textAlign: 'center',
                    fontFamily: 'var(--font-mono)', fontSize: '.58rem', color: 'var(--faint)',
                  }}
                >
                  {step % STEPS_PER_BEAT === 0 ? step / STEPS_PER_BEAT + 1 : ''}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      <p style={{ marginTop: '.9rem', fontFamily: 'var(--font-mono)', fontSize: '.62rem', color: 'var(--faint)', lineHeight: 1.6 }}>
        Boucle de test à {bpm} BPM (4 temps, 16 doubles-croches) — utilise les réglages actuels de chaque instrument. Modifie les pads ci-dessus pour entendre le changement ici.
      </p>
    </div>
  );
}
