'use client';

import { useEffect, useRef, useState } from 'react';

interface SignPdfFormProps {
  onConversionDone?: () => void;
}

export default function SignPdfForm({ onConversionDone }: SignPdfFormProps) {
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [sigFile, setSigFile] = useState<File | null>(null);
  const [sigPreviewUrl, setSigPreviewUrl] = useState<string | null>(null);
  const [pages, setPages] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [sigPos, setSigPos] = useState({ x: 0.05, y: 0.05 });
  const [sigWidth, setSigWidth] = useState(0.3);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [sigAspect, setSigAspect] = useState(1);
  const [isLoadingPages, setIsLoadingPages] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Pre-load the default signature from public/autograph.png
    fetch('/autograph.png')
      .then(r => r.blob())
      .then(blob => {
        const file = new File([blob], 'autograph.png', { type: 'image/png' });
        setSigFile(file);
        setSigPreviewUrl('/autograph.png');
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const handleMouseUp = () => setIsDragging(false);
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('touchend', handleMouseUp);
    return () => {
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchend', handleMouseUp);
    };
  }, []);

  const handlePdfChange = async (file: File) => {
    setPdfFile(file);
    setPages([]);
    setCurrentPage(1);
    setResultUrl(null);
    setError(null);
    setIsLoadingPages(true);

    const formData = new FormData();
    formData.append('file', file);
    try {
      const res = await fetch('/api/pdf-preview', { method: 'POST', body: formData });
      const data = await res.json();
      if (data.pages) setPages(data.pages);
      else setError('Impossible de charger les pages du PDF.');
    } catch {
      setError('Erreur lors du chargement du PDF.');
    } finally {
      setIsLoadingPages(false);
    }
  };

  const handleSigChange = (file: File) => {
    setSigFile(file);
    const url = URL.createObjectURL(file);
    setSigPreviewUrl(url);
  };

  const handleSigImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    setSigAspect(img.naturalHeight / img.naturalWidth);
  };

  const handleContainerMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    // only start drag if clicking on the signature, handled by sig onMouseDown
    e.preventDefault();
  };

  const handleSigMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!containerRef.current) return;
    const sigEl = e.currentTarget.getBoundingClientRect();
    setDragOffset({
      x: e.clientX - sigEl.left,
      y: e.clientY - sigEl.top,
    });
    setIsDragging(true);
  };

  const handleSigTouchStart = (e: React.TouchEvent) => {
    e.stopPropagation();
    if (!containerRef.current || !e.touches[0]) return;
    const rect = containerRef.current.getBoundingClientRect();
    const sigLeft = sigPos.x * rect.width;
    const sigTop = sigPos.y * rect.height;
    setDragOffset({
      x: e.touches[0].clientX - rect.left - sigLeft,
      y: e.touches[0].clientY - rect.top - sigTop,
    });
    setIsDragging(true);
  };

  const handleContainerMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const newX = (e.clientX - rect.left - dragOffset.x) / rect.width;
    const newY = (e.clientY - rect.top - dragOffset.y) / rect.height;
    const sigH = sigWidth * sigAspect;
    setSigPos({
      x: Math.max(0, Math.min(newX, 1 - sigWidth)),
      y: Math.max(0, Math.min(newY, 1 - sigH)),
    });
  };

  const handleContainerTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!isDragging || !containerRef.current || !e.touches[0]) return;
    e.preventDefault();
    const rect = containerRef.current.getBoundingClientRect();
    const newX = (e.touches[0].clientX - rect.left - dragOffset.x) / rect.width;
    const newY = (e.touches[0].clientY - rect.top - dragOffset.y) / rect.height;
    const sigH = sigWidth * sigAspect;
    setSigPos({
      x: Math.max(0, Math.min(newX, 1 - sigWidth)),
      y: Math.max(0, Math.min(newY, 1 - sigH)),
    });
  };

  const handleSubmit = async () => {
    if (!pdfFile || !sigFile) return;
    setIsSubmitting(true);
    setResultUrl(null);
    setError(null);

    const formData = new FormData();
    formData.append('type', 'sign-pdf');
    formData.append('files', pdfFile);
    formData.append('signatureFile', sigFile);
    formData.append('pageNumber', currentPage.toString());
    formData.append('x', sigPos.x.toString());
    formData.append('y', sigPos.y.toString());
    formData.append('widthPercent', sigWidth.toString());

    try {
      const res = await fetch('/api/file-convert', { method: 'POST', body: formData });
      const data = await res.json();
      if (data.success) {
        setResultUrl(data.downloadUrl);
        onConversionDone?.();
      } else {
        setError(data.error || 'Erreur lors de la signature');
      }
    } catch {
      setError('Erreur réseau');
    } finally {
      setIsSubmitting(false);
    }
  };

  const canSign = pdfFile && sigFile && pages.length > 0;

  return (
    <div className="space-y-6">
      {/* Upload row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* PDF upload */}
        <label className="flex flex-col items-center gap-3 border-2 border-dashed border-gray-600 hover:border-blue-500 rounded-xl p-6 cursor-pointer transition">
          <svg className="w-8 h-8 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
            <path d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" />
          </svg>
          <span className="text-sm text-gray-300 text-center">
            {pdfFile ? pdfFile.name : 'Sélectionner le PDF à signer'}
          </span>
          {isLoadingPages && <span className="text-xs text-blue-400 animate-pulse">Chargement des pages...</span>}
          <input type="file" accept=".pdf,application/pdf" className="hidden" onChange={e => e.target.files?.[0] && handlePdfChange(e.target.files[0])} />
        </label>

        {/* Signature upload */}
        <label className="flex flex-col items-center gap-3 border-2 border-dashed border-gray-600 hover:border-purple-500 rounded-xl p-6 cursor-pointer transition">
          {sigPreviewUrl ? (
            <img src={sigPreviewUrl} alt="Signature" className="max-h-16 object-contain bg-white rounded px-2" onLoad={handleSigImageLoad} />
          ) : (
            <svg className="w-8 h-8 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
              <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
            </svg>
          )}
          <span className="text-sm text-gray-300 text-center">
            {sigFile ? sigFile.name : 'Image de votre signature (PNG/JPG)'}
          </span>
          <input type="file" accept="image/*" className="hidden" onChange={e => e.target.files?.[0] && handleSigChange(e.target.files[0])} />
        </label>
      </div>

      {/* Page viewer with draggable signature */}
      {pages.length > 0 && sigPreviewUrl && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-400">
              Page <span className="text-white font-semibold">{currentPage}</span> / {pages.length}
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 bg-gray-700 hover:bg-gray-600 disabled:opacity-40 rounded text-sm transition"
              >
                ←
              </button>
              <button
                onClick={() => setCurrentPage(p => Math.min(pages.length, p + 1))}
                disabled={currentPage === pages.length}
                className="px-3 py-1 bg-gray-700 hover:bg-gray-600 disabled:opacity-40 rounded text-sm transition"
              >
                →
              </button>
            </div>
          </div>

          {/* Signature size control */}
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-400 whitespace-nowrap">Taille signature</span>
            <input
              type="range" min={0.05} max={0.8} step={0.01}
              value={sigWidth}
              onChange={e => setSigWidth(parseFloat(e.target.value))}
              className="flex-1 accent-purple-500"
            />
            <span className="text-xs text-gray-400 w-10 text-right">{Math.round(sigWidth * 100)}%</span>
          </div>

          {/* Page canvas with draggable signature */}
          <div
            ref={containerRef}
            className="relative select-none overflow-hidden rounded-lg border border-gray-600 bg-white"
            style={{ cursor: isDragging ? 'grabbing' : 'default' }}
            onMouseMove={handleContainerMouseMove}
            onTouchMove={handleContainerTouchMove}
            onMouseDown={handleContainerMouseDown}
          >
            <img
              src={pages[currentPage - 1]}
              alt={`Page ${currentPage}`}
              className="w-full h-auto block"
              draggable={false}
            />

            {/* Draggable signature overlay */}
            <img
              src={sigPreviewUrl}
              alt="Signature"
              draggable={false}
              onMouseDown={handleSigMouseDown}
              onTouchStart={handleSigTouchStart}
              className="absolute pointer-events-auto"
              style={{
                left: `${sigPos.x * 100}%`,
                top: `${sigPos.y * 100}%`,
                width: `${sigWidth * 100}%`,
                cursor: isDragging ? 'grabbing' : 'grab',
                userSelect: 'none',
                filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))',
              }}
            />

            <div className="absolute bottom-2 left-2 bg-black/60 text-white text-xs px-2 py-1 rounded pointer-events-none">
              Glissez la signature pour la positionner
            </div>
          </div>
        </div>
      )}

      {/* Show page viewer hint when PDF loaded but no signature yet */}
      {pages.length > 0 && !sigPreviewUrl && (
        <p className="text-sm text-gray-400 text-center py-4">
          Ajoutez une image de signature pour continuer
        </p>
      )}

      {error && <p className="text-red-400 text-sm">{error}</p>}

      {/* Submit */}
      <button
        onClick={handleSubmit}
        disabled={!canSign || isSubmitting}
        className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 disabled:opacity-40 text-white font-semibold rounded-xl transition"
      >
        {isSubmitting ? 'Signature en cours...' : 'Signer le PDF'}
      </button>

      {resultUrl && (
        <div className="space-y-3 bg-gray-700/30 rounded-xl p-4">
          <p className="text-green-400 font-semibold text-sm">PDF signé avec succès !</p>
          <a
            href={resultUrl}
            download
            className="block text-center bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg font-semibold transition"
          >
            Télécharger le PDF signé
          </a>
        </div>
      )}
    </div>
  );
}
