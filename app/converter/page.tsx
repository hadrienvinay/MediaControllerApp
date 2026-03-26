'use client';

import { useEffect, useState } from 'react';
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

type Tab = 'audio' | 'images-to-pdf' | 'merge-pdfs' | 'image-convert' | 'pdf-to-images' | 'split-pdf' | 'compress-image' | 'video-to-gif' | 'html-to-pdf' | 'video-to-audio' | 'video-resize';

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
];

export default function ConverterPage() {
  const [activeTab, setActiveTab] = useState<Tab>('audio');
  const [convertedFiles, setConvertedFiles] = useState<ConvertedItem[]>([]);
  const [fileConversions, setFileConversions] = useState<FileConversion[]>([]);
  const [loading, setLoading] = useState(true);

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
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Mes Fichiers audio convertis</h2>
            <Link
              href="/"
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition"
            >
              + Nouvelle conversion
            </Link>
          </div>

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
                      <a
                        href={'/audio/converted/' + converted.filename}
                        download
                        className="bg-green-400 text-white px-6 py-2 rounded-lg cursor-pointer"
                      >
                        Télécharger
                      </a>
                    </div>
                  </div>
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
