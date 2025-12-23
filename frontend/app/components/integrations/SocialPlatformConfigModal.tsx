'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Save, TestTube2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { showToast } from '@/lib/toast';

interface Field {
  key: string;
  label: string;
  type: 'text' | 'password' | 'textarea';
  placeholder?: string;
  help?: string;
  required?: boolean;
}

interface SocialPlatformConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  platformKey: string;
  platformName: string;
  icon: React.ElementType;
  color: string;
  fields: Field[];
  apiEndpoint: string;
  docsUrl?: string;
}

export function SocialPlatformConfigModal({
  isOpen,
  onClose,
  platformKey,
  platformName,
  icon: Icon,
  color,
  fields,
  apiEndpoint,
  docsUrl,
}: SocialPlatformConfigModalProps) {
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInputChange = (key: string, value: string) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
    // Clear error for this field
    if (errors[key]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[key];
        return newErrors;
      });
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    fields.forEach((field) => {
      if (field.required && (!formData[field.key] || formData[field.key].trim() === '')) {
        newErrors[field.key] = `${field.label} is required`;
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      showToast.error('Please fill in all required fields');
      return;
    }

    setIsSaving(true);
    try {
      const response = await fetch(`${apiEndpoint}/save`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        showToast.success(`${platformName} credentials saved successfully!`);
        onClose();
      } else {
        showToast.error(data.error?.message || 'Failed to save credentials');
      }
    } catch (error: any) {
      showToast.error(error.message || 'Failed to save credentials');
    } finally {
      setIsSaving(false);
    }
  };

  const handleTest = async () => {
    if (!validateForm()) {
      showToast.error('Please fill in all required fields before testing');
      return;
    }

    setIsTesting(true);
    const toastId = showToast.loading(`Testing ${platformName} connection...`);

    try {
      // First save the credentials
      await fetch(`${apiEndpoint}/save`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      // Then test the connection
      const response = await fetch(`${apiEndpoint}/test`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      const data = await response.json();

      showToast.dismiss(toastId);

      if (response.ok && data.success) {
        showToast.success(`✅ ${platformName} connection successful!`);
      } else {
        showToast.error(data.error?.message || 'Connection test failed');
      }
    } catch (error: any) {
      showToast.dismiss(toastId);
      showToast.error(error.message || 'Connection test failed');
    } finally {
      setIsTesting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-midnight-900 rounded-2xl border border-midnight-700 shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden"
        >
          {/* Header */}
          <div className={`p-6 border-b border-midnight-700 ${color.replace('text-', 'bg-')}/10`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${color.replace('text-', 'bg-')}/20`}>
                  <Icon className={`w-6 h-6 ${color}`} />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-white">{platformName} Configuration</h2>
                  <p className="text-sm text-midnight-400 mt-0.5">
                    Configure your {platformName} credentials
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-midnight-800 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-midnight-400" />
              </button>
            </div>
          </div>

          {/* Body */}
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
            <div className="space-y-4">
              {fields.map((field) => (
                <div key={field.key}>
                  <label className="block text-sm font-medium text-midnight-300 mb-2">
                    {field.label}
                    {field.required && <span className="text-red-400 ml-1">*</span>}
                  </label>
                  {field.type === 'textarea' ? (
                    <textarea
                      value={formData[field.key] || ''}
                      onChange={(e) => handleInputChange(field.key, e.target.value)}
                      placeholder={field.placeholder}
                      className={`w-full px-4 py-2.5 bg-midnight-800 border rounded-lg text-white placeholder-midnight-500 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all ${
                        errors[field.key] ? 'border-red-500' : 'border-midnight-700'
                      }`}
                      rows={3}
                    />
                  ) : (
                    <input
                      type={field.type}
                      value={formData[field.key] || ''}
                      onChange={(e) => handleInputChange(field.key, e.target.value)}
                      placeholder={field.placeholder}
                      className={`w-full px-4 py-2.5 bg-midnight-800 border rounded-lg text-white placeholder-midnight-500 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all ${
                        errors[field.key] ? 'border-red-500' : 'border-midnight-700'
                      }`}
                    />
                  )}
                  {errors[field.key] && (
                    <p className="mt-1 text-xs text-red-400 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {errors[field.key]}
                    </p>
                  )}
                  {field.help && (
                    <p className="mt-1 text-xs text-midnight-500">{field.help}</p>
                  )}
                </div>
              ))}
            </div>

            {/* Documentation Link */}
            {docsUrl && (
              <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                <p className="text-sm text-blue-400">
                  📖 Need help?{' '}
                  <a
                    href={docsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline hover:text-blue-300"
                  >
                    View {platformName} API documentation
                  </a>
                </p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-midnight-700 flex items-center gap-3">
            <button
              onClick={handleTest}
              disabled={isTesting || isSaving}
              className="flex items-center gap-2 px-4 py-2.5 bg-midnight-700 hover:bg-midnight-600 text-white rounded-lg transition-colors disabled:opacity-50"
            >
              {isTesting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Testing...</span>
                </>
              ) : (
                <>
                  <TestTube2 className="w-4 h-4" />
                  <span>Test Connection</span>
                </>
              )}
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving || isTesting}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white rounded-lg transition-all disabled:opacity-50"
            >
              {isSaving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Save Configuration</span>
                </>
              )}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}




