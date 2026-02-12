'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Playlist } from '@/types/playlist';

export default function PlaylistsPage() {
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [loading, setLoading] = useState(true);
  const [mixingPlaylistId, setMixingPlaylistId] = useState<string | null>(null);

  const fetchPlaylists = async () => {
    try {
      const response = await fetch('/api/playlists');
      const data = await response.json();
      setPlaylists(data);
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlaylists();
  }, []);

  const handleMix = async (playlistId: string) => {
    setMixingPlaylistId(playlistId);

    try {
      const response = await fetch('/api/mix', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playlistId }),
      });

      if (!response.ok) {
        const error = await response.json();
        alert(`Erreur: ${error.error}`);
      } else {
        // Rafraîchir la liste des playlists
        await fetchPlaylists();
      }
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors du mixage');
    } finally {
      setMixingPlaylistId(null);
    }
  };

  const formatDuration = (seconds?: number) => {
    if (!seconds) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl">Chargement...</div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-4xl font-bold">Mes Playlists</h1>
        <Link 
          href="/playlists/create"
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition"
        >
          + Nouvelle Playlist
        </Link>
      </div>

      {playlists.length === 0 ? (
        <div className="text-center py-20 bg-gray-100 dark:bg-gray-800 rounded-lg">
          <p className="text-xl text-gray-600 dark:text-gray-400 mb-4">
            Aucune playlist pour le moment
          </p>
          <Link 
            href="/playlists/create"
            className="text-blue-600 hover:text-blue-700 font-semibold"
          >
            Créez votre première playlist →
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-8">
          {playlists.map((playlist) => (
            <div 
              key={playlist.id}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 hover:shadow-lg transition"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <h2 className="text-2xl font-bold mb-2">{playlist.name}</h2>
                  {playlist.description && (
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      {playlist.description}
                    </p>
                  )}
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span>🎵 {playlist.tracks.length} titre{playlist.tracks.length > 1 ? 's' : ''}</span>
                    <span>📅 {new Date(playlist.createdAt).toLocaleDateString('fr-FR')}</span>
                    {playlist.mixedDuration && (
                      <span>⏱️ {formatDuration(playlist.mixedDuration)}</span>
                    )}
                  </div>
                </div>

                {/* Boutons d'action */}
                <div className="flex gap-2">
                  <a
                    href={`/edit/${playlist.id}`}
                    className="bg-orange-400 hover:bg-orange-600 text-white px-6 py-2 rounded-lg transition"
                  >
                    ✏️ Modifier
                  </a>
                  
                  {playlist.isMixing || mixingPlaylistId === playlist.id ? (
                    <button
                      disabled
                      className="bg-gray-400 text-white px-6 py-2 rounded-lg cursor-not-allowed"
                    >
                      🎛️ Mixage en cours...
                    </button>
                  ) : playlist.mixedFile ? (
                    <button
                      onClick={() => handleMix(playlist.id)}
                      className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg transition"
                    >
                      🔄 Re-mixer
                    </button>
                  ) : (
                    <button
                      onClick={() => handleMix(playlist.id)}
                      className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg transition"
                    >
                      🎛️ Créer le Mix
                    </button>
                  )}
                </div>
              </div>

              {/* Afficher l'erreur si mixage échoué */}
              {playlist.mixError && (
                <div className="bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-600 text-red-700 dark:text-red-200 px-4 py-3 rounded mb-4">
                  <p className="font-bold">Erreur lors du mixage :</p>
                  <p className="text-sm">{playlist.mixError}</p>
                </div>
              )}

              {/* Lecteur audio si le mix existe */}
              {playlist.mixedFile && !playlist.isMixing && (
                <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-6 rounded-lg mb-4">
                  <div className="flex items-center gap-4 mb-3">
                    <span className="text-white font-bold text-lg">🎧 Mix Final</span>
                    <span className="text-white/80 text-sm">
                      {formatDuration(playlist.mixedDuration)}
                    </span>
                  </div>
                  <audio
                    controls
                    className="w-full"
                    preload="metadata"
                  >
                    <source src={`/audio/${playlist.mixedFile}`} type="audio/mpeg" />
                    Votre navigateur ne supporte pas la lecture audio.
                  </audio>
                  <div className="mt-2 text-white/70 text-xs">
                    ✨ Transitions douces de 3 secondes entre chaque titre
                  </div>
                </div>
              )}

              {/* Liste des titres */}
              {playlist.tracks.length > 0 && (
                <div className="mt-4 space-y-2">
                  <h3 className="font-semibold text-sm text-gray-700 dark:text-gray-300">
                    Titres de la playlist :
                  </h3>
                  <ul className="space-y-2">
                    {playlist.tracks.map((track, index) => (
                      <li
                        key={track.id}
                        className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-3 bg-gray-50 dark:bg-gray-700 p-3 rounded"
                      >
                        <span className="font-bold text-gray-400 min-w-[24px]">
                          {index + 1}.
                        </span>
                        <span className="flex-1 font-medium">{track.title}</span>
                        <span className="text-xs bg-gray-200 dark:bg-gray-600 px-2 py-1 rounded">
                          {track.source === 'upload' && '📁 MP3'}
                          {track.source === 'youtube' && '▶️ YouTube'}
                          {track.source === 'soundcloud' && '☁️ SoundCloud'}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
