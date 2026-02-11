
import { notFound } from 'next/navigation';
import { getPlaylistById } from '@/lib/storage';
import PlaylistForm from '@/app/components/PlaylistForm';

type Track = { title: string; source: string; file?: string | File; url?: string };

interface PlaylistProps {
  params: Promise<{ id: string }>
}

export default async function  UpdatePage({ params }: PlaylistProps) {
  const {id} = await params;
  const playlistId = (id);
  const playlist = await getPlaylistById(playlistId);

  if (!playlist) {
    notFound()
  }
  console.log('Playlist récupérée pour édition:', playlist);

  return (
    <PlaylistForm initialData={{
      id: parseInt(playlistId),
      titre: playlist.name,
      description: playlist.description?? '',
      tracks: playlist.tracks.map((track) => ({
        title: track.title,
        source: track.source,
        url: track.url,
        filename: track.filename, // Les fichiers ne sont pas gérés dans ce contexte, ils doivent être réuploadés si nécessaire
      })),
    }} mode="edit" />
  );
}
