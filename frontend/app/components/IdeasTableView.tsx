'use client';

import { useState } from 'react';
import { Trash2, Eye, FileText, MoreVertical, ArrowUp, ArrowDown, ArrowUpDown } from 'lucide-react';

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
}

interface IdeasTableViewProps {
  ideas: Idea[];
  selectedIds: number[];
  onToggleSelect: (id: number) => void;
  onToggleSelectAll: () => void;
  onView: (idea: Idea) => void;
  onDelete: (id: number) => void;
  onCreateBrief: (id: number) => void;
  creatingBrief: number | null;
}

export default function IdeasTableView({
  ideas,
  selectedIds,
  onToggleSelect,
  onToggleSelectAll,
  onView,
  onDelete,
  onCreateBrief,
  creatingBrief,
}: IdeasTableViewProps) {
  type SortField = 'id' | 'title' | 'persona' | 'industry' | 'status' | 'created_at';
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

  const sortedIdeas = [...ideas].sort((a, b) => {
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
      generated: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
      shortlisted: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
      approved: 'bg-green-500/20 text-green-300 border-green-500/30',
      archived: 'bg-gray-500/20 text-gray-300 border-gray-500/30',
    };

    const labels = {
      generated: 'Generated',
      shortlisted: 'Shortlisted',
      approved: 'Approved',
      archived: 'Archived',
    };

    return (
      <span
        className={`px-3 py-1 rounded-full text-xs font-medium border ${
          styles[status as keyof typeof styles] || styles.generated
        }`}
      >
        {labels[status as keyof typeof labels] || status}
      </span>
    );
  };

  return (
    <div className="w-full overflow-x-auto rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm">
      <table className="w-full min-w-[1200px]">
        <thead>
          <tr className="border-b border-white/10 bg-white/5">
            <th className="px-4 py-4 text-left w-12">
              <input
                type="checkbox"
                checked={selectedIds.length === ideas.length && ideas.length > 0}
                onChange={onToggleSelectAll}
                className="w-5 h-5 rounded border-midnight-500 text-ocean-400 focus:ring-ocean-500 cursor-pointer"
              />
            </th>
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
            <th className="px-4 py-4 text-left text-sm font-semibold text-white uppercase tracking-wider w-32">
              <button
                onClick={() => handleSort('persona')}
                className="flex items-center gap-1 hover:text-blue-300 transition-colors"
              >
                Persona {getSortIcon('persona')}
              </button>
            </th>
            <th className="px-4 py-4 text-left text-sm font-semibold text-white uppercase tracking-wider w-32">
              <button
                onClick={() => handleSort('industry')}
                className="flex items-center gap-1 hover:text-blue-300 transition-colors"
              >
                Industry {getSortIcon('industry')}
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
            <th className="px-4 py-4 text-left text-sm font-semibold text-white uppercase tracking-wider w-32">
              Brief
            </th>
            <th className="px-4 py-4 text-right text-sm font-semibold text-white uppercase tracking-wider w-32">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/5">
          {sortedIdeas.map((idea) => (
            <tr
              key={idea.id}
              className="hover:bg-white/5 transition-colors group"
            >
              <td className="px-4 py-4 whitespace-nowrap">
                <input
                  type="checkbox"
                  checked={selectedIds.includes(idea.id)}
                  onChange={() => onToggleSelect(idea.id)}
                  className="w-5 h-5 rounded border-midnight-500 text-ocean-400 focus:ring-ocean-500 cursor-pointer"
                />
              </td>
              <td className="px-4 py-4 whitespace-nowrap">
                <span className="text-base font-mono text-gray-400">#{idea.id}</span>
              </td>
              <td className="px-4 py-4">
                <div className="max-w-md">
                  <div className="text-base font-medium text-white truncate">
                    {idea.title}
                  </div>
                  <div className="text-sm text-gray-400 truncate mt-1">
                    {idea.description}
                  </div>
                </div>
              </td>
              <td className="px-4 py-4 whitespace-nowrap">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  {idea.persona}
                </span>
              </td>
              <td className="px-4 py-4 whitespace-nowrap">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  {idea.industry}
                </span>
              </td>
              <td className="px-4 py-4 whitespace-nowrap">
                {getStatusBadge(idea.status)}
              </td>
              <td className="px-4 py-4 whitespace-nowrap">
                <span className="text-base text-gray-400">
                  {formatDate(idea.created_at)}
                </span>
              </td>
              <td className="px-4 py-4 whitespace-nowrap">
                {idea.brief ? (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-500/20 text-green-300 border border-green-500/30">
                    ✓ Created
                  </span>
                ) : (
                  <button
                    onClick={() => onCreateBrief(idea.id)}
                    disabled={creatingBrief === idea.id}
                    className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-blue-500/20 text-blue-300 border border-blue-500/30 hover:bg-blue-500/30 transition-colors disabled:opacity-50"
                  >
                    <FileText className="w-3 h-3" />
                    {creatingBrief === idea.id ? 'Creating...' : 'Create'}
                  </button>
                )}
              </td>
              <td className="px-4 py-4 whitespace-nowrap text-right">
                <div className="flex items-center justify-end gap-2">
                  <button
                    onClick={() => onView(idea)}
                    className="p-2 rounded-lg bg-blue-500/20 text-blue-300 hover:bg-blue-500/30 transition-colors"
                    title="View Details"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      if (confirm(`Delete idea "${idea.title}"?`)) {
                        onDelete(idea.id);
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
