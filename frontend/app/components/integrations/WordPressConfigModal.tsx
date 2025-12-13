'use client';

import { useState } from 'react';
import { X, Globe, Shield, Settings, CheckCircle, AlertCircle, Loader2, Save, Eye, EyeOff } from 'lucide-react';
import { showToast } from '@/lib/toast';
import { motion, AnimatePresence } from 'framer-motion';

interface WordPressConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveSuccess?: () => void;
}

type TabType = 'basic' | 'auth' | 'advanced';

export function WordPressConfigModal({ isOpen, onClose, onSaveSuccess }: WordPressConfigModalProps) {
  // Tab state
  const [activeTab, setActiveTab] = useState<TabType>('basic');
  
  // Basic form state
  const [name, setName] = useState('');
  const [siteUrl, setSiteUrl] = useState('');
  const [defaultCategory, setDefaultCategory] = useState('');
  const [defaultStatus, setDefaultStatus] = useState<'draft' | 'publish' | 'pending' | 'private'>('draft');
  
  // Auth form state
  const [username, setUsername] = useState('');
  const [applicationPassword, setApplicationPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  // Advanced form state
  const [apiBasePath, setApiBasePath] = useState('/wp-json');
  const [requestTimeoutMs, setRequestTimeoutMs] = useState(15000);
  const [rateLimitPerMinute, setRateLimitPerMinute] = useState(60);
  const [verifySSL, setVerifySSL] = useState(true);
  const [allowInsecureHttp, setAllowInsecureHttp] = useState(false);
  const [contentFormat, setContentFormat] = useState<'html' | 'blocks' | 'markdownToHtml'>('html');
  const [autoCreateCategories, setAutoCreateCategories] = useState(false);
  const [autoUploadFeaturedImage, setAutoUploadFeaturedImage] = useState(true);
  
  // UI state
  const [isSaving, setIsSaving] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testStatus, setTestStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Validation
  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // Basic
    if (!name.trim()) newErrors.name = 'Configuration name is required';
    
    if (!siteUrl.trim()) {
      newErrors.siteUrl = 'Site URL is required';
    } else if (!siteUrl.trim().startsWith('http://') && !siteUrl.trim().startsWith('https://')) {
      newErrors.siteUrl = 'URL must start with http:// or https://';
    }

    // Auth
    if (!username.trim()) newErrors.username = 'Username is required';
    if (!applicationPassword.trim()) newErrors.applicationPassword = 'Application Password is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleTest = async () => {
    if (!username || !applicationPassword || !siteUrl) {
      showToast.warning('Please fill in Site URL, Username, and Password first');
      return;
    }

    setIsTesting(true);
    const toastId = showToast.loading('Testing WordPress connection...');

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 20000);

      const response = await fetch('http://localhost:3001/api/integrations/wordpress/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name || 'Test',
          siteUrl: siteUrl.trim(),
          username: username.trim(),
          applicationPassword: applicationPassword.trim(),
          defaultStatus: 'draft',
          apiBasePath,
          requestTimeoutMs,
          verifySSL,
          allowInsecureHttp,
        }),
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
        showToast.success('WordPress connection successful! ✅');
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

  const handleSave = async () => {
    if (!validateForm()) {
      showToast.warning('Please fix validation errors');
      return;
    }

    setIsSaving(true);
    const toastId = showToast.loading('Saving WordPress configuration...');

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000);

      const response = await fetch('http://localhost:3001/api/integrations/wordpress/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          siteUrl: siteUrl.trim(),
          defaultCategory: defaultCategory.trim() || undefined,
          defaultStatus,
          username: username.trim(),
          applicationPassword: applicationPassword.trim(),
          apiBasePath,
          requestTimeoutMs,
          rateLimitPerMinute,
          verifySSL,
          allowInsecureHttp,
          contentFormat,
          featureFlags: {
            autoCreateCategories,
            autoUploadFeaturedImage,
          },
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error?.details?.join(', ') || errorData.error?.message || `HTTP ${response.status}`);
      }

      const data = await response.json();

      showToast.dismiss(toastId);

      if (data.success) {
        if (data.warning) {
          showToast.warning(`Saved but connection test failed: ${data.warning}`);
          setTestStatus('error');
        } else {
          showToast.success('WordPress configuration saved and verified! ✅');
          setTestStatus('success');
        }
        
        onSaveSuccess?.();
        setTimeout(() => onClose(), 1500);
      } else {
        throw new Error(data.error?.message || 'Failed to save');
      }
    } catch (error: any) {
      showToast.dismiss(toastId);
      
      if (error.name === 'AbortError') {
        showToast.error('Request timeout. Please check your connection.');
      } else if (error.message?.includes('Failed to fetch')) {
        showToast.error('Cannot connect to backend. Please ensure backend is running.');
      } else {
        showToast.error(error.message || 'Failed to save WordPress configuration');
      }
      
      console.error('Save error:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const tabs = [
    { id: 'basic' as TabType, label: 'Cơ bản', icon: Globe },
    { id: 'auth' as TabType, label: 'Xác thực', icon: Shield },
    { id: 'advanced' as TabType, label: 'Nâng cao', icon: Settings },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed left-1/2 top-1/2 z-50 w-full max-w-3xl -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-blue-500/20 bg-gradient-to-br from-gray-900 via-gray-900 to-blue-900/20 p-6 shadow-2xl"
          >
            {/* Header */}
            <div className="mb-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 p-2">
                  <Globe className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Chỉnh sửa WordPress</h2>
                  <p className="text-sm text-gray-400">Configure your WordPress connection</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-800 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Tabs */}
            <div className="mb-6 flex gap-2 rounded-lg border border-gray-700 bg-gray-800/50 p-1">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2.5 font-medium transition-all ${
                    activeTab === tab.id
                      ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <tab.icon className="h-4 w-4" />
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>

            {/* Content */}
            <div className="max-h-[60vh] overflow-y-auto pr-2">
              {/* Basic Tab */}
              {activeTab === 'basic' && (
                <div className="space-y-4">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-300">
                      Tên cấu hình <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g., My WordPress Site"
                      className={`w-full rounded-lg border ${
                        errors.name ? 'border-red-500' : 'border-gray-700'
                      } bg-gray-900/50 px-4 py-2.5 text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50`}
                    />
                    {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name}</p>}
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-300">
                      Site URL <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="url"
                      value={siteUrl}
                      onChange={(e) => setSiteUrl(e.target.value)}
                      placeholder="https://yoursite.com"
                      className={`w-full rounded-lg border ${
                        errors.siteUrl ? 'border-red-500' : 'border-gray-700'
                      } bg-gray-900/50 px-4 py-2.5 text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50`}
                    />
                    {errors.siteUrl && <p className="mt-1 text-xs text-red-500">{errors.siteUrl}</p>}
                    <p className="mt-1 text-xs text-gray-500">
                      Full URL including http:// or https://
                    </p>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-300">
                      Default Category
                    </label>
                    <input
                      type="text"
                      value={defaultCategory}
                      onChange={(e) => setDefaultCategory(e.target.value)}
                      placeholder="e.g., Blog"
                      className="w-full rounded-lg border border-gray-700 bg-gray-900/50 px-4 py-2.5 text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      Category for published posts (optional)
                    </p>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-300">
                      Default Status <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={defaultStatus}
                      onChange={(e) => setDefaultStatus(e.target.value as any)}
                      className="w-full rounded-lg border border-gray-700 bg-gray-900/50 px-4 py-2.5 text-white focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                    >
                      <option value="draft">Draft</option>
                      <option value="publish">Published</option>
                      <option value="pending">Pending</option>
                      <option value="private">Private</option>
                    </select>
                  </div>
                </div>
              )}

              {/* Auth Tab */}
              {activeTab === 'auth' && (
                <div className="space-y-4">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-300">
                      Username <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="WordPress username"
                      className={`w-full rounded-lg border ${
                        errors.username ? 'border-red-500' : 'border-gray-700'
                      } bg-gray-900/50 px-4 py-2.5 text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50`}
                    />
                    {errors.username && <p className="mt-1 text-xs text-red-500">{errors.username}</p>}
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-300">
                      Application Password <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={applicationPassword}
                        onChange={(e) => setApplicationPassword(e.target.value)}
                        placeholder="xxxx xxxx xxxx xxxx xxxx xxxx"
                        className={`w-full rounded-lg border ${
                          errors.applicationPassword ? 'border-red-500' : 'border-gray-700'
                        } bg-gray-900/50 px-4 py-2.5 pr-10 text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    {errors.applicationPassword && (
                      <p className="mt-1 text-xs text-red-500">{errors.applicationPassword}</p>
                    )}
                    <p className="mt-1 text-xs text-gray-500">
                      Create in: <span className="text-gray-400">WordPress → Users → Profile → Application Passwords</span>
                    </p>
                  </div>

                  <div className="rounded-lg border border-blue-500/20 bg-blue-500/10 p-4">
                    <button
                      onClick={handleTest}
                      disabled={isTesting || !siteUrl || !username || !applicationPassword}
                      className="w-full rounded-lg bg-gradient-to-r from-blue-600 to-cyan-600 px-4 py-2.5 font-medium text-white transition-all hover:from-blue-500 hover:to-cyan-500 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {isTesting ? (
                        <span className="flex items-center justify-center gap-2">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Kiểm tra kết nối...
                        </span>
                      ) : (
                        'Kiểm tra kết nối'
                      )}
                    </button>
                    {testStatus === 'success' && (
                      <div className="mt-3 flex items-center gap-2 text-green-400">
                        <CheckCircle className="h-4 w-4" />
                        <span className="text-sm">Connection successful!</span>
                      </div>
                    )}
                    {testStatus === 'error' && (
                      <div className="mt-3 flex items-center gap-2 text-red-400">
                        <AlertCircle className="h-4 w-4" />
                        <span className="text-sm">Connection failed. Please check your settings.</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Advanced Tab */}
              {activeTab === 'advanced' && (
                <div className="space-y-4">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-300">
                      API Base Path
                    </label>
                    <input
                      type="text"
                      value={apiBasePath}
                      onChange={(e) => setApiBasePath(e.target.value)}
                      placeholder="/wp-json"
                      className="w-full rounded-lg border border-gray-700 bg-gray-900/50 px-4 py-2.5 text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                    />
                    <p className="mt-1 text-xs text-gray-500">Default: /wp-json</p>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-300">
                      Request Timeout (ms)
                    </label>
                    <input
                      type="number"
                      value={requestTimeoutMs}
                      onChange={(e) => setRequestTimeoutMs(Number(e.target.value))}
                      min="1000"
                      step="1000"
                      className="w-full rounded-lg border border-gray-700 bg-gray-900/50 px-4 py-2.5 text-white focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                    />
                    <p className="mt-1 text-xs text-gray-500">Default: 15000 (15 seconds)</p>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-300">
                      Rate Limit (per minute)
                    </label>
                    <input
                      type="number"
                      value={rateLimitPerMinute}
                      onChange={(e) => setRateLimitPerMinute(Number(e.target.value))}
                      min="1"
                      className="w-full rounded-lg border border-gray-700 bg-gray-900/50 px-4 py-2.5 text-white focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                    />
                    <p className="mt-1 text-xs text-gray-500">Default: 60</p>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-300">
                      Content Format
                    </label>
                    <select
                      value={contentFormat}
                      onChange={(e) => setContentFormat(e.target.value as any)}
                      className="w-full rounded-lg border border-gray-700 bg-gray-900/50 px-4 py-2.5 text-white focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                    >
                      <option value="html">HTML</option>
                      <option value="blocks">Gutenberg Blocks</option>
                      <option value="markdownToHtml">Markdown to HTML</option>
                    </select>
                  </div>

                  <div className="space-y-3 rounded-lg border border-gray-700 bg-gray-800/30 p-4">
                    <label className="flex items-center justify-between">
                      <span className="text-sm text-gray-300">Verify SSL</span>
                      <input
                        type="checkbox"
                        checked={verifySSL}
                        onChange={(e) => setVerifySSL(e.target.checked)}
                        className="h-4 w-4 rounded border-gray-600 bg-gray-700 text-blue-600 focus:ring-2 focus:ring-blue-500"
                      />
                    </label>

                    <label className="flex items-center justify-between">
                      <span className="text-sm text-gray-300">Allow Insecure HTTP</span>
                      <input
                        type="checkbox"
                        checked={allowInsecureHttp}
                        onChange={(e) => setAllowInsecureHttp(e.target.checked)}
                        className="h-4 w-4 rounded border-gray-600 bg-gray-700 text-blue-600 focus:ring-2 focus:ring-blue-500"
                      />
                    </label>
                    {allowInsecureHttp && (
                      <p className="text-xs text-yellow-500">
                        ⚠️ Warning: HTTP connections are not secure
                      </p>
                    )}

                    <label className="flex items-center justify-between">
                      <span className="text-sm text-gray-300">Auto Create Categories</span>
                      <input
                        type="checkbox"
                        checked={autoCreateCategories}
                        onChange={(e) => setAutoCreateCategories(e.target.checked)}
                        className="h-4 w-4 rounded border-gray-600 bg-gray-700 text-blue-600 focus:ring-2 focus:ring-blue-500"
                      />
                    </label>

                    <label className="flex items-center justify-between">
                      <span className="text-sm text-gray-300">Auto Upload Featured Image</span>
                      <input
                        type="checkbox"
                        checked={autoUploadFeaturedImage}
                        onChange={(e) => setAutoUploadFeaturedImage(e.target.checked)}
                        className="h-4 w-4 rounded border-gray-600 bg-gray-700 text-blue-600 focus:ring-2 focus:ring-blue-500"
                      />
                    </label>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="mt-6 flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 rounded-lg border border-gray-700 px-4 py-2.5 font-medium text-gray-300 transition-all hover:bg-gray-800"
              >
                Hủy
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="flex-1 rounded-lg bg-gradient-to-r from-blue-600 to-cyan-600 px-4 py-2.5 font-medium text-white transition-all hover:from-blue-500 hover:to-cyan-500 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isSaving ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Đang lưu...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <Save className="h-4 w-4" />
                    Cập nhật
                  </span>
                )}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

