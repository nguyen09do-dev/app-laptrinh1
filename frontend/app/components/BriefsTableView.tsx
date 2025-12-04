'use client';

import { useState } from 'react';
import { Trash2, Eye, FileText, Sparkles, ArrowUp, ArrowDown, ArrowUpDown } from 'lucide-react';

interface Brief {
  id: number;
  idea_id: number;
  title: string;
  objective: string;
  target_audience: string;
  key_messages: string[];
  content_structure: {
    sections: Array<{ name: string; wordCount: number; description: string }>;
    totalWordCount: number;
  };
  seo_keywords: string[];
  status: string;
  created_at: string;
  idea_title?: string;
  persona?: string;
  industry?: string;
}

interface BriefsTableViewProps {
  briefs: Brief[];
  onView: (brief: Brief) => void;
  onDelete: (id: number) => void;
  onGenerateContent: (id: number) => void;
  generatingContent: number | null;
}

export default function BriefsTableView({
  briefs,
  onView,
  onDelete,
  onGenerateContent,
  generatingContent,
}: BriefsTableViewProps) {
  type SortField = 'id' | 'title' | 'status' | 'created_at';
  type SortDirection = 'asc' | 'desc' | null;

  const [sortField, setSortField] = useState<SortField | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      if (sortDirection === 'asc') {
        setSortDirection('desc');
      } else if (sortDirection === 'desc') {
        setSortField(null);
        setSortDirection(null);
      }
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return <ArrowUpDown className="w-3 h-3 opacity-50" />;
    }
    if (sortDirection === 'asc') {
      return <ArrowUp className="w-3 h-3" />;
    }
    return <ArrowDown className="w-3 h-3" />;
  };

  const sortedBriefs = [...briefs].sort((a, b) => {
    if (!sortField || !sortDirection) return 0;

    let aValue: any = a[sortField];
    let bValue: any = b[sortField];

    if (sortField === 'created_at') {
      aValue = new Date(aValue).getTime();
      bValue = new Date(bValue).getTime();
    }

    if (typeof aValue === 'string') {
      aValue = aValue.toLowerCase();
      bValue = bValue.toLowerCase();
    }

    if (sortDirection === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      draft: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
      approved: 'bg-green-500/20 text-green-300 border-green-500/30',
      archived: 'bg-gray-500/20 text-gray-300 border-gray-500/30',
    };

    return (
      <span
        className={`px-3 py-1 rounded-full text-xs font-medium border ${
          styles[status as keyof typeof styles] || styles.draft
        }`}
      >
        {status}
      </span>
    );
  };

  return (
    <div className="w-full overflow-x-auto rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm">
      <table className="w-full min-w-[1400px]">
        <thead>
          <tr className="border-b border-white/10 bg-white/5">
            <th className="px-4 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider w-16">
              <button
                onClick={() => handleSort('id')}
                className="flex items-center gap-1 hover:text-blue-300 transition-colors"
              >
                ID {getSortIcon('id')}
              </button>
            </th>
            <th className="px-4 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider min-w-[300px]">
              <button
                onClick={() => handleSort('title')}
                className="flex items-center gap-1 hover:text-blue-300 transition-colors"
              >
                Title {getSortIcon('title')}
              </button>
            </th>
            <th className="px-4 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider w-40">
              Idea
            </th>
            <th className="px-4 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider w-32">
              Persona
            </th>
            <th className="px-4 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider w-32">
              Industry
            </th>
            <th className="px-4 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider w-28">
              Word Count
            </th>
            <th className="px-4 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider w-28">
              <button
                onClick={() => handleSort('status')}
                className="flex items-center gap-1 hover:text-blue-300 transition-colors"
              >
                Status {getSortIcon('status')}
              </button>
            </th>
            <th className="px-4 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider w-28">
              <button
                onClick={() => handleSort('created_at')}
                className="flex items-center gap-1 hover:text-blue-300 transition-colors"
              >
                Created {getSortIcon('created_at')}
              </button>
            </th>
            <th className="px-4 py-4 text-right text-xs font-semibold text-white uppercase tracking-wider w-36">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/5">
          {sortedBriefs.map((brief) => (
            <tr
              key={brief.id}
              className="hover:bg-white/5 transition-colors group"
            >
              <td className="px-4 py-4 whitespace-nowrap">
                <span className="text-sm font-mono text-gray-400">#{brief.id}</span>
              </td>
              <td className="px-4 py-4">
                <div className="max-w-md">
                  <div className="text-sm font-medium text-white truncate">
                    {brief.title}
                  </div>
                  <div className="text-xs text-gray-400 truncate mt-1">
                    {brief.objective}
                  </div>
                </div>
              </td>
              <td className="px-4 py-4">
                <div className="text-xs text-gray-400 max-w-xs truncate">
                  {brief.idea_title || `Idea #${brief.idea_id}`}
                </div>
              </td>
              <td className="px-4 py-4 whitespace-nowrap">
                {brief.persona && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-500/20 text-purple-300 border border-purple-500/30">
                    {brief.persona}
                  </span>
                )}
              </td>
              <td className="px-4 py-4 whitespace-nowrap">
                {brief.industry && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                    {brief.industry}
                  </span>
                )}
              </td>
              <td className="px-4 py-4 whitespace-nowrap">
                <span className="text-sm text-gray-300">
                  {brief.content_structure?.totalWordCount || 0} words
                </span>
              </td>
              <td className="px-4 py-4 whitespace-nowrap">
                {getStatusBadge(brief.status)}
              </td>
              <td className="px-4 py-4 whitespace-nowrap">
                <span className="text-sm text-gray-400">
                  {formatDate(brief.created_at)}
                </span>
              </td>
              <td className="px-4 py-4 whitespace-nowrap text-right">
                <div className="flex items-center justify-end gap-2">
                  <button
                    onClick={() => onGenerateContent(brief.id)}
                    disabled={generatingContent === brief.id}
                    className="p-2 rounded-lg bg-purple-500/20 text-purple-300 hover:bg-purple-500/30 transition-colors disabled:opacity-50"
                    title="Generate Content"
                  >
                    {generatingContent === brief.id ? (
                      <span className="animate-spin">⏳</span>
                    ) : (
                      <Sparkles className="w-4 h-4" />
                    )}
                  </button>
                  <button
                    onClick={() => onView(brief)}
                    className="p-2 rounded-lg bg-blue-500/20 text-blue-300 hover:bg-blue-500/30 transition-colors"
                    title="View Details"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      if (confirm(`Delete brief "${brief.title}"?`)) {
                        onDelete(brief.id);
                      }
                    }}
                    className="p-2 rounded-lg bg-red-500/20 text-red-300 hover:bg-red-500/30 transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
