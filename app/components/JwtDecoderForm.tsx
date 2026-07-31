'use client';

import { useState } from 'react';

function decodeBase64Url(str: string): string {
  const padded = str.replace(/-/g, '+').replace(/_/g, '/') + '=='.slice((str.length + 3) % 4);
  try {
    const bytes = Uint8Array.from(atob(padded), c => c.charCodeAt(0));
    return new TextDecoder().decode(bytes);
  } catch {
    return atob(padded);
  }
}

function parseJwt(token: string) {
  const parts = token.trim().split('.');
  if (parts.length !== 3) throw new Error('Token JWT invalide (doit avoir 3 parties séparées par ".")');
  const header = JSON.parse(decodeBase64Url(parts[0]));
  const payload = JSON.parse(decodeBase64Url(parts[1]));
  return { header, payload, signature: parts[2] };
}

function JsonBlock({ data, label }: { data: object; label: string }) {
  const [copied, setCopied] = useState(false);
  const text = JSON.stringify(data, null, 2);
  const copy = () => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2000); };
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{label}</span>
        <button onClick={copy} className="text-xs px-2 py-0.5 rounded bg-gray-700 hover:bg-gray-600 text-gray-300 transition">{copied ? '✓' : 'Copier'}</button>
      </div>
      <pre className="bg-gray-900 border border-gray-700 rounded-lg p-4 text-sm text-green-300 font-mono overflow-x-auto whitespace-pre-wrap break-all">{text}</pre>
    </div>
  );
}

function ExpiryBadge({ payload }: { payload: Record<string, unknown> }) {
  if (!payload.exp) return null;
  const exp = new Date((payload.exp as number) * 1000);
  const expired = exp < new Date();
  return (
    <div className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm border ${expired ? 'bg-red-900/20 border-red-700/40 text-red-300' : 'bg-green-900/20 border-green-700/40 text-green-300'}`}>
      <span>{expired ? '⚠ Expiré' : '✅ Valide'}</span>
      <span className="text-xs opacity-70">— exp : {exp.toLocaleString('fr-FR')}</span>
    </div>
  );
}

export default function JwtDecoderForm() {
  const [token, setToken] = useState('');
  const [result, setResult] = useState<{ header: object; payload: Record<string, unknown>; signature: string } | null>(null);
  const [error, setError] = useState('');

  const decode = () => {
    setError('');
    setResult(null);
    try {
      setResult(parseJwt(token));
    } catch (e) {
      setError((e as Error).message);
    }
  };

  return (
    <div className="space-y-4">
      <div className="rounded-lg bg-yellow-900/20 border border-yellow-700/30 px-4 py-3 text-yellow-300 text-xs">
        Le décodage est 100% local — le token ne quitte pas votre navigateur. Seule la partie payload/header est décodée ; la signature n'est pas vérifiée.
      </div>

      <div>
        <label className="block text-xs text-gray-400 mb-1">Token JWT</label>
        <textarea
          value={token}
          onChange={e => { setToken(e.target.value); setResult(null); setError(''); }}
          rows={4}
          placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0.signature"
          className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-yellow-200 text-sm font-mono placeholder-gray-600 focus:outline-none focus:border-yellow-500 resize-none break-all"
          spellCheck={false}
        />
      </div>

      <button
        onClick={decode}
        disabled={!token.trim()}
        className="w-full py-3 rounded-xl font-semibold bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 disabled:opacity-50 text-white transition shadow-lg"
      >
        Décoder le JWT
      </button>

      {error && <div className="rounded-lg bg-red-900/30 border border-red-700/50 px-4 py-3 text-red-400 text-sm">{error}</div>}

      {result && (
        <div className="space-y-4">
          <ExpiryBadge payload={result.payload} />
          <JsonBlock data={result.header} label="Header (algorithme)" />
          <JsonBlock data={result.payload} label="Payload (données)" />
          <div className="space-y-1">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Signature (non vérifiée)</span>
            <p className="bg-gray-900 border border-gray-700 rounded-lg p-4 text-sm text-gray-400 font-mono break-all">{result.signature}</p>
          </div>
        </div>
      )}
    </div>
  );
}
