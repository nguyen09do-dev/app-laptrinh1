'use client';

import { motion } from 'framer-motion';
import { Mail, BookOpen, Users } from 'lucide-react';
import { PlatformConfig } from '@/app/lib/platforms';
import { PlatformCard } from '../derivatives/PlatformCard';

type PlatformCategory = 'email' | 'blog' | 'social';

interface PlatformTabsProps {
  activeTab: PlatformCategory;
  onTabChange: (tab: PlatformCategory) => void;
  platforms: Record<PlatformCategory, PlatformConfig[]>;
  derivatives: any;
  connectedPlatforms: Record<string, boolean>;
  publishingPlatforms: Record<string, boolean>;
  publishResults: Record<string, { success: boolean; message?: string }>;
  onPublish: (platform: PlatformConfig) => void;
  onConfigure: (platform: PlatformConfig) => void;
}

const TAB_CONFIG = {
  email: {
    label: 'Email Marketing',
    icon: Mail,
    color: 'text-amber-400',
    bgColor: 'bg-amber-500/10',
  },
  blog: {
    label: 'Blogging',
    icon: BookOpen,
    color: 'text-blue-400',
    bgColor: 'bg-blue-500/10',
  },
  social: {
    label: 'Social Media',
    icon: Users,
    color: 'text-purple-400',
    bgColor: 'bg-purple-500/10',
  },
};

export function PlatformTabs({
  activeTab,
  onTabChange,
  platforms,
  derivatives,
  connectedPlatforms,
  publishingPlatforms,
  publishResults,
  onPublish,
  onConfigure,
}: PlatformTabsProps) {
  const activePlatforms = platforms[activeTab] || [];

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="border-b border-midnight-700">
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {(Object.keys(TAB_CONFIG) as PlatformCategory[]).map((tab) => {
            const config = TAB_CONFIG[tab];
            const Icon = config.icon;
            const isActive = activeTab === tab;
            const platformCount = platforms[tab]?.length || 0;

            return (
              <button
                key={tab}
                onClick={() => onTabChange(tab)}
                className={`relative flex items-center gap-2 px-6 py-3 rounded-t-lg font-medium transition-all whitespace-nowrap ${
                  isActive
                    ? `${config.bgColor} ${config.color}`
                    : 'text-midnight-400 hover:text-white hover:bg-midnight-800'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{config.label}</span>
                <span className={`px-2 py-0.5 text-xs rounded-full ${
                  isActive
                    ? 'bg-white/20 text-white'
                    : 'bg-midnight-700 text-midnight-400'
                }`}>
                  {platformCount}
                </span>

                {/* Active Indicator */}
                {isActive && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-purple-500 to-pink-500"
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Platform Cards */}
      <div className="space-y-4">
        {activePlatforms.length === 0 ? (
          <div className="text-center py-12 text-midnight-400">
            <p>No platforms configured for this category</p>
          </div>
        ) : (
          activePlatforms.map((platform) => {
            const content = derivatives?.[platform.derivativeKey];
            const isConnected = connectedPlatforms[platform.key] || false;

            return (
              <PlatformCard
                key={platform.key}
                platformKey={platform.key}
                platformName={platform.name}
                icon={platform.icon}
                color={platform.color}
                bgColor={platform.bgColor}
                content={content}
                isConnected={isConnected}
                isPublishing={publishingPlatforms[platform.key]}
                publishResult={publishResults[platform.key]}
                onPublish={() => onPublish(platform)}
                onConfigure={() => onConfigure(platform)}
              />
            );
          })
        )}
      </div>

      {/* Tab Info */}
      <div className={`p-4 rounded-lg border ${TAB_CONFIG[activeTab].bgColor} border-midnight-700`}>
        <p className="text-sm text-midnight-300">
          {activeTab === 'email' && '📧 Email campaigns and newsletters for your audience'}
          {activeTab === 'blog' && '📝 Blog posts and articles for your website'}
          {activeTab === 'social' && '📱 Social media posts across multiple platforms'}
        </p>
      </div>
    </div>
  );
}

