'use client';

import { useState } from 'react';
import { Database, ExternalLink, FileText } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface RAGIndicatorProps {
  citationCount?: number;
  documentCount?: number;
  showDetails?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function RAGIndicator({
  citationCount = 0,
  documentCount = 0,
  showDetails = true,
  size = 'md',
}: RAGIndicatorProps) {
  const [showTooltip, setShowTooltip] = useState(false);

  if (citationCount === 0 && documentCount === 0) {
    return null;
  }

  const sizeClasses = {
    sm: 'text-xs px-2 py-1',
    md: 'text-sm px-3 py-1.5',
    lg: 'text-base px-4 py-2',
  };

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  };

  return (
    <div className="relative inline-block">
      <button
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        className={`
          flex items-center gap-1.5 
          bg-gradient-to-r from-purple-500/20 to-pink-500/20 
          text-purple-300 
          rounded-full 
          border border-purple-400/30 
          hover:border-purple-400/50 
          transition-all
          ${sizeClasses[size]}
        `}
      >
        <Database className={iconSizes[size]} />
        {showDetails && (
          <>
            <span className="font-medium">{citationCount}</span>
            <span className="opacity-70">RAG</span>
          </>
        )}
      </button>

      {/* Tooltip */}
      <AnimatePresence>
        {showTooltip && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50"
          >
            <div className="bg-midnight-800 border border-midnight-700 rounded-xl p-4 shadow-xl min-w-[250px]">
              <div className="flex items-center gap-2 mb-3 pb-3 border-b border-midnight-700">
                <div className="p-2 bg-purple-500/20 rounded-lg">
                  <Database className="w-4 h-4 text-purple-400" />
                </div>
                <div>
                  <div className="text-white font-semibold text-sm">RAG Enhanced</div>
                  <div className="text-midnight-400 text-xs">AI + Knowledge Base</div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-midnight-300 text-sm">
                    <FileText className="w-3.5 h-3.5" />
                    <span>Citations</span>
                  </div>
                  <span className="text-white font-semibold">{citationCount}</span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-midnight-300 text-sm">
                    <Database className="w-3.5 h-3.5" />
                    <span>Documents</span>
                  </div>
                  <span className="text-white font-semibold">{documentCount}</span>
                </div>
              </div>

              <div className="mt-3 pt-3 border-t border-midnight-700">
                <a
                  href="/library?tab=documents"
                  className="flex items-center gap-2 text-xs text-purple-400 hover:text-purple-300 transition-colors"
                >
                  <span>View Knowledge Base</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              {/* Arrow */}
              <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-px">
                <div className="w-3 h-3 bg-midnight-800 border-b border-r border-midnight-700 rotate-45" />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Badge variant - simpler, no tooltip
export function RAGBadge({ count = 0 }: { count?: number }) {
  if (count === 0) return null;

  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-purple-500/20 text-purple-400 text-xs rounded-full border border-purple-400/30">
      <Database className="w-3 h-3" />
      <span>{count}</span>
    </span>
  );
}

export default RAGIndicator;


