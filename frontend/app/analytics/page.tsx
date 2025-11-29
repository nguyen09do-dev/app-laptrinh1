'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

interface OverviewData {
  ideas: {
    total: number;
    generated: number;
    shortlisted: number;
    approved: number;
    archived: number;
    batches: number;
  };
  briefs: {
    total: number;
    draft: number;
    approved: number;
  };
  contents: {
    total: number;
    draft: number;
    review: number;
    published: number;
    totalWords: number;
    avgWords: number;
  };
  conversion: {
    ideaToBrief: number;
    briefToContent: number;
    overall: number;
  };
}

interface TimelineData {
  ideas: Array<{ date: string; count: string; approved: string }>;
  briefs: Array<{ date: string; count: string }>;
  contents: Array<{ date: string; count: string; words: string }>;
}

interface PersonaIndustryData {
  personas: Array<{ persona: string; count: string; approved: string }>;
  industries: Array<{ industry: string; count: string; approved: string }>;
}

interface ProductivityData {
  ideasPerDay: number;
  briefsPerDay: number;
  contentsPerDay: number;
  avgTimeToBrief: number;
  avgTimeToContent: number;
}

export default function AnalyticsPage() {
  const [overview, setOverview] = useState<OverviewData | null>(null);
  const [timeline, setTimeline] = useState<TimelineData | null>(null);
  const [personaIndustry, setPersonaIndustry] = useState<PersonaIndustryData | null>(null);
  const [productivity, setProductivity] = useState<ProductivityData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'timeline' | 'insights' | 'productivity'>('overview');

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const [overviewRes, timelineRes, personaRes, productivityRes] = await Promise.all([
        fetch('http://localhost:3001/api/analytics/overview'),
        fetch('http://localhost:3001/api/analytics/timeline?days=30'),
        fetch('http://localhost:3001/api/analytics/persona-industry'),
        fetch('http://localhost:3001/api/analytics/productivity'),
      ]);

      const overviewData: ApiResponse<OverviewData> = await overviewRes.json();
      const timelineData: ApiResponse<TimelineData> = await timelineRes.json();
      const personaData: ApiResponse<PersonaIndustryData> = await personaRes.json();
      const productivityData: ApiResponse<ProductivityData> = await productivityRes.json();

      if (overviewData.success) setOverview(overviewData.data || null);
      if (timelineData.success) setTimeline(timelineData.data || null);
      if (personaData.success) setPersonaIndustry(personaData.data || null);
      if (productivityData.success) setProductivity(productivityData.data || null);
    } catch (err) {
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatNumber = (num: number) => {
    if (num >= 1000) return `${(num / 1000).toFixed(1)}k`;
    return num.toString();
  };

  return (
    <main className="min-h-screen p-6 md:p-10">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8">
          <h1 className="font-display text-3xl md:text-5xl font-bold mb-2">
            <span className="text-gradient">📈 Analytics</span>
          </h1>
          <p className="text-midnight-300 text-lg">
            Phân tích hiệu quả content và insights chi tiết
          </p>
        </header>

        {loading ? (
          <div className="text-center py-16">
            <div className="spinner mx-auto mb-4" />
            <p className="text-midnight-400">Đang tải dữ liệu analytics...</p>
          </div>
        ) : (
          <>
            {/* Tabs */}
            <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
              {(['overview', 'timeline', 'insights', 'productivity'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-6 py-2 rounded-lg font-medium transition-all whitespace-nowrap ${
                    activeTab === tab
                      ? 'bg-gradient-to-r from-midnight-500 to-coral-500 text-white'
                      : 'glass-card text-midnight-300 hover:text-midnight-100'
                  }`}
                >
                  {tab === 'overview' && '📊 Tổng quan'}
                  {tab === 'timeline' && '📅 Timeline'}
                  {tab === 'insights' && '💡 Insights'}
                  {tab === 'productivity' && '⚡ Productivity'}
                </button>
              ))}
            </div>

            {/* Overview Tab */}
            {activeTab === 'overview' && overview?.ideas && (
              <div className="space-y-6">
                {/* Main Stats */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="glass-card rounded-2xl p-6 border-l-4 border-blue-500">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-midnight-400 text-sm font-medium">Tổng Ideas</h3>
                      <span className="text-3xl">💡</span>
                    </div>
                    <div className="text-4xl font-bold text-midnight-100 mb-1">{overview.ideas.total}</div>
                    <p className="text-xs text-midnight-500">{overview.ideas.batches} batches</p>
                  </div>

                  <div className="glass-card rounded-2xl p-6 border-l-4 border-yellow-500">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-midnight-400 text-sm font-medium">Briefs</h3>
                      <span className="text-3xl">📝</span>
                    </div>
                    <div className="text-4xl font-bold text-yellow-400 mb-1">{overview.briefs.total}</div>
                    <p className="text-xs text-midnight-500">{overview.briefs.approved} đã duyệt</p>
                  </div>

                  <div className="glass-card rounded-2xl p-6 border-l-4 border-green-500">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-midnight-400 text-sm font-medium">Contents</h3>
                      <span className="text-3xl">✍️</span>
                    </div>
                    <div className="text-4xl font-bold text-green-400 mb-1">{overview.contents.total}</div>
                    <p className="text-xs text-midnight-500">{overview.contents.published} đã publish</p>
                  </div>

                  <div className="glass-card rounded-2xl p-6 border-l-4 border-purple-500">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-midnight-400 text-sm font-medium">Tổng từ</h3>
                      <span className="text-3xl">📚</span>
                    </div>
                    <div className="text-4xl font-bold text-purple-400 mb-1">
                      {formatNumber(overview.contents.totalWords)}
                    </div>
                    <p className="text-xs text-midnight-500">Avg: {overview.contents.avgWords} từ</p>
                  </div>
                </div>

                {/* Conversion Rates */}
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="glass-card rounded-2xl p-6">
                    <h3 className="text-lg font-semibold text-midnight-100 mb-4">🔄 Conversion Rates</h3>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between text-sm mb-2">
                          <span className="text-midnight-300">Idea → Brief</span>
                          <span className="text-blue-400 font-semibold">{overview.conversion.ideaToBrief}%</span>
                        </div>
                        <div className="w-full bg-midnight-900 rounded-full h-2">
                          <div
                            className="bg-blue-500 h-2 rounded-full transition-all"
                            style={{ width: `${overview.conversion.ideaToBrief}%` }}
                          />
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-2">
                          <span className="text-midnight-300">Brief → Content</span>
                          <span className="text-yellow-400 font-semibold">{overview.conversion.briefToContent}%</span>
                        </div>
                        <div className="w-full bg-midnight-900 rounded-full h-2">
                          <div
                            className="bg-yellow-500 h-2 rounded-full transition-all"
                            style={{ width: `${overview.conversion.briefToContent}%` }}
                          />
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-2">
                          <span className="text-midnight-300">Overall</span>
                          <span className="text-green-400 font-semibold">{overview.conversion.overall}%</span>
                        </div>
                        <div className="w-full bg-midnight-900 rounded-full h-2">
                          <div
                            className="bg-green-500 h-2 rounded-full transition-all"
                            style={{ width: `${overview.conversion.overall}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Status Breakdown */}
                  <div className="glass-card rounded-2xl p-6">
                    <h3 className="text-lg font-semibold text-midnight-100 mb-4">📋 Ideas Status</h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-2 bg-midnight-900/30 rounded">
                        <span className="text-midnight-300 text-sm">Mới tạo</span>
                        <span className="text-blue-400 font-semibold">{overview.ideas.generated}</span>
                      </div>
                      <div className="flex items-center justify-between p-2 bg-midnight-900/30 rounded">
                        <span className="text-midnight-300 text-sm">Đã chọn</span>
                        <span className="text-yellow-400 font-semibold">{overview.ideas.shortlisted}</span>
                      </div>
                      <div className="flex items-center justify-between p-2 bg-midnight-900/30 rounded">
                        <span className="text-midnight-300 text-sm">Đã duyệt</span>
                        <span className="text-green-400 font-semibold">{overview.ideas.approved}</span>
                      </div>
                      <div className="flex items-center justify-between p-2 bg-midnight-900/30 rounded">
                        <span className="text-midnight-300 text-sm">Lưu trữ</span>
                        <span className="text-gray-400 font-semibold">{overview.ideas.archived}</span>
                      </div>
                    </div>
                  </div>

                  {/* Content Status */}
                  <div className="glass-card rounded-2xl p-6">
                    <h3 className="text-lg font-semibold text-midnight-100 mb-4">📄 Content Status</h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-2 bg-midnight-900/30 rounded">
                        <span className="text-midnight-300 text-sm">Draft</span>
                        <span className="text-blue-400 font-semibold">{overview.contents.draft}</span>
                      </div>
                      <div className="flex items-center justify-between p-2 bg-midnight-900/30 rounded">
                        <span className="text-midnight-300 text-sm">Review</span>
                        <span className="text-yellow-400 font-semibold">{overview.contents.review}</span>
                      </div>
                      <div className="flex items-center justify-between p-2 bg-midnight-900/30 rounded">
                        <span className="text-midnight-300 text-sm">Published</span>
                        <span className="text-green-400 font-semibold">{overview.contents.published}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Timeline Tab */}
            {activeTab === 'timeline' && timeline?.ideas && (
              <div className="glass-card rounded-2xl p-6">
                <h2 className="text-2xl font-semibold text-midnight-100 mb-6">📅 Timeline (30 ngày gần nhất)</h2>
                <div className="space-y-4">
                  {timeline.ideas.length === 0 ? (
                    <p className="text-midnight-400 text-center py-8">Chưa có dữ liệu timeline</p>
                  ) : (
                    timeline.ideas.map((item, idx) => (
                      <div key={idx} className="p-4 bg-midnight-900/30 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-midnight-200 font-medium">{item.date}</span>
                          <div className="flex gap-4 text-sm">
                            <span className="text-blue-400">💡 {item.count} ideas</span>
                            <span className="text-green-400">✅ {item.approved} approved</span>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* Insights Tab */}
            {activeTab === 'insights' && personaIndustry?.personas && (
              <div className="grid md:grid-cols-2 gap-6">
                <div className="glass-card rounded-2xl p-6">
                  <h2 className="text-xl font-semibold text-midnight-100 mb-4">👥 Top Personas</h2>
                  <div className="space-y-3">
                    {personaIndustry.personas.length === 0 ? (
                      <p className="text-midnight-400">Chưa có dữ liệu</p>
                    ) : (
                      personaIndustry.personas.map((item, idx) => (
                        <div key={idx} className="flex items-center justify-between p-3 bg-midnight-900/30 rounded-lg">
                          <div>
                            <div className="text-midnight-100 font-medium">{item.persona}</div>
                            <div className="text-xs text-midnight-400">{item.approved} approved</div>
                          </div>
                          <div className="text-2xl font-bold text-blue-400">{item.count}</div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                <div className="glass-card rounded-2xl p-6">
                  <h2 className="text-xl font-semibold text-midnight-100 mb-4">🏢 Top Industries</h2>
                  <div className="space-y-3">
                    {personaIndustry.industries.length === 0 ? (
                      <p className="text-midnight-400">Chưa có dữ liệu</p>
                    ) : (
                      personaIndustry.industries.map((item, idx) => (
                        <div key={idx} className="flex items-center justify-between p-3 bg-midnight-900/30 rounded-lg">
                          <div>
                            <div className="text-midnight-100 font-medium">{item.industry}</div>
                            <div className="text-xs text-midnight-400">{item.approved} approved</div>
                          </div>
                          <div className="text-2xl font-bold text-yellow-400">{item.count}</div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Productivity Tab */}
            {activeTab === 'productivity' && productivity?.ideasPerDay !== undefined && (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="glass-card rounded-2xl p-6">
                  <h3 className="text-lg font-semibold text-midnight-100 mb-4">📊 Daily Average</h3>
                  <div className="space-y-4">
                    <div>
                      <div className="text-midnight-300 text-sm mb-1">Ideas/ngày</div>
                      <div className="text-3xl font-bold text-blue-400">{productivity.ideasPerDay}</div>
                    </div>
                    <div>
                      <div className="text-midnight-300 text-sm mb-1">Briefs/ngày</div>
                      <div className="text-3xl font-bold text-yellow-400">{productivity.briefsPerDay}</div>
                    </div>
                    <div>
                      <div className="text-midnight-300 text-sm mb-1">Contents/ngày</div>
                      <div className="text-3xl font-bold text-green-400">{productivity.contentsPerDay}</div>
                    </div>
                  </div>
                </div>

                <div className="glass-card rounded-2xl p-6">
                  <h3 className="text-lg font-semibold text-midnight-100 mb-4">⏱️ Average Time</h3>
                  <div className="space-y-4">
                    <div>
                      <div className="text-midnight-300 text-sm mb-1">Idea → Brief</div>
                      <div className="text-3xl font-bold text-purple-400">
                        {productivity.avgTimeToBrief} <span className="text-lg">ngày</span>
                      </div>
                    </div>
                    <div>
                      <div className="text-midnight-300 text-sm mb-1">Brief → Content</div>
                      <div className="text-3xl font-bold text-coral-400">
                        {productivity.avgTimeToContent} <span className="text-lg">ngày</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
}
