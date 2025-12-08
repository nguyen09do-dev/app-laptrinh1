'use client';

import { useState, useRef } from 'react';
import { X, Upload, FileText, Loader2, CheckCircle2, Calendar } from 'lucide-react';
import { showToast } from '@/lib/toast';

interface DocumentUploadDialogProps {
  onClose: () => void;
  onSuccess: () => void;
}

export default function DocumentUploadDialog({ onClose, onSuccess }: DocumentUploadDialogProps) {
  const [uploadMode, setUploadMode] = useState<'file' | 'text'>('file');
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Form fields
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [author, setAuthor] = useState('');
  const [publishedDate, setPublishedDate] = useState('');
  const [url, setUrl] = useState('');
  const [tags, setTags] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      handleFileSelect(droppedFile);
    }
  };

  const handleFileSelect = (selectedFile: File) => {
    // Validate file type
    const allowedTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain', 'text/html'];
    if (!allowedTypes.includes(selectedFile.type) && !selectedFile.name.endsWith('.docx')) {
      showToast.error('Unsupported file type. Please upload PDF, DOCX, TXT, or HTML files.');
      return;
    }

    // Validate file size (10MB)
    if (selectedFile.size > 10 * 1024 * 1024) {
      showToast.error('File size must be less than 10MB');
      return;
    }

    setFile(selectedFile);
    if (!title) {
      setTitle(selectedFile.name.replace(/\.[^/.]+$/, '')); // Remove extension
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (uploadMode === 'file' && !file) {
      showToast.error('Please select a file to upload');
      return;
    }

    if (uploadMode === 'text' && !content.trim()) {
      showToast.error('Please enter content');
      return;
    }

    if (!title.trim()) {
      showToast.error('Please enter a title');
      return;
    }

    setIsUploading(true);
    setUploadProgress(10);

    try {
      if (uploadMode === 'file' && file) {
        // File upload
        const formData = new FormData();
        formData.append('file', file);
        if (title) formData.append('title', title);
        if (author) formData.append('author', author);
        if (publishedDate) formData.append('published_date', publishedDate);
        if (url) formData.append('url', url);
        if (tags) {
          const tagsArray = tags.split(',').map(t => t.trim()).filter(Boolean);
          formData.append('tags', JSON.stringify(tagsArray));
        }

        setUploadProgress(20);
        console.log('📤 Starting file upload...');

        // Create AbortController for timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => {
          console.error('⏱️ Upload timeout');
          controller.abort();
        }, 120000); // 2 minutes timeout

        let response: Response;
        try {
          console.log('📡 Sending request to server...');
          setUploadProgress(30);
          
          response = await fetch('http://localhost:3001/api/rag/ingest/file', {
            method: 'POST',
            body: formData,
            signal: controller.signal,
          });

          clearTimeout(timeoutId);
          console.log('✅ Response received:', response.status);
        } catch (fetchError: any) {
          clearTimeout(timeoutId);
          console.error('❌ Fetch error:', fetchError);
          if (fetchError.name === 'AbortError') {
            throw new Error('Upload timeout. The file might be too large or the server is taking too long to process.');
          }
          throw fetchError;
        }

        setUploadProgress(60);
        console.log('📥 Processing response...');

        setUploadProgress(70);
        
        if (!response.ok) {
          const error = await response.json().catch(() => ({ error: 'Unknown error' }));
          console.error('❌ Server error:', error);
          throw new Error(error.error || error.message || 'Failed to upload file');
        }

        setUploadProgress(80);
        const result = await response.json().catch((err) => {
          console.error('❌ JSON parse error:', err);
          throw new Error('Invalid response from server');
        });
        
        console.log('✅ Upload successful:', result);
        setUploadProgress(100);

        showToast.success(`Document uploaded! ${result.data?.chunks_created || 0} chunks created.`);
        onSuccess();
      } else {
        // Text upload
        setUploadProgress(30);

        const response = await fetch('http://localhost:3001/api/rag/ingest', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title,
            content,
            author: author || undefined,
            published_date: publishedDate || undefined,
            url: url || undefined,
            tags: tags ? tags.split(',').map(t => t.trim()).filter(Boolean) : undefined,
          }),
        });

        setUploadProgress(70);

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'Failed to ingest content');
        }

        const result = await response.json();
        setUploadProgress(100);

        showToast.success(`Document ingested! ${result.data.chunks_created} chunks created.`);
        onSuccess();
      }
    } catch (error) {
      console.error('Upload error:', error);
      showToast.error(error instanceof Error ? error.message : 'Failed to upload document');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-midnight-900 border border-midnight-700 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-midnight-900 border-b border-midnight-700 p-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-display font-bold text-white mb-1">Upload Document</h2>
            <p className="text-midnight-400 text-sm">Add to your knowledge base for RAG</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-midnight-800 rounded-lg transition-colors"
            disabled={isUploading}
          >
            <X className="w-5 h-5 text-midnight-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          {/* Upload Mode Toggle */}
          <div className="flex gap-2 mb-6">
            <button
              type="button"
              onClick={() => setUploadMode('file')}
              className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all ${
                uploadMode === 'file'
                  ? 'bg-coral-500 text-white'
                  : 'bg-midnight-800/50 text-midnight-400 hover:bg-midnight-800'
              }`}
            >
              <Upload className="w-4 h-4 inline mr-2" />
              Upload File
            </button>
            <button
              type="button"
              onClick={() => setUploadMode('text')}
              className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all ${
                uploadMode === 'text'
                  ? 'bg-coral-500 text-white'
                  : 'bg-midnight-800/50 text-midnight-400 hover:bg-midnight-800'
              }`}
            >
              <FileText className="w-4 h-4 inline mr-2" />
              Paste Text
            </button>
          </div>

          {/* File Upload Zone */}
          {uploadMode === 'file' && (
            <div className="mb-6">
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
                  isDragging
                    ? 'border-coral-500 bg-coral-500/10'
                    : file
                    ? 'border-mint-500 bg-mint-500/10'
                    : 'border-midnight-700 hover:border-midnight-600 bg-midnight-800/30'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  accept=".pdf,.docx,.txt,.html"
                  onChange={(e) => {
                    const selectedFile = e.target.files?.[0];
                    if (selectedFile) handleFileSelect(selectedFile);
                  }}
                  disabled={isUploading}
                />

                {file ? (
                  <div className="flex flex-col items-center gap-3">
                    <CheckCircle2 className="w-12 h-12 text-mint-400" />
                    <div>
                      <p className="text-white font-medium">{file.name}</p>
                      <p className="text-midnight-400 text-sm">{(file.size / 1024).toFixed(1)} KB</p>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setFile(null);
                      }}
                      className="text-coral-400 text-sm hover:underline"
                      disabled={isUploading}
                    >
                      Remove file
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-3">
                    <Upload className="w-12 h-12 text-midnight-500" />
                    <div>
                      <p className="text-white font-medium mb-1">Drop file here or click to upload</p>
                      <p className="text-midnight-400 text-sm">Supports PDF, DOCX, TXT, HTML (max 10MB)</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Text Content */}
          {uploadMode === 'text' && (
            <div className="mb-6">
              <label className="block text-midnight-300 mb-2 font-medium">
                Content <span className="text-coral-400">*</span>
              </label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Paste or type your document content here..."
                className="w-full h-40 px-4 py-3 bg-midnight-800/50 border border-midnight-700 rounded-lg text-white placeholder-midnight-500 focus:outline-none focus:border-coral-500 transition-colors resize-none"
                required={uploadMode === 'text'}
                disabled={isUploading}
              />
            </div>
          )}

          {/* Metadata Fields */}
          <div className="space-y-4 mb-6">
            <div>
              <label className="block text-midnight-300 mb-2 font-medium">
                Title <span className="text-coral-400">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Document title"
                className="w-full px-4 py-3 bg-midnight-800/50 border border-midnight-700 rounded-lg text-white placeholder-midnight-500 focus:outline-none focus:border-coral-500 transition-colors"
                required
                disabled={isUploading}
              />
            </div>

            <div>
              <label className="block text-midnight-300 mb-2 font-medium">Author</label>
              <input
                type="text"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                placeholder="Author name"
                className="w-full px-4 py-3 bg-midnight-800/50 border border-midnight-700 rounded-lg text-white placeholder-midnight-500 focus:outline-none focus:border-coral-500 transition-colors"
                disabled={isUploading}
              />
            </div>

            <div>
              <label className="block text-midnight-300 mb-2 font-medium">
                <Calendar className="w-4 h-4 inline mr-1" />
                Published Date
              </label>
              <input
                type="date"
                value={publishedDate}
                onChange={(e) => setPublishedDate(e.target.value)}
                className="w-full px-4 py-3 bg-midnight-800/50 border border-midnight-700 rounded-lg text-white focus:outline-none focus:border-coral-500 transition-colors"
                disabled={isUploading}
              />
            </div>

            <div>
              <label className="block text-midnight-300 mb-2 font-medium">URL</label>
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://example.com/document"
                className="w-full px-4 py-3 bg-midnight-800/50 border border-midnight-700 rounded-lg text-white placeholder-midnight-500 focus:outline-none focus:border-coral-500 transition-colors"
                disabled={isUploading}
              />
            </div>

            <div>
              <label className="block text-midnight-300 mb-2 font-medium">
                Tags <span className="text-midnight-500 text-sm">(comma-separated)</span>
              </label>
              <input
                type="text"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="AI, research, marketing"
                className="w-full px-4 py-3 bg-midnight-800/50 border border-midnight-700 rounded-lg text-white placeholder-midnight-500 focus:outline-none focus:border-coral-500 transition-colors"
                disabled={isUploading}
              />
            </div>
          </div>

          {/* Progress Bar */}
          {isUploading && (
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-midnight-300 text-sm">Processing document...</span>
                <span className="text-coral-400 text-sm font-medium">{uploadProgress}%</span>
              </div>
              <div className="w-full h-2 bg-midnight-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-coral-500 to-coral-600 transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 bg-midnight-800/50 border border-midnight-700 text-midnight-300 rounded-lg hover:bg-midnight-800 hover:text-white transition-all font-medium"
              disabled={isUploading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-6 py-3 bg-gradient-to-r from-coral-500 to-coral-600 text-white rounded-lg hover:shadow-lg hover:shadow-coral-500/50 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              disabled={isUploading}
            >
              {isUploading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Upload className="w-5 h-5" />
                  Upload
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
