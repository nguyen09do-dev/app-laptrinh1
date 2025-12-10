'use client';

import { motion } from 'framer-motion';

export function DerivativesLoading() {
  return (
    <div className="space-y-6">
      {/* Tabs Skeleton */}
      <div className="flex items-center gap-2 p-1 bg-midnight-800/50 rounded-xl">
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className="h-10 w-24 bg-midnight-700 rounded-lg animate-pulse"
          />
        ))}
      </div>

      {/* Content Skeleton */}
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="h-7 w-40 bg-midnight-700 rounded-lg animate-pulse" />
          <div className="h-8 w-20 bg-midnight-700 rounded-lg animate-pulse" />
        </div>

        {/* Cards */}
        {[1, 2, 3].map((i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: i * 0.1 }}
            className="bg-midnight-800 rounded-xl border border-midnight-700 overflow-hidden"
          >
            {/* Card Header */}
            <div className="p-4 flex items-start gap-3">
              <div className="w-12 h-12 rounded-full bg-midnight-700 animate-pulse" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-32 bg-midnight-700 rounded animate-pulse" />
                <div className="h-3 w-24 bg-midnight-700 rounded animate-pulse" />
              </div>
            </div>

            {/* Card Content */}
            <div className="px-4 pb-4 space-y-2">
              <div className="h-4 bg-midnight-700 rounded animate-pulse" />
              <div className="h-4 bg-midnight-700 rounded animate-pulse w-5/6" />
              <div className="h-4 bg-midnight-700 rounded animate-pulse w-4/6" />
            </div>

            {/* Card Footer */}
            <div className="px-4 py-3 border-t border-midnight-700 flex items-center justify-between">
              <div className="flex items-center gap-4">
                {[1, 2, 3, 4].map((j) => (
                  <div key={j} className="h-6 w-12 bg-midnight-700 rounded animate-pulse" />
                ))}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Shimmer Effect */}
      <style jsx>{`
        @keyframes shimmer {
          0% {
            background-position: -200% 0;
          }
          100% {
            background-position: 200% 0;
          }
        }
        .animate-pulse {
          background: linear-gradient(
            90deg,
            rgba(255, 255, 255, 0.03) 25%,
            rgba(255, 255, 255, 0.08) 50%,
            rgba(255, 255, 255, 0.03) 75%
          );
          background-size: 200% 100%;
          animation: shimmer 1.5s infinite;
        }
      `}</style>
    </div>
  );
}


