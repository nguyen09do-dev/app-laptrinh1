'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { showToast } from '@/lib/toast';
import {
  DerivativesEmptyState,
  ContentDerivatives,
} from '../components/derivatives';
import { PLATFORMS_BY_CATEGORY, PlatformConfig } from '@/app/lib/platforms';
import {
  WordPressConfigModal,
  SocialPlatformConfigModal,
} from '../components/integrations';
import { getPlatformConfig } from '@/app/lib/platformConfigs';
import { StepHeader, ContentGrid, PlatformTabs } from '../components/publisher';
import {
  Rocket,
  Package,
  FileText,
  Zap,
  Sparkles,
  Loader2,
} from 'lucide-react';

interface ContentPack {
  pack_id: number;
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

interface ContentItem {
  pack_id?: number;
  content_id?: number;
  title?: string;
  brief_title?: string;
  draft_content: string | null;
  final_content?: string | null;
  word_count: number;
  created_at: string;
  derivatives: any | null;
}

type ContentSource = 'packs' | 'library';
type WorkflowStep = 'select' | 'generate' | 'publish';
type PlatformCategory = 'email' | 'blog' | 'social';

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
  const [isWordPressModalOpen, setIsWordPressModalOpen] = useState(false);
  const [socialPlatformModal, setSocialPlatformModal] = useState<{ isOpen: boolean; platform: PlatformConfig | null }>({
    isOpen: false,
    platform: null,
  });
  const [activeTab, setActiveTab] = useState<PlatformCategory>('email');
  const [publishingPlatforms, setPublishingPlatforms] = useState<Record<string, boolean>>({});
  const [publishResults, setPublishResults] = useState<Record<string, { success: boolean; message?: string }>>({});

  // Fetch content on mount and when source changes
  useEffect(() => {
    let mounted = true;
    
    const loadContent = async () => {
      setIsLoading(true);
      if (contentSource === 'packs') {
        await fetchPacks();
      } else {
        await fetchLibraryContents();
      }
      if (mounted) {
        await checkIntegrationStatus();
      }
    };

    loadContent();

    return () => {
      mounted = false;
    };
  }, [contentSource]);

  const fetchPacks = async () => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);
      
      const response = await fetch('http://localhost:3001/api/packs', {
        signal: controller.signal,
        headers: { 'Content-Type': 'application/json' },
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) throw new Error(`Server returned ${response.status}`);
      
      const data = await response.json();
      if (data.success) {
        const packsWithContent = data.data.filter((p: ContentPack) => p.draft_content);
        setPacks(packsWithContent);
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
      const timeoutId = setTimeout(() => controller.abort(), 10000);
      
      const response = await fetch('http://localhost:3001/api/contents', {
        signal: controller.signal,
        headers: { 'Content-Type': 'application/json' },
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) throw new Error(`Server returned ${response.status}`);
      
      const data = await response.json();
      if (data.success) {
        const contentsWithText = data.data.filter((c: LibraryContent) => c.final_content || c.draft_content);
        setLibraryContents(contentsWithText);
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
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 5000);
      
      const mcRes = await fetch('http://localhost:3001/api/integrations/mailchimp/test', {
        signal: controller.signal,
      });
      clearTimeout(timeout);
      
      const mcData = await mcRes.json();
      setMailchimpConnected(mcData.success || false);

      const controller2 = new AbortController();
      const timeout2 = setTimeout(() => controller2.abort(), 5000);
      
      const wpRes = await fetch('http://localhost:3001/api/integrations/wordpress/test', {
        signal: controller2.signal,
      });
      clearTimeout(timeout2);
      
      const wpData = await wpRes.json();
      setWordpressConnected(wpData.success || false);
    } catch {
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
      const timeoutId = setTimeout(() => controller.abort(), 60000);
      
      const endpoint = contentSource === 'packs' 
        ? 'http://localhost:3001/api/packs/derivatives'
        : 'http://localhost:3001/api/contents/derivatives';
      
      const bodyKey = contentSource === 'packs' ? 'pack_id' : 'content_id';
      const bodyValue: number = contentSource === 'packs'
        ? (selected as ContentPack).pack_id
        : (selected as LibraryContent).content_id;
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [bodyKey]: bodyValue }),
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) throw new Error(`Server returned ${response.status}`);
      
      const data = await response.json();

      if (data.success && data.derivatives) {
        showToast.dismiss(toastId);
        showToast.success('✨ Derivatives generated successfully!');
        
        if (contentSource === 'packs') {
          setSelectedPack({ ...selectedPack!, derivatives: data.derivatives });
          setPacks(packs.map(p => 
            p.pack_id === selectedPack!.pack_id 
              ? { ...p, derivatives: data.derivatives }
              : p
          ));
        } else {
          setSelectedLibraryContent({ ...selectedLibraryContent!, derivatives: data.derivatives });
          setLibraryContents(libraryContents.map(c =>
            c.content_id === selectedLibraryContent!.content_id
              ? { ...c, derivatives: data.derivatives }
              : c
          ));
        }
        
        setCurrentStep('publish');
      } else {
        throw new Error(data.error || 'Failed to generate derivatives');
      }
    } catch (error: any) {
      showToast.dismiss(toastId);
      showToast.error(error.message || 'Failed to generate derivatives');
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePlatformPublish = async (platform: PlatformConfig) => {
    const selected = contentSource === 'packs' ? selectedPack : selectedLibraryContent;
    if (!selected || !selected.derivatives) {
      showToast.warning('No derivatives available. Please generate derivatives first.');
      return;
    }

    if (platform.requiresConfig) {
      if (platform.key === 'mailchimp' && !mailchimpConnected) {
        showToast.warning('Please configure Mailchimp first');
        return;
      }
      if (platform.key === 'wordpress' && !wordpressConnected) {
        showToast.warning('Please configure WordPress first');
        return;
      }
    }

    setPublishingPlatforms(prev => ({ ...prev, [platform.key]: true }));
    const toastId = showToast.loading(`Publishing to ${platform.name}...`);

    try {
      const bodyPayload: Record<string, number | undefined> = contentSource === 'packs' && selectedPack
        ? { pack_id: selectedPack.pack_id }
        : { content_id: selectedLibraryContent?.content_id };

      const platformEndpoints: Record<string, string> = {
        mailchimp: 'http://localhost:3001/api/integrations/mailchimp/publish',
        wordpress: 'http://localhost:3001/api/integrations/wordpress/publish',
        facebook: 'http://localhost:3001/api/integrations/facebook/publish',
        instagram: 'http://localhost:3001/api/integrations/instagram/publish',
        twitter: 'http://localhost:3001/api/integrations/twitter/publish',
        linkedin: 'http://localhost:3001/api/integrations/linkedin/publish',
        zalo: 'http://localhost:3001/api/integrations/zalo/publish',
      };

      const endpoint = platformEndpoints[platform.key];
      if (!endpoint) throw new Error('Platform not yet supported');

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bodyPayload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error?.message || errorData.error?.details || `HTTP ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        showToast.dismiss(toastId);
        showToast.success(`🎉 Published to ${platform.name} successfully!`);
        setPublishResults(prev => ({
          ...prev,
          [platform.key]: {
            success: true,
            message: `Campaign/Post ID: ${data.campaignId || data.postId || 'N/A'}`,
          },
        }));
      } else {
        throw new Error(data.error?.message || data.error?.details || 'Failed to publish');
      }
    } catch (error: any) {
      showToast.dismiss(toastId);
      showToast.error(error.message || `Failed to publish to ${platform.name}`);
      setPublishResults(prev => ({
        ...prev,
        [platform.key]: {
          success: false,
          message: error.message || 'Publish failed',
        },
      }));
    } finally {
      setPublishingPlatforms(prev => ({ ...prev, [platform.key]: false }));
    }
  };

  const goToNextStep = () => {
    const selected = contentSource === 'packs' ? selectedPack : selectedLibraryContent;
    
    if (currentStep === 'select' && selected) {
      if (selected.derivatives) {
        setCurrentStep('publish');
      } else {
        setCurrentStep('generate');
      }
    } else if (currentStep === 'generate' && selected?.derivatives) {
      setCurrentStep('publish');
    }
  };

  const goToPreviousStep = () => {
    if (currentStep === 'publish') {
      const selected = contentSource === 'packs' ? selectedPack : selectedLibraryContent;
      if (selected?.derivatives) {
        setCurrentStep('generate');
      } else {
        setCurrentStep('select');
      }
    } else if (currentStep === 'generate') {
      setCurrentStep('select');
    }
  };

  const getStepNumber = (): number => {
    if (currentStep === 'select') return 1;
    if (currentStep === 'generate') return 2;
    return 3;
  };

  const getTotalSteps = () => 3;

  const getStepTitle = (): string => {
    if (currentStep === 'select') return 'Select Content';
    if (currentStep === 'generate') return 'Generate Derivatives';
    return 'Publish Content';
  };

  const getStepDescription = (): string => {
    if (currentStep === 'select') return 'Choose the content you want to publish across platforms';
    if (currentStep === 'generate') return 'Generate platform-specific versions of your content';
    return 'Review and publish to your chosen platforms';
  };

  const handleContentSelect = (item: ContentItem) => {
    if (contentSource === 'packs') {
      setSelectedPack(item as ContentPack);
    } else {
      setSelectedLibraryContent(item as LibraryContent);
    }
  };

  const selected = contentSource === 'packs' ? selectedPack : selectedLibraryContent;
  const currentItems: ContentItem[] = contentSource === 'packs'
    ? packs.map(p => ({ ...p, pack_id: p.pack_id, content_id: undefined } as ContentItem))
    : libraryContents.map(c => ({ ...c, pack_id: undefined, content_id: c.content_id } as ContentItem));

  // Connection status for platforms
  const connectedPlatforms: Record<string, boolean> = {
    mailchimp: mailchimpConnected,
    wordpress: wordpressConnected,
  };

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
      {/* Simplified Header */}
      <div className="border-b border-white/10 bg-white/5 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-2xl">
              <Rocket className="w-6 h-6 text-purple-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Multi-platform Publisher</h1>
              <p className="text-sm text-midnight-400">
                Create and distribute content across all your platforms
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Main Wizard */}
        <AnimatePresence mode="wait">
          {/* Step 1: Select Content */}
          {currentStep === 'select' && (
            <motion.div
              key="select"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
              className="glass-card rounded-2xl p-8"
            >
              <StepHeader
                currentStep={getStepNumber()}
                totalSteps={getTotalSteps()}
                title={getStepTitle()}
                description={getStepDescription()}
                onNext={goToNextStep}
                nextLabel="Continue to Generate"
                nextDisabled={!selected}
                showBack={false}
              />

              {/* Content Source Selector */}
              <div className="flex gap-3 mb-6 p-1 bg-midnight-800 rounded-xl border border-midnight-700">
                <button
                  onClick={() => {
                    setContentSource('packs');
                    setSelectedPack(null);
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
                    setSelectedLibraryContent(null);
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

              {/* Content Grid with Search & Pagination */}
              <ContentGrid
                items={currentItems}
                selectedItem={selected}
                onSelect={handleContentSelect}
                searchPlaceholder={`Search ${contentSource === 'packs' ? 'content packs' : 'library'}...`}
                itemsPerPage={6}
              />
            </motion.div>
          )}

          {/* Step 2: Generate Derivatives */}
          {currentStep === 'generate' && selected && (
            <motion.div
              key="generate"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
              className="glass-card rounded-2xl p-8"
            >
              <StepHeader
                currentStep={getStepNumber()}
                totalSteps={getTotalSteps()}
                title={getStepTitle()}
                description={getStepDescription()}
                onBack={goToPreviousStep}
                onNext={goToNextStep}
                nextLabel="Continue to Publish"
                nextDisabled={!selected.derivatives}
              />

              {selected.derivatives ? (
                <div className="space-y-6">
                  <div className="p-6 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                    <div className="flex items-center gap-3 mb-3">
                      <Sparkles className="w-6 h-6 text-emerald-400" />
                      <h3 className="text-lg font-semibold text-white">Derivatives Ready</h3>
                    </div>
                    <p className="text-midnight-300 mb-4">
                      Your content has been optimized for multiple platforms. Click &quot;Continue&quot; to review and publish.
                    </p>
                    <button
                      onClick={generateDerivatives}
                      disabled={isGenerating}
                      className="px-4 py-2 bg-midnight-700 hover:bg-midnight-600 text-white rounded-lg transition-colors disabled:opacity-50 text-sm"
                    >
                      Regenerate Derivatives
                    </button>
                  </div>

                  {/* Preview snippets */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {['Email', 'Blog', 'Social'].map((cat) => (
                      <div key={cat} className="p-4 bg-midnight-800/50 border border-midnight-700 rounded-lg">
                        <h4 className="text-sm font-medium text-midnight-300 mb-2">{cat} Content</h4>
                        <p className="text-xs text-midnight-500">Ready to publish</p>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <button
                    onClick={generateDerivatives}
                    disabled={isGenerating}
                    className="flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white rounded-xl transition-all disabled:opacity-50 font-medium text-lg mx-auto"
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="w-6 h-6 animate-spin" />
                        <span>Generating...</span>
                      </>
                    ) : (
                      <>
                        <Zap className="w-6 h-6" />
                        <span>Generate Multi-platform Content</span>
                      </>
                    )}
                  </button>
                  <p className="text-sm text-midnight-500 mt-4">
                    This will create optimized versions for email, blog, and social media
                  </p>
                </div>
              )}
            </motion.div>
          )}

          {/* Step 3: Publish */}
          {currentStep === 'publish' && selected?.derivatives && (
            <motion.div
              key="publish"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
              className="glass-card rounded-2xl p-8"
            >
              <StepHeader
                currentStep={getStepNumber()}
                totalSteps={getTotalSteps()}
                title={getStepTitle()}
                description={getStepDescription()}
                onBack={goToPreviousStep}
                showNext={false}
              />

              {/* Platform Tabs */}
              <PlatformTabs
                activeTab={activeTab}
                onTabChange={setActiveTab}
                platforms={PLATFORMS_BY_CATEGORY}
                derivatives={selected.derivatives}
                connectedPlatforms={connectedPlatforms}
                publishingPlatforms={publishingPlatforms}
                publishResults={publishResults}
                onPublish={handlePlatformPublish}
                onConfigure={(platform) => {
                  if (platform.key === 'wordpress') {
                    setIsWordPressModalOpen(true);
                  } else {
                    setSocialPlatformModal({
                      isOpen: true,
                      platform: platform,
                    });
                  }
                }}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Modals */}
      <WordPressConfigModal
        isOpen={isWordPressModalOpen}
        onClose={() => setIsWordPressModalOpen(false)}
        onSaveSuccess={() => checkIntegrationStatus()}
      />

      {socialPlatformModal.platform && (
        <SocialPlatformConfigModal
          isOpen={socialPlatformModal.isOpen}
          onClose={() => setSocialPlatformModal({ isOpen: false, platform: null })}
          platformKey={socialPlatformModal.platform.key}
          platformName={socialPlatformModal.platform.name}
          icon={socialPlatformModal.platform.icon}
          color={socialPlatformModal.platform.color}
          fields={getPlatformConfig(socialPlatformModal.platform.key)?.fields || []}
          apiEndpoint={`http://localhost:3001/api/integrations/${socialPlatformModal.platform.key}`}
          docsUrl={getPlatformConfig(socialPlatformModal.platform.key)?.docsUrl}
        />
      )}
    </div>
  );
}




