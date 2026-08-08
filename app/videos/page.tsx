'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { VideoProject } from '@/types/video';

const M = { fontFamily: 'var(--font-mono)' } as const;

export default function VideosPage() {
  const [projects, setProjects] = useState<VideoProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [compilingProjectId, setCompilingProjectId] = useState<string | null>(null);

  const fetchProjects = async () => {
    try {
      const response = await fetch('/api/video-projects');
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
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <span style={{ ...M, fontSize: '.75rem', color: 'var(--faint)', letterSpacing: '.08em' }}>CHARGEMENT…</span>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 860, margin: '0 auto', padding: '2rem 1.5rem 5rem' }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.75rem', borderBottom: '1px solid var(--border)', paddingBottom: '1.25rem' }}>
        <div>
          <p style={{ ...M, fontSize: '.6rem', letterSpacing: '.14em', color: 'var(--faint)', textTransform: 'uppercase', marginBottom: '.35rem' }}>
            Vidéos
          </p>
          <h1 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text)', letterSpacing: '-.02em' }}>
            Mes Projets Vidéo
          </h1>
        </div>
        <Link href="/videos/create" style={{
          ...M, fontSize: '.72rem', letterSpacing: '.04em',
          background: 'var(--accent-bg)', color: 'var(--accent)',
          border: '1px solid var(--accent-border)',
          padding: '.4rem 1rem', borderRadius: 4, textDecoration: 'none',
        }}>
          + Nouveau projet
        </Link>
      </div>

      {projects.length === 0 ? (
        <div style={{ padding: '3rem', textAlign: 'center', border: '1px dashed var(--border)', borderRadius: 6 }}>
          <p style={{ ...M, fontSize: '.78rem', color: 'var(--faint)', marginBottom: '1rem' }}>Aucun projet vidéo pour le moment</p>
          <Link href="/videos/create" style={{ ...M, fontSize: '.72rem', color: 'var(--accent)', textDecoration: 'none' }}>
            Créez votre premier projet →
          </Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {projects.map((project) => (
            <div
              key={project.id}
              style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 6, padding: '1.25rem 1.5rem' }}
            >
              {/* Card header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <h2 style={{ fontSize: '.92rem', fontWeight: 600, color: 'var(--text)', marginBottom: '.3rem' }}>
                    {project.name}
                  </h2>
                  {project.description && (
                    <p style={{ fontSize: '.78rem', color: 'var(--muted)', marginBottom: '.5rem' }}>
                      {project.description}
                    </p>
                  )}
                  <div style={{ display: 'flex', gap: '1rem', ...M, fontSize: '.7rem', color: 'var(--faint)' }}>
                    <span>{project.media.length} élément{project.media.length > 1 ? 's' : ''}</span>
                    <span>{new Date(project.createdAt).toLocaleDateString('fr-FR')}</span>
                    {project.compiledDuration && <span>{formatDuration(project.compiledDuration)}</span>}
                    <span>{project.settings.resolution || '1080p'}</span>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '.5rem', marginLeft: '1rem', flexShrink: 0 }}>
                  <a href={`/videos/edit/${project.id}`} style={{
                    ...M, fontSize: '.7rem', letterSpacing: '.03em',
                    background: 'var(--surface2)', color: 'var(--muted)',
                    border: '1px solid var(--border2)',
                    padding: '.35rem .85rem', borderRadius: 4, textDecoration: 'none',
                  }}>
                    Modifier
                  </a>

                  {project.isCompiling || compilingProjectId === project.id ? (
                    <button disabled style={{
                      ...M, fontSize: '.7rem', letterSpacing: '.03em',
                      background: 'var(--surface2)', color: 'var(--faint)',
                      border: '1px solid var(--border)', cursor: 'not-allowed',
                      padding: '.35rem .85rem', borderRadius: 4,
                    }}>
                      Compilation…
                    </button>
                  ) : project.compiledVideo ? (
                    <button onClick={() => handleCompile(project.id)} style={{
                      ...M, fontSize: '.7rem', letterSpacing: '.03em',
                      background: 'var(--accent-bg)', color: 'var(--accent)',
                      border: '1px solid var(--accent-border)',
                      padding: '.35rem .85rem', borderRadius: 4, cursor: 'pointer',
                    }}>
                      Re-compiler
                    </button>
                  ) : (
                    <button onClick={() => handleCompile(project.id)} style={{
                      ...M, fontSize: '.7rem', letterSpacing: '.03em',
                      background: 'var(--accent-bg)', color: 'var(--accent)',
                      border: '1px solid var(--accent-border)',
                      padding: '.35rem .85rem', borderRadius: 4, cursor: 'pointer',
                    }}>
                      Compiler
                    </button>
                  )}
                </div>
              </div>

              {/* Error */}
              {project.compileError && (
                <div style={{ background: 'rgba(248,81,73,.08)', border: '1px solid rgba(248,81,73,.3)', borderRadius: 4, padding: '.75rem 1rem', marginBottom: '1rem' }}>
                  <p style={{ ...M, fontSize: '.7rem', color: '#f85149', fontWeight: 600 }}>Erreur compilation</p>
                  <p style={{ fontSize: '.75rem', color: '#f85149', opacity: .8, marginTop: '.25rem' }}>{project.compileError}</p>
                </div>
              )}

              {/* Video player */}
              {project.compiledVideo && !project.isCompiling && (
                <div style={{ background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 4, padding: '1rem', marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '.75rem', marginBottom: '.75rem' }}>
                    <span style={{ ...M, fontSize: '.65rem', letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--accent)' }}>Vidéo finale</span>
                    <span style={{ ...M, fontSize: '.65rem', color: 'var(--faint)' }}>{formatDuration(project.compiledDuration)}</span>
                  </div>
                  <video controls className="w-full" style={{ borderRadius: 4 }} preload="metadata">
                    <source src={`/videos/${project.compiledVideo}`} type="video/mp4" />
                  </video>
                  <p style={{ ...M, fontSize: '.6rem', color: 'var(--faint)', marginTop: '.5rem' }}>
                    Transitions {project.settings.transitionType || 'fade'} {project.settings.transitionDuration || 1}s
                    {' · '}Images {project.settings.imageDuration || 5}s
                  </p>
                </div>
              )}

              {/* Media grid */}
              {project.media.length > 0 && (
                <div>
                  <p style={{ ...M, fontSize: '.6rem', letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--faint)', marginBottom: '.6rem' }}>
                    Éléments
                  </p>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: '.5rem' }}>
                    {project.media.map((item, index) => (
                      <div
                        key={item.id}
                        style={{ position: 'relative', borderRadius: 4, overflow: 'hidden', aspectRatio: '16/9', background: 'var(--bg)', border: '1px solid var(--border)' }}
                      >
                        {item.type === 'image' ? (
                          <img src={`/images/${item.filename}`} alt={item.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                          <img src={'/thumbnails/' + item.thumbnail} alt={item.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        )}
                        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'rgba(0,0,0,.7)', padding: '.3rem .4rem' }}>
                          <p style={{ ...M, fontSize: '.6rem', color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {index + 1}. {item.title}
                          </p>
                          <p style={{ ...M, fontSize: '.58rem', color: 'var(--faint)' }}>
                            {item.type === 'image' ? 'IMG' : 'VID'}
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
