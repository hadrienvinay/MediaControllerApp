'use client';

import { useState, useRef, useCallback, useEffect } from 'react';

// ── Types ──────────────────────────────────────────────────────────────────

type TextEl = {
  id: string; kind: 'text'; page: number;
  x: number; y: number;       // 0-1 fractions
  text: string; fontSize: number; color: string;
};
type ImgEl = {
  id: string; kind: 'image' | 'signature'; page: number;
  x: number; y: number;       // 0-1 fractions
  dataUrl: string; width: number; aspectRatio: number;
};
type El = TextEl | ImgEl;

type PageDim = { width: number; height: number };
type Tool = 'text' | 'image' | 'signature';

const COLORS = ['#000000', '#1d4ed8', '#dc2626', '#16a34a', '#9333ea', '#d97706'];

// ── Helpers ────────────────────────────────────────────────────────────────

function uid() { return Math.random().toString(36).slice(2); }

function imgToDataUrl(file: File): Promise<{ dataUrl: string; aspectRatio: number }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => resolve({ dataUrl: reader.result as string, aspectRatio: img.height / img.width });
      img.onerror = reject;
      img.src = reader.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// ── Component ──────────────────────────────────────────────────────────────

export default function PdfFillForm() {
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pages, setPages] = useState<string[]>([]);           // data URLs from /api/pdf-preview
  const [dims, setDims] = useState<PageDim[]>([]);            // pt dimensions from /api/pdf-fill
  const [currentPage, setCurrentPage] = useState(1);
  const [elements, setElements] = useState<El[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [tool, setTool] = useState<Tool>('text');
  const [isLoadingPages, setIsLoadingPages] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<{ url: string; originalName: string } | null>(null);
  const [error, setError] = useState('');
  const [dragging, setDragging] = useState<{ id: string; ox: number; oy: number } | null>(null);
  const [containerW, setContainerW] = useState(0);

  const containerRef = useRef<HTMLDivElement>(null);
  const imgInputRef = useRef<HTMLInputElement>(null);
  const sigInputRef = useRef<HTMLInputElement>(null);

  // Measure container width when pages load
  useEffect(() => {
    if (!containerRef.current) return;
    const obs = new ResizeObserver(([e]) => setContainerW(e.contentRect.width));
    obs.observe(containerRef.current);
    return () => obs.disconnect();
  }, [pages.length]);

  const selected = elements.find(e => e.id === selectedId) ?? null;
  const pageEls = elements.filter(e => e.page === currentPage);
  const dim = dims[currentPage - 1];
  const scale = dim && containerW ? containerW / dim.width : 1;

  const loadPdf = async (file: File) => {
    setPdfFile(file);
    setPages([]);
    setDims([]);
    setElements([]);
    setSelectedId(null);
    setResult(null);
    setError('');
    setIsLoadingPages(true);
    try {
      const [previewRes, infoRes] = await Promise.all([
        fetch('/api/pdf-preview', { method: 'POST', body: (() => { const fd = new FormData(); fd.append('file', file); return fd; })() }),
        fetch('/api/pdf-fill', { method: 'POST', body: (() => { const fd = new FormData(); fd.append('file', file); fd.append('operation', 'info'); return fd; })() }),
      ]);
      const previewData = await previewRes.json();
      const infoData = await infoRes.json();
      if (previewData.pages) setPages(previewData.pages);
      else setError('Impossible de charger les aperçus du PDF.');
      if (infoData.dimensions) setDims(infoData.dimensions);
    } catch {
      setError('Erreur lors du chargement.');
    } finally {
      setIsLoadingPages(false);
    }
  };

  // ── Canvas click → add element ───────────────────────────────────────────

  const handleCanvasClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current || dragging) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;

    if (tool === 'text') {
      const el: TextEl = { id: uid(), kind: 'text', page: currentPage, x, y, text: '', fontSize: 14, color: '#000000' };
      setElements(prev => [...prev, el]);
      setSelectedId(el.id);
    } else if (tool === 'image') {
      imgInputRef.current?.click();
      // Store pending position in dataset
      if (imgInputRef.current) { imgInputRef.current.dataset.px = String(x); imgInputRef.current.dataset.py = String(y); }
    } else if (tool === 'signature') {
      sigInputRef.current?.click();
      if (sigInputRef.current) { sigInputRef.current.dataset.px = String(x); sigInputRef.current.dataset.py = String(y); }
    }
  }, [tool, currentPage, dragging]);

  const handleImageFile = async (file: File, kind: 'image' | 'signature', px: number, py: number) => {
    try {
      const { dataUrl, aspectRatio } = await imgToDataUrl(file);
      const el: ImgEl = { id: uid(), kind, page: currentPage, x: px, y: py, dataUrl, width: 0.25, aspectRatio };
      setElements(prev => [...prev, el]);
      setSelectedId(el.id);
    } catch { setError('Image invalide.'); }
  };

  // ── Drag ─────────────────────────────────────────────────────────────────

  const startDrag = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const el = elements.find(el => el.id === id)!;
    setDragging({ id, ox: e.clientX / rect.width - el.x, oy: e.clientY / rect.height - el.y });
    setSelectedId(id);
  };

  const onMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!dragging || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(0.98, e.clientX / rect.width - dragging.ox));
    const y = Math.max(0, Math.min(0.98, e.clientY / rect.height - dragging.oy));
    setElements(prev => prev.map(el => el.id === dragging.id ? { ...el, x, y } : el));
  };

  const onMouseUp = () => setDragging(null);

  // ── Update helpers ────────────────────────────────────────────────────────

  const updateEl = (id: string, patch: Partial<El>) =>
    setElements(prev => prev.map(el => el.id === id ? { ...el, ...patch } as El : el));

  const deleteEl = (id: string) => {
    setElements(prev => prev.filter(el => el.id !== id));
    if (selectedId === id) setSelectedId(null);
  };

  // ── Submit ────────────────────────────────────────────────────────────────

  const handleSubmit = async () => {
    if (!pdfFile || elements.length === 0) return;
    setIsSubmitting(true);
    setError('');
    setResult(null);
    try {
      const fd = new FormData();
      fd.append('file', pdfFile);
      fd.append('operation', 'fill');
      fd.append('elements', JSON.stringify(elements.map(el => {
        if (el.kind === 'text') {
          return { kind: el.kind, page: el.page, x: el.x, y: el.y, text: el.text, fontSize: el.fontSize, color: el.color };
        }
        return { kind: el.kind, page: el.page, x: el.x, y: el.y, dataUrl: el.dataUrl, width: el.width };
      })));
      const res = await fetch('/api/pdf-fill', { method: 'POST', body: fd });
      const data = await res.json();
      if (!res.ok) { setError(data.error); return; }
      setResult(data);
    } catch { setError('Erreur réseau'); }
    finally { setIsSubmitting(false); }
  };

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-5">
      {/* Hidden file inputs */}
      <input ref={imgInputRef} type="file" accept="image/*" className="hidden"
        onChange={e => { const f = e.target.files?.[0]; if (f && imgInputRef.current) { handleImageFile(f, 'image', parseFloat(imgInputRef.current.dataset.px ?? '0.1'), parseFloat(imgInputRef.current.dataset.py ?? '0.1')); e.target.value = ''; } }} />
      <input ref={sigInputRef} type="file" accept="image/*" className="hidden"
        onChange={e => { const f = e.target.files?.[0]; if (f && sigInputRef.current) { handleImageFile(f, 'signature', parseFloat(sigInputRef.current.dataset.px ?? '0.1'), parseFloat(sigInputRef.current.dataset.py ?? '0.1')); e.target.value = ''; } }} />

      {/* Upload */}
      {!pages.length && (
        <label className="flex flex-col items-center gap-3 border-2 border-dashed border-gray-600 hover:border-violet-500 rounded-xl p-10 cursor-pointer transition">
          <div className="text-4xl">📄</div>
          {isLoadingPages
            ? <span className="text-sm text-violet-400 animate-pulse">Chargement des pages...</span>
            : pdfFile
              ? <span className="text-sm text-white">{pdfFile.name}</span>
              : <><span className="text-sm text-gray-300">Sélectionner un PDF à remplir</span><span className="text-xs text-gray-500">.pdf uniquement</span></>}
          <input type="file" accept=".pdf,application/pdf" className="hidden" onChange={e => { if (e.target.files?.[0]) loadPdf(e.target.files[0]); }} />
        </label>
      )}

      {error && <div className="rounded-lg bg-red-900/30 border border-red-700/50 px-4 py-3 text-red-400 text-sm">{error}</div>}

      {pages.length > 0 && (
        <>
          {/* Toolbar */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Tool selector */}
            <div className="flex rounded-lg overflow-hidden border border-gray-600">
              {([
                { key: 'text' as Tool, icon: 'T', label: 'Texte' },
                { key: 'image' as Tool, icon: '🖼', label: 'Image' },
                { key: 'signature' as Tool, icon: '✍️', label: 'Signature' },
              ]).map(t => (
                <button key={t.key} onClick={() => { setTool(t.key); setSelectedId(null); }}
                  className={`px-4 py-2 text-sm font-semibold transition flex items-center gap-1.5 ${tool === t.key ? 'bg-violet-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}>
                  <span>{t.icon}</span><span>{t.label}</span>
                </button>
              ))}
            </div>
            {/* Page navigation */}
            <div className="flex items-center gap-2 ml-auto">
              <button onClick={() => { setCurrentPage(p => Math.max(1, p - 1)); setSelectedId(null); }} disabled={currentPage === 1}
                className="px-3 py-1.5 rounded bg-gray-700 hover:bg-gray-600 disabled:opacity-40 text-sm transition">←</button>
              <span className="text-sm text-gray-300">Page <b className="text-white">{currentPage}</b> / {pages.length}</span>
              <button onClick={() => { setCurrentPage(p => Math.min(pages.length, p + 1)); setSelectedId(null); }} disabled={currentPage === pages.length}
                className="px-3 py-1.5 rounded bg-gray-700 hover:bg-gray-600 disabled:opacity-40 text-sm transition">→</button>
            </div>
            {/* Change PDF */}
            <label className="text-xs px-3 py-1.5 rounded-lg bg-gray-700 hover:bg-gray-600 text-gray-300 cursor-pointer transition">
              Changer PDF<input type="file" accept=".pdf" className="hidden" onChange={e => { if (e.target.files?.[0]) loadPdf(e.target.files[0]); }} />
            </label>
          </div>

          {/* Hint */}
          <p className="text-xs text-gray-500">
            Cliquez sur la page pour ajouter {tool === 'text' ? 'un texte' : tool === 'image' ? 'une image' : 'une signature'} · Glissez pour déplacer · Cliquez sur un élément pour le sélectionner
          </p>

          {/* Canvas */}
          <div
            ref={containerRef}
            className="relative select-none rounded-lg border border-gray-600 overflow-hidden bg-white"
            style={{ cursor: tool === 'text' ? 'text' : 'crosshair' }}
            onClick={handleCanvasClick}
            onMouseMove={onMouseMove}
            onMouseUp={onMouseUp}
            onMouseLeave={onMouseUp}
          >
            <img src={pages[currentPage - 1]} alt={`Page ${currentPage}`} className="w-full h-auto block pointer-events-none" draggable={false} />

            {/* Elements overlay */}
            {pageEls.map(el => {
              const isSelected = selectedId === el.id;
              if (el.kind === 'text') {
                const px = containerW ? el.fontSize * scale : el.fontSize;
                return (
                  <div
                    key={el.id}
                    className={`absolute group cursor-grab active:cursor-grabbing ${isSelected ? 'ring-2 ring-violet-500 ring-offset-1' : 'hover:ring-1 hover:ring-violet-400'}`}
                    style={{ left: `${el.x * 100}%`, top: `${el.y * 100}%`, fontSize: `${px}px`, color: el.color, whiteSpace: 'pre', lineHeight: 1.2 }}
                    onMouseDown={e => startDrag(e, el.id)}
                    onClick={e => { e.stopPropagation(); setSelectedId(el.id); }}
                  >
                    {el.text || <span className="text-gray-400 italic" style={{ fontSize: `${Math.max(10, px * 0.9)}px` }}>Texte...</span>}
                    {isSelected && (
                      <button onMouseDown={e => e.stopPropagation()} onClick={e => { e.stopPropagation(); deleteEl(el.id); }}
                        className="absolute -top-2 -right-2 w-5 h-5 bg-red-600 rounded-full text-white text-xs flex items-center justify-center shadow z-10">✕</button>
                    )}
                  </div>
                );
              } else {
                const imgW = el.width * (containerW || 200);
                const imgH = imgW * el.aspectRatio;
                return (
                  <div
                    key={el.id}
                    className={`absolute cursor-grab active:cursor-grabbing ${isSelected ? 'ring-2 ring-violet-500 ring-offset-1' : 'hover:ring-1 hover:ring-violet-400'}`}
                    style={{ left: `${el.x * 100}%`, top: `${el.y * 100}%`, width: imgW, height: imgH }}
                    onMouseDown={e => startDrag(e, el.id)}
                    onClick={e => { e.stopPropagation(); setSelectedId(el.id); }}
                  >
                    <img src={el.dataUrl} alt={el.kind} className="w-full h-full object-contain pointer-events-none" draggable={false} />
                    {isSelected && (
                      <button onMouseDown={e => e.stopPropagation()} onClick={e => { e.stopPropagation(); deleteEl(el.id); }}
                        className="absolute -top-2 -right-2 w-5 h-5 bg-red-600 rounded-full text-white text-xs flex items-center justify-center shadow z-10">✕</button>
                    )}
                  </div>
                );
              }
            })}
          </div>

          {/* Selected element controls */}
          {selected && (
            <div className="rounded-xl bg-gray-900 border border-violet-700/40 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-violet-300 uppercase tracking-wider">
                  {selected.kind === 'text' ? 'Texte' : selected.kind === 'image' ? 'Image' : 'Signature'} sélectionné{selected.kind === 'image' || selected.kind === 'signature' ? 'e' : ''}
                </span>
                <button onClick={() => deleteEl(selected.id)} className="text-xs px-3 py-1 rounded bg-red-900/50 hover:bg-red-800 text-red-300 transition">Supprimer</button>
              </div>

              {selected.kind === 'text' && (
                <>
                  <textarea
                    autoFocus
                    value={selected.text}
                    onChange={e => updateEl(selected.id, { text: e.target.value })}
                    onClick={e => e.stopPropagation()}
                    rows={3}
                    placeholder="Votre texte ici..."
                    className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm font-mono resize-none focus:outline-none focus:border-violet-500"
                  />
                  <div className="flex gap-4 flex-wrap items-center">
                    <div className="flex items-center gap-2">
                      <label className="text-xs text-gray-400">Taille (pt)</label>
                      <input type="number" min={6} max={120} value={selected.fontSize}
                        onChange={e => updateEl(selected.id, { fontSize: parseInt(e.target.value) || 12 })}
                        className="w-20 bg-gray-800 border border-gray-600 rounded px-2 py-1 text-white text-sm" />
                    </div>
                    <div className="flex items-center gap-2">
                      <label className="text-xs text-gray-400">Couleur</label>
                      <div className="flex gap-1">
                        {COLORS.map(c => (
                          <button key={c} onClick={() => updateEl(selected.id, { color: c })}
                            className={`w-6 h-6 rounded-full border-2 transition ${selected.color === c ? 'border-white scale-110' : 'border-transparent'}`}
                            style={{ background: c }} />
                        ))}
                        <input type="color" value={selected.color} onChange={e => updateEl(selected.id, { color: e.target.value })}
                          className="w-6 h-6 rounded cursor-pointer border-0 bg-transparent" title="Couleur personnalisée" />
                      </div>
                    </div>
                  </div>
                </>
              )}

              {(selected.kind === 'image' || selected.kind === 'signature') && (
                <div className="flex items-center gap-3">
                  <label className="text-xs text-gray-400 whitespace-nowrap">Largeur</label>
                  <input type="range" min={0.05} max={0.9} step={0.01} value={selected.width}
                    onChange={e => updateEl(selected.id, { width: parseFloat(e.target.value) })}
                    className="flex-1 accent-violet-500" />
                  <span className="text-xs text-gray-400 w-10 text-right">{Math.round(selected.width * 100)}%</span>
                </div>
              )}
            </div>
          )}

          {/* Elements list summary */}
          {elements.length > 0 && (
            <div className="flex items-center justify-between text-sm text-gray-400">
              <span>{elements.length} élément{elements.length > 1 ? 's' : ''} sur {pages.length} page{pages.length > 1 ? 's' : ''}</span>
              <button onClick={() => { setElements([]); setSelectedId(null); }} className="text-xs text-red-400 hover:text-red-300 transition">Tout effacer</button>
            </div>
          )}

          {/* Submit */}
          <button
            onClick={handleSubmit}
            disabled={isSubmitting || elements.length === 0}
            className="w-full py-3 rounded-xl font-semibold bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 disabled:opacity-50 text-white transition shadow-lg"
          >
            {isSubmitting ? 'Génération du PDF...' : elements.length === 0 ? 'Ajoutez des éléments sur le PDF' : `Générer le PDF rempli (${elements.length} élément${elements.length > 1 ? 's' : ''})`}
          </button>

          {result && (
            <div className="rounded-xl bg-green-900/20 border border-green-700/40 p-4 flex items-center justify-between gap-4">
              <p className="text-sm text-green-400 font-semibold">PDF généré avec succès !</p>
              <a href={result.url} download={result.originalName}
                className="shrink-0 px-5 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white font-semibold text-sm transition">
                Télécharger
              </a>
            </div>
          )}
        </>
      )}
    </div>
  );
}
