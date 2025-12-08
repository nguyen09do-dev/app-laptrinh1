'use client';

import { FileText, ExternalLink, Trash2, Calendar, User, Tag } from 'lucide-react';

interface Document {
  doc_id: string;
  title: string;
  author?: string;
  published_date?: string;
  tags?: string[];
  url?: string;
  version_number: number;
  created_at: string;
}

interface DocumentsTableViewProps {
  documents: Document[];
  onDelete: (docId: string) => void;
}

export default function DocumentsTableView({ documents, onDelete }: DocumentsTableViewProps) {
  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const truncateUrl = (url: string, maxLength: number = 40) => {
    if (url.length <= maxLength) return url;
    return url.substring(0, maxLength) + '...';
  };

  return (
    <div className="glass-card rounded-xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-midnight-700">
              <th className="px-6 py-4 text-left text-midnight-400 font-medium text-sm">Document</th>
              <th className="px-6 py-4 text-left text-midnight-400 font-medium text-sm">Author</th>
              <th className="px-6 py-4 text-left text-midnight-400 font-medium text-sm">Published</th>
              <th className="px-6 py-4 text-left text-midnight-400 font-medium text-sm">Tags</th>
              <th className="px-6 py-4 text-left text-midnight-400 font-medium text-sm">Version</th>
              <th className="px-6 py-4 text-right text-midnight-400 font-medium text-sm">Actions</th>
            </tr>
          </thead>
          <tbody>
            {documents.map((doc) => (
              <tr
                key={doc.doc_id}
                className="border-b border-midnight-800 hover:bg-midnight-800/30 transition-colors"
              >
                {/* Document Title & URL */}
                <td className="px-6 py-4">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-coral-500/20 rounded-lg mt-1">
                      <FileText className="w-4 h-4 text-coral-400" />
                    </div>
                    <div>
                      <p className="text-white font-medium mb-1">{doc.title}</p>
                      {doc.url && (
                        <a
                          href={doc.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-mint-400 text-sm hover:underline flex items-center gap-1"
                        >
                          {truncateUrl(doc.url)}
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                  </div>
                </td>

                {/* Author */}
                <td className="px-6 py-4">
                  {doc.author ? (
                    <div className="flex items-center gap-2 text-midnight-300">
                      <User className="w-4 h-4" />
                      <span>{doc.author}</span>
                    </div>
                  ) : (
                    <span className="text-midnight-500 text-sm">-</span>
                  )}
                </td>

                {/* Published Date */}
                <td className="px-6 py-4">
                  {doc.published_date ? (
                    <div className="flex items-center gap-2 text-midnight-300">
                      <Calendar className="w-4 h-4" />
                      <span>{formatDate(doc.published_date)}</span>
                    </div>
                  ) : (
                    <span className="text-midnight-500 text-sm">-</span>
                  )}
                </td>

                {/* Tags */}
                <td className="px-6 py-4">
                  {doc.tags && doc.tags.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                      {doc.tags.slice(0, 3).map((tag, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-1 bg-midnight-800 text-midnight-300 text-xs rounded-full border border-midnight-700"
                        >
                          {tag}
                        </span>
                      ))}
                      {doc.tags.length > 3 && (
                        <span className="px-2 py-1 text-midnight-500 text-xs">
                          +{doc.tags.length - 3}
                        </span>
                      )}
                    </div>
                  ) : (
                    <span className="text-midnight-500 text-sm">-</span>
                  )}
                </td>

                {/* Version */}
                <td className="px-6 py-4">
                  <span className="px-3 py-1 bg-blue-500/20 text-blue-400 text-sm rounded-full font-medium">
                    v{doc.version_number}
                  </span>
                </td>

                {/* Actions */}
                <td className="px-6 py-4 text-right">
                  <button
                    onClick={() => onDelete(doc.doc_id)}
                    className="p-2 hover:bg-red-500/20 text-red-400 rounded-lg transition-all"
                    title="Delete document"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="px-6 py-4 border-t border-midnight-700 bg-midnight-900/50">
        <p className="text-midnight-400 text-sm">
          Showing {documents.length} document{documents.length !== 1 ? 's' : ''}
        </p>
      </div>
    </div>
  );
}
