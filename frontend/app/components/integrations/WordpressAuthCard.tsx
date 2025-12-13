'use client';

import { useState } from 'react';
import { Globe, CheckCircle, AlertCircle, Loader2, Save } from 'lucide-react';
import { showToast } from '@/lib/toast';
import { motion } from 'framer-motion';

interface WordpressAuthCardProps {
  onSaveSuccess?: () => void;
}

export function WordpressAuthCard({ onSaveSuccess }: WordpressAuthCardProps) {
  const [siteUrl, setSiteUrl] = useState('');
  const [username, setUsername] = useState('');
  const [applicationPassword, setApplicationPassword] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testStatus, setTestStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleSave = async () => {
    // Validation
    if (!siteUrl.trim() || !username.trim() || !applicationPassword.trim()) {
      showToast.warning('Please fill in all fields');
      return;
    }

    // Validate URL format
    try {
      new URL(siteUrl);
    } catch {
      showToast.error('Please enter a valid site URL (e.g., https://example.com)');
      return;
    }

    setIsSaving(true);
    const toastId = showToast.loading('Saving WordPress credentials...');

    try {
      const response = await fetch('http://localhost:3001/api/integrations/wordpress/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          siteUrl: siteUrl.trim(),
          username: username.trim(),
          applicationPassword: applicationPassword.trim(),
        }),
      });

      const data = await response.json();

      if (data.success) {
        showToast.dismiss(toastId);
        showToast.success('WordPress settings saved successfully');
        setTestStatus('idle');
        onSaveSuccess?.();
      } else {
        throw new Error(data.error?.message || 'Failed to save credentials');
      }
    } catch (error: any) {
      showToast.dismiss(toastId);
      showToast.error(error.message || 'Failed to save WordPress credentials');
      console.error('Save error:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleTest = async () => {
    setIsTesting(true);
    const toastId = showToast.loading('Testing WordPress connection...');

    try {
      const response = await fetch('http://localhost:3001/api/integrations/wordpress/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      const data = await response.json();

      if (data.success) {
        showToast.dismiss(toastId);
        showToast.success('WordPress connection successful! 🎉');
        setTestStatus('success');
      } else {
        throw new Error(data.error?.details || data.error?.message || 'Connection failed');
      }
    } catch (error: any) {
      showToast.dismiss(toastId);
      showToast.error(error.message || 'Failed to connect to WordPress');
      setTestStatus('error');
      console.error('Test error:', error);
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="glass-card rounded-2xl p-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-500/20 rounded-xl">
            <Globe className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <h3 className="font-semibold text-white">WordPress Integration</h3>
            <p className="text-xs text-midnight-400">Blog post publishing</p>
          </div>
        </div>
        {testStatus !== 'idle' && (
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg ${
            testStatus === 'success'
              ? 'bg-emerald-500/20 text-emerald-400'
              : 'bg-red-500/20 text-red-400'
          }`}>
            {testStatus === 'success' ? (
              <CheckCircle className="w-4 h-4" />
            ) : (
              <AlertCircle className="w-4 h-4" />
            )}
            <span className="text-xs font-medium">
              {testStatus === 'success' ? 'Connected' : 'Failed'}
            </span>
          </div>
        )}
      </div>

      {/* Form Fields */}
      <div className="space-y-4">
        {/* Site URL */}
        <div>
          <label className="block text-sm font-medium text-midnight-300 mb-2">
            WordPress Site URL <span className="text-red-400">*</span>
          </label>
          <input
            type="url"
            value={siteUrl}
            onChange={(e) => setSiteUrl(e.target.value)}
            placeholder="https://yoursite.com"
            className="w-full px-4 py-2.5 bg-midnight-800 border border-midnight-700 rounded-xl text-white placeholder:text-midnight-500 focus:outline-none focus:border-blue-500/50 transition-colors"
          />
          <p className="text-xs text-midnight-500 mt-1.5">
            Full URL including https://
          </p>
        </div>

        {/* Username */}
        <div>
          <label className="block text-sm font-medium text-midnight-300 mb-2">
            Username <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Your WordPress username"
            className="w-full px-4 py-2.5 bg-midnight-800 border border-midnight-700 rounded-xl text-white placeholder:text-midnight-500 focus:outline-none focus:border-blue-500/50 transition-colors"
          />
          <p className="text-xs text-midnight-500 mt-1.5">
            Admin or Editor role required
          </p>
        </div>

        {/* Application Password */}
        <div>
          <label className="block text-sm font-medium text-midnight-300 mb-2">
            Application Password <span className="text-red-400">*</span>
          </label>
          <input
            type="password"
            value={applicationPassword}
            onChange={(e) => setApplicationPassword(e.target.value)}
            placeholder="xxxx xxxx xxxx xxxx"
            className="w-full px-4 py-2.5 bg-midnight-800 border border-midnight-700 rounded-xl text-white placeholder:text-midnight-500 focus:outline-none focus:border-blue-500/50 transition-colors"
          />
          <p className="text-xs text-midnight-500 mt-1.5">
            Get from: Users → Your Profile → Application Passwords
          </p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-3 mt-6">
        <button
          onClick={handleSave}
          disabled={isSaving || !siteUrl || !username || !applicationPassword}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:from-midnight-700 disabled:to-midnight-700 disabled:text-midnight-500 disabled:cursor-not-allowed text-white rounded-xl font-medium transition-all"
        >
          {isSaving ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Saving...</span>
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              <span>Save Credentials</span>
            </>
          )}
        </button>

        <button
          onClick={handleTest}
          disabled={isTesting}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-midnight-700 hover:bg-midnight-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-medium transition-all"
        >
          {isTesting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Testing...</span>
            </>
          ) : (
            <>
              <CheckCircle className="w-4 h-4" />
              <span>Test</span>
            </>
          )}
        </button>
      </div>

      {/* Info Box */}
      <div className="mt-4 p-3 bg-midnight-800/50 rounded-xl border border-midnight-700">
        <p className="text-xs text-midnight-400">
          🔒 <strong>Security:</strong> Application passwords are more secure than regular passwords. Posts will be created as drafts.
        </p>
      </div>
    </motion.div>
  );
}
