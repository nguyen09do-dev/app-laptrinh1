'use client';

import { motion } from 'framer-motion';
import { Sparkles, Twitter, Linkedin, Mail, BookOpen, Search } from 'lucide-react';

interface DerivativesEmptyStateProps {
  onGenerate?: () => void;
  isGenerating?: boolean;
}

export function DerivativesEmptyState({
  onGenerate,
  isGenerating = false,
}: DerivativesEmptyStateProps) {
  const platforms = [
    { icon: Twitter, color: '#1DA1F2', label: 'Twitter' },
    { icon: Linkedin, color: '#0A66C2', label: 'LinkedIn' },
    { icon: Mail, color: '#10B981', label: 'Email' },
    { icon: BookOpen, color: '#A855F7', label: 'Blog' },
    { icon: Search, color: '#F59E0B', label: 'SEO' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-16 px-4"
    >
      {/* Animated Icons */}
      <div className="relative w-48 h-32 mb-8">
        {platforms.map((platform, index) => {
          const Icon = platform.icon;
          const angle = (index - 2) * 30; // Spread icons in an arc
          const radius = 60;
          const x = Math.sin((angle * Math.PI) / 180) * radius;
          const y = -Math.cos((angle * Math.PI) / 180) * radius * 0.5;
          
          return (
            <motion.div
              key={platform.label}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ 
                opacity: 1, 
                scale: 1,
                y: [y, y - 5, y],
              }}
              transition={{ 
                delay: index * 0.1,
                y: {
                  duration: 2,
                  repeat: Infinity,
                  repeatType: 'reverse',
                  delay: index * 0.2,
                }
              }}
              className="absolute top-1/2 left-1/2"
              style={{
                transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`,
              }}
            >
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: `${platform.color}20` }}
              >
                <Icon className="w-6 h-6" style={{ color: platform.color }} />
              </div>
            </motion.div>
          );
        })}
        
        {/* Center Sparkle */}
        <motion.div
          animate={{ 
            rotate: [0, 360],
            scale: [1, 1.1, 1],
          }}
          transition={{ 
            rotate: { duration: 20, repeat: Infinity, ease: 'linear' },
            scale: { duration: 2, repeat: Infinity, repeatType: 'reverse' },
          }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
        >
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center">
            <Sparkles className="w-8 h-8 text-purple-400" />
          </div>
        </motion.div>
      </div>

      {/* Text Content */}
      <h3 className="text-2xl font-bold text-white mb-3 text-center">
        Generate Multi-platform Content
      </h3>
      <p className="text-midnight-400 max-w-md text-center mb-8 leading-relaxed">
        Transform your draft into optimized content for Twitter, LinkedIn, Email, Blog summaries, and SEO descriptions - all with one click!
      </p>

      {/* Features List */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-8">
        {platforms.map((platform) => {
          const Icon = platform.icon;
          return (
            <div
              key={platform.label}
              className="flex flex-col items-center gap-2 px-4 py-3 rounded-xl bg-midnight-800/50 border border-midnight-700"
            >
              <Icon className="w-5 h-5" style={{ color: platform.color }} />
              <span className="text-sm text-midnight-300">{platform.label}</span>
            </div>
          );
        })}
      </div>

      {/* CTA Button */}
      {onGenerate && (
        <motion.button
          onClick={onGenerate}
          disabled={isGenerating}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className={`
            flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-white
            transition-all duration-200
            ${isGenerating
              ? 'bg-midnight-700 cursor-not-allowed'
              : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 shadow-lg shadow-purple-500/25'
            }
          `}
        >
          {isGenerating ? (
            <>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              >
                <Sparkles className="w-5 h-5" />
              </motion.div>
              <span>Generating...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5" />
              <span>Generate Derivatives</span>
            </>
          )}
        </motion.button>
      )}
    </motion.div>
  );
}


