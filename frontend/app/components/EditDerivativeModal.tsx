'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Sparkles,
  RefreshCw,
  Edit3,
  CheckCircle2,
  Twitter,
  Linkedin,
  Mail,
  FileText,
  Search,
  MessageSquare,
  TrendingUp,
  Eye,
  Save,
  Zap,
} from 'lucide-react';
import { showToast } from '@/lib/toast';

type DerivativeType = 'twitter_thread' | 'linkedin' | 'email' | 'blog_summary' | 'seo_description';

interface EditDerivativeModalProps {
  type: DerivativeType;
  content: string | string[];
  originalDraft: string;
  onClose: () => void;
  onSave: (newContent: string | string[]) => Promise<void>;
}

// Platform-specific parameters
interface PlatformParameters {
  twitter?: {
    threadLength: number;
    includeHashtags: boolean;
    includeEmojis: boolean;
    tone: 'engaging' | 'informative' | 'humorous' | 'professional';
  };
  linkedin?: {
    tone: 'professional' | 'thought-leadership' | 'casual-professional' | 'inspirational';
    includeHashtags: boolean;
    callToAction: 'none' | 'light' | 'strong';
    length: 'short' | 'medium' | 'long';
  };
  email?: {
    tone: 'friendly' | 'professional' | 'persuasive' | 'informative';
    subjectLineStyle: 'direct' | 'curiosity' | 'benefit-driven' | 'personalized';
    ctaPlacement: 'top' | 'middle' | 'bottom' | 'multiple';
    urgency: 'none' | 'low' | 'medium' | 'high';
  };
  blog?: {
    seoOptimized: boolean;
    includeKeywords: boolean;
    readingLevel: 'simple' | 'intermediate' | 'advanced';
    structure: 'bullet-points' | 'paragraphs' | 'mixed';
  };
  seo?: {
    maxLength: number;
    includeKeywords: boolean;
    focusKeyword: string;
    tone: 'descriptive' | 'compelling' | 'question-based';
  };
}

const PLATFORM_CONFIG = {
  twitter_thread: {
    name: 'Twitter Thread',
    icon: Twitter,
    color: 'from-blue-500 to-cyan-500',
    description: 'Engaging thread optimized for Twitter',
  },
  linkedin: {
    name: 'LinkedIn Post',
    icon: Linkedin,
    color: 'from-blue-600 to-blue-400',
    description: 'Professional content for LinkedIn',
  },
  email: {
    name: 'Email Newsletter',
    icon: Mail,
    color: 'from-purple-500 to-pink-500',
    description: 'Compelling email content',
  },
  blog_summary: {
    name: 'Blog Summary',
    icon: FileText,
    color: 'from-emerald-500 to-teal-500',
    description: 'SEO-optimized blog summary',
  },
  seo_description: {
    name: 'SEO Description',
    icon: Search,
    color: 'from-orange-500 to-red-500',
    description: 'Meta description for search engines',
  },
};

export function EditDerivativeModal({
  type,
  content: initialContent,
  originalDraft,
  onClose,
  onSave,
}: EditDerivativeModalProps) {
  const [editMode, setEditMode] = useState<'manual' | 'ai-assisted'>('ai-assisted');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  // Convert content to string for editing
  const contentString = Array.isArray(initialContent) ? initialContent.join('\n\n') : initialContent;
  
  const [manualContent, setManualContent] = useState(contentString);
  const [aiContent, setAiContent] = useState('');

  // Platform-specific parameters
  const [twitterParams, setTwitterParams] = useState({
    threadLength: 10,
    includeHashtags: true,
    includeEmojis: true,
    tone: 'engaging' as const,
  });

  const [linkedinParams, setLinkedinParams] = useState({
    tone: 'professional' as const,
    includeHashtags: true,
    callToAction: 'light' as const,
    length: 'medium' as const,
  });

  const [emailParams, setEmailParams] = useState({
    tone: 'friendly' as const,
    subjectLineStyle: 'benefit-driven' as const,
    ctaPlacement: 'bottom' as const,
    urgency: 'low' as const,
  });

  const [blogParams, setBlogParams] = useState({
    seoOptimized: true,
    includeKeywords: true,
    readingLevel: 'intermediate' as const,
    structure: 'mixed' as const,
  });

  const [seoParams, setSeoParams] = useState({
    maxLength: 160,
    includeKeywords: true,
    focusKeyword: '',
    tone: 'compelling' as const,
  });

  const platformConfig = PLATFORM_CONFIG[type];
  const Icon = platformConfig.icon;

  // Generate platform-specific prompt
  const buildPrompt = () => {
    let prompt = `You are an expert ${platformConfig.name} writer. Create a ${platformConfig.name.toLowerCase()} from this content:\n\n**Original Content:**\n${originalDraft}\n\n**Current ${platformConfig.name}:**\n${contentString}\n\n`;

    switch (type) {
      case 'twitter_thread':
        prompt += `**Requirements:**
- Create a thread of ${twitterParams.threadLength} tweets
- Tone: ${twitterParams.tone}
- ${twitterParams.includeHashtags ? 'Include relevant hashtags' : 'No hashtags'}
- ${twitterParams.includeEmojis ? 'Use emojis for engagement' : 'No emojis'}
- Each tweet should be under 280 characters
- Start with a hook tweet
- End with a clear CTA
- Format: Return each tweet on a new line`;
        break;

      case 'linkedin':
        prompt += `**Requirements:**
- Tone: ${linkedinParams.tone}
- Length: ${linkedinParams.length}
- ${linkedinParams.includeHashtags ? 'Include 3-5 relevant hashtags' : 'No hashtags'}
- Call-to-action strength: ${linkedinParams.callToAction}
- Professional formatting with line breaks
- Engage readers in the first 2 lines`;
        break;

      case 'email':
        prompt += `**Requirements:**
- Tone: ${emailParams.tone}
- Subject line style: ${emailParams.subjectLineStyle}
- CTA placement: ${emailParams.ctaPlacement}
- Urgency level: ${emailParams.urgency}
- Include: Subject line, preview text, main body, CTA
- Mobile-friendly formatting`;
        break;

      case 'blog_summary':
        prompt += `**Requirements:**
- ${blogParams.seoOptimized ? 'SEO-optimized' : 'Standard'} summary
- Reading level: ${blogParams.readingLevel}
- Structure: ${blogParams.structure}
- Around 200 words
- ${blogParams.includeKeywords ? 'Naturally include key terms' : 'Focus on clarity'}`;
        break;

      case 'seo_description':
        prompt += `**Requirements:**
- Maximum ${seoParams.maxLength} characters
- Tone: ${seoParams.tone}
- ${seoParams.focusKeyword ? `Focus keyword: "${seoParams.focusKeyword}"` : 'Use primary keywords'}
- Compelling and click-worthy
- Include key benefits
- Action-oriented`;
        break;
    }

    prompt += '\n\nReturn ONLY the improved content, no explanations.';
    return prompt;
  };

  // Generate AI suggestions
  const handleGenerateAI = async () => {
    setIsGenerating(true);
    setAiContent('');
    
    try {
      const prompt = buildPrompt();
      
      const response = await fetch('http://localhost:3001/api/generate-stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: prompt,
          temperature: 0.8,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate');
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let generatedContent = '';

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value);
          const lines = chunk.split('\n');

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6);
              if (data === '[DONE]') continue;

              try {
                const parsed = JSON.parse(data);
                if (parsed.content) {
                  generatedContent += parsed.content;
                  setAiContent(generatedContent);
                }
              } catch (e) {
                console.error('Error parsing SSE:', e);
              }
            }
          }
        }
      }

      setShowPreview(true);
      showToast.success(`✨ ${platformConfig.name} generated!`);
    } catch (error) {
      console.error('Error generating:', error);
      showToast.error('Failed to generate');
    } finally {
      setIsGenerating(false);
    }
  };

  // Save changes
  const handleSave = async (content: string) => {
    setIsSaving(true);
    try {
      // Convert back to array for twitter if needed
      const finalContent = type === 'twitter_thread' 
        ? content.split('\n\n').filter(t => t.trim())
        : content;
      
      await onSave(finalContent);
      showToast.success('✅ Saved successfully!');
      onClose();
    } catch (error) {
      console.error('Error saving:', error);
      showToast.error('Failed to save');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-50"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900 rounded-3xl max-w-6xl w-full max-h-[90vh] overflow-hidden border border-purple-500/20 shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className={`relative bg-gradient-to-r ${platformConfig.color} bg-opacity-10 border-b border-white/10 p-6`}>
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <motion.h2
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="text-3xl font-bold text-white mb-2 flex items-center gap-3"
                >
                  <Icon className="w-8 h-8" />
                  Edit {platformConfig.name}
                </motion.h2>
                <p className="text-gray-400">{platformConfig.description}</p>
              </div>
              
              <motion.button
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                onClick={onClose}
                className="text-gray-400 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-full"
              >
                <X className="w-6 h-6" />
              </motion.button>
            </div>

            {/* Edit Mode Toggle */}
            <div className="flex items-center gap-2 p-1 bg-white/5 rounded-xl w-fit">
              <button
                onClick={() => setEditMode('manual')}
                className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${
                  editMode === 'manual'
                    ? `bg-gradient-to-r ${platformConfig.color} text-white shadow-lg`
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Edit3 className="w-4 h-4" />
                Manual
              </button>
              <button
                onClick={() => setEditMode('ai-assisted')}
                className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${
                  editMode === 'ai-assisted'
                    ? `bg-gradient-to-r ${platformConfig.color} text-white shadow-lg`
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Sparkles className="w-4 h-4" />
                AI-Assisted
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="overflow-y-auto max-h-[calc(90vh-250px)] p-6">
            <AnimatePresence mode="wait">
              {editMode === 'manual' && (
                <motion.div
                  key="manual"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="glass-card p-6 rounded-2xl"
                >
                  <textarea
                    value={manualContent}
                    onChange={(e) => setManualContent(e.target.value)}
                    className="w-full h-96 bg-white/5 border border-white/10 rounded-xl p-4 text-gray-200 resize-none focus:outline-none focus:border-purple-500/50 transition-colors font-mono text-sm"
                    placeholder={`Edit your ${platformConfig.name.toLowerCase()} here...`}
                  />
                  <div className="mt-4 text-sm text-gray-400">
                    {manualContent.length} characters
                  </div>
                </motion.div>
              )}

              {editMode === 'ai-assisted' && (
                <motion.div
                  key="ai-assisted"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="grid grid-cols-1 lg:grid-cols-2 gap-6"
                >
                  {/* Parameters */}
                  <div className="glass-card p-6 rounded-2xl space-y-4">
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                      <TrendingUp className="w-5 h-5" />
                      Platform Parameters
                    </h3>

                    {/* Platform-specific parameters */}
                    {type === 'twitter_thread' && (
                      <>
                        <div>
                          <label className="text-sm text-gray-300 mb-2 block">Thread Length</label>
                          <input
                            type="number"
                            min="3"
                            max="25"
                            value={twitterParams.threadLength}
                            onChange={(e) => setTwitterParams({...twitterParams, threadLength: parseInt(e.target.value)})}
                            className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white"
                          />
                        </div>
                        <div>
                          <label className="text-sm text-gray-300 mb-2 block">Tone</label>
                          <div className="grid grid-cols-2 gap-2">
                            {(['engaging', 'informative', 'humorous', 'professional'] as const).map(tone => (
                              <button
                                key={tone}
                                onClick={() => setTwitterParams({...twitterParams, tone})}
                                className={`px-3 py-2 rounded-lg text-sm ${twitterParams.tone === tone ? 'bg-blue-500 text-white' : 'bg-white/5 text-gray-300'}`}
                              >
                                {tone.charAt(0).toUpperCase() + tone.slice(1)}
                              </button>
                            ))}
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-300">Include Hashtags</span>
                          <input type="checkbox" checked={twitterParams.includeHashtags} onChange={(e) => setTwitterParams({...twitterParams, includeHashtags: e.target.checked})} className="w-4 h-4" />
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-300">Include Emojis</span>
                          <input type="checkbox" checked={twitterParams.includeEmojis} onChange={(e) => setTwitterParams({...twitterParams, includeEmojis: e.target.checked})} className="w-4 h-4" />
                        </div>
                      </>
                    )}

                    {type === 'linkedin' && (
                      <>
                        <div>
                          <label className="text-sm text-gray-300 mb-2 block">Tone</label>
                          <div className="grid grid-cols-2 gap-2">
                            {(['professional', 'thought-leadership', 'casual-professional', 'inspirational'] as const).map(tone => (
                              <button
                                key={tone}
                                onClick={() => setLinkedinParams({...linkedinParams, tone})}
                                className={`px-3 py-2 rounded-lg text-sm ${linkedinParams.tone === tone ? 'bg-blue-600 text-white' : 'bg-white/5 text-gray-300'}`}
                              >
                                {tone.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                              </button>
                            ))}
                          </div>
                        </div>
                        <div>
                          <label className="text-sm text-gray-300 mb-2 block">Length</label>
                          <div className="grid grid-cols-3 gap-2">
                            {(['short', 'medium', 'long'] as const).map(len => (
                              <button
                                key={len}
                                onClick={() => setLinkedinParams({...linkedinParams, length: len})}
                                className={`px-3 py-2 rounded-lg text-sm ${linkedinParams.length === len ? 'bg-blue-600 text-white' : 'bg-white/5 text-gray-300'}`}
                              >
                                {len.charAt(0).toUpperCase() + len.slice(1)}
                              </button>
                            ))}
                          </div>
                        </div>
                      </>
                    )}

                    {type === 'email' && (
                      <>
                        <div>
                          <label className="text-sm text-gray-300 mb-2 block">Tone</label>
                          <div className="grid grid-cols-2 gap-2">
                            {(['friendly', 'professional', 'persuasive', 'informative'] as const).map(tone => (
                              <button
                                key={tone}
                                onClick={() => setEmailParams({...emailParams, tone})}
                                className={`px-3 py-2 rounded-lg text-sm ${emailParams.tone === tone ? 'bg-purple-500 text-white' : 'bg-white/5 text-gray-300'}`}
                              >
                                {tone.charAt(0).toUpperCase() + tone.slice(1)}
                              </button>
                            ))}
                          </div>
                        </div>
                        <div>
                          <label className="text-sm text-gray-300 mb-2 block">Subject Line Style</label>
                          <div className="grid grid-cols-2 gap-2">
                            {(['direct', 'curiosity', 'benefit-driven', 'personalized'] as const).map(style => (
                              <button
                                key={style}
                                onClick={() => setEmailParams({...emailParams, subjectLineStyle: style})}
                                className={`px-3 py-2 rounded-lg text-sm ${emailParams.subjectLineStyle === style ? 'bg-purple-500 text-white' : 'bg-white/5 text-gray-300'}`}
                              >
                                {style.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                              </button>
                            ))}
                          </div>
                        </div>
                      </>
                    )}

                    {type === 'blog_summary' && (
                      <>
                        <div>
                          <label className="text-sm text-gray-300 mb-2 block">Reading Level</label>
                          <div className="grid grid-cols-3 gap-2">
                            {(['simple', 'intermediate', 'advanced'] as const).map(level => (
                              <button
                                key={level}
                                onClick={() => setBlogParams({...blogParams, readingLevel: level})}
                                className={`px-3 py-2 rounded-lg text-sm ${blogParams.readingLevel === level ? 'bg-emerald-500 text-white' : 'bg-white/5 text-gray-300'}`}
                              >
                                {level.charAt(0).toUpperCase() + level.slice(1)}
                              </button>
                            ))}
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-300">SEO Optimized</span>
                          <input type="checkbox" checked={blogParams.seoOptimized} onChange={(e) => setBlogParams({...blogParams, seoOptimized: e.target.checked})} className="w-4 h-4" />
                        </div>
                      </>
                    )}

                    {type === 'seo_description' && (
                      <>
                        <div>
                          <label className="text-sm text-gray-300 mb-2 block">Max Length</label>
                          <input
                            type="number"
                            min="120"
                            max="160"
                            value={seoParams.maxLength}
                            onChange={(e) => setSeoParams({...seoParams, maxLength: parseInt(e.target.value)})}
                            className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white"
                          />
                        </div>
                        <div>
                          <label className="text-sm text-gray-300 mb-2 block">Focus Keyword</label>
                          <input
                            type="text"
                            value={seoParams.focusKeyword}
                            onChange={(e) => setSeoParams({...seoParams, focusKeyword: e.target.value})}
                            placeholder="Enter focus keyword..."
                            className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white"
                          />
                        </div>
                      </>
                    )}

                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleGenerateAI}
                      disabled={isGenerating}
                      className={`w-full px-6 py-3 bg-gradient-to-r ${platformConfig.color} text-white rounded-xl font-medium transition-all shadow-lg flex items-center justify-center gap-2 disabled:opacity-50`}
                    >
                      {isGenerating ? (
                        <>
                          <RefreshCw className="w-5 h-5 animate-spin" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <Zap className="w-5 h-5" />
                          Generate AI Version
                        </>
                      )}
                    </motion.button>
                  </div>

                  {/* Preview */}
                  <div className="glass-card p-6 rounded-2xl">
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                      <Eye className="w-5 h-5 text-mint-400" />
                      {showPreview ? 'AI Preview' : 'Original'}
                    </h3>
                    <div className="text-gray-300 text-sm whitespace-pre-wrap max-h-[500px] overflow-y-auto p-4 bg-white/5 rounded-lg">
                      {isGenerating ? (
                        <div className="flex items-center justify-center h-64">
                          <RefreshCw className="w-12 h-12 text-purple-400 animate-spin" />
                        </div>
                      ) : showPreview && aiContent ? (
                        aiContent
                      ) : (
                        contentString
                      )}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Footer */}
          <div className="border-t border-white/10 p-6 bg-gradient-to-r from-gray-900/50 via-purple-900/10 to-gray-900/50">
            <div className="flex items-center justify-between">
              <button
                onClick={onClose}
                className="px-6 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-all"
              >
                Cancel
              </button>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleSave(editMode === 'manual' ? manualContent : aiContent)}
                disabled={isSaving || (editMode === 'ai-assisted' && !aiContent)}
                className={`px-6 py-2 bg-gradient-to-r ${platformConfig.color} text-white rounded-lg font-medium transition-all shadow-lg flex items-center gap-2 disabled:opacity-50`}
              >
                {isSaving ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Save Changes
                  </>
                )}
              </motion.button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

