'use client';

import { useState } from 'react';
import FileDropZone from './FileDropZone';

interface CompressImageFormProps {
  onConversionDone: () => void;
}

export default function CompressImageForm({ onConversionDone }: CompressImageFormProps) {
  const [file, setFile] = useState<File | null>(null);
  const [quality, setQuality] = useState(60);
  const [converting, setConverting] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [sizeInfo, setSizeInfo] = useState<{ before: number; after: number } | null>(null);

  const handleFilesSelected = (files: File[]) => {
    if (files.length > 0) {
      setFile(files[0]);
      setDownloadUrl(null);
      setSizeInfo(null);
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} o`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} Ko`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`;
  };

  const handleSubmit = async () => {
    if (!file) return;
    setConverting(true);
    setDownloadUrl(null);
    setSizeInfo(null);

    try {
      const formData = new FormData();
      formData.append('type', 'compress-image');
      formData.append('files', file);
      formData.append('quality', quality.toString());

      const res = await fetch('/api/file-convert', { method: 'POST', body: formData });
      const data = await res.json();

      if (data.success) {
        setDownloadUrl(data.downloadUrl);
        setSizeInfo({ before: file.size, after: data.conversion.fileSize });
        setFile(null);
        onConversionDone();
      } else {
        alert(data.error || 'Erreur de compression');
      }
    } catch {
      alert('Erreur de compression');
    } finally {
      setConverting(false);
    }
  };

  return (
    <div className="space-y-4">
      <FileDropZone
        accept="image/*"
        multiple={false}
        maxFiles={1}
        onFilesSelected={handleFilesSelected}
        label="Glissez votre image ici (JPG, PNG, WebP)"
      />

      {file && (
        <div className="flex items-center gap-2 bg-gray-700 rounded p-2 text-sm">
          <span className="flex-1 truncate">{file.name} ({formatSize(file.size)})</span>
          <button onClick={() => setFile(null)} className="px-2 py-1 bg-red-600 rounded">✕</button>
        </div>
      )}

      <div>
        <label className="block text-sm text-gray-400 mb-1">
          Qualité : {quality}%
        </label>
        <input
          type="range"
          min={10}
          max={95}
          value={quality}
          onChange={e => setQuality(parseInt(e.target.value))}
          className="w-full"
        />
        <div className="flex justify-between text-xs text-gray-500">
          <span>Plus léger</span>
          <span>Meilleure qualité</span>
        </div>
      </div>

      <button
        onClick={handleSubmit}
        disabled={!file || converting}
        className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white py-3 rounded-lg font-semibold transition"
      >
        {converting ? 'Compression en cours...' : 'Compresser'}
      </button>

      {downloadUrl && sizeInfo && (
        <div className="space-y-2">
          <div className="bg-gray-700 rounded p-3 text-sm">
            <p>Avant : {formatSize(sizeInfo.before)}</p>
            <p>Après : {formatSize(sizeInfo.after)}</p>
            <p className="text-green-400 font-semibold">
              Réduction : {Math.round((1 - sizeInfo.after / sizeInfo.before) * 100)}%
            </p>
          </div>
          <a
            href={downloadUrl}
            download
            className="block text-center bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-semibold transition"
          >
            Télécharger l'image compressée
          </a>
        </div>
      )}
    </div>
  );
}
