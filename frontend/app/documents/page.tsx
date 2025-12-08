'use client';

import { useState } from 'react';
import { useDocuments, useDocumentStats } from '../hooks/useDocuments';
import { FileText, Upload, Database, Search, Filter, X } from 'lucide-react';
import DocumentUploadDialog from '../components/DocumentUploadDialog';
import DocumentsTableView from '../components/DocumentsTableView';
import { EmptyState } from '@/components/ui/empty-state';
import { TableSkeleton } from '@/components/ui/loading-skeleton';
import { showToast } from '@/lib/toast';

export default function DocumentsPage() {
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterAuthor, setFilterAuthor] = useState('');
  const [filterTags, setFilterTags] = useState<string[]>([]);

  const { documents, isLoading, mutate } = useDocuments({
    author: filterAuthor || undefined,
    tags: filterTags.length > 0 ? filterTags : undefined,
  });

  const { stats, isLoading: statsLoading } = useDocumentStats();

  // Filter documents by search term (client-side)
  const filteredDocuments = documents.filter((doc: any) => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    return (
      doc.title?.toLowerCase().includes(search) ||
      doc.author?.toLowerCase().includes(search) ||
      doc.tags?.some((tag: string) => tag.toLowerCase().includes(search))
    );
  });

  // Get unique authors and tags for filters
  const uniqueAuthors = Array.from(new Set(documents.map((d: any) => d.author).filter(Boolean)));
  const uniqueTags = Array.from(new Set(documents.flatMap((d: any) => d.tags || [])));

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

  const clearFilters = () => {
    setSearchTerm('');
    setFilterAuthor('');
    setFilterTags([]);
  };

  const hasActiveFilters = searchTerm || filterAuthor || filterTags.length > 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-midnight-950 via-midnight-900 to-midnight-950 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-display font-bold text-white mb-2">
                Knowledge Base
              </h1>
              <p className="text-midnight-300">
                Manage your document library for RAG-enhanced content generation
              </p>
            </div>
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
          <div className="glass-card p-6 rounded-xl mb-6">
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
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
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
        {isLoading ? (
          <TableSkeleton />
        ) : filteredDocuments.length === 0 ? (
          <EmptyState
            icon={FileText}
            title={hasActiveFilters ? 'No documents found' : 'No documents yet'}
            description={
              hasActiveFilters
                ? 'Try adjusting your search or filters'
                : 'Upload your first document to start building your knowledge base'
            }
            action={
              hasActiveFilters
                ? { label: 'Clear Filters', onClick: clearFilters }
                : { label: 'Upload Document', onClick: () => setShowUploadDialog(true) }
            }
          />
        ) : (
          <DocumentsTableView documents={filteredDocuments} onDelete={handleDeleteDocument} />
        )}
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
