'use client';

import { useState, useEffect } from 'react';
import { Mail, CheckCircle, AlertCircle, Loader2, Save, Eye, EyeOff, Info } from 'lucide-react';
import { showToast } from '@/lib/toast';
import { motion } from 'framer-motion';

interface MailchimpAuthCardProps {
  onSaveSuccess?: () => void;
}

export function MailchimpAuthCard({ onSaveSuccess }: MailchimpAuthCardProps) {
  // Form state
  const [apiKey, setApiKey] = useState('');
  const [serverPrefix, setServerPrefix] = useState('');
  const [audienceListId, setAudienceListId] = useState('');
  const [fromName, setFromName] = useState('');
  const [fromEmail, setFromEmail] = useState('');
  const [replyToEmail, setReplyToEmail] = useState('');
  
  // UI state
  const [showApiKey, setShowApiKey] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testStatus, setTestStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Auto-detect server prefix from API key
  useEffect(() => {
    if (apiKey && apiKey.includes('-') && !serverPrefix) {
      const parts = apiKey.split('-');
      if (parts.length >= 2) {
        const lastPart = parts[parts.length - 1];
        // Check if last part looks like a datacenter (e.g., us1, us12, eu1)
        if (/^[a-z]{2}\d+$/i.test(lastPart)) {
          setServerPrefix(lastPart.toLowerCase());
          // Also update API key to remove suffix
          const newApiKey = parts.slice(0, -1).join('-');
          setApiKey(newApiKey);
          showToast.info(`Auto-detected server prefix: ${lastPart.toLowerCase()}`);
        }
      }
    }
  }, [apiKey, serverPrefix]);

  // Validation
  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!apiKey.trim()) {
      newErrors.apiKey = 'API Key is required';
    } else if (apiKey.includes('-') && /[a-z]{2}\d+$/i.test(apiKey.split('-').pop() || '')) {
      newErrors.apiKey = 'API Key should NOT include datacenter suffix (e.g., -us12)';
    }

    if (!serverPrefix.trim()) {
      newErrors.serverPrefix = 'Server Prefix is required';
    } else if (!/^[a-z]{2}\d+$/i.test(serverPrefix.trim())) {
      newErrors.serverPrefix = 'Invalid format. Expected: us1, us12, eu1, etc.';
    }

    if (!audienceListId.trim()) {
      newErrors.audienceListId = 'Audience List ID is required';
    }

    if (!fromName.trim()) {
      newErrors.fromName = 'From Name is required';
    }

    if (!fromEmail.trim()) {
      newErrors.fromEmail = 'From Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fromEmail.trim())) {
      newErrors.fromEmail = 'Invalid email format';
    }

    if (!replyToEmail.trim()) {
      newErrors.replyToEmail = 'Reply-To Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(replyToEmail.trim())) {
      newErrors.replyToEmail = 'Invalid email format';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      showToast.warning('Please fix validation errors');
      return;
    }

    setIsSaving(true);
    const toastId = showToast.loading('Saving Mailchimp configuration...');

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000);

      const response = await fetch('http://localhost:3001/api/integrations/mailchimp/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          apiKey: apiKey.trim(),
          serverPrefix: serverPrefix.trim().toLowerCase(),
          audienceListId: audienceListId.trim(),
          fromName: fromName.trim(),
          fromEmail: fromEmail.trim(),
          replyToEmail: replyToEmail.trim(),
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error?.details?.join(', ') || errorData.error?.message || `HTTP ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        showToast.dismiss(toastId);
        
        if (data.warning) {
          showToast.warning(`Saved but connection test failed: ${data.warning}`);
          setTestStatus('error');
        } else {
          showToast.success('Mailchimp configuration saved and verified! ✅');
          setTestStatus('success');
        }
        
        onSaveSuccess?.();
      } else {
        throw new Error(data.error?.message || 'Failed to save');
      }
    } catch (error: any) {
      showToast.dismiss(toastId);
      
      if (error.name === 'AbortError') {
        showToast.error('Request timeout. Please check your connection.');
      } else if (error.message?.includes('Failed to fetch')) {
        showToast.error('Cannot connect to backend. Please ensure backend is running on port 3001.');
      } else {
        showToast.error(error.message || 'Failed to save Mailchimp configuration');
      }
      
      console.error('Save error:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleTest = async () => {
    setIsTesting(true);
    const toastId = showToast.loading('Testing Mailchimp connection...');

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 20000);

      const response = await fetch('http://localhost:3001/api/integrations/mailchimp/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: '{}',
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error?.details || errorData.error?.message || `HTTP ${response.status}`);
      }

      const data = await response.json();

      showToast.dismiss(toastId);

      if (data.success) {
        showToast.success('Mailchimp connection successful! ✅');
        setTestStatus('success');
      } else {
        throw new Error(data.error?.message || 'Connection failed');
      }
    } catch (error: any) {
      showToast.dismiss(toastId);
      setTestStatus('error');
      
      if (error.name === 'AbortError') {
        showToast.error('Connection timeout. Please check your settings.');
      } else if (error.message?.includes('Failed to fetch')) {
        showToast.error('Cannot connect to backend. Please ensure backend is running.');
      } else {
        showToast.error(error.message || 'Connection test failed');
      }
      
      console.error('Test error:', error);
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl border border-purple-500/20 bg-gradient-to-br from-purple-500/5 to-pink-500/5 p-6 backdrop-blur-sm"
    >
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 p-2">
            <Mail className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">Mailchimp Integration</h3>
            <p className="text-sm text-gray-400">Email newsletter publishing</p>
          </div>
        </div>
        {testStatus === 'success' && (
          <CheckCircle className="h-6 w-6 text-green-500" />
        )}
        {testStatus === 'error' && (
          <AlertCircle className="h-6 w-6 text-red-500" />
        )}
      </div>

      {/* Form */}
      <div className="space-y-4">
        {/* API Key */}
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-300">
            API Key <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <input
              type={showApiKey ? 'text' : 'password'}
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Enter your Mailchimp API key"
              className={`w-full rounded-lg border ${
                errors.apiKey ? 'border-red-500' : 'border-gray-700'
              } bg-gray-900/50 px-4 py-2.5 pr-10 text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50`}
            />
            <button
              type="button"
              onClick={() => setShowApiKey(!showApiKey)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300"
            >
              {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {errors.apiKey && (
            <p className="mt-1 text-xs text-red-500">{errors.apiKey}</p>
          )}
          <div className="mt-1 flex items-start gap-1.5 text-xs text-gray-500">
            <Info className="mt-0.5 h-3 w-3 flex-shrink-0" />
            <span>
              Get from: <span className="text-gray-400">Mailchimp Dashboard → Account → API Keys</span>
              <br />
              <span className="text-yellow-500">✅ Correct: dfxxxxxxxxxxxxxxxxxxxx</span>
              <br />
              <span className="text-red-500">❌ Wrong: dfxxxxxxxxxxxxxxxxxxxx-us12</span>
            </span>
          </div>
        </div>

        {/* Server Prefix */}
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-300">
            Server Prefix <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={serverPrefix}
            onChange={(e) => setServerPrefix(e.target.value.toLowerCase())}
            placeholder="e.g., us1, us21"
            className={`w-full rounded-lg border ${
              errors.serverPrefix ? 'border-red-500' : 'border-gray-700'
            } bg-gray-900/50 px-4 py-2.5 text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50`}
          />
          {errors.serverPrefix && (
            <p className="mt-1 text-xs text-red-500">{errors.serverPrefix}</p>
          )}
          <p className="mt-1 text-xs text-gray-500">
            Found in your API key (e.g., <span className="text-gray-400">abc123-<span className="text-green-500">us1</span></span>)
          </p>
        </div>

        {/* Audience List ID */}
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-300">
            Audience List ID <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={audienceListId}
            onChange={(e) => setAudienceListId(e.target.value)}
            placeholder="Enter your audience/list ID"
            className={`w-full rounded-lg border ${
              errors.audienceListId ? 'border-red-500' : 'border-gray-700'
            } bg-gray-900/50 px-4 py-2.5 text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50`}
          />
          {errors.audienceListId && (
            <p className="mt-1 text-xs text-red-500">{errors.audienceListId}</p>
          )}
          <p className="mt-1 text-xs text-gray-500">
            Get from: <span className="text-gray-400">Audience → Settings → Audience ID</span>
          </p>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-700 pt-4">
          <h4 className="mb-3 text-sm font-semibold text-gray-300">Email Defaults</h4>
        </div>

        {/* From Name */}
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-300">
            From Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={fromName}
            onChange={(e) => setFromName(e.target.value)}
            placeholder="e.g., Your Company Name"
            className={`w-full rounded-lg border ${
              errors.fromName ? 'border-red-500' : 'border-gray-700'
            } bg-gray-900/50 px-4 py-2.5 text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50`}
          />
          {errors.fromName && (
            <p className="mt-1 text-xs text-red-500">{errors.fromName}</p>
          )}
          <p className="mt-1 text-xs text-gray-500">
            This name will appear as the sender in recipients' inboxes
          </p>
        </div>

        {/* From Email */}
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-300">
            From Email <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            value={fromEmail}
            onChange={(e) => setFromEmail(e.target.value)}
            placeholder="e.g., hello@yourdomain.com"
            className={`w-full rounded-lg border ${
              errors.fromEmail ? 'border-red-500' : 'border-gray-700'
            } bg-gray-900/50 px-4 py-2.5 text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50`}
          />
          {errors.fromEmail && (
            <p className="mt-1 text-xs text-red-500">{errors.fromEmail}</p>
          )}
          <p className="mt-1 text-xs text-gray-500">
            Must be a verified email address in your Mailchimp account
          </p>
        </div>

        {/* Reply-To Email */}
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-300">
            Reply-To Email <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            value={replyToEmail}
            onChange={(e) => setReplyToEmail(e.target.value)}
            placeholder="e.g., support@yourdomain.com"
            className={`w-full rounded-lg border ${
              errors.replyToEmail ? 'border-red-500' : 'border-gray-700'
            } bg-gray-900/50 px-4 py-2.5 text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50`}
          />
          {errors.replyToEmail && (
            <p className="mt-1 text-xs text-red-500">{errors.replyToEmail}</p>
          )}
          <p className="mt-1 text-xs text-gray-500">
            Where replies will be sent when recipients respond
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="mt-6 flex gap-3">
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="flex-1 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 px-4 py-2.5 font-medium text-white transition-all hover:from-purple-500 hover:to-pink-500 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isSaving ? (
            <span className="flex items-center justify-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              Saving...
            </span>
          ) : (
            <span className="flex items-center justify-center gap-2">
              <Save className="h-4 w-4" />
              Save Credentials
            </span>
          )}
        </button>

        <button
          onClick={handleTest}
          disabled={isTesting}
          className="rounded-lg border border-purple-500 px-4 py-2.5 font-medium text-purple-400 transition-all hover:bg-purple-500/10 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isTesting ? (
            <span className="flex items-center justify-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              Testing...
            </span>
          ) : (
            'Test'
          )}
        </button>
      </div>

      {/* Hint */}
      <div className="mt-4 rounded-lg bg-yellow-500/10 p-3">
        <p className="text-xs text-yellow-500">
          💡 <strong>Tip:</strong> Credentials are stored securely. Test connection before publishing to ensure everything works.
        </p>
      </div>
    </motion.div>
  );
}
