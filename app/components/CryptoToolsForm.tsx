'use client';

import { useState } from 'react';

type Mode = 'hash' | 'encode' | 'hmac' | 'bcrypt';
type HashAlgo = 'md5' | 'sha1' | 'sha256' | 'sha384' | 'sha512';
type EncodeAlgo = 'base64' | 'base64url' | 'url' | 'hex';
type HmacAlgo = 'sha256' | 'sha512';
type BcryptMode = 'hash' | 'verify';

const HASH_ALGOS: { value: HashAlgo; label: string }[] = [
  { value: 'md5', label: 'MD5' },
  { value: 'sha1', label: 'SHA-1' },
  { value: 'sha256', label: 'SHA-256' },
  { value: 'sha384', label: 'SHA-384' },
  { value: 'sha512', label: 'SHA-512' },
];

const SALT_ROUNDS = [4, 6, 8, 10, 12, 14];
const SALT_ITERATIONS: Record<number, string> = {
  4: '16 iter.', 6: '64 iter.', 8: '256 iter.',
  10: '1 024 iter.', 12: '4 096 iter.', 14: '16 384 iter.',
};

function utf8ToBase64(str: string): string {
  const bytes = new TextEncoder().encode(str);
  return btoa(Array.from(bytes, b => String.fromCharCode(b)).join(''));
}

function base64ToUtf8(b64: string): string {
  const binary = atob(b64);
  const bytes = Uint8Array.from(binary, c => c.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

function encodeClientSide(input: string, algo: EncodeAlgo, decode: boolean): string {
  try {
    if (algo === 'base64') return decode ? base64ToUtf8(input) : utf8ToBase64(input);
    if (algo === 'base64url') {
      if (decode) {
        const padded = input.replace(/-/g, '+').replace(/_/g, '/') + '=='.slice((input.length + 3) % 4);
        return base64ToUtf8(padded);
      }
      return utf8ToBase64(input).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
    }
    if (algo === 'url') return decode ? decodeURIComponent(input) : encodeURIComponent(input);
    if (algo === 'hex') {
      if (decode) {
        const bytes = input.match(/.{1,2}/g) ?? [];
        return bytes.map(b => String.fromCharCode(parseInt(b, 16))).join('');
      }
      return Array.from(new TextEncoder().encode(input)).map(b => b.toString(16).padStart(2, '0')).join('');
    }
  } catch {
    throw new Error('Entrée invalide pour ce décodage');
  }
  return '';
}

export default function CryptoToolsForm() {
  const [mode, setMode] = useState<Mode>('hash');

  // Hash state
  const [hashInput, setHashInput] = useState('');
  const [hashAlgo, setHashAlgo] = useState<HashAlgo>('sha256');
  const [hashResult, setHashResult] = useState('');

  // Encode state
  const [encodeInput, setEncodeInput] = useState('');
  const [encodeAlgo, setEncodeAlgo] = useState<EncodeAlgo>('base64');
  const [encodeResult, setEncodeResult] = useState('');
  const [encodeDirection, setEncodeDirection] = useState<'encode' | 'decode'>('encode');

  // HMAC state
  const [hmacInput, setHmacInput] = useState('');
  const [hmacKey, setHmacKey] = useState('');
  const [hmacAlgo, setHmacAlgo] = useState<HmacAlgo>('sha256');
  const [hmacResult, setHmacResult] = useState('');

  // bcrypt state
  const [bcryptInput, setBcryptInput] = useState('');
  const [bcryptMode, setBcryptMode] = useState<BcryptMode>('hash');
  const [bcryptHash, setBcryptHash] = useState('');
  const [saltRounds, setSaltRounds] = useState(10);
  const [bcryptResult, setBcryptResult] = useState('');
  const [bcryptMatch, setBcryptMatch] = useState<boolean | null>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [copiedKey, setCopiedKey] = useState('');

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(''), 2000);
  };

  const callApi = async (body: object) => {
    const res = await fetch('/api/crypto', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Erreur serveur');
    return data;
  };

  const handleHash = async () => {
    if (!hashInput.trim()) return;
    setIsLoading(true);
    setError('');
    setHashResult('');
    try {
      const data = await callApi({ operation: 'hash', input: hashInput, algorithm: hashAlgo });
      setHashResult(data.result);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEncode = () => {
    if (!encodeInput.trim()) return;
    setError('');
    setEncodeResult('');
    try {
      const result = encodeClientSide(encodeInput, encodeAlgo, encodeDirection === 'decode');
      setEncodeResult(result);
    } catch (e) {
      setError((e as Error).message);
    }
  };

  const handleHmac = async () => {
    if (!hmacInput.trim()) return;
    setIsLoading(true);
    setError('');
    setHmacResult('');
    try {
      const data = await callApi({ operation: 'hmac', input: hmacInput, algorithm: hmacAlgo, key: hmacKey });
      setHmacResult(data.result);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBcrypt = async () => {
    if (!bcryptInput.trim()) return;
    setIsLoading(true);
    setError('');
    setBcryptResult('');
    setBcryptMatch(null);
    try {
      if (bcryptMode === 'hash') {
        const data = await callApi({ operation: 'bcrypt-hash', input: bcryptInput, saltRounds });
        setBcryptResult(data.result);
      } else {
        const data = await callApi({ operation: 'bcrypt-verify', input: bcryptInput, hashToVerify: bcryptHash });
        setBcryptResult(data.result);
        setBcryptMatch(data.match);
      }
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  const modes: { key: Mode; label: string; desc: string }[] = [
    { key: 'hash', label: 'Hachage', desc: 'MD5, SHA-1, SHA-256, SHA-512' },
    { key: 'encode', label: 'Encodage', desc: 'Base64, URL, Hex' },
    { key: 'hmac', label: 'HMAC', desc: 'Hash avec clé secrète' },
    { key: 'bcrypt', label: 'bcrypt', desc: 'Hash sécurisé, vérification' },
  ];

  const ResultBox = ({ value, id, label }: { value: string; id: string; label?: string }) => (
    <div className="space-y-2">
      {label && <label className="block text-xs text-gray-400">{label}</label>}
      <div className="relative">
        <textarea
          readOnly
          value={value}
          rows={value.includes('$2') ? 3 : 2}
          className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-green-300 text-sm font-mono resize-none focus:outline-none"
        />
        {value && (
          <button
            onClick={() => copyToClipboard(value, id)}
            className="absolute top-2 right-2 text-xs px-2 py-1 rounded bg-gray-700 hover:bg-gray-600 text-gray-300 transition"
          >
            {copiedKey === id ? '✓' : 'Copier'}
          </button>
        )}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Mode tabs */}
      <div className="flex flex-wrap gap-2">
        {modes.map(m => (
          <button
            key={m.key}
            onClick={() => { setMode(m.key); setError(''); }}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              mode === m.key
                ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600 border border-gray-600'
            }`}
          >
            <span className="font-semibold">{m.label}</span>
            <span className="hidden sm:inline text-xs opacity-70 ml-2">— {m.desc}</span>
          </button>
        ))}
      </div>

      {/* ── HASH ── */}
      {mode === 'hash' && (
        <div className="space-y-4">
          <div>
            <label className="block text-xs text-gray-400 mb-1">Texte à hacher</label>
            <textarea
              value={hashInput}
              onChange={e => setHashInput(e.target.value)}
              rows={4}
              placeholder="Entrez votre texte..."
              className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white text-sm font-mono placeholder-gray-600 focus:outline-none focus:border-emerald-500 resize-none"
            />
          </div>

          <div className="flex gap-3 items-end">
            <div className="flex-1">
              <label className="block text-xs text-gray-400 mb-1">Algorithme</label>
              <select
                value={hashAlgo}
                onChange={e => setHashAlgo(e.target.value as HashAlgo)}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-emerald-500"
              >
                {HASH_ALGOS.map(a => <option key={a.value} value={a.value}>{a.label}</option>)}
              </select>
            </div>
            <button
              onClick={handleHash}
              disabled={isLoading || !hashInput.trim()}
              className="px-6 py-2 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 disabled:opacity-50 text-white font-semibold transition"
            >
              {isLoading ? 'Calcul...' : 'Hacher'}
            </button>
          </div>

          {hashResult && <ResultBox value={hashResult} id="hash" label="Résultat" />}
        </div>
      )}

      {/* ── ENCODAGE ── */}
      {mode === 'encode' && (
        <div className="space-y-4">
          <div className="flex gap-3 items-end flex-wrap">
            <div className="flex-1 min-w-32">
              <label className="block text-xs text-gray-400 mb-1">Méthode</label>
              <select
                value={encodeAlgo}
                onChange={e => { setEncodeAlgo(e.target.value as EncodeAlgo); setEncodeResult(''); }}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-emerald-500"
              >
                <option value="base64">Base64</option>
                <option value="base64url">Base64 URL-safe</option>
                <option value="url">URL encode</option>
                <option value="hex">Hexadécimal</option>
              </select>
            </div>
            <div className="flex rounded-lg overflow-hidden border border-gray-600 self-end">
              {(['encode', 'decode'] as const).map(d => (
                <button
                  key={d}
                  onClick={() => { setEncodeDirection(d); setEncodeResult(''); }}
                  className={`px-4 py-2 text-sm font-medium transition ${
                    encodeDirection === d
                      ? 'bg-emerald-600 text-white'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  {d === 'encode' ? 'Encoder' : 'Décoder'}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-gray-400 mb-1">Entrée</label>
              <textarea
                value={encodeInput}
                onChange={e => setEncodeInput(e.target.value)}
                rows={6}
                placeholder="Texte à traiter..."
                className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white text-sm font-mono placeholder-gray-600 focus:outline-none focus:border-emerald-500 resize-none"
              />
            </div>
            <div className="relative">
              <label className="block text-xs text-gray-400 mb-1">Résultat</label>
              <textarea
                readOnly
                value={encodeResult}
                rows={6}
                placeholder="Le résultat apparaîtra ici..."
                className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-green-300 text-sm font-mono placeholder-gray-600 focus:outline-none resize-none"
              />
              {encodeResult && (
                <button
                  onClick={() => copyToClipboard(encodeResult, 'encode')}
                  className="absolute top-7 right-2 text-xs px-2 py-1 rounded bg-gray-700 hover:bg-gray-600 text-gray-300 transition"
                >
                  {copiedKey === 'encode' ? '✓' : 'Copier'}
                </button>
              )}
            </div>
          </div>

          <button
            onClick={handleEncode}
            disabled={!encodeInput.trim()}
            className="w-full py-2.5 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 disabled:opacity-50 text-white font-semibold transition"
          >
            {encodeDirection === 'encode' ? 'Encoder' : 'Décoder'}
          </button>
        </div>
      )}

      {/* ── HMAC ── */}
      {mode === 'hmac' && (
        <div className="space-y-4">
          <div className="rounded-lg bg-blue-900/20 border border-blue-700/30 px-4 py-3 text-blue-300 text-xs">
            HMAC (Hash-based Message Authentication Code) : hash cryptographique authentifié avec une clé secrète. Permet de vérifier à la fois l'intégrité et l'authenticité d'un message.
          </div>

          <div>
            <label className="block text-xs text-gray-400 mb-1">Message</label>
            <textarea
              value={hmacInput}
              onChange={e => setHmacInput(e.target.value)}
              rows={3}
              placeholder="Message à authentifier..."
              className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white text-sm font-mono placeholder-gray-600 focus:outline-none focus:border-emerald-500 resize-none"
            />
          </div>

          <div>
            <label className="block text-xs text-gray-400 mb-1">Clé secrète</label>
            <input
              type="text"
              value={hmacKey}
              onChange={e => setHmacKey(e.target.value)}
              placeholder="Votre clé secrète..."
              className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2.5 text-white text-sm font-mono placeholder-gray-600 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="flex gap-3 items-end">
            <div className="flex-1">
              <label className="block text-xs text-gray-400 mb-1">Algorithme</label>
              <select
                value={hmacAlgo}
                onChange={e => setHmacAlgo(e.target.value as HmacAlgo)}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-emerald-500"
              >
                <option value="sha256">HMAC-SHA-256</option>
                <option value="sha512">HMAC-SHA-512</option>
              </select>
            </div>
            <button
              onClick={handleHmac}
              disabled={isLoading || !hmacInput.trim() || !hmacKey.trim()}
              className="px-6 py-2 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 disabled:opacity-50 text-white font-semibold transition"
            >
              {isLoading ? 'Calcul...' : 'Calculer'}
            </button>
          </div>

          {hmacResult && <ResultBox value={hmacResult} id="hmac" label="Signature HMAC" />}
        </div>
      )}

      {/* ── BCRYPT ── */}
      {mode === 'bcrypt' && (
        <div className="space-y-4">
          <div className="rounded-lg bg-orange-900/20 border border-orange-700/30 px-4 py-3 text-orange-300 text-xs">
            bcrypt est un algorithme de hachage lent conçu pour les mots de passe. Il intègre un salt automatique et un facteur de coût réglable.
          </div>

          {/* Mode toggle */}
          <div className="flex rounded-lg overflow-hidden border border-gray-600 w-fit">
            {(['hash', 'verify'] as BcryptMode[]).map(m => (
              <button
                key={m}
                onClick={() => { setBcryptMode(m); setBcryptResult(''); setBcryptMatch(null); }}
                className={`px-5 py-2 text-sm font-medium transition ${
                  bcryptMode === m
                    ? 'bg-emerald-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                {m === 'hash' ? 'Hacher' : 'Vérifier'}
              </button>
            ))}
          </div>

          <div>
            <label className="block text-xs text-gray-400 mb-1">
              {bcryptMode === 'verify' ? 'Mot de passe en clair' : 'Texte à hacher'}
            </label>
            <input
              type="text"
              value={bcryptInput}
              onChange={e => setBcryptInput(e.target.value)}
              placeholder="Entrez votre texte..."
              className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2.5 text-white text-sm font-mono placeholder-gray-600 focus:outline-none focus:border-emerald-500"
            />
          </div>

          {bcryptMode === 'verify' && (
            <div>
              <label className="block text-xs text-gray-400 mb-1">Hash bcrypt à vérifier</label>
              <input
                type="text"
                value={bcryptHash}
                onChange={e => setBcryptHash(e.target.value)}
                placeholder="$2b$10$..."
                className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2.5 text-white text-sm font-mono placeholder-gray-600 focus:outline-none focus:border-emerald-500"
              />
            </div>
          )}

          {bcryptMode === 'hash' && (
            <div>
              <label className="block text-xs text-gray-400 mb-1">
                Facteur de coût — {SALT_ITERATIONS[saltRounds]}
              </label>
              <div className="flex gap-2 flex-wrap">
                {SALT_ROUNDS.map(r => (
                  <button
                    key={r}
                    onClick={() => setSaltRounds(r)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-mono transition border ${
                      saltRounds === r
                        ? 'bg-emerald-600 border-emerald-500 text-white'
                        : 'bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600'
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
              {saltRounds >= 12 && (
                <p className="text-xs text-yellow-500 mt-1">⚠ Coût élevé — le calcul peut prendre plusieurs secondes</p>
              )}
            </div>
          )}

          <button
            onClick={handleBcrypt}
            disabled={isLoading || !bcryptInput.trim() || (bcryptMode === 'verify' && !bcryptHash.trim())}
            className="w-full py-2.5 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 disabled:opacity-50 text-white font-semibold transition"
          >
            {isLoading
              ? bcryptMode === 'hash' ? 'Hachage en cours...' : 'Vérification...'
              : bcryptMode === 'hash' ? 'Générer le hash' : 'Vérifier le hash'}
          </button>

          {bcryptResult && (
            <div className={`rounded-lg px-4 py-3 border ${
              bcryptMode === 'verify'
                ? bcryptMatch
                  ? 'bg-green-900/30 border-green-700/50 text-green-300'
                  : 'bg-red-900/30 border-red-700/50 text-red-300'
                : 'bg-gray-900 border-gray-700'
            }`}>
              <div className="flex items-start justify-between gap-2">
                <p className={`text-sm font-mono break-all ${bcryptMode === 'hash' ? 'text-green-300' : ''}`}>
                  {bcryptResult}
                </p>
                {bcryptMode === 'hash' && (
                  <button
                    onClick={() => copyToClipboard(bcryptResult, 'bcrypt')}
                    className="shrink-0 text-xs px-2 py-1 rounded bg-gray-700 hover:bg-gray-600 text-gray-300 transition"
                  >
                    {copiedKey === 'bcrypt' ? '✓' : 'Copier'}
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="rounded-lg bg-red-900/30 border border-red-700/50 px-4 py-3 text-red-400 text-sm">
          {error}
        </div>
      )}
    </div>
  );
}
