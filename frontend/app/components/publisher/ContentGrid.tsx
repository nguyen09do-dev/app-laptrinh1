'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, ChevronLeft, ChevronRight, FileText, Clock, CheckCircle2 } from 'lucide-react';

interface ContentItem {
  pack_id?: number;
  content_id?: number;
  title?: string;
  brief_title?: string;
  draft_content: string | null;
  final_content?: string | null;
  word_count: number;
  created_at: string;
  derivatives: any | null;
}

interface ContentGridProps {
  items: ContentItem[];
  selectedItem: ContentItem | null;
  onSelect: (item: ContentItem) => void;
  searchPlaceholder?: string;
  itemsPerPage?: number;
}

export function ContentGrid({
  items,
  selectedItem,
  onSelect,
  searchPlaceholder = 'Search content...',
  itemsPerPage = 6,
}: ContentGridProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  // Filter items based on search
  const filteredItems = items.filter((item) => {
    const title = item.title || item.brief_title || '';
    const content = item.draft_content || item.final_content || '';
    const searchLower = searchQuery.toLowerCase();
    return (
      title.toLowerCase().includes(searchLower) ||
      content.toLowerCase().includes(searchLower)
    );
  });

  // Pagination
  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentItems = filteredItems.slice(startIndex, endIndex);

  // Reset to page 1 when search changes
  const handleSearch = (value: string) => {
    setSearchQuery(value);
    setCurrentPage(1);
  };

  const getItemId = (item: ContentItem) => {
    return item.pack_id || item.content_id || 0;
  };

  const getItemTitle = (item: ContentItem) => {
    return item.title || item.brief_title || 'Untitled';
  };

  const getExcerpt = (item: ContentItem) => {
    const content = item.final_content || item.draft_content || '';
    const lines = content.split('\n').filter(line => line.trim().length > 0);
    const excerpt = lines.slice(0, 2).join(' ');
    return excerpt.length > 150 ? excerpt.substring(0, 150) + '...' : excerpt;
  };

  return (
    <div className="space-y-6">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-midnight-500" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder={searchPlaceholder}
          className="w-full pl-12 pr-4 py-3 bg-midnight-800 border border-midnight-700 rounded-xl text-white placeholder-midnight-500 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
        />
      </div>

      {/* Content Grid */}
      {currentItems.length === 0 ? (
        <div className="text-center py-12">
          <FileText className="w-16 h-16 text-midnight-600 mx-auto mb-4" />
          <p className="text-midnight-400 mb-2">
            {searchQuery ? 'No content found matching your search' : 'No content available'}
          </p>
          {searchQuery && (
            <button
              onClick={() => handleSearch('')}
              className="text-sm text-purple-400 hover:text-purple-300 transition-colors"
            >
              Clear search
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {currentItems.map((item) => {
            const isSelected = selectedItem && getItemId(selectedItem) === getItemId(item);
            
            return (
              <motion.button
                key={getItemId(item)}
                onClick={() => onSelect(item)}
                className={`p-6 rounded-xl border-2 transition-all text-left relative ${
                  isSelected
                    ? 'border-purple-500 bg-purple-500/10 shadow-lg shadow-purple-500/20'
                    : 'border-midnight-700 bg-midnight-800/50 hover:border-midnight-600 hover:shadow-lg'
                }`}
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
              >
                {/* Selected Badge */}
                {isSelected && (
                  <div className="absolute top-3 right-3">
                    <div className="flex items-center gap-1 px-2 py-1 bg-purple-500 text-white text-xs font-medium rounded-lg">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>Selected</span>
                    </div>
                  </div>
                )}

                {/* Content */}
                <div className="space-y-3">
                  <h3 className="font-semibold text-white pr-20">
                    {getItemTitle(item)}
                  </h3>
                  
                  <p className="text-sm text-midnight-400 line-clamp-2">
                    {getExcerpt(item)}
                  </p>

                  <div className="flex items-center gap-4 text-xs text-midnight-500">
                    <span className="flex items-center gap-1">
                      <FileText className="w-3 h-3" />
                      {item.word_count} words
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(item.created_at).toLocaleDateString()}
                    </span>
                  </div>

                  {/* Derivatives Badge */}
                  {item.derivatives && (
                    <div className="pt-2 border-t border-midnight-700">
                      <span className="inline-flex items-center px-2 py-1 bg-emerald-500/20 text-emerald-400 text-xs rounded-lg">
                        ✓ Derivatives Ready
                      </span>
                    </div>
                  )}
                </div>
              </motion.button>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
            className="p-2 bg-midnight-800 hover:bg-midnight-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-1">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`min-w-[40px] px-3 py-2 rounded-lg font-medium transition-all ${
                  currentPage === page
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                    : 'bg-midnight-800 text-midnight-400 hover:bg-midnight-700 hover:text-white'
                }`}
              >
                {page}
              </button>
            ))}
          </div>

          <button
            onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
            className="p-2 bg-midnight-800 hover:bg-midnight-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* Results Count */}
      {filteredItems.length > 0 && (
        <p className="text-center text-sm text-midnight-500">
          Showing {startIndex + 1}–{Math.min(endIndex, filteredItems.length)} of{' '}
          {filteredItems.length} {filteredItems.length === 1 ? 'item' : 'items'}
        </p>
      )}
    </div>
  );
}

