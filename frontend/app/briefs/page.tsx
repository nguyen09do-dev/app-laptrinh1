'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Brief {
  id: number;
  idea_id: number;
  title: string;
  objective: string;
  target_audience: string;
  key_messages: string[];
  tone_style: string | null;
  content_structure: {
    sections: Array<{
      name: string;
      wordCount: number;
      description: string;
    }>;
    totalWordCount: number;
  };
  seo_keywords: string[];
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

export default function BriefsPage() {
  const [briefs, setBriefs] = useState<Brief[]>([]);
  const [approvedIdeas, setApprovedIdeas] = useState<Idea[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedBrief, setSelectedBrief] = useState<Brief | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch briefs
      const briefsRes = await fetch('http://localhost:3001/api/briefs');
      const briefsData = await briefsRes.json();

      // Fetch approved ideas (để show nút "Tạo Brief")
      const ideasRes = await fetch('http://localhost:3001/api/ideas');
      const ideasData = await ideasRes.json();
      const approved = ideasData.data.filter((idea: Idea) => idea.status === 'approved');

      setBriefs(briefsData.data || []);
      setApprovedIdeas(approved || []);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Không thể tải dữ liệu');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateBrief = async (ideaId: number) => {
    setCreating(ideaId);
    setError(null);

    try {
      const res = await fetch(`http://localhost:3001/api/briefs/from-idea/${ideaId}`, {
        method: 'POST',
      });

      const data = await res.json();

      if (data.success) {
        await fetchData(); // Refresh data
        setSuccessMessage('✅ Đã tạo brief thành công!');
        setTimeout(() => setSuccessMessage(null), 3000); // Auto hide after 3s
      } else {
        setError(data.error || 'Không thể tạo brief');
      }
    } catch (err) {
      console.error('Error creating brief:', err);
      setError('Không thể tạo brief');
    } finally {
      setCreating(null);
    }
  };

  const handleDeleteBrief = async (id: number) => {
    if (!confirm('Bạn có chắc muốn xóa brief này?')) return;

    try {
      const res = await fetch(`http://localhost:3001/api/briefs/${id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        await fetchData();
      }
    } catch (err) {
      console.error('Error deleting brief:', err);
    }
  };

  // Filter ideas that don't have briefs yet
  const ideasWithoutBriefs = approvedIdeas.filter(
    idea => !briefs.some(brief => brief.idea_id === idea.id)
  );

  if (loading) {
    return (
      <main className="min-h-screen p-6 md:p-10">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-20">
            <div className="spinner w-12 h-12 border-4 mx-auto mb-4" />
            <p className="text-midnight-400">Đang tải...</p>
          </div>
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
            {error}
          </div>
        )}

        {successMessage && (
          <div className="mb-6 p-4 bg-green-500/20 border border-green-500/30 rounded-xl text-green-400 animate-pulse">
            {successMessage}
          </div>
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
          <h2 className="text-xl font-semibold text-midnight-100 mb-4">
            📋 Briefs đã tạo ({briefs.length})
          </h2>

          {briefs.length === 0 ? (
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
          ) : (
            <div className="grid gap-4">
              {briefs.map(brief => (
                <div
                  key={brief.id}
                  className="glass-card p-6 rounded-xl hover:bg-midnight-900/40 transition-colors cursor-pointer"
                  onClick={() => setSelectedBrief(brief)}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-lg font-semibold text-midnight-100 mb-1">
                        {brief.title}
                      </h3>
                      <p className="text-sm text-midnight-400">
                        {brief.target_audience}
                      </p>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteBrief(brief.id);
                      }}
                      className="px-3 py-1 text-sm bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 text-red-400 rounded-lg transition-all"
                    >
                      Xóa
                    </button>
                  </div>

                  <div className="grid md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-midnight-500">Mục tiêu:</span>
                      <p className="text-midnight-200 line-clamp-2">{brief.objective}</p>
                    </div>
                    <div>
                      <span className="text-midnight-500">SEO Keywords:</span>
                      <p className="text-midnight-200">{brief.seo_keywords.join(', ')}</p>
                    </div>
                    <div>
                      <span className="text-midnight-500">Word Count:</span>
                      <p className="text-midnight-200">{brief.content_structure.totalWordCount} từ</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
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

                <div>
                  <h3 className="font-semibold text-midnight-200 mb-2">💬 Key Messages</h3>
                  <ul className="list-disc list-inside space-y-1 text-midnight-300">
                    {selectedBrief.key_messages.map((msg, idx) => (
                      <li key={idx}>{msg}</li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold text-midnight-200 mb-2">🎨 Tone & Style</h3>
                  <p className="text-midnight-300">{selectedBrief.tone_style}</p>
                </div>

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
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
