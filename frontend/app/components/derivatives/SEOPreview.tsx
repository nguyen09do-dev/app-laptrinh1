'use client';

import { motion } from 'framer-motion';
import { CopyButton } from './CopyButton';
import { Search, Globe, ExternalLink, Info } from 'lucide-react';

interface SEOPreviewProps {
  description: string;
  title?: string;
  url?: string;
}

export function SEOPreview({
  description,
  title = 'Your Page Title - AI Content Studio',
  url = 'https://aicontentstudio.com/blog/article',
}: SEOPreviewProps) {
  const charCount = description.length;
  const minLimit = 150;
  const maxLimit = 160;
  
  const getCharStatus = () => {
    if (charCount < minLimit) {
      return { color: 'text-amber-400', status: 'Too short', bgColor: 'bg-amber-500/20' };
    }
    if (charCount > maxLimit) {
      return { color: 'text-red-400', status: 'Too long', bgColor: 'bg-red-500/20' };
    }
    return { color: 'text-emerald-400', status: 'Perfect', bgColor: 'bg-emerald-500/20' };
  };

  const charStatus = getCharStatus();

  // Truncate description for preview (Google typically shows ~155-160 chars)
  const truncatedDescription = description.length > 160 
    ? description.slice(0, 157) + '...'
    : description;

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-lg font-semibold text-white">SEO Meta Description</span>
          <span className={`px-2 py-0.5 ${charStatus.bgColor} ${charStatus.color} text-xs rounded-full`}>
            {charStatus.status}
          </span>
        </div>
        <CopyButton text={description} label="Copy" variant="outline" size="sm" />
      </div>

      {/* Google Search Preview */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-4"
      >
        {/* Google Search Bar */}
        <div className="bg-white dark:bg-[#202124] rounded-full border border-gray-200 dark:border-gray-700 p-3 flex items-center gap-3 shadow-sm">
          <Search className="w-5 h-5 text-gray-400" />
          <span className="text-gray-600 dark:text-gray-300 flex-1">your search query</span>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center">
              <span className="text-white text-xs font-bold">G</span>
            </div>
          </div>
        </div>

        {/* Search Result Preview */}
        <div className="bg-white dark:bg-[#202124] rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">
            About 1,234,567 results (0.42 seconds)
          </div>
          
          {/* Result Item */}
          <div className="mt-4 group">
            {/* URL Breadcrumb */}
            <div className="flex items-center gap-2 text-sm">
              <Globe className="w-4 h-4 text-gray-400" />
              <span className="text-gray-600 dark:text-gray-400">{url}</span>
              <button className="opacity-0 group-hover:opacity-100 transition-opacity">
                <ExternalLink className="w-3 h-3 text-gray-400" />
              </button>
            </div>

            {/* Title */}
            <h3 className="text-xl text-[#1a0dab] dark:text-[#8ab4f8] hover:underline cursor-pointer mt-1 leading-snug">
              {title}
            </h3>

            {/* Meta Description */}
            <p className="text-sm text-gray-600 dark:text-[#bdc1c6] mt-1 leading-relaxed">
              {truncatedDescription}
            </p>
          </div>

          {/* Related Searches Simulation */}
          <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              People also ask
            </h4>
            <div className="space-y-2">
              {['What is content marketing?', 'How to improve SEO?'].map((q) => (
                <div
                  key={q}
                  className="flex items-center justify-between p-2 rounded hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer"
                >
                  <span className="text-sm text-gray-600 dark:text-gray-400">{q}</span>
                  <ExternalLink className="w-4 h-4 text-gray-400" />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Character Count Bar */}
        <div className="bg-midnight-800 rounded-lg p-4 border border-midnight-700">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Info className="w-4 h-4 text-midnight-400" />
              <span className="text-sm text-midnight-300">Character count</span>
            </div>
            <span className={`text-sm font-medium ${charStatus.color}`}>
              {charCount}/{maxLimit}
            </span>
          </div>
          
          {/* Progress Bar */}
          <div className="h-2 bg-midnight-700 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${Math.min((charCount / maxLimit) * 100, 100)}%` }}
              className={`h-full rounded-full ${
                charCount > maxLimit
                  ? 'bg-red-500'
                  : charCount >= minLimit
                  ? 'bg-emerald-500'
                  : 'bg-amber-500'
              }`}
            />
          </div>
          
          {/* Range Indicator */}
          <div className="flex items-center justify-between mt-2 text-xs text-midnight-400">
            <span>Min: {minLimit}</span>
            <span className="text-emerald-400">Ideal: {minLimit}-{maxLimit}</span>
            <span>Max: {maxLimit}</span>
          </div>

          {/* Tips */}
          <div className="mt-3 p-3 bg-midnight-900/50 rounded-lg">
            <p className="text-xs text-midnight-300">
              💡 <strong>Tip:</strong> Keep your meta description between 150-160 characters. 
              Include your main keyword and a compelling call-to-action.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

