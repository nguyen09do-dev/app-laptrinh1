'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, BookOpen, ExternalLink } from 'lucide-react';

interface DocumentationViewerProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  content: string;
}

export function DocumentationViewer({ isOpen, onClose, title, content }: DocumentationViewerProps) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 z-[200] bg-black/70 backdrop-blur-sm"
      />

      {/* Modal */}
      <div className="fixed inset-0 z-[201] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="w-full max-w-4xl max-h-[85vh] rounded-2xl border border-blue-500/20 bg-gradient-to-br from-gray-900 via-gray-900 to-blue-900/20 shadow-2xl overflow-hidden flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-700/50">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 p-2">
                <BookOpen className="h-5 w-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-white">{title}</h2>
                <p className="text-sm text-gray-400">Setup documentation</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-800 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            <div 
              className="prose prose-invert prose-blue max-w-none"
              style={{
                fontSize: '0.95rem',
                lineHeight: '1.7',
              }}
            >
              <div 
                dangerouslySetInnerHTML={{ __html: formatMarkdown(content) }}
                className="documentation-content"
              />
            </div>
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-gray-700/50 bg-gray-900/50">
            <div className="flex items-center justify-between">
              <p className="text-xs text-gray-500">
                Complete setup guide for Facebook integration
              </p>
              <button
                onClick={onClose}
                className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </motion.div>
      </div>

      <style jsx global>{`
        .documentation-content h1 {
          font-size: 1.75rem;
          font-weight: 700;
          color: #60a5fa;
          margin-top: 2rem;
          margin-bottom: 1rem;
          padding-bottom: 0.5rem;
          border-bottom: 2px solid rgba(96, 165, 250, 0.2);
        }
        
        .documentation-content h2 {
          font-size: 1.5rem;
          font-weight: 600;
          color: #93c5fd;
          margin-top: 1.75rem;
          margin-bottom: 0.875rem;
        }
        
        .documentation-content h3 {
          font-size: 1.25rem;
          font-weight: 600;
          color: #bfdbfe;
          margin-top: 1.5rem;
          margin-bottom: 0.75rem;
        }
        
        .documentation-content p {
          color: #d1d5db;
          margin-bottom: 1rem;
        }
        
        .documentation-content ul, .documentation-content ol {
          color: #d1d5db;
          margin-left: 1.5rem;
          margin-bottom: 1rem;
        }
        
        .documentation-content li {
          margin-bottom: 0.5rem;
        }
        
        .documentation-content code {
          background: rgba(59, 130, 246, 0.1);
          color: #60a5fa;
          padding: 0.2rem 0.4rem;
          border-radius: 0.25rem;
          font-size: 0.875rem;
          font-family: 'Courier New', monospace;
        }
        
        .documentation-content pre {
          background: #1f2937;
          border: 1px solid rgba(96, 165, 250, 0.2);
          padding: 1rem;
          border-radius: 0.5rem;
          overflow-x: auto;
          margin-bottom: 1rem;
        }
        
        .documentation-content pre code {
          background: transparent;
          padding: 0;
          color: #e5e7eb;
        }
        
        .documentation-content a {
          color: #60a5fa;
          text-decoration: underline;
        }
        
        .documentation-content a:hover {
          color: #93c5fd;
        }
        
        .documentation-content strong {
          color: #f3f4f6;
          font-weight: 600;
        }
        
        .documentation-content hr {
          border-color: rgba(96, 165, 250, 0.2);
          margin: 2rem 0;
        }
        
        .documentation-content blockquote {
          border-left: 4px solid #3b82f6;
          padding-left: 1rem;
          color: #9ca3af;
          font-style: italic;
        }

        .documentation-content table {
          width: 100%;
          border-collapse: collapse;
          margin: 1rem 0;
        }

        .documentation-content th,
        .documentation-content td {
          border: 1px solid rgba(96, 165, 250, 0.2);
          padding: 0.5rem;
          text-align: left;
        }

        .documentation-content th {
          background: rgba(59, 130, 246, 0.1);
          font-weight: 600;
        }
      `}</style>
    </AnimatePresence>
  );
}

// Simple markdown to HTML converter
function formatMarkdown(markdown: string): string {
  let html = markdown;

  // Headers
  html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>');
  html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>');
  html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>');

  // Bold
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  
  // Italic
  html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');
  
  // Links
  html = html.replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1 <ExternalLink class="inline w-3 h-3" /></a>');
  
  // Code blocks
  html = html.replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>');
  
  // Inline code
  html = html.replace(/`([^`]+)`/g, '<code>$1</code>');
  
  // Lists
  html = html.replace(/^\* (.*$)/gim, '<li>$1</li>');
  html = html.replace(/^- (.*$)/gim, '<li>$1</li>');
  html = html.replace(/(<li>.*<\/li>)/g, (match) => {
    // Use [\s\S] instead of 's' flag for better compatibility
    return match.replace(/(<li>[\s\S]*<\/li>)/g, '<ul>$1</ul>');
  });
  
  // Line breaks
  html = html.replace(/\n\n/g, '</p><p>');
  html = html.replace(/\n/g, '<br>');
  
  // Wrap in paragraphs
  html = '<p>' + html + '</p>';
  
  // Horizontal rule
  html = html.replace(/^---$/gim, '<hr>');

  return html;
}

interface DocumentationTooltipProps {
  children: React.ReactNode;
  preview: string;
  onClick: () => void;
}

export function DocumentationTooltip({ children, preview, onClick }: DocumentationTooltipProps) {
  const [isHovering, setIsHovering] = useState(false);

  return (
    <div className="relative inline-block">
      <button
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
        onClick={onClick}
        className="cursor-pointer hover:opacity-80 transition-opacity"
      >
        {children}
      </button>

      <AnimatePresence>
        {isHovering && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute left-0 top-full mt-2 z-50 w-80 p-4 rounded-lg border border-blue-500/30 bg-gray-900/95 backdrop-blur-sm shadow-xl"
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
          >
            <div className="flex items-start gap-2 mb-2">
              <BookOpen className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-xs font-semibold text-blue-400 mb-1">Quick Preview</p>
                <p className="text-xs text-gray-300 leading-relaxed">{preview}</p>
              </div>
            </div>
            <div className="pt-2 border-t border-gray-700">
              <p className="text-xs text-gray-500 flex items-center gap-1">
                <ExternalLink className="w-3 h-3" />
                Click to view full documentation
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}




