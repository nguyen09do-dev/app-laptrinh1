'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Sparkles,
  RefreshCw,
  FileJson,
  FileText,
  Send,
  Clock,
  Eye,
  Copy,
  Check,
  Zap,
  History,
  GitBranch,
  CheckCircle2,
} from 'lucide-react';
import { ContentRenderer } from '@/components/ui/content-renderer';
import {
  DerivativeTabs,
  DerivativesEmptyState,
  DerivativesLoading,
  ContentDerivatives,
} from './derivatives';
import { showToast } from '@/lib/toast';

interface Content {
  id: number;
  brief_id: number;
  content_id?: string | null;
  version_number?: number;
  title: string;
  body: string;
  format: string;
  word_count: number;
  reading_time: number;
  status: string;
  author: string | null;
  published_at: string | null;
  created_at: string;
  updated_at: string;
  brief_title?: string;
  persona?: string;
  industry?: string;
  pack_id?: string | null;
}

interface ContentVersion {
  version_id: string;
  content_id: string;
  version_number: number;
  title: string;
  body: string;
  word_count: number;
  status: string;
  created_at: string;
  pack_id: string | null;
}

interface ContentDetailModalProps {
  content: Content;
  onClose: () => void;
  onDelete?: (id: number) => void;
}

export function ContentDetailModal({ content, onClose, onDelete }: ContentDetailModalProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [derivatives, setDerivatives] = useState<ContentDerivatives | null>(null);
  const [activeTab, setActiveTab] = useState<'content' | 'derivatives' | 'versions'>('content');
  const [versions, setVersions] = useState<ContentVersion[]>([]);
  const [loadingVersions, setLoadingVersions] = useState(false);
  const [selectedVersion, setSelectedVersion] = useState<ContentVersion | null>(null);
  const [settingVersion, setSettingVersion] = useState(false);

  // Generate derivatives from content
  const handleGenerateDerivatives = async () => {
    setIsGenerating(true);
    try {
      // TODO: Call API to generate derivatives from content.body
      // For now, simulate with timeout
      await new Promise((resolve) => setTimeout(resolve, 3000));
      
      // Mock data
      const mockDerivatives: ContentDerivatives = {
        twitter_thread: [
          '🚀 Thread about ' + content.title,
          'Tweet 2...',
          'Tweet 3...',
        ],
        linkedin: 'LinkedIn post about ' + content.title,
        email: 'Email newsletter about ' + content.title,
        blog_summary: 'Blog summary about ' + content.title,
        seo_description: 'SEO description for ' + content.title,
      };
      
      setDerivatives(mockDerivatives);
      setActiveTab('derivatives');
      showToast.success('✨ Multi-platform versions generated!');
    } catch (error) {
      console.error('Generation error:', error);
      showToast.error('Failed to generate derivatives');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRegenerate = async (type: keyof ContentDerivatives) => {
    setIsGenerating(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      showToast.success(`${type} regenerated!`);
    } catch (error) {
      showToast.error('Failed to regenerate');
    } finally {
      setIsGenerating(false);
    }
  };

  // Fetch versions
  const fetchVersions = async () => {
    if (!content.content_id) return;
    
    setLoadingVersions(true);
    try {
      const response = await fetch(`http://localhost:3001/api/contents/${content.id}/versions`);
      const data = await response.json();
      
      if (data.success) {
        setVersions(data.data || []);
        // Set current version as selected
        const currentVersion = data.data?.find((v: ContentVersion) => v.version_number === content.version_number);
        if (currentVersion) {
          setSelectedVersion(currentVersion);
        }
      }
    } catch (error) {
      console.error('Error fetching versions:', error);
      showToast.error('Failed to load versions');
    } finally {
      setLoadingVersions(false);
    }
  };

  // Set active version
  const handleSetActiveVersion = async (versionNumber: number) => {
    if (versionNumber === content.version_number) {
      showToast.info('This version is already active');
      return;
    }

    setSettingVersion(true);
    try {
      const response = await fetch(`http://localhost:3001/api/contents/${content.id}/set-version`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ version_number: versionNumber }),
      });

      const data = await response.json();

      if (data.success) {
        showToast.success(`✅ Version ${versionNumber} is now active!`);
        // Refresh versions and update content
        await fetchVersions();
        // Update the content prop would require parent component refresh
        // For now, just refresh versions
        window.location.reload(); // Simple refresh to update content
      } else {
        showToast.error(data.error || 'Failed to set active version');
      }
    } catch (error) {
      console.error('Error setting active version:', error);
      showToast.error('Failed to set active version');
    } finally {
      setSettingVersion(false);
    }
  };

  const handleExport = (format: 'json' | 'md') => {
    if (!derivatives) return;
    
    const dataStr = format === 'json' 
      ? JSON.stringify(derivatives, null, 2)
      : Object.entries(derivatives).map(([key, value]) => 
          `# ${key}\n\n${Array.isArray(value) ? value.join('\n\n') : value}\n\n`
        ).join('---\n\n');
    
    const blob = new Blob([dataStr], { type: format === 'json' ? 'application/json' : 'text/markdown' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${content.title.slice(0, 30)}-derivatives.${format}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    
    showToast.success(`Exported as ${format.toUpperCase()}`);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'review':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'published':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-50"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900 rounded-3xl max-w-6xl w-full max-h-[90vh] overflow-hidden border border-purple-500/20 shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="relative bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-purple-500/10 border-b border-white/10 p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1 pr-8">
                <motion.h2
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="text-3xl font-bold text-white mb-3"
                >
                  {content.title}
                </motion.h2>
                <div className="flex flex-wrap items-center gap-3">
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.1 }}
                    className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(
                      content.status
                    )}`}
                  >
                    {content.status}
                  </motion.span>
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="flex items-center gap-4 text-sm text-gray-400"
                  >
                    <span className="flex items-center gap-1">
                      <FileText className="w-4 h-4" />
                      {content.word_count} words
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {content.reading_time || Math.ceil(content.word_count / 200)} min read
                    </span>
                    <span className="flex items-center gap-1">
                      <Eye className="w-4 h-4" />
                      {new Date(content.created_at).toLocaleDateString('vi-VN')}
                    </span>
                  </motion.div>
                </div>
              </div>
              
              <motion.button
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                onClick={onClose}
                className="text-gray-400 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-full"
              >
                <X className="w-6 h-6" />
              </motion.button>
            </div>

            {/* Tabs */}
            <div className="flex items-center gap-2 p-1 bg-white/5 rounded-xl w-fit">
              <button
                onClick={() => setActiveTab('content')}
                className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${
                  activeTab === 'content'
                    ? 'bg-gradient-to-r from-mint-500 to-mint-600 text-white shadow-lg'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <FileText className="w-4 h-4" />
                Content
              </button>
              <button
                onClick={() => setActiveTab('derivatives')}
                className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${
                  activeTab === 'derivatives'
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Zap className="w-4 h-4" />
                Multi-Platform
                {derivatives && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="bg-emerald-500 text-white text-xs px-2 py-0.5 rounded-full"
                  >
                    ✓
                  </motion.span>
                )}
              </button>
              {content.content_id && (
                <button
                  onClick={() => {
                    setActiveTab('versions');
                    if (versions.length === 0 && !loadingVersions) {
                      fetchVersions();
                    }
                  }}
                  className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${
                    activeTab === 'versions'
                      ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg'
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <History className="w-4 h-4" />
                  Versions
                  {content.version_number && (
                    <span className="bg-blue-500/20 text-blue-300 text-xs px-2 py-0.5 rounded-full">
                      v{content.version_number}
                    </span>
                  )}
                </button>
              )}
            </div>
          </div>

          {/* Content */}
          <div className="overflow-y-auto max-h-[calc(90vh-250px)] p-6">
            <AnimatePresence mode="wait">
              {activeTab === 'content' && (
                <motion.div
                  key="content"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="glass-card p-6 rounded-2xl">
                    <ContentRenderer content={content.body} />
                  </div>
                </motion.div>
              )}

              {activeTab === 'derivatives' && (
                <motion.div
                  key="derivatives"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                >
                  {!derivatives && !isGenerating && (
                    <motion.div
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                    >
                      <DerivativesEmptyState
                        onGenerate={handleGenerateDerivatives}
                        isGenerating={isGenerating}
                      />
                    </motion.div>
                  )}

                  {isGenerating && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    >
                      <DerivativesLoading />
                    </motion.div>
                  )}

                  {derivatives && !isGenerating && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="glass-card p-6 rounded-2xl"
                    >
                      <DerivativeTabs
                        derivatives={derivatives}
                        onRegenerate={handleRegenerate}
                        isLoading={isGenerating}
                      />
                    </motion.div>
                  )}
                </motion.div>
              )}

              {activeTab === 'versions' && (
                <motion.div
                  key="versions"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-4"
                >
                  {loadingVersions ? (
                    <div className="flex items-center justify-center h-64">
                      <RefreshCw className="w-8 h-8 text-blue-400 animate-spin" />
                    </div>
                  ) : versions.length === 0 ? (
                    <div className="glass-card p-8 rounded-2xl text-center">
                      <History className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-400">No versions found</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {/* Version List */}
                      <div className="glass-card p-6 rounded-2xl">
                        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                          <GitBranch className="w-5 h-5 text-blue-400" />
                          Version History
                        </h3>
                        <div className="space-y-2">
                          {versions.map((version) => (
                            <motion.button
                              key={version.version_id}
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              onClick={() => setSelectedVersion(version)}
                              className={`w-full p-4 rounded-lg border transition-all text-left ${
                                selectedVersion?.version_id === version.version_id
                                  ? 'border-blue-500 bg-blue-500/10'
                                  : 'border-white/10 bg-white/5 hover:bg-white/10'
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                                    version.version_number === content.version_number
                                      ? 'bg-blue-500 text-white'
                                      : 'bg-white/10 text-gray-300'
                                  }`}>
                                    v{version.version_number}
                                  </div>
                                  <div>
                                    <div className="text-white font-medium">{version.title}</div>
                                    <div className="text-sm text-gray-400">
                                      {version.word_count} words • {new Date(version.created_at).toLocaleDateString('vi-VN')}
                                    </div>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  {version.version_number === content.version_number ? (
                                    <span className="px-2 py-1 bg-blue-500/20 text-blue-300 rounded text-xs flex items-center gap-1">
                                      <CheckCircle2 className="w-3 h-3" />
                                      Current
                                    </span>
                                  ) : (
                                    <motion.button
                                      whileHover={{ scale: 1.05 }}
                                      whileTap={{ scale: 0.95 }}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleSetActiveVersion(version.version_number);
                                      }}
                                      disabled={settingVersion}
                                      className="px-3 py-1 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 rounded text-xs transition-all flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                      {settingVersion ? (
                                        <>
                                          <RefreshCw className="w-3 h-3 animate-spin" />
                                          Setting...
                                        </>
                                      ) : (
                                        <>
                                          <CheckCircle2 className="w-3 h-3" />
                                          Set as Current
                                        </>
                                      )}
                                    </motion.button>
                                  )}
                                </div>
                              </div>
                            </motion.button>
                          ))}
                        </div>
                      </div>

                      {/* Selected Version Preview */}
                      {selectedVersion && (
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="glass-card p-6 rounded-2xl"
                        >
                          <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                              <FileText className="w-5 h-5 text-mint-400" />
                              Version {selectedVersion.version_number} Preview
                            </h3>
                            {selectedVersion.version_number !== content.version_number && (
                              <span className="text-xs text-gray-400">
                                {new Date(selectedVersion.created_at).toLocaleString('vi-VN')}
                              </span>
                            )}
                          </div>
                          <div className="max-h-96 overflow-y-auto">
                            <ContentRenderer content={selectedVersion.body} />
                          </div>
                        </motion.div>
                      )}
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Footer Actions */}
          <div className="border-t border-white/10 p-6 bg-gradient-to-r from-gray-900/50 via-purple-900/10 to-gray-900/50">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                {onDelete && (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => onDelete(content.id)}
                    className="px-4 py-2 bg-red-500/20 text-red-400 border border-red-500/30 rounded-lg hover:bg-red-500/30 transition-all flex items-center gap-2"
                  >
                    <X className="w-4 h-4" />
                    Delete
                  </motion.button>
                )}
              </div>

              <div className="flex items-center gap-2">
                {activeTab === 'derivatives' && derivatives && (
                  <>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleExport('json')}
                      className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-all flex items-center gap-2"
                    >
                      <FileJson className="w-4 h-4" />
                      JSON
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleExport('md')}
                      className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-all flex items-center gap-2"
                    >
                      <FileText className="w-4 h-4" />
                      Markdown
                    </motion.button>
                  </>
                )}

                {activeTab === 'content' && (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleGenerateDerivatives}
                    disabled={isGenerating}
                    className="px-6 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-medium transition-all shadow-lg hover:shadow-purple-500/50 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isGenerating ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        Generate Multi-Platform
                      </>
                    )}
                  </motion.button>
                )}

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={onClose}
                  className="px-6 py-2 bg-mint-500/20 text-mint-400 border border-mint-500/30 rounded-lg hover:bg-mint-500/30 transition-all"
                >
                  Close
                </motion.button>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

