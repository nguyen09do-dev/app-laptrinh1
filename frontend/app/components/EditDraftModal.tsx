'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Sparkles,
  RefreshCw,
  Wand2,
  Edit3,
  CheckCircle2,
  AlertCircle,
  MessageSquare,
  BookOpen,
  Target,
  Sliders,
  Eye,
  Save,
  Zap,
  Brain,
  TrendingUp,
  TrendingDown,
  Minus,
  FileText,
  Hash,
  Type,
  BarChart3,
} from 'lucide-react';
import { showToast } from '@/lib/toast';

interface EditDraftModalProps {
  content: string;
  packId: string;
  onClose: () => void;
  onSave: (newContent: string) => Promise<void>;
}

// Comparison Metrics Component
function ComparisonMetrics({ 
  originalContent, 
  newContent, 
  parameters 
}: { 
  originalContent: string; 
  newContent: string; 
  parameters: EditParameters;
}) {
  // Calculate metrics
  const originalWords = originalContent.trim().split(/\s+/).filter(w => w.length > 0).length;
  const newWords = newContent.trim().split(/\s+/).filter(w => w.length > 0).length;
  const originalChars = originalContent.length;
  const newChars = newContent.length;
  const originalParagraphs = originalContent.split(/\n\s*\n/).filter(p => p.trim()).length;
  const newParagraphs = newContent.split(/\n\s*\n/).filter(p => p.trim()).length;
  const originalSentences = originalContent.split(/[.!?]+/).filter(s => s.trim()).length;
  const newSentences = newContent.split(/[.!?]+/).filter(s => s.trim()).length;

  // Calculate changes
  const wordChange = newWords - originalWords;
  const charChange = newChars - originalChars;
  const paragraphChange = newParagraphs - originalParagraphs;
  const sentenceChange = newSentences - originalSentences;
  const wordChangePercent = originalWords > 0 ? ((wordChange / originalWords) * 100).toFixed(1) : '0';

  // Determine change direction
  const getChangeIcon = (change: number) => {
    if (change > 0) return <TrendingUp className="w-4 h-4 text-emerald-400" />;
    if (change < 0) return <TrendingDown className="w-4 h-4 text-red-400" />;
    return <Minus className="w-4 h-4 text-gray-400" />;
  };

  const getChangeColor = (change: number) => {
    if (change > 0) return 'text-emerald-400';
    if (change < 0) return 'text-red-400';
    return 'text-gray-400';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-purple-500/10 via-blue-500/10 to-cyan-500/10 border border-purple-500/20 rounded-xl p-4 space-y-4"
    >
      <div className="flex items-center gap-2 mb-3">
        <BarChart3 className="w-5 h-5 text-purple-400" />
        <h4 className="text-sm font-semibold text-white">Content Comparison</h4>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {/* Word Count */}
        <div className="bg-white/5 rounded-lg p-3 border border-white/10">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-blue-400" />
              <span className="text-xs text-gray-400">Words</span>
            </div>
            {getChangeIcon(wordChange)}
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-lg font-bold text-white">{newWords}</span>
            <span className="text-xs text-gray-500">/ {originalWords}</span>
          </div>
          {wordChange !== 0 && (
            <div className={`text-xs mt-1 ${getChangeColor(wordChange)}`}>
              {wordChange > 0 ? '+' : ''}{wordChange} ({wordChangePercent}%)
            </div>
          )}
        </div>

        {/* Character Count */}
        <div className="bg-white/5 rounded-lg p-3 border border-white/10">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <Type className="w-4 h-4 text-cyan-400" />
              <span className="text-xs text-gray-400">Characters</span>
            </div>
            {getChangeIcon(charChange)}
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-lg font-bold text-white">{newChars.toLocaleString()}</span>
            <span className="text-xs text-gray-500">/ {originalChars.toLocaleString()}</span>
          </div>
          {charChange !== 0 && (
            <div className={`text-xs mt-1 ${getChangeColor(charChange)}`}>
              {charChange > 0 ? '+' : ''}{charChange.toLocaleString()}
            </div>
          )}
        </div>

        {/* Paragraphs */}
        <div className="bg-white/5 rounded-lg p-3 border border-white/10">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <Hash className="w-4 h-4 text-purple-400" />
              <span className="text-xs text-gray-400">Paragraphs</span>
            </div>
            {getChangeIcon(paragraphChange)}
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-lg font-bold text-white">{newParagraphs}</span>
            <span className="text-xs text-gray-500">/ {originalParagraphs}</span>
          </div>
          {paragraphChange !== 0 && (
            <div className={`text-xs mt-1 ${getChangeColor(paragraphChange)}`}>
              {paragraphChange > 0 ? '+' : ''}{paragraphChange}
            </div>
          )}
        </div>

        {/* Sentences */}
        <div className="bg-white/5 rounded-lg p-3 border border-white/10">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-pink-400" />
              <span className="text-xs text-gray-400">Sentences</span>
            </div>
            {getChangeIcon(sentenceChange)}
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-lg font-bold text-white">{newSentences}</span>
            <span className="text-xs text-gray-500">/ {originalSentences}</span>
          </div>
          {sentenceChange !== 0 && (
            <div className={`text-xs mt-1 ${getChangeColor(sentenceChange)}`}>
              {sentenceChange > 0 ? '+' : ''}{sentenceChange}
            </div>
          )}
        </div>
      </div>

      {/* Style Parameters Applied */}
      <div className="pt-3 border-t border-white/10">
        <div className="flex flex-wrap gap-2">
          <span className="text-xs text-gray-400">Applied:</span>
          <span className="px-2 py-1 bg-purple-500/20 text-purple-300 rounded text-xs">
            {parameters.tone}
          </span>
          <span className="px-2 py-1 bg-blue-500/20 text-blue-300 rounded text-xs">
            {parameters.complexity}
          </span>
          {parameters.length !== 'same' && (
            <span className="px-2 py-1 bg-cyan-500/20 text-cyan-300 rounded text-xs">
              {parameters.length}
            </span>
          )}
          {parameters.ctaStrength !== 'none' && (
            <span className="px-2 py-1 bg-emerald-500/20 text-emerald-300 rounded text-xs">
              CTA: {parameters.ctaStrength}
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
}

type EditMode = 'manual' | 'ai-assisted';
type LengthOption = 'shorter' | 'same' | 'longer' | 'custom';
type ToneOption = 'professional' | 'casual' | 'friendly' | 'formal' | 'persuasive' | 'academic';
type ComplexityOption = 'beginner' | 'intermediate' | 'expert';
type CTAStrength = 'none' | 'subtle' | 'medium' | 'strong';

interface EditParameters {
  length: LengthOption;
  customWordCount?: number;
  tone: ToneOption;
  complexity: ComplexityOption;
  targetAudience: string;
  seoKeywords: string[];
  ctaStrength: CTAStrength;
  improveFocus: string[];
  useRAG: boolean;
}

const GUIDING_QUESTIONS = [
  {
    id: 'goal',
    question: 'What specific aspect do you want to improve?',
    icon: Target,
    suggestions: ['Clarity', 'Engagement', 'SEO', 'Structure', 'Tone'],
  },
  {
    id: 'audience',
    question: 'Who is your target audience?',
    icon: MessageSquare,
    suggestions: ['Beginners', 'Professionals', 'Technical Users', 'General Public'],
  },
  {
    id: 'tone',
    question: 'What tone fits your content best?',
    icon: Sparkles,
    suggestions: ['Professional', 'Casual', 'Friendly', 'Persuasive'],
  },
];

export function EditDraftModal({ content, packId, onClose, onSave }: EditDraftModalProps) {
  const [editMode, setEditMode] = useState<EditMode>('ai-assisted');
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  
  // Manual edit
  const [manualContent, setManualContent] = useState(content);
  
  // AI-assisted edit
  const [parameters, setParameters] = useState<EditParameters>({
    length: 'same',
    tone: 'professional',
    complexity: 'intermediate',
    targetAudience: '',
    seoKeywords: [],
    ctaStrength: 'medium',
    improveFocus: [],
    useRAG: false,
  });
  
  const [aiSuggestions, setAiSuggestions] = useState<string>('');
  const [guidingAnswers, setGuidingAnswers] = useState<Record<string, string>>({});
  const [newKeyword, setNewKeyword] = useState('');

  // Generate AI suggestions
  const handleGenerateAISuggestions = async () => {
    setIsEditing(true);
    try {
      // Build prompt based on parameters and guiding answers
      const prompt = `
You are an expert content editor. Edit the following content based on these requirements:

**Original Content:**
${content}

**Edit Requirements:**
- Length: ${parameters.length === 'custom' ? `${parameters.customWordCount} words` : parameters.length}
- Tone/Style: ${parameters.tone}
- Complexity Level: ${parameters.complexity}
- Target Audience: ${guidingAnswers.audience || parameters.targetAudience || 'general'}
- Main Goal: ${guidingAnswers.goal || 'improve overall quality'}
- Desired Tone: ${guidingAnswers.tone || parameters.tone}
- Call-to-Action Strength: ${parameters.ctaStrength}
${parameters.seoKeywords.length > 0 ? `- SEO Keywords to optimize for: ${parameters.seoKeywords.join(', ')}` : ''}
${parameters.improveFocus.length > 0 ? `- Focus on improving: ${parameters.improveFocus.join(', ')}` : ''}

**Instructions:**
1. Rewrite the content following the requirements above
2. Maintain the core message and key points
3. Adjust the length to be ${parameters.length}
4. Use a ${parameters.tone} tone throughout
5. Write for ${parameters.complexity} level readers
${parameters.ctaStrength !== 'none' ? `6. Include a ${parameters.ctaStrength} call-to-action` : ''}
${parameters.seoKeywords.length > 0 ? '7. Naturally incorporate the SEO keywords' : ''}

Return ONLY the edited content, no explanations.
`;

      console.log('🚀 Starting AI generation...', {
        promptLength: prompt.length,
        useRAG: parameters.useRAG,
        parameters,
      });

      const response = await fetch('http://localhost:3001/api/generate-stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: prompt,
          temperature: 0.7,
          useRAG: parameters.useRAG,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Response not OK:', response.status, errorText);
        throw new Error(`Failed to generate: ${response.status} ${errorText}`);
      }

      console.log('✅ Response OK, starting to read stream...');

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let aiContent = '';
      let buffer = '';

      if (!reader) {
        throw new Error('Response body is not readable');
      }

      try {
        let chunkCount = 0;
        while (true) {
          const { done, value } = await reader.read();
          if (done) {
            console.log(`📊 Stream ended. Total chunks: ${chunkCount}, Content length: ${aiContent.length}`);
            break;
          }

          chunkCount++;
          // Decode chunk and add to buffer
          const decoded = decoder.decode(value, { stream: true });
          buffer += decoded;
          
          // Process complete lines
          const lines = buffer.split('\n');
          // Keep last incomplete line in buffer
          buffer = lines.pop() || '';

          for (const line of lines) {
            if (line.trim() === '') continue;
            
            if (line.startsWith('data: ')) {
              const data = line.slice(6).trim();
              
              if (data === '[DONE]') {
                console.log('✅ Stream completed signal received');
                continue;
              }

              if (data === '') continue;

              try {
                const parsed = JSON.parse(data);
                
                // Handle content
                if (parsed.content && typeof parsed.content === 'string') {
                  const contentChunk = parsed.content;
                  if (contentChunk.length > 0) {
                    aiContent += contentChunk;
                    setAiSuggestions(aiContent);
                    console.log(`📝 Received content chunk: ${contentChunk.length} chars, Total: ${aiContent.length}`);
                  }
                }
                
                // Handle errors
                if (parsed.error) {
                  console.error('❌ Stream error received:', parsed.error);
                  throw new Error(parsed.error);
                }
              } catch (parseError) {
                // If JSON parse fails, might be plain text content
                if (data && !data.startsWith('{') && data !== '[DONE]') {
                  // Try treating as plain content
                  aiContent += data;
                  setAiSuggestions(aiContent);
                  console.log(`📝 Received plain content: ${data.length} chars`);
                } else {
                  console.warn('⚠️ Could not parse SSE data:', parseError, 'Data:', data.substring(0, 100));
                }
              }
            } else if (line.trim() && !line.startsWith('event:')) {
              // Handle lines that don't start with 'data:' - might be continuation
              console.warn('⚠️ Unexpected SSE line format:', line.substring(0, 50));
            }
          }
        }

        // Process any remaining buffer
        if (buffer.trim()) {
          if (buffer.startsWith('data: ')) {
            const data = buffer.slice(6).trim();
            if (data && data !== '[DONE]') {
              try {
                const parsed = JSON.parse(data);
                if (parsed.content) {
                  aiContent += parsed.content;
                  setAiSuggestions(aiContent);
                }
              } catch (e) {
                // Ignore parse errors for buffer
              }
            }
          }
        }

        // Final check - if no content was generated, show error
        if (!aiContent.trim()) {
          console.warn('⚠️ No content generated from stream');
          console.warn('Chunk count:', chunkCount);
          console.warn('Buffer remaining:', buffer);
          
          // Check if there was an error in the stream
          const errorMessage = `No content generated from AI. Possible causes:
1. API key issues - Check backend .env file
2. Model unavailable - Check LLM_MODEL setting
3. Network issues - Check internet connection
4. Prompt too long - Try shorter content
5. Rate limiting - Wait a moment and try again

Please check browser console and backend logs for details.`;
          
          throw new Error(errorMessage);
        }

        console.log('✅ Content generated successfully:', aiContent.length, 'characters');
        setShowPreview(true);
        showToast.success('✨ AI suggestions generated!');
      } catch (streamError) {
        console.error('❌ Stream reading error:', streamError);
        
        // Check if it's an error from the stream itself
        if (streamError instanceof Error && streamError.message.includes('No content')) {
          throw streamError;
        }
        
        throw new Error(`Stream error: ${streamError instanceof Error ? streamError.message : 'Unknown error'}`);
      } finally {
        try {
          reader.releaseLock();
        } catch (e) {
          // Ignore if already released
        }
      }
    } catch (error) {
      console.error('❌ Error generating AI suggestions:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to generate suggestions';
      showToast.error(errorMessage);
      
      // Show error in preview area
      setAiSuggestions(`Error: ${errorMessage}\n\nPlease try:\n1. Check your internet connection\n2. Try different parameters\n3. Reduce the content length\n4. Check backend logs`);
      setShowPreview(true);
    } finally {
      setIsEditing(false);
    }
  };

  // Apply AI suggestions
  const handleApplyAISuggestions = async () => {
    if (!aiSuggestions) return;
    
    setIsSaving(true);
    try {
      await onSave(aiSuggestions);
      showToast.success('✅ Draft updated successfully!');
      onClose();
    } catch (error) {
      console.error('Error saving:', error);
      showToast.error('Failed to save draft');
    } finally {
      setIsSaving(false);
    }
  };

  // Save manual edit
  const handleSaveManual = async () => {
    setIsSaving(true);
    try {
      await onSave(manualContent);
      showToast.success('✅ Draft saved!');
      onClose();
    } catch (error) {
      console.error('Error saving:', error);
      showToast.error('Failed to save');
    } finally {
      setIsSaving(false);
    }
  };

  const toggleFocus = (focus: string) => {
    setParameters((prev) => ({
      ...prev,
      improveFocus: prev.improveFocus.includes(focus)
        ? prev.improveFocus.filter((f) => f !== focus)
        : [...prev.improveFocus, focus],
    }));
  };

  const addKeyword = () => {
    if (newKeyword.trim()) {
      setParameters((prev) => ({
        ...prev,
        seoKeywords: [...prev.seoKeywords, newKeyword.trim()],
      }));
      setNewKeyword('');
    }
  };

  const removeKeyword = (keyword: string) => {
    setParameters((prev) => ({
      ...prev,
      seoKeywords: prev.seoKeywords.filter((k) => k !== keyword),
    }));
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
          className="bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900 rounded-3xl max-w-7xl w-full max-h-[90vh] overflow-hidden border border-purple-500/20 shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="relative bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-purple-500/10 border-b border-white/10 p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <motion.h2
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="text-3xl font-bold text-white mb-2 flex items-center gap-3"
                >
                  <Wand2 className="w-8 h-8 text-purple-400" />
                  AI-Powered Draft Editor
                </motion.h2>
                <p className="text-gray-400">Choose how you want to edit your content</p>
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
                    ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Edit3 className="w-4 h-4" />
                Manual Edit
              </button>
              <button
                onClick={() => setEditMode('ai-assisted')}
                className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${
                  editMode === 'ai-assisted'
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Brain className="w-4 h-4" />
                AI-Assisted Edit
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="overflow-y-auto max-h-[calc(90vh-250px)] p-6">
            <AnimatePresence mode="wait">
              {/* Manual Edit Mode */}
              {editMode === 'manual' && (
                <motion.div
                  key="manual"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="space-y-4"
                >
                  <div className="glass-card p-6 rounded-2xl">
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                      <Edit3 className="w-5 h-5 text-blue-400" />
                      Edit Content Manually
                    </h3>
                    <textarea
                      value={manualContent}
                      onChange={(e) => setManualContent(e.target.value)}
                      className="w-full h-96 bg-white/5 border border-white/10 rounded-xl p-4 text-gray-200 resize-none focus:outline-none focus:border-blue-500/50 transition-colors font-mono text-sm"
                      placeholder="Edit your content here..."
                    />
                    <div className="flex items-center justify-between mt-4 text-sm text-gray-400">
                      <span>{manualContent.split(/\s+/).filter(w => w).length} words</span>
                      <span>{manualContent.length} characters</span>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* AI-Assisted Edit Mode */}
              {editMode === 'ai-assisted' && (
                <motion.div
                  key="ai-assisted"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="grid grid-cols-1 lg:grid-cols-2 gap-6"
                >
                  {/* Left: Parameters */}
                  <div className="space-y-4">
                    {/* Guiding Questions */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="glass-card p-6 rounded-2xl"
                    >
                      <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                        <MessageSquare className="w-5 h-5 text-purple-400" />
                        Guiding Questions
                      </h3>
                      <div className="space-y-4">
                        {GUIDING_QUESTIONS.map((q, index) => {
                          const Icon = q.icon;
                          return (
                            <motion.div
                              key={q.id}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: index * 0.1 }}
                              className="space-y-2"
                            >
                              <label className="text-sm text-gray-300 flex items-center gap-2">
                                <Icon className="w-4 h-4" />
                                {q.question}
                              </label>
                              <input
                                type="text"
                                value={guidingAnswers[q.id] || ''}
                                onChange={(e) =>
                                  setGuidingAnswers((prev) => ({ ...prev, [q.id]: e.target.value }))
                                }
                                placeholder="Your answer..."
                                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-purple-500/50"
                              />
                              <div className="flex flex-wrap gap-2">
                                {q.suggestions.map((suggestion) => (
                                  <button
                                    key={suggestion}
                                    onClick={() =>
                                      setGuidingAnswers((prev) => ({ ...prev, [q.id]: suggestion }))
                                    }
                                    className="px-2 py-1 bg-purple-500/10 text-purple-300 rounded text-xs hover:bg-purple-500/20 transition-colors"
                                  >
                                    {suggestion}
                                  </button>
                                ))}
                              </div>
                            </motion.div>
                          );
                        })}
                      </div>
                    </motion.div>

                    {/* Edit Parameters */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 }}
                      className="glass-card p-6 rounded-2xl"
                    >
                      <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                        <Sliders className="w-5 h-5 text-pink-400" />
                        Edit Parameters
                      </h3>
                      
                      <div className="space-y-4">
                        {/* Length */}
                        <div>
                          <label className="text-sm text-gray-300 mb-2 block">Length</label>
                          <div className="grid grid-cols-4 gap-2">
                            {(['shorter', 'same', 'longer', 'custom'] as LengthOption[]).map((option) => (
                              <button
                                key={option}
                                onClick={() => setParameters((prev) => ({ ...prev, length: option }))}
                                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                                  parameters.length === option
                                    ? 'bg-purple-500 text-white'
                                    : 'bg-white/5 text-gray-300 hover:bg-white/10'
                                }`}
                              >
                                {option.charAt(0).toUpperCase() + option.slice(1)}
                              </button>
                            ))}
                          </div>
                          {parameters.length === 'custom' && (
                            <input
                              type="number"
                              placeholder="Target word count"
                              value={parameters.customWordCount || ''}
                              onChange={(e) =>
                                setParameters((prev) => ({
                                  ...prev,
                                  customWordCount: parseInt(e.target.value) || undefined,
                                }))
                              }
                              className="w-full mt-2 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm"
                            />
                          )}
                        </div>

                        {/* Tone */}
                        <div>
                          <label className="text-sm text-gray-300 mb-2 block">Tone/Style</label>
                          <div className="grid grid-cols-3 gap-2">
                            {(['professional', 'casual', 'friendly', 'formal', 'persuasive', 'academic'] as ToneOption[]).map(
                              (tone) => (
                                <button
                                  key={tone}
                                  onClick={() => setParameters((prev) => ({ ...prev, tone }))}
                                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                                    parameters.tone === tone
                                      ? 'bg-pink-500 text-white'
                                      : 'bg-white/5 text-gray-300 hover:bg-white/10'
                                  }`}
                                >
                                  {tone.charAt(0).toUpperCase() + tone.slice(1)}
                                </button>
                              )
                            )}
                          </div>
                        </div>

                        {/* Complexity */}
                        <div>
                          <label className="text-sm text-gray-300 mb-2 block">Complexity Level</label>
                          <div className="grid grid-cols-3 gap-2">
                            {(['beginner', 'intermediate', 'expert'] as ComplexityOption[]).map((level) => (
                              <button
                                key={level}
                                onClick={() => setParameters((prev) => ({ ...prev, complexity: level }))}
                                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                                  parameters.complexity === level
                                    ? 'bg-blue-500 text-white'
                                    : 'bg-white/5 text-gray-300 hover:bg-white/10'
                                }`}
                              >
                                {level.charAt(0).toUpperCase() + level.slice(1)}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* CTA Strength */}
                        <div>
                          <label className="text-sm text-gray-300 mb-2 block">Call-to-Action Strength</label>
                          <div className="grid grid-cols-4 gap-2">
                            {(['none', 'subtle', 'medium', 'strong'] as CTAStrength[]).map((strength) => (
                              <button
                                key={strength}
                                onClick={() => setParameters((prev) => ({ ...prev, ctaStrength: strength }))}
                                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                                  parameters.ctaStrength === strength
                                    ? 'bg-emerald-500 text-white'
                                    : 'bg-white/5 text-gray-300 hover:bg-white/10'
                                }`}
                              >
                                {strength.charAt(0).toUpperCase() + strength.slice(1)}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* SEO Keywords */}
                        <div>
                          <label className="text-sm text-gray-300 mb-2 block">SEO Keywords</label>
                          <div className="flex gap-2 mb-2">
                            <input
                              type="text"
                              value={newKeyword}
                              onChange={(e) => setNewKeyword(e.target.value)}
                              onKeyPress={(e) => e.key === 'Enter' && addKeyword()}
                              placeholder="Add keyword..."
                              className="flex-1 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm"
                            />
                            <button
                              onClick={addKeyword}
                              className="px-4 py-2 bg-purple-500 text-white rounded-lg text-sm font-medium hover:bg-purple-600 transition-colors"
                            >
                              Add
                            </button>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {parameters.seoKeywords.map((keyword) => (
                              <span
                                key={keyword}
                                className="px-3 py-1 bg-purple-500/20 text-purple-300 rounded-full text-xs flex items-center gap-2"
                              >
                                {keyword}
                                <button
                                  onClick={() => removeKeyword(keyword)}
                                  className="hover:text-white transition-colors"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* RAG Toggle */}
                        <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10">
                          <div className="flex items-center gap-3">
                            <BookOpen className="w-5 h-5 text-orange-400" />
                            <div>
                              <p className="text-white font-medium">Use Knowledge Base (RAG)</p>
                              <p className="text-xs text-gray-400">Enhance with your documents</p>
                            </div>
                          </div>
                          <button
                            onClick={() =>
                              setParameters((prev) => ({ ...prev, useRAG: !prev.useRAG }))
                            }
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                              parameters.useRAG ? 'bg-orange-500' : 'bg-gray-600'
                            }`}
                          >
                            <span
                              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                parameters.useRAG ? 'translate-x-6' : 'translate-x-1'
                              }`}
                            />
                          </button>
                        </div>

                        {/* Generate Button */}
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={handleGenerateAISuggestions}
                          disabled={isEditing}
                          className="w-full px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-medium transition-all shadow-lg hover:shadow-purple-500/50 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isEditing ? (
                            <>
                              <RefreshCw className="w-5 h-5 animate-spin" />
                              Generating AI Suggestions...
                            </>
                          ) : (
                            <>
                              <Zap className="w-5 h-5" />
                              Generate AI-Assisted Edit
                            </>
                          )}
                        </motion.button>
                      </div>
                    </motion.div>
                  </div>

                  {/* Right: Preview */}
                  <div className="space-y-4">
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                      className="glass-card p-6 rounded-2xl h-full"
                    >
                      <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                        <Eye className="w-5 h-5 text-mint-400" />
                        {showPreview ? 'AI-Generated Preview' : 'Original Content'}
                      </h3>
                      
                      {!showPreview ? (
                        <div className="text-gray-300 text-sm whitespace-pre-wrap max-h-[600px] overflow-y-auto">
                          {content}
                        </div>
                      ) : isEditing ? (
                        <div className="flex flex-col items-center justify-center h-64">
                          <RefreshCw className="w-12 h-12 text-purple-400 animate-spin mb-4" />
                          <p className="text-gray-400">Generating AI suggestions...</p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {/* Comparison Metrics */}
                          {aiSuggestions && !aiSuggestions.startsWith('Error:') && (
                            <ComparisonMetrics 
                              originalContent={content}
                              newContent={aiSuggestions}
                              parameters={parameters}
                            />
                          )}
                          
                          <div className={`text-sm whitespace-pre-wrap max-h-[500px] overflow-y-auto p-4 rounded-lg ${
                            aiSuggestions.startsWith('Error:') 
                              ? 'bg-red-500/10 text-red-300 border border-red-500/30' 
                              : 'text-gray-300 bg-white/5'
                          }`}>
                            {aiSuggestions || 'No preview available. Click "Generate AI-Assisted Edit" to create one.'}
                          </div>
                          <motion.button
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={handleApplyAISuggestions}
                            disabled={isSaving}
                            className="w-full px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl font-medium transition-all shadow-lg hover:shadow-emerald-500/50 flex items-center justify-center gap-2"
                          >
                            {isSaving ? (
                              <>
                                <RefreshCw className="w-5 h-5 animate-spin" />
                                Saving...
                              </>
                            ) : (
                              <>
                                <CheckCircle2 className="w-5 h-5" />
                                Apply AI Suggestions
                              </>
                            )}
                          </motion.button>
                        </div>
                      )}
                    </motion.div>
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
              
              {editMode === 'manual' && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleSaveManual}
                  disabled={isSaving}
                  className="px-6 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg font-medium transition-all shadow-lg hover:shadow-blue-500/50 flex items-center gap-2 disabled:opacity-50"
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
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

