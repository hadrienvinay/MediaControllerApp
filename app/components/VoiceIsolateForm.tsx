'use client';

import { useState } from 'react';

interface VoiceIsolateFormProps {
  onConversionDone?: () => void;
}

export default function VoiceIsolateForm({ onConversionDone }: VoiceIsolateFormProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!file) return;
    setIsProcessing(true);
    setResultUrl(null);
    setError(null);
    setProgress('Analyse du fichier en cours… (peut prendre 1–3 minutes)');

    const formData = new FormData();
    formData.append('type', 'voice-isolate');
    formData.append('files', file);

    try {
      const res = await fetch('/api/file-convert', { method: 'POST', body: formData });
      const data = await res.json();
      if (data.success) {
        setResultUrl(data.downloadUrl);
        onConversionDone?.();
      } else {
        setError(data.error || 'Erreur lors de l\'isolation');
      }
    } catch {
      setError('Erreur réseau');
    } finally {
      setIsProcessing(false);
      setProgress(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Info banner */}
      <div className="flex gap-3 bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
        <svg className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
        </svg>
        <div className="text-sm text-blue-200 space-y-1">
          <p className="font-semibold">Isolation vocale par IA (Demucs)</p>
          <p className="text-blue-300">Sépare la voix humaine de la musique et des bruits de fond grâce au modèle neuronal Demucs de Meta. Le traitement peut durer 1–3 minutes selon la longueur du fichier.</p>
        </div>
      </div>

      {/* File upload */}
      <label className={`flex flex-col items-center gap-4 border-2 border-dashed rounded-xl p-8 cursor-pointer transition ${
        file ? 'border-purple-500 bg-purple-500/10' : 'border-gray-600 hover:border-purple-500 hover:bg-purple-500/5'
      }`}>
        {file ? (
          <>
            <svg className="w-10 h-10 text-purple-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <div className="text-center">
              <p className="font-semibold text-white">{file.name}</p>
              <p className="text-sm text-gray-400">{(file.size / (1024 * 1024)).toFixed(1)} Mo</p>
            </div>
          </>
        ) : (
          <>
            <svg className="w-10 h-10 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9 3a1 1 0 011 1v5h2V4a1 1 0 112 0v5a3 3 0 11-6 0V4a1 1 0 011-1zM8 16a4 4 0 108 0H8z" />
            </svg>
            <div className="text-center">
              <p className="text-gray-300 font-medium">Glissez un fichier audio ou vidéo</p>
              <p className="text-sm text-gray-500 mt-1">MP3, WAV, AAC, FLAC, MP4, MKV, MOV…</p>
            </div>
          </>
        )}
        <input
          type="file"
          accept="audio/*,video/*"
          className="hidden"
          onChange={e => {
            setFile(e.target.files?.[0] ?? null);
            setResultUrl(null);
            setError(null);
          }}
        />
      </label>

      {/* Processing state */}
      {isProcessing && progress && (
        <div className="flex items-center gap-3 bg-gray-700/50 rounded-xl p-4">
          <svg className="w-5 h-5 text-purple-400 animate-spin shrink-0" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <p className="text-sm text-gray-300">{progress}</p>
        </div>
      )}

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 space-y-2">
          <p className="text-red-400 text-sm font-semibold">Erreur</p>
          <p className="text-red-300 text-sm">{error}</p>
          {error.includes('Demucs') && (
            <code className="block mt-2 bg-gray-900 text-green-400 text-xs rounded p-2">pip install demucs</code>
          )}
        </div>
      )}

      <button
        onClick={handleSubmit}
        disabled={!file || isProcessing}
        className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 disabled:opacity-40 text-white font-semibold rounded-xl transition flex items-center justify-center gap-2"
      >
        {isProcessing ? (
          <>
            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Isolation en cours…
          </>
        ) : (
          <>
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9 3a1 1 0 011 1v5h2V4a1 1 0 112 0v5a3 3 0 11-6 0V4a1 1 0 011-1zM8 16a4 4 0 108 0H8z" />
            </svg>
            Isoler la voix
          </>
        )}
      </button>

      {resultUrl && (
        <div className="space-y-3 bg-gray-700/30 rounded-xl p-4 border border-green-500/30">
          <p className="text-green-400 font-semibold text-sm flex items-center gap-2">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            Voix isolée avec succès
          </p>
          <audio controls src={resultUrl} className="w-full" />
          <a
            href={resultUrl}
            download
            className="block text-center bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg font-semibold transition"
          >
            Télécharger la voix isolée (MP3)
          </a>
        </div>
      )}
    </div>
  );
}
