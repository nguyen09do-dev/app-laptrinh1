'use client';

import { useState } from 'react';
import { Trash2, Eye, Copy, ArrowUp, ArrowDown, ArrowUpDown } from 'lucide-react';

interface Content {
  id: number;
  brief_id: number;
  title: string;
  body: string;
  format: string;
  word_count: number;
  reading_time: number;
  status: string;
  author: string | null;
  published_at: string | null;
  created_at: string;
  updated_at: string;
  brief_title?: string;
  persona?: string;
  industry?: string;
}

interface ContentTableViewProps {
  contents: Content[];
  onView: (content: Content) => void;
  onDelete: (id: number) => void;
}

export default function ContentTableView({
  contents,
  onView,
  onDelete,
}: ContentTableViewProps) {
  type SortField = 'id' | 'title' | 'status' | 'word_count' | 'created_at';
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

  const sortedContents = [...contents].sort((a, b) => {
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
      review: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
      published: 'bg-green-500/20 text-green-300 border-green-500/30',
    };

    return (
      <span
        className={`px-3 py-1 rounded-full text-sm font-medium border ${
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
            <th className="px-4 py-4 text-left text-sm font-semibold text-white uppercase tracking-wider w-16">
              <button
                onClick={() => handleSort('id')}
                className="flex items-center gap-1 hover:text-blue-300 transition-colors"
              >
                ID {getSortIcon('id')}
              </button>
            </th>
            <th className="px-4 py-4 text-left text-sm font-semibold text-white uppercase tracking-wider min-w-[300px]">
              <button
                onClick={() => handleSort('title')}
                className="flex items-center gap-1 hover:text-blue-300 transition-colors"
              >
                Title {getSortIcon('title')}
              </button>
            </th>
            <th className="px-4 py-4 text-left text-sm font-semibold text-white uppercase tracking-wider w-40">
              Brief
            </th>
            <th className="px-4 py-4 text-left text-sm font-semibold text-white uppercase tracking-wider w-32">
              Persona
            </th>
            <th className="px-4 py-4 text-left text-sm font-semibold text-white uppercase tracking-wider w-32">
              Industry
            </th>
            <th className="px-4 py-4 text-left text-sm font-semibold text-white uppercase tracking-wider w-28">
              <button
                onClick={() => handleSort('word_count')}
                className="flex items-center gap-1 hover:text-blue-300 transition-colors"
              >
                Words {getSortIcon('word_count')}
              </button>
            </th>
            <th className="px-4 py-4 text-left text-sm font-semibold text-white uppercase tracking-wider w-28">
              <button
                onClick={() => handleSort('status')}
                className="flex items-center gap-1 hover:text-blue-300 transition-colors"
              >
                Status {getSortIcon('status')}
              </button>
            </th>
            <th className="px-4 py-4 text-left text-sm font-semibold text-white uppercase tracking-wider w-28">
              <button
                onClick={() => handleSort('created_at')}
                className="flex items-center gap-1 hover:text-blue-300 transition-colors"
              >
                Created {getSortIcon('created_at')}
              </button>
            </th>
            <th className="px-4 py-4 text-right text-sm font-semibold text-white uppercase tracking-wider w-32">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/5">
          {sortedContents.map((content) => (
            <tr
              key={content.id}
              className="hover:bg-white/5 transition-colors group"
            >
              <td className="px-4 py-4 whitespace-nowrap">
                <span className="text-base font-mono text-gray-400">#{content.id}</span>
              </td>
              <td className="px-4 py-4">
                <div className="max-w-md">
                  <div className="text-base font-medium text-white truncate">
                    {content.title}
                  </div>
                  <div className="text-sm text-gray-400 truncate mt-1">
                    {content.body.substring(0, 100)}...
                  </div>
                </div>
              </td>
              <td className="px-4 py-4">
                <div className="text-sm text-gray-400 max-w-xs truncate">
                  {content.brief_title || `Brief #${content.brief_id}`}
                </div>
              </td>
              <td className="px-4 py-4 whitespace-nowrap">
                {content.persona && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-500/20 text-purple-300 border border-purple-500/30">
                    {content.persona}
                  </span>
                )}
              </td>
              <td className="px-4 py-4 whitespace-nowrap">
                {content.industry && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                    {content.industry}
                  </span>
                )}
              </td>
              <td className="px-4 py-4 whitespace-nowrap">
                <span className="text-base text-gray-300">
                  {content.word_count} words
                </span>
              </td>
              <td className="px-4 py-4 whitespace-nowrap">
                {getStatusBadge(content.status)}
              </td>
              <td className="px-4 py-4 whitespace-nowrap">
                <span className="text-base text-gray-400">
                  {formatDate(content.created_at)}
                </span>
              </td>
              <td className="px-4 py-4 whitespace-nowrap text-right">
                <div className="flex items-center justify-end gap-2">
                  <button
                    onClick={() => onView(content)}
                    className="p-2 rounded-lg bg-blue-500/20 text-blue-300 hover:bg-blue-500/30 transition-colors"
                    title="View Details"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      if (confirm(`Delete content "${content.title}"?`)) {
                        onDelete(content.id);
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
