'use client';

import { useState } from 'react';

type Direction = 'json-to-yaml' | 'yaml-to-json';

export default function JsonYamlForm() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [direction, setDirection] = useState<Direction>('json-to-yaml');
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleConvert = async () => {
    if (!input.trim()) return;
    setError('');
    setOutput('');
    setIsLoading(true);
    try {
      const res = await fetch('/api/json-yaml', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ input, direction }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error); return; }
      setOutput(data.result);
    } catch {
      setError('Erreur réseau');
    } finally {
      setIsLoading(false);
    }
  };

  const swap = () => {
    setDirection(d => d === 'json-to-yaml' ? 'yaml-to-json' : 'json-to-yaml');
    setInput(output);
    setOutput('');
    setError('');
  };

  const copy = () => {
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const [from, to] = direction === 'json-to-yaml' ? ['JSON', 'YAML'] : ['YAML', 'JSON'];

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <span className="px-3 py-1.5 rounded-lg bg-gray-700 text-sm font-mono font-semibold text-blue-300">{from}</span>
        <button onClick={swap} title="Inverser" className="p-2 rounded-lg bg-gray-700 hover:bg-gray-600 border border-gray-600 hover:border-blue-500 text-gray-300 hover:text-white transition">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
          </svg>
        </button>
        <span className="px-3 py-1.5 rounded-lg bg-gray-700 text-sm font-mono font-semibold text-green-300">{to}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs text-gray-400 mb-1">Entrée {from}</label>
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            rows={16}
            placeholder={direction === 'json-to-yaml' ? '{\n  "key": "value"\n}' : 'key: value'}
            className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-blue-300 text-sm font-mono placeholder-gray-600 focus:outline-none focus:border-blue-500 resize-none"
            spellCheck={false}
          />
        </div>
        <div className="relative">
          <label className="block text-xs text-gray-400 mb-1">Sortie {to}</label>
          <textarea
            readOnly
            value={output}
            rows={16}
            placeholder="Le résultat apparaîtra ici..."
            className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-green-300 text-sm font-mono placeholder-gray-600 focus:outline-none resize-none"
            spellCheck={false}
          />
          {output && (
            <button onClick={copy} className="absolute top-7 right-2 text-xs px-2 py-1 rounded bg-gray-700 hover:bg-gray-600 text-gray-300 transition">
              {copied ? '✓' : 'Copier'}
            </button>
          )}
        </div>
      </div>

      {error && <div className="rounded-lg bg-red-900/30 border border-red-700/50 px-4 py-3 text-red-400 text-sm">{error}</div>}

      <button
        onClick={handleConvert}
        disabled={isLoading || !input.trim()}
        className="w-full py-3 rounded-xl font-semibold bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 disabled:opacity-50 text-white transition shadow-lg"
      >
        {isLoading ? 'Conversion...' : `Convertir ${from} → ${to}`}
      </button>
    </div>
  );
}
