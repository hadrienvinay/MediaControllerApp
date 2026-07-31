'use client';

import { useState, useEffect } from 'react';

interface ShortUrl {
  code: string;
  url: string;
  createdAt: string;
  clicks: number;
  shortUrl?: string;
}

export default function UrlShortenerForm() {
  const [input, setInput] = useState('');
  const [urls, setUrls] = useState<ShortUrl[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [newEntry, setNewEntry] = useState<ShortUrl | null>(null);
  const [copiedCode, setCopiedCode] = useState('');

  const fetchUrls = async () => {
    try {
      const res = await fetch('/api/url-shorten');
      const data = await res.json();
      const base = window.location.origin;
      setUrls(data.map((u: ShortUrl) => ({ ...u, shortUrl: `${base}/r/${u.code}` })));
    } catch { /* silent */ }
  };

  useEffect(() => { fetchUrls(); }, []);

  const handleShorten = async () => {
    if (!input.trim()) return;
    setIsLoading(true);
    setError('');
    setNewEntry(null);
    try {
      const res = await fetch('/api/url-shorten', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: input }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error); return; }
      setNewEntry(data);
      setInput('');
      fetchUrls();
    } catch {
      setError('Erreur réseau');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (code: string) => {
    await fetch(`/api/url-shorten?code=${code}`, { method: 'DELETE' });
    setUrls(prev => prev.filter(u => u.code !== code));
    if (newEntry?.code === code) setNewEntry(null);
  };

  const copy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(key);
    setTimeout(() => setCopiedCode(''), 2000);
  };

  return (
    <div className="space-y-6">
      <div className="flex gap-2">
        <input
          type="url"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleShorten()}
          placeholder="https://exemple.com/une-longue-url..."
          className="flex-1 bg-gray-900 border border-gray-700 rounded-lg px-4 py-2.5 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-indigo-500"
        />
        <button
          onClick={handleShorten}
          disabled={isLoading || !input.trim()}
          className="px-5 py-2.5 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 text-white font-semibold text-sm transition whitespace-nowrap"
        >
          {isLoading ? '...' : 'Raccourcir'}
        </button>
      </div>

      {error && <div className="rounded-lg bg-red-900/30 border border-red-700/50 px-4 py-3 text-red-400 text-sm">{error}</div>}

      {newEntry?.shortUrl && (
        <div className="rounded-xl bg-green-900/20 border border-green-700/40 p-4 space-y-2">
          <p className="text-xs text-green-400 font-semibold">Lien créé !</p>
          <div className="flex items-center gap-2">
            <a href={newEntry.shortUrl} target="_blank" rel="noopener noreferrer" className="text-green-300 font-mono text-sm hover:underline flex-1 truncate">
              {newEntry.shortUrl}
            </a>
            <button onClick={() => copy(newEntry.shortUrl!, 'new')} className="shrink-0 text-xs px-3 py-1 rounded bg-green-700 hover:bg-green-600 text-white transition">
              {copiedCode === 'new' ? '✓' : 'Copier'}
            </button>
          </div>
          <p className="text-xs text-gray-500 truncate">→ {newEntry.url}</p>
        </div>
      )}

      {urls.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-gray-300">Historique ({urls.length})</h3>
          <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
            {[...urls].reverse().map(u => (
              <div key={u.code} className="flex items-center gap-3 bg-gray-900 border border-gray-700 rounded-lg px-4 py-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm text-indigo-300 font-semibold">/r/{u.code}</span>
                    <span className="text-xs text-gray-500">{u.clicks} clic{u.clicks !== 1 ? 's' : ''}</span>
                  </div>
                  <p className="text-xs text-gray-500 truncate mt-0.5">{u.url}</p>
                </div>
                <button onClick={() => copy(u.shortUrl ?? `/r/${u.code}`, u.code)} className="shrink-0 text-xs px-2 py-1 rounded bg-gray-700 hover:bg-gray-600 text-gray-300 transition">
                  {copiedCode === u.code ? '✓' : 'Copier'}
                </button>
                <button onClick={() => handleDelete(u.code)} className="shrink-0 text-xs px-2 py-1 rounded bg-red-900/50 hover:bg-red-800 text-red-300 transition">
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {urls.length === 0 && !newEntry && (
        <p className="text-center text-sm text-gray-500 py-4">Aucun lien raccourci pour le moment.</p>
      )}
    </div>
  );
}
