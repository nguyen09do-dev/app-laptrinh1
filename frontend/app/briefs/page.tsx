'use client';

import { useState, useEffect, lazy, Suspense } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import useSWR from 'swr';
import { showToast } from '@/lib/toast';
import { TableSkeleton } from '@/components/ui/loading-skeleton';
import { FileText, LayoutGrid, Table2 } from 'lucide-react';

// Lazy load table view for better performance
const BriefsTableView = lazy(() => import('../components/BriefsTableView'));

interface Brief {
  id: number;
  idea_id: number;
  title: string;
  objective: string;
  target_audience: string;
  key_messages?: string[] | null;
  tone_style: string | null;
  content_structure?: {
    sections: Array<{
      name: string;
      wordCount: number;
      description: string;
    }>;
    totalWordCount: number;
  } | null;
  seo_keywords?: string[] | null;
  status: string;
  created_at: string;
  idea_title?: string;
  persona?: string;
  industry?: string;
}

interface Idea {
  id: number;
  title: string;
  description: string;
  persona: string;
  industry: string;
  status: string;
}

// SWR fetcher
const fetcher = (url: string) => fetch(url).then(res => res.json());

export default function BriefsPage() {
  const router = useRouter();
  const [creating, setCreating] = useState<number | null>(null);
  const [generatingContent, setGeneratingContent] = useState<number | null>(null);
  const [selectedBrief, setSelectedBrief] = useState<Brief | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [showContentOptions, setShowContentOptions] = useState<number | null>(null);
  const [contentOptions, setContentOptions] = useState({
    wordCount: 800,
    style: 'professional', // professional, casual, academic
    useRAG: true, // Enable RAG by default
  });
  const [filterIndustry, setFilterIndustry] = useState<string>('all');
  const [filterPersona, setFilterPersona] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  // Use SWR for data fetching with caching
  const { data: briefsData, error: briefsError, mutate: mutateBriefs } = useSWR(
    'http://localhost:3001/api/briefs',
    fetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 5000,
    }
  );

  const { data: ideasData, error: ideasError } = useSWR(
    'http://localhost:3001/api/ideas',
    fetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 5000,
    }
  );

  const briefs = briefsData?.data || [];
  const approvedIdeas = ideasData?.data?.filter((idea: Idea) => idea.status === 'approved') || [];
  const loading = (!briefsData && !briefsError) || (!ideasData && !ideasError);
  const error = briefsError || ideasError;

  const handleCreateBrief = async (ideaId: number) => {
    setCreating(ideaId);

    try {
      const res = await fetch(`http://localhost:3001/api/briefs/from-idea/${ideaId}`, {
        method: 'POST',
      });

      const data = await res.json();

      if (data.success) {
        await mutateBriefs(); // Refresh briefs data using SWR
        showToast.success('Đã tạo brief thành công!');
        setSuccessMessage(null);
      } else {
        showToast.error(data.error || 'Không thể tạo brief');
      }
    } catch (err) {
      console.error('Error creating brief:', err);
      showToast.error('Không thể tạo brief');
    } finally {
      setCreating(null);
    }
  };

  const handleGenerateDraft = async (briefId: number) => {
    try {
      setGeneratingContent(briefId);
      setShowContentOptions(null); // Close modal

      const response = await fetch(`http://localhost:3001/api/packs/from-brief/${briefId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          wordCount: contentOptions.wordCount,
          style: contentOptions.style,
          useRAG: contentOptions.useRAG,
        }),
      });

      const data = await response.json();

      if (data.success) {
        showToast.success('Đã tạo draft pack thành công!');
        // Navigate to packs page with pack ID to auto-open
        router.push(`/packs?openId=${data.data.pack_id}`);
      } else {
        showToast.error(data.error || 'Không thể tạo draft');
      }
    } catch (error) {
      console.error('Error generating draft:', error);
      showToast.error('Lỗi khi tạo draft');
    } finally {
      setGeneratingContent(null);
    }
  };

  const handleDeleteBrief = async (id: number) => {
    if (!confirm('Bạn có chắc muốn xóa brief này?')) return;

    try {
      const res = await fetch(`http://localhost:3001/api/briefs/${id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        await mutateBriefs(); // Refresh briefs data using SWR
        showToast.success('Đã xóa brief thành công!');
      }
    } catch (err) {
      console.error('Error deleting brief:', err);
      showToast.error('Không thể xóa brief');
    }
  };

  // Filter ideas that don't have briefs yet
  const ideasWithoutBriefs = approvedIdeas.filter(
    idea => !briefs.some(brief => brief.idea_id === idea.id)
  );

  // Get unique industries and personas from briefs
  const uniqueIndustries = Array.from(new Set(briefs.map(b => b.industry).filter(Boolean))).sort();
  const uniquePersonas = Array.from(new Set(briefs.map(b => b.persona).filter(Boolean))).sort();

  // Filter briefs
  const filteredBriefs = briefs.filter(brief => {
    const matchIndustry = filterIndustry === 'all' || brief.industry === filterIndustry;
    const matchPersona = filterPersona === 'all' || brief.persona === filterPersona;
    return matchIndustry && matchPersona;
  });

  if (loading) {
    return (
      <main className="min-h-screen p-6 md:p-10">
        <div className="max-w-7xl mx-auto">
          <h1 className="font-display text-3xl md:text-5xl font-bold mb-8">
            <span className="text-gradient">📝 Briefs</span>
          </h1>
          <TableSkeleton rows={5} />
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen p-6 md:p-10">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8">
          <h1 className="font-display text-3xl md:text-5xl font-bold mb-2">
            <span className="text-gradient">📝 Briefs</span>
          </h1>
          <p className="text-midnight-300 text-lg">
            Tạo brief chi tiết cho ideas đã duyệt
          </p>
        </header>

        {error && (
          <div className="mb-6 p-4 bg-red-500/20 border border-red-500/30 rounded-xl text-red-400">
            {error instanceof Error ? error.message : String(error)}
          </div>
        )}

        {successMessage && (
          <div className="mb-6 p-4 bg-green-500/20 border border-green-500/30 rounded-xl text-green-400 animate-pulse">
            {successMessage}
          </div>
        )}

        {/* Filters */}
        {(uniqueIndustries.length > 0 || uniquePersonas.length > 0) && (
          <section className="mb-8 glass-card rounded-2xl p-6">
            <h2 className="text-lg font-semibold text-midnight-100 mb-4">🔍 Bộ lọc</h2>
            <div className="grid md:grid-cols-2 gap-4">
              {/* Industry filter */}
              {uniqueIndustries.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-midnight-300 mb-2">🏢 Ngành nghề</h3>
                  <div className="flex items-center gap-2 flex-wrap">
                    <button
                      onClick={() => setFilterIndustry('all')}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                        filterIndustry === 'all'
                          ? 'bg-purple-600 text-white'
                          : 'bg-midnight-800/50 text-midnight-400 hover:bg-midnight-700/50'
                      }`}
                    >
                      Tất cả ({briefs.length})
                    </button>
                    {uniqueIndustries.map((ind) => {
                      const count = briefs.filter(b => b.industry === ind).length;
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
              )}

              {/* Persona filter */}
              {uniquePersonas.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-midnight-300 mb-2">👤 Persona</h3>
                  <div className="flex items-center gap-2 flex-wrap">
                    <button
                      onClick={() => setFilterPersona('all')}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                        filterPersona === 'all'
                          ? 'bg-coral-600 text-white'
                          : 'bg-midnight-800/50 text-midnight-400 hover:bg-midnight-700/50'
                      }`}
                    >
                      Tất cả ({briefs.length})
                    </button>
                    {uniquePersonas.map((per) => {
                      const count = briefs.filter(b => b.persona === per).length;
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
              )}
            </div>

            {/* Active filters summary */}
            {(filterIndustry !== 'all' || filterPersona !== 'all') && (
              <div className="flex items-center gap-2 flex-wrap p-3 bg-midnight-900/30 rounded-lg border border-midnight-700 mt-4">
                <span className="text-sm text-midnight-300">Đang lọc:</span>
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
        )}

        {/* Ideas without briefs - show buttons to create */}
        {ideasWithoutBriefs.length > 0 && (
          <section className="mb-8">
            <h2 className="text-xl font-semibold text-midnight-100 mb-4">
              📌 Ideas đã duyệt (chưa có brief)
            </h2>
            <div className="grid gap-4">
              {ideasWithoutBriefs.map(idea => (
                <div key={idea.id} className="glass-card p-4 rounded-xl flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-midnight-100">{idea.title}</h3>
                    <p className="text-sm text-midnight-400">
                      {idea.persona} • {idea.industry}
                    </p>
                  </div>
                  <button
                    onClick={() => handleCreateBrief(idea.id)}
                    disabled={creating === idea.id}
                    className="px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 text-blue-400 font-semibold rounded-lg transition-all disabled:opacity-50"
                  >
                    {creating === idea.id ? (
                      <span className="flex items-center gap-2">
                        <div className="spinner w-4 h-4 border-2" />
                        Đang tạo...
                      </span>
                    ) : (
                      '✨ Tạo Brief'
                    )}
                  </button>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Existing briefs */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-midnight-100">
              📋 Briefs đã tạo
            </h2>
            <div className="flex items-center gap-4">
              {/* View Mode Toggle */}
              <div className="flex items-center gap-2 bg-midnight-800/50 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                    viewMode === 'grid'
                      ? 'bg-purple-600 text-white'
                      : 'text-midnight-400 hover:text-midnight-200'
                  }`}
                >
                  <LayoutGrid className="w-4 h-4" />
                  Grid
                </button>
                <button
                  onClick={() => setViewMode('table')}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                    viewMode === 'table'
                      ? 'bg-purple-600 text-white'
                      : 'text-midnight-400 hover:text-midnight-200'
                  }`}
                >
                  <Table2 className="w-4 h-4" />
                  Table
                </button>
              </div>
              {briefs.length > 0 && (
                <p className="text-midnight-300 text-sm">
                  Hiển thị <span className="font-semibold text-midnight-100">{filteredBriefs.length}</span> trong tổng số <span className="font-semibold text-midnight-100">{briefs.length}</span> briefs
                </p>
              )}
            </div>
          </div>

          {filteredBriefs.length === 0 && briefs.length > 0 ? (
            <div className="glass-card rounded-2xl p-12 text-center">
              <div className="text-6xl mb-4">🔍</div>
              <p className="text-midnight-400 mb-4">
                Không tìm thấy briefs phù hợp với bộ lọc
              </p>
              <button
                onClick={() => {
                  setFilterIndustry('all');
                  setFilterPersona('all');
                }}
                className="px-6 py-3 bg-midnight-800 hover:bg-midnight-700 text-midnight-200 font-semibold rounded-xl transition-all"
              >
                Xóa bộ lọc
              </button>
            </div>
          ) : briefs.length === 0 ? (
            <div className="glass-card rounded-2xl p-12 text-center">
              <div className="text-6xl mb-4">📝</div>
              <p className="text-midnight-400 mb-4">
                Chưa có brief nào. Hãy approve ideas và tạo brief cho chúng!
              </p>
              <Link
                href="/ideas"
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-midnight-500 to-coral-500 text-white font-semibold rounded-xl hover:from-midnight-400 hover:to-coral-400 transition-all"
              >
                ← Quay lại Ideas
              </Link>
            </div>
          ) : viewMode === 'grid' ? (
            <div className="grid gap-4">
              {filteredBriefs.map(brief => (
                <div
                  key={brief.id}
                  className="glass-card p-6 rounded-xl hover:bg-midnight-900/40 transition-colors cursor-pointer"
                  onClick={() => setSelectedBrief(brief)}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-midnight-100 mb-1">
                        {brief.title}
                      </h3>
                      <p className="text-sm text-midnight-400">
                        {brief.target_audience}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowContentOptions(brief.id);
                        }}
                        disabled={generatingContent === brief.id}
                        className="px-4 py-2 bg-green-500/20 hover:bg-green-500/30 border border-green-500/30 text-green-400 font-semibold rounded-lg transition-all disabled:opacity-50 flex items-center gap-2"
                      >
                        {generatingContent === brief.id ? (
                          <>
                            <div className="spinner w-4 h-4 border-2" />
                            <span>Đang tạo...</span>
                          </>
                        ) : (
                          <>
                            <FileText className="w-4 h-4" />
                            <span>Tạo Draft</span>
                          </>
                        )}
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteBrief(brief.id);
                        }}
                        className="px-3 py-2 text-sm bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 text-red-400 rounded-lg transition-all"
                      >
                        Xóa
                      </button>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-midnight-500">Mục tiêu:</span>
                      <p className="text-midnight-200 line-clamp-2">{brief.objective}</p>
                    </div>
                    <div>
                      <span className="text-midnight-500">SEO Keywords:</span>
                      <p className="text-midnight-200">{brief.seo_keywords && brief.seo_keywords.length > 0 ? brief.seo_keywords.join(', ') : 'N/A'}</p>
                    </div>
                    <div>
                      <span className="text-midnight-500">Word Count:</span>
                      <p className="text-midnight-200">{brief.content_structure?.totalWordCount || 'N/A'} {brief.content_structure?.totalWordCount ? 'từ' : ''}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <Suspense fallback={<TableSkeleton />}>
              <BriefsTableView
                briefs={filteredBriefs}
                onView={setSelectedBrief}
                onDelete={handleDeleteBrief}
                onGenerateContent={(id) => setShowContentOptions(id)}
                generatingContent={generatingContent}
              />
            </Suspense>
          )}
        </section>

        {/* Brief Detail Modal */}
        {selectedBrief && (
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedBrief(null)}
          >
            <div
              className="glass-card max-w-4xl w-full max-h-[90vh] overflow-y-auto p-8 rounded-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setSelectedBrief(null)}
                className="float-right text-midnight-400 hover:text-midnight-200 text-2xl"
              >
                ×
              </button>

              <h2 className="text-2xl font-bold text-midnight-100 mb-6">
                {selectedBrief.title}
              </h2>

              <div className="space-y-6">
                <div>
                  <h3 className="font-semibold text-midnight-200 mb-2">🎯 Mục tiêu</h3>
                  <p className="text-midnight-300">{selectedBrief.objective}</p>
                </div>

                <div>
                  <h3 className="font-semibold text-midnight-200 mb-2">👥 Target Audience</h3>
                  <p className="text-midnight-300">{selectedBrief.target_audience}</p>
                </div>

                {selectedBrief.key_messages && selectedBrief.key_messages.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-midnight-200 mb-2">💬 Key Messages</h3>
                    <ul className="list-disc list-inside space-y-1 text-midnight-300">
                      {selectedBrief.key_messages.map((msg, idx) => (
                        <li key={idx}>{msg}</li>
                      ))}
                    </ul>
                  </div>
                )}

                <div>
                  <h3 className="font-semibold text-midnight-200 mb-2">🎨 Tone & Style</h3>
                  <p className="text-midnight-300">{selectedBrief.tone_style}</p>
                </div>

                {selectedBrief.content_structure && selectedBrief.content_structure.sections && selectedBrief.content_structure.sections.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-midnight-200 mb-2">📝 Content Structure</h3>
                    <div className="space-y-3">
                      {selectedBrief.content_structure.sections.map((section, idx) => (
                        <div key={idx} className="p-4 bg-midnight-900/30 rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-semibold text-midnight-100">{section.name}</h4>
                            <span className="text-sm text-midnight-400">{section.wordCount} từ</span>
                          </div>
                          <p className="text-sm text-midnight-400">{section.description}</p>
                        </div>
                      ))}
                    </div>
                    <p className="text-sm text-midnight-400 mt-3">
                      Tổng: {selectedBrief.content_structure.totalWordCount} từ
                    </p>
                  </div>
                )}

                {selectedBrief.seo_keywords && selectedBrief.seo_keywords.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-midnight-200 mb-2">🔍 SEO Keywords</h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedBrief.seo_keywords.map((keyword, idx) => (
                        <span
                          key={idx}
                          className="px-3 py-1 bg-blue-500/20 border border-blue-500/30 text-blue-400 rounded-full text-sm"
                        >
                          {keyword}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Content Options Modal */}
        {showContentOptions !== null && (
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowContentOptions(null)}
          >
            <div
              className="glass-card max-w-lg w-full p-8 rounded-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setShowContentOptions(null)}
                className="float-right text-midnight-400 hover:text-midnight-200 text-2xl"
              >
                ×
              </button>

              <h2 className="text-2xl font-bold text-midnight-100 mb-6">
                ⚙️ Tùy chỉnh Content
              </h2>

              <div className="space-y-6">
                {/* Word Count */}
                <div>
                  <label className="block text-midnight-200 font-semibold mb-3">
                    📊 Độ dài (số từ)
                  </label>
                  <input
                    type="range"
                    min="400"
                    max="2000"
                    step="100"
                    value={contentOptions.wordCount}
                    onChange={(e) => setContentOptions({ ...contentOptions, wordCount: parseInt(e.target.value) })}
                    className="w-full h-2 bg-midnight-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                  />
                  <div className="flex justify-between text-sm text-midnight-400 mt-2">
                    <span>400</span>
                    <span className="text-blue-400 font-semibold">{contentOptions.wordCount} từ</span>
                    <span>2000</span>
                  </div>
                </div>

                {/* Style */}
                <div>
                  <label className="block text-midnight-200 font-semibold mb-3">
                    🎨 Phong cách viết
                  </label>
                  <div className="space-y-3">
                    {/* Professional */}
                    <button
                      onClick={() => setContentOptions({ ...contentOptions, style: 'professional' })}
                      className={`w-full px-5 py-4 rounded-xl font-medium transition-all text-left ${
                        contentOptions.style === 'professional'
                          ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg shadow-blue-500/30 ring-2 ring-blue-400'
                          : 'glass-card text-midnight-200 hover:bg-midnight-800/80'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-bold text-lg mb-1">
                            💼 Professional (Chuyên nghiệp)
                          </div>
                          <div className={`text-sm ${contentOptions.style === 'professional' ? 'text-blue-100' : 'text-midnight-400'}`}>
                            Formal, khách quan, thuật ngữ chuyên ngành
                          </div>
                        </div>
                        {contentOptions.style === 'professional' && (
                          <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
                            <span className="text-sm">✓</span>
                          </div>
                        )}
                      </div>
                    </button>

                    {/* Casual */}
                    <button
                      onClick={() => setContentOptions({ ...contentOptions, style: 'casual' })}
                      className={`w-full px-5 py-4 rounded-xl font-medium transition-all text-left ${
                        contentOptions.style === 'casual'
                          ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg shadow-green-500/30 ring-2 ring-green-400'
                          : 'glass-card text-midnight-200 hover:bg-midnight-800/80'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-bold text-lg mb-1">
                            😊 Casual (Thân mật)
                          </div>
                          <div className={`text-sm ${contentOptions.style === 'casual' ? 'text-green-100' : 'text-midnight-400'}`}>
                            Gần gũi, dễ hiểu, ngôn ngữ hàng ngày
                          </div>
                        </div>
                        {contentOptions.style === 'casual' && (
                          <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
                            <span className="text-sm">✓</span>
                          </div>
                        )}
                      </div>
                    </button>

                    {/* Academic */}
                    <button
                      onClick={() => setContentOptions({ ...contentOptions, style: 'academic' })}
                      className={`w-full px-5 py-4 rounded-xl font-medium transition-all text-left ${
                        contentOptions.style === 'academic'
                          ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg shadow-purple-500/30 ring-2 ring-purple-400'
                          : 'glass-card text-midnight-200 hover:bg-midnight-800/80'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-bold text-lg mb-1">
                            🎓 Academic (Học thuật)
                          </div>
                          <div className={`text-sm ${contentOptions.style === 'academic' ? 'text-purple-100' : 'text-midnight-400'}`}>
                            Chính xác, có trích dẫn, cấu trúc logic
                          </div>
                        </div>
                        {contentOptions.style === 'academic' && (
                          <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
                            <span className="text-sm">✓</span>
                          </div>
                        )}
                      </div>
                    </button>
                  </div>
                </div>

                {/* RAG Option */}
                <div className="mt-6 pt-6 border-t border-midnight-700">
                  <div className="flex items-start gap-4">
                    <div className="flex-1">
                      <label className="flex items-center gap-3 cursor-pointer group">
                        <div className="relative">
                          <input
                            type="checkbox"
                            checked={contentOptions.useRAG}
                            onChange={(e) => setContentOptions({ ...contentOptions, useRAG: e.target.checked })}
                            className="sr-only peer"
                          />
                          <div className="w-14 h-8 bg-midnight-700 rounded-full peer-checked:bg-gradient-to-r peer-checked:from-blue-500 peer-checked:to-indigo-500 transition-all duration-300 shadow-inner"></div>
                          <div className="absolute left-1 top-1 w-6 h-6 bg-white rounded-full transition-all duration-300 peer-checked:translate-x-6 shadow-lg"></div>
                        </div>
                        <div className="flex-1">
                          <div className="font-bold text-lg text-midnight-100 flex items-center gap-2">
                            📚 Sử dụng RAG
                            <span className={`text-xs px-2 py-1 rounded-full ${contentOptions.useRAG ? 'bg-blue-500/20 text-blue-300' : 'bg-midnight-700 text-midnight-400'}`}>
                              {contentOptions.useRAG ? 'BẬT' : 'TẮT'}
                            </span>
                          </div>
                          <div className="text-sm text-midnight-400 mt-1">
                            {contentOptions.useRAG ? (
                              <span className="text-blue-300">
                                ✓ Tìm kiếm thông tin từ Knowledge Base để tạo nội dung chính xác hơn
                              </span>
                            ) : (
                              <span>
                                Tạo nội dung từ kiến thức tổng quát của AI
                              </span>
                            )}
                          </div>
                        </div>
                      </label>
                    </div>
                  </div>

                  {/* RAG Details when enabled */}
                  {contentOptions.useRAG && (
                    <div className="mt-4 p-4 bg-blue-500/10 border border-blue-500/30 rounded-xl">
                      <div className="text-sm space-y-2">
                        <div className="font-semibold text-blue-200 flex items-center gap-2">
                          <span>💡</span>
                          <span>Lợi ích của RAG:</span>
                        </div>
                        <ul className="space-y-1 text-blue-300/80 ml-6">
                          <li className="flex items-start gap-2">
                            <span className="text-green-400 mt-0.5">✓</span>
                            <span>Nội dung dựa trên tài liệu thực của công ty</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-green-400 mt-0.5">✓</span>
                            <span>Có trích dẫn nguồn [1][2][3] để kiểm chứng</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-green-400 mt-0.5">✓</span>
                            <span>Số liệu cụ thể và đáng tin cậy</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-green-400 mt-0.5">✓</span>
                            <span>Giảm thiểu "hallucination" (AI bịa đặt)</span>
                          </li>
                        </ul>
                      </div>
                    </div>
                  )}
                </div>

                {/* Submit Button */}
                <button
                  onClick={() => handleGenerateDraft(showContentOptions)}
                  disabled={generatingContent !== null}
                  className="w-full px-6 py-4 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {generatingContent !== null ? (
                    <>
                      <div className="spinner w-5 h-5 border-2" />
                      <span>Đang tạo draft...</span>
                    </>
                  ) : (
                    <>
                      <FileText className="w-5 h-5" />
                      <span>Tạo Draft Pack</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
