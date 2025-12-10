'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { CopyButton } from './CopyButton';
import {
  ThumbsUp,
  MessageSquare,
  Repeat,
  Send,
  MoreHorizontal,
  Globe,
  Bookmark,
} from 'lucide-react';

interface LinkedInPreviewProps {
  content: string;
  username?: string;
  title?: string;
  avatar?: string;
  connections?: string;
}

export function LinkedInPreview({
  content,
  username = 'AI Content Studio',
  title = 'Content Marketing Platform | AI-Powered',
  avatar,
  connections = '500+',
}: LinkedInPreviewProps) {
  const [liked, setLiked] = useState(false);
  const [showFullContent, setShowFullContent] = useState(false);

  const charCount = content.length;
  const charLimit = 3000;
  const isOverLimit = charCount > charLimit;
  const charColor = isOverLimit ? 'text-red-400' : charCount > 2500 ? 'text-amber-400' : 'text-midnight-400';

  // Truncate content for preview
  const truncatedContent = content.length > 300 && !showFullContent
    ? content.slice(0, 300) + '...'
    : content;

  const formatContent = (text: string) => {
    // Convert markdown-style formatting to styled spans
    return text
      .split('\n')
      .map((line, i) => {
        // Handle bullet points
        if (line.startsWith('• ') || line.startsWith('- ')) {
          return (
            <div key={i} className="flex items-start gap-2 my-1">
              <span className="text-[#0A66C2]">•</span>
              <span>{line.slice(2)}</span>
            </div>
          );
        }
        // Handle hashtags
        const hashtagRegex = /#(\w+)/g;
        const parts = line.split(hashtagRegex);
        return (
          <p key={i} className="my-1">
            {parts.map((part, j) => 
              j % 2 === 1 ? (
                <span key={j} className="text-[#0A66C2] hover:underline cursor-pointer">
                  #{part}
                </span>
              ) : (
                part
              )
            )}
          </p>
        );
      });
  };

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-lg font-semibold text-white">LinkedIn Post</span>
          <span className="px-2 py-0.5 bg-[#0A66C2]/20 text-[#0A66C2] text-xs rounded-full">
            Professional
          </span>
        </div>
        <CopyButton text={content} label="Copy" variant="outline" size="sm" />
      </div>

      {/* LinkedIn Card */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-[#1B1F23] rounded-lg border border-gray-200 dark:border-[#38434F] overflow-hidden"
      >
        {/* Post Header */}
        <div className="p-4">
          <div className="flex items-start gap-3">
            {/* Avatar */}
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#0A66C2] to-[#004182] flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
              {avatar ? (
                <img src={avatar} alt={username} className="w-full h-full rounded-full object-cover" />
              ) : (
                username.charAt(0)
              )}
            </div>

            {/* User Info */}
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white hover:text-[#0A66C2] cursor-pointer">
                    {username}
                  </h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-1">{title}</p>
                  <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                    <span>2h</span>
                    <span>•</span>
                    <Globe className="w-3 h-3" />
                  </div>
                </div>
                <button className="text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 p-2 rounded-full">
                  <MoreHorizontal className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          {/* Post Content */}
          <div className="mt-3 text-gray-800 dark:text-gray-200 text-[15px] leading-relaxed">
            {formatContent(truncatedContent)}
            
            {content.length > 300 && (
              <button
                onClick={() => setShowFullContent(!showFullContent)}
                className="text-gray-500 hover:text-[#0A66C2] font-medium mt-1"
              >
                {showFullContent ? 'see less' : '...see more'}
              </button>
            )}
          </div>
        </div>

        {/* Engagement Stats */}
        <div className="px-4 py-2 border-t border-gray-100 dark:border-[#38434F]">
          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
            <div className="flex items-center gap-1">
              <div className="flex -space-x-1">
                <span className="w-4 h-4 rounded-full bg-[#0A66C2] flex items-center justify-center">
                  <ThumbsUp className="w-2.5 h-2.5 text-white" />
                </span>
                <span className="w-4 h-4 rounded-full bg-red-500 flex items-center justify-center text-white text-[8px]">
                  ❤️
                </span>
                <span className="w-4 h-4 rounded-full bg-green-500 flex items-center justify-center text-white text-[8px]">
                  👏
                </span>
              </div>
              <span>{Math.floor(Math.random() * 500 + 100)}</span>
            </div>
            <div className="flex items-center gap-3">
              <span>{Math.floor(Math.random() * 50 + 10)} comments</span>
              <span>{Math.floor(Math.random() * 30 + 5)} reposts</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="px-2 py-1 border-t border-gray-100 dark:border-[#38434F]">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setLiked(!liked)}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors ${
                liked ? 'text-[#0A66C2]' : 'text-gray-600 dark:text-gray-400'
              }`}
            >
              <ThumbsUp className={`w-5 h-5 ${liked ? 'fill-current' : ''}`} />
              <span className="font-medium text-sm">Like</span>
            </button>
            <button className="flex-1 flex items-center justify-center gap-2 py-3 rounded hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400 transition-colors">
              <MessageSquare className="w-5 h-5" />
              <span className="font-medium text-sm">Comment</span>
            </button>
            <button className="flex-1 flex items-center justify-center gap-2 py-3 rounded hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400 transition-colors">
              <Repeat className="w-5 h-5" />
              <span className="font-medium text-sm">Repost</span>
            </button>
            <button className="flex-1 flex items-center justify-center gap-2 py-3 rounded hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400 transition-colors">
              <Send className="w-5 h-5" />
              <span className="font-medium text-sm">Send</span>
            </button>
          </div>
        </div>

        {/* Character Count */}
        <div className="px-4 py-2 border-t border-gray-100 dark:border-[#38434F] bg-gray-50 dark:bg-[#161B22]">
          <div className={`text-sm ${charColor}`}>
            {charCount.toLocaleString()}/{charLimit.toLocaleString()} characters
            {isOverLimit && (
              <span className="ml-2 text-red-400">⚠️ Over limit!</span>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}


