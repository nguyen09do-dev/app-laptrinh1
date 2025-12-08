'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { FileText, Database, BookOpen, ArrowRight } from 'lucide-react';

type LibraryTab = 'published' | 'documents';

export default function LibraryPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tab = searchParams.get('tab') as LibraryTab | null;

  // Redirect based on tab parameter
  useEffect(() => {
    if (tab === 'documents') {
      router.push('/documents');
    } else if (tab === 'published') {
      router.push('/content');
    }
  }, [tab, router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-midnight-950 via-midnight-900 to-midnight-950 p-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12 text-center"
        >
          <h1 className="text-5xl font-bold text-white mb-4 flex items-center justify-center gap-4">
            <BookOpen className="w-12 h-12 text-mint-400" />
            Content Library
          </h1>
          <p className="text-midnight-300 text-lg">
            Browse published content and manage your knowledge base
          </p>
        </motion.div>

        {/* Quick Access Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Published Content Card */}
          <motion.button
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            onClick={() => router.push('/content')}
            className="glass-card p-8 rounded-2xl border-2 border-transparent hover:border-mint-400/50 transition-all group text-left"
          >
            <div className="flex items-start justify-between mb-6">
              <div className="p-4 bg-mint-500/20 rounded-xl">
                <FileText className="w-8 h-8 text-mint-400" />
              </div>
              <ArrowRight className="w-6 h-6 text-midnight-400 group-hover:text-mint-400 group-hover:translate-x-1 transition-all" />
            </div>
            
            <h2 className="text-2xl font-bold text-white mb-3">
              Published Content
            </h2>
            <p className="text-midnight-300 mb-4">
              View and manage all your published articles, blog posts, and marketing content
            </p>
            
            <div className="flex flex-wrap gap-2">
              <span className="px-3 py-1 bg-mint-500/10 text-mint-400 rounded-full text-sm">
                Articles
              </span>
              <span className="px-3 py-1 bg-mint-500/10 text-mint-400 rounded-full text-sm">
                Blog Posts
              </span>
              <span className="px-3 py-1 bg-mint-500/10 text-mint-400 rounded-full text-sm">
                Marketing
              </span>
            </div>
          </motion.button>

          {/* Knowledge Base Card */}
          <motion.button
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            onClick={() => router.push('/documents')}
            className="glass-card p-8 rounded-2xl border-2 border-transparent hover:border-coral-400/50 transition-all group text-left"
          >
            <div className="flex items-start justify-between mb-6">
              <div className="p-4 bg-coral-500/20 rounded-xl">
                <Database className="w-8 h-8 text-coral-400" />
              </div>
              <ArrowRight className="w-6 h-6 text-midnight-400 group-hover:text-coral-400 group-hover:translate-x-1 transition-all" />
            </div>
            
            <h2 className="text-2xl font-bold text-white mb-3">
              Knowledge Base
            </h2>
            <p className="text-midnight-300 mb-4">
              Manage documents and resources used for RAG-enhanced content generation
            </p>
            
            <div className="flex flex-wrap gap-2">
              <span className="px-3 py-1 bg-coral-500/10 text-coral-400 rounded-full text-sm">
                Documents
              </span>
              <span className="px-3 py-1 bg-coral-500/10 text-coral-400 rounded-full text-sm">
                RAG Sources
              </span>
              <span className="px-3 py-1 bg-coral-500/10 text-coral-400 rounded-full text-sm">
                Citations
              </span>
            </div>
          </motion.button>
        </div>

        {/* Info Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-12 glass-card p-6 rounded-xl"
        >
          <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-mint-400" />
            Library Overview
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-midnight-300">
            <div>
              <p className="mb-2">
                <span className="text-white font-medium">Published Content:</span> Access all finalized content pieces from your Content Studio
              </p>
            </div>
            <div>
              <p className="mb-2">
                <span className="text-white font-medium">Knowledge Base:</span> Upload and manage source documents for AI-powered content generation
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
