'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { CopyButton } from './CopyButton';
import {
  Mail,
  Star,
  Reply,
  Forward,
  Trash2,
  Archive,
  MoreVertical,
  Paperclip,
  Clock,
} from 'lucide-react';

interface EmailPreviewProps {
  content: string;
  senderName?: string;
  senderEmail?: string;
  recipientEmail?: string;
}

export function EmailPreview({
  content,
  senderName = 'AI Content Studio',
  senderEmail = 'newsletter@aicontentstudio.com',
  recipientEmail = 'subscriber@example.com',
}: EmailPreviewProps) {
  const [starred, setStarred] = useState(false);

  // Extract subject line if present (format: "Subject: ...")
  const subjectMatch = content.match(/^Subject:\s*(.+?)(?:\n|$)/i);
  const subject = subjectMatch ? subjectMatch[1].trim() : 'Newsletter Update';
  const bodyContent = subjectMatch ? content.replace(subjectMatch[0], '').trim() : content;

  const charCount = content.length;
  const charLimit = 10000;
  const isOverLimit = charCount > charLimit;
  const charColor = isOverLimit ? 'text-red-400' : charCount > 8000 ? 'text-amber-400' : 'text-midnight-400';

  const formatEmailBody = (text: string) => {
    return text.split('\n').map((line, i) => {
      // Handle greeting
      if (i === 0 && (line.startsWith('Hi ') || line.startsWith('Hello ') || line.startsWith('Dear '))) {
        return <p key={i} className="mb-4 font-medium">{line}</p>;
      }
      // Handle signature
      if (line.startsWith('Best') || line.startsWith('Regards') || line.startsWith('Thanks') || line.startsWith('Cheers')) {
        return <p key={i} className="mt-4">{line}</p>;
      }
      // Handle bullet points
      if (line.startsWith('• ') || line.startsWith('- ') || line.startsWith('* ')) {
        return (
          <div key={i} className="flex items-start gap-2 ml-4 my-1">
            <span className="text-[#0066CC]">•</span>
            <span>{line.slice(2)}</span>
          </div>
        );
      }
      // Handle numbered lists
      const numberedMatch = line.match(/^(\d+)\.\s/);
      if (numberedMatch) {
        return (
          <div key={i} className="flex items-start gap-2 ml-4 my-1">
            <span className="text-[#0066CC] font-medium min-w-[20px]">{numberedMatch[1]}.</span>
            <span>{line.slice(numberedMatch[0].length)}</span>
          </div>
        );
      }
      // Empty line
      if (line.trim() === '') {
        return <br key={i} />;
      }
      // Normal paragraph
      return <p key={i} className="my-2">{line}</p>;
    });
  };

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-lg font-semibold text-white">Email Newsletter</span>
          <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 text-xs rounded-full">
            Newsletter
          </span>
        </div>
        <CopyButton text={content} label="Copy" variant="outline" size="sm" />
      </div>

      {/* Email Card */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-[#1C1C1E] rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden shadow-lg"
      >
        {/* Email Toolbar */}
        <div className="flex items-center justify-between px-4 py-2 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#2C2C2E]">
          <div className="flex items-center gap-2">
            <button className="p-1.5 rounded hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400">
              <Archive className="w-4 h-4" />
            </button>
            <button className="p-1.5 rounded hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400">
              <Trash2 className="w-4 h-4" />
            </button>
            <button className="p-1.5 rounded hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400">
              <Mail className="w-4 h-4" />
            </button>
          </div>
          <div className="flex items-center gap-2">
            <button className="p-1.5 rounded hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400">
              <Reply className="w-4 h-4" />
            </button>
            <button className="p-1.5 rounded hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400">
              <Forward className="w-4 h-4" />
            </button>
            <button className="p-1.5 rounded hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400">
              <MoreVertical className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Email Header */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          {/* Subject */}
          <div className="flex items-start justify-between mb-3">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              {subject}
            </h2>
            <button
              onClick={() => setStarred(!starred)}
              className={`p-1 rounded ${starred ? 'text-amber-400' : 'text-gray-400 hover:text-amber-400'}`}
            >
              <Star className={`w-5 h-5 ${starred ? 'fill-current' : ''}`} />
            </button>
          </div>

          {/* Sender Info */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white font-bold">
              {senderName.charAt(0)}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="font-medium text-gray-900 dark:text-white">{senderName}</span>
                <span className="text-sm text-gray-500 dark:text-gray-400">&lt;{senderEmail}&gt;</span>
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                to {recipientEmail}
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
              <Clock className="w-4 h-4" />
              <span>Just now</span>
            </div>
          </div>
        </div>

        {/* Email Body */}
        <div className="p-6 text-gray-800 dark:text-gray-200 leading-relaxed">
          {formatEmailBody(bodyContent)}
        </div>

        {/* Character Count */}
        <div className="px-4 py-2 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#2C2C2E]">
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


