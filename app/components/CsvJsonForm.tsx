'use client';

import { useState } from 'react';

type Direction = 'csv-to-json' | 'json-to-csv';

const PLACEHOLDER: Record<Direction, { input: string; label: string }> = {
  'csv-to-json': {
    label: 'CSV',
    input: 'name,age,city\nAlice,30,Paris\nBob,25,Lyon',
  },
  'json-to-csv': {
    label: 'JSON',
    input: '[{"name":"Alice","age":30,"city":"Paris"},{"name":"Bob","age":25,"city":"Lyon"}]',
  },
};

export default function CsvJsonForm() {
  const [direction, setDirection] = useState<Direction>('csv-to-json');
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const swap = () => {
    const next: Direction = direction === 'csv-to-json' ? 'json-to-csv' : 'csv-to-json';
    setDirection(next);
    setInput(output);
    setOutput('');
    setError('');
  };

  const convert = async () => {
    if (!input.trim()) return;
    setLoading(true);
    setError('');
    setOutput('');
    try {
      const res = await fetch('/api/csv-json', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ direction, input }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error); return; }
      setOutput(data.output);
    } catch { setError('Erreur réseau'); }
    finally { setLoading(false); }
  };

  const copy = () => {
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const { label, input: placeholder } = PLACEHOLDER[direction];
  const outputLabel = direction === 'csv-to-json' ? 'JSON' : 'CSV';

  return (
    <div className="space-y-5">
      {/* Direction toggle + swap */}
      <div className="flex items-center gap-3">
        <div className="flex rounded-lg overflow-hidden border border-gray-600">
          {(['csv-to-json', 'json-to-csv'] as Direction[]).map(d => (
            <button key={d} onClick={() => { setDirection(d); setOutput(''); setError(''); }}
              className={`px-4 py-2 text-sm font-semibold transition ${direction === d ? 'bg-emerald-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}>
              {d === 'csv-to-json' ? 'CSV → JSON' : 'JSON → CSV'}
            </button>
          ))}
        </div>
        {output && (
          <button onClick={swap} title="Utiliser le résultat comme entrée"
            className="text-xs px-3 py-2 rounded-lg bg-gray-700 hover:bg-gray-600 text-gray-300 transition">
            ⇄ Inverser
          </button>
        )}
      </div>

      {/* Input */}
      <div className="space-y-1.5">
        <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">{label}</label>
        <textarea
          value={input}
          onChange={e => { setInput(e.target.value); setError(''); setOutput(''); }}
          placeholder={placeholder}
          rows={8}
          className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-white text-sm font-mono resize-y placeholder-gray-600 focus:outline-none focus:border-emerald-500 transition"
        />
      </div>

      {error && <div className="rounded-lg bg-red-900/30 border border-red-700/50 px-4 py-3 text-red-400 text-sm">{error}</div>}

      <button onClick={convert} disabled={loading || !input.trim()}
        className="w-full py-3 rounded-xl font-semibold bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 disabled:opacity-50 text-white transition shadow-lg">
        {loading ? 'Conversion...' : `Convertir en ${outputLabel}`}
      </button>

      {/* Output */}
      {output && (
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">{outputLabel}</label>
            <button onClick={copy} className="text-xs px-3 py-1 rounded-lg bg-gray-700 hover:bg-gray-600 text-gray-300 transition">
              {copied ? '✓ Copié' : 'Copier'}
            </button>
          </div>
          <textarea readOnly value={output} rows={8}
            className="w-full bg-gray-900 border border-gray-600 rounded-xl px-4 py-3 text-green-300 text-sm font-mono resize-y focus:outline-none" />
        </div>
      )}
    </div>
  );
}
