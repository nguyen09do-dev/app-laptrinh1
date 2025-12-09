'use client';

import { useRef, useEffect, ReactNode, useState } from 'react';
import ReactMarkdown, { Components } from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { motion } from 'framer-motion';
import { Loader2, FileText, Check, Edit2, Save, X } from 'lucide-react';

interface DraftEditorProps {
  content: string;
  isStreaming: boolean;
  wordCount?: number;
  onContentChange?: (content: string) => void;
  packId?: string;
  onSave?: (content: string) => Promise<void>;
}

// Helper to safely render children (avoid rendering objects)
const safeChildren = (children: ReactNode): ReactNode => {
  if (children === null || children === undefined) return null;
  if (typeof children === 'object' && !Array.isArray(children) && !(children as any).$$typeof) {
    return String(children);
  }
  return children;
};

// Custom markdown components with proper typing
const markdownComponents: Components = {
  h1: ({ children }) => (
    <h1 className="text-2xl font-bold text-white mb-4 pb-2 border-b border-white/10">
      {safeChildren(children)}
    </h1>
  ),
  h2: ({ children }) => (
    <h2 className="text-xl font-semibold text-purple-300 mt-6 mb-3">
      {safeChildren(children)}
    </h2>
  ),
  h3: ({ children }) => (
    <h3 className="text-lg font-medium text-blue-300 mt-4 mb-2">
      {safeChildren(children)}
    </h3>
  ),
  p: ({ children }) => (
    <p className="text-gray-200 leading-relaxed mb-4">
      {safeChildren(children)}
    </p>
  ),
  ul: ({ children }) => (
    <ul className="list-disc list-inside space-y-2 mb-4 text-gray-200 pl-2">
      {safeChildren(children)}
    </ul>
  ),
  ol: ({ children }) => (
    <ol className="list-decimal list-inside space-y-2 mb-4 text-gray-200 pl-2">
      {safeChildren(children)}
    </ol>
  ),
  li: ({ children }) => (
    <li className="text-gray-200 leading-relaxed">
      {safeChildren(children)}
    </li>
  ),
  strong: ({ children }) => (
    <strong className="font-semibold text-white">
      {safeChildren(children)}
    </strong>
  ),
  em: ({ children }) => (
    <em className="italic text-purple-200">
      {safeChildren(children)}
    </em>
  ),
  blockquote: ({ children }) => (
    <blockquote className="border-l-4 border-purple-500 pl-4 py-2 my-4 bg-purple-500/10 rounded-r-lg italic text-gray-300">
      {safeChildren(children)}
    </blockquote>
  ),
  code: ({ className, children }) => {
    const isInline = !className;
    if (isInline) {
      return (
        <code className="bg-gray-700/50 text-pink-300 px-1.5 py-0.5 rounded text-sm font-mono">
          {safeChildren(children)}
        </code>
      );
    }
    return (
      <code className="block bg-gray-900/50 p-4 rounded-lg text-sm font-mono text-gray-200 overflow-x-auto">
        {safeChildren(children)}
      </code>
    );
  },
  pre: ({ children }) => (
    <pre className="bg-gray-900/50 p-4 rounded-lg overflow-x-auto my-4">
      {safeChildren(children)}
    </pre>
  ),
  a: ({ href, children }) => (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="text-blue-400 hover:text-blue-300 underline underline-offset-2 transition-colors"
    >
      {safeChildren(children)}
    </a>
  ),
  hr: () => <hr className="my-6 border-t border-white/10" />,
  table: ({ children }) => (
    <div className="overflow-x-auto my-4">
      <table className="min-w-full border border-white/10 rounded-lg overflow-hidden">
        {safeChildren(children)}
      </table>
    </div>
  ),
  thead: ({ children }) => (
    <thead className="bg-purple-500/20">{safeChildren(children)}</thead>
  ),
  th: ({ children }) => (
    <th className="px-4 py-2 text-left text-sm font-semibold text-purple-200 border-b border-white/10">
      {safeChildren(children)}
    </th>
  ),
  td: ({ children }) => (
    <td className="px-4 py-2 text-sm text-gray-200 border-b border-white/5">
      {safeChildren(children)}
    </td>
  ),
  tbody: ({ children }) => <tbody>{safeChildren(children)}</tbody>,
  tr: ({ children }) => <tr>{safeChildren(children)}</tr>,
};

/**
 * DraftEditor - Markdown renderer with real-time streaming support and edit mode
 */
export function DraftEditor({
  content,
  isStreaming,
  wordCount,
  packId,
  onSave,
}: DraftEditorProps) {
  const contentRef = useRef<HTMLDivElement>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(content);
  const [isSaving, setIsSaving] = useState(false);

  // Sync edited content when prop changes
  useEffect(() => {
    setEditedContent(content);
  }, [content]);

  // Auto-scroll to bottom during streaming
  useEffect(() => {
    if (isStreaming && contentRef.current) {
      contentRef.current.scrollTop = contentRef.current.scrollHeight;
    }
  }, [content, isStreaming]);

  // Calculate word count if not provided
  const displayContent = isEditing ? editedContent : content;
  const calculatedWordCount = wordCount || displayContent.trim().split(/\s+/).filter(w => w.length > 0).length;

  const handleSave = async () => {
    if (!onSave || editedContent === content) {
      setIsEditing(false);
      return;
    }

    setIsSaving(true);
    try {
      await onSave(editedContent);
      setIsEditing(false);
    } catch (error) {
      console.error('Save error:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setEditedContent(content);
    setIsEditing(false);
  };

  return (
    <div className="relative flex flex-col h-full min-h-[400px] rounded-xl border border-white/10 bg-gradient-to-br from-gray-900/50 to-gray-800/50 backdrop-blur-lg overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-white/5">
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-purple-400" />
          <span className="text-sm font-medium text-gray-200">
            {isEditing ? 'Edit Draft' : 'Draft Content'}
          </span>
        </div>
        <div className="flex items-center gap-3">
          {calculatedWordCount > 0 && (
            <span className="text-xs text-gray-400 bg-white/5 px-2 py-1 rounded">
              {calculatedWordCount} từ
            </span>
          )}
          {isStreaming ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center gap-2 text-amber-400"
            >
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-xs font-medium">Đang tạo...</span>
            </motion.div>
          ) : isEditing ? (
            <div className="flex items-center gap-2">
              <button
                onClick={handleCancel}
                disabled={isSaving}
                className="flex items-center gap-1 px-3 py-1.5 bg-gray-500/20 text-gray-300 hover:bg-gray-500/30 rounded-lg text-xs font-medium transition-colors disabled:opacity-50"
              >
                <X className="w-3 h-3" />
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving || editedContent === content}
                className="flex items-center gap-1 px-3 py-1.5 bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 rounded-lg text-xs font-medium transition-colors disabled:opacity-50"
              >
                {isSaving ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : (
                  <Save className="w-3 h-3" />
                )}
                {isSaving ? 'Saving...' : 'Save'}
              </button>
            </div>
          ) : content.length > 0 && onSave ? (
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 text-emerald-400">
                <Check className="w-4 h-4" />
                <span className="text-xs font-medium">Hoàn thành</span>
              </div>
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-1 px-3 py-1.5 bg-purple-500/20 text-purple-300 hover:bg-purple-500/30 rounded-lg text-xs font-medium transition-colors"
              >
                <Edit2 className="w-3 h-3" />
                Edit
              </button>
            </div>
          ) : content.length > 0 ? (
            <div className="flex items-center gap-1 text-emerald-400">
              <Check className="w-4 h-4" />
              <span className="text-xs font-medium">Hoàn thành</span>
            </div>
          ) : null}
        </div>
      </div>

      {/* Content Area */}
      <div
        ref={contentRef}
        className="flex-1 overflow-y-auto p-6 scroll-smooth"
      >
        {displayContent.length === 0 && !isStreaming ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            <FileText className="w-12 h-12 mb-3 opacity-50" />
            <p className="text-sm">Chưa có nội dung draft</p>
            <p className="text-xs mt-1">Nhấn &quot;Tạo Draft&quot; để bắt đầu</p>
          </div>
        ) : isEditing ? (
          <textarea
            value={editedContent}
            onChange={(e) => setEditedContent(e.target.value)}
            className="w-full h-full bg-transparent text-gray-200 resize-none outline-none border-none font-mono text-sm leading-relaxed"
            placeholder="Enter markdown content..."
            autoFocus
          />
        ) : (
          <div className="prose prose-invert prose-sm max-w-none">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={markdownComponents}
            >
              {displayContent}
            </ReactMarkdown>

            {/* Streaming cursor indicator */}
            {isStreaming && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: [0, 1, 0] }}
                transition={{ duration: 0.8, repeat: Infinity }}
                className="inline-block w-2 h-5 bg-purple-400 ml-1 align-middle"
              />
            )}
          </div>
        )}
      </div>

      {/* Streaming overlay indicator */}
      {isStreaming && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 via-pink-500 to-purple-500 bg-[length:200%_100%]"
          style={{
            animation: 'gradient 2s linear infinite',
          }}
        />
      )}

      <style jsx>{`
        @keyframes gradient {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
      `}</style>
    </div>
  );
}

export default DraftEditor;

