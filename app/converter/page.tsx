'use client';

import { useEffect, useRef, useState } from 'react';
import { ConvertedItem } from '@/types/converted';
import { FileConversion } from '@/types/file-conversion';
import Link from 'next/link';
import ImageToPdfForm from '../components/ImageToPdfForm';
import MergePdfsForm from '../components/MergePdfsForm';
import ImageConvertForm from '../components/ImageConvertForm';
import PdfToImagesForm from '../components/PdfToImagesForm';
import SplitPdfForm from '../components/SplitPdfForm';
import CompressImageForm from '../components/CompressImageForm';
import VideoToGifForm from '../components/VideoToGifForm';
import HtmlToPdfForm from '../components/HtmlToPdfForm';
import VideoToAudioForm from '../components/VideoToAudioForm';
import VideoResizeForm from '../components/VideoResizeForm';
import AudioTrimForm from '../components/AudioTrimForm';
import YoutubeToMp3Form from '../components/YoutubeToMp3Form';

type Tab = 'audio' | 'images-to-pdf' | 'merge-pdfs' | 'image-convert' | 'pdf-to-images' | 'split-pdf' | 'compress-image' | 'video-to-gif' | 'html-to-pdf' | 'video-to-audio' | 'video-resize' | 'audio-trim';

const tabs: { key: Tab; label: string }[] = [
  { key: 'audio', label: 'Audio converti' },
  { key: 'images-to-pdf', label: 'Images → PDF' },
  { key: 'pdf-to-images', label: 'PDF → Images' },
  { key: 'merge-pdfs', label: 'Fusionner PDFs' },
  { key: 'split-pdf', label: 'Découper PDF' },
  { key: 'html-to-pdf', label: 'HTML/URL → PDF' },
  { key: 'image-convert', label: 'Convertir image' },
  { key: 'compress-image', label: 'Compresser image' },
  { key: 'video-to-gif', label: 'Vidéo → GIF' },
  { key: 'video-to-audio', label: 'Vidéo → Audio' },
  { key: 'video-resize', label: 'Redimensionner vidéo' },
  { key: 'audio-trim', label: '✂ Découper audio' },
];

export default function ConverterPage() {
  const [activeTab, setActiveTab] = useState<Tab>('audio');
  const [convertedFiles, setConvertedFiles] = useState<ConvertedItem[]>([]);
  const [fileConversions, setFileConversions] = useState<FileConversion[]>([]);
  const [loading, setLoading] = useState(true);

  // Audio trim state
  const [trimmingFileId, setTrimmingFileId] = useState<string | null>(null);
  const [trimDuration, setTrimDuration] = useState(0);
  const [trimStart, setTrimStart] = useState(0);
  const [trimEnd, setTrimEnd] = useState(0);
  const [isTrimPreviewing, setIsTrimPreviewing] = useState(false);
  const [isTrimming, setIsTrimming] = useState(false);
  const [trimmedUrl, setTrimmedUrl] = useState<string | null>(null);
  const trimAudioRef = useRef<HTMLAudioElement>(null);
  const trimTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchConvertedFiles = async () => {
    try {
      const response = await fetch('/api/convert');
      const data = await response.json();
      setConvertedFiles(data);
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  const fetchFileConversions = async () => {
    try {
      const response = await fetch('/api/file-convert');
      const data = await response.json();
      setFileConversions(data);
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  useEffect(() => {
    Promise.all([fetchConvertedFiles(), fetchFileConversions()]).finally(() =>
      setLoading(false)
    );
  }, []);

  const handleDeleteFileConversion = async (id: string) => {
    try {
      await fetch(`/api/file-convert?id=${id}`, { method: 'DELETE' });
      await fetchFileConversions();
    } catch (error) {
      console.error('Erreur suppression:', error);
    }
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return '';
    if (bytes < 1024) return `${bytes} o`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} Ko`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`;
  };

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    const ms = Math.floor((s % 1) * 10);
    return `${m}:${sec.toString().padStart(2, '0')}.${ms}`;
  };

  const openTrimmer = (id: string) => {
    if (trimmingFileId === id) {
      setTrimmingFileId(null);
      return;
    }
    setTrimmingFileId(id);
    setTrimDuration(0);
    setTrimStart(0);
    setTrimEnd(0);
    setTrimmedUrl(null);
    setIsTrimPreviewing(false);
  };

  const handleTrimLoadedMetadata = () => {
    const dur = trimAudioRef.current?.duration ?? 0;
    setTrimDuration(dur);
    setTrimEnd(dur);
  };

  const handleTrimPreview = () => {
    const audio = trimAudioRef.current;
    if (!audio) return;
    if (trimTimerRef.current) clearTimeout(trimTimerRef.current);
    audio.currentTime = trimStart;
    audio.play();
    setIsTrimPreviewing(true);
    trimTimerRef.current = setTimeout(() => {
      audio.pause();
      setIsTrimPreviewing(false);
    }, (trimEnd - trimStart) * 1000);
  };

  const stopTrimPreview = () => {
    if (trimTimerRef.current) clearTimeout(trimTimerRef.current);
    trimAudioRef.current?.pause();
    setIsTrimPreviewing(false);
  };

  const handleTrimSubmit = async (filename: string) => {
    setIsTrimming(true);
    setTrimmedUrl(null);
    try {
      const formData = new FormData();
      formData.append('type', 'audio-trim');
      formData.append('existingFile', filename);
      formData.append('startTime', trimStart.toString());
      formData.append('endTime', trimEnd.toString());
      const res = await fetch('/api/file-convert', { method: 'POST', body: formData });
      const data = await res.json();
      if (data.success) {
        setTrimmedUrl(data.downloadUrl);
        fetchFileConversions();
      } else {
        alert(data.error || 'Erreur de découpe');
      }
    } catch {
      alert('Erreur de découpe');
    } finally {
      setIsTrimming(false);
    }
  };

  const trimLeftPct = trimDuration > 0 ? (trimStart / trimDuration) * 100 : 0;
  const trimRightPct = trimDuration > 0 ? 100 - (trimEnd / trimDuration) * 100 : 100;
  const trimStartOnTop = trimDuration > 0 && trimStart / trimDuration > 0.95;

  const filteredConversions = fileConversions.filter(c => {
    if (activeTab === 'audio') return false;
    return c.type === activeTab;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl">Chargement...</div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <h1 className="text-4xl font-bold">Convertisseur</h1>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2">
        {tabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 rounded-lg font-semibold transition ${
              activeTab === tab.key
                ? 'bg-blue-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'audio' && (
        <div className="space-y-6">
          {/* YouTube / SoundCloud conversion form */}
          <div className="bg-gray-800 rounded-lg p-6 space-y-3">
            <h2 className="text-xl font-bold">Convertir depuis YouTube / SoundCloud</h2>
            <YoutubeToMp3Form />
          </div>

          <h2 className="text-2xl font-bold">Mes Fichiers audio convertis</h2>

          {convertedFiles.length === 0 ? (
            <div className="text-center py-20 bg-gray-100 dark:bg-gray-800 rounded-lg">
              <p className="text-xl text-gray-600 dark:text-gray-400 mb-4">
                Aucune conversion réalisée pour le moment
              </p>
              <Link
                href="/"
                className="text-blue-600 hover:text-blue-700 font-semibold"
              >
                Retourner à l'accueil pour vos conversions
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-8">
              {convertedFiles.map(converted => (
                <div
                  key={converted.id}
                  className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 hover:shadow-lg transition"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <h2 className="text-2xl font-bold mb-2">{converted.title}</h2>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span>
                          {new Date(converted.createdAt).toLocaleDateString('fr-FR')}
                        </span>
                        <span>{converted.duration} minutes</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => openTrimmer(converted.id)}
                        className={`px-4 py-2 rounded-lg font-semibold transition ${
                          trimmingFileId === converted.id
                            ? 'bg-blue-700 text-white'
                            : 'bg-blue-600 hover:bg-blue-700 text-white'
                        }`}
                      >
                        ✂ Découper
                      </button>
                      <a
                        href={'/audio/converted/' + converted.filename}
                        download
                        className="bg-green-400 text-white px-6 py-2 rounded-lg cursor-pointer"
                      >
                        Télécharger
                      </a>
                    </div>
                  </div>

                  {/* Inline trimmer */}
                  {trimmingFileId === converted.id && (
                    <div className="mt-4 space-y-4 bg-gray-700/50 rounded-lg p-4">
                      <audio
                        ref={trimAudioRef}
                        controls
                        src={'/audio/converted/' + converted.filename}
                        onLoadedMetadata={handleTrimLoadedMetadata}
                        className="w-full mb-2"
                      />

                      {trimDuration > 0 && (
                        <>
                          <div className="flex justify-between text-xs text-gray-500 font-mono">
                            <span>0:00.0</span>
                            <span>{formatTime(trimDuration)}</span>
                          </div>

                          {/* Dual-range slider */}
                          <div className="relative h-8 select-none">
                            <div className="absolute inset-x-0 top-3 h-2 bg-gray-600 rounded-full" />
                            <div
                              className="absolute top-3 h-2 bg-blue-500 rounded-full pointer-events-none"
                              style={{ left: `${trimLeftPct}%`, right: `${trimRightPct}%` }}
                            />
                            <input
                              type="range"
                              min={0}
                              max={trimDuration}
                              step={0.01}
                              value={trimStart}
                              onChange={e => {
                                const v = parseFloat(e.target.value);
                                if (v < trimEnd - 0.1) setTrimStart(v);
                              }}
                              style={{ zIndex: trimStartOnTop ? 4 : 3 }}
                              className="absolute inset-x-0 top-0 w-full h-8 appearance-none bg-transparent pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-blue-400 [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:cursor-grab [&::-webkit-slider-thumb]:shadow-md [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-blue-400 [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-solid [&::-moz-range-thumb]:border-white [&::-moz-range-thumb]:cursor-grab"
                            />
                            <input
                              type="range"
                              min={0}
                              max={trimDuration}
                              step={0.01}
                              value={trimEnd}
                              onChange={e => {
                                const v = parseFloat(e.target.value);
                                if (v > trimStart + 0.1) setTrimEnd(v);
                              }}
                              style={{ zIndex: trimStartOnTop ? 3 : 4 }}
                              className="absolute inset-x-0 top-0 w-full h-8 appearance-none bg-transparent pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-green-400 [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:cursor-grab [&::-webkit-slider-thumb]:shadow-md [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-green-400 [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-solid [&::-moz-range-thumb]:border-white [&::-moz-range-thumb]:cursor-grab"
                            />
                          </div>

                          {/* Time display */}
                          <div className="grid grid-cols-3 gap-2 text-sm text-center">
                            <div className="bg-gray-700 rounded p-2">
                              <p className="text-xs text-gray-400 mb-1 flex items-center justify-center gap-1">
                                <span className="w-2 h-2 rounded-full bg-blue-400 inline-block" />
                                Début
                              </p>
                              <p className="font-mono text-blue-300 font-semibold">{formatTime(trimStart)}</p>
                            </div>
                            <div className="bg-gray-700 rounded p-2">
                              <p className="text-xs text-gray-400 mb-1">Durée</p>
                              <p className="font-mono text-white font-semibold">{formatTime(trimEnd - trimStart)}</p>
                            </div>
                            <div className="bg-gray-700 rounded p-2">
                              <p className="text-xs text-gray-400 mb-1 flex items-center justify-center gap-1">
                                Fin
                                <span className="w-2 h-2 rounded-full bg-green-400 inline-block" />
                              </p>
                              <p className="font-mono text-green-300 font-semibold">{formatTime(trimEnd)}</p>
                            </div>
                          </div>

                          {/* Fine-tune inputs */}
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="block text-xs text-gray-400 mb-1">Début (s)</label>
                              <input
                                type="number"
                                min={0}
                                max={trimEnd - 0.1}
                                step={0.01}
                                value={trimStart.toFixed(2)}
                                onChange={e => {
                                  const v = parseFloat(e.target.value) || 0;
                                  if (v < trimEnd - 0.1) setTrimStart(v);
                                }}
                                className="w-full bg-gray-700 border border-gray-600 rounded p-2 text-white text-sm font-mono"
                              />
                            </div>
                            <div>
                              <label className="block text-xs text-gray-400 mb-1">Fin (s)</label>
                              <input
                                type="number"
                                min={trimStart + 0.1}
                                max={trimDuration}
                                step={0.01}
                                value={trimEnd.toFixed(2)}
                                onChange={e => {
                                  const v = parseFloat(e.target.value) || trimDuration;
                                  if (v > trimStart + 0.1) setTrimEnd(v);
                                }}
                                className="w-full bg-gray-700 border border-gray-600 rounded p-2 text-white text-sm font-mono"
                              />
                            </div>
                          </div>

                          {/* Action buttons */}
                          <div className="grid grid-cols-2 gap-4">
                            <button
                              onClick={isTrimPreviewing ? stopTrimPreview : handleTrimPreview}
                              className={`py-2 rounded-lg font-semibold transition ${
                                isTrimPreviewing
                                  ? 'bg-yellow-600 hover:bg-yellow-700 text-white'
                                  : 'bg-gray-600 hover:bg-gray-500 text-white'
                              }`}
                            >
                              {isTrimPreviewing ? '⏹ Arrêter' : '▶ Prévisualiser'}
                            </button>
                            <button
                              onClick={() => handleTrimSubmit(converted.filename)}
                              disabled={isTrimming}
                              className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white py-2 rounded-lg font-semibold transition"
                            >
                              {isTrimming ? 'Découpe...' : '✂ Découper'}
                            </button>
                          </div>

                          {/* Trimmed result */}
                          {trimmedUrl && (
                            <div className="space-y-3 bg-gray-700/30 rounded-lg p-4">
                              <p className="text-sm text-green-400 font-semibold">Extrait prêt !</p>
                              <audio controls src={trimmedUrl} className="w-full" />
                              <a
                                href={trimmedUrl}
                                download
                                className="block text-center bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg font-semibold transition"
                              >
                                Télécharger l&apos;extrait
                              </a>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'images-to-pdf' && (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold">Images vers PDF</h2>
          <div className="bg-gray-800 rounded-lg p-6">
            <ImageToPdfForm onConversionDone={fetchFileConversions} />
          </div>
        </div>
      )}

      {activeTab === 'merge-pdfs' && (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold">Fusionner des PDFs</h2>
          <div className="bg-gray-800 rounded-lg p-6">
            <MergePdfsForm onConversionDone={fetchFileConversions} />
          </div>
        </div>
      )}

      {activeTab === 'image-convert' && (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold">Convertir le format d'une image</h2>
          <div className="bg-gray-800 rounded-lg p-6">
            <ImageConvertForm onConversionDone={fetchFileConversions} />
          </div>
        </div>
      )}

      {activeTab === 'pdf-to-images' && (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold">PDF vers Images</h2>
          <div className="bg-gray-800 rounded-lg p-6">
            <PdfToImagesForm onConversionDone={fetchFileConversions} />
          </div>
        </div>
      )}

      {activeTab === 'split-pdf' && (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold">Découper un PDF</h2>
          <div className="bg-gray-800 rounded-lg p-6">
            <SplitPdfForm onConversionDone={fetchFileConversions} />
          </div>
        </div>
      )}

      {activeTab === 'compress-image' && (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold">Compresser une image</h2>
          <div className="bg-gray-800 rounded-lg p-6">
            <CompressImageForm onConversionDone={fetchFileConversions} />
          </div>
        </div>
      )}

      {activeTab === 'video-to-gif' && (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold">Vidéo vers GIF</h2>
          <div className="bg-gray-800 rounded-lg p-6">
            <VideoToGifForm onConversionDone={fetchFileConversions} />
          </div>
        </div>
      )}

      {activeTab === 'html-to-pdf' && (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold">HTML / URL vers PDF</h2>
          <div className="bg-gray-800 rounded-lg p-6">
            <HtmlToPdfForm onConversionDone={fetchFileConversions} />
          </div>
        </div>
      )}

      {activeTab === 'video-to-audio' && (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold">Extraire l'audio d'une vidéo</h2>
          <div className="bg-gray-800 rounded-lg p-6">
            <VideoToAudioForm onConversionDone={fetchFileConversions} />
          </div>
        </div>
      )}

      {activeTab === 'video-resize' && (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold">Redimensionner / Compresser une vidéo</h2>
          <div className="bg-gray-800 rounded-lg p-6">
            <VideoResizeForm onConversionDone={fetchFileConversions} />
          </div>
        </div>
      )}

      {activeTab === 'audio-trim' && (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold">Découper un fichier audio</h2>
          <div className="bg-gray-800 rounded-lg p-6">
            <AudioTrimForm onConversionDone={fetchFileConversions} />
          </div>
        </div>
      )}

      {/* File conversion history (for non-audio tabs) */}
      {activeTab !== 'audio' && filteredConversions.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-xl font-bold">Historique</h3>
          <div className="grid grid-cols-1 gap-4">
            {filteredConversions.map(conversion => (
              <div
                key={conversion.id}
                className="bg-gray-800 rounded-lg p-4 flex items-center justify-between"
              >
                <div>
                  <p className="font-semibold">{conversion.title}</p>
                  <p className="text-sm text-gray-400">
                    {new Date(conversion.createdAt).toLocaleDateString('fr-FR')}{' '}
                    {formatFileSize(conversion.fileSize)}
                  </p>
                </div>
                <div className="flex gap-2">
                  <a
                    href={`/converted/${conversion.outputFilename}`}
                    download
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm transition"
                  >
                    Télécharger
                  </a>
                  <button
                    onClick={() => handleDeleteFileConversion(conversion.id)}
                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm transition"
                  >
                    Supprimer
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
