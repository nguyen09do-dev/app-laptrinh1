'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TwitterPreview } from './TwitterPreview';
import { LinkedInPreview } from './LinkedInPreview';
import { EmailPreview } from './EmailPreview';
import { BlogPreview } from './BlogPreview';
import { SEOPreview } from './SEOPreview';
import {
  Twitter,
  Linkedin,
  Mail,
  BookOpen,
  Search,
  Sparkles,
  AlertCircle,
} from 'lucide-react';

export interface ContentDerivatives {
  twitter_thread: string[];
  linkedin: string;
  email: string;
  blog_summary: string;
  seo_description: string;
}

interface DerivativeTabsProps {
  derivatives: ContentDerivatives | null;
  onRegenerate?: (type: keyof ContentDerivatives) => void;
  isLoading?: boolean;
}

type TabKey = 'twitter' | 'linkedin' | 'email' | 'blog' | 'seo';

interface TabConfig {
  key: TabKey;
  label: string;
  icon: React.ElementType;
  color: string;
  bgColor: string;
  derivativeKey: keyof ContentDerivatives;
  getCharCount: (d: ContentDerivatives) => number;
  limit: number;
}

const TABS: TabConfig[] = [
  {
    key: 'twitter',
    label: 'Twitter',
    icon: Twitter,
    color: 'text-[#1DA1F2]',
    bgColor: 'bg-[#1DA1F2]/10',
    derivativeKey: 'twitter_thread',
    getCharCount: (d) => d.twitter_thread?.reduce((sum, t) => sum + (t?.length || 0), 0) || 0,
    limit: 2800, // 10 tweets * 280
  },
  {
    key: 'linkedin',
    label: 'LinkedIn',
    icon: Linkedin,
    color: 'text-[#0A66C2]',
    bgColor: 'bg-[#0A66C2]/10',
    derivativeKey: 'linkedin',
    getCharCount: (d) => d.linkedin?.length || 0,
    limit: 3000,
  },
  {
    key: 'email',
    label: 'Email',
    icon: Mail,
    color: 'text-emerald-400',
    bgColor: 'bg-emerald-500/10',
    derivativeKey: 'email',
    getCharCount: (d) => d.email?.length || 0,
    limit: 10000,
  },
  {
    key: 'blog',
    label: 'Blog',
    icon: BookOpen,
    color: 'text-purple-400',
    bgColor: 'bg-purple-500/10',
    derivativeKey: 'blog_summary',
    getCharCount: (d) => d.blog_summary?.length || 0,
    limit: 1500,
  },
  {
    key: 'seo',
    label: 'SEO',
    icon: Search,
    color: 'text-amber-400',
    bgColor: 'bg-amber-500/10',
    derivativeKey: 'seo_description',
    getCharCount: (d) => d.seo_description?.length || 0,
    limit: 160,
  },
];

export function DerivativeTabs({
  derivatives,
  onRegenerate,
  isLoading = false,
}: DerivativeTabsProps) {
  const [activeTab, setActiveTab] = useState<TabKey>('twitter');

  const getCharBadge = (tab: TabConfig) => {
    if (!derivatives) return null;
    
    try {
      const count = tab.getCharCount(derivatives);
      const isOverLimit = count > tab.limit;
      
      return (
        <span
          className={`
            ml-1.5 px-1.5 py-0.5 text-[10px] font-medium rounded-full
            ${isOverLimit ? 'bg-red-500/20 text-red-400' : 'bg-emerald-500/20 text-emerald-400'}
          `}
        >
          {count > 1000 ? `${(count / 1000).toFixed(1)}k` : count}
        </span>
      );
    } catch {
      return null;
    }
  };

  const renderTabContent = () => {
    if (!derivatives) {
      return (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-20 h-20 rounded-full bg-midnight-800 flex items-center justify-center mb-4">
            <Sparkles className="w-10 h-10 text-midnight-500" />
          </div>
          <h3 className="text-xl font-semibold text-midnight-200 mb-2">
            No Derivatives Yet
          </h3>
          <p className="text-midnight-400 max-w-md">
            Generate derivatives from your draft content to see previews for Twitter, LinkedIn, Email, Blog, and SEO.
          </p>
        </div>
      );
    }

    return (
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.2 }}
        >
          {activeTab === 'twitter' && (
            <TwitterPreview tweets={derivatives.twitter_thread} />
          )}
          {activeTab === 'linkedin' && (
            <LinkedInPreview content={derivatives.linkedin} />
          )}
          {activeTab === 'email' && (
            <EmailPreview content={derivatives.email} />
          )}
          {activeTab === 'blog' && (
            <BlogPreview content={derivatives.blog_summary} />
          )}
          {activeTab === 'seo' && (
            <SEOPreview description={derivatives.seo_description} />
          )}
        </motion.div>
      </AnimatePresence>
    );
  };

  return (
    <div className="w-full">
      {/* Tabs Header */}
      <div className="flex items-center gap-1 p-1 bg-midnight-800/50 rounded-xl mb-6 overflow-x-auto">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`
                flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium text-sm
                transition-all duration-200 whitespace-nowrap
                ${isActive
                  ? `${tab.bgColor} ${tab.color}`
                  : 'text-midnight-400 hover:text-midnight-200 hover:bg-midnight-700/50'
                }
              `}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
              {derivatives && getCharBadge(tab)}
            </button>
          );
        })}
      </div>

      {/* Loading State */}
      {isLoading ? (
        <div className="space-y-4">
          <div className="animate-pulse">
            <div className="h-8 bg-midnight-700 rounded-lg w-1/3 mb-4" />
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-32 bg-midnight-700 rounded-xl" />
              ))}
            </div>
          </div>
        </div>
      ) : (
        renderTabContent()
      )}

      {/* Regenerate Button */}
      {derivatives && onRegenerate && (
        <div className="mt-6 flex justify-end">
          <button
            onClick={() => onRegenerate(TABS.find(t => t.key === activeTab)!.derivativeKey)}
            className="flex items-center gap-2 px-4 py-2 bg-midnight-700 hover:bg-midnight-600 text-midnight-200 rounded-lg transition-colors"
          >
            <Sparkles className="w-4 h-4" />
            <span>Regenerate {TABS.find(t => t.key === activeTab)?.label}</span>
          </button>
        </div>
      )}
    </div>
  );
}

