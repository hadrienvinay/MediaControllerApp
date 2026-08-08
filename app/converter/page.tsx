'use client';

import { useEffect, useRef, useState } from 'react';
import { ConvertedItem } from '@/types/converted';
import { FileConversion } from '@/types/file-conversion';
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
import QrCodeForm from '../components/QrCodeForm';
import SignPdfForm from '../components/SignPdfForm';
import VoiceIsolateForm from '../components/VoiceIsolateForm';
import CompressPdfForm from '../components/CompressPdfForm';
import CodeConverterForm from '../components/CodeConverterForm';
import CryptoToolsForm from '../components/CryptoToolsForm';
import JsonYamlForm from '../components/JsonYamlForm';
import JwtDecoderForm from '../components/JwtDecoderForm';
import SubtitlesForm from '../components/SubtitlesForm';
import UrlShortenerForm from '../components/UrlShortenerForm';
import BgRemoveForm from '../components/BgRemoveForm';
import TranscribeForm from '../components/TranscribeForm';
import PdfToWordForm from '../components/PdfToWordForm';
import PdfPageSelectForm from '../components/PdfPageSelectForm';
import PdfFillForm from '../components/PdfFillForm';
import CsvJsonForm from '../components/CsvJsonForm';
import ImageResizeForm from '../components/ImageResizeForm';
import DrumMachineForm from '../components/DrumMachineForm';

type Tab ='audio' | 'images-to-pdf' | 'merge-pdfs' | 'image-convert' | 'pdf-to-images' | 'split-pdf' | 'compress-image' | 'video-to-gif' | 'html-to-pdf' | 'video-to-audio' | 'video-resize' | 'audio-trim' | 'qr-code' | 'sign-pdf' | 'voice-isolate' | 'compress-pdf' | 'code-convert' | 'crypto' | 'json-yaml' | 'jwt' | 'subtitles' | 'url-shorten' | 'bg-remove' | 'transcribe' | 'pdf-to-word' | 'pdf-select' | 'pdf-fill' | 'csv-json' | 'image-resize' | 'drum-machine';

const tabs: { key: Tab; label: string; group: string }[] = [
  // ── PDF ──────────────────────────────────────────────────────────────────
  { key: 'images-to-pdf',  label: 'Images → PDF',          group: 'PDF' },
  { key: 'pdf-to-images',  label: 'PDF → Images',          group: 'PDF' },
  { key: 'merge-pdfs',     label: 'Fusionner PDFs',        group: 'PDF' },
  { key: 'split-pdf',      label: 'Découper PDF',          group: 'PDF' },
  { key: 'compress-pdf',   label: 'Compresser PDF',        group: 'PDF' },
  { key: 'pdf-select',     label: 'Sélection pages PDF',   group: 'PDF' },
  { key: 'sign-pdf',       label: 'Signer PDF',            group: 'PDF' },
  { key: 'pdf-fill',       label: 'Remplir PDF',           group: 'PDF' },
  { key: 'pdf-to-word',    label: 'PDF → Word/Excel',      group: 'PDF' },
  { key: 'html-to-pdf',    label: 'HTML/URL → PDF',        group: 'PDF' },
  // ── Image ─────────────────────────────────────────────────────────────────
  { key: 'image-convert',  label: 'Convertir image',       group: 'Image' },
  { key: 'compress-image', label: 'Compresser image',      group: 'Image' },
  { key: 'bg-remove',      label: 'Suppr. fond',           group: 'Image' },
  { key: 'video-to-gif',   label: 'Vidéo → GIF',           group: 'Image' },
  { key: 'qr-code',        label: 'QR Code',               group: 'Image' },
  // ── Audio / Vidéo ─────────────────────────────────────────────────────────
  { key: 'audio',          label: 'Audio converti',        group: 'Audio / Vidéo' },
  { key: 'audio-trim',     label: 'Découper audio',        group: 'Audio / Vidéo' },
  { key: 'transcribe',     label: 'Transcription',         group: 'Audio / Vidéo' },
  { key: 'voice-isolate',  label: 'Isoler la voix',        group: 'Audio / Vidéo' },
  { key: 'video-to-audio', label: 'Vidéo → Audio',         group: 'Audio / Vidéo' },
  { key: 'video-resize',   label: 'Redimensionner vidéo',  group: 'Audio / Vidéo' },
  { key: 'subtitles',      label: 'Sous-titres YT',        group: 'Audio / Vidéo' },
  // ── Dev / IA ──────────────────────────────────────────────────────────────
  { key: 'code-convert',   label: 'Convertir code',        group: 'Dev / IA' },
  { key: 'crypto',         label: 'Cryptage',              group: 'Dev / IA' },
  { key: 'json-yaml',      label: 'JSON ↔ YAML',           group: 'Dev / IA' },
  { key: 'csv-json',       label: 'CSV ↔ JSON',            group: 'Dev / IA' },
  { key: 'jwt',            label: 'JWT Decoder',           group: 'Dev / IA' },
  { key: 'url-shorten',    label: 'Raccourcir URL',        group: 'Dev / IA' },
  // ── Image (suite) ─────────────────────────────────────────────────────────
  { key: 'image-resize',   label: 'Redimensionner image',  group: 'Image' },
  // ── Sons ──────────────────────────────────────────────────────────────────
  { key: 'drum-machine',   label: 'Boîte à rythme',        group: 'Sons' },
];

const getTabIcon = (key: Tab) => {
  const icons: Record<Tab, React.ReactNode> = {
    'audio': (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
        <path d="M5 3a2 2 0 012-2h6a2 2 0 012 2v2h2a2 2 0 012 2v10a2 2 0 01-2 2h-2v2a2 2 0 01-2 2H7a2 2 0 01-2-2v-2H3a2 2 0 01-2-2V7a2 2 0 012-2h2V3zM9 4V3h2v1H9zm6 5a1 1 0 11-2 0 1 1 0 012 0z" />
      </svg>
    ),
    'images-to-pdf': (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
        <path d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" />
      </svg>
    ),
    'pdf-to-images': (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
        <path d="M5.5 13a3.5 3.5 0 01-.369-6.98 4 4 0 117.753-1.3A4.5 4.5 0 1113.5 13H11V9.413l1.293 1.293a1 1 0 001.414-1.414l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13H5.5z" />
      </svg>
    ),
    'merge-pdfs': (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M3 4a1 1 0 011-1h4a1 1 0 011 1v2h2V4a1 1 0 011-1h4a1 1 0 011 1v2h2V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2h-2V4a2 2 0 00-2-2H4a2 2 0 00-2 2v2h2V4zm0 8a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1v-2z" clipRule="evenodd" />
      </svg>
    ),
    'split-pdf': (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
      </svg>
    ),
    'html-to-pdf': (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
        <path d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a1 1 0 110 2H4a1 1 0 110-2V4zm4 2a1 1 0 011-1h4a1 1 0 110 2H9a1 1 0 01-1-1zm0 4a1 1 0 011-1h4a1 1 0 110 2H9a1 1 0 01-1-1zm0 4a1 1 0 011-1h4a1 1 0 110 2H9a1 1 0 01-1-1z" />
      </svg>
    ),
    'image-convert': (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
        <path d="M5.5 12a1.5 1.5 0 100-3 1.5 1.5 0 000 3zM13 6.883l-.8 1.6a1 1 0 11-1.786-.894l.5-1a1 1 0 00-.894-1.789H8a1 1 0 000 2h1.382l-.5 1a1 1 0 101.786.894l.8-1.6a1 1 0 001.786 0l.8 1.6a1 1 0 101.786-.894l-.5-1H16a1 1 0 100-2h-2.118z" />
      </svg>
    ),
    'compress-image': (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a1 1 0 102 0V6h10V4a2 2 0 00-2-2H4zm-2 9a1 1 0 011-1h2a1 1 0 110 2H3a1 1 0 01-1-1zm13-3a1 1 0 110 2h-2a1 1 0 110-2h2zm-4 7a1 1 0 110 2H7a1 1 0 110-2h5z" clipRule="evenodd" />
      </svg>
    ),
    'video-to-gif': (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
        <path d="M2 6a2 2 0 012-2h12a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM4 8a1 1 0 011 1v2a1 1 0 11-2 0V9a1 1 0 011-1zm8 0a1 1 0 011 1v2a1 1 0 11-2 0V9a1 1 0 011-1zm4 0a1 1 0 011 1v2a1 1 0 11-2 0V9a1 1 0 011-1z" />
      </svg>
    ),
    'video-to-audio': (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
        <path d="M9 3a1 1 0 011 1v5h2V4a1 1 0 112 0v5a3 3 0 11-6 0V4a1 1 0 011-1zM8 16a4 4 0 108 0H8z" />
      </svg>
    ),
    'video-resize': (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
        <path d="M5 3a2 2 0 00-2 2v2H1a1 1 0 000 2h2v2H1a1 1 0 000 2h2v2a2 2 0 002 2h2v2a1 1 0 102 0v-2h2v2a1 1 0 102 0v-2h2a2 2 0 002-2v-2h2a1 1 0 100-2h-2v-2h2a1 1 0 000-2h-2V5a2 2 0 00-2-2h-2V1a1 1 0 10-2 0v2H7V1a1 1 0 00-2 0v2H5z" />
      </svg>
    ),
    'audio-trim': (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M2 4a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H3a1 1 0 01-1-1V4zm0 8a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H3a1 1 0 01-1-1v-2z" clipRule="evenodd" />
      </svg>
    ),
    'qr-code': (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
        <path d="M3 2a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H4a1 1 0 01-1-1V2zm12 0a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1V2zM3 14a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H4a1 1 0 01-1-1v-4zm10-2a1 1 0 00-1 1v4a1 1 0 001 1h4a1 1 0 001-1v-4a1 1 0 00-1-1h-4z" />
      </svg>
    ),
    'sign-pdf': (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
        <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
      </svg>
    ),
    'voice-isolate': (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clipRule="evenodd" />
      </svg>
    ),
    'compress-pdf': (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a1 1 0 110 2H4a1 1 0 110-2V4zm5 9a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13z" clipRule="evenodd" />
      </svg>
    ),
    'code-convert': (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M12.316 3.051a1 1 0 01.633 1.265l-4 12a1 1 0 11-1.898-.632l4-12a1 1 0 011.265-.633zM5.707 6.293a1 1 0 010 1.414L3.414 10l2.293 2.293a1 1 0 11-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0zm8.586 0a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 11-1.414-1.414L16.586 10l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
      </svg>
    ),
    'crypto': (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
      </svg>
    ),
    'json-yaml': (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zm0 6a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1v-2zm0 6a1 1 0 011-1h6a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
      </svg>
    ),
    'jwt': (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M10 2a8 8 0 100 16A8 8 0 0010 2zm0 3a1 1 0 011 1v3.586l2.707 2.707a1 1 0 01-1.414 1.414l-3-3A1 1 0 019 10V6a1 1 0 011-1z" clipRule="evenodd" />
      </svg>
    ),
    'subtitles': (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M2 5a2 2 0 012-2h12a2 2 0 012 2v10a2 2 0 01-2 2H4a2 2 0 01-2-2V5zm3 5a1 1 0 000 2h6a1 1 0 100-2H5zm0 3a1 1 0 100 2h4a1 1 0 100-2H5z" clipRule="evenodd" />
      </svg>
    ),
    'url-shorten': (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0 1 1 0 00-1.414 1.414 4 4 0 005.656 0l3-3a4 4 0 00-5.656-5.656l-1.5 1.5a1 1 0 101.414 1.414l1.5-1.5zm-5 5a2 2 0 012.828 0 1 1 0 101.414-1.414 4 4 0 00-5.656 0l-3 3a4 4 0 105.656 5.656l1.5-1.5a1 1 0 10-1.414-1.414l-1.5 1.5a2 2 0 11-2.828-2.828l3-3z" clipRule="evenodd" />
      </svg>
    ),
    'bg-remove': (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
        <path d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" />
      </svg>
    ),
    'transcribe': (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clipRule="evenodd" />
      </svg>
    ),
    'pdf-to-word': (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h4a1 1 0 100-2H7z" clipRule="evenodd" />
      </svg>
    ),
    'pdf-select': (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M3 4a1 1 0 000 2h14a1 1 0 100-2H3zm0 4a1 1 0 000 2h14a1 1 0 100-2H3zm0 4a1 1 0 100 2h6a1 1 0 100-2H3z" clipRule="evenodd" />
      </svg>
    ),
    'pdf-fill': (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
        <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
      </svg>
    ),
    'csv-json': (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M3 4a1 1 0 000 2h14a1 1 0 100-2H3zm0 4a1 1 0 000 2h6a1 1 0 100-2H3zm0 4a1 1 0 100 2h6a1 1 0 100-2H3zm10-4a1 1 0 011-1h2a1 1 0 110 2h-2a1 1 0 01-1-1zm1 3a1 1 0 100 2h2a1 1 0 100-2h-2z" clipRule="evenodd" />
      </svg>
    ),
    'image-resize': (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M3 4a1 1 0 011-1h4a1 1 0 010 2H6.414l2.293 2.293a1 1 0 11-1.414 1.414L5 6.414V8a1 1 0 01-2 0V4zm9 1a1 1 0 110-2h4a1 1 0 011 1v4a1 1 0 11-2 0V6.414l-2.293 2.293a1 1 0 11-1.414-1.414L13.586 5H12zm-9 7a1 1 0 112 0v1.586l2.293-2.293a1 1 0 011.414 1.414L6.414 15H8a1 1 0 110 2H4a1 1 0 01-1-1v-4zm13-1a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 110-2h1.586l-2.293-2.293a1 1 0 011.414-1.414L15 13.586V12a1 1 0 011-1z" clipRule="evenodd" />
      </svg>
    ),
    'drum-machine': (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M10 2a6 6 0 00-6 6v1.5a1 1 0 00.4.8L5 11v4a2 2 0 002 2h6a2 2 0 002-2v-4l.6-.7a1 1 0 00.4-.8V8a6 6 0 00-6-6zm-2 9a1 1 0 112 0 1 1 0 01-2 0zm4 0a1 1 0 112 0 1 1 0 01-2 0z" clipRule="evenodd" />
      </svg>
    ),
  };
  return icons[key];
};

export default function ConverterPage() {
  const [activeTab, setActiveTab] = useState<Tab>('audio');
  const [convertedFiles, setConvertedFiles] = useState<ConvertedItem[]>([]);
  const [fileConversions, setFileConversions] = useState<FileConversion[]>([]);
  const [loading, setLoading] = useState(true);
  const [previewingQrId, setPreviewingQrId] = useState<string | null>(null);

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

  const activeTabMeta = tabs.find(t => t.key === activeTab);
  const groups = Array.from(new Set(tabs.map(t => t.group)));

  if (loading) {
    return (
      <div style={{ height: 'calc(100vh - 48px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '.75rem', color: 'var(--faint)', letterSpacing: '.1em' }}>
          CHARGEMENT…
        </span>
      </div>
    );
  }

  /* ── Rail + Panel shell ── */
  return (
    <div style={{ display: 'flex', height: 'calc(100vh - 48px - 57px)' }}>

      {/* ── Left rail ── */}
      <aside style={{
        width: 208,
        flexShrink: 0,
        background: 'var(--bg)',
        borderRight: '1px solid var(--border)',
        overflowY: 'auto',
        paddingTop: '1rem',
        paddingBottom: '2rem',
      }}>
        {groups.map(group => (
          <div key={group}>
            {/* Group label */}
            <div style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '.58rem',
              letterSpacing: '.14em',
              textTransform: 'uppercase',
              color: 'var(--faint)',
              padding: '.9rem 1rem .35rem',
            }}>
              {group}
            </div>
            {/* Items */}
            {tabs.filter(t => t.group === group).map(tab => {
              const isActive = activeTab === tab.key;
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '.6rem',
                    width: '100%',
                    padding: '.38rem 1rem',
                    background: isActive ? 'var(--accent-bg)' : 'transparent',
                    borderTop: 'none',
                    borderRight: 'none',
                    borderBottom: 'none',
                    borderLeft: `2px solid ${isActive ? 'var(--accent)' : 'transparent'}`,
                    color: isActive ? 'var(--accent)' : 'var(--muted)',
                    fontSize: '.78rem',
                    textAlign: 'left',
                    cursor: 'pointer',
                    transition: 'color .1s, background .1s',
                  }}
                  onMouseEnter={e => { if (!isActive) { (e.currentTarget as HTMLElement).style.color = 'var(--text)'; (e.currentTarget as HTMLElement).style.background = 'var(--surface)'; } }}
                  onMouseLeave={e => { if (!isActive) { (e.currentTarget as HTMLElement).style.color = 'var(--muted)'; (e.currentTarget as HTMLElement).style.background = 'transparent'; } }}
                >
                  <span style={{ width: 14, height: 14, flexShrink: 0, opacity: isActive ? 1 : .55 }}>
                    {getTabIcon(tab.key)}
                  </span>
                  <span style={{ lineHeight: 1.3 }}>{tab.label}</span>
                </button>
              );
            })}
          </div>
        ))}
      </aside>

      {/* ── Right panel ── */}
      <div style={{ flex: 1, overflowY: 'auto', background: 'var(--bg)' }}>

        {/* Panel header bar */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '.6rem 1.5rem',
          borderBottom: '1px solid var(--border)',
          background: 'var(--surface)',
          position: 'sticky',
          top: 0,
          zIndex: 10,
        }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '.72rem', color: 'var(--text)', letterSpacing: '.01em' }}>
            {activeTabMeta?.group}{' '}
            <span style={{ color: 'var(--faint)' }}>/</span>{' '}
            <span style={{ color: 'var(--accent)' }}>{activeTabMeta?.label}</span>
          </span>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '.62rem', color: 'var(--faint)', letterSpacing: '.06em' }}>
            {tabs.length} OUTILS
          </span>
        </div>

        {/* Panel content */}
        <div style={{ padding: '1.5rem' }}>

      {/* Tab Content */}
      {activeTab === 'audio' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* YouTube / SoundCloud conversion form */}
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 6, padding: '1.25rem 1.5rem' }}>
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: '.6rem', letterSpacing: '.12em', textTransform: 'uppercase', color: 'var(--faint)', marginBottom: '1rem' }}>
              YouTube / SoundCloud
            </p>
            <YoutubeToMp3Form />
          </div>

          <p style={{ fontFamily: 'var(--font-mono)', fontSize: '.6rem', letterSpacing: '.12em', textTransform: 'uppercase', color: 'var(--faint)' }}>
            Fichiers convertis
          </p>

          {convertedFiles.length === 0 ? (
            <div style={{ padding: '2.5rem', textAlign: 'center', border: '1px dashed var(--border)', borderRadius: 6 }}>
              <p style={{ fontFamily: 'var(--font-mono)', fontSize: '.78rem', color: 'var(--faint)' }}>Aucune conversion pour le moment</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '.75rem' }}>
              {convertedFiles.map(converted => (
                <div
                  key={converted.id}
                  style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 6, padding: '1rem 1.25rem' }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: trimmingFileId === converted.id ? '1rem' : 0 }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: '.85rem', fontWeight: 600, color: 'var(--text)', marginBottom: '.25rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {converted.title}
                      </p>
                      <div style={{ display: 'flex', gap: '.75rem', fontFamily: 'var(--font-mono)', fontSize: '.68rem', color: 'var(--faint)' }}>
                        <span>{new Date(converted.createdAt).toLocaleDateString('fr-FR')}</span>
                        <span>{converted.duration} min</span>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '.4rem', marginLeft: '1rem', flexShrink: 0 }}>
                      <button
                        onClick={() => openTrimmer(converted.id)}
                        style={{
                          fontFamily: 'var(--font-mono)', fontSize: '.68rem', letterSpacing: '.03em',
                          background: trimmingFileId === converted.id ? 'var(--accent-bg)' : 'var(--surface2)',
                          color: trimmingFileId === converted.id ? 'var(--accent)' : 'var(--muted)',
                          border: trimmingFileId === converted.id ? '1px solid var(--accent-border)' : '1px solid var(--border2)',
                          padding: '.3rem .75rem', borderRadius: 4, cursor: 'pointer',
                        }}
                      >
                        Découper
                      </button>
                      <a
                        href={'/audio/converted/' + encodeURIComponent(converted.filename)}
                        download={converted.displayName ?? converted.filename}
                        style={{
                          fontFamily: 'var(--font-mono)', fontSize: '.68rem', letterSpacing: '.03em',
                          background: 'var(--surface2)', color: 'var(--muted)',
                          border: '1px solid var(--border2)',
                          padding: '.3rem .75rem', borderRadius: 4, textDecoration: 'none', cursor: 'pointer',
                        }}
                      >
                        Télécharger
                      </a>
                      <button
                        onClick={async () => {
                          if (!confirm(`Supprimer "${converted.title}" ?`)) return;
                          await fetch(`/api/convert?id=${converted.id}`, { method: 'DELETE' });
                          fetchConvertedFiles();
                        }}
                        style={{
                          fontFamily: 'var(--font-mono)', fontSize: '.68rem',
                          background: 'rgba(248,81,73,.07)', color: '#f85149',
                          border: '1px solid rgba(248,81,73,.25)',
                          padding: '.3rem .6rem', borderRadius: 4, cursor: 'pointer',
                        }}
                        title="Supprimer"
                      >
                        ✕
                      </button>
                    </div>
                  </div>

                  {/* Inline trimmer */}
                  {trimmingFileId === converted.id && (
                    <div style={{ marginTop: '1rem', background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 4, padding: '1rem', display: 'flex', flexDirection: 'column', gap: '.75rem' }}>
                      <audio
                        ref={trimAudioRef}
                        controls
                        src={'/audio/converted/' + encodeURIComponent(converted.filename)}
                        onLoadedMetadata={handleTrimLoadedMetadata}
                        className="w-full"
                      />

                      {trimDuration > 0 && (
                        <>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--font-mono)', fontSize: '.65rem', color: 'var(--faint)' }}>
                            <span>0:00.0</span>
                            <span>{formatTime(trimDuration)}</span>
                          </div>

                          {/* Dual-range slider */}
                          <div className="relative h-8 select-none">
                            <div className="absolute inset-x-0 top-3 h-2 rounded-full" style={{ background: 'var(--border2)' }} />
                            <div
                              className="absolute top-3 h-2 rounded-full pointer-events-none"
                              style={{ left: `${trimLeftPct}%`, right: `${trimRightPct}%`, background: 'var(--accent)' }}
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
                              className="absolute inset-x-0 top-0 w-full h-8 appearance-none bg-transparent pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[var(--accent)] [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-[var(--bg)] [&::-webkit-slider-thumb]:cursor-grab [&::-webkit-slider-thumb]:shadow-md [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-[var(--accent)] [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-solid [&::-moz-range-thumb]:border-[var(--bg)] [&::-moz-range-thumb]:cursor-grab"
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
                              className="absolute inset-x-0 top-0 w-full h-8 appearance-none bg-transparent pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[var(--muted)] [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-[var(--bg)] [&::-webkit-slider-thumb]:cursor-grab [&::-webkit-slider-thumb]:shadow-md [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-[var(--muted)] [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-solid [&::-moz-range-thumb]:border-[var(--bg)] [&::-moz-range-thumb]:cursor-grab"
                            />
                          </div>

                          {/* Time display */}
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '.5rem' }}>
                            {[
                              { label: 'Début', value: formatTime(trimStart), accent: true },
                              { label: 'Durée', value: formatTime(trimEnd - trimStart), accent: false },
                              { label: 'Fin', value: formatTime(trimEnd), accent: false },
                            ].map(({ label, value, accent }) => (
                              <div key={label} style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 4, padding: '.5rem', textAlign: 'center' }}>
                                <p style={{ fontFamily: 'var(--font-mono)', fontSize: '.6rem', color: 'var(--faint)', marginBottom: '.25rem' }}>{label}</p>
                                <p style={{ fontFamily: 'var(--font-mono)', fontSize: '.78rem', fontWeight: 600, color: accent ? 'var(--accent)' : 'var(--text)' }}>{value}</p>
                              </div>
                            ))}
                          </div>

                          {/* Fine-tune inputs */}
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '.75rem' }}>
                            <div>
                              <label style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: '.62rem', color: 'var(--faint)', marginBottom: '.3rem' }}>Début (s)</label>
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
                                style={{ width: '100%', background: 'var(--bg)', border: '1px solid var(--border2)', borderRadius: 4, padding: '.4rem .6rem', color: 'var(--text)', fontFamily: 'var(--font-mono)', fontSize: '.78rem' }}
                              />
                            </div>
                            <div>
                              <label style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: '.62rem', color: 'var(--faint)', marginBottom: '.3rem' }}>Fin (s)</label>
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
                                style={{ width: '100%', background: 'var(--bg)', border: '1px solid var(--border2)', borderRadius: 4, padding: '.4rem .6rem', color: 'var(--text)', fontFamily: 'var(--font-mono)', fontSize: '.78rem' }}
                              />
                            </div>
                          </div>

                          {/* Action buttons */}
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '.5rem' }}>
                            <button
                              onClick={isTrimPreviewing ? stopTrimPreview : handleTrimPreview}
                              style={{
                                fontFamily: 'var(--font-mono)', fontSize: '.72rem', letterSpacing: '.03em',
                                background: isTrimPreviewing ? 'var(--surface)' : 'var(--surface)',
                                color: isTrimPreviewing ? 'var(--accent)' : 'var(--muted)',
                                border: isTrimPreviewing ? '1px solid var(--accent-border)' : '1px solid var(--border2)',
                                padding: '.5rem', borderRadius: 4, cursor: 'pointer',
                              }}
                            >
                              {isTrimPreviewing ? 'Arrêter' : 'Prévisualiser'}
                            </button>
                            <button
                              onClick={() => handleTrimSubmit(converted.filename)}
                              disabled={isTrimming}
                              style={{
                                fontFamily: 'var(--font-mono)', fontSize: '.72rem', letterSpacing: '.03em',
                                background: 'var(--accent-bg)', color: 'var(--accent)',
                                border: '1px solid var(--accent-border)',
                                padding: '.5rem', borderRadius: 4, cursor: isTrimming ? 'not-allowed' : 'pointer',
                                opacity: isTrimming ? .5 : 1,
                              }}
                            >
                              {isTrimming ? 'Découpe…' : 'Découper'}
                            </button>
                          </div>

                          {/* Trimmed result */}
                          {trimmedUrl && (
                            <div style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 4, padding: '.75rem', display: 'flex', flexDirection: 'column', gap: '.5rem' }}>
                              <p style={{ fontFamily: 'var(--font-mono)', fontSize: '.68rem', color: 'var(--accent)' }}>Extrait prêt</p>
                              <audio controls src={trimmedUrl} className="w-full" />
                              <a
                                href={trimmedUrl}
                                download
                                style={{
                                  display: 'block', textAlign: 'center',
                                  fontFamily: 'var(--font-mono)', fontSize: '.7rem', letterSpacing: '.03em',
                                  background: 'var(--surface2)', color: 'var(--muted)',
                                  border: '1px solid var(--border2)',
                                  padding: '.4rem', borderRadius: 4, textDecoration: 'none',
                                }}
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
        <div className="space-y-4">
          <h2 style={{fontSize:".85rem",fontWeight:600,color:"var(--text)",fontFamily:"var(--font-mono)",letterSpacing:"-.01em"}}>Images vers PDF</h2>
          <div className="pt-4">
            <ImageToPdfForm onConversionDone={fetchFileConversions} />
          </div>
        </div>
      )}

      {activeTab === 'merge-pdfs' && (
        <div className="space-y-4">
          <h2 style={{fontSize:".85rem",fontWeight:600,color:"var(--text)",fontFamily:"var(--font-mono)",letterSpacing:"-.01em"}}>Fusionner des PDFs</h2>
          <div className="pt-4">
            <MergePdfsForm onConversionDone={fetchFileConversions} />
          </div>
        </div>
      )}

      {activeTab === 'image-convert' && (
        <div className="space-y-4">
          <h2 style={{fontSize:".85rem",fontWeight:600,color:"var(--text)",fontFamily:"var(--font-mono)",letterSpacing:"-.01em"}}>Convertir le format d'une image</h2>
          <div className="pt-4">
            <ImageConvertForm onConversionDone={fetchFileConversions} />
          </div>
        </div>
      )}

      {activeTab === 'pdf-to-images' && (
        <div className="space-y-4">
          <h2 style={{fontSize:".85rem",fontWeight:600,color:"var(--text)",fontFamily:"var(--font-mono)",letterSpacing:"-.01em"}}>PDF vers Images</h2>
          <div className="pt-4">
            <PdfToImagesForm onConversionDone={fetchFileConversions} />
          </div>
        </div>
      )}

      {activeTab === 'split-pdf' && (
        <div className="space-y-4">
          <h2 style={{fontSize:".85rem",fontWeight:600,color:"var(--text)",fontFamily:"var(--font-mono)",letterSpacing:"-.01em"}}>Découper un PDF</h2>
          <div className="pt-4">
            <SplitPdfForm onConversionDone={fetchFileConversions} />
          </div>
        </div>
      )}

      {activeTab === 'compress-image' && (
        <div className="space-y-4">
          <h2 style={{fontSize:".85rem",fontWeight:600,color:"var(--text)",fontFamily:"var(--font-mono)",letterSpacing:"-.01em"}}>Compresser une image</h2>
          <div className="pt-4">
            <CompressImageForm onConversionDone={fetchFileConversions} />
          </div>
        </div>
      )}

      {activeTab === 'video-to-gif' && (
        <div className="space-y-4">
          <h2 style={{fontSize:".85rem",fontWeight:600,color:"var(--text)",fontFamily:"var(--font-mono)",letterSpacing:"-.01em"}}>Vidéo vers GIF</h2>
          <div className="pt-4">
            <VideoToGifForm onConversionDone={fetchFileConversions} />
          </div>
        </div>
      )}

      {activeTab === 'html-to-pdf' && (
        <div className="space-y-4">
          <h2 style={{fontSize:".85rem",fontWeight:600,color:"var(--text)",fontFamily:"var(--font-mono)",letterSpacing:"-.01em"}}>HTML / URL vers PDF</h2>
          <div className="pt-4">
            <HtmlToPdfForm onConversionDone={fetchFileConversions} />
          </div>
        </div>
      )}

      {activeTab === 'video-to-audio' && (
        <div className="space-y-4">
          <h2 style={{fontSize:".85rem",fontWeight:600,color:"var(--text)",fontFamily:"var(--font-mono)",letterSpacing:"-.01em"}}>Extraire l'audio d'une vidéo</h2>
          <div className="pt-4">
            <VideoToAudioForm onConversionDone={fetchFileConversions} />
          </div>
        </div>
      )}

      {activeTab === 'video-resize' && (
        <div className="space-y-4">
          <h2 style={{fontSize:".85rem",fontWeight:600,color:"var(--text)",fontFamily:"var(--font-mono)",letterSpacing:"-.01em"}}>Redimensionner / Compresser une vidéo</h2>
          <div className="pt-4">
            <VideoResizeForm onConversionDone={fetchFileConversions} />
          </div>
        </div>
      )}

      {activeTab === 'audio-trim' && (
        <div className="space-y-4">
          <h2 style={{fontSize:".85rem",fontWeight:600,color:"var(--text)",fontFamily:"var(--font-mono)",letterSpacing:"-.01em"}}>Découper un fichier audio</h2>
          <div className="pt-4">
            <AudioTrimForm onConversionDone={fetchFileConversions} />
          </div>
        </div>
      )}

      {activeTab === 'qr-code' && (
        <div className="space-y-4">
          <h2 style={{fontSize:".85rem",fontWeight:600,color:"var(--text)",fontFamily:"var(--font-mono)",letterSpacing:"-.01em"}}>Générateur de QR Code</h2>
          <div className="pt-4">
            <QrCodeForm onConversionDone={fetchFileConversions} />
          </div>
        </div>
      )}

      {activeTab === 'sign-pdf' && (
        <div className="space-y-4">
          <h2 style={{fontSize:".85rem",fontWeight:600,color:"var(--text)",fontFamily:"var(--font-mono)",letterSpacing:"-.01em"}}>Signer un PDF</h2>
          <div className="pt-4">
            <SignPdfForm onConversionDone={fetchFileConversions} />
          </div>
        </div>
      )}

      {activeTab === 'voice-isolate' && (
        <div className="space-y-4">
          <h2 style={{fontSize:".85rem",fontWeight:600,color:"var(--text)",fontFamily:"var(--font-mono)",letterSpacing:"-.01em"}}>Isoler la voix</h2>
          <div className="pt-4">
            <VoiceIsolateForm onConversionDone={fetchFileConversions} />
          </div>
        </div>
      )}

      {activeTab === 'compress-pdf' && (
        <div className="space-y-4">
          <h2 style={{fontSize:".85rem",fontWeight:600,color:"var(--text)",fontFamily:"var(--font-mono)",letterSpacing:"-.01em"}}>Compresser un PDF</h2>
          <div className="pt-4">
            <CompressPdfForm onConversionDone={fetchFileConversions} />
          </div>
        </div>
      )}

      {activeTab === 'code-convert' && (
        <div className="space-y-4">
          <div>
            <h2 style={{fontSize:".85rem",fontWeight:600,color:"var(--text)",fontFamily:"var(--font-mono)",letterSpacing:"-.01em"}}>Convertisseur de code</h2>
            <p style={{fontSize:".72rem",color:"var(--muted)",marginTop:".2rem"}}>Traduit votre code d'un langage vers un autre via Claude AI.</p>
          </div>
          <div className="pt-4">
            <CodeConverterForm />
          </div>
        </div>
      )}

      {activeTab === 'crypto' && (
        <div className="space-y-4">
          <div>
            <h2 style={{fontSize:".85rem",fontWeight:600,color:"var(--text)",fontFamily:"var(--font-mono)",letterSpacing:"-.01em"}}>Outils de cryptage</h2>
            <p style={{fontSize:".72rem",color:"var(--muted)",marginTop:".2rem"}}>Hachage (MD5, SHA-256…), encodage (Base64, Hex…), HMAC et bcrypt.</p>
          </div>
          <div className="pt-4">
            <CryptoToolsForm />
          </div>
        </div>
      )}

      {activeTab === 'json-yaml' && (
        <div className="space-y-4">
          <div>
            <h2 style={{fontSize:".85rem",fontWeight:600,color:"var(--text)",fontFamily:"var(--font-mono)",letterSpacing:"-.01em"}}>JSON ↔ YAML</h2>
            <p style={{fontSize:".72rem",color:"var(--muted)",marginTop:".2rem"}}>Convertissez vos fichiers de configuration entre JSON et YAML.</p>
          </div>
          <div className="pt-4">
            <JsonYamlForm />
          </div>
        </div>
      )}

      {activeTab === 'jwt' && (
        <div className="space-y-4">
          <div>
            <h2 style={{fontSize:".85rem",fontWeight:600,color:"var(--text)",fontFamily:"var(--font-mono)",letterSpacing:"-.01em"}}>JWT Decoder</h2>
            <p style={{fontSize:".72rem",color:"var(--muted)",marginTop:".2rem"}}>Décodez et inspectez un token JWT (header, payload, expiration).</p>
          </div>
          <div className="pt-4">
            <JwtDecoderForm />
          </div>
        </div>
      )}

      {activeTab === 'subtitles' && (
        <div className="space-y-4">
          <div>
            <h2 style={{fontSize:".85rem",fontWeight:600,color:"var(--text)",fontFamily:"var(--font-mono)",letterSpacing:"-.01em"}}>Sous-titres YouTube</h2>
            <p style={{fontSize:".72rem",color:"var(--muted)",marginTop:".2rem"}}>Extrayez les sous-titres d'une vidéo YouTube en .srt ou .vtt.</p>
          </div>
          <div className="pt-4">
            <SubtitlesForm />
          </div>
        </div>
      )}

      {activeTab === 'url-shorten' && (
        <div className="space-y-4">
          <div>
            <h2 style={{fontSize:".85rem",fontWeight:600,color:"var(--text)",fontFamily:"var(--font-mono)",letterSpacing:"-.01em"}}>Raccourcisseur d'URL</h2>
            <p style={{fontSize:".72rem",color:"var(--muted)",marginTop:".2rem"}}>Créez des liens courts qui redirigent vers vos URLs longues.</p>
          </div>
          <div className="pt-4">
            <UrlShortenerForm />
          </div>
        </div>
      )}

      {activeTab === 'bg-remove' && (
        <div className="space-y-4">
          <div>
            <h2 style={{fontSize:".85rem",fontWeight:600,color:"var(--text)",fontFamily:"var(--font-mono)",letterSpacing:"-.01em"}}>Suppression de fond</h2>
            <p style={{fontSize:".72rem",color:"var(--muted)",marginTop:".2rem"}}>Supprimez l'arrière-plan d'une image automatiquement.</p>
          </div>
          <div className="pt-4">
            <BgRemoveForm />
          </div>
        </div>
      )}

      {activeTab === 'transcribe' && (
        <div className="space-y-4">
          <div>
            <h2 style={{fontSize:".85rem",fontWeight:600,color:"var(--text)",fontFamily:"var(--font-mono)",letterSpacing:"-.01em"}}>Transcription audio</h2>
            <p style={{fontSize:".72rem",color:"var(--muted)",marginTop:".2rem"}}>Convertissez un fichier audio ou vidéo en texte via Whisper.</p>
          </div>
          <div className="pt-4">
            <TranscribeForm />
          </div>
        </div>
      )}

      {activeTab === 'pdf-to-word' && (
        <div className="space-y-4">
          <div>
            <h2 style={{fontSize:".85rem",fontWeight:600,color:"var(--text)",fontFamily:"var(--font-mono)",letterSpacing:"-.01em"}}>PDF → Word / Excel</h2>
            <p style={{fontSize:".72rem",color:"var(--muted)",marginTop:".2rem"}}>Extrayez le texte d'un PDF vers un document Word (.docx) ou Excel (.xlsx).</p>
          </div>
          <div className="pt-4">
            <PdfToWordForm />
          </div>
        </div>
      )}

      {activeTab === 'pdf-select' && (
        <div className="space-y-4">
          <div>
            <h2 style={{fontSize:".85rem",fontWeight:600,color:"var(--text)",fontFamily:"var(--font-mono)",letterSpacing:"-.01em"}}>Sélection de pages PDF</h2>
            <p style={{fontSize:".72rem",color:"var(--muted)",marginTop:".2rem"}}>Choisissez précisément les pages à extraire depuis un PDF.</p>
          </div>
          <div className="pt-4">
            <PdfPageSelectForm />
          </div>
        </div>
      )}

      {activeTab === 'pdf-fill' && (
        <div className="space-y-4">
          <div>
            <h2 style={{fontSize:".85rem",fontWeight:600,color:"var(--text)",fontFamily:"var(--font-mono)",letterSpacing:"-.01em"}}>Remplir un PDF</h2>
            <p style={{fontSize:".72rem",color:"var(--muted)",marginTop:".2rem"}}>Ajoutez du texte, des images et des signatures directement sur les pages du PDF.</p>
          </div>
          <div className="pt-4">
            <PdfFillForm />
          </div>
        </div>
      )}

      {activeTab === 'csv-json' && (
        <div className="space-y-4">
          <div>
            <h2 style={{fontSize:".85rem",fontWeight:600,color:"var(--text)",fontFamily:"var(--font-mono)",letterSpacing:"-.01em"}}>CSV ↔ JSON</h2>
            <p style={{fontSize:".72rem",color:"var(--muted)",marginTop:".2rem"}}>Convertissez un fichier CSV en JSON ou un tableau JSON en CSV.</p>
          </div>
          <div className="pt-4">
            <CsvJsonForm />
          </div>
        </div>
      )}

      {activeTab === 'image-resize' && (
        <div className="space-y-4">
          <div>
            <h2 style={{fontSize:".85rem",fontWeight:600,color:"var(--text)",fontFamily:"var(--font-mono)",letterSpacing:"-.01em"}}>Redimensionner une image</h2>
            <p style={{fontSize:".72rem",color:"var(--muted)",marginTop:".2rem"}}>Modifiez la taille d&apos;une image en pixels, avec contrôle du format et de la qualité.</p>
          </div>
          <div className="pt-4">
            <ImageResizeForm />
          </div>
        </div>
      )}

      {activeTab === 'drum-machine' && (
        <div className="space-y-4">
          <div>
            <h2 style={{fontSize:".85rem",fontWeight:600,color:"var(--text)",fontFamily:"var(--font-mono)",letterSpacing:"-.01em"}}>Boîte à rythme</h2>
            <p style={{fontSize:".72rem",color:"var(--muted)",marginTop:".2rem"}}>Synthétisez des kicks, snares, claps et hi-hats façon 808/909, réglables et exportables en WAV pour Ableton.</p>
          </div>
          <div className="pt-4">
            <DrumMachineForm />
          </div>
        </div>
      )}

      {/* File conversion history (for non-audio tabs) */}
      {activeTab !== 'audio' && filteredConversions.length > 0 && (
        <div style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '.75rem' }}>
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: '.6rem', letterSpacing: '.12em', textTransform: 'uppercase', color: 'var(--faint)' }}>Historique</p>
          {filteredConversions.map(conversion => (
            <div
              key={conversion.id}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 6, padding: '.75rem 1rem' }}
            >
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: '.82rem', fontWeight: 600, color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginBottom: '.2rem' }}>
                  {conversion.title}
                </p>
                <div style={{ display: 'flex', gap: '.75rem', fontFamily: 'var(--font-mono)', fontSize: '.65rem', color: 'var(--faint)' }}>
                  <span>{new Date(conversion.createdAt).toLocaleDateString('fr-FR')}</span>
                  <span>{formatFileSize(conversion.fileSize)}</span>
                  <span style={{ background: 'var(--surface2)', border: '1px solid var(--border)', padding: '.1rem .4rem', borderRadius: 3 }}>
                    {conversion.type}
                  </span>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '.4rem', flexShrink: 0 }}>
                {conversion.type === 'qr-code' && (
                  <button
                    onClick={() => setPreviewingQrId(conversion.id)}
                    style={{
                      fontFamily: 'var(--font-mono)', fontSize: '.68rem', letterSpacing: '.03em',
                      background: 'var(--surface2)', color: 'var(--muted)',
                      border: '1px solid var(--border2)',
                      padding: '.3rem .75rem', borderRadius: 4, cursor: 'pointer',
                    }}
                  >
                    Voir
                  </button>
                )}
                <a
                  href={`/converted/${conversion.outputFilename}`}
                  download
                  style={{
                    fontFamily: 'var(--font-mono)', fontSize: '.68rem', letterSpacing: '.03em',
                    background: 'var(--surface2)', color: 'var(--muted)',
                    border: '1px solid var(--border2)',
                    padding: '.3rem .75rem', borderRadius: 4, textDecoration: 'none',
                  }}
                >
                  Télécharger
                </a>
                <button
                  onClick={() => handleDeleteFileConversion(conversion.id)}
                  style={{
                    fontFamily: 'var(--font-mono)', fontSize: '.68rem',
                    background: 'rgba(248,81,73,.07)', color: '#f85149',
                    border: '1px solid rgba(248,81,73,.25)',
                    padding: '.3rem .6rem', borderRadius: 4, cursor: 'pointer',
                  }}
                >
                  ✕
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* QR Code Preview Modal */}
      {previewingQrId && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.8)', backdropFilter: 'blur(4px)', zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }} onClick={() => setPreviewingQrId(null)}>
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, padding: '1.5rem', maxWidth: 400, width: '100%' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
              <p style={{ fontFamily: 'var(--font-mono)', fontSize: '.72rem', letterSpacing: '.06em', textTransform: 'uppercase', color: 'var(--faint)' }}>Aperçu QR Code</p>
              <button
                onClick={() => setPreviewingQrId(null)}
                style={{ fontFamily: 'var(--font-mono)', fontSize: '.85rem', color: 'var(--faint)', background: 'none', border: 'none', cursor: 'pointer', lineHeight: 1 }}
              >
                ✕
              </button>
            </div>
            {fileConversions.find(c => c.id === previewingQrId) && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '.75rem' }}>
                <div style={{ background: '#fff', padding: '1rem', borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <img
                    src={`/converted/${fileConversions.find(c => c.id === previewingQrId)?.outputFilename}`}
                    alt="QR Code Preview"
                    style={{ maxWidth: 280, maxHeight: 280 }}
                  />
                </div>
                <p style={{ fontFamily: 'var(--font-mono)', fontSize: '.72rem', color: 'var(--faint)' }}>
                  {fileConversions.find(c => c.id === previewingQrId)?.title}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

        </div>
      </div>
    </div>
  );
}
