'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp, Send, Settings, CheckCircle2, AlertCircle } from 'lucide-react';
import { TwitterPreview } from './TwitterPreview';
import { LinkedInPreview } from './LinkedInPreview';
import { EmailPreview } from './EmailPreview';
import { BlogPreview } from './BlogPreview';
import { SEOPreview } from './SEOPreview';
import { ContentDerivatives } from './DerivativeTabs';

interface PlatformCardProps {
  platformKey: string;
  platformName: string;
  icon: React.ElementType;
  color: string;
  bgColor: string;
  content: string | string[] | null | undefined;
  isConnected?: boolean;
  onPublish?: () => void;
  onConfigure?: () => void;
  isPublishing?: boolean;
  publishResult?: { success: boolean; message?: string };
}

export function PlatformCard({
  platformKey,
  platformName,
  icon: Icon,
  color,
  bgColor,
  content,
  isConnected = false,
  onPublish,
  onConfigure,
  isPublishing = false,
  publishResult,
}: PlatformCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Get preview snippet (50-100 chars)
  const getPreviewSnippet = (): string => {
    if (!content) return 'No content available';
    
    let text = '';
    if (Array.isArray(content)) {
      text = content[0] || '';
    } else {
      text = content;
    }
    
    // Remove markdown formatting for preview
    text = text.replace(/\*\*(.+?)\*\*/g, '$1');
    text = text.replace(/\*(.+?)\*/g, '$1');
    text = text.replace(/^[-*•]\s+/gm, '');
    text = text.replace(/^\d+\.\s+/gm, '');
    text = text.replace(/\n+/g, ' ');
    
    if (text.length > 100) {
      return text.substring(0, 100).trim() + '...';
    }
    return text.trim() || 'No content available';
  };

  const hasContent = content && (
    Array.isArray(content) 
      ? content.length > 0 && content.some(c => c && c.trim().length > 0)
      : typeof content === 'string' && content.trim().length > 0
  );

  const renderPreview = () => {
    if (!hasContent) {
      return (
        <div className="py-8 text-center text-midnight-400">
          <p>No content available for this platform</p>
        </div>
      );
    }

    switch (platformKey) {
      case 'twitter':
        return <TwitterPreview tweets={Array.isArray(content) ? content : [content]} />;
      case 'linkedin':
        return <LinkedInPreview content={Array.isArray(content) ? content[0] : content} />;
      case 'email':
        return <EmailPreview content={Array.isArray(content) ? content[0] : content} />;
      case 'blog':
        return <BlogPreview content={Array.isArray(content) ? content[0] : content} />;
      case 'seo':
        return <SEOPreview description={Array.isArray(content) ? content[0] : content} />;
      default:
        return (
          <div className="p-4 bg-midnight-800 rounded-lg">
            <pre className="text-sm text-midnight-300 whitespace-pre-wrap">
              {Array.isArray(content) ? content.join('\n\n') : content}
            </pre>
          </div>
        );
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-xl border transition-all overflow-hidden ${
        isExpanded
          ? `${bgColor} border-midnight-600`
          : 'border-midnight-700 bg-midnight-800/50 hover:border-midnight-600'
      }`}
    >
      {/* Header - Always Visible */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-4 flex items-center justify-between hover:bg-midnight-700/30 transition-colors"
      >
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className={`p-2 rounded-lg ${bgColor}`}>
            <Icon className={`w-5 h-5 ${color}`} />
          </div>
          <div className="flex-1 min-w-0 text-left">
            <div className="flex items-center gap-2 mb-1">
              <h4 className="font-semibold text-white">{platformName}</h4>
              {isConnected ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-amber-400 flex-shrink-0" />
              )}
            </div>
            {!isExpanded && hasContent && (
              <p className="text-xs text-midnight-400 truncate">
                {getPreviewSnippet()}
              </p>
            )}
          </div>
        </div>
        <motion.div
          animate={{ rotate: isExpanded ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="flex-shrink-0 ml-2"
        >
          <ChevronDown className="w-5 h-5 text-midnight-400" />
        </motion.div>
      </button>

      {/* Expanded Content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="p-4 border-t border-midnight-700">
              {/* Preview Content */}
              <div className="mb-4">
                {renderPreview()}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2">
                {onPublish && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onPublish();
                    }}
                    disabled={isPublishing || !hasContent || !isConnected}
                    className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-all ${
                      isConnected && hasContent
                        ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white'
                        : 'bg-midnight-700 text-midnight-500 cursor-not-allowed'
                    }`}
                  >
                    {isPublishing ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>Publishing...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        <span>Publish to {platformName}</span>
                      </>
                    )}
                  </button>
                )}
                {onConfigure && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onConfigure();
                    }}
                    className="px-4 py-2.5 bg-midnight-700 hover:bg-midnight-600 text-white rounded-lg transition-colors flex items-center gap-2"
                  >
                    <Settings className="w-4 h-4" />
                    <span>Configure</span>
                  </button>
                )}
              </div>

              {/* Publish Result */}
              {publishResult && (
                <div className={`mt-3 p-3 rounded-lg ${
                  publishResult.success
                    ? 'bg-emerald-500/10 border border-emerald-500/20'
                    : 'bg-red-500/10 border border-red-500/20'
                }`}>
                  <p className={`text-xs ${
                    publishResult.success ? 'text-emerald-400' : 'text-red-400'
                  }`}>
                    {publishResult.success ? '✓ ' : '✗ '}
                    {publishResult.message || (publishResult.success ? 'Published successfully' : 'Publish failed')}
                  </p>
                </div>
              )}

              {/* Status Message */}
              {!isConnected && (
                <div className="mt-3 p-3 bg-amber-500/10 rounded-lg border border-amber-500/20">
                  <p className="text-xs text-amber-400">
                    ⚠️ Configure {platformName} credentials to enable publishing
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

