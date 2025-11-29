'use client';

import { useState, useEffect } from 'react';

/**
 * Interface cho Idea từ API
 */
interface Idea {
  id: number;
  title: string;
  description: string;
  persona: string;
  industry: string;
  status: string;
  rationale: string | null;
  created_at: string;
  brief?: string;
  flowmap?: FlowmapData;
}

/**
 * Interface cho Flowmap
 */
interface FlowmapNode {
  id: string;
  label: string;
  type: 'start' | 'process' | 'decision' | 'end';
  description: string;
}

interface FlowmapEdge {
  from: string;
  to: string;
  label?: string;
}

interface FlowmapFeasibility {
  score: number;
  analysis: string;
  risks: string[];
  opportunities: string[];
}

interface FlowmapData {
  nodes: FlowmapNode[];
  edges: FlowmapEdge[];
  feasibility: FlowmapFeasibility;
}

/**
 * API Response interface
 */
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  count?: number;
  message?: string;
}

/**
 * Main Page Component - Daniel AI Idea Generator
 */
export default function Home() {
  // State management
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [approvedIdeas, setApprovedIdeas] = useState<Idea[]>([]);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedIdea, setSelectedIdea] = useState<Idea | null>(null);
  const [editingIdea, setEditingIdea] = useState<Idea | null>(null);
  const [generatingBrief, setGeneratingBrief] = useState(false);
  const [generatingFlowmap, setGeneratingFlowmap] = useState(false);
  const [activeTab, setActiveTab] = useState<'detail' | 'brief' | 'flowmap'>('detail');
  const [viewMode, setViewMode] = useState<'all' | 'approved'>('all');

  // Form state
  const [persona, setPersona] = useState('');
  const [industry, setIndustry] = useState('');
  const [provider, setProvider] = useState('gemini');
  const [model, setModel] = useState('gemini-2.5-flash');
  const [language, setLanguage] = useState('vi');

  // Language options
  const languages = [
    { value: 'vi', label: 'Tiếng Việt' },
    { value: 'en', label: 'English' },
    { value: 'ja', label: '日本語 (Japanese)' },
    { value: 'ko', label: '한국어 (Korean)' },
  ];

  // Model options based on provider
  const modelOptions = {
    openai: [
      { value: 'gpt-4', label: 'GPT-4', free: false },
      { value: 'gpt-4-turbo-preview', label: 'GPT-4 Turbo', free: false },
      { value: 'gpt-3.5-turbo', label: 'GPT-3.5 Turbo', free: false },
    ],
    gemini: [
      { value: 'gemini-pro-latest', label: 'Gemini Pro Latest', free: true },
      { value: 'gemini-flash-latest', label: 'Gemini Flash Latest', free: true },
      { value: 'gemini-2.5-pro', label: 'Gemini 2.5 Pro', free: true },
      { value: 'gemini-2.5-flash', label: 'Gemini 2.5 Flash ⭐', free: true },
      { value: 'gemini-2.0-flash', label: 'Gemini 2.0 Flash', free: true },
    ],
  };

  // Update model when provider changes
  useEffect(() => {
    if (provider === 'openai') {
      setModel('gpt-3.5-turbo');
    } else {
      setModel('gemini-2.5-flash');
    }
  }, [provider]);

  /**
   * Fetch tất cả ideas từ API
   */
  const fetchIdeas = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/ideas');
      const result: ApiResponse<Idea[]> = await response.json();

      if (result.success && result.data) {
        setIdeas(result.data);
      } else {
        setError(result.error || 'Failed to fetch ideas');
      }
    } catch (err) {
      console.error('Fetch error:', err);
      setError('Không thể kết nối đến server. Hãy đảm bảo backend đang chạy.');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Generate ideas mới bằng AI
   */
  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!persona.trim() || !industry.trim()) {
      setError('Vui lòng nhập đầy đủ Persona và Industry');
      return;
    }

    setGenerating(true);
    setError(null);

    try {
      const response = await fetch('/api/ideas/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ persona, industry, provider, model, language }),
      });

      const result: ApiResponse<Idea[]> = await response.json();

      if (result.success) {
        await fetchIdeas();
        setPersona('');
        setIndustry('');
      } else {
        setError(result.error || 'Failed to generate ideas');
      }
    } catch (err) {
      console.error('Generate error:', err);
      setError('Không thể kết nối đến server. Hãy kiểm tra backend và API key.');
    } finally {
      setGenerating(false);
    }
  };

  /**
   * Generate brief cho một idea
   */
  const handleGenerateBrief = async (idea: Idea) => {
    setGeneratingBrief(true);
    setError(null);

    try {
      const response = await fetch('/api/ideas/brief', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ideaId: idea.id,
          title: idea.title,
          description: idea.description,
          provider,
          model,
          language,
        }),
      });

      const result: ApiResponse<{ brief: string }> = await response.json();

      if (result.success && result.data) {
        const updatedIdea = { ...idea, brief: result.data.brief };
        setSelectedIdea(updatedIdea);
        setIdeas((prev) => prev.map((i) => (i.id === idea.id ? updatedIdea : i)));
        setActiveTab('brief');
      } else {
        setError(result.error || 'Failed to generate brief');
      }
    } catch (err) {
      console.error('Generate brief error:', err);
      setError('Không thể tạo brief. Vui lòng thử lại.');
    } finally {
      setGeneratingBrief(false);
    }
  };

  /**
   * Generate flowmap cho một idea
   */
  const handleGenerateFlowmap = async (idea: Idea) => {
    setGeneratingFlowmap(true);
    setError(null);

    try {
      const response = await fetch('/api/ideas/flowmap', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ideaId: idea.id,
          title: idea.title,
          description: idea.description,
          provider,
          model,
          language,
        }),
      });

      const result: ApiResponse<{ flowmap: FlowmapData }> = await response.json();

      if (result.success && result.data) {
        const updatedIdea = { ...idea, flowmap: result.data.flowmap };
        setSelectedIdea(updatedIdea);
        setIdeas((prev) => prev.map((i) => (i.id === idea.id ? updatedIdea : i)));
        setActiveTab('flowmap');
      } else {
        setError(result.error || 'Failed to generate flowmap');
      }
    } catch (err) {
      console.error('Generate flowmap error:', err);
      setError('Không thể tạo flowmap. Vui lòng thử lại.');
    } finally {
      setGeneratingFlowmap(false);
    }
  };

  /**
   * Xóa một idea
   */
  const handleDelete = async (id: number) => {
    if (!confirm('Bạn có chắc muốn xóa idea này?')) return;

    try {
      const response = await fetch(`/api/ideas/${id}`, { method: 'DELETE' });
      const result: ApiResponse<null> = await response.json();

      if (result.success) {
        setIdeas((prev) => prev.filter((idea) => idea.id !== id));
        if (selectedIdea?.id === id) setSelectedIdea(null);
      } else {
        setError(result.error || 'Failed to delete idea');
      }
    } catch (err) {
      console.error('Delete error:', err);
      setError('Không thể xóa idea');
    }
  };

  useEffect(() => {
    fetchIdeas();
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'selected':
        return 'bg-mint-500/20 text-mint-400 border-mint-500/30';
      case 'archived':
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
      default:
        return 'bg-midnight-400/20 text-midnight-300 border-midnight-400/30';
    }
  };

  const getNodeStyle = (type: string) => {
    switch (type) {
      case 'start':
        return 'bg-mint-500/20 border-mint-500 text-mint-400';
      case 'end':
        return 'bg-coral-500/20 border-coral-500 text-coral-400';
      case 'decision':
        return 'bg-amber-500/20 border-amber-500 text-amber-400';
      default:
        return 'bg-midnight-500/20 border-midnight-400 text-midnight-200';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-mint-400';
    if (score >= 60) return 'text-amber-400';
    return 'text-coral-400';
  };

  return (
    <main className="min-h-screen p-6 md:p-10">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <header className="text-center mb-12 animate-fade-in">
          <h1 className="font-display text-4xl md:text-6xl font-bold mb-4">
            <span className="text-gradient">Daniel AI Idea Generator</span>
          </h1>
          <p className="text-midnight-300 text-lg md:text-xl max-w-2xl mx-auto">
            Tạo ý tưởng content sáng tạo chỉ trong vài giây với sức mạnh của AI
          </p>
        </header>

        {/* Generate Form */}
        <section className="mb-12 animate-slide-up">
          <form onSubmit={handleGenerate} className="glass-card rounded-2xl p-6 md:p-8 max-w-2xl mx-auto">
            <h2 className="text-xl font-semibold mb-6 text-midnight-100">✨ Tạo Ideas Mới</h2>

            <div className="grid md:grid-cols-2 gap-4 mb-6">
              <div>
                <label htmlFor="persona" className="block text-sm font-medium text-midnight-300 mb-2">
                  Persona (Đối tượng)
                </label>
                <input
                  type="text"
                  id="persona"
                  value={persona}
                  onChange={(e) => setPersona(e.target.value)}
                  placeholder="VD: Content Creator, Startup Founder..."
                  className="w-full px-4 py-3 bg-midnight-950/50 border border-midnight-700 rounded-xl text-midnight-100 placeholder-midnight-500 focus:outline-none focus:ring-2 focus:ring-midnight-400 focus:border-transparent transition-all duration-200"
                  disabled={generating}
                />
              </div>
              <div>
                <label htmlFor="industry" className="block text-sm font-medium text-midnight-300 mb-2">
                  Industry (Ngành nghề)
                </label>
                <input
                  type="text"
                  id="industry"
                  value={industry}
                  onChange={(e) => setIndustry(e.target.value)}
                  placeholder="VD: Technology, Marketing, Education..."
                  className="w-full px-4 py-3 bg-midnight-950/50 border border-midnight-700 rounded-xl text-midnight-100 placeholder-midnight-500 focus:outline-none focus:ring-2 focus:ring-midnight-400 focus:border-transparent transition-all duration-200"
                  disabled={generating}
                />
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-4 mb-6">
              <div>
                <label htmlFor="provider" className="block text-sm font-medium text-midnight-300 mb-2">
                  AI Provider
                </label>
                <select
                  id="provider"
                  value={provider}
                  onChange={(e) => setProvider(e.target.value)}
                  className="w-full px-4 py-3 bg-midnight-950/50 border border-midnight-700 rounded-xl text-midnight-100 focus:outline-none focus:ring-2 focus:ring-midnight-400 focus:border-transparent transition-all duration-200"
                  disabled={generating}
                >
                  <option value="gemini">🆓 Google Gemini</option>
                  <option value="openai">💰 OpenAI</option>
                </select>
              </div>
              <div>
                <label htmlFor="model" className="block text-sm font-medium text-midnight-300 mb-2">
                  Model
                </label>
                <select
                  id="model"
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  className="w-full px-4 py-3 bg-midnight-950/50 border border-midnight-700 rounded-xl text-midnight-100 focus:outline-none focus:ring-2 focus:ring-midnight-400 focus:border-transparent transition-all duration-200"
                  disabled={generating}
                >
                  {modelOptions[provider as 'openai' | 'gemini'].map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.free ? '🆓 ' : '💰 '}{option.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="language" className="block text-sm font-medium text-midnight-300 mb-2">
                  Ngôn ngữ
                </label>
                <select
                  id="language"
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="w-full px-4 py-3 bg-midnight-950/50 border border-midnight-700 rounded-xl text-midnight-100 focus:outline-none focus:ring-2 focus:ring-midnight-400 focus:border-transparent transition-all duration-200"
                  disabled={generating}
                >
                  {languages.map((lang) => (
                    <option key={lang.value} value={lang.value}>{lang.label}</option>
                  ))}
                </select>
              </div>
            </div>

            {provider === 'openai' && (
              <div className="mb-4 p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg text-amber-400 text-sm">
                ⚠️ OpenAI yêu cầu credits. Gemini hoàn toàn miễn phí!
              </div>
            )}

            <button
              type="submit"
              disabled={generating || !persona.trim() || !industry.trim()}
              className="w-full py-4 px-6 bg-gradient-to-r from-midnight-500 to-coral-500 text-white font-semibold rounded-xl hover:from-midnight-400 hover:to-coral-400 focus:outline-none focus:ring-2 focus:ring-coral-400 focus:ring-offset-2 focus:ring-offset-midnight-950 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-[1.02] flex items-center justify-center gap-3"
            >
              {generating ? (
                <>
                  <div className="spinner w-5 h-5 border-2" />
                  <span>Đang tạo ideas...</span>
                </>
              ) : (
                <>
                  <span className="text-xl">🚀</span>
                  <span>Generate 10 Ideas</span>
                </>
              )}
            </button>
          </form>
        </section>

        {/* Error Message */}
        {error && (
          <div className="mb-8 p-4 bg-coral-500/10 border border-coral-500/30 rounded-xl text-coral-400 text-center animate-fade-in">
            <span className="font-medium">⚠️ Lỗi: </span>
            {error}
          </div>
        )}

        {/* Ideas List */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-display font-semibold text-midnight-100">
              📋 Danh sách Ideas ({ideas.length})
            </h2>
            <button
              onClick={fetchIdeas}
              disabled={loading}
              className="px-4 py-2 text-sm bg-midnight-800/50 hover:bg-midnight-700/50 border border-midnight-600 rounded-lg text-midnight-300 transition-colors duration-200 flex items-center gap-2"
            >
              {loading ? <div className="spinner w-4 h-4 border-2" /> : <span>🔄</span>}
              Refresh
            </button>
          </div>

          {loading && ideas.length === 0 && (
            <div className="text-center py-16">
              <div className="spinner mx-auto mb-4" />
              <p className="text-midnight-400">Đang tải dữ liệu...</p>
            </div>
          )}

          {!loading && ideas.length === 0 && (
            <div className="text-center py-16 glass-card rounded-2xl">
              <span className="text-6xl mb-4 block">💡</span>
              <h3 className="text-xl font-semibold text-midnight-200 mb-2">Chưa có ideas nào</h3>
              <p className="text-midnight-400">Nhập Persona và Industry, sau đó click Generate để tạo ideas mới!</p>
            </div>
          )}

          {ideas.length > 0 && (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {ideas.map((idea, index) => (
                <article
                  key={idea.id}
                  onClick={() => { setSelectedIdea(idea); setActiveTab('detail'); }}
                  className="idea-card glass-card rounded-xl p-5 animate-fade-in cursor-pointer hover:border-midnight-500 transition-all duration-200 hover:scale-[1.02]"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="flex items-start justify-between mb-3">
                    <span className={`text-xs px-2 py-1 rounded-full border ${getStatusColor(idea.status)}`}>
                      {idea.status}
                    </span>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleDelete(idea.id); }}
                      className="text-midnight-500 hover:text-coral-400 transition-colors p-1"
                      title="Xóa idea"
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
          )}
        </section>

        {/* Idea Detail Modal */}
        {selectedIdea && (
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in"
            onClick={() => setSelectedIdea(null)}
          >
            <div
              className="glass-card rounded-2xl p-6 md:p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto animate-slide-up"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-6">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <span className={`text-xs px-2 py-1 rounded-full border ${getStatusColor(selectedIdea.status)}`}>
                      {selectedIdea.status}
                    </span>
                    <span className="text-xs text-midnight-500">{formatDate(selectedIdea.created_at)}</span>
                  </div>
                  <h2 className="text-2xl font-bold text-midnight-100 mb-2">{selectedIdea.title}</h2>
                  <div className="flex flex-wrap gap-2 text-sm">
                    <span className="bg-midnight-800/50 px-3 py-1 rounded-full text-midnight-300">👤 {selectedIdea.persona}</span>
                    <span className="bg-midnight-800/50 px-3 py-1 rounded-full text-midnight-300">🏢 {selectedIdea.industry}</span>
                  </div>
                </div>
                <button onClick={() => setSelectedIdea(null)} className="text-midnight-400 hover:text-midnight-100 transition-colors p-2">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Tabs */}
              <div className="flex gap-2 mb-6 border-b border-midnight-800 pb-4">
                <button
                  onClick={() => setActiveTab('detail')}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${activeTab === 'detail' ? 'bg-midnight-600 text-white' : 'text-midnight-400 hover:text-midnight-200'}`}
                >
                  📝 Chi tiết
                </button>
                <button
                  onClick={() => setActiveTab('brief')}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${activeTab === 'brief' ? 'bg-mint-500/20 text-mint-400' : 'text-midnight-400 hover:text-midnight-200'}`}
                >
                  📄 Brief
                </button>
                <button
                  onClick={() => setActiveTab('flowmap')}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${activeTab === 'flowmap' ? 'bg-amber-500/20 text-amber-400' : 'text-midnight-400 hover:text-midnight-200'}`}
                >
                  🗺️ Flowmap
                </button>
              </div>

              {/* Tab Content */}
              {activeTab === 'detail' && (
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
                </div>
              )}

              {activeTab === 'brief' && (
                <div>
                  {selectedIdea.brief ? (
                    <div className="p-4 bg-mint-500/10 border border-mint-500/30 rounded-xl">
                      <h3 className="text-sm font-semibold text-mint-400 mb-3">📄 Content Brief</h3>
                      <div className="text-midnight-100 whitespace-pre-wrap leading-relaxed">{selectedIdea.brief}</div>
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <span className="text-5xl mb-4 block">📄</span>
                      <p className="text-midnight-400 mb-4">Chưa có brief. Tạo ngay?</p>
                      <button
                        onClick={() => handleGenerateBrief(selectedIdea)}
                        disabled={generatingBrief}
                        className="px-6 py-3 bg-gradient-to-r from-mint-500 to-midnight-500 text-white font-semibold rounded-xl hover:from-mint-400 hover:to-midnight-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2 mx-auto"
                      >
                        {generatingBrief ? (
                          <>
                            <div className="spinner w-4 h-4 border-2" />
                            <span>Đang tạo...</span>
                          </>
                        ) : (
                          <>
                            <span>✨</span>
                            <span>Generate Brief</span>
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'flowmap' && (
                <div>
                  {selectedIdea.flowmap ? (
                    <div className="space-y-6">
                      {/* Feasibility Score */}
                      <div className="flex items-center justify-between p-4 bg-midnight-900/30 rounded-xl">
                        <div>
                          <h3 className="text-sm font-semibold text-midnight-300 mb-1">📊 Điểm khả thi</h3>
                          <p className="text-midnight-400 text-sm">{selectedIdea.flowmap.feasibility.analysis}</p>
                        </div>
                        <div className={`text-4xl font-bold ${getScoreColor(selectedIdea.flowmap.feasibility.score)}`}>
                          {selectedIdea.flowmap.feasibility.score}%
                        </div>
                      </div>

                      {/* Flowmap Visual */}
                      <div className="p-4 bg-midnight-950/50 rounded-xl border border-midnight-800">
                        <h3 className="text-sm font-semibold text-midnight-300 mb-4">🗺️ Quy trình triển khai</h3>
                        <div className="flex flex-wrap gap-3 justify-center">
                          {selectedIdea.flowmap.nodes.map((node, idx) => (
                            <div key={node.id} className="flex items-center gap-2">
                              <div className={`p-3 rounded-lg border-2 ${getNodeStyle(node.type)} min-w-[120px] text-center`}>
                                <div className="font-medium text-sm">{node.label}</div>
                                <div className="text-xs opacity-70 mt-1">{node.description.slice(0, 30)}...</div>
                              </div>
                              {idx < selectedIdea.flowmap!.nodes.length - 1 && (
                                <div className="text-midnight-500 text-xl">→</div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Risks & Opportunities */}
                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="p-4 bg-coral-500/10 border border-coral-500/30 rounded-xl">
                          <h3 className="text-sm font-semibold text-coral-400 mb-3">⚠️ Rủi ro</h3>
                          <ul className="space-y-2">
                            {selectedIdea.flowmap.feasibility.risks.map((risk, idx) => (
                              <li key={idx} className="text-sm text-midnight-200 flex items-start gap-2">
                                <span className="text-coral-400">•</span>
                                {risk}
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div className="p-4 bg-mint-500/10 border border-mint-500/30 rounded-xl">
                          <h3 className="text-sm font-semibold text-mint-400 mb-3">🚀 Cơ hội</h3>
                          <ul className="space-y-2">
                            {selectedIdea.flowmap.feasibility.opportunities.map((opp, idx) => (
                              <li key={idx} className="text-sm text-midnight-200 flex items-start gap-2">
                                <span className="text-mint-400">•</span>
                                {opp}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <span className="text-5xl mb-4 block">🗺️</span>
                      <p className="text-midnight-400 mb-4">Chưa có flowmap. Tạo để xem tính khả thi?</p>
                      <button
                        onClick={() => handleGenerateFlowmap(selectedIdea)}
                        disabled={generatingFlowmap}
                        className="px-6 py-3 bg-gradient-to-r from-amber-500 to-midnight-500 text-white font-semibold rounded-xl hover:from-amber-400 hover:to-midnight-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2 mx-auto"
                      >
                        {generatingFlowmap ? (
                          <>
                            <div className="spinner w-4 h-4 border-2" />
                            <span>Đang tạo...</span>
                          </>
                        ) : (
                          <>
                            <span>🗺️</span>
                            <span>Generate Flowmap</span>
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3 pt-6 mt-6 border-t border-midnight-800">
                {!selectedIdea.brief && activeTab !== 'brief' && (
                  <button
                    onClick={() => handleGenerateBrief(selectedIdea)}
                    disabled={generatingBrief}
                    className="flex-1 py-3 px-4 bg-mint-500/20 hover:bg-mint-500/30 border border-mint-500/30 text-mint-400 font-semibold rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                  >
                    {generatingBrief ? <div className="spinner w-4 h-4 border-2" /> : <span>📄</span>}
                    <span>Brief</span>
                  </button>
                )}
                {!selectedIdea.flowmap && activeTab !== 'flowmap' && (
                  <button
                    onClick={() => handleGenerateFlowmap(selectedIdea)}
                    disabled={generatingFlowmap}
                    className="flex-1 py-3 px-4 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/30 text-amber-400 font-semibold rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                  >
                    {generatingFlowmap ? <div className="spinner w-4 h-4 border-2" /> : <span>🗺️</span>}
                    <span>Flowmap</span>
                  </button>
                )}
                <button
                  onClick={() => { handleDelete(selectedIdea.id); setSelectedIdea(null); }}
                  className="py-3 px-4 bg-coral-500/20 hover:bg-coral-500/30 border border-coral-500/30 text-coral-400 font-semibold rounded-xl transition-all flex items-center gap-2"
                >
                  <span>🗑️</span>
                  <span>Xóa</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <footer className="text-center mt-16 py-8 border-t border-midnight-800/50">
          <p className="text-midnight-500 text-sm">
            Built with 💜 by Daniel using Next.js, Fastify, OpenAI & Gemini
          </p>
        </footer>
      </div>
    </main>
  );
}
