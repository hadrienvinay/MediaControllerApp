'use client';

import { useState } from 'react';
import FileDropZone from './FileDropZone';

interface VideoResizeFormProps {
  onConversionDone: () => void;
}

export default function VideoResizeForm({ onConversionDone }: VideoResizeFormProps) {
  const [file, setFile] = useState<File | null>(null);
  const [resolution, setResolution] = useState('1280x720');
  const [bitrate, setBitrate] = useState('2M');
  const [fps, setFps] = useState(30);
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
      formData.append('type', 'video-resize');
      formData.append('files', file);
      formData.append('resolution', resolution);
      formData.append('bitrate', bitrate);
      formData.append('fps', fps.toString());

      const res = await fetch('/api/file-convert', { method: 'POST', body: formData });
      const data = await res.json();

      if (data.success) {
        setDownloadUrl(data.downloadUrl);
        setSizeInfo({ before: file.size, after: data.conversion.fileSize });
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
          <span className="flex-1 truncate">{file.name} ({formatSize(file.size)})</span>
          <button onClick={() => setFile(null)} className="px-2 py-1 bg-red-600 rounded">✕</button>
        </div>
      )}

      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="block text-sm text-gray-400 mb-1">Résolution</label>
          <select
            value={resolution}
            onChange={e => setResolution(e.target.value)}
            className="w-full bg-gray-700 border border-gray-600 rounded p-2 text-white"
          >
            <option value="640x360">360p (640x360)</option>
            <option value="854x480">480p (854x480)</option>
            <option value="1280x720">720p (1280x720)</option>
            <option value="1920x1080">1080p (1920x1080)</option>
          </select>
        </div>
        <div>
          <label className="block text-sm text-gray-400 mb-1">Bitrate vidéo</label>
          <select
            value={bitrate}
            onChange={e => setBitrate(e.target.value)}
            className="w-full bg-gray-700 border border-gray-600 rounded p-2 text-white"
          >
            <option value="500k">500 kbps (léger)</option>
            <option value="1M">1 Mbps</option>
            <option value="2M">2 Mbps (standard)</option>
            <option value="5M">5 Mbps (haute qualité)</option>
            <option value="10M">10 Mbps (très haute qualité)</option>
          </select>
        </div>
        <div>
          <label className="block text-sm text-gray-400 mb-1">FPS</label>
          <select
            value={fps}
            onChange={e => setFps(parseInt(e.target.value))}
            className="w-full bg-gray-700 border border-gray-600 rounded p-2 text-white"
          >
            <option value={24}>24 fps</option>
            <option value={25}>25 fps</option>
            <option value={30}>30 fps</option>
            <option value={60}>60 fps</option>
          </select>
        </div>
      </div>

      <button
        onClick={handleSubmit}
        disabled={!file || converting}
        className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white py-3 rounded-lg font-semibold transition"
      >
        {converting ? 'Traitement en cours...' : 'Redimensionner / Compresser'}
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
            Télécharger la vidéo
          </a>
        </div>
      )}
    </div>
  );
}
