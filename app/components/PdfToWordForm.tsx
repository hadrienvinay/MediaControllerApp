'use client';

import { useState, useRef } from 'react';

export default function PdfToWordForm() {
  const [file, setFile] = useState<File | null>(null);
  const [format, setFormat] = useState<'docx' | 'xlsx'>('docx');
  const [result, setResult] = useState<{ url: string; originalName: string } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const handleConvert = async () => {
    if (!file) return;
    setIsLoading(true);
    setError('');
    setResult(null);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('format', format);
      const res = await fetch('/api/pdf-to-word', { method: 'POST', body: formData });
      const data = await res.json();
      if (!res.ok) { setError(data.error); return; }
      setResult(data);
    } catch {
      setError('Erreur réseau');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-5">
      <div className="rounded-lg bg-amber-900/20 border border-amber-700/30 px-4 py-3 text-amber-300 text-xs">
        Extrait le texte du PDF et le place dans un document Word ou Excel. La mise en forme (tableaux, images, colonnes) n'est pas préservée. Les PDFs scannés (images) ne sont pas supportés.
      </div>

      <div
        onClick={() => inputRef.current?.click()}
        className="border-2 border-dashed border-gray-600 hover:border-amber-500 rounded-xl p-8 text-center cursor-pointer transition-colors"
      >
        <input
          ref={inputRef}
          type="file"
          accept=".pdf,application/pdf"
          className="hidden"
          onChange={e => { if (e.target.files?.[0]) { setFile(e.target.files[0]); setResult(null); setError(''); } }}
        />
        <div className="space-y-2 text-gray-400">
          <div className="text-4xl">📄</div>
          {file ? (
            <p className="text-sm text-white font-medium">{file.name} <span className="text-gray-400">({(file.size / 1e6).toFixed(1)} Mo)</span></p>
          ) : (
            <>
              <p className="text-sm">Glissez un fichier PDF ou cliquez</p>
              <p className="text-xs">.pdf uniquement</p>
            </>
          )}
        </div>
      </div>

      <div>
        <label className="block text-xs text-gray-400 mb-2">Format de sortie</label>
        <div className="flex gap-3">
          {([
            { value: 'docx', label: '📝 Word (.docx)', desc: 'Document texte avec paragraphes' },
            { value: 'xlsx', label: '📊 Excel (.xlsx)', desc: 'Une ligne par paragraphe' },
          ] as const).map(opt => (
            <button
              key={opt.value}
              onClick={() => setFormat(opt.value)}
              className={`flex-1 p-3 rounded-xl border text-left transition ${format === opt.value ? 'bg-amber-600/20 border-amber-500 text-white' : 'bg-gray-800 border-gray-600 text-gray-300 hover:border-gray-500'}`}
            >
              <p className="font-semibold text-sm">{opt.label}</p>
              <p className="text-xs opacity-60 mt-0.5">{opt.desc}</p>
            </button>
          ))}
        </div>
      </div>

      <button
        onClick={handleConvert}
        disabled={isLoading || !file}
        className="w-full py-3 rounded-xl font-semibold bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 disabled:opacity-50 text-white transition shadow-lg"
      >
        {isLoading ? 'Conversion en cours...' : `Convertir en ${format === 'docx' ? 'Word' : 'Excel'}`}
      </button>

      {error && <div className="rounded-lg bg-red-900/30 border border-red-700/50 px-4 py-3 text-red-400 text-sm">{error}</div>}

      {result && (
        <div className="rounded-xl bg-green-900/20 border border-green-700/40 p-4 flex items-center justify-between gap-4">
          <div>
            <p className="text-sm text-green-400 font-semibold">Conversion réussie !</p>
            <p className="text-xs text-gray-400 mt-0.5">{result.originalName}</p>
          </div>
          <a
            href={result.url}
            download={result.originalName}
            className="shrink-0 px-5 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white font-semibold text-sm transition"
          >
            Télécharger
          </a>
        </div>
      )}
    </div>
  );
}
