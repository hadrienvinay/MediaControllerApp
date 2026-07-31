'use client';

import { useState, useRef } from 'react';

const LANGS = [
  { value: 'auto', label: 'Détection auto' },
  { value: 'fr', label: 'Français' },
  { value: 'en', label: 'English' },
  { value: 'es', label: 'Español' },
  { value: 'de', label: 'Deutsch' },
  { value: 'it', label: 'Italiano' },
  { value: 'pt', label: 'Português' },
  { value: 'ja', label: '日本語' },
  { value: 'zh', label: '中文' },
  { value: 'ar', label: 'العربية' },
  { value: 'ru', label: 'Русский' },
];

export default function TranscribeForm() {
  const [file, setFile] = useState<File | null>(null);
  const [lang, setLang] = useState('auto');
  const [format, setFormat] = useState<'txt' | 'srt' | 'vtt'>('txt');
  const [result, setResult] = useState<{ content: string; filename: string } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const handleTranscribe = async () => {
    if (!file) return;
    setIsLoading(true);
    setError('');
    setResult(null);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('lang', lang);
      formData.append('format', format);
      const res = await fetch('/api/transcribe', { method: 'POST', body: formData });
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

  const wordCount = result?.content.trim().split(/\s+/).filter(Boolean).length ?? 0;

  return (
    <div className="space-y-5">
      <div className="rounded-lg bg-purple-900/20 border border-purple-700/30 px-4 py-3 text-purple-300 text-xs">
        Nécessite <code className="bg-purple-900/40 px-1 rounded">whisper</code> installé : <code className="bg-purple-900/40 px-1 rounded">pip install openai-whisper</code>
      </div>

      <div
        onClick={() => inputRef.current?.click()}
        className="border-2 border-dashed border-gray-600 hover:border-purple-500 rounded-xl p-8 text-center cursor-pointer transition-colors"
      >
        <input
          ref={inputRef}
          type="file"
          accept="audio/*,video/*,.mp3,.mp4,.wav,.ogg,.flac,.m4a,.webm"
          className="hidden"
          onChange={e => { if (e.target.files?.[0]) { setFile(e.target.files[0]); setResult(null); setError(''); } }}
        />
        <div className="space-y-2 text-gray-400">
          <div className="text-4xl">🎙️</div>
          {file ? (
            <p className="text-sm text-white font-medium">{file.name} <span className="text-gray-400">({(file.size / 1e6).toFixed(1)} Mo)</span></p>
          ) : (
            <>
              <p className="text-sm">Glissez un fichier audio/vidéo</p>
              <p className="text-xs">MP3, MP4, WAV, OGG, FLAC, M4A, WebM</p>
            </>
          )}
        </div>
      </div>

      <div className="flex gap-3 flex-wrap">
        <div className="flex-1 min-w-32">
          <label className="block text-xs text-gray-400 mb-1">Langue</label>
          <select value={lang} onChange={e => setLang(e.target.value)} className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-purple-500">
            {LANGS.map(l => <option key={l.value} value={l.value}>{l.label}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs text-gray-400 mb-1">Format de sortie</label>
          <div className="flex rounded-lg overflow-hidden border border-gray-600">
            {(['txt', 'srt', 'vtt'] as const).map(f => (
              <button key={f} onClick={() => setFormat(f)} className={`px-4 py-2 text-sm font-mono font-semibold transition ${format === f ? 'bg-purple-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}>
                .{f}
              </button>
            ))}
          </div>
        </div>
      </div>

      <button
        onClick={handleTranscribe}
        disabled={isLoading || !file}
        className="w-full py-3 rounded-xl font-semibold bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 text-white transition shadow-lg"
      >
        {isLoading ? 'Transcription en cours (peut prendre plusieurs minutes)...' : 'Transcrire'}
      </button>

      {error && <div className="rounded-lg bg-red-900/30 border border-red-700/50 px-4 py-3 text-red-400 text-sm">{error}</div>}

      {result && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm text-green-400 font-semibold">Transcription terminée — {wordCount} mots</p>
            <button onClick={download} className="px-4 py-1.5 rounded-lg bg-green-600 hover:bg-green-700 text-white text-sm font-semibold transition">
              Télécharger .{format}
            </button>
          </div>
          <pre className="bg-gray-900 border border-gray-700 rounded-lg p-4 text-sm text-gray-300 font-mono overflow-auto max-h-80 whitespace-pre-wrap">
            {result.content.slice(0, 4000)}{result.content.length > 4000 ? '\n...' : ''}
          </pre>
        </div>
      )}
    </div>
  );
}
