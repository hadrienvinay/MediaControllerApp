'use client';

import { useState } from 'react';
import FileDropZone from './FileDropZone';

interface VideoToAudioFormProps {
  onConversionDone: () => void;
}

export default function VideoToAudioForm({ onConversionDone }: VideoToAudioFormProps) {
  const [file, setFile] = useState<File | null>(null);
  const [audioFormat, setAudioFormat] = useState('mp3');
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
      formData.append('type', 'video-to-audio');
      formData.append('files', file);
      formData.append('audioFormat', audioFormat);

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

      <div>
        <label className="block text-sm text-gray-400 mb-1">Format audio</label>
        <select
          value={audioFormat}
          onChange={e => setAudioFormat(e.target.value)}
          className="w-full bg-gray-700 border border-gray-600 rounded p-2 text-white"
        >
          <option value="mp3">MP3</option>
          <option value="wav">WAV</option>
          <option value="aac">AAC</option>
        </select>
      </div>

      <button
        onClick={handleSubmit}
        disabled={!file || converting}
        className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white py-3 rounded-lg font-semibold transition"
      >
        {converting ? 'Extraction en cours...' : `Extraire l'audio en ${audioFormat.toUpperCase()}`}
      </button>

      {downloadUrl && (
        <a
          href={downloadUrl}
          download
          className="block text-center bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-semibold transition"
        >
          Télécharger le fichier audio
        </a>
      )}
    </div>
  );
}
