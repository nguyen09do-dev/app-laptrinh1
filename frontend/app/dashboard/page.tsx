'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Plus, Rocket, FileText, Package2, Share2, BarChart3, Zap, Settings, Layers } from 'lucide-react';
import StatCard from '../components/StatCard';
import WorkflowItem from '../components/WorkflowItem';
import ToolCard from '../components/ToolCard';
import ActivityItem from '../components/ActivityItem';

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

interface Brief {
  id: number;
  idea_id: number;
  title: string;
  status: string;
  created_at: string;
}

interface Content {
  id: number;
  brief_id: number;
  title: string;
  status: string;
  created_at: string;
}

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  count?: number;
}

interface TimelineData {
  ideas: Array<{ date: string; count: string; approved: string }>;
  briefs: Array<{ date: string; count: string }>;
  contents: Array<{ date: string; count: string; words: string }>;
}

export default function DashboardPage() {
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [briefs, setBriefs] = useState<Brief[]>([]);
  const [contents, setContents] = useState<Content[]>([]);
  const [timeline, setTimeline] = useState<TimelineData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const [ideasRes, briefsRes, contentsRes, timelineRes] = await Promise.all([
        fetch('http://localhost:3001/api/ideas'),
        fetch('http://localhost:3001/api/briefs'),
        fetch('http://localhost:3001/api/contents'),
        fetch('http://localhost:3001/api/analytics/timeline?days=7'),
      ]);

      const ideasData: ApiResponse<Idea[]> = await ideasRes.json();
      const briefsData: ApiResponse<Brief[]> = await briefsRes.json();
      const contentsData: ApiResponse<Content[]> = await contentsRes.json();
      const timelineData: ApiResponse<TimelineData> = await timelineRes.json();

      if (ideasData.success && ideasData.data) setIdeas(ideasData.data);
      if (briefsData.success && briefsData.data) setBriefs(briefsData.data);
      if (contentsData.success && contentsData.data) setContents(contentsData.data);
      if (timelineData.success && timelineData.data) setTimeline(timelineData.data);
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

  const batches = new Set(ideas.map(i => i.batch_id).filter(Boolean));
  const batchCount = batches.size;
  const approvalRate = stats.total > 0 ? Math.round((stats.approved / stats.total) * 100) : 0;

  // Helper function to format date for chart display
  const formatChartDate = (dateString: string) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      const day = date.getDate();
      const month = date.getMonth() + 1;
      return `${day}/${month}`;
    } catch {
      return dateString.split('T')[0].split('-')[2] || dateString;
    }
  };

  // Prepare chart data for KPI cards with formatted dates
  const ideasChartData = timeline?.ideas?.map(item => ({
    date: formatChartDate(item.date),
    value: parseInt(item.count) || 0,
  })) || [];

  const briefsChartData = timeline?.briefs?.map(item => ({
    date: formatChartDate(item.date),
    value: parseInt(item.count) || 0,
  })) || [];

  const contentsChartData = timeline?.contents?.map(item => ({
    date: formatChartDate(item.date),
    value: parseInt(item.count) || 0,
  })) || [];

  // Build workflow items
  const workflowItems = [];
  
  // Find approved ideas without briefs
  const approvedIdeasWithoutBriefs = ideas.filter(
    idea => idea.status === 'approved' && !briefs.some(b => b.idea_id === idea.id)
  );
  
  approvedIdeasWithoutBriefs.slice(0, 2).forEach(idea => {
    workflowItems.push({
      id: idea.id,
      stage: 'Research' as const,
      label: idea.title,
      progress: 0,
      status: 'queued' as const,
      due: 'Today',
      href: `/briefs?ideaId=${idea.id}`,
    });
  });

  // Find briefs without contents
  const briefsWithoutContents = briefs.filter(
    brief => !contents.some(c => c.brief_id === brief.id)
  );
  
  briefsWithoutContents.slice(0, 2).forEach(brief => {
    workflowItems.push({
      id: brief.id,
      stage: 'Create' as const,
      label: brief.title,
      progress: 50,
      status: 'in_progress' as const,
      due: 'Tomorrow',
      href: `/content?briefId=${brief.id}`,
    });
  });

  // Find contents in draft
  contents.filter(c => c.status === 'draft').slice(0, 1).forEach(content => {
    workflowItems.push({
      id: content.id,
      stage: 'Optimize' as const,
      label: content.title,
      progress: 80,
      status: 'in_progress' as const,
      due: 'Wed',
      href: `/content?contentId=${content.id}`,
    });
  });

  // Recent activity
  const recentActivities = [];
  
  // Add recent ideas
  ideas.slice(0, 2).forEach(idea => {
    const timeAgo = getTimeAgo(idea.created_at);
    recentActivities.push({
      time: timeAgo,
      text: `Generated idea: "${idea.title}"`,
      type: 'ideate' as const,
    });
  });

  // Add recent briefs
  briefs.slice(0, 1).forEach(brief => {
    const timeAgo = getTimeAgo(brief.created_at);
    recentActivities.push({
      time: timeAgo,
      text: `Created brief: "${brief.title}"`,
      type: 'research' as const,
    });
  });

  // Add recent contents
  contents.slice(0, 1).forEach(content => {
    const timeAgo = getTimeAgo(content.created_at);
    recentActivities.push({
      time: timeAgo,
      text: `Generated content: "${content.title}"`,
      type: content.status === 'published' ? 'publish' as const : 'create' as const,
    });
  });

  function getTimeAgo(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins}m`;
    if (diffHours < 24) return `${diffHours}h`;
    return `${diffDays}d`;
  }

  return (
    <main className="min-h-screen p-6 md:p-10">
      <div className="max-w-7xl mx-auto">
        {/* Enhanced Header */}
        <header className="mb-8">
          <div className="glass-card rounded-2xl p-6 mb-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h1 className="font-display text-3xl md:text-4xl font-bold mb-2">
                  <span className="text-gradient">📊 Dashboard</span>
                </h1>
                <p className="text-midnight-300 text-lg max-w-2xl">
                  Plan, create, and manage multi-platform content with AI. Track progress, performance, and next actions in one place.
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Link
                  href="/ideas"
                  className="px-6 py-3 bg-gradient-to-r from-midnight-500 to-coral-500 text-white font-semibold rounded-xl hover:from-midnight-400 hover:to-coral-400 transition-all flex items-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Start New Idea
                </Link>
              </div>
            </div>
          </div>
        </header>

        {loading ? (
          <div className="text-center py-16">
            <div className="spinner mx-auto mb-4" />
            <p className="text-midnight-400">Đang tải dữ liệu...</p>
          </div>
        ) : (
          <>
            {/* KPI Cards with Mini Charts */}
            <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <StatCard
                title="Total Ideas"
                value={stats.total}
                deltaLabel={batchCount > 0 ? `From ${batchCount} batches` : undefined}
                chartData={ideasChartData}
                borderColor="border-blue-500"
                icon="💡"
              />
              <StatCard
                title="Approved"
                value={stats.approved}
                deltaLabel={approvalRate > 0 ? `↑ ${approvalRate}% approval rate` : undefined}
                chartData={ideasChartData}
                borderColor="border-green-500"
                icon="✅"
              />
              <StatCard
                title="Briefs"
                value={briefs.length}
                deltaLabel={briefs.length > 0 ? `${briefs.filter(b => b.status === 'approved').length} approved` : undefined}
                chartData={briefsChartData}
                borderColor="border-yellow-500"
                icon="📝"
              />
              <StatCard
                title="Contents"
                value={contents.length}
                deltaLabel={contents.length > 0 ? `${contents.filter(c => c.status === 'published').length} published` : undefined}
                chartData={contentsChartData}
                borderColor="border-purple-500"
                icon="✍️"
              />
            </section>

            {/* Workflow Tracking + Channel Performance */}
            <section className="grid lg:grid-cols-3 gap-6 mb-8">
              <div className="lg:col-span-2 glass-card rounded-2xl p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Layers className="h-5 w-5 text-midnight-300" />
                  <h2 className="text-xl font-semibold text-midnight-100">Content Creation Workflow</h2>
                </div>
                <p className="text-sm text-midnight-400 mb-6">
                  Track stage progress and jump to the next action.
                </p>
                {workflowItems.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-midnight-400">No active workflow items. Create an idea to get started!</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {workflowItems.map((item) => (
                      <WorkflowItem key={item.id} {...item} />
                    ))}
                  </div>
                )}
              </div>

              {/* Status Summary */}
              <div className="glass-card rounded-2xl p-6">
                <h2 className="text-xl font-semibold text-midnight-100 mb-4">📋 Status Summary</h2>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-midnight-900/30 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                      <span className="text-midnight-200 text-sm">New Ideas</span>
                    </div>
                    <span className="text-2xl font-bold text-blue-400">{stats.generated}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-midnight-900/30 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                      <span className="text-midnight-200 text-sm">Shortlisted</span>
                    </div>
                    <span className="text-2xl font-bold text-yellow-400">{stats.shortlisted}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-midnight-900/30 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full bg-green-500"></div>
                      <span className="text-midnight-200 text-sm">Approved</span>
                    </div>
                    <span className="text-2xl font-bold text-green-400">{stats.approved}</span>
                  </div>
                  <div className="mt-4 p-4 bg-midnight-900/50 rounded-lg border border-midnight-700">
                    <p className="text-sm text-midnight-300 text-center">
                      <span className="font-semibold text-midnight-100">{stats.approved + stats.shortlisted}</span> ideas
                      {' '}reviewed out of <span className="font-semibold text-midnight-100">{stats.total}</span> total
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Tool Cards Grid */}
            <section className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-midnight-100">Your Content Tools</h2>
              </div>
              <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
                <ToolCard
                  title="Content Ideas"
                  desc="Generate AI-powered ideas tailored to audience"
                  icon={Rocket}
                  stat={stats.total}
                  cta="New Idea"
                  href="/ideas"
                />
                <ToolCard
                  title="Research Briefs"
                  desc="Create comprehensive research briefs"
                  icon={FileText}
                  stat={briefs.length}
                  cta="New Brief"
                  href="/briefs"
                />
                <ToolCard
                  title="Content"
                  desc="Draft and manage content"
                  icon={Package2}
                  stat={contents.length}
                  cta="View Content"
                  href="/content"
                />
                <ToolCard
                  title="Analytics"
                  desc="Track performance & optimize"
                  icon={BarChart3}
                  stat="View"
                  cta="View Analytics"
                  href="/analytics"
                />
                <ToolCard
                  title="Settings"
                  desc="Configure system preferences"
                  icon={Settings}
                  stat="Config"
                  cta="Open Settings"
                  href="/settings"
                />
              </div>
            </section>

            {/* Recent Activity */}
            <section className="glass-card rounded-2xl p-6">
              <h2 className="text-xl font-semibold text-midnight-100 mb-2">Recent Workflow Activity</h2>
              <p className="text-sm text-midnight-400 mb-4">
                Latest actions across creation, optimization, and publishing.
              </p>
              {recentActivities.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-midnight-400">No recent activity</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {recentActivities.map((activity, idx) => (
                    <ActivityItem key={idx} {...activity} />
                  ))}
                </div>
              )}
            </section>
          </>
        )}
      </div>
    </main>
  );
}
