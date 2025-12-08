'use client';

import { useState } from 'react';
import { Search, Upload, FileText, Loader2 } from 'lucide-react';
import { showToast } from '@/lib/toast';

export default function TestRAGPage() {
  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchType, setSearchType] = useState<'chunks' | 'documents' | 'hybrid'>('chunks');

  const handleSearch = async () => {
    if (!query.trim()) {
      showToast.error('Please enter a search query');
      return;
    }

    setIsSearching(true);
    try {
      const response = await fetch(
        `http://localhost:3001/api/rag/search?query=${encodeURIComponent(query)}&search_type=${searchType}&match_count=5`
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Search failed');
      }

      const data = await response.json();
      setSearchResults(data.results || []);
      
      if (data.results.length === 0) {
        showToast.info('No results found. Try a different query.');
      } else {
        showToast.success(`Found ${data.results.length} results`);
      }
    } catch (error) {
      console.error('Search error:', error);
      showToast.error(error instanceof Error ? error.message : 'Search failed');
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-midnight-950 via-midnight-900 to-midnight-950 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-display font-bold text-white mb-2">RAG Search Test</h1>
          <p className="text-midnight-300">
            Test semantic search functionality with your uploaded documents
          </p>
        </div>

        {/* Search Type Selector */}
        <div className="glass-card p-4 rounded-xl mb-6">
          <label className="block text-midnight-300 mb-2 font-medium">Search Type</label>
          <div className="flex gap-3">
            <button
              onClick={() => setSearchType('chunks')}
              className={`px-4 py-2 rounded-lg transition-all ${
                searchType === 'chunks'
                  ? 'bg-coral-500 text-white'
                  : 'bg-midnight-800/50 text-midnight-300 hover:bg-midnight-800'
              }`}
            >
              Chunks (Granular)
            </button>
            <button
              onClick={() => setSearchType('documents')}
              className={`px-4 py-2 rounded-lg transition-all ${
                searchType === 'documents'
                  ? 'bg-coral-500 text-white'
                  : 'bg-midnight-800/50 text-midnight-300 hover:bg-midnight-800'
              }`}
            >
              Documents (Full)
            </button>
            <button
              onClick={() => setSearchType('hybrid')}
              className={`px-4 py-2 rounded-lg transition-all ${
                searchType === 'hybrid'
                  ? 'bg-coral-500 text-white'
                  : 'bg-midnight-800/50 text-midnight-300 hover:bg-midnight-800'
              }`}
            >
              Hybrid
            </button>
          </div>
        </div>

        {/* Search Input */}
        <div className="glass-card p-6 rounded-xl mb-6">
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-midnight-400" />
              <input
                type="text"
                placeholder="Nhập câu hỏi hoặc mô tả gần giống với nội dung tài liệu đã lưu..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="w-full pl-10 pr-4 py-3 bg-midnight-800/50 border border-midnight-700 rounded-lg text-white placeholder-midnight-500 focus:outline-none focus:border-coral-500 transition-colors"
              />
            </div>
            <button
              onClick={handleSearch}
              disabled={isSearching || !query.trim()}
              className="px-6 py-3 bg-gradient-to-r from-coral-500 to-coral-600 text-white rounded-lg hover:shadow-lg hover:shadow-coral-500/50 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isSearching ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Searching...
                </>
              ) : (
                <>
                  <Search className="w-5 h-5" />
                  Search
                </>
              )}
            </button>
          </div>
          <p className="text-midnight-400 text-sm mt-3">
            Ví dụ: Nếu tài liệu nói về "AI trong marketing", hãy thử tìm với từ khóa "trí tuệ nhân tạo giúp quảng cáo"
          </p>
        </div>

        {/* Results */}
        {searchResults.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-white mb-4">
              Results ({searchResults.length})
            </h2>
            {searchResults.map((result, index) => (
              <div key={index} className="glass-card p-6 rounded-xl">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-white mb-1">{result.title}</h3>
                    {result.author && (
                      <p className="text-midnight-400 text-sm">By {result.author}</p>
                    )}
                  </div>
                  <div className="text-right">
                    <div className="text-coral-400 font-bold">
                      {(result.similarity * 100).toFixed(1)}% match
                    </div>
                    {result.chunk_index !== undefined && (
                      <div className="text-midnight-400 text-xs">Chunk #{result.chunk_index}</div>
                    )}
                  </div>
                </div>
                
                <div className="bg-midnight-800/50 rounded-lg p-4 mb-3">
                  <p className="text-midnight-200 whitespace-pre-wrap">{result.content}</p>
                </div>

                <div className="flex items-center gap-4 text-sm">
                  {result.url && (
                    <a
                      href={result.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-coral-400 hover:text-coral-300"
                    >
                      View Source
                    </a>
                  )}
                  {result.tags && result.tags.length > 0 && (
                    <div className="flex gap-2">
                      {result.tags.map((tag: string, i: number) => (
                        <span
                          key={i}
                          className="px-2 py-1 bg-midnight-700 rounded text-midnight-300 text-xs"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {!isSearching && searchResults.length === 0 && query && (
          <div className="glass-card p-12 rounded-xl text-center">
            <FileText className="w-16 h-16 text-midnight-500 mx-auto mb-4" />
            <p className="text-midnight-400">No results found. Try a different query.</p>
          </div>
        )}
      </div>
    </div>
  );
}

