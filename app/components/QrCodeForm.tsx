'use client';

import { useState } from 'react';

interface QrCodeFormProps {
  onConversionDone: () => void;
}

export default function QrCodeForm({ onConversionDone }: QrCodeFormProps) {
  const [text, setText] = useState('');
  const [qrFormat, setQrFormat] = useState<'png' | 'svg'>('png');
  const [generating, setGenerating] = useState(false);
  const [qrUrl, setQrUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setQrUrl(null);

    if (!text.trim()) {
      setError('Veuillez entrer du texte ou une URL');
      return;
    }

    setGenerating(true);
    try {
      const formData = new FormData();
      formData.append('type', 'qr-code');
      formData.append('text', text);
      formData.append('qrFormat', qrFormat);

      const res = await fetch('/api/file-convert', { method: 'POST', body: formData });
      const data = await res.json();

      if (data.success) {
        setQrUrl(data.downloadUrl);
        onConversionDone();
      } else {
        setError(data.error || 'Erreur de génération');
      }
    } catch {
      setError('Erreur lors de la génération du QR code');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm text-gray-400 mb-1">Texte ou URL</label>
          <textarea
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder="Entrez une URL, un texte ou un contact..."
            className="w-full bg-gray-700 border border-gray-600 rounded p-3 text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none"
            rows={3}
          />
        </div>

        <div>
          <label className="block text-sm text-gray-400 mb-1">Format</label>
          <select
            value={qrFormat}
            onChange={e => setQrFormat(e.target.value as 'png' | 'svg')}
            className="w-full bg-gray-700 border border-gray-600 rounded p-2 text-white"
          >
            <option value="png">PNG (image raster)</option>
            <option value="svg">SVG (image vectorielle)</option>
          </select>
        </div>

        {error && (
          <div className="bg-red-600/20 border border-red-600 rounded p-3 text-red-300 text-sm">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={generating || !text.trim()}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white py-3 rounded-lg font-semibold transition"
        >
          {generating ? 'Génération en cours...' : '📱 Générer le QR Code'}
        </button>
      </form>

      {qrUrl && (
        <div className="space-y-3 bg-gray-700/50 rounded-lg p-4">
          <p className="text-sm text-green-400 font-semibold">QR Code généré !</p>
          <div className="bg-white p-4 rounded-lg flex items-center justify-center">
            <img src={qrUrl} alt="QR Code" className="w-64 h-64" />
          </div>
          <p className="text-xs text-gray-400 text-center truncate">
            {text.substring(0, 60)}{text.length > 60 ? '...' : ''}
          </p>
          <a
            href={qrUrl}
            download
            className="block text-center bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-semibold transition"
          >
            Télécharger le QR Code ({qrFormat.toUpperCase()})
          </a>
        </div>
      )}
    </div>
  );
}
