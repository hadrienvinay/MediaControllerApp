export interface ConvertedItem {
  id: string;
  title: string;
  filename: string;
  duration?: string; // Pour vidéos et durée d'affichage des images
  source: 'upload' | 'youtube' | 'url';
  thumbnail?: string; // Miniature pour les vidéos
  createdAt: Date;
}