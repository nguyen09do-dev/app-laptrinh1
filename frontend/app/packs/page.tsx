'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { DraftEditor } from '../components/DraftEditor';
import { TableSkeleton } from '@/components/ui/loading-skeleton';
import { showToast } from '@/lib/toast';
import { apiGet, createAbortController } from '@/lib/apiClient';
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
  created_at: string;
  updated_at: string;
}

type PackStatus = ContentPack['status'];

// Status config - using string labels for icons to avoid rendering issues
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

export default function PacksPage() {
  const router = useRouter();
  
  // Redirect to Content Studio
  useEffect(() => {
    router.push('/studio');
  }, [router]);

  // State
  const [briefs, setBriefs] = useState<Brief[]>([]);
  const [packs, setPacks] = useState<ContentPack[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBrief, setSelectedBrief] = useState<Brief | null>(null);
  const [selectedPack, setSelectedPack] = useState<ContentPack | null>(null);

  // Generation state
  const [isStreaming, setIsStreaming] = useState(false);

  // Draft options modal state
  const [showDraftOptions, setShowDraftOptions] = useState<number | null>(null);
  const [draftOptions, setDraftOptions] = useState({
    wordCount: 800,
    style: 'professional',
    useRAG: false,
  });

  // Fetch data
  const fetchData = useCallback(async () => {
    let mounted = true;
    const controller = createAbortController();

    try {
      setLoading(true);

      // Fetch briefs and packs in parallel
      const [briefsData, packsData] = await Promise.allSettled([
        apiGet<Brief[]>('/briefs', { signal: controller.signal, timeout: 10000 }),
        apiGet<ContentPack[]>('/packs', { signal: controller.signal, timeout: 10000 }),
      ]);

      if (!mounted) return;

      if (briefsData.status === 'fulfilled') {
        setBriefs(Array.isArray(briefsData.value) ? briefsData.value : []);
      } else {
        console.error('Error fetching briefs:', briefsData.reason);
      }

      if (packsData.status === 'fulfilled') {
        setPacks(Array.isArray(packsData.value) ? packsData.value : []);
      } else {
        console.error('Error fetching packs:', packsData.reason);
        // Packs table might not exist yet - that's OK
      }
    } catch (error: any) {
      if (!mounted) return;
      console.error('Error fetching data:', error);
      const errorMsg = error.message || 'Không thể tải dữ liệu';
      showToast.error(errorMsg);
    } finally {
      if (mounted) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    let mounted = true;
    const controller = createAbortController();

    fetchData();

    return () => {
      mounted = false;
      controller.abort();
    };
  }, [fetchData]);

  // Generate draft with options (non-streaming, JSON response)
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

        // Auto-open the newly created pack in modal
        setSelectedPack(data.data);
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
        // Update selected pack if it's the same one
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
        setSelectedPack(null);
        // Optionally redirect to content page
        // window.location.href = '/content';
      } else {
        showToast.error(data.error || 'Không thể publish');
      }
    } catch (error) {
      console.error('Error publishing to content:', error);
      showToast.error('Lỗi publish content');
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
          <h1 className="text-3xl font-bold mb-8 text-white">📦 Content Packs</h1>
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
            Content Packs
          </h1>
          <p className="text-gray-300">Tạo và quản lý draft content với tùy chọn RAG & style</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: Briefs without packs */}
          <div className="lg:col-span-1">
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-amber-400" />
              Briefs chưa có pack ({briefsWithoutPacks.length})
            </h2>

            <div className="space-y-3">
              {briefsWithoutPacks.length === 0 ? (
                <div className="bg-white/5 rounded-xl p-6 text-center text-gray-400">
                  <CheckCircle2 className="w-10 h-10 mx-auto mb-2 text-emerald-400" />
                  <p>Tất cả briefs đã có pack!</p>
                </div>
              ) : (
                briefsWithoutPacks.map((brief) => (
                  <motion.div
                    key={brief.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
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
                      Tạo Draft
                    </button>
                  </motion.div>
                ))
              )}
            </div>
          </div>

          {/* Right: Existing packs */}
          <div className="lg:col-span-2">
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
              <Package className="w-5 h-5 text-purple-400" />
              Content Packs ({packs.length})
            </h2>

            {packs.length === 0 ? (
              <div className="bg-white/5 rounded-xl p-12 text-center text-gray-400">
                <Package className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg">Chưa có content pack nào</p>
                <p className="text-sm mt-1">Tạo pack từ briefs bên trái</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {packs.map((pack) => {
                  const statusConfig = getStatusConfig(pack.status);
                  const safeStatus = (['draft', 'review', 'approved', 'published'].includes(pack.status) ? pack.status : 'draft') as PackStatus;
                  const allowedNext = ALLOWED_TRANSITIONS[safeStatus] || [];

                  return (
                    <motion.div
                      key={pack.pack_id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="bg-white/5 backdrop-blur-lg rounded-xl border border-white/10 hover:border-purple-400/30 transition-all overflow-hidden"
                    >
                      {/* Pack header */}
                      <div className="p-4 border-b border-white/10">
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="text-white font-medium line-clamp-1 flex-1">
                            {pack.brief_title || `Pack #${pack.pack_id?.slice(0, 8) || 'N/A'}`}
                          </h3>
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium border flex items-center gap-1 ${statusConfig.color}`}
                          >
                            <StatusIcon status={safeStatus} />
                            {statusConfig.label}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-gray-400">
                          <span className="flex items-center gap-1">
                            <FileText className="w-3 h-3" />
                            {pack.word_count || 0} từ
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {pack.created_at ? new Date(pack.created_at).toLocaleDateString('vi-VN') : 'N/A'}
                          </span>
                        </div>
                      </div>

                      {/* Content preview */}
                      <div className="p-4">
                        <p className="text-gray-300 text-sm line-clamp-3 mb-4">
                          {pack.draft_content?.slice(0, 200) || 'Không có nội dung'}...
                        </p>

                        {/* Actions */}
                        <div className="flex flex-wrap items-center gap-2">
                          <button
                            onClick={() => setSelectedPack(pack)}
                            className="flex-1 px-3 py-2 bg-purple-500/20 text-purple-300 rounded-lg text-sm font-medium hover:bg-purple-500/30 transition-colors flex items-center justify-center gap-1"
                          >
                            <Eye className="w-4 h-4" />
                            Xem
                          </button>

                          {/* Status transition buttons */}
                          {allowedNext.map((nextStatus) => {
                            const nextConfig = getStatusConfig(nextStatus);
                            return (
                              <button
                                key={nextStatus}
                                onClick={() => handleUpdateStatus(pack.pack_id, nextStatus)}
                                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1 ${nextConfig.color.replace('/20', '/10').replace('/30', '/20')} hover:opacity-80`}
                                title={`Chuyển sang ${nextConfig.label}`}
                              >
                                <ArrowRight className="w-3 h-3" />
                                {nextConfig.label}
                              </button>
                            );
                          })}

                          {/* Publish to Content button for published packs */}
                          {safeStatus === 'published' && (
                            <button
                              onClick={() => handlePublishToContent(pack.pack_id)}
                              className="w-full mt-2 px-3 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-lg text-sm font-medium hover:shadow-lg hover:shadow-emerald-500/30 transition-all flex items-center justify-center gap-1"
                            >
                              <Upload className="w-4 h-4" />
                              Publish to Content
                            </button>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Pack Detail Modal */}
        <AnimatePresence>
          {selectedPack && (() => {
            const modalStatusConfig = getStatusConfig(selectedPack.status);
            const modalSafeStatus = (['draft', 'review', 'approved', 'published'].includes(selectedPack.status) ? selectedPack.status : 'draft') as PackStatus;
            const modalAllowedNext = ALLOWED_TRANSITIONS[modalSafeStatus] || [];

            return (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50"
                onClick={() => setSelectedPack(null)}
              >
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.9, opacity: 0 }}
                  className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden border border-purple-500/30 flex flex-col"
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* Modal header */}
                  <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between">
                    <div>
                      <h2 className="text-xl font-bold text-white">
                        {selectedPack.brief_title || 'Content Pack'}
                      </h2>
                      <div className="flex items-center gap-3 mt-1">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium border flex items-center gap-1 ${modalStatusConfig.color}`}
                        >
                          <StatusIcon status={modalSafeStatus} />
                          {modalStatusConfig.label}
                        </span>
                        <span className="text-gray-400 text-sm">
                          {selectedPack.word_count || 0} từ
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => setSelectedPack(null)}
                      className="text-gray-400 hover:text-white transition-colors"
                    >
                      <X className="w-6 h-6" />
                    </button>
                  </div>

                  {/* Modal content */}
                  <div className="flex-1 overflow-y-auto p-6">
                    <DraftEditor
                      content={selectedPack.draft_content || ''}
                      isStreaming={false}
                      wordCount={selectedPack.word_count || 0}
                    />
                  </div>

                  {/* Modal footer */}
                  <div className="px-6 py-4 border-t border-white/10 flex items-center justify-between">
                    <button
                      onClick={() => handleDeletePack(selectedPack.pack_id)}
                      className="px-4 py-2 bg-red-500/20 text-red-400 border border-red-500/30 rounded-lg hover:bg-red-500/30 transition-colors flex items-center gap-2"
                    >
                      <Trash2 className="w-4 h-4" />
                      Xóa Pack
                    </button>

                    <div className="flex items-center gap-2">
                      {modalAllowedNext.map((nextStatus) => {
                        const nextConfig = getStatusConfig(nextStatus);
                        return (
                          <button
                            key={nextStatus}
                            onClick={() => handleUpdateStatus(selectedPack.pack_id, nextStatus)}
                            className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${nextConfig.color}`}
                          >
                            <ChevronRight className="w-4 h-4" />
                            Chuyển sang {nextConfig.label}
                          </button>
                        );
                      })}

                      {/* Publish to Content button - only for published packs */}
                      {modalSafeStatus === 'published' && (
                        <button
                          onClick={() => handlePublishToContent(selectedPack.pack_id)}
                          className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-lg font-medium hover:shadow-lg hover:shadow-emerald-500/30 transition-all flex items-center gap-2"
                        >
                          <Upload className="w-4 h-4" />
                          Publish to Content
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            );
          })()}
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
                    Tùy chọn tạo Draft
                  </h2>
                  <p className="text-gray-400 text-sm mt-1">
                    Cấu hình các tham số cho nội dung
                  </p>
                </div>

                <div className="p-6 space-y-6">
                  {/* Word Count Slider */}
                  <div>
                    <label className="block text-white font-medium mb-2">
                      Độ dài: {draftOptions.wordCount} từ
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
                    <label className="block text-white font-medium mb-2">Phong cách</label>
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
                            ? 'Chuyên nghiệp'
                            : style === 'casual'
                            ? 'Thân thiện'
                            : 'Học thuật'}
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
                          RAG được bật
                        </p>
                        <ul className="text-gray-400 text-xs space-y-0.5 ml-5">
                          <li>✓ Nội dung dựa trên tài liệu thực</li>
                          <li>✓ Có trích dẫn nguồn [1][2][3]</li>
                          <li>✓ Giảm thiểu hallucination</li>
                        </ul>
                      </div>
                    ) : (
                      <p className="text-gray-400 text-sm">
                        Sử dụng kiến thức tổng quát của AI
                      </p>
                    )}
                  </div>
                </div>

                <div className="px-6 py-4 border-t border-white/10 flex items-center justify-between">
                  <button
                    onClick={() => setShowDraftOptions(null)}
                    className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
                  >
                    Hủy
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
                        Đang tạo...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        Tạo Draft Pack
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

