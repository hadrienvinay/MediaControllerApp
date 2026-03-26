'use client';

import { useState } from 'react';
import FileDropZone from './FileDropZone';

interface SplitPdfFormProps {
  onConversionDone: () => void;
}

export default function SplitPdfForm({ onConversionDone }: SplitPdfFormProps) {
  const [file, setFile] = useState<File | null>(null);
  const [startPage, setStartPage] = useState(1);
  const [endPage, setEndPage] = useState(1);
  const [converting, setConverting] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);

  const handleFilesSelected = (files: File[]) => {
    if (files.length > 0) {
      setFile(files[0]);
      setDownloadUrl(null);
    }
  };

  const handleSubmit = async () => {
    if (!file || startPage < 1 || endPage < startPage) return;
    setConverting(true);
    setDownloadUrl(null);

    try {
      const formData = new FormData();
      formData.append('type', 'split-pdf');
      formData.append('files', file);
      formData.append('startPage', startPage.toString());
      formData.append('endPage', endPage.toString());

      const res = await fetch('/api/file-convert', { method: 'POST', body: formData });
      const data = await res.json();

      if (data.success) {
        setDownloadUrl(data.downloadUrl);
        setFile(null);
        onConversionDone();
      } else {
        alert(data.error || 'Erreur de découpage');
      }
    } catch {
      alert('Erreur de découpage');
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

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm text-gray-400 mb-1">Page de début</label>
          <input
            type="number"
            min={1}
            value={startPage}
            onChange={e => setStartPage(parseInt(e.target.value) || 1)}
            className="w-full bg-gray-700 border border-gray-600 rounded p-2 text-white"
          />
        </div>
        <div>
          <label className="block text-sm text-gray-400 mb-1">Page de fin</label>
          <input
            type="number"
            min={startPage}
            value={endPage}
            onChange={e => setEndPage(parseInt(e.target.value) || 1)}
            className="w-full bg-gray-700 border border-gray-600 rounded p-2 text-white"
          />
        </div>
      </div>

      <button
        onClick={handleSubmit}
        disabled={!file || converting || startPage < 1 || endPage < startPage}
        className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white py-3 rounded-lg font-semibold transition"
      >
        {converting ? 'Découpage en cours...' : `Extraire pages ${startPage} à ${endPage}`}
      </button>

      {downloadUrl && (
        <a
          href={downloadUrl}
          download
          className="block text-center bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-semibold transition"
        >
          Télécharger le PDF découpé
        </a>
      )}
    </div>
  );
}
