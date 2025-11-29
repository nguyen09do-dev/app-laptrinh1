'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface Brief {
  id: number;
  idea_id: number;
  title: string;
  objective: string;
  target_audience: string;
  key_messages: string[];
  content_structure: {
    sections: Array<{ title: string; description: string; wordCount: number }>;
    totalWordCount: number;
  };
  seo_keywords: string[];
  created_at: string;
}

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
}

export default function ContentPage() {
  const [briefsWithoutContent, setBriefsWithoutContent] = useState<Brief[]>([]);
  const [contents, setContents] = useState<Content[]>([]);
  const [selectedContent, setSelectedContent] = useState<Content | null>(null);
  const [loading, setLoading] = useState(true);
  const [generatingId, setGeneratingId] = useState<number | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);

      // Fetch all briefs
      const briefsRes = await fetch('http://localhost:3001/api/briefs');
      const briefsData = await briefsRes.json();
      const allBriefs = briefsData.data || [];

      // Fetch all contents
      const contentsRes = await fetch('http://localhost:3001/api/contents');
      const contentsData = await contentsRes.json();
      const allContents = contentsData.data || [];

      setContents(allContents);

      // Find briefs that don't have content yet
      const contentBriefIds = new Set(allContents.map((c: Content) => c.brief_id));
      const briefsWithout = allBriefs.filter((b: Brief) => !contentBriefIds.has(b.id));
      setBriefsWithoutContent(briefsWithout);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleGenerateContent = async (briefId: number) => {
    try {
      setGeneratingId(briefId);
      const response = await fetch(`http://localhost:3001/api/contents/from-brief/${briefId}`, {
        method: 'POST',
      });

      const data = await response.json();

      if (data.success) {
        await fetchData();
        setSuccessMessage('✅ Đã tạo content thành công!');
        setTimeout(() => setSuccessMessage(null), 3000);
      } else {
        alert(`⚠️ Lỗi: ${data.error}`);
      }
    } catch (error) {
      console.error('Error generating content:', error);
      alert('⚠️ Lỗi khi tạo content');
    } finally {
      setGeneratingId(null);
    }
  };

  const handleDeleteContent = async (id: number) => {
    if (!confirm('Bạn có chắc muốn xóa content này?')) return;

    try {
      const response = await fetch(`http://localhost:3001/api/contents/${id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        await fetchData();
        setSelectedContent(null);
        setSuccessMessage('✅ Đã xóa content thành công!');
        setTimeout(() => setSuccessMessage(null), 3000);
      } else {
        alert(`⚠️ Lỗi: ${data.error}`);
      }
    } catch (error) {
      console.error('Error deleting content:', error);
      alert('⚠️ Lỗi khi xóa content');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'review':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'published':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 flex items-center justify-center">
        <div className="text-white text-xl">Đang tải...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 p-8">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-white mb-2">📄 Content Management</h1>
          <p className="text-gray-300">Tạo và quản lý nội dung từ briefs</p>
        </motion.div>

        {successMessage && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mb-6 p-4 bg-green-500/20 border border-green-500/30 rounded-xl text-green-400"
          >
            {successMessage}
          </motion.div>
        )}

        {/* Briefs without content */}
        {briefsWithoutContent.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-semibold text-white mb-4">📋 Briefs chưa có content</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {briefsWithoutContent.map((brief) => (
                <motion.div
                  key={brief.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20 hover:border-purple-400/50 transition-all"
                >
                  <h3 className="text-lg font-semibold text-white mb-2">{brief.title}</h3>
                  <p className="text-gray-300 text-sm mb-4 line-clamp-2">{brief.objective}</p>
                  <button
                    onClick={() => handleGenerateContent(brief.id)}
                    disabled={generatingId === brief.id}
                    className={`w-full px-4 py-2 rounded-lg font-medium transition-all ${
                      generatingId === brief.id
                        ? 'bg-gray-500/50 text-gray-300 cursor-not-allowed'
                        : 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:shadow-lg hover:shadow-purple-500/50'
                    }`}
                  >
                    {generatingId === brief.id ? '⏳ Đang tạo...' : '✨ Tạo Content'}
                  </button>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Existing contents */}
        <div>
          <h2 className="text-2xl font-semibold text-white mb-4">
            📝 Contents ({contents.length})
          </h2>
          {contents.length === 0 ? (
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-12 border border-white/20 text-center">
              <p className="text-gray-300 text-lg">Chưa có content nào. Hãy tạo content từ briefs!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {contents.map((content) => (
                <motion.div
                  key={content.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  onClick={() => setSelectedContent(content)}
                  className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20 hover:border-purple-400/50 transition-all cursor-pointer"
                >
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-lg font-semibold text-white flex-1">{content.title}</h3>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                        content.status
                      )}`}
                    >
                      {content.status}
                    </span>
                  </div>
                  <p className="text-gray-300 text-sm mb-3 line-clamp-3">{content.body}</p>
                  <div className="flex items-center justify-between text-xs text-gray-400">
                    <span>📊 {content.word_count} từ</span>
                    <span>⏱️ {content.reading_time || Math.ceil(content.word_count / 200)} phút đọc</span>
                  </div>
                  <div className="text-xs text-gray-500 mt-2">
                    🕒 {new Date(content.created_at).toLocaleDateString('vi-VN')}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Content Detail Modal */}
        {selectedContent && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            onClick={() => setSelectedContent(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-purple-500/30"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-start justify-between mb-6">
                <div className="flex-1">
                  <h2 className="text-3xl font-bold text-white mb-2">{selectedContent.title}</h2>
                  <div className="flex items-center gap-3">
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(
                        selectedContent.status
                      )}`}
                    >
                      {selectedContent.status}
                    </span>
                    <span className="text-gray-400 text-sm">
                      📊 {selectedContent.word_count} từ
                    </span>
                    <span className="text-gray-400 text-sm">
                      ⏱️ {selectedContent.reading_time || Math.ceil(selectedContent.word_count / 200)} phút đọc
                    </span>
                    <span className="text-gray-400 text-sm">
                      🕒 {new Date(selectedContent.created_at).toLocaleDateString('vi-VN')}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedContent(null)}
                  className="text-gray-400 hover:text-white text-2xl"
                >
                  ×
                </button>
              </div>

              <div className="mb-6">
                <h3 className="text-xl font-semibold text-purple-400 mb-3">📄 Nội dung</h3>
                <div className="bg-white/5 rounded-xl p-6 border border-white/10">
                  <pre className="text-gray-200 whitespace-pre-wrap font-sans leading-relaxed">
                    {selectedContent.body}
                  </pre>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => handleDeleteContent(selectedContent.id)}
                  className="px-6 py-2 bg-red-500/20 text-red-400 border border-red-500/30 rounded-lg hover:bg-red-500/30 transition-all"
                >
                  🗑️ Xóa Content
                </button>
                <button
                  onClick={() => setSelectedContent(null)}
                  className="flex-1 px-6 py-2 bg-purple-500/20 text-purple-400 border border-purple-500/30 rounded-lg hover:bg-purple-500/30 transition-all"
                >
                  Đóng
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
