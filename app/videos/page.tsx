'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { VideoProject } from '@/types/video';
import DeleteVideoButton from '../components/DeleteVideoButton';

export default function VideosPage() {
  const [projects, setProjects] = useState<VideoProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [compilingProjectId, setCompilingProjectId] = useState<string | null>(null);

  const fetchProjects = async () => {
    try {
      const response = await fetch('/api/videos');
      const data = await response.json();
      setProjects(data);
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleCompile = async (projectId: string) => {
    setCompilingProjectId(projectId);

    try {
      const response = await fetch('/api/compile-video', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId }),
      });

      if (!response.ok) {
        const error = await response.json();
        alert(`Erreur: ${error.error}`);
      } else {
        await fetchProjects();
      }
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors de la compilation');
    } finally {
      setCompilingProjectId(null);
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
        <h1 className="text-4xl font-bold">Mes Projets Vidéo</h1>
        <Link
          href="/videos/create"
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition"
        >
          + Nouveau Projet
        </Link>
      </div>

      {projects.length === 0 ? (
        <div className="text-center py-20 bg-gray-100 dark:bg-gray-800 rounded-lg">
          <p className="text-xl text-gray-600 dark:text-gray-400 mb-4">
            Aucun projet vidéo pour le moment
          </p>
          <Link
            href="/videos/create"
            className="text-blue-600 hover:text-blue-700 font-semibold"
          >
            Créez votre premier projet →
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-8">
          {projects.map((project) => (
            <div
              key={project.id}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 hover:shadow-lg transition"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <h2 className="text-2xl font-bold mb-2">{project.name}</h2>
                  {project.description && (
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      {project.description}
                    </p>
                  )}
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span>🎬 {project.media.length} élément{project.media.length > 1 ? 's' : ''}</span>
                    <span>📅 {new Date(project.createdAt).toLocaleDateString('fr-FR')}</span>
                    {project.compiledDuration && (
                      <span>⏱️ {formatDuration(project.compiledDuration)}</span>
                    )}
                    <span>📐 {project.settings.resolution || '1080p'}</span>
                  </div>
                </div>

                <div className='flex space-x-2'>
                  {/* Bouton d'édition et de suppression */}
                  <div className='flex'>
                    <Link 
                      href={`/videos/${project.id}/update`}
                      className="bg-yellow-600 hover:bg-yellow-700 text-white px-6 py-2 rounded-lg transition"
                    >
                      ✏️ Modifier
                    </Link>
                  </div>
                  <div className='flex'>
                    <DeleteVideoButton videoId={project.id} /> 
                  </div>                      
                  {/* Bouton de compilation */}
                  <div>
                    {project.isCompiling || compilingProjectId === project.id ? (
                      <button
                        disabled
                        className="bg-gray-400 text-white px-6 py-2 rounded-lg cursor-not-allowed"
                      >
                        🎬 Compilation en cours...
                      </button>
                    ) : project.compiledVideo ? (
                      <button
                        onClick={() => handleCompile(project.id)}
                        className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg transition"
                      >
                        🔄 Re-compiler
                      </button>
                    ) : (
                      <button
                        onClick={() => handleCompile(project.id)}
                        className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg transition"
                      >
                        🎬 Compiler la Vidéo
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Afficher l'erreur si compilation échouée */}
              {project.compileError && (
                <div className="bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-600 text-red-700 dark:text-red-200 px-4 py-3 rounded mb-4">
                  <p className="font-bold">Erreur lors de la compilation :</p>
                  <p className="text-sm">{project.compileError}</p>
                </div>
              )}

              {/* Lecteur vidéo si la compilation existe */}
              {project.compiledVideo && !project.isCompiling && (
                <div className="bg-gradient-to-r from-blue-500 to-purple-500 p-6 rounded-lg mb-4">
                  <div className="flex items-center gap-4 mb-3">
                    <span className="text-white font-bold text-lg">🎥 Vidéo Finale</span>
                    <span className="text-white/80 text-sm">
                      {formatDuration(project.compiledDuration)}
                    </span>
                  </div>
                  <video
                    controls
                    className="w-full rounded-lg"
                    preload="metadata"
                  >
                    <source src={`/videos/${project.compiledVideo}`} type="video/mp4" />
                    Votre navigateur ne supporte pas la lecture vidéo.
                  </video>
                  <div className="mt-2 text-white/70 text-xs">
                    ✨ Transitions {project.settings.transitionType || 'fade'} de {project.settings.transitionDuration || 1}s
                    {' • '}Images affichées {project.settings.imageDuration || 5}s
                  </div>
                </div>
              )}

              {/* Liste des médias */}
              {project.media.length > 0 && (
                <div className="mt-4 space-y-2">
                  <h3 className="font-semibold text-sm text-gray-700 dark:text-gray-300">
                    Éléments du projet :
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {project.media.map((item, index) => (
                      <div
                        key={item.id}
                        className="relative bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden aspect-video"
                      >
                        {item.type === 'image' ? (
                          <img
                            src={`/images/${item.filename}`}
                            alt={item.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gray-800">
                            <span className="text-4xl">🎥</span>
                          </div>
                        )}
                        <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white p-2">
                          <p className="text-xs truncate font-medium">
                            {index + 1}. {item.title}
                          </p>
                          <p className="text-xs text-gray-300">
                            {item.type === 'image' ? '📷 Image' : '🎬 Vidéo'}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
