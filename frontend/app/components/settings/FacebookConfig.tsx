'use client';

import { useState, useEffect } from 'react';
import { Eye, EyeOff, TestTube2, CheckCircle, XCircle, AlertCircle, Facebook } from 'lucide-react';

interface FacebookConfig {
  appId: string;
  appSecret: string;
  pageId: string;
  pageAccessToken: string;
}

interface ConnectionStatus {
  connected: boolean;
  pageName?: string;
  lastChecked?: string;
}

export default function FacebookConfig() {
  const [config, setConfig] = useState<FacebookConfig>({
    appId: '',
    appSecret: '',
    pageId: '',
    pageAccessToken: '',
  });
  
  const [showAppSecret, setShowAppSecret] = useState(false);
  const [showPageToken, setShowPageToken] = useState(false);
  const [status, setStatus] = useState<ConnectionStatus>({ connected: false });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/integrations/facebook');
      const data = await response.json();
      
      if (data.success && data.config) {
        setConfig(data.config);
        setStatus(data.status || { connected: false });
      }
    } catch (error) {
      console.error('Error fetching Facebook config:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    // Validation
    if (!config.appId || !config.appSecret || !config.pageId || !config.pageAccessToken) {
      setMessage({ type: 'error', text: 'Vui lòng điền đầy đủ tất cả các trường' });
      return;
    }

    setSaving(true);
    setMessage(null);

    try {
      const response = await fetch('http://localhost:3001/api/integrations/facebook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      });

      const data = await response.json();

      if (data.success) {
        setMessage({ type: 'success', text: '✅ Đã lưu cấu hình Facebook thành công!' });
        setTimeout(() => setMessage(null), 3000);
      } else {
        setMessage({ type: 'error', text: data.error?.message || 'Lỗi khi lưu cấu hình' });
      }
    } catch (error: any) {
      setMessage({ type: 'error', text: `Lỗi kết nối: ${error.message}` });
    } finally {
      setSaving(false);
    }
  };

  const handleTest = async () => {
    if (!config.pageAccessToken || !config.pageId) {
      setMessage({ type: 'error', text: 'Cần có Page ID và Page Access Token để test' });
      return;
    }

    setTesting(true);
    setMessage(null);

    try {
      const response = await fetch('http://localhost:3001/api/integrations/facebook/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pageId: config.pageId,
          pageAccessToken: config.pageAccessToken,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setStatus({
          connected: true,
          pageName: data.pageName,
          lastChecked: new Date().toISOString(),
        });
        setMessage({ 
          type: 'success', 
          text: `✅ Kết nối thành công! Page: ${data.pageName || config.pageId}` 
        });
      } else {
        setStatus({ connected: false });
        setMessage({ type: 'error', text: `❌ ${data.error?.message || 'Không thể kết nối'}` });
      }
    } catch (error: any) {
      setStatus({ connected: false });
      setMessage({ type: 'error', text: `❌ Lỗi test: ${error.message}` });
    } finally {
      setTesting(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 text-center">
        <div className="animate-pulse">Loading Facebook configuration...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-blue-500/10">
            <Facebook className="w-6 h-6 text-blue-500" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">Facebook Integration</h3>
            <p className="text-sm text-midnight-400">
              Cấu hình để đăng bài lên Facebook Page
            </p>
          </div>
        </div>

        {/* Status Badge */}
        <div className="flex items-center gap-2">
          {status.connected ? (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-green-500/10 border border-green-500/20">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span className="text-sm text-green-500 font-medium">Connected</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-500/10 border border-gray-500/20">
              <XCircle className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-500 font-medium">Not Connected</span>
            </div>
          )}
        </div>
      </div>

      {/* Message Alert */}
      {message && (
        <div
          className={`p-4 rounded-lg border ${
            message.type === 'success'
              ? 'bg-green-500/10 border-green-500/20 text-green-500'
              : message.type === 'error'
              ? 'bg-red-500/10 border-red-500/20 text-red-500'
              : 'bg-blue-500/10 border-blue-500/20 text-blue-500'
          }`}
        >
          <div className="flex items-start gap-2">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <p className="text-sm">{message.text}</p>
          </div>
        </div>
      )}

      {/* Configuration Form */}
      <div className="glass-card rounded-xl p-6 space-y-5">
        {/* App ID */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-white">
            App ID <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            value={config.appId}
            onChange={(e) => setConfig({ ...config, appId: e.target.value })}
            placeholder="123456789012345"
            className="w-full px-4 py-2.5 bg-midnight-800 border border-midnight-700 rounded-lg text-white placeholder-midnight-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
          />
          <p className="text-xs text-midnight-400">
            Facebook App ID từ{' '}
            <a
              href="https://developers.facebook.com/apps"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:underline"
            >
              Facebook Developers
            </a>
          </p>
        </div>

        {/* App Secret */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-white">
            App Secret <span className="text-red-400">*</span>
          </label>
          <div className="relative">
            <input
              type={showAppSecret ? 'text' : 'password'}
              value={config.appSecret}
              onChange={(e) => setConfig({ ...config, appSecret: e.target.value })}
              placeholder="••••••••••••••••••••••••••••••••"
              className="w-full px-4 py-2.5 pr-12 bg-midnight-800 border border-midnight-700 rounded-lg text-white placeholder-midnight-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            />
            <button
              type="button"
              onClick={() => setShowAppSecret(!showAppSecret)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-midnight-400 hover:text-white transition-colors"
            >
              {showAppSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          <p className="text-xs text-midnight-400">
            App Secret từ Facebook App Settings (giữ bí mật)
          </p>
        </div>

        {/* Page ID */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-white">
            Page ID <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            value={config.pageId}
            onChange={(e) => setConfig({ ...config, pageId: e.target.value })}
            placeholder="123456789012345"
            className="w-full px-4 py-2.5 bg-midnight-800 border border-midnight-700 rounded-lg text-white placeholder-midnight-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
          />
          <p className="text-xs text-midnight-400">
            Facebook Page ID của page bạn muốn đăng bài
          </p>
        </div>

        {/* Page Access Token */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-white">
            Page Access Token <span className="text-red-400">*</span>
          </label>
          <div className="relative">
            <textarea
              value={config.pageAccessToken}
              onChange={(e) => setConfig({ ...config, pageAccessToken: e.target.value })}
              placeholder="EAAxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
              rows={3}
              className={`w-full px-4 py-2.5 pr-12 bg-midnight-800 border border-midnight-700 rounded-lg text-white placeholder-midnight-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 resize-none ${
                showPageToken ? 'font-mono text-xs' : ''
              }`}
              style={{ paddingRight: '3rem' }}
            />
            <button
              type="button"
              onClick={() => setShowPageToken(!showPageToken)}
              className="absolute right-3 top-3 text-midnight-400 hover:text-white transition-colors"
            >
              {showPageToken ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          <p className="text-xs text-midnight-400">
            Long-lived Page Access Token từ Graph API Explorer
          </p>
        </div>

        {/* Info Box */}
        <div className="p-4 rounded-lg bg-blue-500/5 border border-blue-500/10">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
            <div className="space-y-1 text-sm text-midnight-300">
              <p className="font-medium text-blue-400">Cách lấy Facebook credentials:</p>
              <ul className="space-y-1 list-disc list-inside text-midnight-400">
                <li>Xem hướng dẫn chi tiết trong file <code className="text-blue-400">FACEBOOK_SETUP.md</code></li>
                <li>Cần có Facebook App và Page để lấy credentials</li>
                <li>Page Access Token phải là long-lived token</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-3">
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-medium rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving ? 'Đang lưu...' : 'Lưu cấu hình'}
        </button>

        <button
          onClick={handleTest}
          disabled={testing || !config.pageId || !config.pageAccessToken}
          className="px-6 py-2.5 bg-midnight-700 hover:bg-midnight-600 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          <TestTube2 className="w-4 h-4" />
          {testing ? 'Đang test...' : 'Test Connection'}
        </button>
      </div>

      {/* Connection Info */}
      {status.connected && status.pageName && (
        <div className="glass-card rounded-xl p-4 border border-green-500/20">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-green-500" />
            <div>
              <p className="text-sm font-medium text-white">Đã kết nối với: {status.pageName}</p>
              {status.lastChecked && (
                <p className="text-xs text-midnight-400 mt-1">
                  Last checked: {new Date(status.lastChecked).toLocaleString('vi-VN')}
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}



