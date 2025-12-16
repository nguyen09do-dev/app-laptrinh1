'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Eye, EyeOff, TestTube2, Facebook, AlertCircle, CheckCircle } from 'lucide-react';
import { DocumentationViewer, DocumentationTooltip } from './DocumentationViewer';

interface FacebookConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveSuccess?: () => void;
}

interface FacebookConfig {
  appId: string;
  appSecret: string;
  pageId: string;
  pageAccessToken: string;
}

export default function FacebookConfigModal({ isOpen, onClose, onSaveSuccess }: FacebookConfigModalProps) {
  const [config, setConfig] = useState<FacebookConfig>({
    appId: '',
    appSecret: '',
    pageId: '',
    pageAccessToken: '',
  });
  
  const [showAppSecret, setShowAppSecret] = useState(false);
  const [showPageToken, setShowPageToken] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);
  const [showDocumentation, setShowDocumentation] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchConfig();
    }
  }, [isOpen]);

  const fetchConfig = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:3001/api/integrations/facebook');
      const data = await response.json();
      
      if (data.success && data.config) {
        // Don't show masked values, keep them empty for user to re-enter
        setConfig({
          appId: data.config.appId || '',
          appSecret: '',
          pageId: data.config.pageId || '',
          pageAccessToken: '',
        });
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
        setTimeout(() => {
          onSaveSuccess?.();
          onClose();
        }, 1500);
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
        setMessage({ 
          type: 'success', 
          text: `✅ Kết nối thành công! Page: ${data.pageName || config.pageId}` 
        });
      } else {
        setMessage({ type: 'error', text: `❌ ${data.error?.message || 'Không thể kết nối'}` });
      }
    } catch (error: any) {
      setMessage({ type: 'error', text: `❌ Lỗi test: ${error.message}` });
    } finally {
      setTesting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {/* Backdrop */}
      <motion.div
        key="facebook-modal-backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm"
      />

      {/* Modal */}
      <div className="fixed inset-0 z-[101] flex items-center justify-center p-4">
        <motion.div
          key="facebook-modal-content"
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="w-full max-w-2xl rounded-2xl border border-blue-500/20 bg-gradient-to-br from-gray-900 via-gray-900 to-blue-900/20 p-6 shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 p-2">
                <Facebook className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-white">Facebook Configuration</h2>
                <p className="text-sm text-gray-400">Configure your Facebook Page integration</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-800 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Message Alert */}
          {message && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`mb-4 flex items-start gap-2 rounded-lg border p-3 ${
                message.type === 'success'
                  ? 'border-green-500/20 bg-green-500/10 text-green-400'
                  : message.type === 'error'
                  ? 'border-red-500/20 bg-red-500/10 text-red-400'
                  : 'border-blue-500/20 bg-blue-500/10 text-blue-400'
              }`}
            >
              <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
              <p className="text-sm">{message.text}</p>
            </motion.div>
          )}

          {/* Form */}
          {loading ? (
            <div className="py-12 text-center">
              <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-4 border-blue-500/20 border-t-blue-500"></div>
              <p className="text-gray-400">Loading configuration...</p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* App ID */}
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-200">
                  App ID <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={config.appId}
                  onChange={(e) => setConfig({ ...config, appId: e.target.value })}
                  placeholder="123456789012345"
                  className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                <p className="mt-1 text-xs text-gray-500">
                  From{' '}
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
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-200">
                  App Secret <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showAppSecret ? 'text' : 'password'}
                    value={config.appSecret}
                    onChange={(e) => setConfig({ ...config, appSecret: e.target.value })}
                    placeholder="••••••••••••••••••••••••••••••••"
                    className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 pr-10 text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowAppSecret(!showAppSecret)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                  >
                    {showAppSecret ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                <p className="mt-1 text-xs text-gray-500">Keep this secret</p>
              </div>

              {/* Page ID */}
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-200">
                  Page ID <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={config.pageId}
                  onChange={(e) => setConfig({ ...config, pageId: e.target.value })}
                  placeholder="123456789012345"
                  className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                <p className="mt-1 text-xs text-gray-500">Your Facebook Page ID</p>
              </div>

              {/* Page Access Token */}
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-200">
                  Page Access Token <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <textarea
                    value={config.pageAccessToken}
                    onChange={(e) => setConfig({ ...config, pageAccessToken: e.target.value })}
                    placeholder="EAAxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                    rows={3}
                    className={`w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 pr-10 text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none ${
                      showPageToken ? 'font-mono text-xs' : ''
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPageToken(!showPageToken)}
                    className="absolute right-2 top-3 text-gray-400 hover:text-white"
                  >
                    {showPageToken ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                <p className="mt-1 text-xs text-gray-500">Long-lived token from Graph API Explorer</p>
              </div>

              {/* Info */}
              <div className="rounded-lg border border-blue-500/20 bg-blue-500/5 p-3">
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 text-blue-400 flex-shrink-0 mt-0.5" />
                  <div className="text-xs text-gray-400">
                    <div className="font-medium text-blue-400 mb-1">Need help?</div>
                    <div>
                      Check{' '}
                      <DocumentationTooltip
                        preview="Complete step-by-step guide to create Facebook App, get App ID & Secret, obtain Page Access Token, and configure the integration. Includes troubleshooting tips and security best practices."
                        onClick={() => setShowDocumentation(true)}
                      >
                        <code className="text-blue-400 hover:text-blue-300 transition-colors underline decoration-dashed">
                          FACEBOOK_SETUP.md
                        </code>
                      </DocumentationTooltip>
                      {' '}for detailed instructions
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="mt-6 flex items-center justify-between gap-3">
            <button
              onClick={handleTest}
              disabled={testing || !config.pageId || !config.pageAccessToken || loading}
              className="flex items-center gap-2 rounded-lg bg-gray-700 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-gray-600 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <TestTube2 className="h-4 w-4" />
              {testing ? 'Testing...' : 'Test Connection'}
            </button>

            <div className="flex gap-3">
              <button
                onClick={onClose}
                disabled={saving}
                className="rounded-lg bg-gray-700 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-gray-600 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving || loading}
                className="rounded-lg bg-gradient-to-r from-blue-600 to-blue-500 px-4 py-2 text-sm font-medium text-white transition-all hover:from-blue-500 hover:to-blue-400 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save Configuration'}
              </button>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Documentation Viewer */}
      <DocumentationViewer
        isOpen={showDocumentation}
        onClose={() => setShowDocumentation(false)}
        title="Facebook Setup Guide"
        content={facebookSetupDoc}
      />
    </AnimatePresence>
  );
}

// Facebook setup documentation content
const facebookSetupDoc = `
# Facebook Integration Setup Guide

Hướng dẫn chi tiết cách lấy Facebook credentials để tích hợp với AI Content Studio.

---

## Tổng Quan

Để đăng bài lên Facebook Page, bạn cần:
1. **Facebook App** (App ID + App Secret)
2. **Facebook Page** (Page ID + Page Access Token)

---

## BƯỚC 1: Tạo Facebook App

### 1.1. Truy cập Facebook Developers

Vào: **https://developers.facebook.com/apps**

### 1.2. Tạo App Mới

1. Click **"Create App"**
2. Chọn loại app:
   - **Business** (nếu dùng cho doanh nghiệp)
   - **Other** (nếu dùng cá nhân/test)
3. Click **"Next"**

### 1.3. Điền Thông Tin App

**Thông tin cần điền:**
- **App Name**: Tên app của bạn (VD: "My Content Publisher")
- **App Contact Email**: Email liên hệ
- **Business Account**: (Optional) Chọn nếu có

Click **"Create App"**

### 1.4. Lấy App ID và App Secret

Sau khi tạo app, vào **Settings → Basic**:

1. **App ID**: 
   - Copy số App ID (VD: \`123456789012345\`)
   
2. **App Secret**:
   - Click **"Show"** để hiện App Secret
   - Copy App Secret (VD: \`abc123def456...\`)
   - ⚠️ **Giữ bí mật**, không share công khai

### 1.5. Cấu Hình App (Quan Trọng!)

Vẫn ở **Settings → Basic**, điền các thông tin sau:

1. **Privacy Policy URL**: (Required)
   - VD: \`https://yourwebsite.com/privacy\`

2. **Category**: 
   - Chọn **"Business and Pages"**

Click **"Save Changes"**

---

## BƯỚC 2: Lấy Page Access Token

### 2.1. Sử Dụng Graph API Explorer

Vào: **https://developers.facebook.com/tools/explorer/**

### 2.2. Chọn App và Permissions

1. **Chọn App**:
   - Ở góc trên bên phải, chọn app bạn vừa tạo

2. **Chọn Permissions**:
   Click **"Add a Permission"** và chọn:
   - ✅ \`pages_manage_posts\` (Đăng bài)
   - ✅ \`pages_read_engagement\` (Đọc engagement)
   - ✅ \`pages_show_list\` (Xem danh sách pages)
   - ✅ \`public_profile\` (Thông tin cơ bản)

3. Click **"Generate Access Token"**

### 2.3. Chuyển sang Page Access Token

1. Sau khi generate User Access Token, click vào **"Get Page Access Token"**
2. Chọn **Facebook Page** bạn muốn đăng bài
3. Copy **Page Access Token** (bắt đầu bằng \`EAA...\`)

### 2.4. Lấy Page ID

**Cách 1: Từ Graph API Explorer**
- Sau khi có Page Access Token, Page ID sẽ hiện ngay bên cạnh

**Cách 2: Từ Facebook Page**
1. Vào Facebook Page của bạn
2. Click **"About"** (Giới thiệu)
3. Scroll xuống, tìm **"Page ID"**

---

## BƯỚC 3: Lưu Credentials vào App

1. Điền các thông tin đã lấy được:
   - **App ID**: \`123456789012345\`
   - **App Secret**: \`abc123...\`
   - **Page ID**: \`987654321098765\`
   - **Page Access Token**: \`EAAxxxxx...\`

2. Click **"Test Connection"** để verify

3. Click **"Save Configuration"**

---

## Bảo Mật

### ⚠️ LƯU Ý QUAN TRỌNG:

1. **KHÔNG share App Secret** công khai
2. **KHÔNG commit** credentials vào Git
3. **KHÔNG log** token ra console trong production
4. **REFRESH** token định kỳ (mỗi 60 ngày)

---

## Troubleshooting

### Lỗi: "Invalid OAuth access token"

**Nguyên nhân**: Token hết hạn hoặc không hợp lệ

**Giải pháp**:
1. Generate token mới từ Graph API Explorer
2. Tạo long-lived token
3. Lưu lại vào Settings

---

### Lỗi: "This endpoint requires the 'pages_manage_posts' permission"

**Nguyên nhân**: Thiếu permission

**Giải pháp**:
1. Vào Graph API Explorer
2. Add permission \`pages_manage_posts\`
3. Generate token lại

---

## Tài Liệu Tham Khảo

- **Facebook Developers**: https://developers.facebook.com/
- **Graph API Explorer**: https://developers.facebook.com/tools/explorer/
- **Pages API Documentation**: https://developers.facebook.com/docs/pages-api

---

**Chúc bạn setup thành công!** 🎉
`;

