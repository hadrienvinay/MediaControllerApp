'use client';

import { useEffect, useRef, useState } from 'react';
import FileDropZone from './FileDropZone';

interface AudioTrimFormProps {
  onConversionDone: () => void;
}

function formatTime(s: number): string {
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  const ms = Math.floor((s % 1) * 10);
  return `${m}:${sec.toString().padStart(2, '0')}.${ms}`;
}

export default function AudioTrimForm({ onConversionDone }: AudioTrimFormProps) {
  const [file, setFile] = useState<File | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [duration, setDuration] = useState(0);
  const [startTime, setStartTime] = useState(0);
  const [endTime, setEndTime] = useState(0);
  const [converting, setConverting] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [isPreviewing, setIsPreviewing] = useState(false);

  const audioRef = useRef<HTMLAudioElement>(null);
  const previewTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (audioUrl) URL.revokeObjectURL(audioUrl);
      if (previewTimerRef.current) clearTimeout(previewTimerRef.current);
    };
  }, [audioUrl]);

  const handleFilesSelected = (files: File[]) => {
    if (files.length === 0) return;
    const f = files[0];
    if (audioUrl) URL.revokeObjectURL(audioUrl);
    setFile(f);
    setAudioUrl(URL.createObjectURL(f));
    setDownloadUrl(null);
    setDuration(0);
    setStartTime(0);
    setEndTime(0);
    setIsPreviewing(false);
  };

  const handleClear = () => {
    if (previewTimerRef.current) clearTimeout(previewTimerRef.current);
    audioRef.current?.pause();
    if (audioUrl) URL.revokeObjectURL(audioUrl);
    setFile(null);
    setAudioUrl(null);
    setDuration(0);
    setStartTime(0);
    setEndTime(0);
    setIsPreviewing(false);
    setDownloadUrl(null);
  };

  const handleLoadedMetadata = () => {
    const dur = audioRef.current?.duration ?? 0;
    setDuration(dur);
    setEndTime(dur);
  };

  const handleStartChange = (v: number) => {
    if (v < endTime - 0.1) setStartTime(v);
  };

  const handleEndChange = (v: number) => {
    if (v > startTime + 0.1) setEndTime(v);
  };

  const handlePreview = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (previewTimerRef.current) clearTimeout(previewTimerRef.current);
    audio.currentTime = startTime;
    audio.play();
    setIsPreviewing(true);
    previewTimerRef.current = setTimeout(() => {
      audio.pause();
      setIsPreviewing(false);
    }, (endTime - startTime) * 1000);
  };

  const stopPreview = () => {
    if (previewTimerRef.current) clearTimeout(previewTimerRef.current);
    audioRef.current?.pause();
    setIsPreviewing(false);
  };

  const handleSubmit = async () => {
    if (!file || duration === 0) return;
    setConverting(true);
    setDownloadUrl(null);
    try {
      const formData = new FormData();
      formData.append('type', 'audio-trim');
      formData.append('files', file);
      formData.append('startTime', startTime.toString());
      formData.append('endTime', endTime.toString());

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

  // Percentages for the colored selection bar
  const leftPct = duration > 0 ? (startTime / duration) * 100 : 0;
  const rightPct = duration > 0 ? 100 - (endTime / duration) * 100 : 100;

  // When both thumbs are close together, raise z-index of the end thumb
  // so it doesn't get stuck behind the start thumb
  const startOnTop = startTime / duration > 0.95;

  return (
    <div className="space-y-5">
      <FileDropZone
        accept="audio/*"
        multiple={false}
        maxFiles={1}
        onFilesSelected={handleFilesSelected}
        label="Glissez votre fichier audio ici (MP3, WAV, AAC, FLAC, OGG…)"
      />

      {file && (
        <div className="flex items-center gap-2 bg-gray-700 rounded p-2 text-sm">
          <span className="text-lg">🎵</span>
          <span className="flex-1 truncate">{file.name}</span>
          <span className="text-gray-400 shrink-0">
            {(file.size / 1024 / 1024).toFixed(1)} Mo
          </span>
          <button
            onClick={handleClear}
            className="px-2 py-1 bg-red-600 hover:bg-red-700 rounded text-white transition"
          >
            ✕
          </button>
        </div>
      )}

      {/* Hidden audio element — always rendered when audioUrl is set so metadata loads */}
      {audioUrl && (
        <audio
          ref={audioRef}
          src={audioUrl}
          onLoadedMetadata={handleLoadedMetadata}
          className="hidden"
        />
      )}

      {duration > 0 && (
        <div className="space-y-4 bg-gray-700/50 rounded-lg p-4">
          <p className="text-sm text-gray-400 font-semibold uppercase tracking-wide">
            Sélection
          </p>

          {/* Duration labels */}
          <div className="flex justify-between text-xs text-gray-500 font-mono">
            <span>0:00.0</span>
            <span>{formatTime(duration)}</span>
          </div>

          {/* Dual-range slider */}
          <div className="relative h-8 select-none">
            {/* Background track */}
            <div className="absolute inset-x-0 top-3 h-2 bg-gray-600 rounded-full" />

            {/* Selected region highlight */}
            <div
              className="absolute top-3 h-2 bg-blue-500 rounded-full pointer-events-none"
              style={{ left: `${leftPct}%`, right: `${rightPct}%` }}
            />

            {/* Start thumb (blue) */}
            <input
              type="range"
              min={0}
              max={duration}
              step={0.01}
              value={startTime}
              onChange={e => handleStartChange(parseFloat(e.target.value))}
              style={{ zIndex: startOnTop ? 4 : 3 }}
              className="
                absolute inset-x-0 top-0 w-full h-8
                appearance-none bg-transparent pointer-events-none
                [&::-webkit-slider-thumb]:pointer-events-auto
                [&::-webkit-slider-thumb]:appearance-none
                [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5
                [&::-webkit-slider-thumb]:rounded-full
                [&::-webkit-slider-thumb]:bg-blue-400
                [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white
                [&::-webkit-slider-thumb]:cursor-grab [&::-webkit-slider-thumb]:active:cursor-grabbing
                [&::-webkit-slider-thumb]:shadow-md
                [&::-moz-range-thumb]:pointer-events-auto
                [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:h-5
                [&::-moz-range-thumb]:rounded-full
                [&::-moz-range-thumb]:bg-blue-400
                [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-solid [&::-moz-range-thumb]:border-white
                [&::-moz-range-thumb]:cursor-grab
              "
            />

            {/* End thumb (green) */}
            <input
              type="range"
              min={0}
              max={duration}
              step={0.01}
              value={endTime}
              onChange={e => handleEndChange(parseFloat(e.target.value))}
              style={{ zIndex: startOnTop ? 3 : 4 }}
              className="
                absolute inset-x-0 top-0 w-full h-8
                appearance-none bg-transparent pointer-events-none
                [&::-webkit-slider-thumb]:pointer-events-auto
                [&::-webkit-slider-thumb]:appearance-none
                [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5
                [&::-webkit-slider-thumb]:rounded-full
                [&::-webkit-slider-thumb]:bg-green-400
                [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white
                [&::-webkit-slider-thumb]:cursor-grab [&::-webkit-slider-thumb]:active:cursor-grabbing
                [&::-webkit-slider-thumb]:shadow-md
                [&::-moz-range-thumb]:pointer-events-auto
                [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:h-5
                [&::-moz-range-thumb]:rounded-full
                [&::-moz-range-thumb]:bg-green-400
                [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-solid [&::-moz-range-thumb]:border-white
                [&::-moz-range-thumb]:cursor-grab
              "
            />
          </div>

          {/* Time display */}
          <div className="grid grid-cols-3 gap-2 text-sm text-center">
            <div className="bg-gray-700 rounded p-2">
              <p className="text-xs text-gray-400 mb-1 flex items-center justify-center gap-1">
                <span className="w-2 h-2 rounded-full bg-blue-400 inline-block" />
                Début
              </p>
              <p className="font-mono text-blue-300 font-semibold">{formatTime(startTime)}</p>
            </div>
            <div className="bg-gray-700 rounded p-2">
              <p className="text-xs text-gray-400 mb-1">Durée sélectionnée</p>
              <p className="font-mono text-white font-semibold">{formatTime(endTime - startTime)}</p>
            </div>
            <div className="bg-gray-700 rounded p-2">
              <p className="text-xs text-gray-400 mb-1 flex items-center justify-center gap-1">
                Fin
                <span className="w-2 h-2 rounded-full bg-green-400 inline-block" />
              </p>
              <p className="font-mono text-green-300 font-semibold">{formatTime(endTime)}</p>
            </div>
          </div>

          {/* Fine-tune inputs */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-gray-400 mb-1">Début précis (secondes)</label>
              <input
                type="number"
                min={0}
                max={endTime - 0.1}
                step={0.01}
                value={startTime.toFixed(2)}
                onChange={e => handleStartChange(parseFloat(e.target.value) || 0)}
                className="w-full bg-gray-700 border border-gray-600 rounded p-2 text-white text-sm font-mono"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Fin précise (secondes)</label>
              <input
                type="number"
                min={startTime + 0.1}
                max={duration}
                step={0.01}
                value={endTime.toFixed(2)}
                onChange={e => handleEndChange(parseFloat(e.target.value) || duration)}
                className="w-full bg-gray-700 border border-gray-600 rounded p-2 text-white text-sm font-mono"
              />
            </div>
          </div>

          {/* Preview button */}
          <button
            onClick={isPreviewing ? stopPreview : handlePreview}
            className={`w-full py-2 rounded-lg font-semibold transition ${
              isPreviewing
                ? 'bg-yellow-600 hover:bg-yellow-700 text-white'
                : 'bg-gray-600 hover:bg-gray-500 text-white'
            }`}
          >
            {isPreviewing ? '⏹ Arrêter la prévisualisation' : '▶ Prévisualiser la sélection'}
          </button>
        </div>
      )}

      <button
        onClick={handleSubmit}
        disabled={!file || converting || duration === 0}
        className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white py-3 rounded-lg font-semibold transition"
      >
        {converting ? 'Découpe en cours...' : '✂ Découper l\'audio'}
      </button>

      {downloadUrl && (
        <div className="space-y-3 bg-gray-700/50 rounded-lg p-4">
          <p className="text-sm text-gray-400 font-semibold">Prévisualisation du résultat</p>
          <audio controls src={downloadUrl} className="w-full" />
          <a
            href={downloadUrl}
            download
            className="block text-center bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-semibold transition"
          >
            Télécharger l'audio découpé
          </a>
        </div>
      )}
    </div>
  );
}
