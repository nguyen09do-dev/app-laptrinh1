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

type WorkflowStep = 'select' | 'generate' | 'preview' | 'configure' | 'publish';

export default function MultiPlatformPublisherPage() {
  const [packs, setPacks] = useState<ContentPack[]>([]);
  const [selectedPack, setSelectedPack] = useState<ContentPack | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentStep, setCurrentStep] = useState<WorkflowStep>('select');
  const [mailchimpConnected, setMailchimpConnected] = useState(false);
  const [wordpressConnected, setWordpressConnected] = useState(false);
  const [publishHistory, setPublishHistory] = useState<any[]>([]);
  const [isWordPressModalOpen, setIsWordPressModalOpen] = useState(false);

  // Fetch packs on mount
  useEffect(() => {
    let mounted = true;
    
    const init = async () => {
      if (mounted) {
        await fetchPacks();
        await checkIntegrationStatus();
      }
    };
    
    init();
    
    return () => {
      mounted = false;
    };
  }, []);

  // Update step based on state
  useEffect(() => {
    let mounted = true;
    
    if (mounted) {
      if (!selectedPack) {
        setCurrentStep('select');
      } else if (!selectedPack.derivatives) {
        setCurrentStep('generate');
      } else {
        setCurrentStep('preview');
      }
    }
    
    return () => {
      mounted = false;
    };
  }, [selectedPack]);

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
    if (!selectedPack) {
      showToast.error('Please select a content pack first');
      return;
    }

    setIsGenerating(true);
    const toastId = showToast.loading('✨ Generating multi-platform content...');

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 60000); // 60s for AI generation
      
      const response = await fetch('http://localhost:3001/api/packs/derivatives', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pack_id: selectedPack.pack_id }),
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
        
        // Update selected pack with new derivatives
        setSelectedPack({
          ...selectedPack,
          derivatives: data.data.derivatives,
        });
        
        // Refresh packs list
        await fetchPacks();
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
    if (pack.derivatives) {
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
    const steps: WorkflowStep[] = ['select', 'generate', 'preview', 'configure', 'publish'];
    return steps.indexOf(currentStep) + 1;
  };

  const getTotalSteps = () => 5;

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
                  {currentStep === 'select' && 'Select Content'}
                  {currentStep === 'generate' && 'Generate Derivatives'}
                  {currentStep === 'preview' && 'Preview Content'}
                  {currentStep === 'configure' && 'Configure Integrations'}
                  {currentStep === 'publish' && 'Publish'}
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
                        Choose a content pack to generate multi-platform versions
                      </p>
                    </div>
                  </div>

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
                </motion.div>
              )}

              {/* Step 2: Generate Derivatives */}
              {currentStep === 'generate' && selectedPack && (
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

                  {selectedPack.draft_content && (
                    <div className="mb-6 p-4 bg-midnight-800 rounded-xl border border-midnight-700">
                      <p className="text-sm text-midnight-400 mb-2">Source Content:</p>
                      <p className="text-white text-sm line-clamp-3">{selectedPack.draft_content}</p>
                    </div>
                  )}

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
              {currentStep === 'preview' && selectedPack && (
                <motion.div
                  key="preview"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-6"
                >
                  {selectedPack.derivatives ? (
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
                          derivatives={selectedPack.derivatives}
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
                          packId={selectedPack.pack_id}
                          hasDerivatives={!!selectedPack.derivatives}
                        />
                      </motion.div>
                    </>
                  ) : (
                    <DerivativesEmptyState onGenerate={generateDerivatives} />
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Right Sidebar */}
          <div className="space-y-6">
            {/* Content Stats */}
            {selectedPack && (
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
                    <span className="text-sm text-midnight-400">Word Count</span>
                    <span className="text-white font-medium">{selectedPack.word_count}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-midnight-400">Status</span>
                    <span className="px-2 py-1 bg-blue-500/20 text-blue-400 text-xs rounded-lg">
                      {selectedPack.status}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-midnight-400">Derivatives</span>
                    <span className={`px-2 py-1 text-xs rounded-lg ${
                      selectedPack.derivatives
                        ? 'bg-emerald-500/20 text-emerald-400'
                        : 'bg-amber-500/20 text-amber-400'
                    }`}>
                      {selectedPack.derivatives ? 'Ready' : 'Not Generated'}
                    </span>
                  </div>
                </div>
              </motion.div>
            )}

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

                <MailchimpAuthCard onSaveSuccess={checkIntegrationStatus} />
                
                {/* WordPress Card - Click to open modal */}
                <div 
                  onClick={() => setIsWordPressModalOpen(true)}
                  className="cursor-pointer rounded-xl border border-blue-500/20 bg-gradient-to-br from-blue-500/5 to-cyan-500/5 p-6 backdrop-blur-sm transition-all hover:border-blue-500/40 hover:shadow-lg hover:shadow-blue-500/20"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 p-2">
                        <Globe className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-white">WordPress Integration</h3>
                        <p className="text-sm text-gray-400">Blog post publishing</p>
                      </div>
                    </div>
                    {wordpressConnected ? (
                      <CheckCircle2 className="h-6 w-6 text-green-500" />
                    ) : (
                      <AlertCircle className="h-6 w-6 text-amber-500" />
                    )}
                  </div>
                  <div className="mt-4 flex items-center justify-between rounded-lg bg-gray-900/50 p-3">
                    <span className="text-sm text-gray-400">Click to configure</span>
                    <Settings className="h-4 w-4 text-gray-400" />
                  </div>
                </div>
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

