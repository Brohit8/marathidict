'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

interface DictEntry {
  h: string;  // headword devanagari
  r: string;  // romanized
  f: string;  // full entry
  t: string;  // type
  s: string;  // source
}

export default function Home() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<DictEntry[]>([]);
  const [dictionary, setDictionary] = useState<DictEntry[]>([]);
  const [index, setIndex] = useState<Map<string, number[]>>(new Map());
  const [loading, setLoading] = useState(true);
  const [selectedEntry, setSelectedEntry] = useState<DictEntry | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Load dictionary on mount
  useEffect(() => {
    fetch('/data/dict.json')
      .then(res => res.json())
      .then((data: DictEntry[]) => {
        setDictionary(data);

        // Build prefix index for fast search
        const idx = new Map<string, number[]>();
        data.forEach((entry, i) => {
          const word = entry.h.toLowerCase();
          // Index all prefixes
          for (let len = 1; len <= Math.min(word.length, 6); len++) {
            const prefix = word.slice(0, len);
            if (!idx.has(prefix)) idx.set(prefix, []);
            idx.get(prefix)!.push(i);
          }
        });
        setIndex(idx);
        setLoading(false);
      });
  }, []);

  // Search function
  const search = useCallback((q: string) => {
    if (!q.trim() || dictionary.length === 0) {
      setResults([]);
      return;
    }

    const normalized = q.trim().toLowerCase();

    // Get candidates from index
    const candidateIndices = index.get(normalized.slice(0, Math.min(normalized.length, 6))) || [];

    // Filter to exact prefix matches and sort by length (shorter = more relevant)
    const matches = candidateIndices
      .map(i => dictionary[i])
      .filter(entry => entry.h.toLowerCase().startsWith(normalized))
      .sort((a, b) => a.h.length - b.h.length)
      .slice(0, 10);

    setResults(matches);
  }, [dictionary, index]);

  // Debounced search on query change
  useEffect(() => {
    const timer = setTimeout(() => search(query), 50);
    return () => clearTimeout(timer);
  }, [query, search]);

  // Focus input on load
  useEffect(() => {
    if (!loading && inputRef.current) {
      inputRef.current.focus();
    }
  }, [loading]);

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-stone-950">
      {/* Header */}
      <header className="sticky top-0 z-10 backdrop-blur-xl bg-stone-50/80 dark:bg-stone-950/80 border-b border-stone-200 dark:border-stone-800">
        <div className="max-w-2xl mx-auto px-4 py-6">
          <h1 className="text-2xl font-semibold text-stone-900 dark:text-stone-100 mb-4">
            Marathi to English Dictionary
          </h1>

          {/* Search Input */}
          <div className="relative">
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={loading ? "Loading dictionary..." : "Type a Marathi word..."}
              disabled={loading}
              className="w-full px-4 py-3 text-lg rounded-xl border border-stone-300 dark:border-stone-700
                         bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100
                         placeholder:text-stone-400 dark:placeholder:text-stone-600
                         focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent
                         disabled:opacity-50 transition-all"
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="off"
              spellCheck="false"
            />
            {query && (
              <button
                onClick={() => { setQuery(''); setSelectedEntry(null); }}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-stone-400 hover:text-stone-600 dark:hover:text-stone-300"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>

          {/* Results count */}
          {query && !loading && (
            <p className="mt-2 text-sm text-stone-500 dark:text-stone-400">
              {results.length} {results.length === 1 ? 'result' : 'results'}
            </p>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-2xl mx-auto px-4 py-6">
        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-stone-300 border-t-amber-500"></div>
          </div>
        )}

        {/* Selected Entry Detail */}
        {selectedEntry && (
          <div className="mb-6 p-6 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-sm">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-3xl font-semibold text-stone-900 dark:text-stone-100">
                  {selectedEntry.h}
                </h2>
                {selectedEntry.r && (
                  <p className="text-lg text-stone-500 dark:text-stone-400 mt-1">
                    {selectedEntry.r}
                  </p>
                )}
              </div>
              <button
                onClick={() => setSelectedEntry(null)}
                className="p-2 text-stone-400 hover:text-stone-600 dark:hover:text-stone-300 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="prose prose-stone dark:prose-invert max-w-none">
              <p className="text-stone-700 dark:text-stone-300 whitespace-pre-wrap leading-relaxed">
                {selectedEntry.f}
              </p>
            </div>

            <div className="mt-4 pt-4 border-t border-stone-200 dark:border-stone-800 flex gap-3 text-xs text-stone-400">
              {selectedEntry.s && (
                <span className="px-2 py-1 rounded-full bg-stone-100 dark:bg-stone-800 capitalize">
                  {selectedEntry.s}
                </span>
              )}
            </div>
          </div>
        )}

        {/* Results List */}
        {!loading && results.length > 0 && (
          <ul className="space-y-2">
            {results.map((entry, i) => (
              <li key={`${entry.h}-${i}`}>
                <button
                  onClick={() => setSelectedEntry(entry)}
                  className={`w-full text-left p-4 rounded-xl border transition-all
                    ${selectedEntry?.h === entry.h
                      ? 'border-amber-500 bg-amber-50 dark:bg-amber-950/30'
                      : 'border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 hover:border-stone-300 dark:hover:border-stone-700'
                    }`}
                >
                  <div className="flex items-baseline gap-3">
                    <span className="text-xl font-medium text-stone-900 dark:text-stone-100">
                      {entry.h}
                    </span>
                    {entry.r && (
                      <span className="text-sm text-stone-500 dark:text-stone-400">
                        {entry.r}
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-sm text-stone-600 dark:text-stone-400 line-clamp-2">
                    {entry.f.slice(0, 150)}{entry.f.length > 150 ? '...' : ''}
                  </p>
                </button>
              </li>
            ))}
          </ul>
        )}

        {/* Empty State */}
        {!loading && query && results.length === 0 && (
          <div className="text-center py-20">
            <p className="text-stone-500 dark:text-stone-400">
              &quot;{query}&quot; साठी काही आढळले नाही
            </p>
          </div>
        )}

        {/* Initial State */}
        {!loading && !query && (
          <div className="text-center py-20">
            <p className="text-stone-400 dark:text-stone-500 text-lg">
              Type above to search
            </p>
            <p className="text-stone-400 dark:text-stone-600 text-sm mt-2">
              89,000+ entries from Molesworth & Berntsen
            </p>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="fixed bottom-0 left-0 right-0 py-3 text-center text-xs text-stone-400 dark:text-stone-600 bg-stone-50/80 dark:bg-stone-950/80 backdrop-blur-sm">
        Molesworth (1857) · Berntsen (1982)
      </footer>
    </div>
  );
}
