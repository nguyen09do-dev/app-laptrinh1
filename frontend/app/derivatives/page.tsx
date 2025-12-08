'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { showToast } from '@/lib/toast';
import {
  DerivativeTabs,
  DerivativesEmptyState,
  DerivativesLoading,
  ContentDerivatives,
} from '../components/derivatives';
import {
  Sparkles,
  Package,
  RefreshCw,
  Download,
  FileJson,
  FileText,
  ChevronDown,
  ExternalLink,
  Settings,
  BarChart3,
  History,
  Globe,
} from 'lucide-react';

interface ContentPack {
  pack_id: string;
  brief_id: number;
  brief_title?: string;
  draft_content: string | null;
  word_count: number;
  status: string;
  derivatives: ContentDerivatives | null;
  created_at: string;
}

interface DerivativeVersion {
  version_id: string;
  pack_id: string;
  derivative_type: string;
  content: any;
  created_at: string;
}

export default function DerivativesPage() {
  const [packs, setPacks] = useState<ContentPack[]>([]);
  const [selectedPack, setSelectedPack] = useState<ContentPack | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showPackSelector, setShowPackSelector] = useState(false);
  const [versions, setVersions] = useState<DerivativeVersion[]>([]);
  const [showVersions, setShowVersions] = useState(false);

  // Fetch packs on mount
  useEffect(() => {
    fetchPacks();
  }, []);

  const fetchPacks = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/packs');
      const data = await response.json();
      if (data.success) {
        // Filter packs that have draft content
        const packsWithContent = data.data.filter((p: ContentPack) => p.draft_content);
        setPacks(packsWithContent);
        
        // Auto-select first pack if available
        if (packsWithContent.length > 0 && !selectedPack) {
          setSelectedPack(packsWithContent[0]);
        }
      }
    } catch (error) {
      console.error('Failed to fetch packs:', error);
      showToast.error('Failed to load content packs');
    } finally {
      setIsLoading(false);
    }
  };

  const generateDerivatives = async () => {
    if (!selectedPack) {
      showToast.error('Please select a content pack first');
      return;
    }

    setIsGenerating(true);
    try {
      const response = await fetch('http://localhost:3001/api/packs/derivatives', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pack_id: selectedPack.pack_id,
          language: 'vi',
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        showToast.success('Derivatives generated successfully!');
        
        // Update selected pack with new derivatives
        setSelectedPack({
          ...selectedPack,
          derivatives: data.data.derivatives,
        });
        
        // Update in packs list
        setPacks(packs.map(p => 
          p.pack_id === selectedPack.pack_id 
            ? { ...p, derivatives: data.data.derivatives }
            : p
        ));
      } else {
        throw new Error(data.error || 'Failed to generate derivatives');
      }
    } catch (error: any) {
      console.error('Generation error:', error);
      showToast.error(error.message || 'Failed to generate derivatives');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRegenerate = async (type: keyof ContentDerivatives) => {
    if (!selectedPack) return;
    
    setIsGenerating(true);
    try {
      const response = await fetch(
        `http://localhost:3001/api/packs/${selectedPack.pack_id}/derivatives/regenerate`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ type, language: 'vi' }),
        }
      );

      const data = await response.json();
      
      if (data.success) {
        showToast.success(`${type} regenerated successfully!`);
        // Refresh pack data
        await fetchPackDerivatives(selectedPack.pack_id);
      } else {
        throw new Error(data.error);
      }
    } catch (error: any) {
      showToast.error(error.message || 'Failed to regenerate');
    } finally {
      setIsGenerating(false);
    }
  };

  const fetchPackDerivatives = async (packId: string) => {
    try {
      const response = await fetch(`http://localhost:3001/api/packs/${packId}/derivatives`);
      const data = await response.json();
      
      if (data.success && data.data) {
        setSelectedPack(prev => prev ? { ...prev, derivatives: data.data.derivatives } : null);
      }
    } catch (error) {
      console.error('Failed to fetch derivatives:', error);
    }
  };

  const fetchVersions = async () => {
    if (!selectedPack) return;
    
    try {
      const response = await fetch(
        `http://localhost:3001/api/packs/${selectedPack.pack_id}/derivatives/versions`
      );
      const data = await response.json();
      
      if (data.success) {
        setVersions(data.data);
        setShowVersions(true);
      }
    } catch (error) {
      showToast.error('Failed to fetch versions');
    }
  };

  const exportDerivatives = async (format: 'json' | 'md') => {
    if (!selectedPack?.derivatives) {
      showToast.error('No derivatives to export');
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:3001/api/packs/${selectedPack.pack_id}/derivatives/export?format=${format}`
      );
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `derivatives-${selectedPack.pack_id}.${format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      
      showToast.success(`Exported as ${format.toUpperCase()}`);
    } catch (error) {
      showToast.error('Failed to export');
    }
  };

  return (
    <main className="min-h-screen p-6 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="font-display text-3xl md:text-4xl font-bold mb-2">
                <span className="text-gradient">🚀 Multi-platform Publisher</span>
              </h1>
              <p className="text-midnight-300 text-lg">
                Generate and preview content derivatives for multiple platforms
              </p>
            </div>

            {/* Quick Stats */}
            {selectedPack?.derivatives?.twitter_thread && (
              <div className="hidden md:flex items-center gap-4">
                <div className="px-4 py-2 bg-midnight-800 rounded-xl border border-midnight-700">
                  <div className="text-xs text-midnight-400 mb-1">Platforms</div>
                  <div className="text-lg font-semibold text-white">5</div>
                </div>
                <div className="px-4 py-2 bg-midnight-800 rounded-xl border border-midnight-700">
                  <div className="text-xs text-midnight-400 mb-1">Tweets</div>
                  <div className="text-lg font-semibold text-[#1DA1F2]">
                    {selectedPack.derivatives.twitter_thread.length}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Pack Selector & Actions */}
          <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
            {/* Pack Selector */}
            <div className="relative flex-1 max-w-md">
              <button
                onClick={() => setShowPackSelector(!showPackSelector)}
                className="w-full flex items-center justify-between gap-3 px-4 py-3 bg-midnight-800 border border-midnight-700 rounded-xl hover:border-midnight-600 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Package className="w-5 h-5 text-purple-400" />
                  <div className="text-left">
                    <div className="text-sm text-midnight-400">Content Pack</div>
                    <div className="text-white font-medium truncate max-w-[250px]">
                      {selectedPack?.brief_title || 'Select a pack...'}
                    </div>
                  </div>
                </div>
                <ChevronDown className={`w-5 h-5 text-midnight-400 transition-transform ${showPackSelector ? 'rotate-180' : ''}`} />
              </button>

              {/* Dropdown */}
              {showPackSelector && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="absolute top-full left-0 right-0 mt-2 bg-midnight-800 border border-midnight-700 rounded-xl shadow-xl z-50 max-h-64 overflow-y-auto"
                >
                  {packs.map((pack) => (
                    <button
                      key={pack.pack_id}
                      onClick={() => {
                        setSelectedPack(pack);
                        setShowPackSelector(false);
                      }}
                      className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-midnight-700 transition-colors ${
                        selectedPack?.pack_id === pack.pack_id ? 'bg-midnight-700' : ''
                      }`}
                    >
                      <Package className="w-4 h-4 text-midnight-400" />
                      <div className="text-left flex-1">
                        <div className="text-white text-sm truncate">{pack.brief_title}</div>
                        <div className="text-xs text-midnight-400">
                          {pack.word_count} words • {pack.status}
                          {pack.derivatives && Object.keys(pack.derivatives).length > 0 && (
                            <span className="ml-2 text-emerald-400">✓ Has derivatives</span>
                          )}
                        </div>
                      </div>
                    </button>
                  ))}
                  {packs.length === 0 && (
                    <div className="px-4 py-6 text-center text-midnight-400">
                      No packs with content available
                    </div>
                  )}
                </motion.div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={generateDerivatives}
                disabled={!selectedPack || isGenerating}
                className={`
                  flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium transition-all
                  ${selectedPack && !isGenerating
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-500 hover:to-pink-500'
                    : 'bg-midnight-700 text-midnight-400 cursor-not-allowed'
                  }
                `}
              >
                {isGenerating ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Sparkles className="w-4 h-4" />
                )}
                <span>{isGenerating ? 'Generating...' : 'Generate'}</span>
              </button>

              {/* Export Dropdown */}
              {selectedPack?.derivatives && (
                <div className="relative group">
                  <button className="flex items-center gap-2 px-4 py-2.5 bg-midnight-700 hover:bg-midnight-600 text-white rounded-xl transition-colors">
                    <Download className="w-4 h-4" />
                    <span>Export</span>
                  </button>
                  <div className="absolute right-0 top-full mt-2 bg-midnight-800 border border-midnight-700 rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                    <button
                      onClick={() => exportDerivatives('json')}
                      className="flex items-center gap-2 px-4 py-2 hover:bg-midnight-700 w-full text-left"
                    >
                      <FileJson className="w-4 h-4 text-amber-400" />
                      <span>JSON</span>
                    </button>
                    <button
                      onClick={() => exportDerivatives('md')}
                      className="flex items-center gap-2 px-4 py-2 hover:bg-midnight-700 w-full text-left"
                    >
                      <FileText className="w-4 h-4 text-purple-400" />
                      <span>Markdown</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Version History */}
              {selectedPack?.derivatives && (
                <button
                  onClick={fetchVersions}
                  className="flex items-center gap-2 px-4 py-2.5 bg-midnight-700 hover:bg-midnight-600 text-white rounded-xl transition-colors"
                >
                  <History className="w-4 h-4" />
                  <span className="hidden md:inline">History</span>
                </button>
              )}
            </div>
          </div>
        </header>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Derivatives Tabs - Main Area */}
          <div className="lg:col-span-2">
            <div className="glass-card rounded-2xl p-6">
              {isLoading ? (
                <DerivativesLoading />
              ) : !selectedPack ? (
                <DerivativesEmptyState />
              ) : !selectedPack.derivatives || !selectedPack.derivatives.twitter_thread || selectedPack.derivatives.twitter_thread.length === 0 ? (
                <DerivativesEmptyState
                  onGenerate={generateDerivatives}
                  isGenerating={isGenerating}
                />
              ) : (
                <DerivativeTabs
                  derivatives={selectedPack.derivatives}
                  onRegenerate={handleRegenerate}
                  isLoading={isGenerating}
                />
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Pack Info Card */}
            {selectedPack && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="glass-card rounded-2xl p-6"
              >
                <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
                  <Package className="w-5 h-5 text-purple-400" />
                  Pack Details
                </h3>
                <div className="space-y-3">
                  <div>
                    <div className="text-xs text-midnight-400 mb-1">Title</div>
                    <div className="text-white">{selectedPack.brief_title}</div>
                  </div>
                  <div>
                    <div className="text-xs text-midnight-400 mb-1">Word Count</div>
                    <div className="text-white">{selectedPack.word_count} words</div>
                  </div>
                  <div>
                    <div className="text-xs text-midnight-400 mb-1">Status</div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        selectedPack.status === 'published' ? 'bg-purple-500/20 text-purple-400' :
                        selectedPack.status === 'approved' ? 'bg-emerald-500/20 text-emerald-400' :
                        'bg-amber-500/20 text-amber-400'
                      }`}>
                        {selectedPack.status}
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Platform Stats */}
            {selectedPack?.derivatives?.twitter_thread && selectedPack?.derivatives?.linkedin && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="glass-card rounded-2xl p-6"
              >
                <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-emerald-400" />
                  Content Stats
                </h3>
                <div className="space-y-3">
                  <StatRow
                    label="Twitter Thread"
                    value={`${selectedPack.derivatives.twitter_thread?.length || 0} tweets`}
                    color="text-[#1DA1F2]"
                  />
                  <StatRow
                    label="LinkedIn"
                    value={`${selectedPack.derivatives.linkedin?.length || 0} chars`}
                    color="text-[#0A66C2]"
                  />
                  <StatRow
                    label="Email"
                    value={`${selectedPack.derivatives.email?.length || 0} chars`}
                    color="text-emerald-400"
                  />
                  <StatRow
                    label="Blog Summary"
                    value={`${selectedPack.derivatives.blog_summary?.split(/\s+/).length || 0} words`}
                    color="text-purple-400"
                  />
                  <StatRow
                    label="SEO Description"
                    value={`${selectedPack.derivatives.seo_description?.length || 0}/160`}
                    color="text-amber-400"
                  />
                </div>
              </motion.div>
            )}

            {/* Quick Actions */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="glass-card rounded-2xl p-6"
            >
              <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
                <Settings className="w-5 h-5 text-midnight-400" />
                Quick Actions
              </h3>
              <div className="space-y-2">
                <ActionButton
                  icon={Globe}
                  label="Preview All Platforms"
                  onClick={() => showToast.info('Coming soon!')}
                />
                <ActionButton
                  icon={ExternalLink}
                  label="Share Preview Link"
                  onClick={() => showToast.info('Coming soon!')}
                />
              </div>
            </motion.div>
          </div>
        </div>

        {/* Version History Modal */}
        {showVersions && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-midnight-900 rounded-2xl border border-midnight-700 max-w-2xl w-full max-h-[80vh] overflow-hidden"
            >
              <div className="p-6 border-b border-midnight-700 flex items-center justify-between">
                <h3 className="text-xl font-semibold text-white flex items-center gap-2">
                  <History className="w-5 h-5 text-purple-400" />
                  Version History
                </h3>
                <button
                  onClick={() => setShowVersions(false)}
                  className="p-2 hover:bg-midnight-700 rounded-lg transition-colors"
                >
                  ✕
                </button>
              </div>
              <div className="p-6 overflow-y-auto max-h-[60vh]">
                {versions.length > 0 ? (
                  <div className="space-y-3">
                    {versions.map((version) => (
                      <div
                        key={version.version_id}
                        className="p-4 bg-midnight-800 rounded-xl border border-midnight-700"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-white capitalize">
                            {version.derivative_type.replace('_', ' ')}
                          </span>
                          <span className="text-xs text-midnight-400">
                            {new Date(version.created_at).toLocaleString()}
                          </span>
                        </div>
                        <div className="text-sm text-midnight-300 line-clamp-2">
                          {typeof version.content === 'string'
                            ? version.content.slice(0, 100) + '...'
                            : JSON.stringify(version.content).slice(0, 100) + '...'}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-midnight-400">
                    No version history available
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </main>
  );
}

// Helper Components
function StatRow({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-midnight-400">{label}</span>
      <span className={`text-sm font-medium ${color}`}>{value}</span>
    </div>
  );
}

function ActionButton({ icon: Icon, label, onClick }: { icon: any; label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 px-4 py-3 bg-midnight-800 hover:bg-midnight-700 rounded-xl transition-colors text-left"
    >
      <Icon className="w-5 h-5 text-midnight-400" />
      <span className="text-sm text-white">{label}</span>
    </button>
  );
}

