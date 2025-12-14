'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { showToast } from '@/lib/toast';
import {
  DerivativeTabs,
  DerivativesEmptyState,
  DerivativesLoading,
  ContentDerivatives,
} from '../components/derivatives';
import {
  MailchimpAuthCard,
  WordpressAuthCard,
  WordPressConfigModal,
  PublishActionsPanel,
  IntegrationAccordion,
} from '../components/integrations';
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
  Send,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Zap,
  Rocket,
  TrendingUp,
  Users,
  Clock,
  Eye,
  Mail,
} from 'lucide-react';

interface ContentPack {
  pack_id: string;
  brief_id: number;
  brief_title?: string;
  title?: string;
  draft_content: string | null;
  word_count: number;
  status: string;
  derivatives: ContentDerivatives | null;
  created_at: string;
}

interface LibraryContent {
  content_id: number;
  brief_id: number;
  brief_title?: string;
  title?: string;
  draft_content: string | null;
  final_content: string | null;
  word_count: number;
  status: string;
  derivatives: ContentDerivatives | null;
  created_at: string;
}

type ContentSource = 'packs' | 'library';
type WorkflowStep = 'select' | 'generate' | 'preview' | 'configure' | 'publish';

export default function MultiPlatformPublisherPage() {
  const [contentSource, setContentSource] = useState<ContentSource>('packs');
  const [packs, setPacks] = useState<ContentPack[]>([]);
  const [libraryContents, setLibraryContents] = useState<LibraryContent[]>([]);
  const [selectedPack, setSelectedPack] = useState<ContentPack | null>(null);
  const [selectedLibraryContent, setSelectedLibraryContent] = useState<LibraryContent | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentStep, setCurrentStep] = useState<WorkflowStep>('select');
  const [mailchimpConnected, setMailchimpConnected] = useState(false);
  const [wordpressConnected, setWordpressConnected] = useState(false);
  const [publishHistory, setPublishHistory] = useState<any[]>([]);
  const [isWordPressModalOpen, setIsWordPressModalOpen] = useState(false);

  // Fetch content on mount and when source changes
  useEffect(() => {
    let mounted = true;
    
    const init = async () => {
      if (mounted) {
        if (contentSource === 'packs') {
          await fetchPacks();
        } else {
          await fetchLibraryContents();
        }
        await checkIntegrationStatus();
      }
    };
    
    init();
    
    return () => {
      mounted = false;
    };
  }, [contentSource]);

  // Update step based on state
  useEffect(() => {
    let mounted = true;
    
    if (mounted) {
      const selected = contentSource === 'packs' ? selectedPack : selectedLibraryContent;
      if (!selected) {
        setCurrentStep('select');
      } else if (!selected.derivatives) {
        setCurrentStep('generate');
      } else {
        setCurrentStep('preview');
      }
    }
    
    return () => {
      mounted = false;
    };
  }, [selectedPack, selectedLibraryContent, contentSource]);

  const fetchPacks = async () => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout
      
      const response = await fetch('http://localhost:3001/api/packs', {
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`Server returned ${response.status}`);
      }
      
      const data = await response.json();
      if (data.success) {
        const packsWithContent = data.data.filter((p: ContentPack) => p.draft_content);
        setPacks(packsWithContent);
        
        if (packsWithContent.length > 0 && !selectedPack) {
          setSelectedPack(packsWithContent[0]);
        }
      }
    } catch (error: any) {
      console.error('Failed to fetch packs:', error);
      if (error.name === 'AbortError') {
        showToast.error('Request timeout - Please check backend connection');
      } else {
        showToast.error('Failed to load content packs');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const fetchLibraryContents = async () => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout
      
      const response = await fetch('http://localhost:3001/api/contents', {
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`Server returned ${response.status}`);
      }
      
      const data = await response.json();
      if (data.success) {
        const contentsWithText = data.data.filter((c: LibraryContent) => c.final_content || c.draft_content);
        setLibraryContents(contentsWithText);
        
        if (contentsWithText.length > 0 && !selectedLibraryContent) {
          setSelectedLibraryContent(contentsWithText[0]);
        }
      }
    } catch (error: any) {
      console.error('Failed to fetch library contents:', error);
      if (error.name === 'AbortError') {
        showToast.error('Request timeout - Please check backend connection');
      } else {
        showToast.error('Failed to load library contents');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const checkIntegrationStatus = async () => {
    try {
      // Check Mailchimp
      try {
        const controller1 = new AbortController();
        const timeout1 = setTimeout(() => controller1.abort(), 5000);
        
        const mailchimpRes = await fetch('http://localhost:3001/api/integrations/mailchimp/test', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: '{}',
          signal: controller1.signal,
        });
        clearTimeout(timeout1);
        
        const mailchimpData = await mailchimpRes.json();
        setMailchimpConnected(mailchimpData.success || false);
      } catch {
        setMailchimpConnected(false);
      }

      // Check WordPress
      try {
        const controller2 = new AbortController();
        const timeout2 = setTimeout(() => controller2.abort(), 5000);
        
        const wpRes = await fetch('http://localhost:3001/api/integrations/wordpress/test', {
          signal: controller2.signal,
        });
        clearTimeout(timeout2);
        
        const wpData = await wpRes.json();
        setWordpressConnected(wpData.success || false);
      } catch {
        setWordpressConnected(false);
      }
    } catch (error) {
      // Integrations not configured yet
      setMailchimpConnected(false);
      setWordpressConnected(false);
    }
  };

  const generateDerivatives = async () => {
    const selected = contentSource === 'packs' ? selectedPack : selectedLibraryContent;
    if (!selected) {
      showToast.error('Please select content first');
      return;
    }

    setIsGenerating(true);
    const toastId = showToast.loading('✨ Generating multi-platform content...');

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 60000); // 60s for AI generation
      
      const endpoint = contentSource === 'packs' 
        ? 'http://localhost:3001/api/packs/derivatives'
        : 'http://localhost:3001/api/contents/derivatives';
      
      const bodyKey = contentSource === 'packs' ? 'pack_id' : 'content_id';
      const bodyValue = contentSource === 'packs' 
        ? (selected as ContentPack).pack_id 
        : (selected as LibraryContent).content_id;
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [bodyKey]: bodyValue }),
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`Server returned ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        showToast.dismiss(toastId);
        showToast.success('🎉 Multi-platform content generated successfully!');
        
        // Update selected item with new derivatives
        if (contentSource === 'packs' && selectedPack) {
          setSelectedPack({
            ...selectedPack,
            derivatives: data.data.derivatives,
          });
          await fetchPacks();
        } else if (selectedLibraryContent) {
          setSelectedLibraryContent({
            ...selectedLibraryContent,
            derivatives: data.data.derivatives,
          });
          await fetchLibraryContents();
        }
        
        setCurrentStep('preview');
      } else {
        throw new Error(data.error || 'Failed to generate derivatives');
      }
    } catch (error: any) {
      showToast.dismiss(toastId);
      if (error.name === 'AbortError') {
        showToast.error('Generation timeout - Process took too long');
      } else {
        showToast.error(error.message || 'Failed to generate derivatives');
      }
      console.error('Generation error:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePackSelect = (pack: ContentPack) => {
    setSelectedPack(pack);
    setSelectedLibraryContent(null);
    if (pack.derivatives) {
      setCurrentStep('preview');
    } else {
      setCurrentStep('generate');
    }
  };

  const handleLibraryContentSelect = (content: LibraryContent) => {
    setSelectedLibraryContent(content);
    setSelectedPack(null);
    if (content.derivatives) {
      setCurrentStep('preview');
    } else {
      setCurrentStep('generate');
    }
  };

  const handleIntegrationSuccess = async () => {
    await checkIntegrationStatus();
    // If we have derivatives and integrations are connected, move to publish step
    if (selectedPack?.derivatives && (mailchimpConnected || wordpressConnected)) {
      setCurrentStep('preview');
    }
  };

  const handlePublishSuccess = (platform: string, result: any) => {
    setPublishHistory((prev) => [
      {
        platform,
        result,
        timestamp: new Date().toISOString(),
        packId: selectedPack?.pack_id,
      },
      ...prev,
    ]);
    showToast.success(`✅ Published to ${platform} successfully!`);
  };

  const getStepProgress = () => {
    // Simplified step calculation: Select (1), Generate (2), Preview/Publish (3)
    if (!selectedPack) return 1; // Step 1: Select Content
    if (!selectedPack.derivatives) return 2; // Step 2: Generate Derivatives
    return 3; // Step 3: Preview & Publish
  };

  const getTotalSteps = () => 3;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-midnight-900 via-midnight-800 to-midnight-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-purple-400 mx-auto mb-4" />
          <p className="text-midnight-400">Loading publisher...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-midnight-900 via-midnight-800 to-midnight-900">
      {/* Header */}
      <div className="border-b border-white/10 bg-white/5 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-2xl">
                <Rocket className="w-6 h-6 text-purple-400" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Multi-platform Publisher</h1>
                <p className="text-sm text-midnight-400">
                  Generate and publish content across multiple platforms
                </p>
              </div>
            </div>

            {/* Progress Indicator */}
            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className="text-sm font-medium text-white">
                  Step {getStepProgress()} of {getTotalSteps()}
                </div>
                <div className="text-xs text-midnight-400">
                  {!selectedPack && 'Select Content'}
                  {selectedPack && !selectedPack.derivatives && 'Generate Derivatives'}
                  {selectedPack && selectedPack.derivatives && 'Preview & Publish'}
                </div>
              </div>
              <div className="w-32 h-2 bg-midnight-700 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
                  initial={{ width: 0 }}
                  animate={{ width: `${(getStepProgress() / getTotalSteps()) * 100}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content Area */}
          <div className="lg:col-span-2 space-y-6">
            {/* Step 1: Select Content */}
            <AnimatePresence mode="wait">
              {currentStep === 'select' && (
                <motion.div
                  key="select"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="glass-card rounded-2xl p-8"
                >
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-3 bg-blue-500/20 rounded-xl">
                      <Package className="w-6 h-6 text-blue-400" />
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold text-white">Select Content</h2>
                      <p className="text-sm text-midnight-400">
                        Choose content to generate multi-platform versions
                      </p>
                    </div>
                  </div>

                  {/* Content Source Selector */}
                  <div className="flex gap-3 mb-6 p-1 bg-midnight-800 rounded-xl border border-midnight-700">
                    <button
                      onClick={() => {
                        setContentSource('packs');
                        setSelectedLibraryContent(null);
                      }}
                      className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-all ${
                        contentSource === 'packs'
                          ? 'bg-purple-600 text-white shadow-lg'
                          : 'text-midnight-400 hover:text-white'
                      }`}
                    >
                      <Package className="w-4 h-4" />
                      Content Packs
                    </button>
                    <button
                      onClick={() => {
                        setContentSource('library');
                        setSelectedPack(null);
                      }}
                      className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-all ${
                        contentSource === 'library'
                          ? 'bg-purple-600 text-white shadow-lg'
                          : 'text-midnight-400 hover:text-white'
                      }`}
                    >
                      <FileText className="w-4 h-4" />
                      Library Content
                    </button>
                  </div>

                  {/* Content Packs Grid */}
                  {contentSource === 'packs' && (
                    <>
                      {packs.length === 0 ? (
                        <div className="text-center py-12">
                          <Package className="w-16 h-16 text-midnight-600 mx-auto mb-4" />
                          <p className="text-midnight-400 mb-2">No content packs available</p>
                          <p className="text-sm text-midnight-500">
                            Create content packs in Content Studio first
                          </p>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {packs.map((pack) => (
                            <motion.button
                              key={pack.pack_id}
                              onClick={() => handlePackSelect(pack)}
                              className={`p-6 rounded-xl border-2 transition-all text-left ${
                                selectedPack?.pack_id === pack.pack_id
                                  ? 'border-purple-500 bg-purple-500/10'
                                  : 'border-midnight-700 bg-midnight-800/50 hover:border-midnight-600'
                              }`}
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                            >
                              <div className="flex items-start justify-between mb-3">
                                <h3 className="font-semibold text-white">{pack.title || pack.brief_title || 'Untitled'}</h3>
                                {pack.derivatives && (
                                  <span className="px-2 py-1 bg-emerald-500/20 text-emerald-400 text-xs rounded-lg">
                                    Ready
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-4 text-sm text-midnight-400">
                                <span className="flex items-center gap-1">
                                  <FileText className="w-4 h-4" />
                                  {pack.word_count} words
                                </span>
                                <span className="flex items-center gap-1">
                                  <Clock className="w-4 h-4" />
                                  {new Date(pack.created_at).toLocaleDateString()}
                                </span>
                              </div>
                            </motion.button>
                          ))}
                        </div>
                      )}
                    </>
                  )}

                  {/* Library Content Grid */}
                  {contentSource === 'library' && (
                    <>
                      {libraryContents.length === 0 ? (
                        <div className="text-center py-12">
                          <FileText className="w-16 h-16 text-midnight-600 mx-auto mb-4" />
                          <p className="text-midnight-400 mb-2">No library content available</p>
                          <p className="text-sm text-midnight-500">
                            Create content in Content Studio first
                          </p>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {libraryContents.map((content) => (
                            <motion.button
                              key={content.content_id}
                              onClick={() => handleLibraryContentSelect(content)}
                              className={`p-6 rounded-xl border-2 transition-all text-left ${
                                selectedLibraryContent?.content_id === content.content_id
                                  ? 'border-purple-500 bg-purple-500/10'
                                  : 'border-midnight-700 bg-midnight-800/50 hover:border-midnight-600'
                              }`}
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                            >
                              <div className="flex items-start justify-between mb-3">
                                <h3 className="font-semibold text-white">{content.title || content.brief_title || 'Untitled'}</h3>
                                {content.derivatives && (
                                  <span className="px-2 py-1 bg-emerald-500/20 text-emerald-400 text-xs rounded-lg">
                                    Ready
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-4 text-sm text-midnight-400">
                                <span className="flex items-center gap-1">
                                  <FileText className="w-4 h-4" />
                                  {content.word_count} words
                                </span>
                                <span className="flex items-center gap-1">
                                  <Clock className="w-4 h-4" />
                                  {new Date(content.created_at).toLocaleDateString()}
                                </span>
                              </div>
                            </motion.button>
                          ))}
                        </div>
                      )}
                    </>
                  )}
                </motion.div>
              )}

              {/* Step 2: Generate Derivatives */}
              {currentStep === 'generate' && (contentSource === 'packs' ? selectedPack : selectedLibraryContent) && (
                <motion.div
                  key="generate"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="glass-card rounded-2xl p-8"
                >
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-3 bg-purple-500/20 rounded-xl">
                      <Sparkles className="w-6 h-6 text-purple-400" />
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold text-white">Generate Multi-platform Content</h2>
                      <p className="text-sm text-midnight-400">
                        AI will create versions for Twitter, LinkedIn, Email, Blog, and SEO
                      </p>
                    </div>
                  </div>

                  {(() => {
                    const selected = contentSource === 'packs' ? selectedPack : selectedLibraryContent;
                    const contentText = selected && ('draft_content' in selected) 
                      ? (selected.final_content || selected.draft_content)
                      : null;
                    return contentText && (
                      <div className="mb-6 p-4 bg-midnight-800 rounded-xl border border-midnight-700">
                        <p className="text-sm text-midnight-400 mb-2">Source Content:</p>
                        <p className="text-white text-sm line-clamp-3">{contentText}</p>
                      </div>
                    );
                  })()}

                  <motion.button
                    onClick={generateDerivatives}
                    disabled={isGenerating}
                    className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 disabled:from-midnight-700 disabled:to-midnight-700 disabled:cursor-not-allowed text-white rounded-xl font-semibold transition-all"
                    whileHover={{ scale: isGenerating ? 1 : 1.02 }}
                    whileTap={{ scale: isGenerating ? 1 : 0.98 }}
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>Generating...</span>
                      </>
                    ) : (
                      <>
                        <Zap className="w-5 h-5" />
                        <span>Generate Multi-platform Content</span>
                      </>
                    )}
                  </motion.button>
                </motion.div>
              )}

              {/* Step 3: Preview Derivatives */}
              {currentStep === 'preview' && (contentSource === 'packs' ? selectedPack : selectedLibraryContent) && (
                <motion.div
                  key="preview"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-6"
                >
                  {(() => {
                    const selected = contentSource === 'packs' ? selectedPack : selectedLibraryContent;
                    return selected?.derivatives ? (
                    <>
                      <div className="glass-card rounded-2xl p-6">
                        <div className="flex items-center justify-between mb-6">
                          <div>
                            <h2 className="text-xl font-semibold text-white mb-2">Content Preview</h2>
                            <p className="text-sm text-midnight-400">
                              Review and edit your multi-platform content
                            </p>
                          </div>
                          <button
                            onClick={generateDerivatives}
                            disabled={isGenerating}
                            className="flex items-center gap-2 px-4 py-2 bg-midnight-700 hover:bg-midnight-600 text-white rounded-lg transition-colors disabled:opacity-50"
                          >
                            <RefreshCw className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} />
                            Regenerate
                          </button>
                        </div>

                        <DerivativeTabs
                          derivatives={selected.derivatives}
                          isLoading={isGenerating}
                        />
                      </div>

                      {/* Publish Actions */}
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                      >
                        <PublishActionsPanel
                          packId={contentSource === 'packs' && selectedPack ? selectedPack.pack_id : undefined}
                          contentId={contentSource === 'library' && selectedLibraryContent ? selectedLibraryContent.content_id : undefined}
                          hasDerivatives={!!selected.derivatives}
                        />
                      </motion.div>
                    </>
                    ) : (
                      <DerivativesEmptyState onGenerate={generateDerivatives} />
                    );
                  })()}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Right Sidebar */}
          <div className="space-y-6">
            {/* Content Stats */}
            {(() => {
              const selected = contentSource === 'packs' ? selectedPack : selectedLibraryContent;
              return selected && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="glass-card rounded-2xl p-6"
                >
                  <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-purple-400" />
                    Content Stats
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-midnight-400">Source</span>
                      <span className="px-2 py-1 bg-purple-500/20 text-purple-400 text-xs rounded-lg">
                        {contentSource === 'packs' ? 'Pack' : 'Library'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-midnight-400">Word Count</span>
                      <span className="text-white font-medium">{selected.word_count}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-midnight-400">Status</span>
                      <span className="px-2 py-1 bg-blue-500/20 text-blue-400 text-xs rounded-lg">
                        {selected.status}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-midnight-400">Derivatives</span>
                      <span className={`px-2 py-1 text-xs rounded-lg ${
                        selected.derivatives
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : 'bg-amber-500/20 text-amber-400'
                      }`}>
                        {selected.derivatives ? 'Ready' : 'Not Generated'}
                      </span>
                    </div>
                  </div>
                </motion.div>
              );
            })()}

            {/* Integration Status */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="glass-card rounded-2xl p-6"
            >
              <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
                <Settings className="w-5 h-5 text-purple-400" />
                Integration Status
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-midnight-800 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-amber-400" />
                    <span className="text-sm text-white">Mailchimp</span>
                  </div>
                  {mailchimpConnected ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-amber-400" />
                  )}
                </div>
                <div className="flex items-center justify-between p-3 bg-midnight-800 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Globe className="w-4 h-4 text-blue-400" />
                    <span className="text-sm text-white">WordPress</span>
                  </div>
                  {wordpressConnected ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-amber-400" />
                  )}
                </div>
              </div>
              {(!mailchimpConnected || !wordpressConnected) && (
                <button
                  onClick={() => setCurrentStep('configure')}
                  className="w-full mt-4 px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-sm font-medium transition-colors"
                >
                  Configure Integrations
                </button>
              )}
            </motion.div>

            {/* Platform Integrations */}
            {(currentStep === 'configure' || !mailchimpConnected || !wordpressConnected) && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="space-y-6"
              >
                <div className="flex items-center gap-2 mb-4">
                  <Settings className="w-5 h-5 text-purple-400" />
                  <h3 className="font-semibold text-white">Platform Integrations</h3>
                </div>

                {/* Mailchimp Accordion */}
                <IntegrationAccordion
                  platform="Mailchimp Integration"
                  icon={<Mail className="h-5 w-5 text-white" />}
                  description="Email newsletter campaigns"
                  isConnected={mailchimpConnected}
                  onStatusChange={checkIntegrationStatus}
                >
                  <MailchimpAuthCard onSaveSuccess={checkIntegrationStatus} />
                </IntegrationAccordion>

                {/* WordPress Accordion */}
                <IntegrationAccordion
                  platform="WordPress Integration"
                  icon={<Globe className="h-5 w-5 text-white" />}
                  description="Blog post publishing"
                  isConnected={wordpressConnected}
                  onStatusChange={checkIntegrationStatus}
                >
                  <button
                    onClick={() => setIsWordPressModalOpen(true)}
                    className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white rounded-lg font-semibold transition-all flex items-center justify-center gap-2"
                  >
                    <Settings className="w-5 h-5" />
                    {wordpressConnected ? 'Edit Configuration' : 'Configure WordPress'}
                  </button>
                </IntegrationAccordion>
              </motion.div>
            )}

            {/* Publish History */}
            {publishHistory.length > 0 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="glass-card rounded-2xl p-6"
              >
                <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
                  <History className="w-5 h-5 text-purple-400" />
                  Publish History
                </h3>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {publishHistory.slice(0, 5).map((item, idx) => (
                    <div
                      key={idx}
                      className="p-3 bg-midnight-800 rounded-lg border border-midnight-700"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-white capitalize">
                          {item.platform}
                        </span>
                        <span className="text-xs text-midnight-400">
                          {new Date(item.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                      <p className="text-xs text-midnight-400">
                        {item.platform === 'Mailchimp' && `Campaign ID: ${item.result?.campaignId?.substring(0, 8)}...`}
                        {item.platform === 'WordPress' && `Post ID: ${item.result?.postId}`}
                      </p>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>

      {/* WordPress Configuration Modal */}
      <WordPressConfigModal
        isOpen={isWordPressModalOpen}
        onClose={() => setIsWordPressModalOpen(false)}
        onSaveSuccess={() => {
          checkIntegrationStatus();
        }}
      />
    </div>
  );
}

