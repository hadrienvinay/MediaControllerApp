import { DrumType, DrumParams } from './drumSynth';

export type PresetId = 'techno' | 'acid' | 'house' | 'lofi';

export interface DrumPreset {
  id: PresetId;
  label: string;
  description: string;
  params: Record<DrumType, DrumParams>;
}

export const DRUM_PRESETS: Record<PresetId, DrumPreset> = {
  techno: {
    id: 'techno',
    label: 'Techno',
    description: 'Kick sec et punchy, hi-hats serrés, peu de decay — efficacité rythmique pure.',
    params: {
      kick:          { pitch: 0.42, decay: 0.32, tone: 0.55, drive: 0.6,  level: 1.0 },
      snare:         { pitch: 0.45, decay: 0.3,  tone: 0.55, drive: 0.35, level: 0.8 },
      clap:          { pitch: 0.5,  decay: 0.3,  tone: 0.65, drive: 0.3,  level: 0.85 },
      'hihat-closed':{ pitch: 0.55, decay: 0.08, tone: 0.65, drive: 0.15, level: 0.7 },
      'hihat-open':  { pitch: 0.55, decay: 0.35, tone: 0.6,  drive: 0.15, level: 0.65 },
      tom:           { pitch: 0.4,  decay: 0.35, tone: 0.45, drive: 0.3,  level: 0.75 },
      rimshot:       { pitch: 0.5,  decay: 0.15, tone: 0.55, drive: 0.25, level: 0.7 },
      cowbell:       { pitch: 0.45, decay: 0.25, tone: 0.45, drive: 0.2,  level: 0.6 },
      cymbal:        { pitch: 0.4,  decay: 0.45, tone: 0.55, drive: 0.15, level: 0.55 },
    },
  },

  acid: {
    id: 'acid',
    label: 'Acid',
    description: 'Esthétique 303/909 : cowbell et rimshot marqués, toms résonants, drive prononcé.',
    params: {
      kick:          { pitch: 0.38, decay: 0.4,  tone: 0.5,  drive: 0.55, level: 1.0 },
      snare:         { pitch: 0.55, decay: 0.35, tone: 0.6,  drive: 0.4,  level: 0.8 },
      clap:          { pitch: 0.5,  decay: 0.4,  tone: 0.55, drive: 0.35, level: 0.8 },
      'hihat-closed':{ pitch: 0.6,  decay: 0.1,  tone: 0.7,  drive: 0.2,  level: 0.7 },
      'hihat-open':  { pitch: 0.6,  decay: 0.4,  tone: 0.65, drive: 0.2,  level: 0.65 },
      tom:           { pitch: 0.55, decay: 0.55, tone: 0.5,  drive: 0.4,  level: 0.85 },
      rimshot:       { pitch: 0.6,  decay: 0.25, tone: 0.65, drive: 0.35, level: 0.85 },
      cowbell:       { pitch: 0.55, decay: 0.4,  tone: 0.6,  drive: 0.3,  level: 0.8 },
      cymbal:        { pitch: 0.45, decay: 0.5,  tone: 0.6,  drive: 0.2,  level: 0.55 },
    },
  },

  house: {
    id: 'house',
    label: 'House',
    description: 'Kick rond et chaud, snare/clap ample, hi-hats groovy — son propre et chaleureux.',
    params: {
      kick:          { pitch: 0.5,  decay: 0.6,  tone: 0.35, drive: 0.25, level: 0.95 },
      snare:         { pitch: 0.5,  decay: 0.55, tone: 0.45, drive: 0.1,  level: 0.85 },
      clap:          { pitch: 0.5,  decay: 0.55, tone: 0.45, drive: 0.1,  level: 0.85 },
      'hihat-closed':{ pitch: 0.5,  decay: 0.2,  tone: 0.45, drive: 0.05, level: 0.75 },
      'hihat-open':  { pitch: 0.5,  decay: 0.7,  tone: 0.45, drive: 0.05, level: 0.7 },
      tom:           { pitch: 0.5,  decay: 0.55, tone: 0.4,  drive: 0.15, level: 0.8 },
      rimshot:       { pitch: 0.45, decay: 0.2,  tone: 0.45, drive: 0.1,  level: 0.75 },
      cowbell:       { pitch: 0.5,  decay: 0.4,  tone: 0.45, drive: 0.05, level: 0.65 },
      cymbal:        { pitch: 0.5,  decay: 0.85, tone: 0.45, drive: 0.05, level: 0.6 },
    },
  },

  lofi: {
    id: 'lofi',
    label: 'Lo-Fi',
    description: 'Sons courts, filtrés et saturés — esthétique "sample dégradé" façon lo-fi hip-hop.',
    params: {
      kick:          { pitch: 0.45, decay: 0.3,  tone: 0.2,  drive: 0.65, level: 0.8 },
      snare:         { pitch: 0.4,  decay: 0.25, tone: 0.25, drive: 0.6,  level: 0.7 },
      clap:          { pitch: 0.4,  decay: 0.25, tone: 0.25, drive: 0.55, level: 0.7 },
      'hihat-closed':{ pitch: 0.35, decay: 0.08, tone: 0.25, drive: 0.5,  level: 0.55 },
      'hihat-open':  { pitch: 0.35, decay: 0.3,  tone: 0.25, drive: 0.5,  level: 0.5 },
      tom:           { pitch: 0.4,  decay: 0.3,  tone: 0.2,  drive: 0.55, level: 0.65 },
      rimshot:       { pitch: 0.4,  decay: 0.12, tone: 0.25, drive: 0.5,  level: 0.6 },
      cowbell:       { pitch: 0.4,  decay: 0.2,  tone: 0.2,  drive: 0.45, level: 0.5 },
      cymbal:        { pitch: 0.35, decay: 0.35, tone: 0.2,  drive: 0.4,  level: 0.45 },
    },
  },
};

export const PRESET_ORDER: PresetId[] = ['techno', 'acid', 'house', 'lofi'];

export function clonePresetParams(id: PresetId): Record<DrumType, DrumParams> {
  const preset = DRUM_PRESETS[id];
  const clone = {} as Record<DrumType, DrumParams>;
  (Object.keys(preset.params) as DrumType[]).forEach(type => {
    clone[type] = { ...preset.params[type] };
  });
  return clone;
}
