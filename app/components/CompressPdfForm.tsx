'use client';

import { useState } from 'react';

interface CompressPdfFormProps {
  onConversionDone?: () => void;
}

export default function CompressPdfForm({ onConversionDone }: CompressPdfFormProps) {
  const [file, setFile] = useState<File | null>(null);
  const [compressionPercent, setCompressionPercent] = useState(60);
  const [isProcessing, setIsProcessing] = useState(false);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [resultSize, setResultSize] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!file) return;
    setIsProcessing(true);
    setResultUrl(null);
    setResultSize(null);
    setError(null);

    const formData = new FormData();
    formData.append('type', 'compress-pdf');
    formData.append('files', file);
    formData.append('compressionPercent', compressionPercent.toString());

    try {
      const res = await fetch('/api/file-convert', { method: 'POST', body: formData });
      const data = await res.json();
      if (data.success) {
        setResultUrl(data.downloadUrl);
        setResultSize(data.conversion?.fileSize ?? null);
        onConversionDone?.();
      } else {
        setError(data.error || 'Erreur lors de la compression');
      }
    } catch {
      setError('Erreur réseau');
    } finally {
      setIsProcessing(false);
    }
  };

  const qualityLabel = compressionPercent <= 25
    ? 'Maximale — images à ~230 DPI'
    : compressionPercent <= 50
    ? 'Élevée — images à ~168 DPI'
    : compressionPercent <= 75
    ? 'Moyenne — images à ~102 DPI'
    : 'Maximum — images à ~36 DPI';

  const formatSize = (bytes: number) =>
    bytes < 1024 * 1024 ? `${(bytes / 1024).toFixed(0)} Ko` : `${(bytes / (1024 * 1024)).toFixed(1)} Mo`;

  return (
    <div className="space-y-6">
      {/* File upload */}
      <label className={`flex flex-col items-center gap-3 border-2 border-dashed rounded-xl p-8 cursor-pointer transition ${
        file ? 'border-blue-500 bg-blue-500/10' : 'border-gray-600 hover:border-blue-500 hover:bg-blue-500/5'
      }`}>
        {file ? (
          <>
            <svg className="w-8 h-8 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
              <path d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a1 1 0 110 2H4a1 1 0 110-2V4zm4 2a1 1 0 011-1h4a1 1 0 110 2H9a1 1 0 01-1-1zm0 4a1 1 0 011-1h4a1 1 0 110 2H9a1 1 0 01-1-1zm0 4a1 1 0 011-1h4a1 1 0 110 2H9a1 1 0 01-1-1z" />
            </svg>
            <div className="text-center">
              <p className="font-semibold text-white">{file.name}</p>
              <p className="text-sm text-gray-400">{formatSize(file.size)}</p>
            </div>
          </>
        ) : (
          <>
            <svg className="w-8 h-8 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
              <path d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a1 1 0 110 2H4a1 1 0 110-2V4zm4 2a1 1 0 011-1h4a1 1 0 110 2H9a1 1 0 01-1-1zm0 4a1 1 0 011-1h4a1 1 0 110 2H9a1 1 0 01-1-1zm0 4a1 1 0 011-1h4a1 1 0 110 2H9a1 1 0 01-1-1z" />
            </svg>
            <p className="text-gray-300">Sélectionner un fichier PDF</p>
          </>
        )}
        <input type="file" accept=".pdf,application/pdf" className="hidden"
          onChange={e => { setFile(e.target.files?.[0] ?? null); setResultUrl(null); setError(null); }} />
      </label>

      {/* Compression slider */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-gray-300">Taux de compression</label>
          <span className="text-2xl font-bold text-blue-400">{compressionPercent}%</span>
        </div>
        <input
          type="range" min={0} max={100} step={5}
          value={compressionPercent}
          onChange={e => setCompressionPercent(parseInt(e.target.value))}
          className="w-full accent-blue-500"
        />
        <div className="flex justify-between text-xs text-gray-500">
          <span>0% — Qualité max</span>
          <span>100% — Taille min</span>
        </div>
        <p className="text-xs text-gray-400 bg-gray-700/50 rounded-lg px-3 py-2">
          <span className="text-blue-300 font-medium">Compression {qualityLabel}</span>
        </p>
      </div>

      {error && <p className="text-red-400 text-sm">{error}</p>}

      <button
        onClick={handleSubmit}
        disabled={!file || isProcessing}
        className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 disabled:opacity-40 text-white font-semibold rounded-xl transition flex items-center justify-center gap-2"
      >
        {isProcessing ? (
          <>
            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Compression en cours…
          </>
        ) : 'Compresser le PDF'}
      </button>

      {resultUrl && (
        <div className="space-y-3 bg-gray-700/30 rounded-xl p-4 border border-green-500/30">
          <div className="flex items-center justify-between">
            <p className="text-green-400 font-semibold text-sm">PDF compressé avec succès</p>
            <div className="flex items-center gap-3 text-sm">
              {resultSize !== null && file && (
                <>
                  <span className="text-gray-400 line-through">{formatSize(file.size)}</span>
                  <span className="text-green-400 font-semibold">{formatSize(resultSize)}</span>
                  <span className="text-xs text-gray-400">
                    ({Math.round((1 - resultSize / file.size) * 100)}% réduit)
                  </span>
                </>
              )}
            </div>
          </div>
          <a
            href={resultUrl}
            download
            className="block text-center bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg font-semibold transition"
          >
            Télécharger le PDF compressé
          </a>
        </div>
      )}
    </div>
  );
}
