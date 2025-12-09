'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DraftEditor } from '../components/DraftEditor';
import { TableSkeleton } from '@/components/ui/loading-skeleton';
import { showToast } from '@/lib/toast';
import {
  DerivativeTabs,
  DerivativesEmptyState,
  DerivativesLoading,
  ContentDerivatives,
} from '../components/derivatives';
import {
  Package,
  FileText,
  Sparkles,
  RefreshCw,
  ChevronRight,
  Clock,
  CheckCircle2,
  Eye,
  Send,
  Trash2,
  X,
  ArrowRight,
  AlertCircle,
  Upload,
  Download,
  History,
  FileJson,
  BarChart3,
  Globe,
  ExternalLink,
  Settings,
  ChevronDown,
} from 'lucide-react';

// Types
interface Brief {
  id: number;
  title: string;
  objective: string;
  target_audience: string;
  status: string;
  created_at: string;
}

interface ContentPack {
  pack_id: string;
  brief_id: number;
  brief_title?: string;
  draft_content: string | null;
  word_count: number;
  status: 'draft' | 'review' | 'approved' | 'published';
  derivatives?: ContentDerivatives | null;
  created_at: string;
  updated_at: string;
}

type PackStatus = ContentPack['status'];
type TabType = 'draft' | 'publish' | 'history';

// Status config
const STATUS_CONFIG: Record<PackStatus, { label: string; color: string; iconName: string }> = {
  draft: {
    label: 'Draft',
    color: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    iconName: 'file',
  },
  review: {
    label: 'Review',
    color: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    iconName: 'eye',
  },
  approved: {
    label: 'Approved',
    color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    iconName: 'check',
  },
  published: {
    label: 'Published',
    color: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    iconName: 'send',
  },
};

// Helper function to render status icon
function StatusIcon({ status, className = "w-3 h-3" }: { status: PackStatus; className?: string }) {
  switch (status) {
    case 'draft':
      return <FileText className={className} />;
    case 'review':
      return <Eye className={className} />;
    case 'approved':
      return <CheckCircle2 className={className} />;
    case 'published':
      return <Send className={className} />;
    default:
      return <AlertCircle className={className} />;
  }
}

// Helper to safely get status config
function getStatusConfig(status: string | undefined) {
  const validStatuses: PackStatus[] = ['draft', 'review', 'approved', 'published'];
  const safeStatus = validStatuses.includes(status as PackStatus) ? (status as PackStatus) : 'draft';
  return STATUS_CONFIG[safeStatus];
}

// Allowed transitions
const ALLOWED_TRANSITIONS: Record<PackStatus, PackStatus[]> = {
  draft: ['review'],
  review: ['draft', 'approved'],
  approved: ['review', 'published'],
  published: ['approved'],
};

export default function ContentStudioPage() {
  // State
  const [activeTab, setActiveTab] = useState<TabType>('draft');
  const [briefs, setBriefs] = useState<Brief[]>([]);
  const [packs, setPacks] = useState<ContentPack[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPack, setSelectedPack] = useState<ContentPack | null>(null);
  const [showPackSelector, setShowPackSelector] = useState(false);

  // Generation state
  const [isStreaming, setIsStreaming] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  // Draft options modal state
  const [showDraftOptions, setShowDraftOptions] = useState<number | null>(null);
  const [draftOptions, setDraftOptions] = useState({
    wordCount: 800,
    style: 'professional',
    useRAG: false,
  });

  // Fetch data
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);

      let briefsData: Brief[] = [];
      let packsData: ContentPack[] = [];

      try {
        const briefsRes = await fetch('http://localhost:3001/api/briefs');
        const briefsJson = await briefsRes.json();
        briefsData = Array.isArray(briefsJson.data) ? briefsJson.data : [];
      } catch (e) {
        console.error('Error fetching briefs:', e);
      }

      try {
        const packsRes = await fetch('http://localhost:3001/api/packs');
        const packsJson = await packsRes.json();
        packsData = Array.isArray(packsJson.data) ? packsJson.data : [];
      } catch (e) {
        console.error('Error fetching packs:', e);
      }

      setBriefs(briefsData);
      setPacks(packsData);
      
      // Auto-select first pack if available and none selected
      if (packsData.length > 0 && !selectedPack) {
        setSelectedPack(packsData[0]);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      const errorMsg = error instanceof Error ? error.message : 'Không thể tải dữ liệu';
      showToast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  }, [selectedPack]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Generate draft with options
  const handleGenerateDraft = async (briefId: number) => {
    setIsStreaming(true);
    setShowDraftOptions(null);

    try {
      const response = await fetch(`http://localhost:3001/api/packs/from-brief/${briefId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          wordCount: draftOptions.wordCount,
          style: draftOptions.style,
          useRAG: draftOptions.useRAG,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate draft');
      }

      const data = await response.json();

      if (data.success) {
        showToast.success(`Draft đã tạo thành công! (${data.data.word_count} từ)`);
        await fetchData();
        setSelectedPack(data.data);
        setActiveTab('draft');
      } else {
        showToast.error(data.error || 'Lỗi tạo draft');
      }
    } catch (error: unknown) {
      console.error('Error generating draft:', error);
      const errorMsg = error instanceof Error ? error.message : 'Lỗi tạo draft';
      showToast.error(errorMsg);
    } finally {
      setIsStreaming(false);
    }
  };

  // Update pack status
  const handleUpdateStatus = async (packId: string, newStatus: PackStatus) => {
    try {
      const response = await fetch('http://localhost:3001/api/packs/update-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pack_id: packId, status: newStatus }),
      });

      const data = await response.json();

      if (data.success) {
        showToast.success(`Đã chuyển sang '${getStatusConfig(newStatus).label}'`);
        await fetchData();
        if (selectedPack?.pack_id === packId) {
          setSelectedPack(data.data);
        }
      } else {
        showToast.error(data.error || 'Không thể cập nhật trạng thái');
      }
    } catch (error) {
      console.error('Error updating status:', error);
      showToast.error('Lỗi cập nhật trạng thái');
    }
  };

  // Delete pack
  const handleDeletePack = async (packId: string) => {
    if (!confirm('Bạn có chắc muốn xóa content pack này?')) return;

    try {
      const response = await fetch(`http://localhost:3001/api/packs/${packId}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        showToast.success('Đã xóa content pack');
        await fetchData();
        setSelectedPack(null);
      } else {
        showToast.error(data.error || 'Không thể xóa');
      }
    } catch (error) {
      console.error('Error deleting pack:', error);
      showToast.error('Lỗi xóa content pack');
    }
  };

  // Save draft content
  const handleSaveDraft = async (packId: string, newContent: string) => {
    try {
      const response = await fetch(`http://localhost:3001/api/packs/${packId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ draft_content: newContent }),
      });

      const data = await response.json();

      if (data.success) {
        showToast.success('Draft đã được lưu!');
        await fetchData();
        if (selectedPack?.pack_id === packId) {
          setSelectedPack(data.data);
        }
      } else {
        showToast.error(data.error || 'Không thể lưu draft');
      }
    } catch (error) {
      console.error('Error saving draft:', error);
      showToast.error('Lỗi lưu draft');
      throw error;
    }
  };

  // Publish pack to Content
  const handlePublishToContent = async (packId: string) => {
    try {
      const response = await fetch(`http://localhost:3001/api/contents/from-pack/${packId}`, {
        method: 'POST',
      });

      const data = await response.json();

      if (data.success) {
        showToast.success('🎉 Đã publish thành Content!');
        await fetchData();
      } else {
        showToast.error(data.error || 'Không thể publish');
      }
    } catch (error) {
      console.error('Error publishing to content:', error);
      showToast.error('Lỗi publish content');
    }
  };

  // Generate derivatives
  const generateDerivatives = async () => {
    if (!selectedPack) {
      showToast.error('Please select a content pack first');
      return;
    }

    setIsGenerating(true);
    try {
      const response = await fetch('http://localhost:3001/api/packs/derivatives', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pack_id: selectedPack.pack_id,
          language: 'vi',
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        showToast.success('Derivatives generated successfully!');
        
        setSelectedPack({
          ...selectedPack,
          derivatives: data.data.derivatives,
        });
        
        setPacks(packs.map(p => 
          p.pack_id === selectedPack.pack_id 
            ? { ...p, derivatives: data.data.derivatives }
            : p
        ));
      } else {
        throw new Error(data.error || 'Failed to generate derivatives');
      }
    } catch (error: any) {
      console.error('Generation error:', error);
      showToast.error(error.message || 'Failed to generate derivatives');
    } finally {
      setIsGenerating(false);
    }
  };

  // Regenerate single derivative
  const handleRegenerate = async (type: keyof ContentDerivatives) => {
    if (!selectedPack) return;
    
    setIsGenerating(true);
    try {
      const response = await fetch(
        `http://localhost:3001/api/packs/${selectedPack.pack_id}/derivatives/regenerate`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ type, language: 'vi' }),
        }
      );

      const data = await response.json();
      
      if (data.success) {
        showToast.success(`${type} regenerated successfully!`);
        await fetchData();
      } else {
        throw new Error(data.error);
      }
    } catch (error: any) {
      showToast.error(error.message || 'Failed to regenerate');
    } finally {
      setIsGenerating(false);
    }
  };

  // Export derivatives
  const exportDerivatives = async (format: 'json' | 'md') => {
    if (!selectedPack?.derivatives) {
      showToast.error('No derivatives to export');
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:3001/api/packs/${selectedPack.pack_id}/derivatives/export?format=${format}`
      );
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `derivatives-${selectedPack.pack_id}.${format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      
      showToast.success(`Exported as ${format.toUpperCase()}`);
    } catch (error) {
      showToast.error('Failed to export');
    }
  };

  // Get briefs without packs
  const briefsWithoutPacks = briefs.filter(
    (brief) => !packs.some((pack) => pack.brief_id === brief.id)
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 p-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold mb-8 text-white">🎨 Content Studio</h1>
          <TableSkeleton rows={6} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
            <Package className="w-10 h-10 text-purple-400" />
            Content Studio
          </h1>
          <p className="text-gray-300">Create drafts, generate multi-platform content, and manage versions</p>
        </motion.div>

        {/* Pack Selector */}
        <div className="mb-6">
          <div className="relative max-w-md">
            <button
              onClick={() => setShowPackSelector(!showPackSelector)}
              className="w-full flex items-center justify-between gap-3 px-4 py-3 bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl hover:border-purple-400/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <Package className="w-5 h-5 text-purple-400" />
                <div className="text-left">
                  <div className="text-sm text-gray-400">Selected Pack</div>
                  <div className="text-white font-medium truncate max-w-[300px]">
                    {selectedPack?.brief_title || 'Select a pack...'}
                  </div>
                </div>
              </div>
              <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${showPackSelector ? 'rotate-180' : ''}`} />
            </button>

            {showPackSelector && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute top-full left-0 right-0 mt-2 bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl shadow-xl z-50 max-h-64 overflow-y-auto"
              >
                {packs.map((pack) => (
                  <button
                    key={pack.pack_id}
                    onClick={() => {
                      setSelectedPack(pack);
                      setShowPackSelector(false);
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-white/10 transition-colors ${
                      selectedPack?.pack_id === pack.pack_id ? 'bg-white/10' : ''
                    }`}
                  >
                    <Package className="w-4 h-4 text-gray-400" />
                    <div className="text-left flex-1">
                      <div className="text-white text-sm truncate">{pack.brief_title}</div>
                      <div className="text-xs text-gray-400">
                        {pack.word_count} words • {pack.status}
                        {pack.derivatives && <span className="ml-2 text-emerald-400">✓ Published</span>}
                      </div>
                    </div>
                  </button>
                ))}
                {packs.length === 0 && (
                  <div className="px-4 py-6 text-center text-gray-400">
                    No packs available
                  </div>
                )}
              </motion.div>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-2 mb-6 p-1 bg-white/5 rounded-xl w-fit">
          <button
            onClick={() => setActiveTab('draft')}
            className={`px-6 py-3 rounded-lg font-medium transition-all flex items-center gap-2 ${
              activeTab === 'draft'
                ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <FileText className="w-4 h-4" />
            Draft
          </button>
          <button
            onClick={() => setActiveTab('publish')}
            className={`px-6 py-3 rounded-lg font-medium transition-all flex items-center gap-2 ${
              activeTab === 'publish'
                ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Send className="w-4 h-4" />
            Publish
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-6 py-3 rounded-lg font-medium transition-all flex items-center gap-2 ${
              activeTab === 'history'
                ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <History className="w-4 h-4" />
            History
          </button>
        </div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          {activeTab === 'draft' && (
            <motion.div
              key="draft"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="grid grid-cols-1 lg:grid-cols-3 gap-6"
            >
              {/* Left: Briefs without packs */}
              <div className="lg:col-span-1">
                <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-amber-400" />
                  Available Briefs ({briefsWithoutPacks.length})
                </h2>

                <div className="space-y-3 max-h-[600px] overflow-y-auto">
                  {briefsWithoutPacks.length === 0 ? (
                    <div className="bg-white/5 rounded-xl p-6 text-center text-gray-400">
                      <CheckCircle2 className="w-10 h-10 mx-auto mb-2 text-emerald-400" />
                      <p>All briefs have packs!</p>
                    </div>
                  ) : (
                    briefsWithoutPacks.map((brief) => (
                      <div
                        key={brief.id}
                        className="bg-white/5 backdrop-blur-lg rounded-xl p-4 border border-white/10 hover:border-purple-400/50 transition-all"
                      >
                        <h3 className="text-white font-medium mb-1 line-clamp-1">
                          {brief.title}
                        </h3>
                        <p className="text-gray-400 text-sm mb-3 line-clamp-2">
                          {brief.objective}
                        </p>
                        <button
                          onClick={() => setShowDraftOptions(brief.id)}
                          disabled={isStreaming}
                          className={`w-full px-4 py-2 rounded-lg font-medium text-sm flex items-center justify-center gap-2 transition-all ${
                            isStreaming
                              ? 'bg-gray-500/30 text-gray-400 cursor-not-allowed'
                              : 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:shadow-lg hover:shadow-purple-500/30'
                          }`}
                        >
                          <Sparkles className="w-4 h-4" />
                          Create Draft
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Right: Selected pack editor */}
              <div className="lg:col-span-2">
                {selectedPack ? (
                  <div className="bg-white/5 backdrop-blur-lg rounded-xl border border-white/10 p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                        <FileText className="w-5 h-5 text-purple-400" />
                        {selectedPack.brief_title}
                      </h2>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium border flex items-center gap-1 ${getStatusConfig(selectedPack.status).color}`}
                      >
                        <StatusIcon status={selectedPack.status} />
                        {getStatusConfig(selectedPack.status).label}
                      </span>
                    </div>
                    
                    <DraftEditor
                      content={selectedPack.draft_content || ''}
                      isStreaming={false}
                      wordCount={selectedPack.word_count || 0}
                      packId={selectedPack.pack_id}
                      onSave={(newContent) => handleSaveDraft(selectedPack.pack_id, newContent)}
                    />

                    <div className="flex items-center justify-between mt-6 pt-6 border-t border-white/10">
                      <button
                        onClick={() => handleDeletePack(selectedPack.pack_id)}
                        className="px-4 py-2 bg-red-500/20 text-red-400 border border-red-500/30 rounded-lg hover:bg-red-500/30 transition-colors flex items-center gap-2"
                      >
                        <Trash2 className="w-4 h-4" />
                        Delete
                      </button>

                      <div className="flex items-center gap-2">
                        {ALLOWED_TRANSITIONS[selectedPack.status]?.map((nextStatus) => {
                          const nextConfig = getStatusConfig(nextStatus);
                          return (
                            <button
                              key={nextStatus}
                              onClick={() => handleUpdateStatus(selectedPack.pack_id, nextStatus)}
                              className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${nextConfig.color}`}
                            >
                              <ArrowRight className="w-4 h-4" />
                              {nextConfig.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-white/5 rounded-xl p-12 text-center text-gray-400">
                    <Package className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <p className="text-lg">No pack selected</p>
                    <p className="text-sm mt-1">Select a pack from the dropdown above</p>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {activeTab === 'publish' && (
            <motion.div
              key="publish"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              {selectedPack ? (
                <div>
                  {/* Action Bar */}
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={generateDerivatives}
                        disabled={!selectedPack || isGenerating}
                        className={`
                          flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all
                          ${selectedPack && !isGenerating
                            ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-500 hover:to-pink-500'
                            : 'bg-gray-700/50 text-gray-400 cursor-not-allowed'
                          }
                        `}
                      >
                        {isGenerating ? (
                          <RefreshCw className="w-5 h-5 animate-spin" />
                        ) : (
                          <Sparkles className="w-5 h-5" />
                        )}
                        <span>{isGenerating ? 'Generating...' : 'Generate Derivatives'}</span>
                      </button>

                      {selectedPack?.derivatives && (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => exportDerivatives('json')}
                            className="flex items-center gap-2 px-4 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-colors"
                          >
                            <FileJson className="w-4 h-4" />
                            JSON
                          </button>
                          <button
                            onClick={() => exportDerivatives('md')}
                            className="flex items-center gap-2 px-4 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-colors"
                          >
                            <FileText className="w-4 h-4" />
                            Markdown
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Derivatives Content */}
                  <div className="glass-card rounded-2xl p-6">
                    {isGenerating ? (
                      <DerivativesLoading />
                    ) : !selectedPack.derivatives || !selectedPack.derivatives.twitter_thread || selectedPack.derivatives.twitter_thread.length === 0 ? (
                      <DerivativesEmptyState
                        onGenerate={generateDerivatives}
                        isGenerating={isGenerating}
                      />
                    ) : (
                      <DerivativeTabs
                        derivatives={selectedPack.derivatives}
                        onRegenerate={handleRegenerate}
                        isLoading={isGenerating}
                      />
                    )}
                  </div>
                </div>
              ) : (
                <div className="bg-white/5 rounded-xl p-12 text-center text-gray-400">
                  <Send className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p className="text-lg">No pack selected</p>
                  <p className="text-sm mt-1">Select a pack to generate multi-platform content</p>
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'history' && (
            <motion.div
              key="history"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <div className="bg-white/5 rounded-xl p-12 text-center text-gray-400">
                <History className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg">Version History</p>
                <p className="text-sm mt-1">Coming soon - Track all changes and versions</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Draft Options Modal */}
        <AnimatePresence>
          {showDraftOptions && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50"
              onClick={() => setShowDraftOptions(null)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl w-full max-w-md border border-purple-500/30"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="px-6 py-4 border-b border-white/10">
                  <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <Sparkles className="w-6 h-6 text-purple-400" />
                    Draft Options
                  </h2>
                  <p className="text-gray-400 text-sm mt-1">
                    Configure parameters for content generation
                  </p>
                </div>

                <div className="p-6 space-y-6">
                  {/* Word Count Slider */}
                  <div>
                    <label className="block text-white font-medium mb-2">
                      Length: {draftOptions.wordCount} words
                    </label>
                    <input
                      type="range"
                      min="300"
                      max="2000"
                      step="100"
                      value={draftOptions.wordCount}
                      onChange={(e) =>
                        setDraftOptions({ ...draftOptions, wordCount: parseInt(e.target.value) })
                      }
                      className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-purple-500"
                    />
                    <div className="flex justify-between text-xs text-gray-400 mt-1">
                      <span>300</span>
                      <span>2000</span>
                    </div>
                  </div>

                  {/* Style Selector */}
                  <div>
                    <label className="block text-white font-medium mb-2">Style</label>
                    <div className="grid grid-cols-3 gap-2">
                      {['professional', 'casual', 'academic'].map((style) => (
                        <button
                          key={style}
                          onClick={() => setDraftOptions({ ...draftOptions, style })}
                          className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                            draftOptions.style === style
                              ? 'bg-purple-500 text-white'
                              : 'bg-gray-700/50 text-gray-300 hover:bg-gray-700'
                          }`}
                        >
                          {style === 'professional'
                            ? 'Professional'
                            : style === 'casual'
                            ? 'Casual'
                            : 'Academic'}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* RAG Toggle */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-white font-medium">RAG - Knowledge Base</label>
                      <button
                        onClick={() => setDraftOptions({ ...draftOptions, useRAG: !draftOptions.useRAG })}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          draftOptions.useRAG ? 'bg-purple-500' : 'bg-gray-600'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            draftOptions.useRAG ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>
                    {draftOptions.useRAG ? (
                      <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-3 space-y-1">
                        <p className="text-purple-300 text-sm font-medium flex items-center gap-1">
                          <CheckCircle2 className="w-4 h-4" />
                          RAG Enabled
                        </p>
                        <ul className="text-gray-400 text-xs space-y-0.5 ml-5">
                          <li>✓ Content based on real documents</li>
                          <li>✓ Citations included [1][2][3]</li>
                          <li>✓ Reduced hallucination</li>
                        </ul>
                      </div>
                    ) : (
                      <p className="text-gray-400 text-sm">
                        Using general AI knowledge
                      </p>
                    )}
                  </div>
                </div>

                <div className="px-6 py-4 border-t border-white/10 flex items-center justify-between">
                  <button
                    onClick={() => setShowDraftOptions(null)}
                    className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleGenerateDraft(showDraftOptions)}
                    disabled={isStreaming}
                    className={`px-6 py-2 rounded-lg font-medium flex items-center gap-2 transition-all ${
                      isStreaming
                        ? 'bg-gray-500/30 text-gray-400 cursor-not-allowed'
                        : 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:shadow-lg hover:shadow-purple-500/30'
                    }`}
                  >
                    {isStreaming ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        Create Draft
                      </>
                    )}
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}


