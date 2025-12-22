'use client';

import { useState, useEffect } from 'react';
import FlowmapVisual from '../components/FlowmapVisual';
import IdeasTableView from '../components/IdeasTableView';
import { EmptyState } from '@/components/ui/empty-state';
import { TableSkeleton } from '@/components/ui/loading-skeleton';
import { showToast } from '@/lib/toast';
import { bulkDeleteIdeas } from '@/lib/bulkDelete';
import { apiGet, apiPost, apiPatch, apiDelete, createAbortController } from '@/lib/apiClient';
import { Lightbulb, Search, Filter, LayoutGrid, Table2, Trash2 } from 'lucide-react';

interface Idea {
  id: number;
  title: string;
  description: string;
  persona: string;
  industry: string;
  status: 'generated' | 'shortlisted' | 'approved' | 'archived';
  rationale: string | null;
  created_at: string;
  brief?: string;
  flowmap?: any;
  approved_at?: string;
  implementation?: {
    steps: Array<{
      phase: string;
      tasks: string[];
      resources: string[];
      duration: string;
    }>;
    feasibility: {
      score: number;
      risks: string[];
      mitigations: string[];
    };
  };
}

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  count?: number;
  message?: string;
}

// Gợi ý từ khóa
const INDUSTRY_SUGGESTIONS = [
  'Technology', 'E-commerce', 'Education', 'Healthcare', 'Finance',
  'Real Estate', 'Food & Beverage', 'Fashion', 'Travel', 'Entertainment',
  'Fitness', 'Beauty', 'Gaming', 'Marketing', 'Consulting'
];

const PERSONA_SUGGESTIONS = [
  'Content Creator', 'Startup Founder', 'Marketing Manager', 'Student',
  'Small Business Owner', 'Freelancer', 'Entrepreneur', 'Developer',
  'Designer', 'Teacher', 'Coach', 'Consultant', 'Blogger', 'Influencer'
];

export default function IdeasPage() {
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedIdea, setSelectedIdea] = useState<Idea | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterIndustry, setFilterIndustry] = useState<string>('all');
  const [filterPersona, setFilterPersona] = useState<string>('all');
  const [generatingImplementation, setGeneratingImplementation] = useState(false);
  const [creatingBrief, setCreatingBrief] = useState<number | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  // Bulk delete state
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [bulkDeleting, setBulkDeleting] = useState(false);

  // Form state - QUANTITY STATE IS CRITICAL!
  const [persona, setPersona] = useState('');
  const [industry, setIndustry] = useState('');
  const [quantity, setQuantity] = useState<number>(5); // IMPORTANT: Default 5 ideas - v2025-12-05
  const [showIndustrySuggestions, setShowIndustrySuggestions] = useState(false);
  const [showPersonaSuggestions, setShowPersonaSuggestions] = useState(false);

  // VERIFY quantity is loaded - CRITICAL DEBUG v3
  console.log('');
  console.log('═════════════════════════════════════════════════');
  console.log('🚀 IDEAS PAGE LOADED - VERSION: 2025-12-05-v4-FINAL');
  console.log('═════════════════════════════════════════════════');
  console.log('🔧 Component loaded - quantity initial state:', quantity);
  console.log('🔧 TIMESTAMP:', new Date().toISOString());
  console.log('═════════════════════════════════════════════════');

  const fetchIdeas = async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await apiGet<Idea[]>('/ideas', { timeout: 15000 });
      setIdeas(data || []);
    } catch (err: any) {
      console.error('Fetch error:', err);
      const errorMsg = err.message || 'Không thể kết nối đến server';
      showToast.error(errorMsg);
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();

    console.log('🚨 DEBUG START 🚨');
    console.log('quantity state =', quantity);
    console.log('typeof quantity =', typeof quantity);
    console.log('Is quantity undefined?', quantity === undefined);
    console.log('Is quantity null?', quantity === null);

    if (!persona.trim() || !industry.trim()) {
      setError('Vui lòng nhập đầy đủ Persona và Industry');
      return;
    }

    setGenerating(true);
    setError(null);

    try {
      const requestBody = {
        persona: persona.trim(),
        industry: industry.trim(),
        count: quantity || 5 // Fallback to 5 if undefined
      };
      console.log('Request body BEFORE stringify =', requestBody);
      console.log('Request body AFTER stringify =', JSON.stringify(requestBody));
      console.log('🚨 DEBUG END 🚨');

      await apiPost<Idea[]>('/ideas/generate', requestBody, { timeout: 60000 });
      
      await fetchIdeas();
      setPersona('');
      setIndustry('');
      setError(null);
      showToast.success(`Đã tạo ${quantity} ideas mới thành công!`);
    } catch (err: any) {
      console.error('Generate error:', err);
      const errorMsg = err.message || 'Không thể kết nối đến server';
      showToast.error(errorMsg);
      setError(errorMsg);
    } finally {
      setGenerating(false);
    }
  };

  const handleApprove = async (id: number) => {
    try {
      const data = await apiPatch<Idea>(`/ideas/${id}/status`, { status: 'approved' });
      await fetchIdeas();
      if (selectedIdea?.id === id) {
        setSelectedIdea(data || null);
      }
      showToast.success('Đã duyệt idea thành công!');
    } catch (err: any) {
      console.error('Approve error:', err);
      const errorMsg = err.message || 'Không thể duyệt idea';
      showToast.error(errorMsg);
      setError(errorMsg);
    }
  };

  const handleShortlist = async (id: number) => {
    try {
      const data = await apiPatch<Idea>(`/ideas/${id}/status`, { status: 'shortlisted' });
      await fetchIdeas();
      if (selectedIdea?.id === id) {
        setSelectedIdea(data || null);
      }
    } catch (err: any) {
      console.error('Shortlist error:', err);
      setError(err.message || 'Không thể shortlist idea');
    }
  };

  const handleArchive = async (id: number) => {
    try {
      await apiPatch<Idea>(`/ideas/${id}/status`, { status: 'archived' });
      await fetchIdeas();
      if (selectedIdea?.id === id) {
        setSelectedIdea(null);
      }
    } catch (err: any) {
      console.error('Archive error:', err);
      setError(err.message || 'Không thể archive idea');
    }
  };

  const handleGenerateImplementation = async (id: number) => {
    setGeneratingImplementation(true);
    setError(null);

    try {
      const data = await apiPost<Idea>(`/ideas/${id}/implementation`, {}, { timeout: 60000 });
      // Update local state
      setIdeas((prev) => prev.map(idea => idea.id === id ? data : idea));
      setSelectedIdea(data);
    } catch (err: any) {
      console.error('Implementation error:', err);
      setError(err.message || 'Không thể tạo implementation plan');
    } finally {
      setGeneratingImplementation(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Bạn có chắc muốn xóa idea này?')) return;

    try {
      await apiDelete(`/ideas/${id}`);
      setIdeas((prev) => prev.filter((idea) => idea.id !== id));
      if (selectedIdea?.id === id) setSelectedIdea(null);
      showToast.success('Đã xóa idea thành công');
    } catch (err: any) {
      console.error('Delete error:', err);
      const errorMsg = err.message || 'Không thể xóa idea';
      setError(errorMsg);
      showToast.error(errorMsg);
    }
  };

  // Bulk delete handler
  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) {
      showToast.error('Vui lòng chọn ít nhất 1 idea để xóa');
      return;
    }

    if (!confirm(`Bạn có chắc muốn xóa ${selectedIds.length} idea(s)?`)) return;

    setBulkDeleting(true);
    try {
      const result = await bulkDeleteIdeas(selectedIds);

      if (result.success) {
        showToast.success(`Đã xóa ${result.deletedCount} idea(s) thành công`);
        setSelectedIds([]);
        await fetchIdeas();
        if (selectedIdea && selectedIds.includes(selectedIdea.id)) {
          setSelectedIdea(null);
        }
      } else {
        showToast.error(result.error || 'Không thể xóa ideas');
      }
    } catch (err) {
      console.error('Bulk delete error:', err);
      showToast.error('Không thể xóa ideas');
    } finally {
      setBulkDeleting(false);
    }
  };

  // Toggle select idea
  const handleToggleSelect = (id: number) => {
    setSelectedIds(prev =>
      prev.includes(id)
        ? prev.filter(i => i !== id)
        : [...prev, id]
    );
  };

  // Select all / deselect all
  const handleToggleSelectAll = () => {
    if (selectedIds.length === filteredIdeas.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredIdeas.map(idea => idea.id));
    }
  };

  const handleCreateBrief = async (ideaId: number) => {
    setCreatingBrief(ideaId);
    setError(null);

    try {
      await apiPost(`/briefs/from-idea/${ideaId}`, {}, { timeout: 30000 });
      showToast.success('Đã tạo brief thành công!');
      // Optionally close modal or refresh
      setSelectedIdea(null);
    } catch (err: any) {
      console.error('Error creating brief:', err);
      const errorMsg = err.message || 'Lỗi khi tạo brief';
      showToast.error(errorMsg);
      setError(errorMsg);
    } finally {
      setCreatingBrief(null);
    }
  };

  useEffect(() => {
    let mounted = true;
    const controller = createAbortController();

    const loadData = async () => {
      if (mounted) {
        await fetchIdeas();
      }
    };

    loadData();

    return () => {
      mounted = false;
      controller.abort();
    };
  }, []);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; color: string }> = {
      generated: { label: 'Mới tạo', color: 'bg-blue-500/20 text-blue-300 border-blue-400/30' },
      shortlisted: { label: 'Đã chọn', color: 'bg-yellow-500/20 text-yellow-300 border-yellow-400/30' },
      approved: { label: 'Đã duyệt', color: 'bg-green-500/20 text-green-300 border-green-400/30' },
      archived: { label: 'Lưu trữ', color: 'bg-gray-500/20 text-gray-300 border-gray-400/30' },
    };
    const s = statusMap[status] || statusMap.generated;
    return (
      <span className={`text-xs px-2 py-1 rounded-full border ${s.color}`}>
        {s.label}
      </span>
    );
  };

  // Lọc ideas theo nhiều tiêu chí
  const filteredIdeas = ideas.filter(idea => {
    const matchStatus = filterStatus === 'all' || idea.status === filterStatus;
    const matchIndustry = filterIndustry === 'all' || idea.industry === filterIndustry;
    const matchPersona = filterPersona === 'all' || idea.persona === filterPersona;
    return matchStatus && matchIndustry && matchPersona;
  });

  // Lấy danh sách unique industries và personas
  const uniqueIndustries = Array.from(new Set(ideas.map(i => i.industry))).sort();
  const uniquePersonas = Array.from(new Set(ideas.map(i => i.persona))).sort();

  const stats = {
    total: ideas.length,
    generated: ideas.filter(i => i.status === 'generated').length,
    shortlisted: ideas.filter(i => i.status === 'shortlisted').length,
    approved: ideas.filter(i => i.status === 'approved').length,
    archived: ideas.filter(i => i.status === 'archived').length,
  };

  return (
    <main className="min-h-screen p-6 md:p-10">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8">
          <h1 className="font-display text-3xl md:text-5xl font-bold mb-2">
            <span className="text-gradient">💡 Ideas</span>
          </h1>
          <p className="text-midnight-300 text-lg">
            Tạo và quản lý ý tưởng content với AI
          </p>
        </header>

        {/* Stats */}
        <section className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <div className="glass-card rounded-xl p-4">
            <div className="text-2xl font-bold text-midnight-100">{stats.total}</div>
            <div className="text-sm text-midnight-400">Tổng cộng</div>
          </div>
          <div className="glass-card rounded-xl p-4">
            <div className="text-2xl font-bold text-blue-400">{stats.generated}</div>
            <div className="text-sm text-midnight-400">Mới tạo</div>
          </div>
          <div className="glass-card rounded-xl p-4">
            <div className="text-2xl font-bold text-yellow-400">{stats.shortlisted}</div>
            <div className="text-sm text-midnight-400">Đã chọn</div>
          </div>
          <div className="glass-card rounded-xl p-4">
            <div className="text-2xl font-bold text-green-400">{stats.approved}</div>
            <div className="text-sm text-midnight-400">Đã duyệt</div>
          </div>
          <div className="glass-card rounded-xl p-4">
            <div className="text-2xl font-bold text-gray-400">{stats.archived}</div>
            <div className="text-sm text-midnight-400">Lưu trữ</div>
          </div>
        </section>

        {/* Form đơn giản - CHỈ 2 TRƯỜNG + QUANTITY */}
        <section className="mb-8">
          <form onSubmit={handleGenerate} className="glass-card rounded-2xl p-6 md:p-8">
            <h2 className="text-xl font-semibold mb-6 text-midnight-100">✨ Tạo Ideas Mới</h2>

            <div className="grid md:grid-cols-2 gap-4 mb-6">
              <div className="relative">
                <label htmlFor="persona" className="block text-sm font-medium text-midnight-300 mb-2">
                  Persona (Đối tượng) *
                </label>
                <input
                  type="text"
                  id="persona"
                  value={persona}
                  onChange={(e) => setPersona(e.target.value)}
                  onFocus={() => setShowPersonaSuggestions(true)}
                  onBlur={() => setTimeout(() => setShowPersonaSuggestions(false), 200)}
                  placeholder="VD: Content Creator, Startup, Student..."
                  className="w-full px-4 py-3 bg-midnight-950/50 border border-midnight-700 rounded-xl text-midnight-100 placeholder-midnight-500 focus:outline-none focus:ring-2 focus:ring-midnight-400 focus:border-transparent"
                  disabled={generating}
                  required
                />
                {showPersonaSuggestions && (
                  <div className="absolute z-10 w-full mt-1 bg-midnight-900 border border-midnight-700 rounded-xl shadow-lg max-h-60 overflow-y-auto">
                    {PERSONA_SUGGESTIONS.map((suggestion) => (
                      <button
                        key={suggestion}
                        type="button"
                        onClick={() => {
                          setPersona(suggestion);
                          setShowPersonaSuggestions(false);
                        }}
                        className="w-full px-4 py-2 text-left text-midnight-200 hover:bg-midnight-800 transition-colors text-sm"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <div className="relative">
                <label htmlFor="industry" className="block text-sm font-medium text-midnight-300 mb-2">
                  Industry (Ngành nghề) *
                </label>
                <input
                  type="text"
                  id="industry"
                  value={industry}
                  onChange={(e) => setIndustry(e.target.value)}
                  onFocus={() => setShowIndustrySuggestions(true)}
                  onBlur={() => setTimeout(() => setShowIndustrySuggestions(false), 200)}
                  placeholder="VD: Technology, Retail, Education..."
                  className="w-full px-4 py-3 bg-midnight-950/50 border border-midnight-700 rounded-xl text-midnight-100 placeholder-midnight-500 focus:outline-none focus:ring-2 focus:ring-midnight-400 focus:border-transparent"
                  disabled={generating}
                  required
                />
                {showIndustrySuggestions && (
                  <div className="absolute z-10 w-full mt-1 bg-midnight-900 border border-midnight-700 rounded-xl shadow-lg max-h-60 overflow-y-auto">
                    {INDUSTRY_SUGGESTIONS.map((suggestion) => (
                      <button
                        key={suggestion}
                        type="button"
                        onClick={() => {
                          setIndustry(suggestion);
                          setShowIndustrySuggestions(false);
                        }}
                        className="w-full px-4 py-2 text-left text-midnight-200 hover:bg-midnight-800 transition-colors text-sm"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Quantity Selector */}
            <div className="mb-6">
              <label htmlFor="quantity" className="block text-sm font-medium text-midnight-300 mb-3">
                Số lượng Ideas muốn tạo: <span className="text-coral-400 text-lg font-bold">{quantity}</span>
              </label>
              <div className="flex items-center gap-4">
                <input
                  type="range"
                  id="quantity"
                  min="1"
                  max="10"
                  value={quantity}
                  onChange={(e) => setQuantity(parseInt(e.target.value))}
                  className="flex-1 h-2 bg-midnight-800 rounded-lg appearance-none cursor-pointer accent-coral-500"
                  disabled={generating}
                />
                <div className="flex gap-2">
                  {[1, 3, 5, 7, 10].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setQuantity(num)}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                        quantity === num
                          ? 'bg-coral-500 text-white'
                          : 'bg-midnight-800 text-midnight-300 hover:bg-midnight-700'
                      }`}
                      disabled={generating}
                    >
                      {num}
                    </button>
                  ))}
                </div>
              </div>
              <p className="text-xs text-midnight-400 mt-2">
                💡 Tip: Tạo ít hơn sẽ nhanh hơn. Max 10 ideas mỗi lần.
              </p>
            </div>

            <button
              type="submit"
              disabled={generating || !persona.trim() || !industry.trim()}
              className="w-full py-4 px-6 bg-gradient-to-r from-midnight-500 to-coral-500 text-white font-semibold rounded-xl hover:from-midnight-400 hover:to-coral-400 focus:outline-none focus:ring-2 focus:ring-coral-400 focus:ring-offset-2 focus:ring-offset-midnight-950 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-[1.02] flex items-center justify-center gap-3"
            >
              {generating ? (
                <>
                  <div className="spinner w-5 h-5 border-2" />
                  <span>Đang tạo {quantity} ideas...</span>
                </>
              ) : (
                <>
                  <span className="text-xl">🚀</span>
                  <span>Generate {quantity} Ideas (Miễn phí với Gemini)</span>
                </>
              )}
            </button>
          </form>
        </section>

        {/* Error Message */}
        {error && (
          <div className="mb-8 p-4 bg-coral-500/10 border border-coral-500/30 rounded-xl text-coral-400 text-center">
            <span className="font-medium">⚠️ Lỗi: </span>
            {typeof error === 'string' ? error : String(error)}
          </div>
        )}

        {/* Bulk Actions Bar */}
        {selectedIds.length > 0 && (
          <div className="mb-4 p-4 bg-midnight-800/80 border border-midnight-600 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={selectedIds.length === filteredIdeas.length && filteredIdeas.length > 0}
                onChange={handleToggleSelectAll}
                className="w-5 h-5 rounded border-midnight-500 text-ocean-400 focus:ring-ocean-500"
              />
              <span className="text-midnight-200">
                Đã chọn <strong>{selectedIds.length}</strong> idea(s)
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setSelectedIds([])}
                className="px-4 py-2 text-midnight-400 hover:text-midnight-200 transition-colors"
              >
                Bỏ chọn
              </button>
              <button
                onClick={handleBulkDelete}
                disabled={bulkDeleting}
                className="px-4 py-2 bg-coral-500 hover:bg-coral-600 text-white rounded-lg font-medium transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                <Trash2 size={18} />
                {bulkDeleting ? 'Đang xóa...' : `Xóa ${selectedIds.length} item(s)`}
              </button>
            </div>
          </div>
        )}

        {/* Filter tabs */}
        <section className="mb-6 space-y-4">
          {/* Status filters */}
          <div>
            <h3 className="text-sm font-medium text-midnight-300 mb-2">📊 Lọc theo Trạng thái</h3>
            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={() => setFilterStatus('all')}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  filterStatus === 'all'
                    ? 'bg-midnight-600 text-white'
                    : 'bg-midnight-800/50 text-midnight-400 hover:bg-midnight-700/50'
                }`}
              >
                Tất cả ({stats.total})
              </button>
              <button
                onClick={() => setFilterStatus('generated')}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  filterStatus === 'generated'
                    ? 'bg-blue-600 text-white'
                    : 'bg-midnight-800/50 text-midnight-400 hover:bg-midnight-700/50'
                }`}
              >
                Mới tạo ({stats.generated})
              </button>
              <button
                onClick={() => setFilterStatus('shortlisted')}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  filterStatus === 'shortlisted'
                    ? 'bg-yellow-600 text-white'
                    : 'bg-midnight-800/50 text-midnight-400 hover:bg-midnight-700/50'
                }`}
              >
                Đã chọn ({stats.shortlisted})
              </button>
              <button
                onClick={() => setFilterStatus('approved')}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  filterStatus === 'approved'
                    ? 'bg-green-600 text-white'
                    : 'bg-midnight-800/50 text-midnight-400 hover:bg-midnight-700/50'
                }`}
              >
                Đã duyệt ({stats.approved})
              </button>
              <button
                onClick={() => setFilterStatus('archived')}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  filterStatus === 'archived'
                    ? 'bg-gray-600 text-white'
                    : 'bg-midnight-800/50 text-midnight-400 hover:bg-midnight-700/50'
                }`}
              >
                Lưu trữ ({stats.archived})
              </button>
            </div>
          </div>

          {/* Industry & Persona filters */}
          {uniqueIndustries.length > 0 && (
            <div className="grid md:grid-cols-2 gap-4">
              {/* Industry filter */}
              <div>
                <h3 className="text-sm font-medium text-midnight-300 mb-2">🏢 Lọc theo Ngành nghề</h3>
                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    onClick={() => setFilterIndustry('all')}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                      filterIndustry === 'all'
                        ? 'bg-purple-600 text-white'
                        : 'bg-midnight-800/50 text-midnight-400 hover:bg-midnight-700/50'
                    }`}
                  >
                    Tất cả ({ideas.length})
                  </button>
                  {uniqueIndustries.map((ind) => {
                    const count = ideas.filter(i => i.industry === ind).length;
                    return (
                      <button
                        key={ind}
                        onClick={() => setFilterIndustry(ind)}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                          filterIndustry === ind
                            ? 'bg-purple-600 text-white'
                            : 'bg-midnight-800/50 text-midnight-400 hover:bg-midnight-700/50'
                        }`}
                      >
                        {ind} ({count})
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Persona filter */}
              <div>
                <h3 className="text-sm font-medium text-midnight-300 mb-2">👤 Lọc theo Persona</h3>
                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    onClick={() => setFilterPersona('all')}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                      filterPersona === 'all'
                        ? 'bg-coral-600 text-white'
                        : 'bg-midnight-800/50 text-midnight-400 hover:bg-midnight-700/50'
                    }`}
                  >
                    Tất cả ({ideas.length})
                  </button>
                  {uniquePersonas.map((per) => {
                    const count = ideas.filter(i => i.persona === per).length;
                    return (
                      <button
                        key={per}
                        onClick={() => setFilterPersona(per)}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                          filterPersona === per
                            ? 'bg-coral-600 text-white'
                            : 'bg-midnight-800/50 text-midnight-400 hover:bg-midnight-700/50'
                        }`}
                      >
                        {per} ({count})
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Active filters summary */}
          {(filterStatus !== 'all' || filterIndustry !== 'all' || filterPersona !== 'all') && (
            <div className="flex items-center gap-2 flex-wrap p-3 bg-midnight-900/30 rounded-lg border border-midnight-700">
              <span className="text-sm text-midnight-300">Đang lọc:</span>
              {filterStatus !== 'all' && (
                <span className="px-2 py-1 bg-blue-500/20 text-blue-300 rounded text-xs">
                  Trạng thái: {filterStatus}
                </span>
              )}
              {filterIndustry !== 'all' && (
                <span className="px-2 py-1 bg-purple-500/20 text-purple-300 rounded text-xs">
                  Ngành: {filterIndustry}
                </span>
              )}
              {filterPersona !== 'all' && (
                <span className="px-2 py-1 bg-coral-500/20 text-coral-300 rounded text-xs">
                  Persona: {filterPersona}
                </span>
              )}
              <button
                onClick={() => {
                  setFilterStatus('all');
                  setFilterIndustry('all');
                  setFilterPersona('all');
                }}
                className="ml-auto px-3 py-1 bg-midnight-800 hover:bg-midnight-700 text-midnight-300 rounded text-xs transition-colors"
              >
                Xóa bộ lọc
              </button>
            </div>
          )}
        </section>

        {/* View Toggle & Ideas List */}
        <section>
          {/* View Toggle Buttons */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={selectedIds.length === filteredIdeas.length && filteredIdeas.length > 0}
                onChange={handleToggleSelectAll}
                className="w-5 h-5 rounded border-midnight-500 text-ocean-400 focus:ring-ocean-500"
                title="Select all"
              />
              <h2 className="text-xl font-semibold text-midnight-100">
                📋 Danh sách Ideas ({filteredIdeas.length})
              </h2>
            </div>
            <div className="flex items-center gap-2 glass-card rounded-lg p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`px-4 py-2 rounded-md font-medium transition-all flex items-center gap-2 ${
                  viewMode === 'grid'
                    ? 'bg-gradient-to-r from-midnight-500 to-coral-500 text-white shadow-lg'
                    : 'text-midnight-400 hover:text-midnight-200'
                }`}
              >
                <LayoutGrid className="w-4 h-4" />
                Grid
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`px-4 py-2 rounded-md font-medium transition-all flex items-center gap-2 ${
                  viewMode === 'table'
                    ? 'bg-gradient-to-r from-midnight-500 to-coral-500 text-white shadow-lg'
                    : 'text-midnight-400 hover:text-midnight-200'
                }`}
              >
                <Table2 className="w-4 h-4" />
                Table
              </button>
            </div>
          </div>

          {loading && ideas.length === 0 && (
            <TableSkeleton rows={5} />
          )}

          {!loading && filteredIdeas.length === 0 && ideas.length > 0 && (
            <EmptyState
              icon={Search}
              title="Không tìm thấy ideas phù hợp"
              description="Thử điều chỉnh bộ lọc của bạn"
              action={{
                label: 'Xóa tất cả bộ lọc',
                onClick: () => {
                  setFilterStatus('all');
                  setFilterIndustry('all');
                  setFilterPersona('all');
                },
              }}
            />
          )}

          {!loading && filteredIdeas.length === 0 && ideas.length === 0 && (
            <EmptyState
              icon={Lightbulb}
              title="Chưa có ideas nào"
              description="Nhập Persona và Industry, sau đó click Generate để tạo ideas mới!"
            />
          )}

          {filteredIdeas.length > 0 && (
            <>
              <div className="flex items-center justify-between mb-4">
                <p className="text-midnight-300 text-sm">
                  Hiển thị <span className="font-semibold text-midnight-100">{filteredIdeas.length}</span> trong tổng số <span className="font-semibold text-midnight-100">{ideas.length}</span> ideas
                </p>
              </div>

              {viewMode === 'grid' ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredIdeas.map((idea) => (
                  <article
                    key={idea.id}
                    onClick={() => setSelectedIdea(idea)}
                    className="glass-card rounded-xl p-5 cursor-pointer hover:border-midnight-500 transition-all duration-200 hover:scale-[1.02] relative"
                  >
                    {/* Checkbox - Top Left Corner */}
                    <div className="absolute top-3 left-3 z-10">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(idea.id)}
                        onChange={(e) => {
                          e.stopPropagation();
                          handleToggleSelect(idea.id);
                        }}
                        onClick={(e) => e.stopPropagation()}
                        className="w-5 h-5 rounded border-midnight-500 text-ocean-400 focus:ring-ocean-500 cursor-pointer"
                      />
                    </div>

                    <div className="flex items-start justify-between mb-3 ml-8">
                      {getStatusBadge(idea.status)}
                      <button
                        onClick={(e) => { e.stopPropagation(); handleDelete(idea.id); }}
                        className="text-midnight-500 hover:text-coral-400 transition-colors p-1"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                    <h3 className="font-semibold text-midnight-100 mb-2 line-clamp-2">{idea.title}</h3>
                    <p className="text-sm text-midnight-400 mb-3 line-clamp-3">{idea.description}</p>
                    <div className="text-xs text-mint-400/70 mb-2">👆 Click để xem chi tiết</div>
                    <div className="flex flex-wrap gap-2 text-xs text-midnight-500 pt-3 border-t border-midnight-800">
                      <span className="bg-midnight-800/50 px-2 py-1 rounded">👤 {idea.persona}</span>
                      <span className="bg-midnight-800/50 px-2 py-1 rounded">🏢 {idea.industry}</span>
                    </div>
                  </article>
                ))}
                </div>
              ) : (
                <IdeasTableView
                  ideas={filteredIdeas}
                  selectedIds={selectedIds}
                  onToggleSelect={handleToggleSelect}
                  onToggleSelectAll={handleToggleSelectAll}
                  onView={setSelectedIdea}
                  onDelete={handleDelete}
                  onCreateBrief={handleCreateBrief}
                  creatingBrief={creatingBrief}
                />
              )}
            </>
          )}
        </section>

        {/* Modal chi tiết */}
        {selectedIdea && (
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedIdea(null)}
          >
            <div
              className="glass-card rounded-2xl p-6 md:p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-start justify-between mb-6">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <h2 className="text-2xl font-bold text-midnight-100">{selectedIdea.title}</h2>
                    {getStatusBadge(selectedIdea.status)}
                  </div>
                  <div className="flex gap-2 text-sm mb-3">
                    <span className="bg-midnight-800/50 px-3 py-1 rounded-full">👤 {selectedIdea.persona}</span>
                    <span className="bg-midnight-800/50 px-3 py-1 rounded-full">🏢 {selectedIdea.industry}</span>
                  </div>
                  <p className="text-xs text-midnight-500">{formatDate(selectedIdea.created_at)}</p>
                </div>
                <button onClick={() => setSelectedIdea(null)} className="text-midnight-400 hover:text-midnight-100 p-2">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-semibold text-midnight-300 mb-2">📝 Mô tả</h3>
                  <p className="text-midnight-100 leading-relaxed">{selectedIdea.description}</p>
                </div>
                {selectedIdea.rationale && (
                  <div className="p-4 bg-midnight-900/30 rounded-xl">
                    <h3 className="text-sm font-semibold text-midnight-300 mb-2">💡 Lý do</h3>
                    <p className="text-midnight-200">{selectedIdea.rationale}</p>
                  </div>
                )}

                {/* Implementation Section */}
                <div className="p-4 bg-midnight-900/20 rounded-xl border border-midnight-700">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-midnight-100">📋 Chi Tiết Triển Khai</h3>
                    {!selectedIdea.implementation && (
                      <button
                        onClick={() => handleGenerateImplementation(selectedIdea.id)}
                        disabled={generatingImplementation}
                        className="px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 text-blue-400 font-semibold rounded-lg transition-all flex items-center gap-2 disabled:opacity-50"
                      >
                        {generatingImplementation ? (
                          <>
                            <div className="spinner w-4 h-4 border-2" />
                            <span className="text-sm">Đang tạo...</span>
                          </>
                        ) : (
                          <>
                            <span>✨</span>
                            <span className="text-sm">Tạo Implementation</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>

                  {selectedIdea.implementation && selectedIdea.implementation.feasibility && selectedIdea.implementation.steps ? (
                    <div className="space-y-6">
                      {/* Flowmap visualization */}
                      <div>
                        <h4 className="text-sm font-semibold text-midnight-300 mb-3">📊 Flowmap & Feasibility</h4>
                        <FlowmapVisual
                          feasibilityScore={selectedIdea.implementation.feasibility.score}
                          steps={selectedIdea.implementation.steps}
                        />
                      </div>

                      {/* Detailed steps */}
                      <div>
                        <h4 className="text-sm font-semibold text-midnight-300 mb-3">🎯 Các Bước Thực Hiện</h4>
                        <div className="space-y-4">
                          {selectedIdea.implementation.steps.map((step, idx) => (
                            <div key={idx} className="p-4 bg-midnight-900/40 rounded-lg">
                              <div className="flex items-center gap-2 mb-2">
                                <span className="text-xl font-bold text-midnight-400">#{idx + 1}</span>
                                <h5 className="font-semibold text-midnight-100">{step.phase}</h5>
                              </div>
                              <div className="space-y-2 text-sm">
                                <div>
                                  <span className="font-medium text-midnight-300">Nhiệm vụ:</span>
                                  <ul className="list-disc list-inside text-midnight-400 ml-2">
                                    {step.tasks.map((task, i) => (
                                      <li key={i}>{task}</li>
                                    ))}
                                  </ul>
                                </div>
                                <div>
                                  <span className="font-medium text-midnight-300">Tài nguyên:</span>
                                  <div className="flex flex-wrap gap-2 mt-1">
                                    {step.resources.map((resource, i) => (
                                      <span key={i} className="px-2 py-1 bg-midnight-800 rounded text-midnight-400">
                                        {resource}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                                <div>
                                  <span className="font-medium text-midnight-300">Thời gian: </span>
                                  <span className="text-midnight-400">{step.duration}</span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Risks & Mitigations */}
                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="p-4 bg-red-500/10 rounded-lg border border-red-500/30">
                          <h4 className="text-sm font-semibold text-red-400 mb-2">⚠️ Rủi ro</h4>
                          <ul className="list-disc list-inside text-sm text-midnight-300 space-y-1">
                            {selectedIdea.implementation.feasibility.risks.map((risk, i) => (
                              <li key={i}>{risk}</li>
                            ))}
                          </ul>
                        </div>
                        <div className="p-4 bg-green-500/10 rounded-lg border border-green-500/30">
                          <h4 className="text-sm font-semibold text-green-400 mb-2">✅ Giải pháp</h4>
                          <ul className="list-disc list-inside text-sm text-midnight-300 space-y-1">
                            {selectedIdea.implementation.feasibility.mitigations.map((mitigation, i) => (
                              <li key={i}>{mitigation}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-midnight-500">
                      <p className="mb-2">Chưa có implementation plan</p>
                      <p className="text-sm">Click nút &quot;Tạo Implementation&quot; để AI tạo kế hoạch triển khai chi tiết</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-3 pt-6 mt-6 border-t border-midnight-800">
                {selectedIdea.status === 'approved' && (
                  <button
                    onClick={() => handleCreateBrief(selectedIdea.id)}
                    disabled={creatingBrief === selectedIdea.id}
                    className="py-3 px-6 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 text-blue-400 font-semibold rounded-xl transition-all flex items-center gap-2 disabled:opacity-50"
                  >
                    {creatingBrief === selectedIdea.id ? (
                      <>
                        <div className="spinner w-4 h-4 border-2" />
                        <span>Đang tạo...</span>
                      </>
                    ) : (
                      <>
                        <span>📝</span>
                        <span>Tạo Brief</span>
                      </>
                    )}
                  </button>
                )}
                {selectedIdea.status !== 'approved' && (
                  <button
                    onClick={() => handleApprove(selectedIdea.id)}
                    className="py-3 px-6 bg-green-500/20 hover:bg-green-500/30 border border-green-500/30 text-green-400 font-semibold rounded-xl transition-all flex items-center gap-2"
                  >
                    <span>✅</span>
                    <span>Duyệt</span>
                  </button>
                )}
                {selectedIdea.status !== 'shortlisted' && selectedIdea.status !== 'approved' && (
                  <button
                    onClick={() => handleShortlist(selectedIdea.id)}
                    className="py-3 px-4 bg-yellow-500/20 hover:bg-yellow-500/30 border border-yellow-500/30 text-yellow-400 font-semibold rounded-xl transition-all flex items-center gap-2"
                  >
                    <span>⭐</span>
                    <span>Chọn</span>
                  </button>
                )}
                {selectedIdea.status !== 'archived' && (
                  <button
                    onClick={() => handleArchive(selectedIdea.id)}
                    className="py-3 px-4 bg-gray-500/20 hover:bg-gray-500/30 border border-gray-500/30 text-gray-400 font-semibold rounded-xl transition-all flex items-center gap-2"
                  >
                    <span>📦</span>
                    <span>Lưu trữ</span>
                  </button>
                )}
                <button
                  onClick={() => { handleDelete(selectedIdea.id); setSelectedIdea(null); }}
                  className="py-3 px-4 bg-coral-500/20 hover:bg-coral-500/30 border border-coral-500/30 text-coral-400 font-semibold rounded-xl transition-all flex items-center gap-2 ml-auto"
                >
                  <span>🗑️</span>
                  <span>Xóa</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
