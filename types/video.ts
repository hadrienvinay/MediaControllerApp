export interface MediaItem {
  id: string;
  title: string;
  type: 'video' | 'image';
  filename: string;
  duration?: number; // Pour vidéos et durée d'affichage des images
  source: 'upload' | 'youtube' | 'url';
  thumbnail?: string; // Miniature pour les vidéos
  createdAt: Date;
}

export interface VideoProject {
  id: string;
  name: string;
  description?: string;
  media: MediaItem[];
  settings: VideoSettings;
  compiledVideo?: string; // Nom du fichier vidéo compilé
  compiledDuration?: number; // Durée totale
  isCompiling?: boolean; // Indique si la compilation est en cours
  compileError?: string; // Message d'erreur si la compilation a échoué
  createdAt: Date;
  updatedAt: Date;
}

export interface VideoSettings {
  transitionDuration?: number; // Durée des transitions en secondes (défaut: 1)
  transitionType?: 'fade' | 'dissolve' | 'wipe' | 'slide'; // Type de transition
  imageDuration?: number; // Durée d'affichage des images en secondes (défaut: 5)
  resolution?: '720p' | '1080p' | '4k'; // Résolution de sortie
  fps?: number; // Images par seconde (défaut: 30)
  audioTrack?: string; // Piste audio optionnelle à ajouter
  includeAudio?: boolean; // Garder l'audio des vidéos sources
}
