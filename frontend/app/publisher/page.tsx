'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { showToast } from '@/lib/toast';
import {
  Rocket,
  FileText,
  Settings,
  History,
  Search,
  Send,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Mail,
  BookOpen,
  Facebook,
  Twitter,
  Linkedin,
  Instagram,
  MessageCircle,
  TestTube2,
  Edit2,
  Link2Off,
  Clock,
  Trash2,
  ExternalLink,
} from 'lucide-react';
import { WordPressConfigModal } from '../components/integrations/WordPressConfigModal';
import { MailchimpAuthCard } from '../components/integrations/MailchimpAuthCard';
import FacebookConfigModal from '../components/integrations/FacebookConfigModal';

interface ApprovedContent {
  content_id: number;
  title?: string;
  brief_title?: string;
  body?: string | null;           // Main content field in DB
  draft_content?: string | null;   // Legacy field
  final_content?: string | null;   // Legacy field
  word_count: number;
  status?: string;
  format?: string;
  created_at: string;
  derivatives: any | null;
}

interface PlatformConfig {
  key: string;
  name: string;
  icon: any;
  color: string;
  connected: boolean;
}

type TabType = 'content' | 'integrations' | 'history';

export default function PublisherPageDemo() {
  const [activeTab, setActiveTab] = useState<TabType>('content');
  const [contents, setContents] = useState<ApprovedContent[]>([]);
  const [selectedContent, setSelectedContent] = useState<ApprovedContent | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isPublishing, setIsPublishing] = useState(false);
  
  // Modal states
  const [isWordPressModalOpen, setIsWordPressModalOpen] = useState(false);
  const [isMailchimpModalOpen, setIsMailchimpModalOpen] = useState(false);
  const [isFacebookModalOpen, setIsFacebookModalOpen] = useState(false);
  
  // Publishing history - load from localStorage on init
  const [publishHistory, setPublishHistory] = useState<Array<{
    id: string;
    platform: string;
    contentTitle: string;
    timestamp: string;
    success: boolean;
    details?: any;
  }>>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('publishHistory');
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  });
  
  // Persist history to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined' && publishHistory.length > 0) {
      localStorage.setItem('publishHistory', JSON.stringify(publishHistory.slice(0, 50))); // Keep last 50
    }
  }, [publishHistory]);

  // Platform selection
  const [selectedPlatforms, setSelectedPlatforms] = useState<Record<string, boolean>>({
    mailchimp: false,
    wordpress: false,
    facebook: false,
    twitter: false,
    linkedin: false,
    instagram: false,
    zalo: false,
  });

  // Platform configs
  const [platforms, setPlatforms] = useState<PlatformConfig[]>([
    { key: 'mailchimp', name: 'Mailchimp', icon: Mail, color: 'text-amber-400', connected: false },
    { key: 'wordpress', name: 'WordPress', icon: BookOpen, color: 'text-blue-400', connected: false },
    { key: 'facebook', name: 'Facebook', icon: Facebook, color: 'text-[#1877F2]', connected: false },
    { key: 'twitter', name: 'Twitter', icon: Twitter, color: 'text-[#1DA1F2]', connected: false },
    { key: 'linkedin', name: 'LinkedIn', icon: Linkedin, color: 'text-[#0A66C2]', connected: false },
    { key: 'instagram', name: 'Instagram', icon: Instagram, color: 'text-[#E4405F]', connected: false },
    { key: 'zalo', name: 'Zalo', icon: MessageCircle, color: 'text-[#0068FF]', connected: false },
  ]);

  useEffect(() => {
    fetchContents();
    checkPlatformConnections();
  }, []);

  const fetchContents = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/contents');
      const data = await response.json();
      if (data.success) {
        // Normalize content_id field (backend might return 'id' or 'content_id')
        const normalized = data.data.map((c: any) => ({
          ...c,
          content_id: c.content_id || c.id,
        }));
        // Filter for contents that have text (check body, final_content, or draft_content)
        const filtered = normalized.filter((c: ApprovedContent) => 
          c.body || c.final_content || c.draft_content
        );
        console.log('✅ Publisher: Loaded approved content:', filtered.length, 'items');
        console.log('📋 Content sample:', filtered.slice(0, 2));
        setContents(filtered);
      }
    } catch (error) {
      console.error('❌ Failed to load content:', error);
      showToast.error('Failed to load approved content');
    } finally {
      setIsLoading(false);
    }
  };

  const checkPlatformConnections = async () => {
    try {
      // Check Mailchimp
      const mailchimpRes = await fetch('http://localhost:3001/api/integrations/mailchimp');
      const mailchimpData = await mailchimpRes.json();
      
      // Check Facebook
      const facebookRes = await fetch('http://localhost:3001/api/integrations/facebook');
      const facebookData = await facebookRes.json();
      
      console.log('📊 Mailchimp status:', mailchimpData);
      console.log('📊 Facebook status:', facebookData);
      
      // Update platform statuses
      setPlatforms(prev => prev.map(platform => {
        if (platform.key === 'mailchimp') {
          return { ...platform, connected: mailchimpData.success && !!mailchimpData.data };
        }
        if (platform.key === 'facebook') {
          return { ...platform, connected: facebookData.success && facebookData.status?.connected === true };
        }
        return platform;
      }));
      
      console.log('✅ Platform connections checked');
    } catch (error) {
      console.error('❌ Failed to check platform connections:', error);
    }
  };

  const handlePublish = async () => {
    if (!selectedContent) {
      showToast.warning('Please select content first');
      return;
    }

    const selectedPlatformKeys = Object.keys(selectedPlatforms).filter(k => selectedPlatforms[k]);
    if (selectedPlatformKeys.length === 0) {
      showToast.warning('Please select at least one platform');
      return;
    }

    setIsPublishing(true);
    const toastId = showToast.loading(`Publishing to ${selectedPlatformKeys.length} platform(s)...`);
    
    const results: any[] = [];

    // Publish to each platform
    for (const platformKey of selectedPlatformKeys) {
      const platform = platforms.find(p => p.key === platformKey);
      if (!platform) continue;

      try {
        const response = await fetch(`http://localhost:3001/api/integrations/${platformKey}/publish`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ content_id: selectedContent.content_id }),
        });

        const result = await response.json();
        
        if (result.success) {
          results.push({
            platform: platform.name,
            success: true,
            details: result,
          });
          
          // Add to history
          const historyEntry = {
            id: `${Date.now()}-${platformKey}`,
            platform: platform.name,
            contentTitle: selectedContent.title || selectedContent.brief_title || 'Untitled',
            timestamp: new Date().toISOString(),
            success: true,
            details: result,
          };
          setPublishHistory(prev => [historyEntry, ...prev]);
          
        } else {
          results.push({
            platform: platform.name,
            success: false,
            error: result.error?.message || result.error || result.message || 'Unknown error',
          });
          
          // Add failure to history
          setPublishHistory(prev => [{
            id: `${Date.now()}-${platformKey}`,
            platform: platform.name,
            contentTitle: selectedContent.title || selectedContent.brief_title || 'Untitled',
            timestamp: new Date().toISOString(),
            success: false,
            details: { error: result.error },
          }, ...prev]);
        }
      } catch (error: any) {
        results.push({
          platform: platform.name,
          success: false,
          error: error.message,
        });
        
        setPublishHistory(prev => [{
          id: `${Date.now()}-${platformKey}`,
          platform: platform.name,
          contentTitle: selectedContent.title || selectedContent.brief_title || 'Untitled',
          timestamp: new Date().toISOString(),
          success: false,
          details: { error: error.message },
        }, ...prev]);
      }
    }

    setIsPublishing(false);
    showToast.dismiss(toastId);

    // Show results
    const successCount = results.filter(r => r.success).length;
    const failCount = results.filter(r => !r.success).length;

    if (successCount > 0 && failCount === 0) {
      showToast.success(`✅ Published to ${successCount} platform(s) successfully!`);
    } else if (successCount > 0 && failCount > 0) {
      showToast.warning(`⚠️ Published to ${successCount} platform(s), ${failCount} failed`);
    } else {
      showToast.error(`❌ Failed to publish to all platforms`);
    }

    // Show detailed results
    results.forEach((result, index) => {
      setTimeout(() => {
        if (result.success) {
          showToast.success(`${result.platform}: Published successfully${result.details?.id ? ` (ID: ${result.details.id})` : ''}`);
        } else {
          showToast.error(`${result.platform}: ${result.error}`);
        }
      }, (index + 1) * 500);
    });
  };

  const filteredContents = contents.filter(c => {
    const title = c.title || c.brief_title || '';
    return title.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const selectedCount = Object.values(selectedPlatforms).filter(Boolean).length;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-midnight-900 via-midnight-800 to-midnight-900 flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-purple-400" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-midnight-900 via-midnight-800 to-midnight-900">
      {/* Header */}
      <div className="border-b border-white/10 bg-white/5 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-2xl">
              <Rocket className="w-6 h-6 text-purple-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Multi-platform Publisher</h1>
              <p className="text-sm text-midnight-400">Publish approved content to all your platforms</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-midnight-700 bg-midnight-900/50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('content')}
              className={`flex items-center gap-2 px-6 py-4 font-medium transition-all relative ${
                activeTab === 'content'
                  ? 'text-white'
                  : 'text-midnight-400 hover:text-white'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>Content</span>
              {activeTab === 'content' && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-purple-500 to-pink-500"
                />
              )}
            </button>

            <button
              onClick={() => setActiveTab('integrations')}
              className={`flex items-center gap-2 px-6 py-4 font-medium transition-all relative ${
                activeTab === 'integrations'
                  ? 'text-white'
                  : 'text-midnight-400 hover:text-white'
              }`}
            >
              <Settings className="w-4 h-4" />
              <span>Integrations</span>
              {activeTab === 'integrations' && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-purple-500 to-pink-500"
                />
              )}
            </button>

            <button
              onClick={() => setActiveTab('history')}
              className={`flex items-center gap-2 px-6 py-4 font-medium transition-all relative ${
                activeTab === 'history'
                  ? 'text-white'
                  : 'text-midnight-400 hover:text-white'
              }`}
            >
              <History className="w-4 h-4" />
              <span>History</span>
              {activeTab === 'history' && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-purple-500 to-pink-500"
                />
              )}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* TAB 1: CONTENT */}
        {activeTab === 'content' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left: Select Content */}
            <div className="glass-card rounded-2xl p-6">
              <h2 className="text-xl font-semibold text-white mb-4">Select Approved Content</h2>

              {/* Search */}
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-midnight-500" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search content..."
                  className="w-full pl-10 pr-4 py-2.5 bg-midnight-800 border border-midnight-700 rounded-lg text-white placeholder-midnight-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              {/* Content List */}
              <div className="space-y-2 max-h-[500px] overflow-y-auto">
                {isLoading ? (
                  <div className="text-center py-12">
                    <Loader2 className="w-12 h-12 text-purple-400 mx-auto mb-3 animate-spin" />
                    <p className="text-midnight-400 text-sm">Loading content...</p>
                  </div>
                ) : filteredContents.length === 0 ? (
                  <div className="text-center py-12">
                    <FileText className="w-12 h-12 text-midnight-600 mx-auto mb-3" />
                    <p className="text-midnight-400 text-sm">
                      {contents.length === 0 
                        ? 'No approved content available. Please approve content in Library first.' 
                        : 'No content matches your search.'}
                    </p>
                  </div>
                ) : (
                  filteredContents.map((content) => (
                    <button
                      key={content.content_id}
                      onClick={() => setSelectedContent(content)}
                      className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                        selectedContent?.content_id === content.content_id
                          ? 'border-purple-500 bg-purple-500/10'
                          : 'border-midnight-700 bg-midnight-800/50 hover:border-midnight-600'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-medium text-white text-sm">
                          {content.title || content.brief_title || 'Untitled'}
                        </h3>
                        {selectedContent?.content_id === content.content_id && (
                          <CheckCircle2 className="w-4 h-4 text-purple-400 flex-shrink-0" />
                        )}
                      </div>
                      <p className="text-xs text-midnight-400">
                        {content.word_count} words • {new Date(content.created_at).toLocaleDateString()}
                      </p>
                    </button>
                  ))
                )}
              </div>
            </div>

            {/* Right: Select Platforms */}
            <div className="glass-card rounded-2xl p-6">
              <h2 className="text-xl font-semibold text-white mb-4">
                Select Platforms ({selectedCount} selected)
              </h2>

              <div className="space-y-2 mb-6">
                {platforms.map((platform) => {
                  const Icon = platform.icon;
                  return (
                    <div
                      key={platform.key}
                      className="flex items-center justify-between p-4 bg-midnight-800/50 rounded-lg border border-midnight-700"
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={selectedPlatforms[platform.key]}
                          onChange={(e) =>
                            setSelectedPlatforms({
                              ...selectedPlatforms,
                              [platform.key]: e.target.checked,
                            })
                          }
                          disabled={!platform.connected}
                          className="w-5 h-5 rounded border-midnight-600 text-purple-600 focus:ring-purple-500 disabled:opacity-50"
                        />
                        <Icon className={`w-5 h-5 ${platform.color}`} />
                        <span className="text-white font-medium">{platform.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {platform.connected ? (
                          <span className="text-xs text-emerald-400 flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" />
                            Connected
                          </span>
                        ) : (
                          <span className="text-xs text-amber-400 flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" />
                            Not configured
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Publish Button */}
              <button
                onClick={handlePublish}
                disabled={!selectedContent || selectedCount === 0 || isPublishing}
                className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white rounded-xl font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isPublishing ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Publishing...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    <span>Publish to {selectedCount} Platform{selectedCount !== 1 ? 's' : ''}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* TAB 2: INTEGRATIONS */}
        {activeTab === 'integrations' && (
          <div className="glass-card rounded-2xl p-6">
            <h2 className="text-2xl font-semibold text-white mb-6">Platform Integrations</h2>

            <div className="space-y-6">
              {/* Email Marketing */}
              <div>
                <h3 className="text-sm font-semibold text-midnight-300 mb-3 flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  Email Marketing
                </h3>
                <div className="space-y-2">
                  {platforms.filter(p => p.key === 'mailchimp').map((platform) => {
                    const Icon = platform.icon;
                    return (
                      <div
                        key={platform.key}
                        className="flex items-center justify-between p-4 bg-midnight-800/50 rounded-lg border border-midnight-700"
                      >
                        <div className="flex items-center gap-3">
                          <Icon className={`w-6 h-6 ${platform.color}`} />
                          <div>
                            <p className="text-white font-medium">{platform.name}</p>
                            {platform.connected ? (
                              <p className="text-xs text-emerald-400 flex items-center gap-1 mt-0.5">
                                <CheckCircle2 className="w-3 h-3" />
                                Connected
                              </p>
                            ) : (
                              <p className="text-xs text-midnight-500 mt-0.5">Not configured</p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {platform.connected ? (
                            <>
                              <button 
                                onClick={async () => {
                                  const toastId = showToast.loading('Testing Mailchimp connection...');
                                  try {
                                    const response = await fetch('http://localhost:3001/api/integrations/mailchimp/test', {
                                      method: 'POST',
                                      headers: { 'Content-Type': 'application/json' },
                                      body: JSON.stringify({}),
                                    });
                                    const data = await response.json();
                                    showToast.dismiss(toastId);
                                    if (data.success) {
                                      showToast.success('✅ Mailchimp connection successful!');
                                    } else {
                                      showToast.error(`❌ Connection failed: ${data.error?.message || 'Unknown error'}`);
                                    }
                                  } catch (error: any) {
                                    showToast.dismiss(toastId);
                                    showToast.error(`❌ Test failed: ${error.message}`);
                                  }
                                }}
                                className="px-3 py-1.5 bg-midnight-700 hover:bg-midnight-600 text-white text-sm rounded-lg transition-colors flex items-center gap-1"
                              >
                                <TestTube2 className="w-3 h-3" />
                                Test
                              </button>
                              <button 
                                onClick={() => setIsMailchimpModalOpen(true)}
                                className="px-3 py-1.5 bg-midnight-700 hover:bg-midnight-600 text-white text-sm rounded-lg transition-colors flex items-center gap-1"
                              >
                                <Edit2 className="w-3 h-3" />
                                Edit
                              </button>
                              <button 
                                onClick={() => showToast.warning('Disconnect feature coming soon')}
                                className="px-3 py-1.5 bg-red-500/20 hover:bg-red-500/30 text-red-400 text-sm rounded-lg transition-colors flex items-center gap-1"
                              >
                                <Link2Off className="w-3 h-3" />
                                Disconnect
                              </button>
                            </>
                          ) : (
                            <button 
                              onClick={() => setIsMailchimpModalOpen(true)}
                              className="px-4 py-1.5 bg-purple-600 hover:bg-purple-500 text-white text-sm rounded-lg transition-colors"
                            >
                              Configure
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Blogging */}
              <div>
                <h3 className="text-sm font-semibold text-midnight-300 mb-3 flex items-center gap-2">
                  <BookOpen className="w-4 h-4" />
                  Blogging
                </h3>
                <div className="space-y-2">
                  {platforms.filter(p => p.key === 'wordpress').map((platform) => {
                    const Icon = platform.icon;
                    return (
                      <div
                        key={platform.key}
                        className="flex items-center justify-between p-4 bg-midnight-800/50 rounded-lg border border-midnight-700"
                      >
                        <div className="flex items-center gap-3">
                          <Icon className={`w-6 h-6 ${platform.color}`} />
                          <div>
                            <p className="text-white font-medium">{platform.name}</p>
                            <p className="text-xs text-midnight-500 mt-0.5">Not configured</p>
                          </div>
                        </div>
                        <button 
                          onClick={() => setIsWordPressModalOpen(true)}
                          className="px-4 py-1.5 bg-purple-600 hover:bg-purple-500 text-white text-sm rounded-lg transition-colors"
                        >
                          Configure
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Social Media */}
              <div>
                <h3 className="text-sm font-semibold text-midnight-300 mb-3 flex items-center gap-2">
                  Social Media
                </h3>
                <div className="space-y-2">
                  {platforms.filter(p => !['mailchimp', 'wordpress'].includes(p.key)).map((platform) => {
                    const Icon = platform.icon;
                    return (
                      <div
                        key={platform.key}
                        className="flex items-center justify-between p-4 bg-midnight-800/50 rounded-lg border border-midnight-700"
                      >
                        <div className="flex items-center gap-3">
                          <Icon className={`w-6 h-6 ${platform.color}`} />
                          <div>
                            <p className="text-white font-medium">{platform.name}</p>
                            {platform.connected ? (
                              <p className="text-xs text-emerald-400 flex items-center gap-1 mt-0.5">
                                <CheckCircle2 className="w-3 h-3" />
                                Connected
                              </p>
                            ) : (
                              <p className="text-xs text-midnight-500 mt-0.5">Not configured</p>
                            )}
                          </div>
                        </div>
                        {platform.connected ? (
                          <div className="flex items-center gap-2">
                            {platform.key === 'facebook' && (
                              <button
                                onClick={async () => {
                                  const toastId = showToast.loading('Testing Facebook connection...');
                                  try {
                                    const response = await fetch('http://localhost:3001/api/integrations/facebook/test', {
                                      method: 'POST',
                                      headers: { 'Content-Type': 'application/json' },
                                      body: JSON.stringify({}),
                                    });
                                    const data = await response.json();
                                    showToast.dismiss(toastId);
                                    if (data.success) {
                                      showToast.success('✅ Facebook connection successful!');
                                    } else {
                                      showToast.error(`❌ Connection failed: ${data.error?.message || 'Unknown error'}`);
                                    }
                                  } catch (error: any) {
                                    showToast.dismiss(toastId);
                                    showToast.error(`❌ Test failed: ${error.message}`);
                                  }
                                }}
                                className="px-3 py-1.5 bg-midnight-700 hover:bg-midnight-600 text-white text-sm rounded-lg transition-colors flex items-center gap-1"
                              >
                                <TestTube2 className="w-3 h-3" />
                                Test
                              </button>
                            )}
                            <button
                              onClick={() => {
                                if (platform.key === 'facebook') {
                                  setIsFacebookModalOpen(true);
                                } else {
                                  showToast.info(`${platform.name} configuration coming soon!`);
                                }
                              }}
                              className="px-3 py-1.5 bg-midnight-700 hover:bg-midnight-600 text-white text-sm rounded-lg transition-colors flex items-center gap-1"
                            >
                              <Settings className="w-3 h-3" />
                              Edit
                            </button>
                          </div>
                        ) : (
                          <button 
                            onClick={() => {
                              if (platform.key === 'facebook') {
                                setIsFacebookModalOpen(true);
                              } else {
                                showToast.info(`${platform.name} configuration coming soon!`);
                              }
                            }}
                            className="px-4 py-1.5 bg-purple-600 hover:bg-purple-500 text-white text-sm rounded-lg transition-colors"
                          >
                            Configure
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: HISTORY */}
        {activeTab === 'history' && (
          <div className="glass-card rounded-2xl p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-semibold text-white">Publishing History</h2>
                <p className="text-sm text-midnight-400 mt-1">
                  {publishHistory.length} publish record{publishHistory.length !== 1 ? 's' : ''}
                </p>
              </div>
              {publishHistory.length > 0 && (
                <button
                  onClick={() => {
                    if (confirm('Clear all publishing history?')) {
                      setPublishHistory([]);
                      localStorage.removeItem('publishHistory');
                    }
                  }}
                  className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 text-sm rounded-lg transition-colors flex items-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Clear History
                </button>
              )}
            </div>
            
            {publishHistory.length === 0 ? (
              <div className="text-center py-12">
                <History className="w-16 h-16 text-midnight-600 mx-auto mb-4" />
                <p className="text-midnight-400">No publishing history yet</p>
                <p className="text-sm text-midnight-500 mt-2">Published content will appear here</p>
              </div>
            ) : (
              <div className="space-y-3">
                {publishHistory.map((entry) => (
                  <motion.div
                    key={entry.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`p-4 rounded-lg border ${
                      entry.success 
                        ? 'bg-emerald-500/10 border-emerald-500/30' 
                        : 'bg-red-500/10 border-red-500/30'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          {entry.success ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                          ) : (
                            <AlertCircle className="w-4 h-4 text-red-400" />
                          )}
                          <span className={`font-medium ${entry.success ? 'text-emerald-400' : 'text-red-400'}`}>
                            {entry.platform}
                          </span>
                          <span className="text-midnight-500 text-xs">•</span>
                          <span className="text-white text-sm">{entry.contentTitle}</span>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-midnight-400 mt-2">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {new Date(entry.timestamp).toLocaleString()}
                          </span>
                          {entry.success && entry.details?.id && (
                            <span className="text-midnight-500">
                              ID: <span className="text-purple-400">{entry.details.id}</span>
                            </span>
                          )}
                          {entry.success && entry.details?.campaignId && (
                            <span className="text-midnight-500">
                              Campaign: <span className="text-purple-400">{entry.details.campaignId}</span>
                            </span>
                          )}
                          {entry.success && entry.details?.postId && (
                            <a
                              href={`https://facebook.com/${entry.details.postId.replace('_', '/posts/')}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-1 text-purple-400 hover:text-purple-300 transition-colors"
                            >
                              <ExternalLink className="w-3 h-3" />
                              View Post
                            </a>
                          )}
                        </div>
                        {!entry.success && entry.details?.error && (
                          <p className="text-xs text-red-400 mt-2">
                            Error: {entry.details.error.message || JSON.stringify(entry.details.error)}
                          </p>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* Modals */}
      {isWordPressModalOpen && (
        <WordPressConfigModal
          isOpen={isWordPressModalOpen}
          onClose={() => setIsWordPressModalOpen(false)}
          onSaveSuccess={() => {
            showToast.success('WordPress configured successfully!');
            setIsWordPressModalOpen(false);
          }}
        />
      )}

      {/* Facebook Config Modal */}
      {isFacebookModalOpen && (
        <FacebookConfigModal
          isOpen={isFacebookModalOpen}
          onClose={() => setIsFacebookModalOpen(false)}
          onSaveSuccess={() => {
            showToast.success('✅ Facebook configured successfully!');
            setIsFacebookModalOpen(false);
            // Refresh platform connection status
            checkPlatformConnections();
          }}
        />
      )}
      
      {isMailchimpModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-midnight-900 rounded-2xl p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">Mailchimp Configuration</h2>
              <button
                onClick={() => setIsMailchimpModalOpen(false)}
                className="text-midnight-400 hover:text-white transition-colors"
              >
                ✕
              </button>
            </div>
            <MailchimpAuthCard onSaveSuccess={() => {
              showToast.success('Mailchimp configured successfully!');
              setIsMailchimpModalOpen(false);
            }} />
          </motion.div>
        </div>
      )}
    </div>
  );
}

