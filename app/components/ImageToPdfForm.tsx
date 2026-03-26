'use client';

import { useState } from 'react';
import FileDropZone from './FileDropZone';

interface ImageToPdfFormProps {
  onConversionDone: () => void;
}

export default function ImageToPdfForm({ onConversionDone }: ImageToPdfFormProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [converting, setConverting] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);

  const handleFilesSelected = (newFiles: File[]) => {
    setFiles(prev => [...prev, ...newFiles]);
    setDownloadUrl(null);
  };

  const moveFile = (index: number, direction: -1 | 1) => {
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= files.length) return;
    const updated = [...files];
    [updated[index], updated[newIndex]] = [updated[newIndex], updated[index]];
    setFiles(updated);
  };

  const removeFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (files.length === 0) return;
    setConverting(true);
    setDownloadUrl(null);

    try {
      const formData = new FormData();
      formData.append('type', 'images-to-pdf');
      files.forEach(file => formData.append('files', file));

      const res = await fetch('/api/file-convert', { method: 'POST', body: formData });
      const data = await res.json();

      if (data.success) {
        setDownloadUrl(data.downloadUrl);
        setFiles([]);
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
        accept="image/*"
        multiple
        onFilesSelected={handleFilesSelected}
        label="Glissez vos images ici (JPG, PNG, WebP)"
      />

      {files.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm text-gray-400">{files.length} image(s) sélectionnée(s)</p>
          {files.map((file, i) => (
            <div key={i} className="flex items-center gap-2 bg-gray-700 rounded p-2 text-sm">
              <span className="flex-1 truncate">{file.name}</span>
              <button onClick={() => moveFile(i, -1)} disabled={i === 0} className="px-2 py-1 bg-gray-600 rounded disabled:opacity-30">↑</button>
              <button onClick={() => moveFile(i, 1)} disabled={i === files.length - 1} className="px-2 py-1 bg-gray-600 rounded disabled:opacity-30">↓</button>
              <button onClick={() => removeFile(i)} className="px-2 py-1 bg-red-600 rounded">✕</button>
            </div>
          ))}
        </div>
      )}

      <button
        onClick={handleSubmit}
        disabled={files.length === 0 || converting}
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
