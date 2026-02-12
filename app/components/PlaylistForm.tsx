'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

type Track = { title: string; source: string; file?: File; url?: string , filename?: string};

interface PlaylistFormProps {
  initialData?: {
    id?: number
    titre: string
    description: string
    tracks: Track[]
  }
  mode: 'create' | 'edit'
}

export default function PlaylistForm({ initialData, mode }: PlaylistFormProps) {

  const router = useRouter();
  const [playlistName, setPlaylistName] = useState(initialData?.titre || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [tracks, setTracks] = useState<Track[]>(initialData?.tracks || []);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const addTrack = (type: 'upload' | 'youtube' | 'soundcloud') => {
    setTracks([...tracks, { title: '', source: type }]);
  };

  const removeTrack = (index: number) => {
    setTracks(tracks.filter((_, i) => i !== index));
  };

  const updateTrack = (index: number, field: string, value: any) => {
    const newTracks = [...tracks];
    newTracks[index] = { ...newTracks[index], [field]: value };
    setTracks(newTracks);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Créer la playlist d'abord
      const url = mode === 'create' ? '/api/playlists' : `/api/playlists?id=${initialData?.id}`;
      const method = mode === 'create' ? 'POST' : 'PUT';
      const playlistResponse = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: playlistName,
          description,
          tracks: tracks,
        }),
      });

      if (!playlistResponse.ok) {
        throw new Error('Erreur lors de la création de la playlist');
      }

      const playlist = await playlistResponse.json();

      // Uploader chaque track
      for (const track of tracks) {
        if (!track.filename) {
          const formData = new FormData(); 
          formData.append('playlistId', playlist.id);
          formData.append('title', track.title);
          formData.append('source', track.source);
          if (track.source === 'upload' && track.file) {
            formData.append('file', track.file);
            await fetch('/api/upload', {
              method: 'POST',
              body: formData,
            });
          } else if ((track.source === 'youtube' || track.source === 'soundcloud') && track.url) {
            formData.append('url', track.url);
            await fetch('/api/download', {
              method: 'POST',
              body: formData,
            });
          }
        }
      }

      router.push('/musique');
      router.refresh();
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors de la création de la playlist');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-4xl font-bold mb-8">{initialData ? `Modifier la playlist "${initialData.titre}"` : 'Créer une nouvelle playlist'}</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Informations de la playlist */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 space-y-4">
          <h2 className="text-2xl font-semibold">Informations</h2>
          
          <div>
            <label className="block text-sm font-medium mb-2">
              Nom de la playlist *
            </label>
            <input
              type="text"
              value={playlistName}
              onChange={(e) => setPlaylistName(e.target.value)}
              required
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
              placeholder="Ma super playlist"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
              placeholder="Description de votre playlist..."
              rows={3}
            />
          </div>
        </div>

        {/* Ajout de tracks */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-semibold">Titres</h2>
            <div className="space-x-2">
              <button
                type="button"
                onClick={() => addTrack('upload')}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm transition"
              >
                📁 Fichier MP3
              </button>
              <button
                type="button"
                onClick={() => addTrack('youtube')}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm transition"
              >
                ▶️ YouTube
              </button>
              <button
                type="button"
                onClick={() => addTrack('soundcloud')}
                className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg text-sm transition"
              >
                ☁️ SoundCloud
              </button>
            </div>
          </div>

          {tracks.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              Ajoutez des titres à votre playlist
            </p>
          ) : (
            <div className="space-y-4">
              {tracks.map((track, index) => (
                <div key={index} className="border rounded-lg p-4 dark:border-gray-600">
                  <div className="flex items-start gap-4">
                    <div className="flex-1 space-y-3">
                      <input
                        type="text"
                        value={track.title}
                        onChange={(e) => updateTrack(index, 'title', e.target.value)}
                        placeholder="Titre du morceau"
                        required
                        className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                      />
                    
                    {track.filename ? (
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Fichier déja chargé
                      </p>
                    ) : track.source === 'upload' ? (
                      <input
                        type="file"
                        accept="audio/mp3,audio/mpeg"
                        onChange={(e) => updateTrack(index, 'file', e.target.files?.[0])}
                        required
                        className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                      />
                    ) : (
                      <input
                        type="url"
                        value={track.url || ''}
                        onChange={(e) => updateTrack(index, 'url', e.target.value)}
                        placeholder={`URL ${track.source === 'youtube' ? 'YouTube' : 'SoundCloud'}`}
                        required
                        className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                      />
                    )}
             
                    </div>

                    <button
                      type="button"
                      onClick={() => removeTrack(index)}
                      className="text-red-600 hover:text-red-700 font-bold px-3 py-2"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Boutons d'action */}
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => router.push('/musique')}
            className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-100 dark:border-gray-600 dark:hover:bg-gray-700 transition"
          >
            Annuler
          </button>
          <button
            type="submit"
            disabled={isSubmitting || !playlistName || tracks.length === 0}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            {isSubmitting ? (initialData ? 'Mise à jour...' : 'Création...') : (initialData ? 'Mettre à jour' : 'Créer la playlist')}
          </button>
        </div>
      </form>
    </div>
  );
}
