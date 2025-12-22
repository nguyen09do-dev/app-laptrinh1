'use client';

import { useState } from 'react';
import { Search } from 'lucide-react';
import { matchesSearch, removeVietnameseAccents, toSlug } from '@/lib/textNormalization';

/**
 * Demo component to showcase Vietnamese text normalization
 * Can be added to any page for testing
 */
export default function SearchDemo() {
  const [searchText, setSearchText] = useState('');
  const [inputText, setInputText] = useState('Tiếng Việt có dấu');

  const sampleTexts = [
    'Tiếng Việt có dấu',
    'Hướng dẫn sử dụng',
    'Công nghệ thông tin',
    'Học máy và trí tuệ nhân tạo',
    'Phát triển ứng dụng web',
  ];

  return (
    <div className="glass-card rounded-2xl p-6">
      <h3 className="text-xl font-semibold text-midnight-100 mb-4">
        🔤 Vietnamese Text Normalization Demo
      </h3>

      <div className="space-y-4">
        {/* Search input */}
        <div>
          <label className="block text-midnight-200 text-sm mb-2">
            Tìm kiếm (thử gõ &quot;tieng viet&quot; hoặc &quot;Tiếng Việt&quot;):
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-midnight-400" />
            <input
              type="text"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              placeholder="Gõ để tìm kiếm..."
              className="w-full pl-10 pr-4 py-2 bg-midnight-900/50 border border-midnight-700 rounded-lg text-midnight-100 placeholder-midnight-400 focus:outline-none focus:border-coral-500"
            />
          </div>
        </div>

        {/* Search results */}
        {searchText && (
          <div className="mt-4">
            <h4 className="text-sm font-medium text-midnight-200 mb-2">
              Kết quả tìm kiếm:
            </h4>
            <div className="space-y-2">
              {sampleTexts.map((text, idx) => {
                const matches = matchesSearch(text, searchText);
                return (
                  <div
                    key={idx}
                    className={`p-3 rounded-lg ${
                      matches
                        ? 'bg-green-500/10 border border-green-500/30'
                        : 'bg-midnight-900/30 border border-midnight-700/50 opacity-40'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {matches && <span className="text-green-400">✓</span>}
                      <span className="text-midnight-100">{text}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Text conversion demo */}
        <div className="mt-6 pt-6 border-t border-midnight-700">
          <h4 className="text-sm font-medium text-midnight-200 mb-2">
            Công cụ chuyển đổi text:
          </h4>
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Nhập text tiếng Việt..."
            className="w-full px-4 py-2 bg-midnight-900/50 border border-midnight-700 rounded-lg text-midnight-100 placeholder-midnight-400 focus:outline-none focus:border-coral-500 mb-3"
          />

          <div className="space-y-2 text-sm">
            <div className="p-3 bg-midnight-900/30 rounded-lg">
              <span className="text-midnight-400">Không dấu:</span>
              <span className="ml-2 text-midnight-100 font-mono">
                {removeVietnameseAccents(inputText)}
              </span>
            </div>
            <div className="p-3 bg-midnight-900/30 rounded-lg">
              <span className="text-midnight-400">URL Slug:</span>
              <span className="ml-2 text-midnight-100 font-mono">
                {toSlug(inputText)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
