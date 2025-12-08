'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp, ExternalLink, Copy, CheckCircle2 } from 'lucide-react';

interface Citation {
  citation_id?: string;
  citation_index: number;
  doc_id: string;
  title: string;
  snippet: string;
  url?: string;
  relevance_score?: number;
}

interface CitationsFootnotesProps {
  citations: Citation[];
}

export default function CitationsFootnotes({ citations }: CitationsFootnotesProps) {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  if (!citations || citations.length === 0) {
    return null;
  }

  const copyToClipboard = async (text: string, index: number) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <div className="mt-12 pt-8 border-t border-midnight-700">
      <h3 className="text-xl font-display font-bold text-white mb-6 flex items-center gap-2">
        <span className="text-2xl">📚</span>
        Nguồn tham khảo
      </h3>

      <div className="space-y-3">
        {citations.map((citation, idx) => {
          const isExpanded = expandedIndex === idx;

          return (
            <div
              key={citation.citation_id || idx}
              id={`citation-${citation.citation_index}`}
              className="glass-card rounded-lg overflow-hidden scroll-mt-8"
            >
              {/* Header */}
              <button
                onClick={() => setExpandedIndex(isExpanded ? null : idx)}
                className="w-full px-5 py-4 flex items-center justify-between hover:bg-midnight-800/30 transition-colors text-left"
              >
                <div className="flex-1 flex items-start gap-4">
                  {/* Citation Number Badge */}
                  <span className="flex-shrink-0 w-8 h-8 bg-coral-500/20 text-coral-400 rounded-full flex items-center justify-center font-bold text-sm border border-coral-500/30">
                    [{citation.citation_index}]
                  </span>

                  {/* Title and URL */}
                  <div className="flex-1 min-w-0">
                    <h4 className="text-white font-semibold mb-1">{citation.title}</h4>
                    {citation.url && (
                      <a
                        href={citation.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="text-mint-400 text-sm hover:underline flex items-center gap-1 max-w-full truncate"
                      >
                        <span className="truncate">{citation.url}</span>
                        <ExternalLink className="w-3 h-3 flex-shrink-0" />
                      </a>
                    )}
                    {citation.relevance_score !== undefined && (
                      <div className="mt-2 flex items-center gap-2">
                        <div className="flex-1 max-w-xs h-1.5 bg-midnight-700 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-mint-500 to-mint-400"
                            style={{ width: `${citation.relevance_score * 100}%` }}
                          />
                        </div>
                        <span className="text-midnight-400 text-xs">
                          {(citation.relevance_score * 100).toFixed(0)}% relevant
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Expand Icon */}
                <div className="flex-shrink-0 ml-4">
                  {isExpanded ? (
                    <ChevronUp className="w-5 h-5 text-midnight-400" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-midnight-400" />
                  )}
                </div>
              </button>

              {/* Expanded Content */}
              {isExpanded && (
                <div className="px-5 pb-4 border-t border-midnight-800">
                  <div className="pt-4">
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <p className="text-sm font-medium text-midnight-400">Trích đoạn:</p>
                      <button
                        onClick={() => copyToClipboard(citation.snippet, idx)}
                        className="flex items-center gap-2 px-3 py-1 bg-midnight-800 hover:bg-midnight-700 text-midnight-300 hover:text-white rounded-lg transition-all text-sm"
                      >
                        {copiedIndex === idx ? (
                          <>
                            <CheckCircle2 className="w-4 h-4 text-mint-400" />
                            Copied!
                          </>
                        ) : (
                          <>
                            <Copy className="w-4 h-4" />
                            Copy
                          </>
                        )}
                      </button>
                    </div>
                    <div className="bg-midnight-800/50 border border-midnight-700 rounded-lg p-4">
                      <p className="text-midnight-200 leading-relaxed">{citation.snippet}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-6 p-4 bg-midnight-800/30 rounded-lg border border-midnight-700">
        <p className="text-midnight-400 text-sm">
          💡 <strong>Lưu ý:</strong> Các nguồn này được truy xuất tự động từ knowledge base thông qua RAG (Retrieval Augmented Generation). Độ chính xác phụ thuộc vào chất lượng tài liệu gốc.
        </p>
      </div>
    </div>
  );
}
