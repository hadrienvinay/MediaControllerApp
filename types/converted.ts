export interface ConvertedItem {
  id: string;
  title: string;
  filename: string;
  displayName?: string; // "Artist - Title.ext" suggested download filename
  duration?: string;
  source: 'upload' | 'youtube' | 'url';
  thumbnail?: string;
  createdAt: Date;
}