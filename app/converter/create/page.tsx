'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useRef, useState } from 'react';

function formatTime(s: number): string {
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  const ms = Math.floor((s % 1) * 10);
  return `${m}:${sec.toString().padStart(2, '0')}.${ms}`;
}

function ConverterCreateContent() {
  const searchParams = useSearchParams();
  const audioFile = searchParams.get('file');
  const metadata = searchParams.get('metadata');
  const fileFormat = searchParams.get('format') || 'mp3';
  const fileDir = searchParams.get('dir') || 'audio/converted';
  const parsedMetadata = metadata ? JSON.parse(metadata) : null;
  const title = parsedMetadata?.title || 'Fichier Converti';
  const duration = parsedMetadata?.duration || '';
  const thumbnail = parsedMetadata?.thumbnail || '';
  const mediaPath = `/${fileDir}/${audioFile}`;
  const isVideo = fileFormat === 'mp4';

  // Trim state
  const [audioDuration, setAudioDuration] = useState(0);
  const [startTime, setStartTime] = useState(0);
  const [endTime, setEndTime] = useState(0);
  const [isPreviewing, setIsPreviewing] = useState(false);
  const [isTrimming, setIsTrimming] = useState(false);
  const [trimmedUrl, setTrimmedUrl] = useState<string | null>(null);
  const [showTrimmer, setShowTrimmer] = useState(false);

  const audioRef = useRef<HTMLAudioElement>(null);
  const previewTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (previewTimerRef.current) clearTimeout(previewTimerRef.current);
    };
  }, []);

  const handleLoadedMetadata = () => {
    const dur = audioRef.current?.duration ?? 0;
    setAudioDuration(dur);
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

  const handleTrim = async () => {
    if (!audioFile) return;
    setIsTrimming(true);
    setTrimmedUrl(null);
    try {
      const formData = new FormData();
      formData.append('type', 'audio-trim');
      formData.append('existingFile', audioFile);
      formData.append('startTime', startTime.toString());
      formData.append('endTime', endTime.toString());

      const res = await fetch('/api/file-convert', { method: 'POST', body: formData });
      const data = await res.json();
      if (data.success) {
        setTrimmedUrl(data.downloadUrl);
      } else {
        alert(data.error || 'Erreur de découpe');
      }
    } catch {
      alert('Erreur de découpe');
    } finally {
      setIsTrimming(false);
    }
  };

  const leftPct = audioDuration > 0 ? (startTime / audioDuration) * 100 : 0;
  const rightPct = audioDuration > 0 ? 100 - (endTime / audioDuration) * 100 : 100;
  const startOnTop = audioDuration > 0 && startTime / audioDuration > 0.95;

  return (
    <div className="space-y-12">
      <div className="bg-purple-900 rounded-xl p-6 shadow-lg">
        <div className="relative">
          <div aria-hidden="true" className="hidden sm:block">
            <div className="absolute inset-y-0 left-0 w-1/2 bg-purple-800 rounded-r-3xl" />
            <svg className="absolute top-8 left-1/2 -ml-3" width="404" height="392" fill="none" viewBox="0 0 404 392">
              <defs>
                <pattern id="8228f071-bcee-4ec8-905a-2a059a2cc4fb" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
                  <rect x="0" y="0" width="4" height="4" className="text-gray-200" fill="currentColor" />
                </pattern>
              </defs>
              <rect width="404" height="392" fill="url(#8228f071-bcee-4ec8-905a-2a059a2cc4fb)" />
            </svg>
          </div>
          <div className="mx-auto max-w-md px-4 sm:max-w-3xl sm:px-6 lg:max-w-7xl lg:px-8">
            <div className="relative rounded-2xl px-6 py-10 bg-purple-700 overflow-hidden shadow-xl sm:px-12 sm:py-20">
              <div aria-hidden="true" className="absolute inset-0 -mt-72 sm:-mt-32 md:mt-0">
                <svg className="absolute inset-0 h-full w-full" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 1463 360">
                  <path className="text-gray-600 text-opacity-40" fill="currentColor" d="M-82.673 72l1761.849 472.086-134.327 501.315-1761.85-472.086z" />
                  <path className="text-gray-800 text-opacity-40" fill="currentColor" d="M-217.088 544.086L1544.761 72l134.327 501.316-1761.849 472.086z" />
                </svg>
              </div>
              <div className="relative flex flex-col">
                <div className="sm:text-center">
                  <h1 className="text-5xl font-bold text-center mb-8">Votre fichier a bien été converti !</h1>
                  <div className="mb-4">
                    {thumbnail && <img src={thumbnail} alt="Thumbnail" className="mx-auto rounded-lg shadow-lg mb-4" width={400} />}
                    <h2 className="text-xl text-center text-gray-100">{title} - {duration}</h2>
                  </div>
                </div>

                {/* Media player */}
                <div className="mt-4 sm:mx-auto w-full max-w-lg">
                  {isVideo ? (
                    <video controls src={mediaPath} className="w-full rounded-lg" />
                  ) : (
                    <audio
                      ref={audioRef}
                      controls
                      src={mediaPath}
                      onLoadedMetadata={handleLoadedMetadata}
                      className="w-full"
                    />
                  )}
                </div>

                <div className="sm:mx-auto sm:flex sm:justify-center space-x-6 mt-6">
                  <a
                    href={mediaPath}
                    download={audioFile}
                    className="w-auto inline-block rounded-md border border-transparent px-5 py-3 bg-green-900 text-base font-medium text-white shadow hover:bg-green-800 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-rose-500 sm:px-10"
                  >
                    Télécharger le {fileFormat.toUpperCase()} complet
                  </a>
                  {!isVideo && (
                    <button
                      onClick={() => setShowTrimmer(!showTrimmer)}
                      className="w-auto inline-block rounded-md border border-transparent px-5 py-3 bg-blue-700 text-base font-medium text-white shadow hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 sm:px-10"
                    >
                      {showTrimmer ? 'Masquer le découpeur' : '✂ Découper un extrait'}
                    </button>
                  )}
                  <a
                    href="/"
                    className="w-auto inline-block rounded-md border border-transparent px-5 py-3 bg-purple-900 text-base font-medium text-white shadow hover:bg-purple-800 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-rose-500 sm:px-10"
                  >
                    Convertir une Nouvelle Vidéo
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Trim section (audio only) */}
      {!isVideo && showTrimmer && audioDuration > 0 && (
        <div className="max-w-3xl mx-auto bg-gray-800 rounded-xl p-6 shadow-lg space-y-5">
          <h2 className="text-2xl font-bold">✂ Découper l&apos;audio</h2>
          <p className="text-sm text-gray-400">
            Sélectionnez la portion à extraire avec les curseurs, puis prévisualisez avant de découper.
          </p>

          {/* Duration labels */}
          <div className="flex justify-between text-xs text-gray-500 font-mono">
            <span>0:00.0</span>
            <span>{formatTime(audioDuration)}</span>
          </div>

          {/* Dual-range slider */}
          <div className="relative h-8 select-none">
            <div className="absolute inset-x-0 top-3 h-2 bg-gray-600 rounded-full" />
            <div
              className="absolute top-3 h-2 bg-blue-500 rounded-full pointer-events-none"
              style={{ left: `${leftPct}%`, right: `${rightPct}%` }}
            />

            {/* Start thumb */}
            <input
              type="range"
              min={0}
              max={audioDuration}
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

            {/* End thumb */}
            <input
              type="range"
              min={0}
              max={audioDuration}
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
                max={audioDuration}
                step={0.01}
                value={endTime.toFixed(2)}
                onChange={e => handleEndChange(parseFloat(e.target.value) || audioDuration)}
                className="w-full bg-gray-700 border border-gray-600 rounded p-2 text-white text-sm font-mono"
              />
            </div>
          </div>

          {/* Action buttons */}
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={isPreviewing ? stopPreview : handlePreview}
              className={`py-3 rounded-lg font-semibold transition ${
                isPreviewing
                  ? 'bg-yellow-600 hover:bg-yellow-700 text-white'
                  : 'bg-gray-600 hover:bg-gray-500 text-white'
              }`}
            >
              {isPreviewing ? '⏹ Arrêter' : '▶ Prévisualiser'}
            </button>
            <button
              onClick={handleTrim}
              disabled={isTrimming}
              className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white py-3 rounded-lg font-semibold transition"
            >
              {isTrimming ? 'Découpe en cours...' : '✂ Découper'}
            </button>
          </div>

          {/* Trimmed result */}
          {trimmedUrl && (
            <div className="space-y-3 bg-gray-700/50 rounded-lg p-4">
              <p className="text-sm text-green-400 font-semibold">Extrait prêt !</p>
              <audio controls src={trimmedUrl} className="w-full" />
              <a
                href={trimmedUrl}
                download
                className="block text-center bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-semibold transition"
              >
                Télécharger l&apos;extrait découpé
              </a>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function ConverterCreatePage() {
  return (
    <Suspense>
      <ConverterCreateContent />
    </Suspense>
  );
}
