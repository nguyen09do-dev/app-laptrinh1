'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Idea {
  id: number;
  title: string;
  description: string;
  persona: string;
  industry: string;
  status: 'generated' | 'shortlisted' | 'approved' | 'archived';
  rationale: string | null;
  created_at: string;
  batch_id: string | null;
}

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  count?: number;
}

export default function DashboardPage() {
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchIdeas();
  }, []);

  const fetchIdeas = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:3001/api/ideas');
      const result: ApiResponse<Idea[]> = await response.json();
      if (result.success && result.data) {
        setIdeas(result.data);
      }
    } catch (err) {
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const stats = {
    total: ideas.length,
    generated: ideas.filter(i => i.status === 'generated').length,
    shortlisted: ideas.filter(i => i.status === 'shortlisted').length,
    approved: ideas.filter(i => i.status === 'approved').length,
    archived: ideas.filter(i => i.status === 'archived').length,
  };

  const recentIdeas = ideas.slice(0, 5);

  // Group by batch_id to count batches
  const batches = new Set(ideas.map(i => i.batch_id).filter(Boolean));
  const batchCount = batches.size;

  // Calculate approval rate
  const approvalRate = stats.total > 0
    ? Math.round((stats.approved / stats.total) * 100)
    : 0;

  return (
    <main className="min-h-screen p-6 md:p-10">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8">
          <h1 className="font-display text-3xl md:text-5xl font-bold mb-2">
            <span className="text-gradient">📊 Dashboard</span>
          </h1>
          <p className="text-midnight-300 text-lg">
            Tổng quan về ideas và hoạt động của bạn
          </p>
        </header>

        {loading ? (
          <div className="text-center py-16">
            <div className="spinner mx-auto mb-4" />
            <p className="text-midnight-400">Đang tải dữ liệu...</p>
          </div>
        ) : (
          <>
            {/* Main Stats */}
            <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="glass-card rounded-2xl p-6 border-l-4 border-blue-500">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-midnight-400 text-sm font-medium">Tổng Ideas</h3>
                  <span className="text-3xl">💡</span>
                </div>
                <div className="text-4xl font-bold text-midnight-100 mb-1">{stats.total}</div>
                <p className="text-xs text-midnight-500">Từ {batchCount} lần generate</p>
              </div>

              <div className="glass-card rounded-2xl p-6 border-l-4 border-yellow-500">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-midnight-400 text-sm font-medium">Đã Chọn</h3>
                  <span className="text-3xl">⭐</span>
                </div>
                <div className="text-4xl font-bold text-yellow-400 mb-1">{stats.shortlisted}</div>
                <p className="text-xs text-midnight-500">
                  {stats.total > 0 ? Math.round((stats.shortlisted / stats.total) * 100) : 0}% của tổng số
                </p>
              </div>

              <div className="glass-card rounded-2xl p-6 border-l-4 border-green-500">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-midnight-400 text-sm font-medium">Đã Duyệt</h3>
                  <span className="text-3xl">✅</span>
                </div>
                <div className="text-4xl font-bold text-green-400 mb-1">{stats.approved}</div>
                <p className="text-xs text-midnight-500">
                  Tỷ lệ duyệt: {approvalRate}%
                </p>
              </div>

              <div className="glass-card rounded-2xl p-6 border-l-4 border-gray-500">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-midnight-400 text-sm font-medium">Mới Tạo</h3>
                  <span className="text-3xl">🆕</span>
                </div>
                <div className="text-4xl font-bold text-blue-400 mb-1">{stats.generated}</div>
                <p className="text-xs text-midnight-500">Chờ xem xét</p>
              </div>
            </section>

            {/* Status Breakdown Chart */}
            <section className="grid md:grid-cols-2 gap-6 mb-8">
              {/* Status Table */}
              <div className="glass-card rounded-2xl p-6">
                <h2 className="text-xl font-semibold text-midnight-100 mb-4">📋 Trạng Thái Ideas</h2>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-midnight-900/30 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                      <span className="text-midnight-200">Mới tạo</span>
                    </div>
                    <span className="text-2xl font-bold text-blue-400">{stats.generated}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-midnight-900/30 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                      <span className="text-midnight-200">Đã chọn</span>
                    </div>
                    <span className="text-2xl font-bold text-yellow-400">{stats.shortlisted}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-midnight-900/30 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full bg-green-500"></div>
                      <span className="text-midnight-200">Đã duyệt</span>
                    </div>
                    <span className="text-2xl font-bold text-green-400">{stats.approved}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-midnight-900/30 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full bg-gray-500"></div>
                      <span className="text-midnight-200">Lưu trữ</span>
                    </div>
                    <span className="text-2xl font-bold text-gray-400">{stats.archived}</span>
                  </div>
                </div>
              </div>

              {/* Visual Progress Bars */}
              <div className="glass-card rounded-2xl p-6">
                <h2 className="text-xl font-semibold text-midnight-100 mb-4">📈 Tiến Độ</h2>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-midnight-300">Tỷ lệ duyệt</span>
                      <span className="text-green-400 font-semibold">{approvalRate}%</span>
                    </div>
                    <div className="w-full bg-midnight-900 rounded-full h-3">
                      <div
                        className="bg-gradient-to-r from-green-500 to-green-400 h-3 rounded-full transition-all duration-500"
                        style={{ width: `${approvalRate}%` }}
                      ></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-midnight-300">Đã chọn + Đã duyệt</span>
                      <span className="text-yellow-400 font-semibold">
                        {stats.total > 0 ? Math.round(((stats.shortlisted + stats.approved) / stats.total) * 100) : 0}%
                      </span>
                    </div>
                    <div className="w-full bg-midnight-900 rounded-full h-3">
                      <div
                        className="bg-gradient-to-r from-yellow-500 to-green-400 h-3 rounded-full transition-all duration-500"
                        style={{ width: `${stats.total > 0 ? ((stats.shortlisted + stats.approved) / stats.total) * 100 : 0}%` }}
                      ></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-midnight-300">Chưa xử lý</span>
                      <span className="text-blue-400 font-semibold">
                        {stats.total > 0 ? Math.round((stats.generated / stats.total) * 100) : 0}%
                      </span>
                    </div>
                    <div className="w-full bg-midnight-900 rounded-full h-3">
                      <div
                        className="bg-gradient-to-r from-blue-500 to-blue-400 h-3 rounded-full transition-all duration-500"
                        style={{ width: `${stats.total > 0 ? (stats.generated / stats.total) * 100 : 0}%` }}
                      ></div>
                    </div>
                  </div>
                </div>

                <div className="mt-6 p-4 bg-midnight-900/50 rounded-lg border border-midnight-700">
                  <p className="text-sm text-midnight-300 text-center">
                    <span className="font-semibold text-midnight-100">{stats.approved + stats.shortlisted}</span> ideas
                    {' '}đã được xem xét trong tổng số <span className="font-semibold text-midnight-100">{stats.total}</span> ideas
                  </p>
                </div>
              </div>
            </section>

            {/* Recent Ideas */}
            <section className="glass-card rounded-2xl p-6 mb-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-midnight-100">🕐 Ideas Gần Đây</h2>
                <Link
                  href="/ideas"
                  className="text-sm text-coral-400 hover:text-coral-300 transition-colors"
                >
                  Xem tất cả →
                </Link>
              </div>
              {recentIdeas.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-midnight-400">Chưa có ideas nào. Hãy tạo ideas mới!</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {recentIdeas.map((idea) => (
                    <Link
                      key={idea.id}
                      href="/ideas"
                      className="block p-4 bg-midnight-900/30 hover:bg-midnight-900/50 rounded-lg transition-all hover:scale-[1.01]"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold text-midnight-100 mb-1">{idea.title}</h3>
                          <p className="text-sm text-midnight-400 line-clamp-1 mb-2">{idea.description}</p>
                          <div className="flex gap-2 text-xs">
                            <span className="bg-midnight-800/50 px-2 py-1 rounded text-midnight-400">
                              👤 {idea.persona}
                            </span>
                            <span className="bg-midnight-800/50 px-2 py-1 rounded text-midnight-400">
                              🏢 {idea.industry}
                            </span>
                          </div>
                        </div>
                        <span className={`text-xs px-2 py-1 rounded-full border whitespace-nowrap ml-4 ${
                          idea.status === 'approved'
                            ? 'bg-green-500/20 text-green-300 border-green-400/30'
                            : idea.status === 'shortlisted'
                            ? 'bg-yellow-500/20 text-yellow-300 border-yellow-400/30'
                            : idea.status === 'archived'
                            ? 'bg-gray-500/20 text-gray-300 border-gray-400/30'
                            : 'bg-blue-500/20 text-blue-300 border-blue-400/30'
                        }`}>
                          {idea.status === 'approved' ? 'Đã duyệt'
                            : idea.status === 'shortlisted' ? 'Đã chọn'
                            : idea.status === 'archived' ? 'Lưu trữ'
                            : 'Mới tạo'}
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </section>

            {/* Quick Actions */}
            <section className="grid md:grid-cols-3 gap-6">
              <Link
                href="/ideas"
                className="glass-card rounded-2xl p-6 hover:border-coral-500 transition-all hover:scale-[1.02] group"
              >
                <div className="text-4xl mb-3">💡</div>
                <h3 className="text-xl font-semibold text-midnight-100 mb-2 group-hover:text-coral-400 transition-colors">
                  Quản lý Ideas
                </h3>
                <p className="text-sm text-midnight-400">
                  Tạo mới, duyệt, và quản lý tất cả ideas của bạn
                </p>
              </Link>

              <Link
                href="/briefs"
                className="glass-card rounded-2xl p-6 hover:border-coral-500 transition-all hover:scale-[1.02] group"
              >
                <div className="text-4xl mb-3">📝</div>
                <h3 className="text-xl font-semibold text-midnight-100 mb-2 group-hover:text-coral-400 transition-colors">
                  Briefs
                </h3>
                <p className="text-sm text-midnight-400">
                  Tạo brief chi tiết cho từng idea đã duyệt
                </p>
              </Link>

              <Link
                href="/content"
                className="glass-card rounded-2xl p-6 hover:border-coral-500 transition-all hover:scale-[1.02] group"
              >
                <div className="text-4xl mb-3">✍️</div>
                <h3 className="text-xl font-semibold text-midnight-100 mb-2 group-hover:text-coral-400 transition-colors">
                  Content
                </h3>
                <p className="text-sm text-midnight-400">
                  Tạo nội dung hoàn chỉnh từ brief
                </p>
              </Link>
            </section>
          </>
        )}
      </div>
    </main>
  );
}
