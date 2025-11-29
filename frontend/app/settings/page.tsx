'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

interface SystemSettings {
  ai: {
    defaultProvider: 'openai' | 'gemini';
    defaultModel: string;
    temperature: number;
    maxTokens: number;
  };
  content: {
    defaultLanguage: string;
    defaultWordCount: number;
    defaultFormat: string;
  };
  notifications: {
    emailEnabled: boolean;
    emailAddress: string;
  };
}

interface SystemInfo {
  database: {
    version: string;
    name: string;
    size: string;
  };
  tables: {
    ideas: number;
    briefs: number;
    contents: number;
  };
  version: string;
  backend: string;
  frontend: string;
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<SystemSettings | null>(null);
  const [systemInfo, setSystemInfo] = useState<SystemInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [activeTab, setActiveTab] = useState<'ai' | 'content' | 'notifications' | 'system'>('ai');

  useEffect(() => {
    fetchSettings();
    fetchSystemInfo();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/settings');
      const result: ApiResponse<SystemSettings> = await response.json();
      if (result.success && result.data) {
        setSettings(result.data);
      }
    } catch (err) {
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchSystemInfo = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/settings/system-info');
      const result: ApiResponse<SystemInfo> = await response.json();
      if (result.success && result.data) {
        setSystemInfo(result.data);
      }
    } catch (err) {
      console.error('Fetch system info error:', err);
    }
  };

  const handleSave = async () => {
    if (!settings) return;

    setSaving(true);
    setSaveMessage(null);

    try {
      const response = await fetch('http://localhost:3001/api/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settings),
      });

      const result: ApiResponse<SystemSettings> = await response.json();

      if (result.success) {
        setSaveMessage({ type: 'success', text: 'Settings đã được lưu thành công!' });
        setTimeout(() => setSaveMessage(null), 3000);
      } else {
        setSaveMessage({ type: 'error', text: result.error || 'Lỗi khi lưu settings' });
      }
    } catch (err) {
      setSaveMessage({ type: 'error', text: 'Lỗi kết nối đến server' });
    } finally {
      setSaving(false);
    }
  };

  const updateSettings = (section: keyof SystemSettings, field: string, value: any) => {
    if (!settings) return;
    setSettings({
      ...settings,
      [section]: {
        ...settings[section],
        [field]: value,
      },
    });
  };

  if (loading) {
    return (
      <main className="min-h-screen p-6 md:p-10">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-16">
            <div className="spinner mx-auto mb-4" />
            <p className="text-midnight-400">Đang tải settings...</p>
          </div>
        </div>
      </main>
    );
  }

  if (!settings) {
    return (
      <main className="min-h-screen p-6 md:p-10">
        <div className="max-w-7xl mx-auto">
          <div className="glass-card rounded-2xl p-12 text-center">
            <p className="text-midnight-400">Không thể tải settings</p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen p-6 md:p-10">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8">
          <h1 className="font-display text-3xl md:text-5xl font-bold mb-2">
            <span className="text-gradient">⚙️ Settings</span>
          </h1>
          <p className="text-midnight-300 text-lg">
            Cấu hình và quản lý hệ thống
          </p>
        </header>

        {/* Save Message */}
        {saveMessage && (
          <div
            className={`mb-6 p-4 rounded-lg ${
              saveMessage.type === 'success'
                ? 'bg-green-500/20 text-green-300 border border-green-500/30'
                : 'bg-red-500/20 text-red-300 border border-red-500/30'
            }`}
          >
            {saveMessage.text}
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {(['ai', 'content', 'notifications', 'system'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-2 rounded-lg font-medium transition-all whitespace-nowrap ${
                activeTab === tab
                  ? 'bg-gradient-to-r from-midnight-500 to-coral-500 text-white'
                  : 'glass-card text-midnight-300 hover:text-midnight-100'
              }`}
            >
              {tab === 'ai' && '🤖 AI Settings'}
              {tab === 'content' && '📝 Content'}
              {tab === 'notifications' && '🔔 Notifications'}
              {tab === 'system' && 'ℹ️ System Info'}
            </button>
          ))}
        </div>

        {/* AI Settings Tab */}
        {activeTab === 'ai' && settings?.ai && (
          <div className="glass-card rounded-2xl p-6 mb-6">
            <h2 className="text-2xl font-semibold text-midnight-100 mb-6">🤖 AI Configuration</h2>
            <div className="space-y-6">
              <div>
                <label className="block text-midnight-200 font-medium mb-2">Default Provider</label>
                <select
                  value={settings.ai.defaultProvider}
                  onChange={(e) => updateSettings('ai', 'defaultProvider', e.target.value)}
                  className="w-full px-4 py-2 bg-midnight-900/50 border border-midnight-700 rounded-lg text-midnight-100 focus:outline-none focus:border-coral-500"
                >
                  <option value="gemini">Gemini</option>
                  <option value="openai">OpenAI</option>
                </select>
              </div>

              <div>
                <label className="block text-midnight-200 font-medium mb-2">Default Model</label>
                <input
                  type="text"
                  value={settings.ai.defaultModel}
                  onChange={(e) => updateSettings('ai', 'defaultModel', e.target.value)}
                  className="w-full px-4 py-2 bg-midnight-900/50 border border-midnight-700 rounded-lg text-midnight-100 focus:outline-none focus:border-coral-500"
                  placeholder="e.g., gemini-2.5-flash"
                />
                <p className="text-xs text-midnight-400 mt-1">
                  Model mặc định cho AI generation
                </p>
              </div>

              <div>
                <label className="block text-midnight-200 font-medium mb-2">
                  Temperature: {settings.ai.temperature}
                </label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={settings.ai.temperature}
                  onChange={(e) => updateSettings('ai', 'temperature', parseFloat(e.target.value))}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-midnight-400 mt-1">
                  <span>Conservative (0)</span>
                  <span>Balanced (0.5)</span>
                  <span>Creative (1)</span>
                </div>
              </div>

              <div>
                <label className="block text-midnight-200 font-medium mb-2">Max Tokens</label>
                <input
                  type="number"
                  value={settings.ai.maxTokens}
                  onChange={(e) => updateSettings('ai', 'maxTokens', parseInt(e.target.value))}
                  className="w-full px-4 py-2 bg-midnight-900/50 border border-midnight-700 rounded-lg text-midnight-100 focus:outline-none focus:border-coral-500"
                  min="1000"
                  max="32000"
                  step="1000"
                />
                <p className="text-xs text-midnight-400 mt-1">
                  Số token tối đa cho mỗi response
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Content Settings Tab */}
        {activeTab === 'content' && settings?.content && (
          <div className="glass-card rounded-2xl p-6 mb-6">
            <h2 className="text-2xl font-semibold text-midnight-100 mb-6">📝 Content Configuration</h2>
            <div className="space-y-6">
              <div>
                <label className="block text-midnight-200 font-medium mb-2">Default Language</label>
                <select
                  value={settings.content.defaultLanguage}
                  onChange={(e) => updateSettings('content', 'defaultLanguage', e.target.value)}
                  className="w-full px-4 py-2 bg-midnight-900/50 border border-midnight-700 rounded-lg text-midnight-100 focus:outline-none focus:border-coral-500"
                >
                  <option value="vi">Tiếng Việt</option>
                  <option value="en">English</option>
                </select>
              </div>

              <div>
                <label className="block text-midnight-200 font-medium mb-2">Default Word Count</label>
                <input
                  type="number"
                  value={settings.content.defaultWordCount}
                  onChange={(e) => updateSettings('content', 'defaultWordCount', parseInt(e.target.value))}
                  className="w-full px-4 py-2 bg-midnight-900/50 border border-midnight-700 rounded-lg text-midnight-100 focus:outline-none focus:border-coral-500"
                  min="100"
                  max="10000"
                  step="100"
                />
                <p className="text-xs text-midnight-400 mt-1">
                  Số từ mặc định cho content mới
                </p>
              </div>

              <div>
                <label className="block text-midnight-200 font-medium mb-2">Default Format</label>
                <select
                  value={settings.content.defaultFormat}
                  onChange={(e) => updateSettings('content', 'defaultFormat', e.target.value)}
                  className="w-full px-4 py-2 bg-midnight-900/50 border border-midnight-700 rounded-lg text-midnight-100 focus:outline-none focus:border-coral-500"
                >
                  <option value="markdown">Markdown</option>
                  <option value="html">HTML</option>
                  <option value="plain">Plain Text</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Notifications Settings Tab */}
        {activeTab === 'notifications' && settings?.notifications && (
          <div className="glass-card rounded-2xl p-6 mb-6">
            <h2 className="text-2xl font-semibold text-midnight-100 mb-6">🔔 Notification Settings</h2>
            <div className="space-y-6">
              <div>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.notifications.emailEnabled}
                    onChange={(e) => updateSettings('notifications', 'emailEnabled', e.target.checked)}
                    className="w-5 h-5 rounded bg-midnight-900/50 border border-midnight-700 text-coral-500 focus:ring-coral-500"
                  />
                  <span className="text-midnight-200 font-medium">Enable Email Notifications</span>
                </label>
                <p className="text-xs text-midnight-400 mt-1 ml-8">
                  Nhận thông báo qua email khi có cập nhật
                </p>
              </div>

              {settings.notifications.emailEnabled && (
                <div>
                  <label className="block text-midnight-200 font-medium mb-2">Email Address</label>
                  <input
                    type="email"
                    value={settings.notifications.emailAddress}
                    onChange={(e) => updateSettings('notifications', 'emailAddress', e.target.value)}
                    className="w-full px-4 py-2 bg-midnight-900/50 border border-midnight-700 rounded-lg text-midnight-100 focus:outline-none focus:border-coral-500"
                    placeholder="your@email.com"
                  />
                </div>
              )}
            </div>
          </div>
        )}

        {/* System Info Tab */}
        {activeTab === 'system' && systemInfo?.database && systemInfo?.tables && (
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <div className="glass-card rounded-2xl p-6">
              <h2 className="text-xl font-semibold text-midnight-100 mb-4">💾 Database</h2>
              <div className="space-y-3 text-sm">
                <div className="p-3 bg-midnight-900/30 rounded-lg">
                  <div className="font-medium text-midnight-200 mb-1">Status</div>
                  <div className="text-green-400 flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-400"></div>
                    Connected
                  </div>
                </div>
                <div className="p-3 bg-midnight-900/30 rounded-lg">
                  <div className="font-medium text-midnight-200 mb-1">Version</div>
                  <div className="text-midnight-400">{systemInfo.database.version?.split(' ')[0]}</div>
                </div>
                <div className="p-3 bg-midnight-900/30 rounded-lg">
                  <div className="font-medium text-midnight-200 mb-1">Database</div>
                  <div className="text-midnight-400">{systemInfo.database.name}</div>
                </div>
                <div className="p-3 bg-midnight-900/30 rounded-lg">
                  <div className="font-medium text-midnight-200 mb-1">Size</div>
                  <div className="text-midnight-400">{systemInfo.database.size}</div>
                </div>
              </div>
            </div>

            <div className="glass-card rounded-2xl p-6">
              <h2 className="text-xl font-semibold text-midnight-100 mb-4">📊 Tables</h2>
              <div className="space-y-3 text-sm">
                <div className="p-3 bg-midnight-900/30 rounded-lg">
                  <div className="font-medium text-midnight-200 mb-1">Ideas</div>
                  <div className="text-midnight-400">{systemInfo.tables.ideas} records</div>
                </div>
                <div className="p-3 bg-midnight-900/30 rounded-lg">
                  <div className="font-medium text-midnight-200 mb-1">Briefs</div>
                  <div className="text-midnight-400">{systemInfo.tables.briefs} records</div>
                </div>
                <div className="p-3 bg-midnight-900/30 rounded-lg">
                  <div className="font-medium text-midnight-200 mb-1">Contents</div>
                  <div className="text-midnight-400">{systemInfo.tables.contents} records</div>
                </div>
              </div>
            </div>

            <div className="glass-card rounded-2xl p-6">
              <h2 className="text-xl font-semibold text-midnight-100 mb-4">ℹ️ System</h2>
              <div className="space-y-3 text-sm">
                <div className="p-3 bg-midnight-900/30 rounded-lg">
                  <div className="font-medium text-midnight-200 mb-1">Version</div>
                  <div className="text-midnight-400">{systemInfo.version}</div>
                </div>
                <div className="p-3 bg-midnight-900/30 rounded-lg">
                  <div className="font-medium text-midnight-200 mb-1">Backend</div>
                  <div className="text-midnight-400">{systemInfo.backend}</div>
                </div>
                <div className="p-3 bg-midnight-900/30 rounded-lg">
                  <div className="font-medium text-midnight-200 mb-1">Frontend</div>
                  <div className="text-midnight-400">{systemInfo.frontend}</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Save Button */}
        {activeTab !== 'system' && (
          <div className="flex justify-end gap-4">
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-6 py-3 bg-gradient-to-r from-midnight-500 to-coral-500 text-white font-semibold rounded-xl hover:from-midnight-400 hover:to-coral-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? 'Đang lưu...' : '💾 Lưu Settings'}
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
