'use client';

import { useState, useRef } from 'react';

export default function BgRemoveForm() {
  const [preview, setPreview] = useState<string | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = (f: File) => {
    setFile(f);
    setResult(null);
    setError('');
    const url = URL.createObjectURL(f);
    setPreview(url);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  };

  const handleRemove = async () => {
    if (!file) return;
    setIsLoading(true);
    setError('');
    setResult(null);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch('/api/bg-remove', { method: 'POST', body: formData });
      const data = await res.json();
      if (!res.ok) { setError(data.error); return; }
      setResult(data.url);
    } catch {
      setError('Erreur réseau');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-5">
      <div className="rounded-lg bg-blue-900/20 border border-blue-700/30 px-4 py-3 text-blue-300 text-xs">
        Nécessite <code className="bg-blue-900/40 px-1 rounded">rembg</code> installé : <code className="bg-blue-900/40 px-1 rounded">pip install rembg</code>
      </div>

      {/* Drop zone */}
      <div
        onDrop={handleDrop}
        onDragOver={e => e.preventDefault()}
        onClick={() => inputRef.current?.click()}
        className="border-2 border-dashed border-gray-600 hover:border-teal-500 rounded-xl p-8 text-center cursor-pointer transition-colors"
      >
        <input ref={inputRef} type="file" accept="image/png,image/jpeg,image/webp" className="hidden" onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])} />
        {preview ? (
          <img src={preview} alt="Aperçu" className="max-h-48 mx-auto rounded-lg object-contain" />
        ) : (
          <div className="space-y-2 text-gray-400">
            <div className="text-4xl">🖼️</div>
            <p className="text-sm">Glissez une image ou cliquez pour sélectionner</p>
            <p className="text-xs">PNG, JPG, WebP</p>
          </div>
        )}
      </div>

      {file && (
        <button
          onClick={handleRemove}
          disabled={isLoading}
          className="w-full py-3 rounded-xl font-semibold bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 disabled:opacity-50 text-white transition shadow-lg"
        >
          {isLoading ? 'Suppression du fond en cours...' : 'Supprimer le fond'}
        </button>
      )}

      {error && <div className="rounded-lg bg-red-900/30 border border-red-700/50 px-4 py-3 text-red-400 text-sm">{error}</div>}

      {result && (
        <div className="space-y-3">
          <p className="text-sm text-green-400 font-semibold">Fond supprimé !</p>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-gray-400 mb-1">Avant</p>
              {preview && <img src={preview} alt="Avant" className="rounded-lg w-full object-contain max-h-48 bg-gray-800" />}
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-1">Après</p>
              <img src={result} alt="Après" className="rounded-lg w-full object-contain max-h-48" style={{ background: 'repeating-conic-gradient(#555 0% 25%, #333 0% 50%) 0 0 / 16px 16px' }} />
            </div>
          </div>
          <a href={result} download className="block text-center w-full py-2.5 rounded-lg bg-green-600 hover:bg-green-700 text-white font-semibold text-sm transition">
            Télécharger PNG (transparent)
          </a>
        </div>
      )}
    </div>
  );
}
