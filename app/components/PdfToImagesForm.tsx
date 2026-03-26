'use client';

import { useState } from 'react';
import FileDropZone from './FileDropZone';

interface PdfToImagesFormProps {
  onConversionDone: () => void;
}

export default function PdfToImagesForm({ onConversionDone }: PdfToImagesFormProps) {
  const [file, setFile] = useState<File | null>(null);
  const [converting, setConverting] = useState(false);
  const [downloadUrls, setDownloadUrls] = useState<string[]>([]);

  const handleFilesSelected = (files: File[]) => {
    if (files.length > 0) {
      setFile(files[0]);
      setDownloadUrls([]);
    }
  };

  const handleSubmit = async () => {
    if (!file) return;
    setConverting(true);
    setDownloadUrls([]);

    try {
      const formData = new FormData();
      formData.append('type', 'pdf-to-images');
      formData.append('files', file);

      const res = await fetch('/api/file-convert', { method: 'POST', body: formData });
      const data = await res.json();

      if (data.success) {
        setDownloadUrls(data.downloadUrls);
        setFile(null);
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
      <FileDropZone
        accept="application/pdf"
        multiple={false}
        maxFiles={1}
        onFilesSelected={handleFilesSelected}
        label="Glissez votre fichier PDF ici"
      />

      {file && (
        <div className="flex items-center gap-2 bg-gray-700 rounded p-2 text-sm">
          <span className="flex-1 truncate">{file.name}</span>
          <button onClick={() => setFile(null)} className="px-2 py-1 bg-red-600 rounded">✕</button>
        </div>
      )}

      <button
        onClick={handleSubmit}
        disabled={!file || converting}
        className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white py-3 rounded-lg font-semibold transition"
      >
        {converting ? 'Conversion en cours...' : 'Extraire les images'}
      </button>

      {downloadUrls.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm text-gray-400">{downloadUrls.length} image(s) extraite(s)</p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {downloadUrls.map((url, i) => (
              <div key={i} className="bg-gray-700 rounded p-2">
                <img src={url} alt={`Page ${i + 1}`} className="w-full rounded mb-2" />
                <a
                  href={url}
                  download={`page-${i + 1}.png`}
                  className="block text-center text-sm bg-green-600 hover:bg-green-700 text-white py-1 rounded transition"
                >
                  Page {i + 1}
                </a>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
