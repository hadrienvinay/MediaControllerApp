'use client';

import { useState } from 'react';
import FileDropZone from './FileDropZone';

interface VideoToGifFormProps {
  onConversionDone: () => void;
}

export default function VideoToGifForm({ onConversionDone }: VideoToGifFormProps) {
  const [file, setFile] = useState<File | null>(null);
  const [fps, setFps] = useState(10);
  const [width, setWidth] = useState(480);
  const [startTime, setStartTime] = useState('');
  const [duration, setDuration] = useState('');
  const [converting, setConverting] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);

  const handleFilesSelected = (files: File[]) => {
    if (files.length > 0) {
      setFile(files[0]);
      setDownloadUrl(null);
    }
  };

  const handleSubmit = async () => {
    if (!file) return;
    setConverting(true);
    setDownloadUrl(null);

    try {
      const formData = new FormData();
      formData.append('type', 'video-to-gif');
      formData.append('files', file);
      formData.append('fps', fps.toString());
      formData.append('width', width.toString());
      if (startTime) formData.append('startTime', startTime);
      if (duration) formData.append('duration', duration);

      const res = await fetch('/api/file-convert', { method: 'POST', body: formData });
      const data = await res.json();

      if (data.success) {
        setDownloadUrl(data.downloadUrl);
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
        accept="video/*"
        multiple={false}
        maxFiles={1}
        onFilesSelected={handleFilesSelected}
        label="Glissez votre vidéo ici (MP4, MOV, AVI...)"
      />

      {file && (
        <div className="flex items-center gap-2 bg-gray-700 rounded p-2 text-sm">
          <span className="flex-1 truncate">{file.name}</span>
          <button onClick={() => setFile(null)} className="px-2 py-1 bg-red-600 rounded">✕</button>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm text-gray-400 mb-1">FPS</label>
          <select
            value={fps}
            onChange={e => setFps(parseInt(e.target.value))}
            className="w-full bg-gray-700 border border-gray-600 rounded p-2 text-white"
          >
            <option value={5}>5 (léger)</option>
            <option value={10}>10 (standard)</option>
            <option value={15}>15 (fluide)</option>
            <option value={20}>20 (très fluide)</option>
          </select>
        </div>
        <div>
          <label className="block text-sm text-gray-400 mb-1">Largeur (px)</label>
          <select
            value={width}
            onChange={e => setWidth(parseInt(e.target.value))}
            className="w-full bg-gray-700 border border-gray-600 rounded p-2 text-white"
          >
            <option value={320}>320px</option>
            <option value={480}>480px</option>
            <option value={640}>640px</option>
            <option value={800}>800px</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm text-gray-400 mb-1">Début (secondes, optionnel)</label>
          <input
            type="number"
            min={0}
            step={0.5}
            value={startTime}
            onChange={e => setStartTime(e.target.value)}
            placeholder="0"
            className="w-full bg-gray-700 border border-gray-600 rounded p-2 text-white"
          />
        </div>
        <div>
          <label className="block text-sm text-gray-400 mb-1">Durée (secondes, optionnel)</label>
          <input
            type="number"
            min={0.5}
            step={0.5}
            value={duration}
            onChange={e => setDuration(e.target.value)}
            placeholder="toute la vidéo"
            className="w-full bg-gray-700 border border-gray-600 rounded p-2 text-white"
          />
        </div>
      </div>

      <button
        onClick={handleSubmit}
        disabled={!file || converting}
        className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white py-3 rounded-lg font-semibold transition"
      >
        {converting ? 'Conversion en cours...' : 'Convertir en GIF'}
      </button>

      {downloadUrl && (
        <div className="space-y-2">
          <img src={downloadUrl} alt="GIF généré" className="max-w-full rounded" />
          <a
            href={downloadUrl}
            download
            className="block text-center bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-semibold transition"
          >
            Télécharger le GIF
          </a>
        </div>
      )}
    </div>
  );
}
