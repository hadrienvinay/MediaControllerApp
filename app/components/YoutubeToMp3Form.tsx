import { useState } from 'react';
import { useRouter } from 'next/navigation';

const M: React.CSSProperties = { fontFamily: 'var(--font-mono)' };

const FORMATS: { value: 'mp3' | 'flac' | 'mp4'; label: string; sub: string; ytOnly?: boolean }[] = [
  { value: 'mp3',  label: 'MP3',  sub: 'audio' },
  { value: 'flac', label: 'FLAC', sub: 'haute qualité' },
  { value: 'mp4',  label: 'MP4',  sub: 'vidéo', ytOnly: true },
];

export default function YoutubeToMp3Form() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [format, setFormat] = useState<'mp3' | 'flac' | 'mp4'>('mp3');
  const router = useRouter();

  const isYoutubeUrl = /youtube\.com|youtu\.be/i.test(youtubeUrl);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/convert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: youtubeUrl, format }),
      });
      if (!response.ok) {
        const error = await response.json();
        alert(`Error: ${error.error}`);
      } else {
        const data = await response.json();
        router.push(`${data.responseUrl}&metadata=${encodeURIComponent(JSON.stringify(data.metadata))}`);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('An error occurred during conversion');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

      {/* URL input */}
      <div style={{ position: 'relative' }}>
        <div style={{
          position: 'absolute', left: '.75rem', top: '50%', transform: 'translateY(-50%)',
          pointerEvents: 'none',
        }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--faint)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"/>
            <path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/>
          </svg>
        </div>
        <input
          type="url"
          value={youtubeUrl}
          onChange={(e) => setYoutubeUrl(e.target.value)}
          placeholder="https://youtube.com/watch?v=… ou soundcloud.com/…"
          required
          style={{
            ...M,
            width: '100%',
            background: 'var(--bg)',
            border: '1px solid var(--border2)',
            borderRadius: 4,
            padding: '.55rem .75rem .55rem 2.25rem',
            fontSize: '.8rem',
            color: 'var(--text)',
            outline: 'none',
            transition: 'border-color .15s',
          }}
          onFocus={e => (e.target.style.borderColor = 'var(--accent)')}
          onBlur={e => (e.target.style.borderColor = 'var(--border2)')}
        />
      </div>

      {/* Format selector + submit */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem', flexWrap: 'wrap' }}>

        {/* Format pills */}
        <div style={{ display: 'flex', gap: '.35rem', flex: 1, flexWrap: 'wrap' }}>
          {FORMATS.map(({ value, label, sub, ytOnly }) => {
            const disabled = ytOnly && !isYoutubeUrl;
            const active = format === value;
            return (
              <button
                key={value}
                type="button"
                disabled={disabled}
                onClick={() => !disabled && setFormat(value)}
                style={{
                  ...M,
                  display: 'flex', flexDirection: 'column', alignItems: 'flex-start',
                  padding: '.4rem .75rem',
                  borderRadius: 4,
                  border: active ? '1px solid var(--accent-border)' : '1px solid var(--border)',
                  background: active ? 'var(--accent-bg)' : 'var(--surface2)',
                  cursor: disabled ? 'not-allowed' : 'pointer',
                  opacity: disabled ? .35 : 1,
                  transition: 'border-color .12s, background .12s',
                  gap: '.1rem',
                }}
              >
                <span style={{ fontSize: '.75rem', fontWeight: 600, color: active ? 'var(--accent)' : 'var(--muted)', letterSpacing: '.04em' }}>
                  {label}
                </span>
                <span style={{ fontSize: '.6rem', color: active ? 'var(--accent)' : 'var(--faint)', letterSpacing: '.02em' }}>
                  {disabled ? 'YouTube only' : sub}
                </span>
              </button>
            );
          })}
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={isSubmitting}
          style={{
            ...M,
            fontSize: '.75rem', fontWeight: 600, letterSpacing: '.04em',
            background: isSubmitting ? 'var(--surface2)' : 'var(--accent-bg)',
            color: isSubmitting ? 'var(--faint)' : 'var(--accent)',
            border: isSubmitting ? '1px solid var(--border)' : '1px solid var(--accent-border)',
            padding: '.55rem 1.25rem',
            borderRadius: 4,
            cursor: isSubmitting ? 'not-allowed' : 'pointer',
            whiteSpace: 'nowrap',
            transition: 'background .12s',
            flexShrink: 0,
          }}
        >
          {isSubmitting ? 'Conversion…' : `↓ ${format.toUpperCase()}`}
        </button>
      </div>

    </form>
  );
}
