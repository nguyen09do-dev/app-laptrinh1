'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, FileText, Database, Upload, Search, Filter, X } from 'lucide-react';
import { useDocuments, useDocumentStats } from '../hooks/useDocuments';
import DocumentUploadDialog from '../components/DocumentUploadDialog';
import DocumentsTableView from '../components/DocumentsTableView';
import { ContentRenderer } from '@/components/ui/content-renderer';
import { EmptyState } from '@/components/ui/empty-state';
import { TableSkeleton } from '@/components/ui/loading-skeleton';
import { showToast } from '@/lib/toast';

type LibraryTab = 'published' | 'documents';

interface Content {
  id: number;
  brief_id: number;
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
}

export default function LibraryPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tabParam = searchParams.get('tab') as LibraryTab | null;
  const [activeTab, setActiveTab] = useState<LibraryTab>(tabParam || 'published');

  // Published Content State
  const [contents, setContents] = useState<Content[]>([]);
  const [selectedContent, setSelectedContent] = useState<Content | null>(null);
  const [loadingContents, setLoadingContents] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterFormat, setFilterFormat] = useState<string>('all');

  // Documents State
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterAuthor, setFilterAuthor] = useState('');
  const [filterTags, setFilterTags] = useState<string[]>([]);

  // Fetch documents using hook
  const { documents, isLoading: loadingDocuments, mutate } = useDocuments({
    author: filterAuthor || undefined,
    tags: filterTags.length > 0 ? filterTags : undefined,
  });

  const { stats, isLoading: statsLoading } = useDocumentStats();

  // Fetch published contents
  const fetchContents = async () => {
    try {
      setLoadingContents(true);
      const contentsRes = await fetch('http://localhost:3001/api/contents');
      const contentsData = await contentsRes.json();
      setContents(contentsData.data || []);
    } catch (error) {
      console.error('Error fetching contents:', error);
      showToast.error('Không thể tải dữ liệu');
    } finally {
      setLoadingContents(false);
    }
  };

  useEffect(() => {
    fetchContents();
  }, []);

  // Update URL when tab changes
  useEffect(() => {
    if (tabParam !== activeTab) {
      router.replace(`/library?tab=${activeTab}`, { scroll: false });
    }
  }, [activeTab, tabParam, router]);

  // Filter documents by search term
  const filteredDocuments = documents.filter((doc: any) => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    return (
      doc.title?.toLowerCase().includes(search) ||
      doc.author?.toLowerCase().includes(search) ||
      doc.tags?.some((tag: string) => tag.toLowerCase().includes(search))
    );
  });

  // Get unique values for filters
  const uniqueAuthors = Array.from(new Set(documents.map((d: any) => d.author).filter(Boolean)));
  const uniqueTags = Array.from(new Set(documents.flatMap((d: any) => d.tags || [])));
  const uniqueStatuses = Array.from(new Set(contents.map(c => c.status))).sort();
  const uniqueFormats = Array.from(new Set(contents.map(c => c.format))).sort();

  // Filter contents
  const filteredContents = contents.filter(content => {
    const matchStatus = filterStatus === 'all' || content.status === filterStatus;
    const matchFormat = filterFormat === 'all' || content.format === filterFormat;
    return matchStatus && matchFormat;
  });

  const handleDeleteContent = async (id: number) => {
    if (!confirm('Bạn có chắc muốn xóa content này?')) return;

    try {
      const response = await fetch(`http://localhost:3001/api/contents/${id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        await fetchContents();
        setSelectedContent(null);
        showToast.success('Đã xóa content thành công!');
      } else {
        showToast.error(data.error || 'Không thể xóa content');
      }
    } catch (error) {
      console.error('Error deleting content:', error);
      showToast.error('Lỗi khi xóa content');
    }
  };

  const handleDeleteDocument = async (docId: string) => {
    if (!confirm('Are you sure you want to delete this document? This will also remove all citations.')) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:3001/api/rag/documents/${docId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        showToast.success('Document deleted successfully');
        mutate();
      } else {
        const error = await response.json();
        showToast.error(error.error || 'Failed to delete document');
      }
    } catch (error) {
      console.error('Delete error:', error);
      showToast.error('Failed to delete document');
    }
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

  const clearFilters = () => {
    setSearchTerm('');
    setFilterAuthor('');
    setFilterTags([]);
    setFilterStatus('all');
    setFilterFormat('all');
  };

  const hasActiveFilters = searchTerm || filterAuthor || filterTags.length > 0 || filterStatus !== 'all' || filterFormat !== 'all';

  return (
    <div className="min-h-screen bg-gradient-to-br from-midnight-950 via-midnight-900 to-midnight-950 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
            <BookOpen className="w-10 h-10 text-mint-400" />
            Content Library
          </h1>
          <p className="text-midnight-300">
            Browse published content and manage your knowledge base
          </p>
        </motion.div>

        {/* Tabs */}
        <div className="flex items-center gap-2 mb-6 p-1 bg-white/5 rounded-xl w-fit">
          <button
            onClick={() => setActiveTab('published')}
            className={`px-6 py-3 rounded-lg font-medium transition-all flex items-center gap-2 ${
              activeTab === 'published'
                ? 'bg-gradient-to-r from-mint-500 to-mint-600 text-white shadow-lg'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <FileText className="w-4 h-4" />
            Published Content
          </button>
          <button
            onClick={() => setActiveTab('documents')}
            className={`px-6 py-3 rounded-lg font-medium transition-all flex items-center gap-2 ${
              activeTab === 'documents'
                ? 'bg-gradient-to-r from-coral-500 to-coral-600 text-white shadow-lg'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Database className="w-4 h-4" />
            Knowledge Base
          </button>
        </div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          {activeTab === 'published' && (
            <motion.div
              key="published"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              {/* Filter section */}
              {contents.length > 0 && (
                <div className="mb-6 space-y-4 glass-card p-6 rounded-xl">
                  {/* Status filter */}
                  <div>
                    <h3 className="text-sm font-medium text-gray-300 mb-2">📊 Lọc theo Trạng thái</h3>
                    <div className="flex items-center gap-2 flex-wrap">
                      <button
                        onClick={() => setFilterStatus('all')}
                        className={`px-4 py-2 rounded-lg font-medium transition-all ${
                          filterStatus === 'all'
                            ? 'bg-mint-600 text-white'
                            : 'bg-white/10 text-gray-300 hover:bg-white/20'
                        }`}
                      >
                        Tất cả ({contents.length})
                      </button>
                      {uniqueStatuses.map(status => (
                        <button
                          key={status}
                          onClick={() => setFilterStatus(status)}
                          className={`px-4 py-2 rounded-lg font-medium transition-all ${
                            filterStatus === status
                              ? 'bg-mint-600 text-white'
                              : 'bg-white/10 text-gray-300 hover:bg-white/20'
                          }`}
                        >
                          {status} ({contents.filter(c => c.status === status).length})
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Format filter */}
                  {uniqueFormats.length > 1 && (
                    <div>
                      <h3 className="text-sm font-medium text-gray-300 mb-2">📄 Lọc theo Định dạng</h3>
                      <div className="flex items-center gap-2 flex-wrap">
                        <button
                          onClick={() => setFilterFormat('all')}
                          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                            filterFormat === 'all'
                              ? 'bg-mint-600 text-white'
                              : 'bg-white/10 text-gray-300 hover:bg-white/20'
                          }`}
                        >
                          Tất cả ({contents.length})
                        </button>
                        {uniqueFormats.map((format) => (
                          <button
                            key={format}
                            onClick={() => setFilterFormat(format)}
                            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                              filterFormat === format
                                ? 'bg-mint-600 text-white'
                                : 'bg-white/10 text-gray-300 hover:bg-white/20'
                            }`}
                          >
                            {format} ({contents.filter(c => c.format === format).length})
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Clear filters */}
                  {(filterStatus !== 'all' || filterFormat !== 'all') && (
                    <button
                      onClick={() => {
                        setFilterStatus('all');
                        setFilterFormat('all');
                      }}
                      className="px-4 py-2 bg-white/10 hover:bg-white/20 text-gray-300 rounded-lg transition-colors flex items-center gap-2"
                    >
                      <X className="w-4 h-4" />
                      Xóa bộ lọc
                    </button>
                  )}
                </div>
              )}

              {/* Contents Grid */}
              {loadingContents ? (
                <TableSkeleton rows={6} />
              ) : contents.length === 0 ? (
                <EmptyState
                  icon={FileText}
                  title="No published content yet"
                  description="Create and publish content from Content Studio to see them here"
                  action={{ label: 'Go to Content Studio', onClick: () => router.push('/studio') }}
                />
              ) : filteredContents.length === 0 ? (
                <div className="glass-card rounded-xl p-12 text-center">
                  <span className="text-6xl mb-4 block">🔍</span>
                  <h3 className="text-xl font-semibold text-white mb-2">
                    Không tìm thấy content phù hợp
                  </h3>
                  <p className="text-gray-300 mb-4">
                    Thử điều chỉnh bộ lọc của bạn
                  </p>
                  <button
                    onClick={() => {
                      setFilterStatus('all');
                      setFilterFormat('all');
                    }}
                    className="px-4 py-2 bg-mint-600 hover:bg-mint-500 text-white rounded-lg transition-colors"
                  >
                    Xóa tất cả bộ lọc
                  </button>
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-gray-300 text-sm">
                      Hiển thị <span className="font-semibold text-white">{filteredContents.length}</span> trong tổng số <span className="font-semibold text-white">{contents.length}</span> contents
                    </p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredContents.map((content) => (
                      <motion.div
                        key={content.id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        onClick={() => setSelectedContent(content)}
                        className="glass-card rounded-xl p-6 hover:border-mint-400/50 transition-all cursor-pointer"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <h3 className="text-lg font-semibold text-white flex-1 line-clamp-2">{content.title}</h3>
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                              content.status
                            )}`}
                          >
                            {content.status}
                          </span>
                        </div>
                        <p className="text-gray-300 text-sm mb-3 line-clamp-3">{content.body}</p>
                        <div className="flex items-center justify-between text-xs text-gray-400">
                          <span>📊 {content.word_count} từ</span>
                          <span>⏱️ {content.reading_time || Math.ceil(content.word_count / 200)} phút đọc</span>
                        </div>
                        <div className="text-xs text-gray-500 mt-2">
                          🕒 {new Date(content.created_at).toLocaleDateString('vi-VN')}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </>
              )}

              {/* Content Detail Modal */}
              {selectedContent && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50"
                  onClick={() => setSelectedContent(null)}
                >
                  <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-mint-500/30"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="flex items-start justify-between mb-6">
                      <div className="flex-1">
                        <h2 className="text-3xl font-bold text-white mb-2">{selectedContent.title}</h2>
                        <div className="flex items-center gap-3">
                          <span
                            className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(
                              selectedContent.status
                            )}`}
                          >
                            {selectedContent.status}
                          </span>
                          <span className="text-gray-400 text-sm">
                            📊 {selectedContent.word_count} từ
                          </span>
                          <span className="text-gray-400 text-sm">
                            ⏱️ {selectedContent.reading_time || Math.ceil(selectedContent.word_count / 200)} phút đọc
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => setSelectedContent(null)}
                        className="text-gray-400 hover:text-white text-2xl"
                      >
                        ×
                      </button>
                    </div>

                    <div className="mb-6">
                      <h3 className="text-xl font-semibold text-mint-400 mb-3">📄 Nội dung</h3>
                      <ContentRenderer content={selectedContent.body} />
                    </div>

                    <div className="flex gap-3">
                      <button
                        onClick={() => handleDeleteContent(selectedContent.id)}
                        className="px-6 py-2 bg-red-500/20 text-red-400 border border-red-500/30 rounded-lg hover:bg-red-500/30 transition-all"
                      >
                        🗑️ Xóa Content
                      </button>
                      <button
                        onClick={() => setSelectedContent(null)}
                        className="flex-1 px-6 py-2 bg-mint-500/20 text-mint-400 border border-mint-500/30 rounded-lg hover:bg-mint-500/30 transition-all"
                      >
                        Đóng
                      </button>
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </motion.div>
          )}

          {activeTab === 'documents' && (
            <motion.div
              key="documents"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              {/* Actions & Stats */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                  <button
                    onClick={() => setShowUploadDialog(true)}
                    className="px-6 py-3 bg-gradient-to-r from-coral-500 to-coral-600 text-white rounded-lg hover:shadow-lg hover:shadow-coral-500/50 transition-all flex items-center gap-2 font-medium"
                  >
                    <Upload className="w-5 h-5" />
                    Upload Document
                  </button>
                </div>

                {/* Stats Cards */}
                {!statsLoading && stats && (
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <div className="glass-card p-4 rounded-xl">
                      <div className="flex items-center gap-3">
                        <div className="p-3 bg-coral-500/20 rounded-lg">
                          <FileText className="w-6 h-6 text-coral-400" />
                        </div>
                        <div>
                          <p className="text-midnight-400 text-sm">Total Documents</p>
                          <p className="text-2xl font-bold text-white">{stats.total_documents || 0}</p>
                        </div>
                      </div>
                    </div>

                    <div className="glass-card p-4 rounded-xl">
                      <div className="flex items-center gap-3">
                        <div className="p-3 bg-mint-500/20 rounded-lg">
                          <Database className="w-6 h-6 text-mint-400" />
                        </div>
                        <div>
                          <p className="text-midnight-400 text-sm">Total Chunks</p>
                          <p className="text-2xl font-bold text-white">{stats.total_chunks || 0}</p>
                        </div>
                      </div>
                    </div>

                    <div className="glass-card p-4 rounded-xl">
                      <div className="flex items-center gap-3">
                        <div className="p-3 bg-blue-500/20 rounded-lg">
                          <Search className="w-6 h-6 text-blue-400" />
                        </div>
                        <div>
                          <p className="text-midnight-400 text-sm">Authors</p>
                          <p className="text-2xl font-bold text-white">{stats.total_authors || 0}</p>
                        </div>
                      </div>
                    </div>

                    <div className="glass-card p-4 rounded-xl">
                      <div className="flex items-center gap-3">
                        <div className="p-3 bg-purple-500/20 rounded-lg">
                          <Filter className="w-6 h-6 text-purple-400" />
                        </div>
                        <div>
                          <p className="text-midnight-400 text-sm">Unique Tags</p>
                          <p className="text-2xl font-bold text-white">{stats.total_tags || 0}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Search and Filters */}
                <div className="glass-card p-6 rounded-xl">
                  <div className="flex flex-col md:flex-row gap-4">
                    {/* Search */}
                    <div className="flex-1">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-midnight-400" />
                        <input
                          type="text"
                          placeholder="Search documents by title, author, or tags..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="w-full pl-10 pr-4 py-3 bg-midnight-800/50 border border-midnight-700 rounded-lg text-white placeholder-midnight-500 focus:outline-none focus:border-coral-500 transition-colors"
                        />
                      </div>
                    </div>

                    {/* Author Filter */}
                    {uniqueAuthors.length > 0 && (
                      <div className="w-full md:w-64">
                        <select
                          value={filterAuthor}
                          onChange={(e) => setFilterAuthor(e.target.value)}
                          className="w-full px-4 py-3 bg-midnight-800/50 border border-midnight-700 rounded-lg text-white focus:outline-none focus:border-coral-500 transition-colors"
                        >
                          <option value="">All Authors</option>
                          {uniqueAuthors.map((author: any) => (
                            <option key={author} value={author}>
                              {author}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}

                    {/* Clear Filters */}
                    {(searchTerm || filterAuthor || filterTags.length > 0) && (
                      <button
                        onClick={() => {
                          setSearchTerm('');
                          setFilterAuthor('');
                          setFilterTags([]);
                        }}
                        className="px-4 py-3 bg-midnight-800/50 border border-midnight-700 rounded-lg text-midnight-300 hover:text-white hover:border-coral-500 transition-all flex items-center gap-2"
                      >
                        <X className="w-4 h-4" />
                        Clear
                      </button>
                    )}
                  </div>

                  {/* Tags Filter */}
                  {uniqueTags.length > 0 && (
                    <div className="mt-4">
                      <p className="text-midnight-400 text-sm mb-2">Filter by tags:</p>
                      <div className="flex flex-wrap gap-2">
                        {uniqueTags.map((tag: any) => (
                          <button
                            key={tag}
                            onClick={() => {
                              setFilterTags((prev) =>
                                prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
                              );
                            }}
                            className={`px-3 py-1 rounded-full text-sm transition-all ${
                              filterTags.includes(tag)
                                ? 'bg-coral-500 text-white'
                                : 'bg-midnight-800/50 text-midnight-300 hover:bg-midnight-700 border border-midnight-700'
                            }`}
                          >
                            {tag}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Documents List */}
              {loadingDocuments ? (
                <TableSkeleton />
              ) : filteredDocuments.length === 0 ? (
                <EmptyState
                  icon={Database}
                  title={(searchTerm || filterAuthor || filterTags.length > 0) ? 'No documents found' : 'No documents yet'}
                  description={
                    (searchTerm || filterAuthor || filterTags.length > 0)
                      ? 'Try adjusting your search or filters'
                      : 'Upload your first document to start building your knowledge base'
                  }
                  action={
                    (searchTerm || filterAuthor || filterTags.length > 0)
                      ? { label: 'Clear Filters', onClick: () => { setSearchTerm(''); setFilterAuthor(''); setFilterTags([]); } }
                      : { label: 'Upload Document', onClick: () => setShowUploadDialog(true) }
                  }
                />
              ) : (
                <DocumentsTableView documents={filteredDocuments} onDelete={handleDeleteDocument} />
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Upload Dialog */}
      {showUploadDialog && (
        <DocumentUploadDialog
          onClose={() => setShowUploadDialog(false)}
          onSuccess={() => {
            mutate();
            setShowUploadDialog(false);
          }}
        />
      )}
    </div>
  );
}
