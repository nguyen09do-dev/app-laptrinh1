'use client';

import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, CartesianGrid, Legend } from 'recharts';

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

const chartColors = {
  primary: '#7a91f8',
  secondary: '#ff6b6b',
  success: '#34d399',
  warning: '#fbbf24',
  info: '#60a5fa',
};

export default function AnalyticsPage() {
  const [overview, setOverview] = useState<OverviewData | null>(null);
  const [timeline, setTimeline] = useState<TimelineData | null>(null);
  const [personaIndustry, setPersonaIndustry] = useState<PersonaIndustryData | null>(null);
  const [productivity, setProductivity] = useState<ProductivityData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'timeline' | 'insights' | 'productivity'>('overview');
  const [timelineRange, setTimelineRange] = useState<7 | 30 | 90>(30);

  useEffect(() => {
    fetchAllData();
  }, [timelineRange]);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const [overviewRes, timelineRes, personaRes, productivityRes] = await Promise.all([
        fetch('http://localhost:3001/api/analytics/overview'),
        fetch(`http://localhost:3001/api/analytics/timeline?days=${timelineRange}`),
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

  // Format date for analytics charts (e.g., "2024-11-26" -> "26/11")
  const formatAnalyticsDate = (dateString: string) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      const day = date.getDate();
      const month = date.getMonth() + 1;
      return `${day}/${month}`;
    } catch {
      return dateString.split('-')[2] || dateString;
    }
  };

  // Prepare timeline chart data
  const timelineChartData = timeline?.ideas?.map((item, idx) => {
    const briefCount = timeline.briefs[idx] ? parseInt(timeline.briefs[idx].count) : 0;
    const contentCount = timeline.contents[idx] ? parseInt(timeline.contents[idx].count) : 0;
    return {
      date: formatAnalyticsDate(item.date),
      ideas: parseInt(item.count) || 0,
      approved: parseInt(item.approved) || 0,
      briefs: briefCount,
      contents: contentCount,
    };
  }) || [];

  // Prepare persona/industry chart data
  const personaChartData = personaIndustry?.personas?.slice(0, 10).map(item => ({
    name: item.persona,
    total: parseInt(item.count) || 0,
    approved: parseInt(item.approved) || 0,
  })) || [];

  const industryChartData = personaIndustry?.industries?.slice(0, 10).map(item => ({
    name: item.industry,
    total: parseInt(item.count) || 0,
    approved: parseInt(item.approved) || 0,
  })) || [];

  const customTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-midnight-900/95 border border-midnight-700 rounded-lg p-3 shadow-lg">
          <p className="text-midnight-200 font-medium mb-2">{label}</p>
          {payload.map((entry: any, idx: number) => (
            <p key={idx} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
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

                {/* Conversion Rates with Chart */}
                <div className="grid md:grid-cols-2 gap-6">
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
                    <h3 className="text-lg font-semibold text-midnight-100 mb-4">📋 Content Status</h3>
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

            {/* Timeline Tab with Line Chart */}
            {activeTab === 'timeline' && timelineChartData.length > 0 && (
              <div className="space-y-6">
                <div className="glass-card rounded-2xl p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-semibold text-midnight-100">📅 Timeline Trends</h2>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setTimelineRange(7)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                          timelineRange === 7
                            ? 'bg-midnight-600 text-white'
                            : 'bg-midnight-800/50 text-midnight-400 hover:bg-midnight-700/50'
                        }`}
                      >
                        7 ngày
                      </button>
                      <button
                        onClick={() => setTimelineRange(30)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                          timelineRange === 30
                            ? 'bg-midnight-600 text-white'
                            : 'bg-midnight-800/50 text-midnight-400 hover:bg-midnight-700/50'
                        }`}
                      >
                        30 ngày
                      </button>
                      <button
                        onClick={() => setTimelineRange(90)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                          timelineRange === 90
                            ? 'bg-midnight-600 text-white'
                            : 'bg-midnight-800/50 text-midnight-400 hover:bg-midnight-700/50'
                        }`}
                      >
                        90 ngày
                      </button>
                    </div>
                  </div>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={timelineChartData} margin={{ top: 10, right: 30, left: 10, bottom: 25 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                        <XAxis
                          dataKey="date"
                          stroke="#64748b"
                          tick={{ fill: '#94a3b8', fontSize: 12 }}
                          tickLine={false}
                          axisLine={{ stroke: '#334155' }}
                          angle={-45}
                          textAnchor="end"
                          height={60}
                          interval={Math.floor(timelineChartData.length / 8) || 0}
                        />
                        <YAxis
                          stroke="#64748b"
                          tick={{ fill: '#94a3b8', fontSize: 12 }}
                          tickLine={false}
                          axisLine={{ stroke: '#334155' }}
                          allowDecimals={false}
                        />
                        <Tooltip content={customTooltip} />
                        <Legend wrapperStyle={{ fontSize: '13px', paddingTop: '10px' }} />
                        <Line
                          type="monotone"
                          dataKey="ideas"
                          stroke={chartColors.primary}
                          strokeWidth={3}
                          dot={{ r: 4, strokeWidth: 2 }}
                          activeDot={{ r: 6, strokeWidth: 2, stroke: '#fff' }}
                          name="Ideas"
                        />
                        <Line
                          type="monotone"
                          dataKey="approved"
                          stroke={chartColors.success}
                          strokeWidth={3}
                          dot={{ r: 4, strokeWidth: 2 }}
                          activeDot={{ r: 6, strokeWidth: 2, stroke: '#fff' }}
                          name="Approved"
                        />
                        <Line
                          type="monotone"
                          dataKey="briefs"
                          stroke={chartColors.warning}
                          strokeWidth={3}
                          dot={{ r: 4, strokeWidth: 2 }}
                          activeDot={{ r: 6, strokeWidth: 2, stroke: '#fff' }}
                          name="Briefs"
                        />
                        <Line
                          type="monotone"
                          dataKey="contents"
                          stroke={chartColors.secondary}
                          strokeWidth={3}
                          dot={{ r: 4, strokeWidth: 2 }}
                          activeDot={{ r: 6, strokeWidth: 2, stroke: '#fff' }}
                          name="Contents"
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            )}

            {/* Insights Tab with Bar Charts */}
            {activeTab === 'insights' && personaIndustry?.personas && (
              <div className="grid md:grid-cols-2 gap-6">
                <div className="glass-card rounded-2xl p-6">
                  <h2 className="text-xl font-semibold text-midnight-100 mb-4">👥 Top Personas</h2>
                  {personaChartData.length > 0 ? (
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={personaChartData} margin={{ top: 5, right: 30, left: 0, bottom: 60 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                          <XAxis 
                            dataKey="name" 
                            angle={-45}
                            textAnchor="end"
                            height={100}
                            stroke="#a3b8fc"
                            tick={{ fill: '#a3b8fc', fontSize: 10 }}
                          />
                          <YAxis stroke="#a3b8fc" tick={{ fill: '#a3b8fc', fontSize: 12 }} />
                          <Tooltip content={customTooltip} />
                          <Legend />
                          <Bar dataKey="total" fill={chartColors.primary} name="Total" radius={[6, 6, 0, 0]} />
                          <Bar dataKey="approved" fill={chartColors.success} name="Approved" radius={[6, 6, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  ) : (
                    <p className="text-midnight-400 text-center py-8">Chưa có dữ liệu</p>
                  )}
                </div>

                <div className="glass-card rounded-2xl p-6">
                  <h2 className="text-xl font-semibold text-midnight-100 mb-4">🏢 Top Industries</h2>
                  {industryChartData.length > 0 ? (
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={industryChartData} margin={{ top: 5, right: 30, left: 0, bottom: 60 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                          <XAxis 
                            dataKey="name" 
                            angle={-45}
                            textAnchor="end"
                            height={100}
                            stroke="#a3b8fc"
                            tick={{ fill: '#a3b8fc', fontSize: 10 }}
                          />
                          <YAxis stroke="#a3b8fc" tick={{ fill: '#a3b8fc', fontSize: 12 }} />
                          <Tooltip content={customTooltip} />
                          <Legend />
                          <Bar dataKey="total" fill={chartColors.warning} name="Total" radius={[6, 6, 0, 0]} />
                          <Bar dataKey="approved" fill={chartColors.success} name="Approved" radius={[6, 6, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  ) : (
                    <p className="text-midnight-400 text-center py-8">Chưa có dữ liệu</p>
                  )}
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
