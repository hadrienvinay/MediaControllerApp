'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { init } from 'next/dist/compiled/webpack/webpack';

type Media = { title: string; type: string; source: string; url?: string ; filename?: string, file?: File};

interface VideoFormProps {
  initialData?: {
    id?: number;
    name: string;
    description: string;
    media: Media[];
  };
  mode: 'create' | 'edit';
}

export default function VideoForm({ initialData, mode }: VideoFormProps) {
  const router = useRouter();
  const [projectName, setProjectName] = useState(initialData?.name || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [media, setMedia] = useState<Media[]>(initialData?.media || []);
  
 /*const [media, setMedia] = useState<Array<{
    title: string;
    type: 'video' | 'image';
    source: string;
    file?: File;
    url?: string;
  }>>([]); */
  
  // Paramètres de compilation
  const [transitionDuration, setTransitionDuration] = useState(1);
  const [transitionType, setTransitionType] = useState<'fade' | 'dissolve' | 'wipe' | 'slide'>('fade');
  const [imageDuration, setImageDuration] = useState(5);
  const [resolution, setResolution] = useState<'720p' | '1080p' | '4k'>('1080p');
  const [includeAudio, setIncludeAudio] = useState(true);
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  const addMedia = (type: 'video' | 'image', source: 'upload' | 'youtube' | 'url') => {
    setMedia([...media, { title: '', type, source }]);
  };

  const removeMedia = (index: number) => {
    setMedia(media.filter((_, i) => i !== index));
  };

  const updateMedia = (index: number, field: string, value: any) => {
    const newMedia = [...media];
    newMedia[index] = { ...newMedia[index], [field]: value };
    setMedia(newMedia);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Créer le projet vidéo d'abord
      const url = mode === 'create' ? '/api/videos' : `/api/videos?id=${initialData?.id}`;
      const method = mode === 'create' ? 'POST' : 'PUT';
      const projectResponse = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: projectName,
          description,
          settings: {
            transitionDuration,
            transitionType,
            imageDuration,
            resolution,
            includeAudio,
          },
        }),
      });

      if (!projectResponse.ok) {
        throw new Error('Erreur lors de la création du projet');
      }

      const project = await projectResponse.json();

      // Uploader chaque média
      for (const item of media) {
        const formData = new FormData();
        formData.append('projectId', project.id);
        formData.append('title', item.title);
        formData.append('type', item.type);
        //if file already uploaded (in edit mode), skip upload and just link it to the project
        if (!item.filename) {
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
      }

      router.push('/videos');
      router.refresh();
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors de la création du projet');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-4xl font-bold mb-8">{initialData ? `Modifier le montage vidéo "${initialData.name}"` : "Créer un nouveau projet vidéo"}</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Informations du projet */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 space-y-4">
          <h2 className="text-2xl font-semibold">Informations du projet</h2>

          <div>
            <label className="block text-sm font-medium mb-2">
              Nom du projet *
            </label>
            <input
              type="text"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              required
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
              placeholder="Mon montage vidéo"
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
              placeholder="Description de votre projet..."
              rows={3}
            />
          </div>
        </div>

        {/* Paramètres de compilation */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 space-y-4">
          <h2 className="text-2xl font-semibold">Paramètres de compilation</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Résolution
              </label>
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
              <label className="block text-sm font-medium mb-2">
                Type de transition
              </label>
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

        {/* Ajout de médias */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-semibold">Médias</h2>
            <div className="space-x-2">
              <button
                type="button"
                onClick={() => addMedia('video', 'upload')}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm transition"
              >
                🎥 Vidéo locale
              </button>
              <button
                type="button"
                onClick={() => addMedia('video', 'youtube')}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm transition"
              >
                ▶️ YouTube
              </button>
              <button
                type="button"
                onClick={() => addMedia('image', 'upload')}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm transition"
              >
                📷 Image
              </button>
            </div>
          </div>

          {media.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              Ajoutez des vidéos et images à votre projet
            </p>
          ) : (
            <div className="space-y-4">
              {media.map((item, index) => (
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
                          onChange={(e) => updateMedia(index, 'title', e.target.value)}
                          placeholder={item.type === 'image' ? 'Titre de l\'image' : 'Titre de la vidéo'}
                          required
                          className="flex-1 px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                        />
                      </div>

                      {item.filename ? (
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Fichier déja chargé
                      </p>
                    ) :
                      item.source === 'upload' ? (
                        <input
                          type="file"
                          accept={item.type === 'image' ? 'image/*' : 'video/*'}
                          onChange={(e) => updateMedia(index, 'file', e.target.files?.[0])}
                          required
                          className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                        />
                      ) : (
                        <input
                          type="url"
                          value={item.url || ''}
                          onChange={(e) => updateMedia(index, 'url', e.target.value)}
                          placeholder={`URL ${item.source === 'youtube' ? 'YouTube' : ''}`}
                          required
                          className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                        />
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => removeMedia(index)}
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
            onClick={() => router.push('/videos')}
            className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-100 dark:border-gray-600 dark:hover:bg-gray-700 transition"
          >
            Annuler
          </button>
          <button
            type="submit"
            disabled={isSubmitting || !projectName || media.length === 0}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            {isSubmitting ? (initialData ? `Modification du projet "${initialData.name}" en cours...` : 'Création du projet en cours...') : (initialData ? `Modifier le projet "${initialData.name}"` : 'Créer le projet')}
          </button>
        </div>
      </form>
    </div>
  );
}
