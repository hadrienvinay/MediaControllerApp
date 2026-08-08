'use client';

import { useRef, useState } from 'react';
import {
  DrumType,
  DrumParams,
  DEFAULT_PARAMS,
  DRUM_LABELS,
  renderDrumSound,
  audioBufferToWav,
  randomizeParams,
} from '@/lib/drumSynth';
import StepSequencer from './StepSequencer';
import { DRUM_PRESETS, PRESET_ORDER, PresetId, clonePresetParams } from '@/lib/drumPresets';

const DRUM_TYPES: DrumType[] = [
  'kick', 'snare', 'clap', 'rimshot', 'tom', 'cowbell', 'hihat-closed', 'hihat-open', 'cymbal',
];

const PARAM_LABELS: { key: keyof DrumParams; label: string }[] = [
  { key: 'pitch', label: 'Pitch' },
  { key: 'decay', label: 'Decay' },
  { key: 'tone', label: 'Tone' },
  { key: 'drive', label: 'Drive' },
  { key: 'level', label: 'Level' },
];

function cloneDefaults(): Record<DrumType, DrumParams> {
  const clone = {} as Record<DrumType, DrumParams>;
  (Object.keys(DEFAULT_PARAMS) as DrumType[]).forEach(type => {
    clone[type] = { ...DEFAULT_PARAMS[type] };
  });
  return clone;
}

export default function DrumMachineForm() {
  const [activeDrum, setActiveDrum] = useState<DrumType>('kick');
  const [paramsByDrum, setParamsByDrum] = useState<Record<DrumType, DrumParams>>(cloneDefaults());
  const [activePreset, setActivePreset] = useState<PresetId | null>(null);
  const [playing, setPlaying] = useState<DrumType | null>(null);
  const [rendering, setRendering] = useState<DrumType | null>(null);
  const [renderingAll, setRenderingAll] = useState(false);
  const [lastBlobs, setLastBlobs] = useState<Partial<Record<DrumType, Blob>>>({});

  const audioCtxRef = useRef<AudioContext | null>(null);

  const getAudioCtx = () => {
    if (!audioCtxRef.current) {
      const Ctor = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      audioCtxRef.current = new Ctor();
    }
    return audioCtxRef.current;
  };

  const params = paramsByDrum[activeDrum];

  const updateParam = (key: keyof DrumParams, value: number) => {
    setParamsByDrum(prev => ({ ...prev, [activeDrum]: { ...prev[activeDrum], [key]: value } }));
    setActivePreset(null);
  };

  const loadPreset = (id: PresetId) => {
    setParamsByDrum(clonePresetParams(id));
    setActivePreset(id);
  };

  const playPreview = async (type: DrumType) => {
    setPlaying(type);
    try {
      const buffer = await renderDrumSound(type, paramsByDrum[type]);
      const ctx = getAudioCtx();
      if (ctx.state === 'suspended') await ctx.resume();
      const source = ctx.createBufferSource();
      // Re-crée un buffer lié à l'AudioContext temps réel (celui rendu vient d'un OfflineAudioContext)
      const liveBuffer = ctx.createBuffer(1, buffer.length, buffer.sampleRate);
      liveBuffer.copyToChannel(buffer.getChannelData(0), 0);
      source.buffer = liveBuffer;
      source.connect(ctx.destination);
      source.start();
      source.onended = () => setPlaying(p => (p === type ? null : p));
    } catch (err) {
      console.error('Erreur de lecture:', err);
      setPlaying(null);
    }
  };

  const downloadWav = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const exportDrum = async (type: DrumType) => {
    setRendering(type);
    try {
      const buffer = await renderDrumSound(type, paramsByDrum[type]);
      const blob = audioBufferToWav(buffer);
      setLastBlobs(prev => ({ ...prev, [type]: blob }));
      const prefix = activePreset ? `${activePreset}-` : '';
      downloadWav(blob, `${prefix}${type}-${Date.now()}.wav`);
    } catch (err) {
      console.error('Erreur d\'export:', err);
      alert('Erreur lors du rendu du son');
    } finally {
      setRendering(null);
    }
  };

  const exportAll = async () => {
    setRenderingAll(true);
    try {
      const prefix = activePreset ? `${activePreset}-` : '';
      for (const type of DRUM_TYPES) {
        const buffer = await renderDrumSound(type, paramsByDrum[type]);
        const blob = audioBufferToWav(buffer);
        setLastBlobs(prev => ({ ...prev, [type]: blob }));
        downloadWav(blob, `${prefix}${type}.wav`);
        // Petit délai pour laisser le navigateur traiter chaque téléchargement
        await new Promise(r => setTimeout(r, 150));
      }
    } catch (err) {
      console.error('Erreur export global:', err);
      alert('Erreur lors du rendu des sons');
    } finally {
      setRenderingAll(false);
    }
  };

  const randomize = () => {
    setParamsByDrum(prev => ({ ...prev, [activeDrum]: randomizeParams(activeDrum) }));
    setActivePreset(null);
  };

  const resetParams = () => {
    setParamsByDrum(prev => ({ ...prev, [activeDrum]: { ...DEFAULT_PARAMS[activeDrum] } }));
    setActivePreset(null);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Presets de kit */}
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 6, padding: '1.1rem 1.5rem' }}>
        <p style={{ fontFamily: 'var(--font-mono)', fontSize: '.6rem', letterSpacing: '.12em', textTransform: 'uppercase', color: 'var(--faint)', marginBottom: '.85rem' }}>
          Presets de kit
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '.6rem' }}>
          {PRESET_ORDER.map(id => {
            const preset = DRUM_PRESETS[id];
            const isActive = activePreset === id;
            return (
              <button
                key={id}
                onClick={() => loadPreset(id)}
                title={preset.description}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-start',
                  gap: '.3rem',
                  padding: '.75rem .9rem',
                  borderRadius: 6,
                  cursor: 'pointer',
                  textAlign: 'left',
                  background: isActive ? 'var(--accent-bg)' : 'var(--surface2)',
                  border: `1px solid ${isActive ? 'var(--accent-border)' : 'var(--border2)'}`,
                  transition: 'background .1s, border-color .1s',
                }}
              >
                <span style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '.78rem',
                  fontWeight: 600,
                  color: isActive ? 'var(--accent)' : 'var(--text)',
                }}>
                  {preset.label}
                </span>
                <span style={{
                  fontSize: '.65rem',
                  color: 'var(--faint)',
                  lineHeight: 1.4,
                }}>
                  {preset.description}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Pads */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '.6rem' }}>
        {DRUM_TYPES.map(type => {
          const isActive = activeDrum === type;
          return (
            <button
              key={type}
              onClick={() => setActiveDrum(type)}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '.5rem',
                padding: '1rem .5rem',
                borderRadius: 6,
                cursor: 'pointer',
                background: isActive ? 'var(--accent-bg)' : 'var(--surface)',
                border: `1px solid ${isActive ? 'var(--accent-border)' : 'var(--border)'}`,
                transition: 'background .1s, border-color .1s',
              }}
            >
              <span style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '.78rem',
                fontWeight: 600,
                color: isActive ? 'var(--accent)' : 'var(--text)',
              }}>
                {DRUM_LABELS[type]}
              </span>
              <span
                role="button"
                tabIndex={0}
                onClick={e => { e.stopPropagation(); playPreview(type); }}
                onKeyDown={e => { if (e.key === 'Enter') { e.stopPropagation(); playPreview(type); } }}
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '.62rem',
                  letterSpacing: '.05em',
                  color: 'var(--muted)',
                  border: '1px solid var(--border2)',
                  borderRadius: 4,
                  padding: '.25rem .6rem',
                  cursor: 'pointer',
                  background: playing === type ? 'var(--accent-bg)' : 'transparent',
                }}
              >
                {playing === type ? '● JOUE' : '▶ ÉCOUTER'}
              </span>
            </button>
          );
        })}
      </div>

      {/* Réglages du son actif */}
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 6, padding: '1.25rem 1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: '.72rem', letterSpacing: '.06em', textTransform: 'uppercase', color: 'var(--accent)' }}>
            {DRUM_LABELS[activeDrum]}
          </p>
          <div style={{ display: 'flex', gap: '.5rem' }}>
            <button
              onClick={randomize}
              style={{
                fontFamily: 'var(--font-mono)', fontSize: '.65rem', letterSpacing: '.03em',
                background: 'var(--surface2)', color: 'var(--muted)',
                border: '1px solid var(--border2)', padding: '.3rem .65rem', borderRadius: 4, cursor: 'pointer',
              }}
            >
              🎲 Randomize
            </button>
            <button
              onClick={resetParams}
              style={{
                fontFamily: 'var(--font-mono)', fontSize: '.65rem', letterSpacing: '.03em',
                background: 'var(--surface2)', color: 'var(--muted)',
                border: '1px solid var(--border2)', padding: '.3rem .65rem', borderRadius: 4, cursor: 'pointer',
              }}
            >
              Réinitialiser
            </button>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem', marginBottom: '1.25rem' }}>
          {PARAM_LABELS.map(({ key, label }) => (
            <div key={key}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '.35rem' }}>
                <label style={{ fontFamily: 'var(--font-mono)', fontSize: '.65rem', color: 'var(--faint)' }}>{label}</label>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '.65rem', color: 'var(--muted)' }}>
                  {Math.round(params[key] * 100)}
                </span>
              </div>
              <input
                type="range"
                min={0}
                max={1}
                step={0.01}
                value={params[key]}
                onChange={e => updateParam(key, parseFloat(e.target.value))}
                style={{ width: '100%', accentColor: 'var(--accent)' }}
              />
            </div>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '.6rem' }}>
          <button
            onClick={() => playPreview(activeDrum)}
            style={{
              fontFamily: 'var(--font-mono)', fontSize: '.75rem', letterSpacing: '.03em',
              background: 'var(--surface2)', color: 'var(--text)',
              border: '1px solid var(--border2)', padding: '.6rem', borderRadius: 4, cursor: 'pointer',
            }}
          >
            ▶ Écouter
          </button>
          <button
            onClick={() => exportDrum(activeDrum)}
            disabled={rendering === activeDrum}
            style={{
              fontFamily: 'var(--font-mono)', fontSize: '.75rem', letterSpacing: '.03em',
              background: 'var(--accent-bg)', color: 'var(--accent)',
              border: '1px solid var(--accent-border)', padding: '.6rem', borderRadius: 4,
              cursor: rendering === activeDrum ? 'not-allowed' : 'pointer',
              opacity: rendering === activeDrum ? .5 : 1,
            }}
          >
            {rendering === activeDrum ? 'Rendu…' : '⬇ Exporter en WAV'}
          </button>
        </div>

        {lastBlobs[activeDrum] && (
          <p style={{ marginTop: '.75rem', fontFamily: 'var(--font-mono)', fontSize: '.65rem', color: 'var(--faint)' }}>
            Dernier export prêt — WAV 44.1kHz mono, glissez-le directement dans Ableton Live.
          </p>
        )}
      </div>

      {/* Séquenceur pas-à-pas pour tester le kit en boucle */}
      <StepSequencer paramsByDrum={paramsByDrum} getAudioCtx={getAudioCtx} />

      {/* Export global */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 6, padding: '1rem 1.25rem' }}>
        <div>
          <p style={{ fontSize: '.8rem', fontWeight: 600, color: 'var(--text)', marginBottom: '.2rem' }}>Exporter tout le kit</p>
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: '.65rem', color: 'var(--faint)' }}>
            Télécharge les {DRUM_TYPES.length} sons du kit{activePreset ? ` "${DRUM_PRESETS[activePreset].label}"` : ''} avec leurs réglages actuels.
          </p>
        </div>
        <button
          onClick={exportAll}
          disabled={renderingAll}
          style={{
            fontFamily: 'var(--font-mono)', fontSize: '.72rem', letterSpacing: '.03em',
            background: 'var(--accent-bg)', color: 'var(--accent)',
            border: '1px solid var(--accent-border)', padding: '.55rem 1rem', borderRadius: 4,
            cursor: renderingAll ? 'not-allowed' : 'pointer',
            opacity: renderingAll ? .5 : 1,
            flexShrink: 0,
          }}
        >
          {renderingAll ? 'Rendu du kit…' : `⬇ Exporter le kit (${DRUM_TYPES.length} WAV)`}
        </button>
      </div>

      <p style={{ fontFamily: 'var(--font-mono)', fontSize: '.62rem', color: 'var(--faint)', lineHeight: 1.6 }}>
        Sons générés par synthèse (Web Audio API), sans échantillon préexistant — comme une boîte à rythme analogique.
        Export en WAV PCM 16-bit / 44.1kHz, compatible avec Ableton Live et tout autre DAW.
      </p>
    </div>
  );
}
