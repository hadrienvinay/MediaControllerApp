'use client';

import { useState } from 'react';

interface HtmlToPdfFormProps {
  onConversionDone: () => void;
}

export default function HtmlToPdfForm({ onConversionDone }: HtmlToPdfFormProps) {
  const [mode, setMode] = useState<'url' | 'html'>('url');
  const [url, setUrl] = useState('');
  const [htmlContent, setHtmlContent] = useState('');
  const [converting, setConverting] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (mode === 'url' && !url) return;
    if (mode === 'html' && !htmlContent) return;
    setConverting(true);
    setDownloadUrl(null);

    try {
      const formData = new FormData();
      formData.append('type', 'html-to-pdf');
      if (mode === 'url') {
        formData.append('url', url);
      } else {
        formData.append('htmlContent', htmlContent);
      }

      const res = await fetch('/api/file-convert', { method: 'POST', body: formData });
      const data = await res.json();

      if (data.success) {
        setDownloadUrl(data.downloadUrl);
        onConversionDone();
      } else {
        alert(data.error || 'Erreur de conversion');
      }
    } catch {
      alert('Erreur de conversion');
    } finally {
      setConverting(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Mode toggle */}
      <div className="flex gap-2">
        <button
          onClick={() => setMode('url')}
          className={`px-4 py-2 rounded-lg font-semibold transition ${
            mode === 'url' ? 'bg-purple-600 text-white' : 'bg-gray-600 text-gray-300'
          }`}
        >
          URL
        </button>
        <button
          onClick={() => setMode('html')}
          className={`px-4 py-2 rounded-lg font-semibold transition ${
            mode === 'html' ? 'bg-purple-600 text-white' : 'bg-gray-600 text-gray-300'
          }`}
        >
          Code HTML
        </button>
      </div>

      {mode === 'url' ? (
        <div>
          <label className="block text-sm text-gray-400 mb-1">URL de la page web</label>
          <input
            type="url"
            value={url}
            onChange={e => setUrl(e.target.value)}
            placeholder="https://exemple.com"
            className="w-full bg-gray-700 border border-gray-600 rounded p-3 text-white"
          />
        </div>
      ) : (
        <div>
          <label className="block text-sm text-gray-400 mb-1">Code HTML</label>
          <textarea
            value={htmlContent}
            onChange={e => setHtmlContent(e.target.value)}
            placeholder="<html><body><h1>Mon contenu</h1></body></html>"
            rows={10}
            className="w-full bg-gray-700 border border-gray-600 rounded p-3 text-white font-mono text-sm"
          />
        </div>
      )}

      <button
        onClick={handleSubmit}
        disabled={(mode === 'url' ? !url : !htmlContent) || converting}
        className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white py-3 rounded-lg font-semibold transition"
      >
        {converting ? 'Conversion en cours...' : 'Convertir en PDF'}
      </button>

      {downloadUrl && (
        <a
          href={downloadUrl}
          download
          className="block text-center bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-semibold transition"
        >
          Télécharger le PDF
        </a>
      )}
    </div>
  );
}
