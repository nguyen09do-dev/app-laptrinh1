'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { CopyButton } from './CopyButton';
import {
  MessageCircle,
  Repeat2,
  Heart,
  Share,
  MoreHorizontal,
  BadgeCheck,
} from 'lucide-react';

interface TwitterPreviewProps {
  tweets: string[];
  username?: string;
  handle?: string;
  avatar?: string;
  verified?: boolean;
}

export function TwitterPreview({
  tweets = [],
  username = 'AI Content Studio',
  handle = '@aicontentstudio',
  avatar,
  verified = true,
}: TwitterPreviewProps) {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(0);
  
  // Safety check
  if (!tweets || tweets.length === 0) {
    return (
      <div className="text-center py-8 text-midnight-400">
        No tweets available
      </div>
    );
  }

  const formatTimestamp = (index: number) => {
    const now = new Date();
    now.setMinutes(now.getMinutes() - (tweets.length - index) * 2);
    return now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  };

  const getCharCount = (text: string) => {
    const count = text.length;
    return {
      count,
      isOverLimit: count > 280,
      color: count > 280 ? 'text-red-400' : count > 250 ? 'text-amber-400' : 'text-midnight-400',
    };
  };

  return (
    <div className="space-y-3">
      {/* Thread Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-lg font-semibold text-white">Twitter Thread</span>
          <span className="px-2 py-0.5 bg-[#1DA1F2]/20 text-[#1DA1F2] text-xs rounded-full">
            {tweets.length} tweets
          </span>
        </div>
        <CopyButton
          text={tweets.join('\n\n---\n\n')}
          label="Copy All"
          variant="outline"
          size="sm"
        />
      </div>

      {/* Tweets */}
      <div className="space-y-2">
        {tweets.map((tweet, index) => {
          const charInfo = getCharCount(tweet);
          const isExpanded = expandedIndex === index;

          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className={`
                bg-[#15202B] rounded-xl border transition-all cursor-pointer
                ${isExpanded ? 'border-[#1DA1F2]/50' : 'border-[#38444D]'}
              `}
              onClick={() => setExpandedIndex(isExpanded ? null : index)}
            >
              {/* Tweet Header */}
              <div className="p-4">
                <div className="flex items-start gap-3">
                  {/* Avatar */}
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#1DA1F2] to-[#1A91DA] flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                    {avatar ? (
                      <img src={avatar} alt={username} className="w-full h-full rounded-full object-cover" />
                    ) : (
                      username.charAt(0)
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    {/* User Info */}
                    <div className="flex items-center gap-1 mb-1">
                      <span className="font-bold text-white hover:underline">{username}</span>
                      {verified && <BadgeCheck className="w-4 h-4 text-[#1DA1F2]" />}
                      <span className="text-[#8899A6]">{handle}</span>
                      <span className="text-[#8899A6]">·</span>
                      <span className="text-[#8899A6] text-sm">{formatTimestamp(index)}</span>
                    </div>

                    {/* Thread indicator */}
                    {index > 0 && (
                      <div className="text-[#8899A6] text-sm mb-2">
                        Replying to <span className="text-[#1DA1F2]">{handle}</span>
                      </div>
                    )}

                    {/* Tweet Content */}
                    <p className="text-[#E7E9EA] whitespace-pre-wrap break-words leading-relaxed">
                      {tweet}
                    </p>

                    {/* Tweet Footer */}
                    <div className="flex items-center justify-between mt-3 text-[#8899A6]">
                      <button className="flex items-center gap-2 hover:text-[#1DA1F2] transition-colors group">
                        <div className="p-2 rounded-full group-hover:bg-[#1DA1F2]/10">
                          <MessageCircle className="w-4 h-4" />
                        </div>
                        <span className="text-sm">{Math.floor(Math.random() * 50)}</span>
                      </button>
                      <button className="flex items-center gap-2 hover:text-[#00BA7C] transition-colors group">
                        <div className="p-2 rounded-full group-hover:bg-[#00BA7C]/10">
                          <Repeat2 className="w-4 h-4" />
                        </div>
                        <span className="text-sm">{Math.floor(Math.random() * 200)}</span>
                      </button>
                      <button className="flex items-center gap-2 hover:text-[#F91880] transition-colors group">
                        <div className="p-2 rounded-full group-hover:bg-[#F91880]/10">
                          <Heart className="w-4 h-4" />
                        </div>
                        <span className="text-sm">{Math.floor(Math.random() * 500)}</span>
                      </button>
                      <button className="flex items-center gap-2 hover:text-[#1DA1F2] transition-colors group">
                        <div className="p-2 rounded-full group-hover:bg-[#1DA1F2]/10">
                          <Share className="w-4 h-4" />
                        </div>
                      </button>
                    </div>
                  </div>

                  {/* More button */}
                  <button className="text-[#8899A6] hover:text-[#1DA1F2] p-2 rounded-full hover:bg-[#1DA1F2]/10">
                    <MoreHorizontal className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Expanded Actions */}
              {isExpanded && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="border-t border-[#38444D] p-3 flex items-center justify-between bg-[#192734]"
                >
                  <div className={`text-sm ${charInfo.color}`}>
                    {charInfo.count}/280 characters
                    {charInfo.isOverLimit && (
                      <span className="ml-2 text-red-400">⚠️ Over limit!</span>
                    )}
                  </div>
                  <CopyButton text={tweet} label="Copy" size="sm" variant="ghost" />
                </motion.div>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Thread Connection Line */}
      <style jsx>{`
        /* Thread line connecting tweets */
      `}</style>
    </div>
  );
}

