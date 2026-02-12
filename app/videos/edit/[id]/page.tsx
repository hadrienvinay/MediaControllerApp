'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { VideoProject, MediaItem } from '@/types/video';

export default function EditVideoProjectPage() {
  const router = useRouter();
  const params = useParams();
  const projectId = params.id as string;

  const [project, setProject] = useState<VideoProject | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Paramètres
  const [transitionDuration, setTransitionDuration] = useState(1);
  const [transitionType, setTransitionType] = useState<'fade' | 'dissolve' | 'wipe' | 'slide'>('fade');
  const [imageDuration, setImageDuration] = useState(5);
  const [resolution, setResolution] = useState<'720p' | '1080p' | '4k'>('1080p');
  const [includeAudio, setIncludeAudio] = useState(true);

  const [newMedia, setNewMedia] = useState<Array<{
    title: string;
    type: 'video' | 'image';
    source: string;
    file?: File;
    url?: string;
  }>>([]);

  useEffect(() => {
    fetchProject();
  }, [projectId]);

  const fetchProject = async () => {
    try {
      const response = await fetch('/api/video-projects');
      const projects = await response.json();
      const current = projects.find((p: VideoProject) => p.id === projectId);
      
      if (current) {
        setProject(current);
        setName(current.name);
        setDescription(current.description || '');
        setMedia(current.media);
        setTransitionDuration(current.settings.transitionDuration || 1);
        setTransitionType(current.settings.transitionType || 'fade');
        setImageDuration(current.settings.imageDuration || 5);
        setResolution(current.settings.resolution || '1080p');
        setIncludeAudio(current.settings.includeAudio ?? true);
      } else {
        alert('Projet non trouvé');
        router.push('/videos');
      }
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveMedia = (mediaId: string) => {
    if (confirm('Supprimer cet élément du projet ?')) {
      setMedia(media.filter(m => m.id !== mediaId));
    }
  };

  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    const newMedia = [...media];
    [newMedia[index - 1], newMedia[index]] = [newMedia[index], newMedia[index - 1]];
    setMedia(newMedia);
  };

  const handleMoveDown = (index: number) => {
    if (index === media.length - 1) return;
    const newMedia = [...media];
    [newMedia[index], newMedia[index + 1]] = [newMedia[index + 1], newMedia[index]];
    setMedia(newMedia);
  };

  const addMedia = (type: 'video' | 'image', source: 'upload' | 'youtube' | 'url') => {
    setNewMedia([...newMedia, { title: '', type, source }]);
  };

  const removeNewMedia = (index: number) => {
    setNewMedia(newMedia.filter((_, i) => i !== index));
  };

  const updateNewMedia = (index: number, field: string, value: any) => {
    const updated = [...newMedia];
    updated[index] = { ...updated[index], [field]: value };
    setNewMedia(updated);
  };

  const handleSave = async () => {
    if (!name.trim()) {
      alert('Le nom du projet est requis');
      return;
    }

    setSaving(true);

    try {
      // 1. Mettre à jour le projet
      const updateResponse = await fetch(`/api/video-projects/${projectId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          description,
          media,
          settings: {
            transitionDuration,
            transitionType,
            imageDuration,
            resolution,
            includeAudio,
          },
        }),
      });

      if (!updateResponse.ok) {
        throw new Error('Erreur lors de la mise à jour');
      }

      // 2. Ajouter les nouveaux médias
      for (const item of newMedia) {
        const formData = new FormData();
        formData.append('projectId', projectId);
        formData.append('title', item.title);
        formData.append('type', item.type);
        formData.append('source', item.source);

        if (item.source === 'upload' && item.file) {
          formData.append('file', item.file);
          await fetch('/api/upload-media', {
            method: 'POST',
            body: formData,
          });
        } else if ((item.source === 'youtube' || item.source === 'url') && item.url) {
          formData.append('url', item.url);
          await fetch('/api/download-media', {
            method: 'POST',
            body: formData,
          });
        }
      }

      alert('Projet mis à jour avec succès !');
      router.push('/videos');
      router.refresh();
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Supprimer définitivement ce projet ?')) {
      return;
    }

    try {
      const response = await fetch(`/api/video-projects?id=${projectId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        alert('Projet supprimé');
        router.push('/videos');
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

  if (!project) {
    return null;
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold">Modifier le projet vidéo</h1>
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
          <h2 className="text-2xl font-semibold">Informations du projet</h2>

          <div>
            <label className="block text-sm font-medium mb-2">Nom du projet *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
              rows={3}
            />
          </div>
        </div>

        {/* Paramètres de compilation */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 space-y-4">
          <h2 className="text-2xl font-semibold">Paramètres de compilation</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Résolution</label>
              <select
                value={resolution}
                onChange={(e) => setResolution(e.target.value as any)}
                className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
              >
                <option value="720p">HD 720p (1280×720)</option>
                <option value="1080p">Full HD 1080p (1920×1080)</option>
                <option value="4k">4K (3840×2160)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Type de transition</label>
              <select
                value={transitionType}
                onChange={(e) => setTransitionType(e.target.value as any)}
                className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
              >
                <option value="fade">Fondu (Fade)</option>
                <option value="dissolve">Dissolution</option>
                <option value="wipe">Balayage (Wipe)</option>
                <option value="slide">Glissement (Slide)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Durée des transitions ({transitionDuration}s)
              </label>
              <input
                type="range"
                min="0.5"
                max="3"
                step="0.5"
                value={transitionDuration}
                onChange={(e) => setTransitionDuration(parseFloat(e.target.value))}
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Durée d'affichage des images ({imageDuration}s)
              </label>
              <input
                type="range"
                min="2"
                max="10"
                step="1"
                value={imageDuration}
                onChange={(e) => setImageDuration(parseInt(e.target.value))}
                className="w-full"
              />
            </div>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="includeAudio"
              checked={includeAudio}
              onChange={(e) => setIncludeAudio(e.target.checked)}
              className="mr-2"
            />
            <label htmlFor="includeAudio" className="text-sm font-medium">
              Conserver l'audio des vidéos sources
            </label>
          </div>
        </div>

        {/* Médias existants */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 space-y-4">
          <h2 className="text-2xl font-semibold">Médias actuels ({media.length})</h2>

          {media.length === 0 ? (
            <p className="text-gray-500 text-center py-8">Aucun média dans ce projet</p>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {media.map((item, index) => (
                <div
                  key={item.id}
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
                      disabled={index === media.length - 1}
                      className="text-gray-600 hover:text-blue-600 disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      ▼
                    </button>
                  </div>

                  <div className="w-20 h-20 bg-gray-200 dark:bg-gray-600 rounded flex items-center justify-center">
                    <span className="text-3xl">
                      {item.type === 'image' ? '📷' : '🎥'}
                    </span>
                  </div>

                  <div className="flex-1">
                    <div className="font-semibold">{item.title}</div>
                    <div className="text-sm text-gray-500">
                      {item.type === 'image' ? '📷 Image' : '🎬 Vidéo'}
                      {item.duration && ` • ${Math.round(item.duration)}s`}
                    </div>
                  </div>

                  <button
                    onClick={() => handleRemoveMedia(item.id)}
                    className="text-red-600 hover:text-red-700 font-bold px-3 py-2"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Ajouter de nouveaux médias */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-semibold">Ajouter des médias</h2>
            <div className="space-x-2">
              <button
                onClick={() => addMedia('video', 'upload')}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm transition"
              >
                🎥 Vidéo locale
              </button>
              <button
                onClick={() => addMedia('video', 'youtube')}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm transition"
              >
                ▶️ YouTube
              </button>
              <button
                onClick={() => addMedia('image', 'upload')}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm transition"
              >
                📷 Image
              </button>
            </div>
          </div>

          {newMedia.length > 0 && (
            <div className="space-y-4">
              {newMedia.map((item, index) => (
                <div key={index} className="border rounded-lg p-4 dark:border-gray-600">
                  <div className="flex items-start gap-4">
                    <div className="flex-1 space-y-3">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">
                          {item.type === 'image' ? '📷' : '🎥'}
                        </span>
                        <input
                          type="text"
                          value={item.title}
                          onChange={(e) => updateNewMedia(index, 'title', e.target.value)}
                          placeholder={item.type === 'image' ? "Titre de l'image" : 'Titre de la vidéo'}
                          required
                          className="flex-1 px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                        />
                      </div>

                      {item.source === 'upload' ? (
                        <input
                          type="file"
                          accept={item.type === 'image' ? 'image/*' : 'video/*'}
                          onChange={(e) => updateNewMedia(index, 'file', e.target.files?.[0])}
                          required
                          className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                        />
                      ) : (
                        <input
                          type="url"
                          value={item.url || ''}
                          onChange={(e) => updateNewMedia(index, 'url', e.target.value)}
                          placeholder={`URL ${item.source === 'youtube' ? 'YouTube' : ''}`}
                          required
                          className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                        />
                      )}
                    </div>

                    <button
                      onClick={() => removeNewMedia(index)}
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
            onClick={() => router.push('/videos')}
            className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-100 dark:border-gray-600 dark:hover:bg-gray-700 transition"
          >
            Annuler
          </button>
          <button
            onClick={handleSave}
            disabled={saving || !name.trim()}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            {saving ? 'Sauvegarde...' : 'Sauvegarder'}
          </button>
        </div>
      </div>
    </div>
  );
}
