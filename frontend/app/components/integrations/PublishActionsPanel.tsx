'use client';

import { useState } from 'react';
import { Mail, Globe, Loader2, Send, ExternalLink, CheckCircle2 } from 'lucide-react';
import { showToast } from '@/lib/toast';
import { motion } from 'framer-motion';

interface PublishActionsPanelProps {
  packId: string;
  hasDerivatives?: boolean;
}

export function PublishActionsPanel({ packId, hasDerivatives = false }: PublishActionsPanelProps) {
  const [isPublishingMailchimp, setIsPublishingMailchimp] = useState(false);
  const [isPublishingWordpress, setIsPublishingWordpress] = useState(false);
  const [mailchimpResult, setMailchimpResult] = useState<{ campaignId?: string; sent?: boolean } | null>(null);
  const [wordpressResult, setWordpressResult] = useState<{ url?: string; postId?: number } | null>(null);

  const handlePublishMailchimp = async () => {
    if (!hasDerivatives) {
      showToast.warning('No derivatives available. Please generate derivatives first.');
      return;
    }

    setIsPublishingMailchimp(true);
    const toastId = showToast.loading('Publishing to Mailchimp...');

    try {
      const response = await fetch('http://localhost:3001/api/integrations/mailchimp/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pack_id: packId }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error?.message || errorData.error?.details || `HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      if (data.success) {
        showToast.dismiss(toastId);
        showToast.success('🎉 Mailchimp campaign sent successfully!');
        setMailchimpResult({
          campaignId: data.campaignId,
          sent: data.sent,
        });
      } else {
        throw new Error(data.error?.message || data.error?.details || 'Failed to publish');
      }
    } catch (error: any) {
      showToast.dismiss(toastId);

      // Handle specific errors
      let errorMsg = error.message || 'Failed to publish to Mailchimp';
      
      if (errorMsg.includes('Failed to fetch') || errorMsg.includes('NetworkError') || errorMsg.includes('ECONNREFUSED')) {
        errorMsg = 'Cannot connect to backend server. Please make sure backend is running on port 3001.';
      } else if (errorMsg.includes('Missing credentials') || errorMsg.includes('credentials')) {
        errorMsg = 'Please configure Mailchimp credentials first';
      } else if (errorMsg.includes('No derivatives')) {
        errorMsg = 'No email derivative available';
      }
      
      showToast.error(errorMsg);
      console.error('Mailchimp publish error:', error);
    } finally {
      setIsPublishingMailchimp(false);
    }
  };

  const handlePublishWordpress = async () => {
    if (!hasDerivatives) {
      showToast.warning('No derivatives available. Please generate derivatives first.');
      return;
    }

    setIsPublishingWordpress(true);
    const toastId = showToast.loading('Publishing to WordPress...');

    try {
      const response = await fetch('http://localhost:3001/api/integrations/wordpress/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pack_id: packId }),
      });

      const data = await response.json();

      if (data.success) {
        showToast.dismiss(toastId);
        showToast.success('✅ Published to WordPress successfully!');
        setWordpressResult({
          url: data.url,
          postId: data.postId,
        });
      } else {
        throw new Error(data.error?.message || data.error?.details || 'Failed to publish');
      }
    } catch (error: any) {
      showToast.dismiss(toastId);

      // Handle specific errors
      const errorMsg = error.message || 'Failed to publish to WordPress';
      if (errorMsg.includes('Missing credentials') || errorMsg.includes('credentials')) {
        showToast.error('Please configure WordPress credentials first');
      } else if (errorMsg.includes('No derivatives')) {
        showToast.error('No blog derivatives available');
      } else {
        showToast.error(errorMsg);
      }

      console.error('WordPress publish error:', error);
    } finally {
      setIsPublishingWordpress(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card rounded-2xl p-6"
    >
      {/* Header */}
      <div className="mb-6">
        <h3 className="font-semibold text-white text-lg mb-2 flex items-center gap-2">
          <Send className="w-5 h-5 text-purple-400" />
          Publish Derivatives
        </h3>
        <p className="text-sm text-midnight-400">
          Publish your AI-generated content to multiple platforms
        </p>
      </div>

      {/* Publish Cards */}
      <div className="space-y-4">
        {/* Mailchimp Card */}
        <div className="p-4 bg-midnight-800 rounded-xl border border-midnight-700 hover:border-amber-500/30 transition-all">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-500/20 rounded-lg">
                <Mail className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <h4 className="font-medium text-white">Mailchimp</h4>
                <p className="text-xs text-midnight-400">Email newsletter campaign</p>
              </div>
            </div>
            {mailchimpResult?.sent && (
              <div className="flex items-center gap-1.5 px-2 py-1 bg-emerald-500/20 rounded-lg">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-xs text-emerald-400 font-medium">Sent</span>
              </div>
            )}
          </div>

          <p className="text-sm text-midnight-300 mb-4">
            Will use <strong className="text-amber-400">email newsletter</strong> derivative
          </p>

          <button
            onClick={handlePublishMailchimp}
            disabled={isPublishingMailchimp || !hasDerivatives}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 disabled:from-midnight-700 disabled:to-midnight-700 disabled:text-midnight-500 disabled:cursor-not-allowed text-white rounded-xl font-medium transition-all"
          >
            {isPublishingMailchimp ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Publishing...</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>Publish to Mailchimp</span>
              </>
            )}
          </button>

          {mailchimpResult && (
            <div className="mt-3 p-3 bg-emerald-500/10 rounded-lg border border-emerald-500/20">
              <p className="text-xs text-emerald-400">
                ✓ Campaign sent (ID: {mailchimpResult.campaignId?.substring(0, 8)}...)
              </p>
            </div>
          )}
        </div>

        {/* WordPress Card */}
        <div className="p-4 bg-midnight-800 rounded-xl border border-midnight-700 hover:border-blue-500/30 transition-all">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/20 rounded-lg">
                <Globe className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <h4 className="font-medium text-white">WordPress</h4>
                <p className="text-xs text-midnight-400">Blog post (draft)</p>
              </div>
            </div>
            {wordpressResult?.url && (
              <div className="flex items-center gap-1.5 px-2 py-1 bg-emerald-500/20 rounded-lg">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-xs text-emerald-400 font-medium">Created</span>
              </div>
            )}
          </div>

          <p className="text-sm text-midnight-300 mb-4">
            Will use <strong className="text-blue-400">blog summary</strong> + <strong className="text-purple-400">SEO meta</strong>
          </p>

          <button
            onClick={handlePublishWordpress}
            disabled={isPublishingWordpress || !hasDerivatives}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:from-midnight-700 disabled:to-midnight-700 disabled:text-midnight-500 disabled:cursor-not-allowed text-white rounded-xl font-medium transition-all"
          >
            {isPublishingWordpress ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Publishing...</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>Publish to WordPress</span>
              </>
            )}
          </button>

          {wordpressResult?.url && (
            <div className="mt-3 p-3 bg-emerald-500/10 rounded-lg border border-emerald-500/20">
              <div className="flex items-center justify-between">
                <p className="text-xs text-emerald-400">
                  ✓ Post created (ID: {wordpressResult.postId})
                </p>
                <a
                  href={wordpressResult.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 transition-colors"
                >
                  <span>View</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Status Message */}
      {!hasDerivatives && (
        <div className="mt-4 p-3 bg-amber-500/10 rounded-xl border border-amber-500/20">
          <p className="text-xs text-amber-400">
            ⚠️ Generate derivatives first before publishing
          </p>
        </div>
      )}
    </motion.div>
  );
}
