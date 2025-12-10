'use client';

import { motion } from 'framer-motion';
import { CopyButton } from './CopyButton';
import {
  BookOpen,
  Calendar,
  Clock,
  User,
  Tag,
  Share2,
  Bookmark,
  MessageCircle,
} from 'lucide-react';

interface BlogPreviewProps {
  content: string;
  title?: string;
  author?: string;
  readTime?: number;
}

export function BlogPreview({
  content,
  title = 'Blog Summary',
  author = 'AI Content Studio',
  readTime,
}: BlogPreviewProps) {
  const wordCount = content.split(/\s+/).filter(w => w.length > 0).length;
  const calculatedReadTime = readTime || Math.ceil(wordCount / 200);
  
  const charCount = content.length;
  const idealWordCount = 200;
  const currentWordCount = wordCount;
  const wordCountColor = currentWordCount > idealWordCount * 1.5 
    ? 'text-amber-400' 
    : currentWordCount < idealWordCount * 0.5 
    ? 'text-amber-400'
    : 'text-emerald-400';

  const formatContent = (text: string) => {
    return text.split('\n').map((line, i) => {
      // Handle key takeaways or bullet points
      if (line.startsWith('• ') || line.startsWith('- ') || line.startsWith('✓ ')) {
        return (
          <li key={i} className="flex items-start gap-2 my-1">
            <span className="text-purple-500 mt-1">•</span>
            <span>{line.slice(2)}</span>
          </li>
        );
      }
      if (line.trim() === '') return <br key={i} />;
      return <p key={i} className="my-2">{line}</p>;
    });
  };

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-lg font-semibold text-white">Blog Summary</span>
          <span className="px-2 py-0.5 bg-purple-500/20 text-purple-400 text-xs rounded-full">
            ~{idealWordCount} words
          </span>
        </div>
        <CopyButton text={content} label="Copy" variant="outline" size="sm" />
      </div>

      {/* Blog Card */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-[#1A1A2E] rounded-xl border border-gray-200 dark:border-purple-900/30 overflow-hidden shadow-lg"
      >
        {/* Featured Image Placeholder */}
        <div className="h-32 bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400 relative overflow-hidden">
          <div className="absolute inset-0 bg-black/20" />
          <div className="absolute bottom-4 left-4 right-4">
            <span className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-white text-xs font-medium">
              Featured Summary
            </span>
          </div>
          <div className="absolute top-4 right-4">
            <BookOpen className="w-8 h-8 text-white/50" />
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Meta Info */}
          <div className="flex items-center gap-4 mb-4 text-sm text-gray-500 dark:text-gray-400">
            <div className="flex items-center gap-1">
              <User className="w-4 h-4" />
              <span>{author}</span>
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              <span>{new Date().toLocaleDateString()}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              <span>{calculatedReadTime} min read</span>
            </div>
          </div>

          {/* Title */}
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 leading-tight">
            {title}
          </h2>

          {/* Summary Content */}
          <div className="text-gray-700 dark:text-gray-300 leading-relaxed prose prose-sm dark:prose-invert max-w-none">
            <ul className="list-none pl-0">
              {formatContent(content)}
            </ul>
          </div>

          {/* Tags */}
          <div className="flex items-center gap-2 mt-6 flex-wrap">
            <Tag className="w-4 h-4 text-gray-400" />
            {['Content', 'Marketing', 'Strategy'].map((tag) => (
              <span
                key={tag}
                className="px-2 py-1 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 text-xs rounded-full hover:bg-purple-100 dark:hover:bg-purple-900/30 cursor-pointer transition-colors"
              >
                #{tag}
              </span>
            ))}
          </div>

          {/* Action Bar */}
          <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-4">
              <button className="flex items-center gap-1.5 text-gray-500 hover:text-purple-500 transition-colors">
                <MessageCircle className="w-5 h-5" />
                <span className="text-sm">12</span>
              </button>
              <button className="flex items-center gap-1.5 text-gray-500 hover:text-purple-500 transition-colors">
                <Share2 className="w-5 h-5" />
                <span className="text-sm">Share</span>
              </button>
            </div>
            <button className="flex items-center gap-1.5 text-gray-500 hover:text-purple-500 transition-colors">
              <Bookmark className="w-5 h-5" />
              <span className="text-sm">Save</span>
            </button>
          </div>
        </div>

        {/* Word Count Stats */}
        <div className="px-6 py-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#16162A]">
          <div className="flex items-center justify-between text-sm">
            <span className={wordCountColor}>
              {currentWordCount} words (target: ~{idealWordCount})
            </span>
            <span className="text-gray-500 dark:text-gray-400">
              {charCount} characters
            </span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}


