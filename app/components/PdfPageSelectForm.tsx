'use client';

import { useState, useRef } from 'react';

function parseTextSelection(input: string, total: number): Set<number> {
  const pages = new Set<number>();
  for (const part of input.split(',')) {
    const trimmed = part.trim();
    const range = trimmed.match(/^(\d+)\s*-\s*(\d+)$/);
    if (range) {
      const from = parseInt(range[1]);
      const to = parseInt(range[2]);
      for (let i = Math.max(1, from); i <= Math.min(total, to); i++) pages.add(i);
    } else {
      const n = parseInt(trimmed);
      if (!isNaN(n) && n >= 1 && n <= total) pages.add(n);
    }
  }
  return pages;
}

function selectionToText(pages: Set<number>): string {
  const sorted = [...pages].sort((a, b) => a - b);
  const ranges: string[] = [];
  let i = 0;
  while (i < sorted.length) {
    let j = i;
    while (j + 1 < sorted.length && sorted[j + 1] === sorted[j] + 1) j++;
    ranges.push(j > i ? `${sorted[i]}-${sorted[j]}` : `${sorted[i]}`);
    i = j + 1;
  }
  return ranges.join(', ');
}

export default function PdfPageSelectForm() {
  const [file, setFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState<number | null>(null);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [textInput, setTextInput] = useState('');
  const [inputMode, setInputMode] = useState<'visual' | 'text'>('visual');
  const [isCountLoading, setIsCountLoading] = useState(false);
  const [isExtracting, setIsExtracting] = useState(false);
  const [result, setResult] = useState<{ url: string; originalName: string; pageCount: number } | null>(null);
  const [error, setError] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const reset = () => {
    setPageCount(null);
    setSelected(new Set());
    setTextInput('');
    setResult(null);
    setError('');
  };

  const handleFile = async (f: File) => {
    setFile(f);
    reset();
    setIsCountLoading(true);
    try {
      const fd = new FormData();
      fd.append('file', f);
      fd.append('operation', 'count');
      const res = await fetch('/api/pdf-select', { method: 'POST', body: fd });
      const data = await res.json();
      if (!res.ok) { setError(data.error); return; }
      setPageCount(data.pageCount);
    } catch {
      setError('Impossible de lire ce PDF.');
    } finally {
      setIsCountLoading(false);
    }
  };

  const togglePage = (p: number) => {
    setSelected(prev => {
      const next = new Set(prev);
      next.has(p) ? next.delete(p) : next.add(p);
      setTextInput(selectionToText(next));
      return next;
    });
  };

  const selectAll = () => {
    if (!pageCount) return;
    const all = new Set(Array.from({ length: pageCount }, (_, i) => i + 1));
    setSelected(all);
    setTextInput(selectionToText(all));
  };

  const selectNone = () => {
    setSelected(new Set());
    setTextInput('');
  };

  const applyTextInput = () => {
    if (!pageCount) return;
    const parsed = parseTextSelection(textInput, pageCount);
    setSelected(parsed);
  };

  const handleExtract = async () => {
    if (!file || selected.size === 0) return;
    setIsExtracting(true);
    setError('');
    setResult(null);
    try {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('operation', 'extract');
      fd.append('pages', JSON.stringify([...selected].sort((a, b) => a - b)));
      const res = await fetch('/api/pdf-select', { method: 'POST', body: fd });
      const data = await res.json();
      if (!res.ok) { setError(data.error); return; }
      setResult(data);
    } catch {
      setError('Erreur réseau');
    } finally {
      setIsExtracting(false);
    }
  };

  const effectiveSelected = inputMode === 'text' && pageCount
    ? parseTextSelection(textInput, pageCount)
    : selected;

  return (
    <div className="space-y-5">
      {/* Drop zone */}
      <div
        onClick={() => inputRef.current?.click()}
        onDrop={e => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) handleFile(f); }}
        onDragOver={e => e.preventDefault()}
        className="border-2 border-dashed border-gray-600 hover:border-red-500 rounded-xl p-8 text-center cursor-pointer transition-colors"
      >
        <input ref={inputRef} type="file" accept=".pdf,application/pdf" className="hidden"
          onChange={e => { if (e.target.files?.[0]) handleFile(e.target.files[0]); }} />
        <div className="space-y-2 text-gray-400">
          <div className="text-4xl">📄</div>
          {file ? (
            <p className="text-sm text-white font-medium">
              {file.name}
              {pageCount && <span className="text-gray-400 ml-2">— {pageCount} pages</span>}
              {isCountLoading && <span className="text-gray-400 ml-2">— lecture...</span>}
            </p>
          ) : (
            <>
              <p className="text-sm">Glissez un PDF ou cliquez pour sélectionner</p>
              <p className="text-xs">.pdf uniquement</p>
            </>
          )}
        </div>
      </div>

      {error && <div className="rounded-lg bg-red-900/30 border border-red-700/50 px-4 py-3 text-red-400 text-sm">{error}</div>}

      {pageCount && (
        <>
          {/* Mode toggle */}
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex rounded-lg overflow-hidden border border-gray-600">
              {(['visual', 'text'] as const).map(m => (
                <button key={m} onClick={() => setInputMode(m)}
                  className={`px-4 py-1.5 text-sm font-medium transition ${inputMode === m ? 'bg-red-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}>
                  {m === 'visual' ? 'Sélection visuelle' : 'Saisie texte'}
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <button onClick={selectAll} className="text-xs px-3 py-1.5 rounded-lg bg-gray-700 hover:bg-gray-600 text-gray-300 transition">Tout</button>
              <button onClick={selectNone} className="text-xs px-3 py-1.5 rounded-lg bg-gray-700 hover:bg-gray-600 text-gray-300 transition">Aucune</button>
            </div>
          </div>

          {/* Visual grid */}
          {inputMode === 'visual' && (
            <div className="space-y-2">
              <p className="text-xs text-gray-400">Cliquez sur les pages à extraire</p>
              <div className="grid gap-1.5" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(48px, 1fr))' }}>
                {Array.from({ length: pageCount }, (_, i) => i + 1).map(p => (
                  <button
                    key={p}
                    onClick={() => togglePage(p)}
                    className={`aspect-[3/4] rounded-lg text-sm font-semibold font-mono transition-all border-2 ${
                      selected.has(p)
                        ? 'bg-red-600 border-red-400 text-white shadow-lg shadow-red-600/30 scale-105'
                        : 'bg-gray-800 border-gray-600 text-gray-400 hover:border-gray-400 hover:text-white'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Text input */}
          {inputMode === 'text' && (
            <div className="space-y-2">
              <label className="block text-xs text-gray-400">
                Pages à extraire <span className="text-gray-500">— ex : 1, 3-5, 8, 10-12</span>
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={textInput}
                  onChange={e => setTextInput(e.target.value)}
                  onBlur={applyTextInput}
                  onKeyDown={e => e.key === 'Enter' && applyTextInput()}
                  placeholder="1, 3-5, 8"
                  className="flex-1 bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white text-sm font-mono placeholder-gray-600 focus:outline-none focus:border-red-500"
                />
                <button onClick={applyTextInput} className="px-4 py-2 rounded-lg bg-gray-700 hover:bg-gray-600 text-gray-300 text-sm transition">
                  Appliquer
                </button>
              </div>
            </div>
          )}

          {/* Summary */}
          {effectiveSelected.size > 0 && (
            <div className="rounded-lg bg-red-900/20 border border-red-700/30 px-4 py-3 text-sm text-red-200">
              <span className="font-semibold">{effectiveSelected.size} page{effectiveSelected.size > 1 ? 's' : ''} sélectionnée{effectiveSelected.size > 1 ? 's' : ''}</span>
              <span className="text-red-400 ml-2 font-mono text-xs">{selectionToText(effectiveSelected)}</span>
            </div>
          )}

          <button
            onClick={handleExtract}
            disabled={isExtracting || effectiveSelected.size === 0}
            className="w-full py-3 rounded-xl font-semibold bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 disabled:opacity-50 text-white transition shadow-lg"
          >
            {isExtracting
              ? 'Extraction en cours...'
              : effectiveSelected.size === 0
                ? 'Sélectionnez au moins une page'
                : `Extraire ${effectiveSelected.size} page${effectiveSelected.size > 1 ? 's' : ''}`}
          </button>
        </>
      )}

      {result && (
        <div className="rounded-xl bg-green-900/20 border border-green-700/40 p-4 flex items-center justify-between gap-4">
          <div>
            <p className="text-sm text-green-400 font-semibold">PDF extrait — {result.pageCount} page{result.pageCount > 1 ? 's' : ''}</p>
            <p className="text-xs text-gray-400 mt-0.5">{result.originalName}</p>
          </div>
          <a href={result.url} download={result.originalName}
            className="shrink-0 px-5 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white font-semibold text-sm transition">
            Télécharger
          </a>
        </div>
      )}
    </div>
  );
}
