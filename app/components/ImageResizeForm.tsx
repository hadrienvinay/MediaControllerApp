'use client';

import { useState, useRef } from 'react';

type Fit = 'cover' | 'contain' | 'fill' | 'inside' | 'outside';
type Format = 'jpeg' | 'png' | 'webp';

export default function ImageResizeForm() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState('');
  const [origW, setOrigW] = useState<number | null>(null);
  const [origH, setOrigH] = useState<number | null>(null);
  const [width, setWidth] = useState('');
  const [height, setHeight] = useState('');
  const [keepRatio, setKeepRatio] = useState(true);
  const [fit, setFit] = useState<Fit>('inside');
  const [format, setFormat] = useState<Format>('jpeg');
  const [quality, setQuality] = useState(85);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ url: string; name: string } | null>(null);
  const [error, setError] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const loadFile = (f: File) => {
    setFile(f);
    setResult(null);
    setError('');
    const url = URL.createObjectURL(f);
    setPreview(url);
    const img = new Image();
    img.onload = () => {
      setOrigW(img.width);
      setOrigH(img.height);
      setWidth(String(img.width));
      setHeight(String(img.height));
    };
    img.src = url;
  };

  const onWidthChange = (v: string) => {
    setWidth(v);
    if (keepRatio && origW && origH && v) {
      setHeight(String(Math.round(parseInt(v) * origH / origW)));
    }
  };

  const onHeightChange = (v: string) => {
    setHeight(v);
    if (keepRatio && origW && origH && v) {
      setWidth(String(Math.round(parseInt(v) * origW / origH)));
    }
  };

  const handleSubmit = async () => {
    if (!file || (!width && !height)) return;
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const fd = new FormData();
      fd.append('file', file);
      if (width) fd.append('width', width);
      if (height) fd.append('height', height);
      fd.append('fit', fit);
      fd.append('format', format);
      fd.append('quality', String(quality));
      const res = await fetch('/api/image-resize', { method: 'POST', body: fd });
      const data = await res.json();
      if (!res.ok) { setError(data.error); return; }
      setResult(data);
    } catch { setError('Erreur réseau'); }
    finally { setLoading(false); }
  };

  return (
    <div className="space-y-5">
      {/* Drop zone */}
      <div
        onClick={() => inputRef.current?.click()}
        onDrop={e => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) loadFile(f); }}
        onDragOver={e => e.preventDefault()}
        className="border-2 border-dashed border-gray-600 hover:border-blue-500 rounded-xl p-8 text-center cursor-pointer transition"
      >
        <input ref={inputRef} type="file" accept="image/*" className="hidden"
          onChange={e => { if (e.target.files?.[0]) loadFile(e.target.files[0]); }} />
        {preview
          ? <img src={preview} alt="aperçu" className="max-h-40 mx-auto rounded-lg object-contain" />
          : <div className="space-y-2 text-gray-400"><div className="text-4xl">🖼</div><p className="text-sm">Glissez une image ou cliquez</p></div>}
        {origW && origH && <p className="text-xs text-gray-500 mt-2">{origW} × {origH} px</p>}
      </div>

      {error && <div className="rounded-lg bg-red-900/30 border border-red-700/50 px-4 py-3 text-red-400 text-sm">{error}</div>}

      {file && (
        <>
          {/* Dimensions */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs text-gray-400">Largeur (px)</label>
              <input type="number" min={1} value={width} onChange={e => onWidthChange(e.target.value)}
                className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500" />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-gray-400">Hauteur (px)</label>
              <input type="number" min={1} value={height} onChange={e => onHeightChange(e.target.value)}
                className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500" />
            </div>
          </div>

          {/* Keep ratio */}
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input type="checkbox" checked={keepRatio} onChange={e => setKeepRatio(e.target.checked)}
              className="w-4 h-4 accent-blue-500" />
            <span className="text-sm text-gray-300">Conserver le ratio</span>
          </label>

          {/* Fit mode */}
          <div className="space-y-1.5">
            <label className="text-xs text-gray-400">Mode de redimensionnement</label>
            <div className="flex flex-wrap gap-2">
              {(['inside', 'cover', 'contain', 'fill'] as Fit[]).map(f => (
                <button key={f} onClick={() => setFit(f)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${fit === f ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}>
                  {f === 'inside' ? 'Intérieur (défaut)' : f === 'cover' ? 'Rognage' : f === 'contain' ? 'Enveloppe' : 'Étirer'}
                </button>
              ))}
            </div>
          </div>

          {/* Format + quality */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs text-gray-400">Format de sortie</label>
              <div className="flex gap-2">
                {(['jpeg', 'png', 'webp'] as Format[]).map(f => (
                  <button key={f} onClick={() => setFormat(f)}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition ${format === f ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}>
                    {f.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>
            {format !== 'png' && (
              <div className="space-y-1.5">
                <label className="text-xs text-gray-400">Qualité — {quality}%</label>
                <input type="range" min={10} max={100} value={quality} onChange={e => setQuality(parseInt(e.target.value))}
                  className="w-full accent-blue-500 mt-1" />
              </div>
            )}
          </div>

          <button onClick={handleSubmit} disabled={loading || (!width && !height)}
            className="w-full py-3 rounded-xl font-semibold bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 disabled:opacity-50 text-white transition shadow-lg">
            {loading ? 'Redimensionnement...' : 'Redimensionner'}
          </button>
        </>
      )}

      {result && (
        <div className="rounded-xl bg-green-900/20 border border-green-700/40 p-4 flex items-center justify-between gap-4">
          <p className="text-sm text-green-400 font-semibold">Image redimensionnée !</p>
          <a href={result.url} download={result.name}
            className="shrink-0 px-5 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white font-semibold text-sm transition">
            Télécharger
          </a>
        </div>
      )}
    </div>
  );
}
