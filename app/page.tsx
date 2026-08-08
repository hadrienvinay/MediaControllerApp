'use client';

import Link from 'next/link';
import YoutubeToMp3Form from './components/YoutubeToMp3Form';

const TOOLS = [
  { group: 'PDF',          items: ['Images→PDF', 'Fusionner', 'Découper', 'Compresser', 'Signer', 'Remplir', '→Word/Excel', 'HTML→PDF'] },
  { group: 'Image',        items: ['Convertir', 'Compresser', 'Redimensionner', 'Suppr. fond', 'GIF', 'QR Code'] },
  { group: 'Audio/Vidéo',  items: ['YouTube→MP3/FLAC', 'Découper audio', 'Transcription', 'Isoler voix', 'Vidéo→Audio', 'Redimensionner vidéo'] },
  { group: 'Dev / IA',     items: ['Convertir code (Claude AI)', 'Cryptage', 'JSON↔YAML', 'CSV↔JSON', 'JWT Decoder', 'Raccourcir URL'] },
];

const M = { fontFamily: 'var(--font-mono)' } as const;

export default function Home() {
  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '3rem 1.5rem 5rem' }}>

      {/* ── Hero ── */}
      <div style={{ marginBottom: '3rem', borderBottom: '1px solid var(--border)', paddingBottom: '2rem' }}>
        <p style={{ ...M, fontSize: '.65rem', letterSpacing: '.16em', color: 'var(--faint)', textTransform: 'uppercase', marginBottom: '.75rem' }}>
          v1.0 — Media Controller
        </p>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--text)', letterSpacing: '-.03em', lineHeight: 1.2, marginBottom: '.75rem' }}>
          Convertisseur universel<br />
          <span style={{ color: 'var(--accent)' }}>audio · vidéo · PDF · images · dev</span>
        </h1>
        <p style={{ fontSize: '.85rem', color: 'var(--muted)', maxWidth: 480, lineHeight: 1.6 }}>
          Tous vos outils de conversion en un seul endroit. Aucune limite de taille, aucune inscription.
        </p>
        <div style={{ display: 'flex', gap: '.75rem', marginTop: '1.5rem', flexWrap: 'wrap' }}>
          <Link href="/converter" style={{
            ...M, fontSize: '.72rem', letterSpacing: '.04em',
            background: 'var(--accent-bg)', color: 'var(--accent)',
            border: '1px solid var(--accent-border)',
            padding: '.45rem 1.1rem', borderRadius: 4, textDecoration: 'none',
          }}>
            → Ouvrir le convertisseur
          </Link>
          <Link href="/playlists/create" style={{
            ...M, fontSize: '.72rem', letterSpacing: '.04em',
            background: 'var(--surface)', color: 'var(--muted)',
            border: '1px solid var(--border2)',
            padding: '.45rem 1.1rem', borderRadius: 4, textDecoration: 'none',
          }}>
            + Nouvelle playlist
          </Link>
          <Link href="/videos/create" style={{
            ...M, fontSize: '.72rem', letterSpacing: '.04em',
            background: 'var(--surface)', color: 'var(--muted)',
            border: '1px solid var(--border2)',
            padding: '.45rem 1.1rem', borderRadius: 4, textDecoration: 'none',
          }}>
            + Nouveau montage
          </Link>
        </div>
      </div>

      {/* ── YouTube download (most used action) ── */}
      <div style={{ marginBottom: '3rem' }}>
        <p style={{ ...M, fontSize: '.62rem', letterSpacing: '.14em', color: 'var(--faint)', textTransform: 'uppercase', marginBottom: '1rem' }}>
          Téléchargement rapide
        </p>
        <div style={{
          background: 'var(--surface)', border: '1px solid var(--border)',
          borderRadius: 6, padding: '1.25rem 1.5rem',
        }}>
          <YoutubeToMp3Form />
        </div>
      </div>

      {/* ── Tool index ── */}
      <div>
        <p style={{ ...M, fontSize: '.62rem', letterSpacing: '.14em', color: 'var(--faint)', textTransform: 'uppercase', marginBottom: '1.25rem' }}>
          Index des outils
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1.25rem' }}>
          {TOOLS.map(({ group, items }) => (
            <div key={group}>
              <p style={{ ...M, fontSize: '.6rem', letterSpacing: '.12em', textTransform: 'uppercase', color: 'var(--accent)', marginBottom: '.6rem' }}>
                {group}
              </p>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '.3rem' }}>
                {items.map(item => (
                  <li key={item}>
                    <Link href="/converter" style={{
                      ...M, fontSize: '.75rem', color: 'var(--muted)',
                      textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '.4rem',
                    }}>
                      <span style={{ color: 'var(--border2)' }}>›</span> {item}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
