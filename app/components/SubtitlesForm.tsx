'use client';

import { useState } from 'react';

const LANGS = [
  { value: 'fr', label: 'Français' },
  { value: 'en', label: 'Anglais' },
  { value: 'es', label: 'Espagnol' },
  { value: 'de', label: 'Allemand' },
  { value: 'it', label: 'Italien' },
  { value: 'pt', label: 'Portugais' },
  { value: 'ja', label: 'Japonais' },
  { value: 'zh', label: 'Chinois' },
  { value: 'ar', label: 'Arabe' },
  { value: 'ru', label: 'Russe' },
];

export default function SubtitlesForm() {
  const [url, setUrl] = useState('');
  const [lang, setLang] = useState('fr');
  const [format, setFormat] = useState<'vtt' | 'srt'>('srt');
  const [result, setResult] = useState<{ content: string; filename: string; lang: string } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleExtract = async () => {
    if (!url.trim()) return;
    setIsLoading(true);
    setError('');
    setResult(null);
    try {
      const res = await fetch('/api/subtitles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url, lang, format }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error); return; }
      setResult(data);
    } catch {
      setError('Erreur réseau');
    } finally {
      setIsLoading(false);
    }
  };

  const download = () => {
    if (!result) return;
    const blob = new Blob([result.content], { type: 'text/plain' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = result.filename;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-xs text-gray-400 mb-1">URL YouTube</label>
        <input
          type="url"
          value={url}
          onChange={e => setUrl(e.target.value)}
          placeholder="https://www.youtube.com/watch?v=..."
          className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2.5 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-orange-500"
        />
      </div>

      <div className="flex gap-3 flex-wrap">
        <div className="flex-1 min-w-32">
          <label className="block text-xs text-gray-400 mb-1">Langue</label>
          <select
            value={lang}
            onChange={e => setLang(e.target.value)}
            className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-orange-500"
          >
            {LANGS.map(l => <option key={l.value} value={l.value}>{l.label}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs text-gray-400 mb-1">Format</label>
          <div className="flex rounded-lg overflow-hidden border border-gray-600">
            {(['srt', 'vtt'] as const).map(f => (
              <button key={f} onClick={() => setFormat(f)} className={`px-4 py-2 text-sm font-mono font-semibold transition ${format === f ? 'bg-orange-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}>
                .{f}
              </button>
            ))}
          </div>
        </div>
      </div>

      <button
        onClick={handleExtract}
        disabled={isLoading || !url.trim()}
        className="w-full py-3 rounded-xl font-semibold bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 disabled:opacity-50 text-white transition shadow-lg"
      >
        {isLoading ? 'Extraction en cours...' : 'Extraire les sous-titres'}
      </button>

      {error && <div className="rounded-lg bg-red-900/30 border border-red-700/50 px-4 py-3 text-red-400 text-sm">{error}</div>}

      {result && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm text-green-400 font-semibold">Sous-titres extraits ({result.lang})</p>
            <button onClick={download} className="px-4 py-1.5 rounded-lg bg-green-600 hover:bg-green-700 text-white text-sm font-semibold transition">
              Télécharger .{format}
            </button>
          </div>
          <pre className="bg-gray-900 border border-gray-700 rounded-lg p-4 text-sm text-gray-300 font-mono overflow-auto max-h-80 whitespace-pre-wrap">
            {result.content.slice(0, 3000)}{result.content.length > 3000 ? '\n...' : ''}
          </pre>
        </div>
      )}
    </div>
  );
}
