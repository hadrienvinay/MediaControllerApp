'use client';

import { useState } from 'react';

const LANGUAGES = [
  { value: 'javascript', label: 'JavaScript' },
  { value: 'typescript', label: 'TypeScript' },
  { value: 'python', label: 'Python' },
  { value: 'java', label: 'Java' },
  { value: 'c', label: 'C' },
  { value: 'cpp', label: 'C++' },
  { value: 'csharp', label: 'C#' },
  { value: 'go', label: 'Go' },
  { value: 'rust', label: 'Rust' },
  { value: 'php', label: 'PHP' },
  { value: 'ruby', label: 'Ruby' },
  { value: 'swift', label: 'Swift' },
  { value: 'kotlin', label: 'Kotlin' },
  { value: 'scala', label: 'Scala' },
  { value: 'r', label: 'R' },
  { value: 'bash', label: 'Bash / Shell' },
  { value: 'sql', label: 'SQL' },
  { value: 'html', label: 'HTML' },
  { value: 'css', label: 'CSS' },
  { value: 'json', label: 'JSON' },
  { value: 'yaml', label: 'YAML' },
  { value: 'xml', label: 'XML' },
];

export default function CodeConverterForm() {
  const [fromLang, setFromLang] = useState('python');
  const [toLang, setToLang] = useState('typescript');
  const [sourceCode, setSourceCode] = useState('');
  const [convertedCode, setConvertedCode] = useState('');
  const [instructions, setInstructions] = useState('');
  const [isConverting, setIsConverting] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [stats, setStats] = useState<{ inputTokens: number; outputTokens: number } | null>(null);

  const handleSwapLanguages = () => {
    setFromLang(toLang);
    setToLang(fromLang);
    setSourceCode(convertedCode);
    setConvertedCode('');
    setStats(null);
  };

  const handleConvert = async () => {
    if (!sourceCode.trim()) return;
    setIsConverting(true);
    setError('');
    setConvertedCode('');
    setStats(null);

    try {
      const res = await fetch('/api/code-convert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: sourceCode, fromLang, toLang, instructions }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Erreur lors de la conversion');
        return;
      }

      setConvertedCode(data.convertedCode);
      setStats({ inputTokens: data.inputTokens, outputTokens: data.outputTokens });
    } catch {
      setError('Erreur réseau — vérifiez votre connexion');
    } finally {
      setIsConverting(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(convertedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const charCount = sourceCode.length;
  const lineCount = sourceCode ? sourceCode.split('\n').length : 0;

  return (
    <div className="space-y-6">
      {/* Language selectors */}
      <div className="flex items-center gap-3">
        <div className="flex-1">
          <label className="block text-xs text-gray-400 mb-1">Langage source</label>
          <select
            value={fromLang}
            onChange={e => setFromLang(e.target.value)}
            className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-purple-500"
          >
            {LANGUAGES.map(l => (
              <option key={l.value} value={l.value}>{l.label}</option>
            ))}
          </select>
        </div>

        <button
          onClick={handleSwapLanguages}
          title="Inverser les langages"
          className="mt-5 p-2 rounded-lg bg-gray-700 hover:bg-gray-600 text-gray-300 hover:text-white transition border border-gray-600 hover:border-purple-500 shrink-0"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
          </svg>
        </button>

        <div className="flex-1">
          <label className="block text-xs text-gray-400 mb-1">Langage cible</label>
          <select
            value={toLang}
            onChange={e => setToLang(e.target.value)}
            className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-purple-500"
          >
            {LANGUAGES.map(l => (
              <option key={l.value} value={l.value}>{l.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Optional instructions */}
      <div>
        <label className="block text-xs text-gray-400 mb-1">Instructions supplémentaires (optionnel)</label>
        <input
          type="text"
          value={instructions}
          onChange={e => setInstructions(e.target.value)}
          placeholder="ex: utilise des async/await, ajoute des types stricts, commente le code..."
          className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-purple-500"
        />
      </div>

      {/* Code editors */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Source */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-300">Code source</label>
            <span className="text-xs text-gray-500">{lineCount} lignes · {charCount} car.</span>
          </div>
          <textarea
            value={sourceCode}
            onChange={e => setSourceCode(e.target.value)}
            placeholder={`Collez votre code ${LANGUAGES.find(l => l.value === fromLang)?.label} ici...`}
            rows={18}
            className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-green-300 text-sm font-mono placeholder-gray-600 focus:outline-none focus:border-purple-500 resize-none"
            spellCheck={false}
          />
        </div>

        {/* Output */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-300">Code converti</label>
            {convertedCode && (
              <button
                onClick={handleCopy}
                className="text-xs px-3 py-1 rounded-md bg-gray-700 hover:bg-gray-600 text-gray-300 hover:text-white transition border border-gray-600"
              >
                {copied ? '✓ Copié !' : 'Copier'}
              </button>
            )}
          </div>
          <div className="relative">
            <textarea
              value={convertedCode}
              readOnly
              placeholder="Le code converti apparaîtra ici..."
              rows={18}
              className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-blue-300 text-sm font-mono placeholder-gray-600 focus:outline-none resize-none"
              spellCheck={false}
            />
            {isConverting && (
              <div className="absolute inset-0 bg-gray-900/70 rounded-lg flex items-center justify-center">
                <div className="flex items-center gap-3 text-purple-400">
                  <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  <span className="text-sm font-medium">Conversion en cours...</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-lg bg-red-900/30 border border-red-700/50 px-4 py-3 text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* Stats */}
      {stats && (
        <p className="text-xs text-gray-500 text-right">
          {stats.inputTokens} tokens en entrée · {stats.outputTokens} tokens en sortie
        </p>
      )}

      {/* Convert button */}
      <button
        onClick={handleConvert}
        disabled={isConverting || !sourceCode.trim() || fromLang === toLang}
        className="w-full py-3 rounded-xl font-semibold bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white transition-all shadow-lg hover:shadow-purple-600/30"
      >
        {isConverting
          ? 'Conversion...'
          : `Convertir ${LANGUAGES.find(l => l.value === fromLang)?.label} → ${LANGUAGES.find(l => l.value === toLang)?.label}`}
      </button>

      {fromLang === toLang && (
        <p className="text-center text-xs text-yellow-500">Les langages source et cible sont identiques.</p>
      )}
    </div>
  );
}
