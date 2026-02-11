export interface Track {
  id: string;
  title: string;
  artist?: string;
  duration?: number;
  filename: string;
  source: 'upload' | 'youtube' | 'soundcloud';
  createdAt: Date;
  url?: string; // URL d'origine pour les sources YouTube/SoundCloud
}

export interface Playlist {
  id: string;
  name: string;
  description?: string;
  tracks: Track[];
  mixedFile?: string; // Nom du fichier MP3 mixé avec transitions
  mixedDuration?: number; // Durée totale en secondes
  isMixing?: boolean; // Indique si le mix est en cours
  mixError?: string; // Message d'erreur si le mix a échoué
  createdAt: Date;
  updatedAt: Date;
}
