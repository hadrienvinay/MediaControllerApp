'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Playlist } from '@/types/playlist';

const M = { fontFamily: 'var(--font-mono)' } as const;

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
            Playlists
          </p>
          <h1 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text)', letterSpacing: '-.02em' }}>
            Mes Playlists
          </h1>
        </div>
        <Link href="/playlists/create" style={{
          ...M, fontSize: '.72rem', letterSpacing: '.04em',
          background: 'var(--accent-bg)', color: 'var(--accent)',
          border: '1px solid var(--accent-border)',
          padding: '.4rem 1rem', borderRadius: 4, textDecoration: 'none',
        }}>
          + Nouvelle playlist
        </Link>
      </div>

      {playlists.length === 0 ? (
        <div style={{ padding: '3rem', textAlign: 'center', border: '1px dashed var(--border)', borderRadius: 6 }}>
          <p style={{ ...M, fontSize: '.78rem', color: 'var(--faint)', marginBottom: '1rem' }}>Aucune playlist pour le moment</p>
          <Link href="/playlists/create" style={{ ...M, fontSize: '.72rem', color: 'var(--accent)', textDecoration: 'none' }}>
            Créez votre première playlist →
          </Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {playlists.map((playlist) => (
            <div
              key={playlist.id}
              style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 6, padding: '1.25rem 1.5rem' }}
            >
              {/* Card header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <h2 style={{ fontSize: '.92rem', fontWeight: 600, color: 'var(--text)', marginBottom: '.3rem' }}>
                    {playlist.name}
                  </h2>
                  {playlist.description && (
                    <p style={{ fontSize: '.78rem', color: 'var(--muted)', marginBottom: '.5rem' }}>
                      {playlist.description}
                    </p>
                  )}
                  <div style={{ display: 'flex', gap: '1rem', ...M, fontSize: '.7rem', color: 'var(--faint)' }}>
                    <span>{playlist.tracks.length} titre{playlist.tracks.length > 1 ? 's' : ''}</span>
                    <span>{new Date(playlist.createdAt).toLocaleDateString('fr-FR')}</span>
                    {playlist.mixedDuration && <span>{formatDuration(playlist.mixedDuration)}</span>}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '.5rem', marginLeft: '1rem', flexShrink: 0 }}>
                  <a href={`/edit/${playlist.id}`} style={{
                    ...M, fontSize: '.7rem', letterSpacing: '.03em',
                    background: 'var(--surface2)', color: 'var(--muted)',
                    border: '1px solid var(--border2)',
                    padding: '.35rem .85rem', borderRadius: 4, textDecoration: 'none',
                  }}>
                    Modifier
                  </a>

                  {playlist.isMixing || mixingPlaylistId === playlist.id ? (
                    <button disabled style={{
                      ...M, fontSize: '.7rem', letterSpacing: '.03em',
                      background: 'var(--surface2)', color: 'var(--faint)',
                      border: '1px solid var(--border)', cursor: 'not-allowed',
                      padding: '.35rem .85rem', borderRadius: 4,
                    }}>
                      Mixage…
                    </button>
                  ) : playlist.mixedFile ? (
                    <button onClick={() => handleMix(playlist.id)} style={{
                      ...M, fontSize: '.7rem', letterSpacing: '.03em',
                      background: 'var(--accent-bg)', color: 'var(--accent)',
                      border: '1px solid var(--accent-border)',
                      padding: '.35rem .85rem', borderRadius: 4, cursor: 'pointer',
                    }}>
                      Re-mixer
                    </button>
                  ) : (
                    <button onClick={() => handleMix(playlist.id)} style={{
                      ...M, fontSize: '.7rem', letterSpacing: '.03em',
                      background: 'var(--accent-bg)', color: 'var(--accent)',
                      border: '1px solid var(--accent-border)',
                      padding: '.35rem .85rem', borderRadius: 4, cursor: 'pointer',
                    }}>
                      Créer le mix
                    </button>
                  )}
                </div>
              </div>

              {/* Error */}
              {playlist.mixError && (
                <div style={{ background: 'rgba(248,81,73,.08)', border: '1px solid rgba(248,81,73,.3)', borderRadius: 4, padding: '.75rem 1rem', marginBottom: '1rem' }}>
                  <p style={{ ...M, fontSize: '.7rem', color: '#f85149', fontWeight: 600 }}>Erreur mixage</p>
                  <p style={{ fontSize: '.75rem', color: '#f85149', opacity: .8, marginTop: '.25rem' }}>{playlist.mixError}</p>
                </div>
              )}

              {/* Audio player */}
              {playlist.mixedFile && !playlist.isMixing && (
                <div style={{ background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 4, padding: '1rem', marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '.75rem', marginBottom: '.75rem' }}>
                    <span style={{ ...M, fontSize: '.65rem', letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--accent)' }}>Mix final</span>
                    <span style={{ ...M, fontSize: '.65rem', color: 'var(--faint)' }}>{formatDuration(playlist.mixedDuration)}</span>
                  </div>
                  <audio controls className="w-full" preload="metadata">
                    <source src={`/audio/${playlist.mixedFile}`} type="audio/mpeg" />
                  </audio>
                  <p style={{ ...M, fontSize: '.6rem', color: 'var(--faint)', marginTop: '.5rem' }}>Transitions douces de 3 secondes entre chaque titre</p>
                </div>
              )}

              {/* Track list */}
              {playlist.tracks.length > 0 && (
                <div>
                  <p style={{ ...M, fontSize: '.6rem', letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--faint)', marginBottom: '.6rem' }}>
                    Titres
                  </p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '.25rem' }}>
                    {playlist.tracks.map((track, index) => (
                      <div key={track.id} style={{
                        display: 'flex', alignItems: 'center', gap: '.75rem',
                        padding: '.45rem .75rem', borderRadius: 4,
                        background: 'var(--bg)', border: '1px solid var(--border)',
                      }}>
                        <span style={{ ...M, fontSize: '.65rem', color: 'var(--faint)', minWidth: 18, textAlign: 'right' }}>
                          {index + 1}
                        </span>
                        <span style={{ fontSize: '.78rem', color: 'var(--text)', flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {track.title}
                        </span>
                        <span style={{ ...M, fontSize: '.62rem', color: 'var(--faint)', background: 'var(--surface2)', border: '1px solid var(--border)', padding: '.15rem .5rem', borderRadius: 3, flexShrink: 0 }}>
                          {track.source === 'upload' ? 'MP3' : track.source === 'youtube' ? 'YT' : 'SC'}
                        </span>
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
