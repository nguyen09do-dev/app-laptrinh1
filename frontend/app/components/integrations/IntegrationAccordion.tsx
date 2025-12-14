'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, CheckCircle2, AlertCircle, Settings } from 'lucide-react';

interface IntegrationAccordionProps {
  platform: string;
  icon: React.ReactNode;
  description: string;
  isConnected: boolean;
  children: React.ReactNode;
  defaultExpanded?: boolean;
  onStatusChange?: () => void;
}

export function IntegrationAccordion({
  platform,
  icon,
  description,
  isConnected,
  children,
  defaultExpanded = false,
  onStatusChange,
}: IntegrationAccordionProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded || !isConnected);

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-xl border transition-all ${
        isConnected
          ? 'border-emerald-500/20 bg-gradient-to-br from-emerald-500/5 to-green-500/5'
          : 'border-amber-500/20 bg-gradient-to-br from-amber-500/5 to-orange-500/5'
      }`}
    >
      {/* Header */}
      <div className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className={`rounded-lg p-2 ${
                isConnected
                  ? 'bg-gradient-to-br from-emerald-500 to-green-500'
                  : 'bg-gradient-to-br from-amber-500 to-orange-500'
              }`}
            >
              {icon}
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">{platform}</h3>
              <p className="text-sm text-gray-400">{description}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {/* Status Badge */}
            {isConnected ? (
              <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/20 text-emerald-400 rounded-lg text-sm font-medium">
                <CheckCircle2 className="w-4 h-4" />
                Connected
              </div>
            ) : (
              <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-500/20 text-amber-400 rounded-lg text-sm font-medium">
                <AlertCircle className="w-4 h-4" />
                Not Connected
              </div>
            )}

            {/* Expand/Collapse Button */}
            <button
              onClick={toggleExpanded}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              aria-label={isExpanded ? 'Collapse' : 'Expand'}
            >
              <motion.div
                animate={{ rotate: isExpanded ? 180 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <ChevronDown className="w-5 h-5 text-gray-400" />
              </motion.div>
            </button>
          </div>
        </div>

        {/* Quick Status Info (when collapsed) */}
        {!isExpanded && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="mt-4 flex items-center justify-between rounded-lg bg-gray-900/50 p-3"
          >
            <span className="text-sm text-gray-400">
              {isConnected ? 'Click to edit configuration' : 'Click to configure'}
            </span>
            <Settings className="h-4 w-4 text-gray-400" />
          </motion.div>
        )}
      </div>

      {/* Expandable Content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="border-t border-white/10 p-6">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

