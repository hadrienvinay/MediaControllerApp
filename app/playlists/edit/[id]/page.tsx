'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Playlist, Track } from '@/types/playlist';

export default function EditPlaylistPage() {
  const router = useRouter();
  const params = useParams();
  const playlistId = params.id as string;

  const [playlist, setPlaylist] = useState<Playlist | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [tracks, setTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newTracks, setNewTracks] = useState<Array<{
    title: string;
    source: string;
    file?: File;
    url?: string;
  }>>([]);

  useEffect(() => {
    fetchPlaylist();
  }, [playlistId]);

  const fetchPlaylist = async () => {
    try {
      const response = await fetch('/api/playlists');
      const playlists = await response.json();
      const current = playlists.find((p: Playlist) => p.id === playlistId);
      
      if (current) {
        setPlaylist(current);
        setName(current.name);
        setDescription(current.description || '');
        setTracks(current.tracks);
      } else {
        alert('Playlist non trouvée');
        router.push('/');
      }
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveTrack = (trackId: string) => {
    if (confirm('Supprimer ce titre de la playlist ?')) {
      setTracks(tracks.filter(t => t.id !== trackId));
    }
  };

  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    const newTracks = [...tracks];
    [newTracks[index - 1], newTracks[index]] = [newTracks[index], newTracks[index - 1]];
    setTracks(newTracks);
  };

  const handleMoveDown = (index: number) => {
    if (index === tracks.length - 1) return;
    const newTracks = [...tracks];
    [newTracks[index], newTracks[index + 1]] = [newTracks[index + 1], newTracks[index]];
    setTracks(newTracks);
  };

  const addTrack = (type: 'upload' | 'youtube' | 'soundcloud') => {
    setNewTracks([...newTracks, { title: '', source: type }]);
  };

  const removeNewTrack = (index: number) => {
    setNewTracks(newTracks.filter((_, i) => i !== index));
  };

  const updateNewTrack = (index: number, field: string, value: any) => {
    const updated = [...newTracks];
    updated[index] = { ...updated[index], [field]: value };
    setNewTracks(updated);
  };

  const handleSave = async () => {
    if (!name.trim()) {
      alert('Le nom de la playlist est requis');
      return;
    }

    setSaving(true);

    try {
      // 1. Mettre à jour les métadonnées de base
      const updateResponse = await fetch(`/api/playlists/${playlistId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          description,
          tracks,
        }),
      });

      if (!updateResponse.ok) {
        throw new Error('Erreur lors de la mise à jour');
      }

      // 2. Ajouter les nouveaux titres
      for (const track of newTracks) {
        const formData = new FormData();
        formData.append('playlistId', playlistId);
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

      alert('Playlist mise à jour avec succès !');
      router.push('/playlists');
      router.refresh();
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Supprimer définitivement cette playlist ?')) {
      return;
    }

    try {
      const response = await fetch(`/api/playlists?id=${playlistId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        alert('Playlist supprimée');
        router.push('/');
        router.refresh();
      } else {
        throw new Error('Erreur lors de la suppression');
      }
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors de la suppression');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl">Chargement...</div>
      </div>
    );
  }

  if (!playlist) {
    return null;
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold">Modifier la playlist</h1>
        <button
          onClick={handleDelete}
          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition"
        >
          🗑️ Supprimer
        </button>
      </div>

      <div className="space-y-6">
        {/* Informations de base */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 space-y-4">
          <h2 className="text-2xl font-semibold">Informations</h2>

          <div>
            <label className="block text-sm font-medium mb-2">
              Nom de la playlist *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
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
              rows={3}
            />
          </div>
        </div>

        {/* Titres existants */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 space-y-4">
          <h2 className="text-2xl font-semibold">Titres actuels ({tracks.length})</h2>

          {tracks.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              Aucun titre dans cette playlist
            </p>
          ) : (
            <div className="space-y-3">
              {tracks.map((track, index) => (
                <div
                  key={track.id}
                  className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
                >
                  <div className="flex flex-col gap-1">
                    <button
                      onClick={() => handleMoveUp(index)}
                      disabled={index === 0}
                      className="text-gray-600 hover:text-blue-600 disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      ▲
                    </button>
                    <button
                      onClick={() => handleMoveDown(index)}
                      disabled={index === tracks.length - 1}
                      className="text-gray-600 hover:text-blue-600 disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      ▼
                    </button>
                  </div>

                  <div className="flex-1">
                    <div className="font-semibold">{track.title}</div>
                    <div className="text-sm text-gray-500">
                      {track.source === 'upload' && '📁 MP3'}
                      {track.source === 'youtube' && '▶️ YouTube'}
                      {track.source === 'soundcloud' && '☁️ SoundCloud'}
                    </div>
                  </div>

                  <button
                    onClick={() => handleRemoveTrack(track.id)}
                    className="text-red-600 hover:text-red-700 font-bold px-3 py-2"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Ajouter de nouveaux titres */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-semibold">Ajouter des titres</h2>
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

          {newTracks.length > 0 && (
            <div className="space-y-4">
              {newTracks.map((track, index) => (
                <div key={index} className="border rounded-lg p-4 dark:border-gray-600">
                  <div className="flex items-start gap-4">
                    <div className="flex-1 space-y-3">
                      <input
                        type="text"
                        value={track.title}
                        onChange={(e) => updateNewTrack(index, 'title', e.target.value)}
                        placeholder="Titre du morceau"
                        required
                        className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                      />

                      {track.source === 'upload' ? (
                        <input
                          type="file"
                          accept="audio/mp3,audio/mpeg"
                          onChange={(e) => updateNewTrack(index, 'file', e.target.files?.[0])}
                          required
                          className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                        />
                      ) : (
                        <input
                          type="url"
                          value={track.url || ''}
                          onChange={(e) => updateNewTrack(index, 'url', e.target.value)}
                          placeholder={`URL ${track.source === 'youtube' ? 'YouTube' : 'SoundCloud'}`}
                          required
                          className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                        />
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => removeNewTrack(index)}
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
            onClick={() => router.push('/')}
            className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-100 dark:border-gray-600 dark:hover:bg-gray-700 transition"
          >
            Annuler
          </button>
          <button
            onClick={handleSave}
            disabled={saving || !name.trim()}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            {saving ? 'Sauvegarde en cours...' : 'Sauvegarder'}
          </button>
        </div>
      </div>
    </div>
  );
}
